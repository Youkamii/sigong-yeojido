"""Verify generated background scenery without creating historical evidence."""
import argparse,json,time
from pathlib import Path
from playwright.sync_api import sync_playwright

p=argparse.ArgumentParser(description=__doc__);p.add_argument('--base',required=True);p.add_argument('--browser',required=True);p.add_argument('--out',type=Path,required=True)
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
        page.wait_for_function('window.__sigong?.chronicleScene.assets?.revision>0&&!window.__sigong.chronicleScene.chronicle.loading')
        report['historyReadySeconds']=round(time.monotonic()-start,3)
        page.wait_for_function('window.__sigong.chronicleScene.assets.scenery.stats.ready||window.__sigong.chronicleScene.assets.scenery.stats.error')
        report['sceneryReadySeconds']=round(time.monotonic()-start,3)
        result=page.evaluate('''()=>{const {world:w,chronicleScene:c}=window.__sigong,s=c.assets.scenery;return {stats:s.stats,
          villages:s.cells.filter(cell=>cell.site.id).map(cell=>({id:cell.site.id,visible:cell.group.visible,coordinates:w.coordinatesAt(cell.site.x,cell.site.z),
            inside:w.contains(cell.site.x,cell.site.z,14),scale:cell.site.scale,layout:cell.site.layout,angle:cell.site.angle,models:cell.models,plots:cell.plots,fields:cell.group.getObjectByName('decorative-fields')?.geometry.attributes.position.count||0})),
          tigers:s.cells.filter(cell=>!cell.site.id).map(cell=>({inside:w.contains(cell.site.x,cell.site.z),visible:cell.group.visible,scale:cell.scale,
            nearestTree:Math.min(...c.assets.forestPositions.map(p=>Math.hypot(p.x-cell.site.x,p.z-cell.site.z)))})),
          picked:c.assets.picks.some(p=>p.userData.fanAssetId?.startsWith('scenery-')),
          historyChanged:c.chronicle.data.claims.some(claim=>claim.id.startsWith('scenery-'))};}''')
        check('Villages, fields and tigers finish without an asset error',not result['stats'].get('error') and result['stats']['villages']>=15 and result['stats']['tigers']>=8,result['stats'])
        check('Decorative settlements populate both northern and southern land',any(v['coordinates'][1]<37 for v in result['villages']) and any(v['coordinates'][1]>39 for v in result['villages']))
        check('Villages and farm geometry stay on land',all(v['inside'] and v['fields']>0 for v in result['villages']),result['villages'])
        check('Small tigers occupy woodland openings instead of oversized clearings',all(t['inside'] and t['scale']<=.6 and t['nearestTree']>=3.19 and t['nearestTree']<=16 for t in result['tigers']),result['tigers'])
        check('Villages have varied layouts, scales, house counts and building types',len({v['layout'] for v in result['villages']})==4 and len({len(v['models']) for v in result['villages']})>=3 and all(v['scale']<.38 for v in result['villages']) and len({m['archetype'] for v in result['villages'] for m in v['models']})>=5)
        check('Farm plots are individually shaped rather than repeated four-square strips',len({len(v['plots']) for v in result['villages']})>=3 and all(len(v['plots'])>=2 for v in result['villages']))
        check('Scenery is separate from historical claims and selectable evidence',not result['picked'] and not result['historyChanged'])
        check('No background village overlaps an active history scene',page.evaluate('''()=>{const s=window.__sigong.chronicleScene.assets.scenery;return s.cells.filter(c=>c.group.visible).every(c=>s.available(c.site));}'''))
        page.evaluate('''()=>{const {world:w,engine:e,chronicleScene:c}=window.__sigong,[x,z]=w.toWorld(127,37.58);
          const site=c.assets.scenery.sites.filter(s=>c.assets.scenery.available(s)).sort((a,b)=>Math.hypot(a.x-x,a.z-z)-Math.hypot(b.x-x,b.z-z))[0];
          e.flyTo(w.center.clone().set(site.x,w.surfaceAt(site.x,site.z),site.z),48,600);}''')
        page.wait_for_function('!window.__sigong.engine.fly');page.screenshot(path=str(a.out/'village-fields.png'))
        for layout in range(4):
            page.evaluate('''layout=>{const {world:w,engine:e,chronicleScene:c}=window.__sigong,s=c.assets.scenery.sites.find(s=>s.layout===layout&&c.assets.scenery.available(s));e.flyTo(w.center.clone().set(s.x,w.surfaceAt(s.x,s.z),s.z),45,300);}''',layout)
            page.wait_for_function('!window.__sigong.engine.fly');page.screenshot(path=str(a.out/('village-'+str(layout)+'.png')))
        before=page.evaluate('window.__sigong.engine.controls.target.toArray()')
        page.mouse.move(620,540);page.mouse.down();page.mouse.move(750,590,steps=18);page.mouse.up()
        check('Dragging still moves through the populated landscape',before!=page.evaluate('window.__sigong.engine.controls.target.toArray()'))
        page.evaluate('''()=>{const {world:w,engine:e,chronicleScene:c}=window.__sigong,cell=c.assets.scenery.cells.find(c=>!c.site.id&&c.group.visible);
          e.flyTo(w.center.clone().set(cell.site.x,w.surfaceAt(cell.site.x,cell.site.z)+.5,cell.site.z),12,600);}''')
        page.wait_for_function('!window.__sigong.engine.fly');page.screenshot(path=str(a.out/'tiger.png'))
        page.locator('#sourcesBtn').click();page.locator('#noSources').click()
        page.wait_for_function('window.__sigong.chronicleScene.assets.rows.length===0')
        check('Source deselection keeps the requested background but removes history rows and regions',page.evaluate('''()=>{const r=window.__sigong;return r.chronicleScene.assets.rows.length===0&&r.world.geography.markers.every(m=>!m.region)&&r.chronicleScene.assets.scenery.cells.some(c=>c.group.visible);}'''))
        check('No browser errors',not report['errors'],report['errors'])
    finally:
        (a.out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8');browser.close()
