"""Verify time-dependent territory masks on the real terrain renderer."""
import argparse,json
from pathlib import Path
from playwright.sync_api import sync_playwright
p=argparse.ArgumentParser(description=__doc__)
for k in ['base','browser']:p.add_argument('--'+k,required=True)
p.add_argument('--out',type=Path,required=True);a=p.parse_args();a.out.mkdir(parents=True,exist_ok=True)
r={'base':a.base,'checks':[],'errors':[],'periods':[]}
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path=a.browser);page=b.new_page(viewport={'width':1440,'height':1000});page.set_default_timeout(120000)
 page.on('pageerror',lambda e:r['errors'].append(str(e)))
 page.on('console',lambda m:r['errors'].append(m.text) if m.type=='error' and ('WebGL' in m.text or 'Shader' in m.text) else None)
 def check(name,ok,detail=None):
  row={'name':name,'pass':bool(ok),'detail':detail};r['checks'].append(row);print(json.dumps(row,ensure_ascii=False),flush=True);assert ok,row
 def year(n):
  page.locator('#historyYear').fill(str(n));page.locator('#historyYear').press('Enter')
  page.wait_for_function('n=>__sigong.chronicleScene.assets.plan.year===n&&__sigong.world.territories.stats.year===n&&!__sigong.engine.fly',arg=n)
  row=page.evaluate('''()=>{const t=__sigong.world.territories;return {year:t.year,redraws:t.stats.redraws,features:t.features.map(f=>({id:f.id,name:f.properties.label,start:f.properties.validFrom,end:f.properties.validTo})),
   borders:t.group.children.length,landColorPixels:t.context.getImageData(0,0,1024,1024).data.filter((n,i)=>i%4===3&&n>0).length};}''');r['periods'].append(row);return row
 try:
  page.goto(a.base,wait_until='domcontentloaded');page.locator('#enter').click();page.wait_for_function('window.__sigong?.chronicleScene.assets?.scenery.stats.ready&&!__sigong.chronicleScene.chronicle.loading')
  for n in [500,550,555,600,700,1240,1500,1952]:
   row=year(n);check(str(n)+' uses only contemporaneous territory records',bool(row['features']) and all(f['start']<=n<=f['end'] for f in row['features']) and row['borders']==len(row['features']) and row['landColorPixels']>0,row)
   if n in [500,600,700]:
    page.locator('#wholeMapBtn').click();page.wait_for_function('!__sigong.engine.fly');page.screenshot(path=str(a.out/(str(n)+'.png')))
  silla=[next((f['id'] for f in row['features'] if '신라' in f['name']),None) for row in r['periods'][:5]]
  check('Silla territorial expansion changes the displayed mask',len(set(silla))==5,silla)
  late=year(670);check('Goguryeo is not displayed after its documented fall',not any('고구려' in f['name'] for f in late['features']))
  check('Known approximation limits are visible without opening a source panel',page.locator('#territoryNote').is_visible())
  before=year(1500);after=year(1501);check('An unchanged historical outline is reused',before['redraws']==after['redraws'])
  page.locator('#mapDisplay summary').click();page.locator('[data-map-display=territories]').uncheck()
  check('Territory toggle removes both tint and boundaries',page.evaluate('__sigong.world.territories.uniforms.territoryEnabled.value===0&&!__sigong.world.territories.group.visible&&document.querySelector("#territoryLegend").hidden'))
  page.locator('[data-map-display=territories]').check();page.locator('#mapDisplay summary').click()
  gap=year(-500);check('Missing territory years are not filled with present-day borders',not gap['features'] and gap['landColorPixels']==0)
  year(600);page.set_viewport_size({'width':480,'height':900});page.locator('#wholeMapBtn').click();page.wait_for_function('!__sigong.engine.fly');page.screenshot(path=str(a.out/'mobile.png'))
  check('Mobile map retains the selected territory and available controls',page.locator('#territoryLegend').is_visible() and page.locator('#wholeMapBtn').is_visible())
  page.locator('#sourcesBtn').click();page.locator('#noSources').click();page.wait_for_function('__sigong.world.territories.features.length===0')
  check('Empty source selection clears territory records',page.evaluate('__sigong.world.territories.group.children.length===0'))
  check('No WebGL shader or browser errors',not r['errors'],r['errors'])
 finally:
  (a.out/'report.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n',encoding='utf8');b.close()
