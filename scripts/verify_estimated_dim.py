"""Capture #190 and check toggles against an already running viewer."""
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--url', default='http://127.0.0.1:8879')
    parser.add_argument('--browser', type=Path)
    parser.add_argument('--out', type=Path, default=Path('docs/research/estimated-dim-190'))
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    report = {'scenes': [], 'checks': [], 'failures': [], 'errors': []}
    ready = 'window.__sigong?.chronicleScene.assets?.scenery.stats.ready&&!__sigong.chronicleScene.chronicle.loading&&!__sigong.engine.fly'

    def check(name, actual, expected):
        passed = actual == expected
        report['checks'].append({'name': name, 'actual': actual, 'expected': expected, 'pass': passed})
        if not passed:
            report['failures'].append(name)

    page = browser = None
    try:
        with sync_playwright() as pw:
            try:
                browser = pw.chromium.launch(headless=True, **({'executable_path': str(args.browser)} if args.browser else {'channel': 'chrome'}))
                page = browser.new_page(viewport={'width': 1024, 'height': 700}, device_scale_factor=1)
                page.set_default_timeout(180000)
                page.on('pageerror', lambda error: report['errors'].append(str(error)))
                page.on('console', lambda message: report['errors'].append(message.text) if message.type == 'error' and not message.location.get('url', '').endswith('/favicon.ico') else None)
                page.goto(args.url, wait_until='domcontentloaded')
                page.wait_for_function("typeof document.getElementById('enter').onclick==='function'")
                page.locator('[data-gate-quality="medium"]').click()
                page.locator('#enter').click()
                page.wait_for_function(ready)
                page.evaluate('''()=>{const a=__sigong.chronicleScene.assets,build=a.buildForest;
                  window.estimatedCounts={forestCalls:0,forestRebuilds:0};
                  a.buildForest=function(...args){const before=this.forest;estimatedCounts.forestCalls++;
                    const result=build.apply(this,args);if(this.forest!==before)estimatedCounts.forestRebuilds++;return result;};}''')
                print('Viewer ready; forest call counter installed', flush=True)
                for name, year, coordinates in [('jeonju-1450', 1450, [127.15, 35.82]), ('jeju-1795', 1795, [126.54, 33.36])]:
                    counts_before = page.evaluate('({...estimatedCounts})')
                    page.locator('#historyYear').fill(str(year))
                    page.locator('#historyYear').press('Enter')
                    page.wait_for_function('year=>__sigong.chronicleScene.assets.plan.year===year&&__sigong.chronicleScene.assets.scenery.stats.year===year', arg=year)
                    page.wait_for_function(ready)
                    page.evaluate('''([lon,lat])=>{const {world:w,engine:e}=__sigong;const [x,z]=w.toWorld(lon,lat);
                      e.fly=null;e.controls.target.set(x,w.surfaceAt(x,z),z);
                      e.camera.position.set(x,e.controls.target.y+113,z+113);e.controls.update();}''', coordinates)
                    page.wait_for_timeout(1200)
                    counts_after = page.evaluate('({...estimatedCounts})')
                    year_counts = {key: counts_after[key] - counts_before[key] for key in counts_before}
                    check(f'{name}: one forest call per year change', year_counts['forestCalls'], 1)
                    page.evaluate('''()=>{const a=__sigong.chronicleScene.assets,s=a.scenery;
                      window.estimatedBefore={overview:s.overview,paths:s.paths.estimatedMesh.geometry,builds:s.stats.modelBuilds,
                        counts:{...estimatedCounts},meshes:[],historical:[]};
                      s.group.traverse(m=>{if(m.isMesh)estimatedBefore.meshes.push([m,m.geometry]);});
                      a.group.traverse(m=>{if(m.isMesh)estimatedBefore.historical.push([m,m.material,m.castShadow]);});}''')
                    scene = {'name': name, 'year': year, 'coordinates': coordinates, 'yearChange': year_counts, 'states': []}
                    report['scenes'].append(scene)
                    for on in [True, False]:
                        page.locator('#atlasSettingsButton').click()
                        toggle = page.locator('[data-map-display="estimatedDim"]')
                        check(f'{name}: toggle label', toggle.locator('..').inner_text().strip(), '\ucd94\uc815 \ubc30\uacbd \ud750\ub9ac\uac8c')
                        toggle.set_checked(on)
                        page.locator('#atlasSettingsButton').click()
                        page.wait_for_timeout(500)
                        state = page.evaluate('''()=>{const a=__sigong.chronicleScene.assets,s=a.scenery,e=__sigong.engine,b=estimatedBefore;
                          const meshes=[];s.group.traverse(m=>{if(m.isMesh&&m.userData.estimatedBackground)meshes.push(m);});
                          return {on:__sigong.chronicleScene.display.estimatedDim,quality:e.quality,stats:{...s.stats},
                            camera:e.camera.position.toArray(),target:e.controls.target.toArray(),
                            materials:[...new Set(meshes.flatMap(m=>m.material))].map(m=>({opacity:m.opacity,transparent:m.transparent,depthWrite:m.depthWrite})),
                            estimatedMeshes:meshes.length,
                            sameGeometry:s.overview===b.overview&&s.paths.estimatedMesh.geometry===b.paths&&b.meshes.every(([m,g])=>m.geometry===g),
                            modelBuildsDelta:s.stats.modelBuilds-b.builds,
                            forestCallsDelta:estimatedCounts.forestCalls-b.counts.forestCalls,
                            forestRebuildsDelta:estimatedCounts.forestRebuilds-b.counts.forestRebuilds,
                            historicalUnchanged:b.historical.every(([m,mat,shadow])=>m.material===mat&&m.castShadow===shadow),
                            noEstimatedShadows:meshes.every(m=>!m.castShadow),drawCalls:e.renderer.info.render.calls};}''')
                        prefix = f'{name} {"on" if on else "off"}'
                        check(f'{prefix}: toggle', state['on'], on)
                        check(f'{prefix}: estimated meshes present', state['estimatedMeshes'] > 0, True)
                        for key in ['sameGeometry', 'historicalUnchanged']:
                            check(f'{prefix}: {key}', state[key], True)
                        for key in ['modelBuildsDelta', 'forestCallsDelta', 'forestRebuildsDelta']:
                            check(f'{prefix}: {key}', state[key], 0)
                        if on:
                            check(f'{prefix}: no estimated shadows', state['noEstimatedShadows'], True)
                            check(f'{prefix}: dim material present', any(m['opacity'] == .55 for m in state['materials']), True)
                        else:
                            check(f'{prefix}: material restored', all(m['opacity'] == 1 and not m['transparent'] and m['depthWrite'] for m in state['materials']), True)
                        path = args.out / f'{name}-{"on" if on else "off"}.png'
                        page.screenshot(path=str(path))
                        state['file'] = path.name
                        state['bytes'] = path.stat().st_size
                        check(f'{prefix}: PNG at most 1 MB', state['bytes'] <= 1_000_000, True)
                        scene['states'].append(state)
                        print(json.dumps({'scene': name, 'on': on, 'yearChange': year_counts, 'modelBuildsDelta': state['modelBuildsDelta'], 'forestCallsDelta': state['forestCallsDelta'], 'forestRebuildsDelta': state['forestRebuildsDelta'], 'bytes': state['bytes']}), flush=True)
            except Exception as error:
                report['failures'].append(f'{type(error).__name__}: {error}')
                if page is not None and not page.is_closed():
                    try:
                        report['failureState'] = page.evaluate('''()=>({body:document.body.innerText.slice(-2000),error:window.__sigongErr,
                          sceneError:window.__sigong?.chronicleScene.error,stats:window.__sigong?.chronicleScene.assets?.scenery.stats,
                          loading:window.__sigong?.chronicleScene.chronicle?.loading,fly:!!window.__sigong?.engine.fly})''')
                    except Exception as diagnostic_error:
                        report['errors'].append(f'Diagnostic unavailable: {diagnostic_error}')
            finally:
                if browser is not None:
                    browser.close()
    except Exception as error:
        report['failures'].append(f'{type(error).__name__}: {error}')
    check('no browser errors', report['errors'], [])
    (args.out / 'capture-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'checks': len(report['checks']), 'failures': report['failures']}, ensure_ascii=False), flush=True)
    return 1 if report['failures'] else 0


if __name__ == '__main__':
    raise SystemExit(main())
