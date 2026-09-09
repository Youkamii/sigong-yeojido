"""Check inferred fort backgrounds and their real dated records in the public viewer."""
import argparse,json
from pathlib import Path
from playwright.sync_api import sync_playwright

p=argparse.ArgumentParser(description=__doc__)
for key in ['base','browser']:p.add_argument('--'+key,required=True)
p.add_argument('--out',type=Path,required=True)
a=p.parse_args();a.out.mkdir(parents=True,exist_ok=True)
r={'base':a.base,'checks':[],'errors':[],'failedRequests':[]}
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path=a.browser)
 page=b.new_page(viewport={'width':1440,'height':1000});page.set_default_timeout(120000)
 page.on('pageerror',lambda e:r['errors'].append(str(e)))
 page.on('requestfailed',lambda req:r['failedRequests'].append({'path':req.url.split('?')[0],'error':req.failure}))
 def check(name,ok,detail=None):
  row={'name':name,'pass':bool(ok),'detail':detail};r['checks'].append(row)
  print(json.dumps(row,ensure_ascii=False),flush=True);assert ok,row
 def year(n):
  page.locator('#historyYear').fill(str(n));page.locator('#historyYear').press('Enter')
  page.wait_for_function('(n)=>__sigong.chronicleScene.assets.plan.year===n&&!__sigong.engine.fly',arg=n)
 def sites():
  return page.evaluate('__sigong.chronicleScene.assets.rows.filter(r=>r.siteBackground&&r.kind==="event").map(r=>({id:r.entityId,kind:r.sceneKind,land:__sigong.chronicleScene.world.contains(r.position.x,r.position.z)}))')
 try:
  page.goto(a.base,wait_until='domcontentloaded');page.locator('#enter').click()
  page.wait_for_function('window.__sigong?.chronicleScene.assets?.scenery.stats.ready&&!__sigong.chronicleScene.chronicle.loading')
  year(500);rows=sites()
  check('Two forts remain between dated events on actual land',len(rows)==2 and all(x['land'] and x['kind']=='fortress' for x in rows),rows)
  check('Inferred sites do not become historical events',page.evaluate('__sigong.chronicleScene.chronicle.context.allEvents.every(e=>!e.id.startsWith("background-"))'))
  page.locator('#sceneDestination').select_option('syj135-place-samnyeonsanseong');page.wait_for_function('!__sigong.engine.fly')
  check('Selecting the fort stays at 500 and explains the display inference',page.locator('#historyYear').input_value()=='500' and '추정' in page.locator('#sceneFocus').inner_text() and '확정 기록은 아니며' in page.locator('.activity-summary').inner_text())
  check('Fort is a Place with three real event links',page.locator('.context-kicker').inner_text()=='장소' and page.locator('.activity-episodes [data-chronicle-entity]').count()==3)
  check('No construction workers or invented named participants between events',page.evaluate('''()=>{const s=__sigong.chronicleScene;return s.assets.rows.filter(r=>r.sceneId==='background-syj135-place-samnyeonsanseong').every(r=>r.kind!=='person'&&r.archetype!=='groundbreaking');}'''))
  page.screenshot(path=str(a.out/'samnyeon-500.png'))
  page.locator('.activity-episodes [data-chronicle-entity="syj135-event-samnyeonsanseong-gaechuk-486"]').click()
  page.wait_for_function('__sigong.chronicleScene.assets.plan.year===486&&!__sigong.engine.fly')
  check('A real repair record opens its year and replaces the inferred fort',not any(x['id']=='syj135-place-samnyeonsanseong' for x in sites()) and page.evaluate('__sigong.chronicleScene.assets.rows.some(r=>r.sceneId==="scene-syj135-samnyeonsanseong-gaechuk-486"&&r.archetype==="groundbreaking")'))
  year(500);page.locator('#mapDisplay summary').click();page.locator('[data-map-display="scenery"]').uncheck()
  check('Scenery toggle removes inferred forts',len(sites())==0)
  page.locator('[data-map-display="scenery"]').check()
  check('Scenery toggle restores both forts',len(sites())==2)
  year(648);check('Myeonghwal is hidden after its last linked record',len(sites())==1 and sites()[0]['id']=='syj135-place-samnyeonsanseong')
  year(661);check('No inferred fort beyond the display coverage',len(sites())==0)
  year(500);page.evaluate('document.getElementById("noSources").click()')
  page.wait_for_function('!__sigong.chronicleScene.chronicle.loading&&__sigong.chronicleScene.chronicle.data.claims.length===0')
  check('Disabling sources removes inferred forts',len(sites())==0)
  check('No browser errors',not r['errors'],r['errors'])
 finally:
  if not r['checks']:
   r['loadState']=page.evaluate('({text:document.body.innerText.slice(0,1200),loaded:!!window.__sigong})')
  (a.out/'report.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n',encoding='utf8');b.close()
