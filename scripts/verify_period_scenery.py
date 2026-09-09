"""Exercise real era changes, display controls and disposal in a headless browser."""
import argparse,json,time
from pathlib import Path
from playwright.sync_api import sync_playwright
p=argparse.ArgumentParser(description=__doc__)
for k in ['base','browser']:p.add_argument('--'+k,required=True)
p.add_argument('--out',type=Path,required=True);a=p.parse_args();a.out.mkdir(parents=True,exist_ok=True)
r={'base':a.base,'checks':[],'errors':[],'periods':[]}
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path=a.browser)
 page=b.new_page(viewport={'width':1440,'height':1000});page.set_default_timeout(120000)
 page.on('pageerror',lambda e:r['errors'].append(str(e)))
 def check(name,ok,detail=None):
  row={'name':name,'pass':bool(ok),'detail':detail};r['checks'].append(row)
  print(json.dumps(row,ensure_ascii=False),flush=True);assert ok,row
 def year(n):
  start=time.monotonic();page.locator('#historyYear').fill(str(n));page.locator('#historyYear').press('Enter')
  page.wait_for_function('n=>{const a=__sigong.chronicleScene.assets;return a.plan.year===n&&a.scenery.stats.ready&&a.scenery.stats.year===n&&!__sigong.engine.fly}',arg=n)
  row=page.evaluate('''()=>{const s=__sigong.chronicleScene.assets.scenery;return {stats:{...s.stats},kinds:[...new Set(s.cells.flatMap(c=>c.models||[]).map(m=>m.archetype))],
   valid:s.cells.filter(c=>c.recipes).every(c=>c.period===s.period.id),tigers:s.cells.filter(c=>!c.recipes&&c.group.visible).length,
   fields:s.cells.filter(c=>c.group.getObjectByName('decorative-fields')?.visible).length};}''')
  row['seconds']=round(time.monotonic()-start,3);r['periods'].append(row);return row
 def screenshot(name):
  page.evaluate('''()=>{const {world:w,engine:e,chronicleScene:c}=__sigong,site=c.assets.scenery.sites.find(s=>s.latitude<37&&c.assets.scenery.available(s));
   e.flyTo(w.center.clone().set(site.x,w.surfaceAt(site.x,site.z),site.z),40,300);}''')
  page.wait_for_function('!__sigong.engine.fly');page.screenshot(path=str(a.out/(name+'.png')))
 try:
  page.goto(a.base,wait_until='domcontentloaded');page.locator('#enter').click()
  page.wait_for_function('window.__sigong?.chronicleScene.assets?.scenery.stats.ready&&!__sigong.chronicleScene.chronicle.loading')
  ancient=year(-2000);check('Early scenery excludes tiled houses, handcarts and rendered fields',ancient['fields']==0 and not any(k in ancient['kinds'] for k in ['korean_house','rural_cottage','handcart','farm_tractor']),ancient)
  bronze=year(-500);check('Early farming scenery uses low huts and small fields',bronze['fields']>0 and 'rural_hut' in bronze['kinds'],bronze);screenshot('early')
  traditional=year(1592);check('Traditional background contains varied houses and period figures',all(k in traditional['kinds'] for k in ['rural_cottage','korean_house','period_figure']) and traditional['tigers']>0,traditional);screenshot('traditional')
  before=page.evaluate('__sigong.chronicleScene.assets.scenery.stats.modelBuilds');year(1597)
  check('Scrubbing within an era reuses village geometry',before==page.evaluate('__sigong.chronicleScene.assets.scenery.stats.modelBuilds'))
  early=year(1960);check('Early modern countryside changes residents and omits roaming tigers',early['tigers']==0 and 'field_worker' in early['kinds'] and 'farm_tractor' not in early['kinds'],early)
  transition=year(1975);check('Roof conversion keeps old and new houses together',all(k in transition['kinds'] for k in ['rural_cottage','rural_metal','rural_tiled']) and 'farm_tractor' not in transition['kinds'],transition);screenshot('mixed-roofs')
  modern=year(2000);check('Later countryside includes varied modern roofs and farm machinery',modern['tigers']==0 and all(k in modern['kinds'] for k in ['rural_flat','rural_metal','farm_tractor']),modern);screenshot('modern')
  page.evaluate('''()=>{window.oldSceneryGeometries=[];const s=__sigong.chronicleScene.assets.scenery;for(const c of s.cells)if(c.detail)c.detail.traverse(o=>{if(o.geometry&&!oldSceneryGeometries.includes(o.geometry))oldSceneryGeometries.push(o.geometry);});window.sceneryDisposed=new Set();for(const g of oldSceneryGeometries)g.addEventListener('dispose',()=>sceneryDisposed.add(g));}''')
  year(1500);check('Era replacement releases all previous village geometries',page.evaluate('oldSceneryGeometries.length>0&&sceneryDisposed.size===oldSceneryGeometries.length'))
  page.evaluate('''async()=>{for(const n of [2000,-500,1975,552,2000]){__sigong.chronicleScene.chronicle.setYear(n);await new Promise(r=>setTimeout(r,20));}}''')
  page.wait_for_function('__sigong.chronicleScene.assets.scenery.stats.ready&&__sigong.chronicleScene.assets.scenery.stats.year===2000')
  check('Rapid era reversals finish only the final selection',page.evaluate('''()=>{const s=__sigong.chronicleScene.assets.scenery;return s.period.id==='mechanized'&&s.stats.period==='mechanized'&&s.cells.filter(c=>c.recipes).every(c=>c.period==='mechanized');}'''))
  page.evaluate('document.querySelector("[data-map-display=scenery]").click()');year(1500)
  check('Scenery toggle remains off during an era change',page.evaluate('!__sigong.chronicleScene.assets.scenery.group.visible'))
  page.evaluate('document.querySelector("[data-map-display=scenery]").click();document.querySelector("[data-map-display=paths]").click()');year(2000)
  check('Path toggle survives model replacement',page.evaluate('''()=>{const s=__sigong.chronicleScene.assets.scenery;let hidden=true;s.group.traverse(o=>{if(o.name==='scenery-lanes'&&o.visible)hidden=false;});return hidden&&s.group.visible;}'''))
  check('Historical evidence remains separate and every visible village stays outside active scenes',page.evaluate('''()=>{const a=__sigong.chronicleScene.assets,s=a.scenery;return !__sigong.chronicleScene.chronicle.data.claims.some(c=>c.id.startsWith('scenery-'))&&!a.picks.some(p=>p.userData.fanAssetId?.startsWith('scenery-'))&&s.cells.filter(c=>c.group.visible).every(c=>s.available(c.site));}'''))
  check('No browser errors',not r['errors'],r['errors'])
 finally:
  (a.out/'report.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n',encoding='utf8');b.close()
