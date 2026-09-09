"""Check action-specific compositions using the real historical API and renderer."""
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
 def scene(year,id):
  page.locator('#historyYear').fill(str(year));page.locator('#historyYear').press('Enter')
  page.wait_for_function('(n)=>__sigong.chronicleScene.assets.plan.year===n&&!__sigong.engine.fly',arg=year)
  value=page.locator('#sceneDestination option').evaluate_all('(rows,id)=>rows.find(o=>o.dataset.sceneRow===id)?.value',id)
  assert value,id
  page.locator('#sceneDestination').select_option(value);page.wait_for_function('!__sigong.engine.fly')
  rows=page.evaluate('id=>__sigong.chronicleScene.assets.rows.filter(r=>r.sceneId===id).map(r=>({archetype:r.archetype,kind:r.kind,entityId:r.entityId,sceneKind:r.sceneKind,action:r.action,position:r.position.toArray()}))',id)
  page.screenshot(path=str(a.out/(str(year)+'.png')))
  check(str(year)+' builds all recipes',page.evaluate('__sigong.chronicleScene.assets.stats.dropped.length===0'))
  return rows
 try:
  page.goto(a.base,wait_until='domcontentloaded');page.locator('#enter').click()
  page.wait_for_function('window.__sigong?.chronicleScene.assets?.scenery.stats.ready&&!__sigong.chronicleScene.chronicle.loading')
  rows=scene(552,'scene-syj128-gugwon-ureuk-552')
  check('Music teaching shows two instruments and only the four recorded participants',sum(x['archetype']=='string_instrument' for x in rows)==2 and {x['entityId'] for x in rows if x['kind']=='person'}=={'person-encykorea-ureuk','person-encykorea-gyego','person-encykorea-beopji','person-encykorea-mandeok'} and len(rows)==6,rows)
  check('The learners have separate positions and the dance learner moves',len({tuple(x['position']) for x in rows if x['kind']=='person'})==4 and any(x['entityId']=='person-encykorea-mandeok' and x['action']=='walking' for x in rows))
  rows=scene(1795,'scene-syj128-kim-mandeok-jeju-1795')
  check('Relief uses grain, a cart and recipients without invented shipwrecks',sum(x['archetype']=='grain_stack' for x in rows)==2 and any(x['archetype']=='handcart' for x in rows) and not any(x['archetype'] in ['ship','motor_ship','korean_hall'] for x in rows),rows)
  rows=scene(1962,'scene-mod128-ulsan-gigongsik-1962')
  check('Groundbreaking does not display a completed factory or invented attendees',len(rows)==1 and rows[0]['archetype']=='groundbreaking',rows)
  rows=scene(1971,'scene-mod128-gori-npp1-1971-1978')
  check('Construction starts with an unfinished frame',any(x['archetype']=='building_frame' for x in rows) and not any(x['archetype']=='power_facility' for x in rows),rows)
  rows=scene(1978,'scene-mod128-gori-npp1-1971-1978')
  check('The completion year replaces the frame with a symbolic power facility',any(x['archetype']=='power_facility' for x in rows) and not any(x['archetype']=='building_frame' for x in rows),rows)
  check('No browser errors',not r['errors'],r['errors'])
 finally:
  (a.out/'report.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n',encoding='utf8');b.close()
