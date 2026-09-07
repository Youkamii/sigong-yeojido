"""Actual browser checks for the large peninsula and scene navigation (#95)."""
import argparse,json
from pathlib import Path
from playwright.sync_api import sync_playwright

ap=argparse.ArgumentParser(description=__doc__)
ap.add_argument('--base',required=True);ap.add_argument('--out',type=Path,required=True)
ap.add_argument('--quality',choices=['low','default'],default='low')
ap.add_argument('--capacity',action='store_true',help='Also build 161 test figures in an isolated field')
args=ap.parse_args();args.out.mkdir(parents=True,exist_ok=True)
report={'base':args.base,'quality':args.quality,'checks':[],'errors':[]}
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    page=browser.new_page(viewport={'width':1440,'height':1000});page.set_default_timeout(90000)
    page.on('pageerror',lambda e:report['errors'].append(str(e)))
    page.on('console',lambda m:report['errors'].append(m.text) if m.type=='error' else None)
    def check(name,ok,detail=None):
        value={'name':name,'pass':bool(ok),'detail':detail};report['checks'].append(value)
        print(json.dumps(value,ensure_ascii=False),flush=True);assert ok,(name,detail)
    def settled():page.wait_for_function('!window.__sigong.engine.fly')
    def snapshot():return page.evaluate('''()=>{const r=window.__sigong,a=r.chronicleScene.assets,e=r.engine,w=r.world;return {
      bounds:w.bounds,scale:w.mapScale,distance:e.camera.position.distanceTo(e.controls.target),target:e.controls.target.toArray(),
      year:a.plan.year,stats:a.stats,people:a.rows.filter(x=>x.kind==='person').map(x=>x.entityId),
      inside:a.rows.every(x=>w.contains(x.position.x,x.position.z)),height:a.rows.every(x=>Math.abs(x.position.y-w.surfaceAt(x.position.x,x.position.z))<.001),
      trees:a.forestPositions.length,treeGroups:a.forest.children.length,quality:e.quality,selected:a.selected,
      places:[...document.querySelector('#sceneDestination').options].map(o=>o.value).filter(Boolean)};}''')
    def screenshot(name):
        page.evaluate('window.__sigong.engine.stop()')
        page.screenshot(path=str(args.out/(name+'.png')))
        page.evaluate('''()=>{const r=window.__sigong;r.engine.start((dt,t)=>{r.world.update(t,r.engine.camera,r.engine.renderer.domElement);
          r.chronicleScene.update(r.engine.camera,r.engine.renderer.domElement,t);});}''')
    def year(value):
        control=page.locator('#historyTime [type=number]');control.fill(str(value));control.press('Enter')
        page.wait_for_function('(y)=>window.__sigong.chronicleScene.assets.plan.year===y',arg=value)
        page.wait_for_function('!document.querySelector("#chronicle [role=status]")')
        page.wait_for_function('!document.querySelector("#historyMapBtn").textContent.includes("조회 중")')
    try:
        page.goto(args.base.rstrip('/')+('/?q=low' if args.quality=='low' else '/'),wait_until='domcontentloaded')
        page.locator('#enter').click()
        page.wait_for_function('window.__sigong?.chronicleScene.assets?.revision>0')
        page.wait_for_function('!document.querySelector("#chronicle [role=status]")');settled()
        s=snapshot();report['initial']=s
        check('The land footprint is 64 times larger without enlarging the people',s['scale']==8 and s['bounds']['maxZ']-s['bounds']['minZ']>1000 and
              page.evaluate("window.__sigong.chronicleScene.assets.rows.filter(r=>r.kind==='person').every(r=>r.scale===2.3)"),s['bounds'])
        check('The first view enters a close historical scene',s['distance']<150 and s['year']==1593,{'distance':s['distance'],'target':s['target']})
        check('All current figures and buildings stay on the enlarged land',s['inside'] and s['height'] and len(s['people'])==7)
        check('All current scenes remain reachable through navigation',len(s['places'])==10 and set(s['people'])<=set(s['places']))
        check('The larger forest is divided into cullable regions',s['trees']>10000 and s['treeGroups']>20,{'trees':s['trees'],'groups':s['treeGroups']})
        check('Forward and inverse projection keep the cited Haengju coordinates',page.evaluate('''()=>{const w=window.__sigong.world,a=window.__sigong.chronicleScene.assets,
          row=a.rows.find(r=>r.kind==='event'&&r.entityId==='event-khs-haengju'),ll=row.site.geometry.coordinates,p=w.toWorld(...ll),back=w.coordinatesAt(...p);
          return Math.hypot(p[0]-row.position.x,p[1]-row.position.z)<1e-8&&Math.hypot(back[0]-ll[0],back[1]-ll[1])<1e-8
          &&row.site.properties.coordinateClaimId==='claim-khs-haengju-point';}'''))
        screenshot('region')
        page.locator('#sceneZoomIn').click();settled();near=snapshot()['distance']
        page.locator('#sceneZoomOut').click();settled();far=snapshot()['distance']
        check('Visible zoom buttons change the viewing scale',near<s['distance']*.8 and far>near*1.3,{'near':near,'far':far})
        rect=page.locator('#three canvas').bounding_box();x=rect['x']+rect['width']*.6;y=rect['y']+rect['height']*.7
        before=snapshot()['target'];page.mouse.move(x,y);page.mouse.down();page.mouse.move(x+140,y-50,steps=12);page.mouse.up()
        after=snapshot()['target'];check('Dragging traverses the land',sum((a-b)**2 for a,b in zip(before,after))>25,{'before':before,'after':after})
        before=snapshot()['distance'];page.mouse.wheel(0,-300)
        page.wait_for_function('(d)=>window.__sigong.engine.camera.position.distanceTo(window.__sigong.engine.controls.target)<d*.85',arg=before)
        check('Mouse wheel zoom works in the larger world',snapshot()['distance']<before*.85)
        before=snapshot()['target'];page.locator('#sceneDestination').select_option('event-encykorea-jinju-jeontu-1593');settled();after=snapshot()['target']
        check('Scene navigation reaches a distant region',sum((a-b)**2 for a,b in zip(before,after))>200**2 and snapshot()['distance']<120)
        page.locator('#wholeMapBtn').click();settled();overview=snapshot()
        fits=page.evaluate('''()=>{const r=window.__sigong,w=r.world,c=r.engine.camera;return w.rings.flat().every(([x,z])=>{
          const p=w.center.clone().set(x,7,z).project(c);return Math.abs(p.x)<1&&Math.abs(p.y)<1&&Math.abs(p.z)<1;});}''')
        check('Whole-map view fits the actual peninsula without camera clipping',overview['distance']>s['distance']*8 and fits,overview['distance'])
        screenshot('whole')
        page.locator('#periodSceneBtn').click();settled()
        check('Return to the era restores a close scene',snapshot()['distance']<150)
        person='person-encykorea-gwon-yul-e0007022';page.locator('#sceneDestination').select_option(person);settled()
        point=page.evaluate('''id=>{const r=window.__sigong,p=r.chronicleScene.assets.rowFor(id).pick.position.clone().project(r.engine.camera),b=r.engine.renderer.domElement.getBoundingClientRect();
          return {x:b.left+(p.x+1)*b.width/2,y:b.top+(1-p.y)*b.height/2};}''',person)
        page.mouse.click(point['x'],point['y']);page.wait_for_function('(id)=>window.__sigong.chronicleScene.assets.selected===id',arg=person);settled()
        check('An actual model click opens the historical figure and lifespan',page.locator('#chronicle h2').inner_text()=='권율' and '1537년' in page.locator('#chronicle').inner_text())
        page.locator('#chronicle .entity-date').filter(has_text='1537년').locator('[data-chronicle-claim]').first.click()
        check('The enlarged scene retains access to the original evidence','1537' in page.locator('#evi .quote').inner_text());page.keyboard.press('Escape')
        for value,minimum in [(1392,6),(1919,7),(1593,7)]:
            year(value);settled();s=snapshot()
            check(f'{value}: year changes retain all current people and grounded models',len(s['people'])>=minimum and s['inside'] and s['height'] and set(s['people'])<=set(s['places']))
        page.locator('#sourcesBtn').click();page.locator('#noSources').click()
        page.wait_for_function('window.__sigong.chronicleScene.assets.rows.length===0')
        check('Turning all sources off clears picks and scene destinations',page.evaluate('window.__sigong.engine.pickTargets.length===0&&document.querySelector("#sceneDestination").disabled'))
        page.locator('#allSources').click();page.wait_for_function('window.__sigong.chronicleScene.assets.rows.length>0');page.keyboard.press('Escape');year(1593)
        if args.capacity:
            capacity=page.evaluate('''()=>{const a=window.__sigong.chronicleScene.assets,anchors=new Map(),recipes=[];
              for(let i=0;i<161;i++){const id='capacity-test-'+i;anchors.set(id,a.rows[0].position.clone());recipes.push({id,anchor:id,archetype:'human',form:'civilian',scale:2.3});}
              const result=a.field(recipes,anchors),stats=result.stats,picks=result.picks.length;
              const geometries=new Set(),materials=new Set();result.group.traverse(o=>{if(o.geometry)geometries.add(o.geometry);
                for(const m of [o.material,o.customDepthMaterial,o.customDistanceMaterial].flat())if(m)materials.add(m);});
              geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());return {stats,picks};}''')
            check('161 figures build without the former global 160-asset cutoff',capacity['stats']['built']==161 and capacity['picks']==161 and not capacity['stats']['dropped'],capacity)
        page.set_viewport_size({'width':480,'height':900});page.locator('#periodSceneBtn').click();settled();screenshot('mobile')
        check('Mobile keeps navigation and the close scene available',page.locator('#sceneDestination').is_visible() and page.locator('#sceneZoomIn').is_visible()
              and page.locator('#three canvas').bounding_box()['height']>300 and snapshot()['distance']<150)
        page.locator('#wholeMapBtn').click();settled()
        check('Mobile whole-map view stays within the camera range',page.evaluate('''()=>{const r=window.__sigong,c=r.engine.camera;return r.world.rings.flat().every(([x,z])=>{
          const p=r.world.center.clone().set(x,7,z).project(c);return Math.abs(p.x)<1&&Math.abs(p.y)<1&&Math.abs(p.z)<1;});}'''))
        check('No JavaScript or WebGL errors',not report['errors'],report['errors'])
    except Exception as error:report['failure']=str(error);raise
    finally:
        report['passed']=bool(report['checks']) and all(c['pass'] for c in report['checks']) and 'failure' not in report
        (args.out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');browser.close()
