#!/usr/bin/env python3
"""뷰어 시각 검증 하네스 — 서버 옆(c2)에서 헤드리스 크로미움으로 실제 렌더를 찍는다.

표준 배치: scripts/verify_viewer.py
실행:      .venv-build/bin/python scripts/verify_viewer.py [--url http://127.0.0.1:8870] [--out /tmp/verify]

왜 이게 필요한가
----------------
"HTTP 200 이 나왔다"는 화면이 뜬다는 뜻이 아니다. 앞서 투영이 깨져 지도가 한 줄로 눌린 채로
"된다"고 보고한 적이 있다. 이 스크립트는 페이지를 실제로 열고, 들어가고, 3D 로 전환하고,
씬 상태를 읽고, WebGL 프레임을 PNG 로 남긴다. 그 PNG 를 사람이(또는 모델이) 눈으로 본다.

산출 (out 디렉터리):
  01-gate.png      진입 화면
  02-map.png       2D 지도
  03-map-pick.png  지명 클릭 후 (근거 패널 열림)
  03b-entity.png   찾기로 인물을 골라 주장(Claim)이 열린 화면
  04-3d.png        3D 프레임 (composer 직접 렌더 → toDataURL)
  05-3d-pick.png   3D 에서 지명 클릭 후
  report.json      씬 통계 · 콘솔 에러 · 검사 결과

검사 (report.json 의 checks):
  gate_visible, map_land_drawn, map_pick_opens_evidence, entity_search_shows_claims, timeline_mounted,
  timeline_click_changes_year, three_loaded, three_draws, three_pick_opens_evidence, console_errors_zero
실패가 하나라도 있으면 exit 1.
"""
from __future__ import annotations

import argparse
import asyncio
import base64
import json
import sys
from pathlib import Path

from playwright.async_api import async_playwright

LAUNCH_ARGS = ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox"]


async def canvas_png(pg, selector: str) -> bytes:
    """WebGL 캔버스는 스크린샷 타이밍에 비어 있을 수 있다 — 한 프레임을 직접 그리고 바로 뽑는다."""
    # 캔버스 텍스처(라벨)는 첫 렌더에서 업로드된다 — 먼저 한 프레임 그려두고 잠시 뒤 캡처한다
    await pg.evaluate("(()=>{const R=window.__sigong; if(R&&R.engine){const E=R.engine; (E.composer?E.composer.render():E.renderer.render(E.scene,E.camera));}})()")
    await pg.wait_for_timeout(400)
    data = await pg.evaluate(
        """(sel) => {
          const R = window.__sigong;
          if (R && R.engine) {
            const E = R.engine;
            if (E.composer) E.composer.render(); else E.renderer.render(E.scene, E.camera);
            return E.renderer.domElement.toDataURL('image/png');
          }
          const c = document.querySelector(sel);
          return c ? c.toDataURL('image/png') : null;
        }""",
        selector,
    )
    if not data:
        return b""
    return base64.b64decode(data.split(",", 1)[1])


async def run(url: str, out: Path) -> int:
    out.mkdir(parents=True, exist_ok=True)
    report = {"url": url, "checks": {}, "console": [], "scene": {}}
    ok_all = True

    def check(name: str, passed: bool, evidence=""):
        nonlocal ok_all
        report["checks"][name] = {"passed": bool(passed), "evidence": evidence}
        ok_all = ok_all and bool(passed)
        print(f"  [{'OK' if passed else 'FAIL'}] {name}  {evidence}")

    async with async_playwright() as p:
        browser = await p.chromium.launch(args=LAUNCH_ARGS)
        pg = await browser.new_page(viewport={"width": 1280, "height": 800})
        pg.on("pageerror", lambda e: report["console"].append("pageerror: " + str(e)))
        pg.on(
            "console",
            lambda m: report["console"].append(f"{m.type}: {m.text}")
            if m.type in ("error", "warning") and "GPU stall" not in m.text
            else None,
        )

        # 1. 진입
        await pg.goto(url, wait_until="load", timeout=90000)
        await pg.wait_for_selector("#enter", timeout=30000)
        await pg.wait_for_timeout(800)
        await pg.screenshot(path=str(out / "01-gate.png"))
        gate_bg = await pg.evaluate(
            "getComputedStyle(document.querySelector('#gate .map')).backgroundImage"
        )
        check("gate_visible", "daedong" in gate_bg, gate_bg[:80])

        # 2. 지도
        await pg.click("#enter")
        await pg.wait_for_timeout(1500)
        stats = await pg.evaluate(
            """() => { const c=document.getElementById('map'); const x=c.getContext('2d');
               const d=x.getImageData(0,0,c.width,c.height).data; let lit=0;
               for(let i=0;i<d.length;i+=16){ if(d[i]+d[i+1]+d[i+2] > 60) lit++; }
               return {w:c.width,h:c.height,litSamples:lit,samples:Math.floor(d.length/16)}; }"""
        )
        report["scene"]["map"] = stats
        await pg.screenshot(path=str(out / "02-map.png"))
        check(
            "map_land_drawn",
            stats["litSamples"] > stats["samples"] * 0.02,
            f"lit {stats['litSamples']}/{stats['samples']}",
        )

        # 3. 지도에서 지명 클릭 → 근거 패널
        # 평양의 투영 좌표를 페이지 쪽 함수 없이 재계산하기 어렵다 — 캔버스 hit 목록을 쓴다.
        clicked = await pg.evaluate(
            """() => { const c=document.getElementById('map'); const r=c.getBoundingClientRect();
               // 화면 중앙 근처에서 가장 가까운 hit 를 찾아 클릭 이벤트를 쏜다
               const ev = new MouseEvent('mousemove',{clientX:r.left+r.width/2, clientY:r.top+r.height/2, bubbles:true});
               c.dispatchEvent(ev);
               return true; }"""
        )
        # hits 는 모듈 스코프라 접근 불가 → 알려진 지명(평양) 좌표를 API 로 받아 투영식을 그대로 쓴다
        pick = await pg.evaluate(
            """async () => {
               const p = await fetch('/api/places').then(r=>r.json());
               const py = p.places.find(x=>x.id==='place-pyongyang');
               const c=document.getElementById('map'); const r=c.getBoundingClientRect();
               const BOX={lon0:118,lon1:145,lat0:30,lat1:48};
               const merc=lat=>Math.log(Math.tan(Math.PI/4+lat*Math.PI/360)); const rad=lon=>lon*Math.PI/180;
               const MX0=rad(BOX.lon0),MX1=rad(BOX.lon1),MY0=merc(BOX.lat0),MY1=merc(BOX.lat1);
               const SX=MX1-MX0,SY=MY1-MY0; const w=c.clientWidth,h=c.clientHeight; const pad=26;
               const s=Math.min((w-pad*2)/SX,(h-pad*2-54)/SY); const ox=(w-SX*s)/2, oy=(h-SY*s)/2-18;
               const cand=py.candidates[0]; const x=ox+(rad(cand.lon)-MX0)*s, y=oy+(MY1-merc(cand.lat))*s;
               c.dispatchEvent(new MouseEvent('click',{clientX:r.left+x, clientY:r.top+y, bubbles:true}));
               await new Promise(r=>setTimeout(r,300));
               const h3=document.querySelector('#evi h3'); return {label:h3?h3.textContent:null, len:document.getElementById('evi').innerText.length};
            }"""
        )
        report["scene"]["mapPick"] = pick
        await pg.screenshot(path=str(out / "03-map-pick.png"))
        check("map_pick_opens_evidence", pick.get("label") == "평양", json.dumps(pick, ensure_ascii=False))

        # 3a. 찾기 — 인물을 검색해 고르면 주장(Claim)이 열린다
        ent = await pg.evaluate(
            """async () => { const q=document.getElementById('q'); if(!q) return {found:false, reason:'no #q'};
               q.value='광개토'; q.dispatchEvent(new Event('input',{bubbles:true}));
               await new Promise(r=>setTimeout(r,100));
               const bs=[...document.querySelectorAll('#qList button')];
               const hit=bs.find(b=>b.dataset.id==='person-gwanggaeto');
               if(!hit) return {found:false, n:bs.length, ids:bs.map(b=>b.dataset.id)};
               hit.click(); await new Promise(r=>setTimeout(r,1500));
               const h3=document.querySelector('#evi h3');
               return {found:true, label:h3&&h3.textContent, claims:document.querySelectorAll('#evi .claim').length}; }"""
        )
        report["scene"]["entitySearch"] = ent
        await pg.screenshot(path=str(out / "03b-entity.png"))
        check("entity_search_shows_claims", ent.get("found") and (ent.get("claims") or 0) > 0, json.dumps(ent, ensure_ascii=False))

        # 3b. 타임라인 — 사료 수만큼 트랙, 커서를 누르면 연도가 바뀐다
        tl = await pg.evaluate(
            """async () => { const tl=window.__timeline; if(!tl) return {mounted:false};
               const tracks=tl.svg.querySelectorAll('.tl-track').length;
               const srcs=(await fetch('/api/sources').then(r=>r.json())).sources.length;
               const before=document.getElementById('yearV').textContent;
               const plot=tl.svg.querySelector('.tl-plot'); const r=plot.getBoundingClientRect();
               const x=r.left+r.width*0.25, y=r.top+r.height/2;
               tl.svg.dispatchEvent(new PointerEvent('pointerdown',{clientX:x,clientY:y,bubbles:true,pointerId:1,button:0,isPrimary:true}));
               window.dispatchEvent(new PointerEvent('pointerup',{clientX:x,clientY:y,bubbles:true,pointerId:1}));
               await new Promise(r=>setTimeout(r,120));
               const after=document.getElementById('yearV').textContent;
               return {mounted:true, tracks, srcs, before, after}; }"""
        )
        report["scene"]["timeline"] = tl
        check("timeline_mounted", tl.get("mounted") and tl.get("tracks") == tl.get("srcs"), json.dumps(tl, ensure_ascii=False))
        check("timeline_click_changes_year", tl.get("mounted") and tl.get("after") != tl.get("before"), f"{tl.get('before')} -> {tl.get('after')}")

        # 4. 3D
        await pg.click("#b3d")
        loaded = False
        for _ in range(45):
            loaded = await pg.evaluate("!!(window.__sigong && window.__sigong.engine)")
            if loaded:
                break
            await pg.wait_for_timeout(1000)
        err = await pg.evaluate("window.__sigongErr || null")
        check("three_loaded", loaded and not err, err or "loaded")
        if loaded:
            await pg.wait_for_timeout(2500)
            info = await pg.evaluate(
                """() => { const R=window.__sigong, E=R.engine;
                  return { quality:E.quality, cam:E.camera.position.toArray().map(Math.round), zoom:+E.camera.zoom.toFixed(2),
                    rim:Math.round(R.world.maxRim), calls:E.renderer.info.render.calls, tris:E.renderer.info.render.triangles,
                    lights:E.scene.children.filter(o=>o.isLight).map(o=>[o.type,+o.intensity.toFixed(2)]),
                    env:!!E.scene.environment, picks:R.world.pickTargets.length,
                    label:(()=>{ const g=R.world.marks.children.find(o=>o.name==='place:place-pyongyang:0'); const L=g&&g.userData.label; const m=L&&L.material;
                      return m?{hasMap:!!m.map, img:m.map&&m.map.image?[m.map.image.width,m.map.image.height]:null, scale:L.scale.toArray()}:null; })(),
                    sea:(()=>{ const s=R.world.group.children.find(o=>o.name==='sea'); const m=s&&s.material;
                      return m?{color:m.color.getHexString(), transmission:m.transmission, roughness:m.roughness}:null; })() }; }"""
            )
            report["scene"]["three"] = info
            check("three_draws", info["calls"] > 10 and info["tris"] > 1000, f"calls {info['calls']} tris {info['tris']}")
            png = await canvas_png(pg, "#three canvas")
            (out / "04-3d.png").write_bytes(png)

            # 5. 3D 클릭 → 근거 패널
            pick3 = await pg.evaluate(
                """() => { const R=window.__sigong,E=R.engine;
                  const g=R.world.marks.children.find(o=>o.name==='place:place-silla-capital:0');
                  const head=g.userData.head; const v=head.getWorldPosition(new head.position.constructor()); v.project(E.camera);
                  const cv=E.renderer.domElement, r=cv.getBoundingClientRect();
                  const cx=r.left+(v.x+1)/2*r.width, cy=r.top+(1-v.y)/2*r.height;
                  const mk=(t)=>new PointerEvent(t,{clientX:cx,clientY:cy,bubbles:true,pointerId:1,button:0,pointerType:'mouse',isPrimary:true});
                  cv.dispatchEvent(mk('pointerdown')); cv.dispatchEvent(mk('pointerup'));
                  cv.dispatchEvent(new MouseEvent('click',{clientX:cx,clientY:cy,bubbles:true}));
                  return {screen:[Math.round(cx),Math.round(cy)]}; }"""
            )
            await pg.wait_for_timeout(500)
            sel = await pg.evaluate("(()=>{const h=document.querySelector('#evi h3');return h?h.textContent:null;})()")
            report["scene"]["threePick"] = {**pick3, "label": sel}
            check("three_pick_opens_evidence", sel == "신라 왕경", f"{sel} @ {pick3['screen']}")
            (out / "05-3d-pick.png").write_bytes(await canvas_png(pg, "#three canvas"))

        errs = [c for c in report["console"] if c.startswith(("pageerror", "error"))]
        check("console_errors_zero", len(errs) == 0, "; ".join(errs[:3]) if errs else "0")
        await browser.close()

    (out / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"report: {out / 'report.json'}   {'ALL PASS' if ok_all else 'FAILURES'}")
    return 0 if ok_all else 1


def main(argv):
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", default="http://127.0.0.1:8870/?q=low")
    ap.add_argument("--out", default="/tmp/verify")
    a = ap.parse_args(argv)
    return asyncio.run(run(a.url, Path(a.out)))


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
