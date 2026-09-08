"""Check shared geographic coordinates and the 38th parallel in the actual map."""
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
    page=browser.new_page(viewport={'width':1440,'height':1000});page.set_default_timeout(120000)
    page.on('pageerror',lambda error:report['errors'].append(str(error)))
    def check(name,passed,detail=None):
        row={'name':name,'pass':bool(passed),'detail':detail};report['checks'].append(row)
        print(json.dumps(row,ensure_ascii=False),flush=True);assert passed,(name,detail)
    try:
        page.goto(args.base,wait_until='domcontentloaded');page.locator('#enter').click()
        page.wait_for_function('window.__sigong?.world.geography && window.__sigong.chronicleScene.assets?.revision>0')
        page.locator('#wholeMapBtn').click();page.wait_for_function('!window.__sigong.engine.fly')
        page.locator('#showParallel38').check()
        parallel=page.evaluate('''()=>{const w=window.__sigong.world,line=w.geography.parallel,p=line.geometry.attributes.position;
          return {visible:line.visible,coordinates:Array.from({length:p.count},(_,i)=>w.coordinatesAt(p.getX(i),p.getZ(i)))};}''')
        check('Every 38th-parallel vertex uses latitude 38 in the map projection',parallel['visible']
              and len(parallel['coordinates'])>100 and all(abs(p[1]-38)<1e-5 for p in parallel['coordinates']))
        page.screenshot(path=str(args.out/'parallel-38.png'))
        page.locator('#showParallel38').uncheck()
        check('The latitude reference can be hidden',page.evaluate('!window.__sigong.world.geography.parallel.visible'))
        for label in ['평양','서울','부산','강릉']:
            marker=page.evaluate('''label=>{const m=window.__sigong.world.geography.markers.find(m=>m.region&&(m.row.label===label||m.row.aliases?.includes(label)));
              return m?{id:m.row.id,label:m.row.label,lon:m.row.lon,lat:m.row.lat}:null;}''',label)
            # The initial stored HGIS label for Seoul is 경성.
            if not marker and label=='서울':
                marker=page.evaluate('''()=>{const m=window.__sigong.world.geography.markers.find(m=>m.region&&m.row.label==='경성');
                  return m?{id:m.row.id,label:m.row.label,lon:m.row.lon,lat:m.row.lat}:null;}''')
            check(label+' has a usable regional coordinate',marker is not None,marker)
            page.locator('#geographyDestination').select_option(marker['id']);page.wait_for_function('!window.__sigong.engine.fly')
            text=page.locator('#geographyCard').inner_text()
            check(label+' displays coordinates and their geographic source','°N' in text and '°E' in text
                  and page.locator('#geographyCard a').count()>0,text[:300])
        page.screenshot(path=str(args.out/'regional-anchor.png'))
        page.set_viewport_size({'width':390,'height':844})
        check('Mobile geographic controls fit the viewport',page.locator('.geography-navigation').evaluate(
            'el=>{const r=el.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth;}'))
        check('Mobile coordinate explanation stays inside the map',page.locator('#geographyCard').evaluate(
            'el=>el.getBoundingClientRect().bottom<=document.querySelector(".canvasWrap").getBoundingClientRect().bottom'))
        page.screenshot(path=str(args.out/'mobile-coordinates.png'))
        check('No browser errors',not report['errors'],report['errors'])
    finally:
        (args.out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        browser.close()
