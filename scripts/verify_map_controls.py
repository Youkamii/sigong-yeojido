"""Exercise actual year entry, focused people/events and display preferences."""
import argparse,json
from pathlib import Path
from playwright.sync_api import sync_playwright
p=argparse.ArgumentParser(description=__doc__);p.add_argument('--base',required=True);p.add_argument('--browser',required=True);p.add_argument('--out',type=Path,required=True)
a=p.parse_args();a.out.mkdir(parents=True,exist_ok=True);r={'base':a.base,'checks':[],'errors':[]}
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path=a.browser);page=b.new_page(viewport={'width':1440,'height':1000});page.set_default_timeout(120000)
 page.on('pageerror',lambda e:r['errors'].append(str(e)))
 def check(name,ok,detail=None):
  row={'name':name,'pass':bool(ok),'detail':detail};r['checks'].append(row);print(json.dumps(row,ensure_ascii=False),flush=True);assert ok,row
 def ready():page.wait_for_function('window.__sigong?.chronicleScene.assets?.scenery.stats.ready&&!window.__sigong.chronicleScene.chronicle.loading')
 def year(n,button=False):
  page.locator('#historyYear').fill(str(n))
  if button:page.locator('[data-go-year]').click()
  else:page.locator('#historyYear').press('Enter')
  page.wait_for_function('(n)=>window.__sigong.chronicleScene.assets.plan.year===n&&!window.__sigong.engine.fly',arg=n)
 try:
  page.goto(a.base,wait_until='domcontentloaded');page.locator('#enter').click();ready()
  year(1700,True);check('A visible year input and Go button move to 1700',page.locator('#sceneContext h2').inner_text()=='1700년')
  year(-500);check('A negative year entered with Enter navigates BCE',page.evaluate('window.__sigong.chronicleScene.assets.plan.year===-500'))
  year(1593);before=page.evaluate('window.__sigong.engine.controls.target.toArray()')
  page.locator('#sceneDestination').select_option('person-encykorea-yi-sunsin');page.wait_for_function('!window.__sigong.engine.fly')
  check('Selecting Yi retains the historical activity zoom',before!=page.evaluate('window.__sigong.engine.controls.target.toArray()') and page.locator('#sceneFocus').is_visible())
  text=page.locator('#sceneFocus').inner_text();check('The focused map shows the event and its key person together','한산도' in text and '이순신' in text,text)
  page.locator('#sceneFocus .focus-heading button').click();page.wait_for_function('!window.__sigong.engine.fly')
  check('The focus event opens its actual detail while retaining people',page.locator('#sceneFocus .focus-people button').count()>0 and '한산도' in page.locator('#chronicle h2').inner_text())
  page.screenshot(path=str(a.out/'focused-scene.png'))
  page.locator('#mapDisplay summary').click()
  for name in ['people','events','regions','geography','scenery','forest','paths']:page.locator('[data-map-display='+name+']').uncheck()
  page.wait_for_timeout(150)
  check('Name switches remove every map label',page.locator('#sceneEvents button:not([hidden]),#sceneGeography button:not([hidden])').count()==0)
  check('Landscape switches hide decorative and forest groups',page.evaluate('!window.__sigong.chronicleScene.assets.scenery.group.visible&&!window.__sigong.chronicleScene.assets.forest.visible'))
  year(1500);check('Display preferences survive a year change',page.evaluate('!window.__sigong.chronicleScene.assets.scenery.group.visible&&!window.__sigong.chronicleScene.assets.forest.visible'))
  check('Old focused people and event disappear on year change',not page.locator('#sceneFocus').is_visible())
  page.reload(wait_until='domcontentloaded');page.locator('#enter').click();ready()
  check('Display choices survive a page reload',page.evaluate('Object.values(window.__sigong.chronicleScene.display).every(v=>v===false)') and not page.locator('[data-map-display=regions]').is_checked())
  page.locator('#mapDisplay summary').click()
  for name in ['people','events','regions','geography','scenery','forest','paths']:page.locator('[data-map-display='+name+']').check()
  page.set_viewport_size({'width':480,'height':900})
  page.wait_for_timeout(200)
  check('Mobile exposes year input, Go and display choices',page.locator('#historyYear').is_visible() and page.locator('[data-go-year]').is_visible() and page.locator('#mapDisplay').is_visible())
  hud=page.locator('#sceneContext').bounding_box();nav=page.locator('.geography-navigation').bounding_box()
  check('Expanded mobile display controls do not overlap the geography menu',nav['y']>=hud['y']+hud['height']+7)
  page.screenshot(path=str(a.out/'controls-mobile.png'))
  check('No browser errors',not r['errors'],r['errors'])
 finally:
  (a.out/'report.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n',encoding='utf8');b.close()
