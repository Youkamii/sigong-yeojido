"""Check each new locality scene and corrected placement on the real viewer."""
import argparse,json
from pathlib import Path
from playwright.sync_api import sync_playwright

p=argparse.ArgumentParser(description=__doc__)
for name in ['base','browser']:p.add_argument('--'+name,required=True)
p.add_argument('--out',type=Path,required=True);a=p.parse_args();a.out.mkdir(parents=True,exist_ok=True)
r={'base':a.base,'checks':[],'scenes':[],'errors':[]}
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path=a.browser)
 page=b.new_page(viewport={'width':1440,'height':1000});page.set_default_timeout(120000)
 page.on('pageerror',lambda e:r['errors'].append(str(e)))
 def check(name,ok,detail=None):
  row={'name':name,'pass':bool(ok),'detail':detail};r['checks'].append(row);print(json.dumps(row,ensure_ascii=False),flush=True);assert ok,row
 def year(n):
  page.locator('#historyYear').fill(str(n));page.locator('#historyYear').press('Enter')
  page.wait_for_function('(n)=>__sigong.chronicleScene.assets.plan.year===n&&!__sigong.engine.fly',arg=n)
 def select(id):
  value=page.locator('#sceneDestination option').evaluate_all('(rows,id)=>rows.find(o=>o.dataset.sceneRow===id)?.value',id)
  assert value,id
  page.locator('#sceneDestination').select_option(value);page.wait_for_function('!__sigong.engine.fly')
 try:
  page.goto(a.base,wait_until='domcontentloaded');page.locator('#enter').click()
  page.wait_for_function('window.__sigong?.chronicleScene.assets?.scenery.stats.ready&&!__sigong.chronicleScene.chronicle.loading')
  packets=page.evaluate('__sigong.world.scenePackets.filter(s=>s.researchCollection==="scenes-128").map(s=>({id:s.id,year:s.startYear,title:s.title,coordinate:!!s.place&&Number.isFinite(s.place.lon)&&Number.isFinite(s.place.lat)}))')
  check('All 48 imported locality packets are served',len(packets)==48)
  newclaims=page.evaluate('__sigong.chronicleScene.chronicle.data.claims.filter(c=>c.id.startsWith("claim-scenes-128-")).length')
  check('New historical claims are available through the real API',newclaims>=260,newclaims)
  for s in packets:
   year(s['year'])
   row=page.evaluate('''id=>{const c=__sigong.chronicleScene,a=c.assets,e=a.plan.events.find(e=>e.id===id);return {id,year:a.plan.year,planned:!!e,coordinate:!!e?.scenePlace,
    rows:a.rows.filter(r=>r.sceneId===id).length,located:a.rows.some(r=>r.kind==='event'&&r.sceneId===id),dropped:a.stats.dropped,
    listed:c.chronicle.context.allEvents.some(e=>e.sceneId===id),unlocated:a.unlocated.some(e=>e.id===id)};}''',s['id'])
   r['scenes'].append(row)
   assert row['planned'] and row['listed'] and not row['dropped'],row
   assert row['coordinate']==s['coordinate'] and row['located']==s['coordinate'],row
  check('Every new scene is discoverable; only the four known missing locations remain unplaced',sum(s['located'] for s in r['scenes'])==44,{'located':44,'unlocated':[s['id'] for s in r['scenes'] if not s['located']]})
  for n,id in [(470,'event-syj128-naengsuri-503'),(550,'event-syj128-daegu-ojak')]:
   year(n);check(str(n)+' does not activate a scene between alternative candidate dates',page.evaluate('id=>!__sigong.chronicleScene.assets.plan.events.some(e=>e.entityId===id)',id))
  year(503);select('scene-syj128-pohang-naengsuri-503')
  check('The map identifies the Naengsuri discovery-region assumption',page.evaluate('__sigong.chronicleScene.assets.rows.some(r=>r.sceneId==="scene-syj128-pohang-naengsuri-503"&&r.placementLabel?.includes("원래 위치 미상"))'))
  for n,id,name in [(552,'scene-syj128-gugwon-ureuk-552','ureuk-552'),(1415,'scene-ej-byeokgolje-1415','byeokgolje-1415'),(1795,'scene-syj128-kim-mandeok-jeju-1795','kim-mandeok-1795')]:
   year(n);select(id);page.screenshot(path=str(a.out/(name+'.png')))
   if n==552:
    people=page.evaluate('id=>__sigong.chronicleScene.assets.rows.filter(r=>r.sceneId===id&&r.kind==="person").map(r=>r.entityId)',id)
    check('Ureuk and his three learners appear together at Gugwon',set(['person-encykorea-ureuk','person-encykorea-gyego','person-encykorea-beopji','person-encykorea-mandeok']).issubset(people),people)
   if n==1415:check('The 1415 repair has working figures and a handcart',page.evaluate('id=>__sigong.chronicleScene.assets.rows.some(r=>r.sceneId===id&&r.archetype==="handcart")',id))
  for n,id in [(1894,'event-encykorea-donghak-nongmin-1894'),(1987,'event-encykorea-park-jongchul-torture-1987'),(1919,'event-kpg-establishment-1919'),(1932,'event-encykorea-hongkou-uigeo-1932')]:
   year(n)
   row=page.evaluate('''id=>{const a=__sigong.chronicleScene.assets,e=a.plan.events.find(e=>e.entityId===id);return {located:a.rows.some(r=>r.kind==='event'&&r.entityId===id),reference:e?.locationReference};}''',id)
   check(str(n)+' links its researched place without moving to an unrelated city',row['located'],row)
  check('No browser errors',not r['errors'],r['errors'])
 finally:
  (a.out/'report.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n',encoding='utf8');b.close()
