"""Check default map labels and dated capitals on the real 3D world."""
import argparse,json
from pathlib import Path
from playwright.sync_api import sync_playwright
p=argparse.ArgumentParser(description=__doc__)
for k in ['base','browser']:p.add_argument('--'+k,required=True)
p.add_argument('--out',type=Path,required=True);a=p.parse_args();a.out.mkdir(parents=True,exist_ok=True)
r={'base':a.base,'checks':[],'errors':[]}
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path=a.browser);page=b.new_page(viewport={'width':1440,'height':1000});page.set_default_timeout(120000)
 page.on('pageerror',lambda e:r['errors'].append(str(e)))
 def check(name,ok,detail=None):
  row={'name':name,'pass':bool(ok),'detail':detail};r['checks'].append(row);print(json.dumps(row,ensure_ascii=False),flush=True);assert ok,row
 def year(n):
  page.locator('#historyYear').fill(str(n));page.locator('#historyYear').press('Enter')
  page.wait_for_function('n=>__sigong.chronicleScene.assets.plan.year===n&&!__sigong.engine.fly',arg=n)
  page.locator('#wholeMapBtn').click();page.wait_for_function('!__sigong.engine.fly')
 def capitals():return page.evaluate('__sigong.world.geography.markers.filter(m=>m.row.capital).map(m=>m.row.label).join(" ")')
 try:
  page.goto(a.base,wait_until='domcontentloaded');page.locator('#enter').click();page.wait_for_function('window.__sigong?.chronicleScene.assets?.scenery.stats.ready&&!__sigong.chronicleScene.chronicle.loading')
  year(600)
  check('Default geography shows only key landmarks and contemporary capitals',page.evaluate('__sigong.world.geography.markers.filter(m=>!m.button.hidden).every(m=>m.important)'))
  check('Sabi and Silla capital remain while the earlier Baekje capital is absent','사비' in capitals() and '웅진' not in capitals(),capitals())
  check('At least one capital name is actually visible on the overview',page.evaluate('__sigong.world.geography.markers.some(m=>m.row.capital&&!m.button.hidden)'))
  before=page.evaluate('__sigong.world.geography.markers.filter(m=>!m.button.hidden).length')
  page.locator('#mapDisplay summary').click();page.locator('[data-map-display=morePlaces]').check()
  check('Other place and peak names can be expanded',page.evaluate('__sigong.world.geography.markers.some(m=>!m.important&&!m.button.hidden)'))
  page.locator('[data-map-display=morePlaces]').uncheck();page.locator('#mapDisplay summary').click()
  page.screenshot(path=str(a.out/'capitals-600.png'))
  year(1240);check('The Goryeo capital follows relocation to Ganghwa','강화' in capitals() and '개경' not in capitals(),capitals())
  year(1300);check('The capital returns to Gaegyeong','개경' in capitals() and '강화' not in capitals(),capitals())
  year(1500);check('Hanseong keeps its historical name','한성' in capitals() and '서울특별시' not in capitals(),capitals())
  year(1911);check('Expired Hanseong capital is removed','한성' not in capitals(),capitals())
  page.set_viewport_size({'width':480,'height':900});year(600)
  check('Mobile defaults still omit minor peaks',page.evaluate('__sigong.world.geography.markers.filter(m=>!m.button.hidden).every(m=>m.important)'))
  page.screenshot(path=str(a.out/'capitals-mobile.png'))
  check('No browser errors',not r['errors'],r['errors'])
 finally:
  (a.out/'report.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n',encoding='utf8');b.close()
