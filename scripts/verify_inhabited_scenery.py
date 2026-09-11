"""Fixed headless views against real APIs; optional interception replaces frontend files only."""
import argparse,base64,json
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright
p=argparse.ArgumentParser();p.add_argument('--frontend',type=Path);p.add_argument('--out',type=Path,required=True);a=p.parse_args();a.out.mkdir(parents=True,exist_ok=True)
report={'frontend':str(a.frontend),'errors':[],'views':[]}
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path=r'C:\Program Files\Google\Chrome\Application\chrome.exe')
 page=b.new_page(viewport={'width':1256,'height':809});page.set_default_timeout(120000)
 page.on('pageerror',lambda e:report['errors'].append(str(e)))
 if a.frontend:
  def serve(route,request):
   path=urlparse(request.url).path;f=a.frontend/('index.html' if path=='/' else path.lstrip('/'))
   if (path=='/' or path.startswith('/app/')) and f.is_file():route.fulfill(body=f.read_bytes(),content_type='text/html' if path=='/' else 'application/javascript' if path.endswith('.js') else 'text/css' if path.endswith('.css') else 'application/json')
   else:route.continue_()
  page.route('https://sigong.rabbion.info/**',serve)
 try:
  page.goto('https://sigong.rabbion.info/',wait_until='domcontentloaded');page.locator('#enter').click()
  page.wait_for_function('window.__sigong?.chronicleScene.assets?.scenery.stats.ready&&!__sigong.chronicleScene.chronicle.loading&&!__sigong.engine.fly')
  page.evaluate('__sigong.engine.setQuality("medium",{manual:true,persist:false})')
  for year in [-2000,-1000,200,600,1100,1500,1880,1900,1930,1960,1975,2020]:
   page.locator('#historyYear').fill(str(year));page.locator('#historyYear').press('Enter')
   page.wait_for_function('y=>{const s=__sigong.chronicleScene;return s.chronicle.year===y&&!s.chronicle.loading&&s.assets.scenery.stats.ready&&s.assets.scenery.stats.year===y}',arg=year)
   for view in (['overview','north','central','south'] if year in [600,1500,1960] else ['overview']):
    page.evaluate('''view=>{const {world:w,engine:e,chronicleScene:c}=__sigong;e.fly=null;e.controls.target.copy(w.center);e.camera.position.copy(w.center).add(w.center.clone().set(0,900,900));e.controls.update();if(view==='overview')w.frame(e);else {const sites=c.assets.scenery.sites.filter(s=>c.assets.scenery.available(s)&& (view==='south'?s.latitude<36:view==='central'?(s.latitude>=36&&s.latitude<=39):s.latitude>39)).sort((a,b)=>a.seed-b.seed);const s=sites[0]||c.assets.scenery.sites[0];e.flyTo(w.center.clone().set(s.x,w.surfaceAt(s.x,s.z),s.z),90,300);}}''',view)
    page.wait_for_function('!__sigong.engine.fly');page.wait_for_timeout(1000)
    row=page.evaluate('''async()=>{const frames=[];let last,start;await new Promise(resolve=>{function tick(t){start??=t;if(last)frames.push(t-last);last=t;if(t-start<2000)requestAnimationFrame(tick);else resolve();}requestAnimationFrame(tick);});const {world:w,engine:e,chronicleScene:c}=__sigong,s=c.assets.scenery;const visible=s.landscapeCells||(s.cells||[]).filter(c=>c.group.visible&&c.recipes);let inFrame=0,screenLarge=0;for(const cell of visible){const p=e.controls.target.clone().set(cell.site.x,w.surfaceAt(cell.site.x,cell.site.z),cell.site.z).project(e.camera);if(Math.abs(p.x)<=1&&Math.abs(p.y)<=1&&p.z>=-1&&p.z<=1){inFrame++;const q=e.controls.target.clone().set(cell.site.x+cell.site.radius,w.surfaceAt(cell.site.x,cell.site.z),cell.site.z).project(e.camera);if(Math.abs(q.x-p.x)*1256/2>=3)screenLarge++;}}return {bounds:w.bounds,camera:e.camera.position.toArray(),target:e.controls.target.toArray(),scenery:{...s.stats},landscape:s.landscapeCells?{cells:s.landscapeCells.length,houses:s.landscapeCells.reduce((n,c)=>n+c.layout.houses.length,0),fields:s.landscapeCells.reduce((n,c)=>n+c.layout.fields.length,0),roads:s.landscapeCells.reduce((n,c)=>n+c.layout.roads.length,0),types:[...new Set(s.landscapeCells.map(c=>c.site.kind||c.site.type))],overviewVisible:s.overview?.visible,detailCells:s.detailCache?.size,visibleDetails:s.detailCache?[...s.detailCache.values()].filter(c=>c.group.visible).length:0}:null,plan:s.plan?{keys:Object.keys(s.plan),stats:s.plan.stats,year:s.plan.year,period:s.plan.period,regions:Array.isArray(s.plan.regions)?s.plan.regions.length:undefined,sites:Array.isArray(s.plan.sites)?s.plan.sites.length:undefined}:null,regions:s.regions?{keys:Object.keys(s.regions),stats:s.regions.stats,visible:s.regions.group?.visible,count:Array.isArray(s.regions)?s.regions.length:undefined}:null,assetKeys:Object.keys(c.assets),landuse:c.assets.landuse?.stats,worldKeys:Object.keys(w),namedRows:c.assets.rows.length,visibleVillages:visible.length,inFrameVillages:inFrame,villagesRadiusAtLeast3px:screenLarge,modelKinds:[...new Set(visible.flatMap(c=>c.models||c.layout?.houses||[]).map(m=>m.archetype))],fps:frames.length*1000/frames.reduce((a,b)=>a+b,0),stats:{...e.stats}};}''')
    row.update(year=year,view=view);report['views'].append(row)
    data=page.evaluate('()=>{const e=__sigong.engine;e.composer.render();return e.renderer.domElement.toDataURL("image/png");}')
    (a.out/f'{year}-{view}-canvas.png').write_bytes(base64.b64decode(data.split(',')[1]));page.screenshot(path=str(a.out/f'{year}-{view}-ui.png'))
    print(json.dumps(row),flush=True)
 except Exception as e:report['failure']=str(e);raise
 finally:
  (a.out/'report.json').write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf8');b.close()
