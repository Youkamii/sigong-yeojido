#!/usr/bin/env python3
"""Exercise real 3D materialization, camera changes and selected labels (#37)."""
import argparse
import asyncio
import json
from pathlib import Path

from playwright.async_api import async_playwright
from verify_viewer import LAUNCH_ARGS, canvas_png


async def run(url, out):
    out.mkdir(parents=True, exist_ok=True)
    errors = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=LAUNCH_ARGS)
        page = await browser.new_page(viewport={'width': 1440, 'height': 1000})
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.on('console', lambda message: errors.append(message.text) if message.type == 'error' else None)
        await page.goto(url, wait_until='load', timeout=90000)
        await page.click('#enter')
        await page.wait_for_function('window.__timeline?.sources.length > 0')
        await page.click('#b3d')
        await page.wait_for_function('window.__sigong?.world', timeout=60000)
        await page.wait_for_function('!window.__sigong.world.materializing', timeout=30000)

        await page.evaluate('''() => {
          const {world:W}=window.__sigong;
          W.setYear(1100); W.setSourcesOn(new Set(W.places.flatMap(p=>Object.keys(p.mentions||{}))));
        }''')
        await page.wait_for_function('!window.__sigong.world.materializing')
        observations = []
        for camera in ('initial', 'rotate', 'zoom'):
            if camera != 'initial':
                await page.evaluate('''mode => {
                  const E=window.__sigong.engine;
                  if(mode==='rotate') { const x=E.camera.position.x; E.camera.position.x=E.camera.position.z; E.camera.position.z=-x; }
                  else E.camera.position.sub(E.controls.target).multiplyScalar(.65).add(E.controls.target);
                  E.controls.update();
                }''', camera)
            await page.wait_for_timeout(300)
            result = await page.evaluate('''() => {
              const W=window.__sigong.world;
              const shown=W._labels.filter(l=>l.visible);
              const boxes=shown.map(l=>l.userData.screenBox);
              let overlaps=0;
              for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){
                const a=boxes[i],b=boxes[j];
                if(a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top)overlaps++;
              }
              return {labels:shown.length,overlaps,ids:shown.map(l=>l.parent.userData.placeId)};
            }''')
            assert 0 < result['labels'] <= 24 and result['overlaps'] == 0, result
            observations.append({'camera': camera, **result})
            (out/f'{camera}.png').write_bytes(await canvas_png(page, '#three canvas'))

        selected = await page.evaluate('''() => {
          const {world:W,engine:E}=window.__sigong;
          const hidden=W._labels.find(l=>{
            if(l.visible)return false;
            const p=l.position.clone(); l.getWorldPosition(p).project(E.camera);
            return Math.abs(p.x)<.7 && Math.abs(p.y)<.7 && Math.abs(p.z)<1;
          });
          return hidden?.parent.userData.placeId;
        }''')
        assert selected, 'No crowded on-screen label to test selected priority'
        await page.evaluate('(id)=>window.__sigong.world.setSelected(id)', selected)
        await page.wait_for_function('id => window.__sigong.world.byPlace.get(id).some(o=>o.userData.label?.visible)', arg=selected)
        await page.evaluate('''() => {
          const W=window.__sigong.world;
          W.setSourcesOn(new Set());
          W.setSourcesOn(new Set(W.places.flatMap(p=>Object.keys(p.mentions||{}))));
        }''')
        start = await page.evaluate('''() => [...window.__sigong.world.byPlace.values()].flat()
          .filter(o=>o.userData.live).map(o=>o.userData.materialize.value)''')
        assert start and min(start) < 1, start
        (out/'materializing.png').write_bytes(await canvas_png(page, '#three canvas'))
        await page.wait_for_function('!window.__sigong.world.materializing', timeout=30000)
        end = await page.evaluate('''() => [...window.__sigong.world.byPlace.values()].flat()
          .filter(o=>o.userData.live).map(o=>o.userData.materialize.value)''')
        assert end and all(value == 1 for value in end), end
        await page.evaluate('window.__sigong.world.setSourcesOn(new Set())')
        await page.wait_for_timeout(100)
        assert await page.evaluate('window.__sigong.world._labels.length') == 0
        assert not errors, errors
        await browser.close()
    report = {'cameras': observations, 'selectedVisible': selected, 'materializeStartMin': min(start),
              'materializeCompleted': True, 'allSourcesOffLabels': 0, 'errors': errors}
    (out/'report.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps(report))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--url', default='http://127.0.0.1:8870/?q=low')
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    asyncio.run(run(args.url, args.out))
