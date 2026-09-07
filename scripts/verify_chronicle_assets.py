"""Exercise real catalog models, canvas picking, time and disposal on the live viewer (#93)."""
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright


def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--base',required=True);ap.add_argument('--out',type=Path,required=True)
    ap.add_argument('--quality',choices=['low','default'],default='low')
    ap.add_argument('--screenshots',action='store_true')
    args=ap.parse_args();args.out.mkdir(parents=True,exist_ok=True)
    report={'base':args.base,'quality':args.quality,'checks':[],'errors':[]}
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage',
            '--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        page=browser.new_page(viewport={'width':1440,'height':1000});page.set_default_timeout(30000)
        page.on('pageerror',lambda e:report['errors'].append(str(e)))
        page.on('console',lambda m:report['errors'].append(m.text) if m.type=='error' else None)
        def check(name,ok,detail=None):
            report['checks'].append({'name':name,'pass':bool(ok),'detail':detail})
            print(json.dumps(report['checks'][-1],ensure_ascii=False),flush=True)
            assert ok,(name,detail)
        def ready():
            page.wait_for_function('!document.querySelector("#chronicle [role=status]")',timeout=90000)
            page.wait_for_function('window.__sigong.chronicleScene.assets?.revision>0',timeout=90000)
            page.wait_for_function('!document.querySelector("#historyMapBtn").textContent.includes("조회 중")',timeout=90000)
        def year(value):
            field=page.locator('#historyTime [type=number]');field.fill(str(value));field.press('Enter');ready()
            page.wait_for_function('(y)=>window.__sigong.chronicleScene.assets.plan.year===y',arg=value)
        def scene():
            return page.evaluate('''()=>{const r=window.__sigong,a=r.chronicleScene.assets;return {
              year:a.plan.year,stats:a.stats,groups:r.engine.scene.children.filter(g=>g.name==='chronicle-assets').length,
              geometries:r.engine.renderer.info.memory.geometries,selected:a.selected,selectedRow:a.selectedRow,
              rows:a.rows.map(x=>({id:x.id,entityId:x.entityId,label:x.label,kind:x.kind,archetype:x.archetype,
                placement:x.placement,position:x.position.toArray(),claimIds:x.claimIds,site:x.site})),
              picks:r.engine.pickTargets.map(p=>p.userData.fanNodeId)}}''')
        def click_model(entity,placement):
            position=page.evaluate('''([id,placement])=>{const r=window.__sigong,a=r.chronicleScene.assets;
              const row=a.rows.find(x=>x.entityId===id&&x.placement===placement);
              const p=row.pick.position.clone().project(r.engine.camera),rect=r.engine.renderer.domElement.getBoundingClientRect();
              return {x:rect.left+(p.x+1)*rect.width/2,y:rect.top+(1-p.y)*rect.height/2};}''',[entity,placement])
            page.mouse.click(position['x'],position['y'])
            page.wait_for_function('(id)=>window.__sigong.chronicleScene.assets.selected===id',arg=entity)
            page.wait_for_function('!window.__sigong.engine.fly',timeout=90000)
        def capture(name):
            if not args.screenshots:return
            # Keep screenshots stable under software WebGL without changing the scene.
            page.evaluate('window.__sigong.engine.stop()')
            page.screenshot(path=str(args.out/(name+'.png')),timeout=90000)
            page.evaluate('''()=>{const r=window.__sigong;r.engine.start((dt,t)=>{
              r.world.update(t,r.engine.camera,r.engine.renderer.domElement);
              r.chronicleScene.update(r.engine.camera,r.engine.renderer.domElement,t);});}''')
        try:
            page.add_init_script('''const originalFetch=window.fetch.bind(window);
              window.fetch=(url,...args)=>String(url).includes('history-asset-catalog.json')
                ?new Promise(resolve=>{window.releaseHistoryCatalog=()=>resolve(originalFetch(url,...args));})
                :originalFetch(url,...args);''')
            page.goto(args.base.rstrip('/')+('/?q=low' if args.quality=='low' else '/'),wait_until='domcontentloaded',timeout=90000)
            page.locator('#enter').click()
            page.wait_for_function('!!window.__sigong&&typeof window.releaseHistoryCatalog==="function"',timeout=90000)
            field=page.locator('#historyTime [type=number]');field.fill('1919');field.press('Enter')
            check('Time controls work while the catalog is still loading',page.evaluate('!window.__sigong.chronicleScene.assets&&window.__sigong.world._year===1919'))
            page.evaluate('window.releaseHistoryCatalog()');ready()
            check('Delayed catalog builds the latest year only',scene()['year']==1919 and any(r['label']=='유관순' for r in scene()['rows']))
            for value,minimum in [(1392,6),(1593,7),(1919,7)]:
                year(value);s=scene();people=[r for r in s['rows'] if r['kind']=='person' and r['placement']=='collection']
                check(f'{value}: real person and event models',len(people)>=minimum and any(r['kind']=='event' for r in s['rows']) and s['stats']['meshes']>=2,
                      {'people':[r['label'] for r in people],'assets':s['stats']['built'],'triangles':s['stats']['triangles']})
            year(1593);page.locator('#periodSceneBtn').click();page.wait_for_function('!window.__sigong.engine.fly',timeout=90000)
            s=scene()
            check('Original blueprints build without fallback or material override',s['stats']['catalog']['blueprints']==5 and s['stats']['parts']>100 and not s['stats']['dropped'],s['stats'])
            located=next(r for r in s['rows'] if r['kind']=='event' and r['placement']=='site')
            check('Haengju uses the real institutional site with its evidence',located['site']['geometry']['coordinates']==[126.8247541,37.59994084]
                  and located['site']['properties']['coordinateClaimId']=='claim-khs-haengju-point',located['site']['properties']['coordinateClaimId'])
            check('Unknown locations remain in the labelled collection',all(r.get('site') is None for r in s['rows'] if r['placement']=='collection')
                  and any(r['label']=='임진왜란' and r['placement']=='collection' for r in s['rows']))
            capture('1593')
            gwon='person-encykorea-gwon-yul-e0007022'
            click_model(gwon,'collection')
            check('Clicking the actual figure opens its person and lifespan',page.locator('#chronicle h2').inner_text()=='권율'
                  and '1537년' in page.locator('#chronicle').inner_text() and '1599년' in page.locator('#chronicle').inner_text())
            capture('gwon-yul')
            page.locator('#chronicle .entity-date').filter(has_text='1537년').locator('[data-chronicle-claim]').first.click()
            check('Figure evidence opens the cited original quote','1537' in page.locator('#evi .quote').inner_text())
            page.locator('#evi [data-evidence-action=chunk]').click()
            page.wait_for_function('document.querySelector("#evi").textContent.includes("1537")')
            check('Source excerpt resolves through the live API','1537' in page.locator('#evi').inner_text())
            page.keyboard.press('Escape')
            page.evaluate("window.__sigong.chronicleScene.assets.focus('event-khs-haengju')")
            page.wait_for_function('!window.__sigong.engine.fly',timeout=90000)
            click_model('event-khs-haengju','site')
            check('Clicking the event model opens its related people','권율' in page.locator('#chronicle').inner_text())
            click_model(gwon,'relation')
            check('A figure clicked at an event stays at that event',scene()['selectedRow'].startswith('event:event-khs-haengju:'))
            capture('haengju')
            year(1600)
            check('Dead figures and their pick targets disappear',all(r['entityId']!=gwon for r in scene()['rows']) and gwon not in scene()['picks'])
            year(1592)
            check('A nearby future battle does not appear in 3D',not any(r['entityId']=='event-khs-haengju' for r in scene()['rows']))
            year(1593);page.locator('#sourcesBtn').click();page.locator('#noSources').click();ready()
            check('All sources off removes models and hit targets',scene()['rows']==[] and scene()['picks']==[])
            page.locator('#allSources').click();ready();page.keyboard.press('Escape')
            page.locator('#humanOnly').check();ready()
            check('Origin filter removes AI-derived models and hit targets',scene()['rows']==[] and scene()['picks']==[])
            page.locator('#humanOnly').uncheck();ready();year(1593)
            page.evaluate('''()=>{window.disposedAssetGeometries=0;const seen=new Set();
              window.__sigong.chronicleScene.assets.group.traverse(o=>{if(o.geometry&&!seen.has(o.geometry)){
                seen.add(o.geometry);o.geometry.addEventListener('dispose',()=>window.disposedAssetGeometries++);}});}''')
            for value in [1392,1919,1593,1392,1919,1593]:year(value)
            check('Repeated time changes release old geometry and retain one scene',page.evaluate('window.disposedAssetGeometries>5') and scene()['groups']==1,
                  {'disposed':page.evaluate('window.disposedAssetGeometries'),'groups':scene()['groups']})
            page.locator('#historyTime [data-play]').click()
            page.wait_for_function('window.__sigong.chronicleScene.assets.plan.year>1593')
            page.locator('#historyTime [data-play]').click()
            check('Playback updates real models',scene()['year']>1593)
            year(1919);page.locator('#periodSceneBtn').click();page.wait_for_function('!window.__sigong.engine.fly',timeout=90000)
            capture('1919')
            page.set_viewport_size({'width':480,'height':900});page.locator('#periodSceneBtn').click()
            page.wait_for_function('!window.__sigong.engine.fly',timeout=90000)
            dimensions=page.locator('#three canvas').bounding_box()
            check('Mobile keeps the real 3D canvas and time controls',dimensions['height']>=200 and page.locator('#historyTime [type=number]').is_visible(),dimensions)
            overlaps=page.evaluate('''()=>{const rs=[...document.querySelectorAll('[data-scene-entity]')].filter(e=>!e.hidden).map(e=>e.getBoundingClientRect());
              let n=0;rs.forEach((a,i)=>rs.slice(i+1).forEach(b=>{if(a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top)n++;}));return n;}''')
            check('Visible model labels do not overlap on mobile',overlaps==0,overlaps)
            capture('mobile')
            check('No JavaScript or WebGL errors',not report['errors'],report['errors'])
        except Exception as error:
            report['failure']=str(error);raise
        finally:
            report['passed']=all(c['pass'] for c in report['checks']) and 'failure' not in report
            (args.out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
            browser.close()


if __name__=='__main__':main()
