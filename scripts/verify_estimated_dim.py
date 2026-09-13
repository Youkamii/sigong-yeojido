"""Capture #190 against the real local viewer and stop the server/browser afterwards."""
import argparse
import json
import os
from pathlib import Path
import subprocess
import sys
import time
from urllib.request import urlopen

from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--browser', required=True)
parser.add_argument('--out', type=Path, default=Path('docs/research/estimated-dim-190'))
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
args.out.mkdir(parents=True, exist_ok=True)
report = {'scenes': [], 'errors': []}
ready = 'window.__sigong?.chronicleScene.assets?.scenery.stats.ready&&!__sigong.chronicleScene.chronicle.loading&&!__sigong.engine.fly'
server_log = (args.out / 'server.log').open('w', encoding='utf-8')
server = subprocess.Popen(
    [sys.executable, '-u', str(root / 'services/host/server.py'), '--port', '8879'],
    cwd=root, env={**os.environ, 'PYTHONIOENCODING': 'utf-8', 'SIGONG_FUSEKI_QUERY': 'http://127.0.0.1:3031/sigong/query'},
    stdout=server_log, stderr=subprocess.STDOUT,
    creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0,
)
try:
    for elapsed in range(900):
        if server.poll() is not None:
            raise RuntimeError('Local viewer exited before startup')
        if b'  sources=' in (args.out / 'server.log').read_bytes():
            with urlopen('http://127.0.0.1:8879/', timeout=10) as response:
                assert response.status == 200
            break
        if elapsed % 30 == 0:
            print(f'Waiting for source index: {elapsed}s', flush=True)
        time.sleep(1)
    else:
        raise RuntimeError('Source index did not finish within 15 minutes')
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True, executable_path=args.browser)
        try:
            page = browser.new_page(viewport={'width': 1024, 'height': 700}, device_scale_factor=1)
            page.set_default_timeout(180000)
            page.on('pageerror', lambda error: report['errors'].append(str(error)))
            page.on('console', lambda message: report['errors'].append(message.text) if message.type == 'error' and not message.location.get('url', '').endswith('/favicon.ico') else None)
            page.goto('http://127.0.0.1:8879/', wait_until='domcontentloaded')
            print('Page loaded', flush=True)
            page.locator('[data-gate-quality="medium"]').click()
            page.locator('#enter').click()
            print('Entered viewer', flush=True)
            page.wait_for_function(ready)
            print('Viewer ready', flush=True)
            for name, year, coordinates in [('jinju-1593', 1593, None), ('jeonju-1450', 1450, [127.15, 35.82]), ('jeju-1795', 1795, [126.54, 33.36])]:
                page.locator('#historyYear').fill(str(year))
                page.locator('#historyYear').press('Enter')
                page.wait_for_function('year=>__sigong.chronicleScene.assets.plan.year===year&&__sigong.chronicleScene.assets.scenery.stats.year===year', arg=year)
                page.wait_for_function(ready)
                if coordinates:
                    page.evaluate('''([lon,lat])=>{const {world:w,engine:e}=__sigong;const [x,z]=w.toWorld(lon,lat);
                      e.fly=null;e.controls.target.set(x,w.surfaceAt(x,z),z);
                      e.camera.position.set(x,e.controls.target.y+113,z+113);e.controls.update();}''', coordinates)
                page.wait_for_timeout(1200)
                page.evaluate('''()=>{const a=__sigong.chronicleScene.assets,s=a.scenery;
                  window.estimatedBefore={overview:s.overview,forest:a.forest,paths:s.paths.estimatedMesh.geometry,builds:s.stats.modelBuilds,
                    meshes:[],historical:[]};
                  s.group.traverse(m=>{if(m.isMesh)estimatedBefore.meshes.push([m,m.geometry]);});
                  a.group.traverse(m=>{if(m.isMesh)estimatedBefore.historical.push([m,m.material,m.castShadow]);});}''')
                scene = {'name': name, 'year': year, 'coordinates': coordinates, 'states': []}
                for on in [True, False]:
                    page.locator('#atlasSettingsButton').click()
                    assert page.locator('[data-map-display="estimatedDim"]').locator('..').inner_text() == '추정 배경 흐리게'
                    page.locator('[data-map-display="estimatedDim"]').set_checked(on)
                    page.locator('[aria-label="지도 설정 닫기"]').click()
                    page.wait_for_timeout(500)
                    state = page.evaluate('''()=>{const a=__sigong.chronicleScene.assets,s=a.scenery,e=__sigong.engine,b=estimatedBefore;
                      const meshes=[];s.group.traverse(m=>{if(m.isMesh&&m.userData.estimatedBackground)meshes.push(m);});
                      const forest=[];a.forest.traverse(m=>{if(m.isInstancedMesh&&m.userData.estimatedBackground)forest.push(m);});
                      return {on:__sigong.chronicleScene.display.estimatedDim,quality:e.quality,stats:{...s.stats},
                        camera:e.camera.position.toArray(),target:e.controls.target.toArray(),
                        materials:[...new Set(meshes.map(m=>m.material))].map(m=>({opacity:m.opacity,transparent:m.transparent,depthWrite:m.depthWrite})),
                        estimatedMeshes:meshes.length,estimatedTrees:forest.reduce((n,m)=>n+m.count,0),
                        sameGeometry:s.overview===b.overview&&a.forest===b.forest&&s.paths.estimatedMesh.geometry===b.paths&&b.meshes.every(([m,g])=>m.geometry===g),
                        sameBuilds:s.stats.modelBuilds===b.builds,historicalUnchanged:b.historical.every(([m,mat,shadow])=>m.material===mat&&m.castShadow===shadow),
                        noEstimatedShadows:meshes.every(m=>!m.castShadow),drawCalls:e.renderer.info.render.calls};}''')
                    assert state['sameGeometry'] and state['sameBuilds'] and state['historicalUnchanged'], state
                    if on:
                        assert state['noEstimatedShadows'], state
                    path = args.out / f'{name}-{"on" if on else "off"}.png'
                    page.screenshot(path=str(path))
                    assert path.stat().st_size <= 1_000_000, path
                    state['file'] = path.name
                    state['bytes'] = path.stat().st_size
                    scene['states'].append(state)
                    print(json.dumps({'scene': name, **state}, ensure_ascii=False), flush=True)
                report['scenes'].append(scene)
            assert not report['errors'], report['errors']
        except Exception:
            report['failureState'] = page.evaluate('''()=>({body:document.body.innerText.slice(-2000),error:window.__sigongErr,
              sceneError:window.__sigong?.chronicleScene.error,stats:window.__sigong?.chronicleScene.assets?.scenery.stats,
              loading:window.__sigong?.chronicleScene.chronicle?.loading,fly:!!window.__sigong?.engine.fly})''')
            raise
        finally:
            browser.close()
finally:
    if os.name == 'nt':
        subprocess.run(['taskkill', '/PID', str(server.pid), '/T', '/F'], capture_output=True, creationflags=subprocess.CREATE_NO_WINDOW)
    else:
        server.terminate()
    server.wait(timeout=15)
    server_log.close()
    report['serverStopped'] = server.poll() is not None
    (args.out / 'capture-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
