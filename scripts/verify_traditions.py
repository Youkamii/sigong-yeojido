"""Verify typed narratives, on-map selection, record time and source toggles."""
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
 def select(id):
  value=page.locator('#sceneDestination option').evaluate_all('(rows,id)=>rows.find(o=>o.dataset.sceneRow===id)?.value',id)
  assert value,id
  page.locator('#sceneDestination').select_option(value);page.wait_for_function('!__sigong.engine.fly')
 try:
  page.goto(a.base,wait_until='domcontentloaded');page.locator('#enter').click()
  page.wait_for_function('window.__sigong?.chronicleScene.assets?.scenery.stats.ready&&!__sigong.chronicleScene.chronicle.loading')
  state=page.evaluate('''()=>{const s=__sigong.chronicleScene;return {
    narratives:s.chronicle.data.entities.filter(e=>e.type==='Narrative').map(e=>e.id),
    rows:s.assets.rows.filter(r=>r.narrative&&r.kind==='event').map(r=>({id:r.id,land:s.world.contains(r.position.x,r.position.z)})),
    claims:s.chronicle.data.claims.filter(c=>c.id.startsWith('claim-scenes-136-')).length};}''')
  check('All nine typed narratives and 67 actual claims are available',len(state['narratives'])==9 and state['claims']==67,state)
  check('Nine story markers are on land',len(state['rows'])==9 and all(x['land'] for x in state['rows']),state['rows'])
  motifs=page.evaluate('__sigong.chronicleScene.assets.rows.filter(r=>r.narrative&&r.kind==="event").map(r=>r.archetype)')
  check('Nine stories have distinct primary motifs',len(set(motifs))==9,motifs)
  check('Story layer explains that it is separate from the event year','연도별 사건과 별도' in page.locator('[data-map-display="traditions"]').locator('..').inner_text())
  year=page.locator('#historyYear').input_value()
  select('nar-syj136-arang')
  check('Undated Arang can be selected without changing the year',page.locator('#historyYear').input_value()==year and '채록·간행 시기 미상' in page.locator('.narrative-times').inner_text())
  check('The focused story is explicitly a narrative','설화·전승' in page.locator('.context-kicker').inner_text() and '설화·전승의 무대' in page.locator('#sceneFocus').inner_text())
  check('Story selection has places, people and evidence buttons',page.locator('[data-chronicle-claim]').count()>0 and '전승의 무대' in page.locator('#chronicle').inner_text() and '전승 속 등장인물' in page.locator('#chronicle').inner_text())
  page.screenshot(path=str(a.out/'arang.png'))
  select('nar-syj136-ondal')
  check('Ondal does not present the related book date as the legend recording date','전설의 기록 시기 미상' in page.locator('.narrative-times').inner_text())
  select('nar-syj136-gujibong')
  text=page.locator('.narrative-times').inner_text()
  check('Gujibong keeps story year 42 separate from the related document period','42년' in text and '1075' in text and '1084' in text,text)
  check('Story characters do not become on-site people at book publication',page.evaluate('''()=>{const s=__sigong.chronicleScene;return s.assets.rows.filter(r=>r.sceneId==='nar-syj136-gujibong').every(r=>r.kind!=='person');}'''))
  page.screenshot(path=str(a.out/'gujibong.png'))
  page.locator('[data-map-display="traditions"]').uncheck()
  check('Story toggle removes the models and navigation entries',page.evaluate('__sigong.chronicleScene.assets.rows.every(r=>!r.narrative)') and page.locator('#sceneDestination option').evaluate_all('rows=>rows.every(o=>!o.dataset.sceneRow?.startsWith("nar-"))'))
  page.locator('[data-map-display="traditions"]').check()
  check('Turning stories back on restores nine markers',page.evaluate('__sigong.chronicleScene.assets.rows.filter(r=>r.narrative&&r.kind==="event").length===9'))
  page.evaluate('document.getElementById("noSources").click()')
  page.wait_for_function('!__sigong.chronicleScene.chronicle.loading&&__sigong.chronicleScene.chronicle.data.claims.length===0')
  check('Disabling all sources also removes all narrative models',page.evaluate('__sigong.chronicleScene.assets.rows.every(r=>!r.narrative)'))
  page.evaluate('document.getElementById("allSources").click()')
  page.wait_for_function('!__sigong.chronicleScene.chronicle.loading&&__sigong.chronicleScene.assets.rows.filter(r=>r.narrative&&r.kind==="event").length===9')
  check('Restoring sources restores narrative evidence and markers',True)
  check('No browser errors',not r['errors'],r['errors'])
 finally:
  (a.out/'report.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n',encoding='utf8');b.close()
