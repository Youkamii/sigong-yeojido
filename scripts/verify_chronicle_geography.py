"""Exercise the collected islands and mountain relief in the actual browser."""
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--base',required=True)
parser.add_argument('--browser',required=True)
parser.add_argument('--out',type=Path,required=True)
args=parser.parse_args();args.out.mkdir(parents=True,exist_ok=True)
report={'base':args.base,'checks':[],'errors':[]}
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path=args.browser)
    page=browser.new_page(viewport={'width':1440,'height':1000})
    page.set_default_timeout(120000)
    page.on('pageerror',lambda error:report['errors'].append(str(error)))
    def check(name,passed,detail=None):
        report['checks'].append({'name':name,'pass':bool(passed),'detail':detail})
        print(json.dumps(report['checks'][-1],ensure_ascii=False),flush=True)
        assert passed,(name,detail)
    try:
        page.goto(args.base,wait_until='domcontentloaded')
        page.locator('#enter').click()
        page.wait_for_function('window.__sigong?.world.geography && window.__sigong.chronicleScene.assets?.revision>0')
        page.wait_for_function('!window.__sigong.engine.fly')
        data=page.evaluate('window.__sigong.world.geography.data')
        check('Cited Taebaek and Sobaek lines are loaded',
              {'taebaek-sanmaek','sobaek-sanmaek'}.issubset({r['id'] for r in data['ridges']}))
        for ridge_id in ['nangnim-sanmaek','hamgyeong-sanmaek','macheollyeong-sanmaek','jeogyuryeong-sanmaek','gangnam-sanmaek']:
            page.locator('#geographyDestination').select_option(ridge_id)
            page.wait_for_function('!window.__sigong.engine.fly')
            result=page.evaluate('''id=>{const w=window.__sigong.world,r=w.geography.data.ridges.find(r=>r.id===id);
              const points=r.geometry.coordinates.map(c=>{const [x,z]=w.toWorld(...c);return {inside:w.contains(x,z),height:w.surfaceAt(x,z)};});
              return {points:points.length,inside:points.every(p=>p.inside),maximum:Math.max(...points.map(p=>p.height)),
                sources:document.querySelectorAll('#geographyCard a').length};}''',ridge_id)
            check(ridge_id+' has selectable sourced relief inside the peninsula',result['points']>=4 and result['inside'] and result['maximum']>12 and result['sources']>0,result)
        page.locator('#geographyDestination').select_option('peak-한라산')
        page.wait_for_function('!window.__sigong.engine.fly')
        check('Collected peaks are selectable with their source',page.locator('#geographyCard a').count()>0 and '한라산' in page.locator('#geographyCard strong').inner_text())
        for name in ['ulleungdo','dokdo-dongdo','dokdo-seodo']:
            page.locator('#geographyDestination').select_option(name)
            page.wait_for_function('!window.__sigong.engine.fly')
            result=page.evaluate('''id=>{const r=window.__sigong,w=r.world,e=r.engine;
              const i=w.geography.data.islands.find(i=>i.id===id),p=w.geography.markers.find(m=>m.row.id===id).position;
              const [x,z]=w.toWorld(i.lon,i.lat),screen=p.clone().project(e.camera);
              return {lon:i.lon,lat:i.lat,inside:w.contains(x,z),height:w.surfaceAt(x,z),
                coordinateRoundTrip:w.coordinatesAt(x,z),screen:screen.toArray(),
                sources:document.querySelectorAll('#geographyCard a').length,
                distance:e.camera.position.distanceTo(e.controls.target)};}''',name)
            check(name+' retains its cited offshore position and is selectable',result['inside']
                  and abs(result['coordinateRoundTrip'][0]-result['lon'])<1e-8
                  and abs(result['coordinateRoundTrip'][1]-result['lat'])<1e-8
                  and result['sources']>0 and all(abs(x)<1 for x in result['screen']),result)
            if name.startswith('dokdo'):
                check(name+' remains east of Ulleungdo at the official Dokdo longitude',131.8<result['lon']<132.0 and 37.2<result['lat']<37.3)
            page.screenshot(path=str(args.out/(name+'.png')))
        page.locator('#geographyClose').click()
        page.locator('#geographyDestination').select_option('taebaek-sanmaek')
        page.wait_for_function('!window.__sigong.engine.fly')
        relief=page.evaluate('''()=>{const w=window.__sigong.world;
          return w.ridgeSegments.map(s=>w.surfaceAt((s.a[0]+s.b[0])/2,(s.a[1]+s.b[1])/2)).filter(Number.isFinite);}''')
        check('Loaded mountain paths produce raised terrain, not just labels',max(relief)>12,{'maximumHeight':max(relief),'baseHeight':7})
        page.screenshot(path=str(args.out/'mountains.png'))
        page.locator('#geographyClose').click()
        page.locator('#wholeMapBtn').click();page.wait_for_function('!window.__sigong.engine.fly')
        page.screenshot(path=str(args.out/'whole.png'))
        page.set_viewport_size({'width':390,'height':844})
        page.locator('#geographyDestination').select_option('ulleungdo')
        page.wait_for_function('!window.__sigong.engine.fly')
        check('Mobile island selection keeps its explanation accessible',page.locator('#geographyCard').is_visible())
        page.screenshot(path=str(args.out/'mobile-island.png'))
        check('No browser execution errors',not report['errors'],report['errors'])
    finally:
        (args.out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        browser.close()
