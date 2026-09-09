"""Exercise sourced forts, local conflicts and excavations through the real API."""
import argparse,json
from pathlib import Path
from playwright.sync_api import sync_playwright
p=argparse.ArgumentParser(description=__doc__)
for k in ['base','browser']:p.add_argument('--'+k,required=True)
p.add_argument('--out',type=Path,required=True)
a=p.parse_args();a.out.mkdir(parents=True,exist_ok=True)
r={'base':a.base,'checks':[],'errors':[]}
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path=a.browser)
 page=b.new_page(viewport={'width':1440,'height':1000});page.set_default_timeout(120000)
 page.on('pageerror',lambda e:r['errors'].append(str(e)))
 def check(name,ok,detail=None):
  row={'name':name,'pass':bool(ok),'detail':detail};r['checks'].append(row)
  print(json.dumps(row,ensure_ascii=False),flush=True);assert ok,row
 def select(year,sid):
  page.locator('#historyYear').fill(str(year));page.locator('#historyYear').press('Enter')
  page.wait_for_function('(n)=>__sigong.chronicleScene.assets.plan.year===n&&!__sigong.engine.fly',arg=year)
  value=page.locator('#sceneDestination option').evaluate_all('(rows,id)=>rows.find(o=>o.dataset.sceneRow===id)?.value',sid)
  assert value,sid
  page.locator('#sceneDestination').select_option(value);page.wait_for_function('!__sigong.engine.fly')
  rows=page.evaluate('id=>__sigong.chronicleScene.assets.rows.filter(r=>r.sceneId===id).map(r=>({archetype:r.archetype,sceneKind:r.sceneKind,kind:r.kind,entityId:r.entityId,action:r.action}))',sid)
  page.screenshot(path=str(a.out/(str(year)+'.png')))
  check(str(year)+' recipes build',page.evaluate('__sigong.chronicleScene.assets.stats.dropped.length===0'))
  return rows
 try:
  page.goto(a.base,wait_until='domcontentloaded');page.locator('#enter').click()
  page.wait_for_function('window.__sigong?.chronicleScene.assets?.scenery.stats.ready&&!__sigong.chronicleScene.chronicle.loading')
  coverage=page.evaluate('''async()=>{const {contextAt}=await import('./app/chronicle.js');const {planChronicleAssets}=await import('./app/chronicle-asset-plan.js');
   const s=__sigong.chronicleScene,w=s.world,d=s.chronicle.data;return w.scenePackets.filter(p=>p.researchCollection==='scenes-135').map(p=>{
    const event=planChronicleAssets(contextAt({...d,scenePackets:w.scenePackets},p.startYear),d,[],w.places,w.scenePackets,w.coordinateRegistry).events.find(e=>e.id===p.id);
    return {id:p.id,found:!!event,located:!!event?.scenePlace};});}''')
  check('All 20 imported scenes use actual available claims',len(coverage)==20 and all(x['found'] for x in coverage),coverage)
  check('Only the two unresolved water locations remain unplaced',sum(x['located'] for x in coverage)==18,coverage)
  rows=select(470,'scene-syj135-samnyeonsanseong-chukjo-470')
  check('Fort construction uses walls and work props',any(x['sceneKind']=='fortress' for x in rows) and any(x['archetype']=='fort_wall_side' for x in rows) and any(x['archetype']=='handcart' for x in rows),rows)
  rows=select(647,'scene-syj135-myeonghwalsanseong-bidam-647')
  check('Occupation is a fort scene without invented attacking soldiers',any(x['sceneKind']=='fortress' for x in rows) and all(x['action']!='attacking' for x in rows))
  rows=select(642,'scene-syj135-daeyaseong-642')
  check('Daeya shows a siege and a warehouse',any(x['sceneKind']=='siege' for x in rows) and any(x['archetype']=='rural_store' for x in rows),rows)
  fires=page.evaluate("(()=>{const g=__sigong.chronicleScene.assets.group;const fires=[];g.traverse(o=>{if(o.name==='event-fire')fires.push(o.parent.userData.sceneId);});return fires.filter(id=>id==='scene-syj135-daeyaseong-642');})()")
  check('The source warehouse fire produces one fire group',len(fires)==1,fires)
  rows=select(927,'scene-syj135-gongsan-927')
  check('Gongsan exposes named key participants',{'person-encykorea-gyeonhwon','person-encykorea-goryeo-taejo'}.issubset({x['entityId'] for x in rows if x['kind']=='person'}),rows)
  rows=select(1975,'scene-syj135-songgukri-josa-1975-1987')
  check('Modern archaeological investigation uses dig grids, not an occupied prehistoric town',any(x['archetype']=='dig_site' for x in rows) and not any(x['archetype'] in ['palace','civic_hall','korean_house','market'] for x in rows),rows)
  rows=select(1906,'scene-syj135-hongjuseong-1906')
  check('Hongju uses modern soldiers and its named commander',any(x['archetype']=='rifle_soldier' for x in rows) and any(x['entityId']=='person-syj135-min-jongsik' and x['kind']=='person' for x in rows),rows)
  check('No browser errors',not r['errors'],r['errors'])
 finally:
  (a.out/'report.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n',encoding='utf8');b.close()
