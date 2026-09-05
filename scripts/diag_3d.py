#!/usr/bin/env python3
"""3D 캡처 진단 — 컴포저 vs 직접 렌더, 패스별 끄기, 픽셀 RGBA 샘플, 라벨 캔버스 덤프."""
import asyncio, base64, json, sys
from pathlib import Path
from playwright.async_api import async_playwright
from PIL import Image

OUT = Path(sys.argv[1] if len(sys.argv) > 1 else '/tmp/verify')
URL = sys.argv[2] if len(sys.argv) > 2 else 'http://127.0.0.1:8870/?q=low'
LAUNCH_ARGS = ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox"]

JS_INFO = r"""async () => {
  const R = window.__sigong, E = R.engine, gl = E.renderer.getContext();
  const attrs = gl.getContextAttributes();
  const sea = R.world.group.children.find(o => o.name === 'sea');
  const cc = E.renderer.getClearColor(sea.material.color.clone());
  const fonts = [...document.fonts].map(f => f.family + '|' + f.weight + '|' + f.status);
  const m = sea.material;
  return {
    attrs: { alpha: attrs.alpha, premultipliedAlpha: attrs.premultipliedAlpha, preserveDrawingBuffer: attrs.preserveDrawingBuffer, antialias: attrs.antialias },
    clear: { color: cc.getHexString(), alpha: E.renderer.getClearAlpha() },
    passes: E.composer.passes.map(p => [p.constructor.name, p.enabled, !!p.renderToScreen, !!p.clear]),
    background: E.scene.background ? E.scene.background.constructor.name : null,
    environment: E.scene.environment ? E.scene.environment.constructor.name : null,
    sea: { type: m.type, color: m.color.getHexString(), transparent: m.transparent, opacity: m.opacity, transmission: m.transmission, blending: m.blending,
           depthWrite: m.depthWrite, side: m.side, emissive: m.emissive ? m.emissive.getHexString() : null, emissiveIntensity: m.emissiveIntensity,
           roughness: m.roughness, metalness: m.metalness, envMapIntensity: m.envMapIntensity, hasEnvMap: !!m.envMap, hasNormalMap: !!m.normalMap, visible: sea.visible, pos: sea.position.toArray() },
    cv: [E.renderer.domElement.width, E.renderer.domElement.height, E.pixelRatio],
    fontCheck: document.fonts.check('500 40px "Noto Sans KR"'), fonts,
    tone: [E.renderer.toneMapping, E.renderer.toneMappingExposure, E.renderer.outputColorSpace],
  };
}"""

JS_POINTS = r"""async () => {
  const R = window.__sigong, E = R.engine;
  const K = await import('./app/korea.js');
  const cv = E.renderer.domElement;
  const V = E.camera.position.constructor;
  const proj = (x, y, z) => { const v = new V(x, y, z); v.project(E.camera); return [Math.round((v.x + 1) / 2 * cv.width), Math.round((1 - v.y) / 2 * cv.height)]; };
  const at = (lon, lat, y) => { const [x, z] = K.toWorld(lon, lat); return proj(x, y, z); };
  const lab = (id) => { const g = R.world.marks.children.find(o => o.name === 'place:' + id + ':0'); const L = g && g.userData.label; if (!L) return null; const v = L.getWorldPosition(new V()); return proj(v.x, v.y, v.z); };
  return { bgTL: [8, 8], bgTR: [cv.width - 8, 8], seaEast: at(130.8, 37.8, 2.2), seaWest: at(124.6, 36.4, 2.2), seaSouth: at(128.0, 33.6, 2.2),
           landSeoul: at(127.3, 37.2, 7), landNorth: at(127.0, 40.0, 7), labelPy: lab('place-pyongyang'), labelSilla: lab('place-silla-capital'), labelGw: lab('place-gwanggaeto-stele') };
}"""

JS_CAP_COMPOSER = "() => { const E = window.__sigong.engine; E.composer.render(); return E.renderer.domElement.toDataURL('image/png'); }"
JS_CAP_DIRECT = "() => { const E = window.__sigong.engine; E.renderer.setRenderTarget(null); E.renderer.clear(); E.renderer.render(E.scene, E.camera); return E.renderer.domElement.toDataURL('image/png'); }"
JS_CAP_NOPASS = """(name) => { const E = window.__sigong.engine; const p = E[name]; if (!p) return null; const was = p.enabled; p.enabled = false; E.composer.render(); const d = E.renderer.domElement.toDataURL('image/png'); p.enabled = was; return d; }"""
JS_LABEL = """(id) => { const R = window.__sigong; const g = R.world.marks.children.find(o => o.name === 'place:' + id + ':0'); const L = g && g.userData.label; return L ? L.material.map.image.toDataURL('image/png') : null; }"""


def save(data, path):
    if not data:
        return False
    path.write_bytes(base64.b64decode(data.split(',', 1)[1]))
    return True


def sample(path, pts):
    im = Image.open(path)
    info = {'mode': im.mode, 'size': im.size}
    im = im.convert('RGBA')
    px = im.load()
    for k, p in pts.items():
        if not p:
            info[k] = None
            continue
        x, y = int(p[0]), int(p[1])
        if 0 <= x < im.width and 0 <= y < im.height:
            info[k] = list(px[x, y])
        else:
            info[k] = 'offscreen ' + str(p)
    n = im.width * im.height
    hist_a = im.getchannel('A').histogram()
    info['alpha_lt255_frac'] = round(1 - hist_a[255] / n, 4)
    dark = 0
    small = im.resize((im.width // 4, im.height // 4))
    for r, g, b, a in small.getdata():
        if r + g + b < 15:
            dark += 1
    info['near_black_frac'] = round(dark / (small.width * small.height), 4)
    return info


async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    report = {'console': []}
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=LAUNCH_ARGS)
        pg = await browser.new_page(viewport={'width': 1280, 'height': 800})
        pg.on('pageerror', lambda e: report['console'].append('pageerror: ' + str(e)))
        pg.on('console', lambda m: report['console'].append(m.type + ': ' + m.text) if m.type in ('error', 'warning') and 'GPU stall' not in m.text else None)
        await pg.goto(URL, wait_until='load', timeout=90000)
        await pg.wait_for_selector('#enter', timeout=30000)
        await pg.click('#enter')
        await pg.wait_for_timeout(800)
        await pg.click('#b3d')
        for _ in range(45):
            if await pg.evaluate('!!(window.__sigong && window.__sigong.engine)'):
                break
            await pg.wait_for_timeout(1000)
        err = await pg.evaluate('window.__sigongErr || null')
        if err:
            print('ENGINE ERR', err)
        await pg.wait_for_timeout(2500)
        report['info'] = await pg.evaluate(JS_INFO)
        pts = await pg.evaluate(JS_POINTS)
        report['points'] = pts
        caps = {}
        d = await pg.evaluate(JS_CAP_COMPOSER)
        caps['07-composer'] = save(d, OUT / '07-composer.png')
        d = await pg.evaluate(JS_CAP_DIRECT)
        caps['08-direct'] = save(d, OUT / '08-direct.png')
        for name in ['ssao', 'bloom', 'film', 'smaa', 'outputPass']:
            d = await pg.evaluate(JS_CAP_NOPASS, name)
            caps['09-no-' + name] = save(d, OUT / ('09-no-' + name + '.png'))
        for pid in ['place-pyongyang', 'place-silla-capital', 'place-gwanggaeto-stele']:
            d = await pg.evaluate(JS_LABEL, pid)
            caps['10-label-' + pid] = save(d, OUT / ('10-label-' + pid + '.png'))
        report['captured'] = caps
        await browser.close()
    report['samples'] = {}
    for name, ok in caps.items():
        if ok and not name.startswith('10-'):
            report['samples'][name] = sample(OUT / (name + '.png'), pts)
    (OUT / 'diag.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(report, ensure_ascii=False, indent=1))


asyncio.run(main())
