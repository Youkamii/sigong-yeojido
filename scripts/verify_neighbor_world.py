"""Exercise neighboring land, peninsula scale and cited activity placement."""
import argparse,json,time
from pathlib import Path
from playwright.sync_api import sync_playwright

p=argparse.ArgumentParser(description=__doc__)
p.add_argument('--base',required=True);p.add_argument('--browser',required=True);p.add_argument('--out',type=Path,required=True)
a=p.parse_args();a.out.mkdir(parents=True,exist_ok=True);report={'base':a.base,'checks':[],'errors':[]}
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path=a.browser)
    page=browser.new_page(viewport={'width':1440,'height':1000});page.set_default_timeout(120000)
    page.on('pageerror',lambda error:report['errors'].append(str(error)))
    def check(name,passed,detail=None):
        row={'name':name,'pass':bool(passed),'detail':detail};report['checks'].append(row)
        print(json.dumps(row,ensure_ascii=False),flush=True);assert passed,(name,detail)
    try:
        start=time.monotonic();page.goto(a.base,wait_until='domcontentloaded');page.locator('#enter').click()
        page.wait_for_function('window.__sigong?.chronicleScene.assets?.revision>0&&!window.__sigong.chronicleScene.chronicle.loading&&!window.__sigong.engine.fly')
        report['readySeconds']=round(time.monotonic()-start,3)
        check('The initial scene retains a close Korean view and map scale',page.evaluate('window.__sigong.world.mapScale===8&&window.__sigong.engine.camera.position.distanceTo(window.__sigong.engine.controls.target)<250'))
        page.locator('#eastAsiaBtn').click();page.wait_for_function('!window.__sigong.engine.fly')
        samples=[('China east',119,36),('Manchuria',126.62444,45.75778),('Kyushu',130.7,33.2),('Honshu',137.5,36),('Hokkaido',142.5,43.5)]
        for name,lon,lat in samples:
            result=page.evaluate('''c=>{const {world:w,engine:e}=window.__sigong,[x,z]=w.toWorld(...c),p=w.center.clone().set(x,w.surfaceAt(x,z),z).project(e.camera);
              return {inside:w.contains(x,z),height:w.surfaceAt(x,z),roundTrip:w.coordinatesAt(x,z),screen:p.toArray()};}''',[lon,lat])
            check(name+' is real navigable land in the surrounding view',result['inside'] and result['height']>7
                  and max(abs(v) for v in result['screen'])<1 and abs(result['roundTrip'][0]-lon)<1e-8 and abs(result['roundTrip'][1]-lat)<1e-8,result)
        check('The sea between Korea and Japan remains water',page.evaluate('!window.__sigong.world.contains(...window.__sigong.world.toWorld(132,36))'))
        page.screenshot(path=str(a.out/'east-asia.png'))
        before=page.evaluate('window.__sigong.engine.controls.target.toArray()')
        page.mouse.move(690,570);page.mouse.down();page.mouse.move(850,620,steps=20);page.mouse.up();page.wait_for_timeout(500)
        check('Dragging the large surrounding view actually moves the camera target',before!=page.evaluate('window.__sigong.engine.controls.target.toArray()'))
        page.locator('#wholeMapBtn').click();page.wait_for_function('!window.__sigong.engine.fly')
        check('Korean overview still contains both Dokdo islands',page.evaluate('''()=>{const {world:w,engine:e}=window.__sigong;return w.geography.data.islands.every(i=>{
          const [x,z]=w.toWorld(i.lon,i.lat),p=w.center.clone().set(x,w.surfaceAt(x,z),z).project(e.camera);return w.contains(x,z)&&Math.max(...p.toArray().map(Math.abs))<1;});}'''))
        page.screenshot(path=str(a.out/'korea.png'))
        field=page.locator('#historyTime [type=number]');field.fill('1909');field.press('Enter')
        page.wait_for_function('window.__sigong.chronicleScene.assets.plan.year===1909&&!window.__sigong.chronicleScene.chronicle.loading')
        value=page.locator('#sceneDestination option').evaluate_all("opts=>opts.find(o=>o.dataset.sceneRow==='scene-harbin-1909')?.value")
        check('The researched Harbin event becomes selectable on neighboring land',bool(value))
        page.locator('#sceneDestination').select_option(value);page.wait_for_function('!window.__sigong.engine.fly')
        result=page.evaluate('''()=>{const {world:w,chronicleScene:s}=window.__sigong,e=s.assets.plan.events.find(e=>e.id==='scene-harbin-1909'),rows=s.assets.rows.filter(r=>r.sceneId===e.id);
          return {coordinates:e.scenePlace.coordinates,people:rows.filter(r=>r.kind==='person').map(r=>r.entityId),
            land:rows.every(r=>w.contains(r.position.x,r.position.z)),label:e.label};}''')
        check('Harbin keeps its actual coordinates and dated participants',result['coordinates']==[126.62444,45.75778]
              and result['land'] and 'person-encykorea-an-junggeun' in result['people'] and '캔버스 밖' not in result['label'],result)
        page.screenshot(path=str(a.out/'harbin-1909.png'))
        page.set_viewport_size({'width':390,'height':844});page.locator('#eastAsiaBtn').click();page.wait_for_function('!window.__sigong.engine.fly')
        check('The surrounding overview is reachable on mobile',page.locator('#eastAsiaBtn').is_visible())
        page.screenshot(path=str(a.out/'mobile-east-asia.png'))
        check('No browser errors',not report['errors'],report['errors'])
    finally:
        (a.out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8');browser.close()
