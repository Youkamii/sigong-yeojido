"""Exercise newly collected locality activity and date/place limits on the real viewer."""
import argparse,json
from pathlib import Path
from playwright.sync_api import sync_playwright
p=argparse.ArgumentParser(description=__doc__);p.add_argument('--base',required=True);p.add_argument('--browser',required=True);p.add_argument('--out',type=Path,required=True)
a=p.parse_args();a.out.mkdir(parents=True,exist_ok=True);r={'base':a.base,'checks':[],'errors':[],'coverage':[]}
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path=a.browser);page=b.new_page(viewport={'width':1440,'height':1000});page.set_default_timeout(120000)
 page.on('pageerror',lambda e:r['errors'].append(str(e)))
 def check(name,ok,detail=None):
  row={'name':name,'pass':bool(ok),'detail':detail};r['checks'].append(row);print(json.dumps(row,ensure_ascii=False),flush=True);assert ok,row
 def year(n):
  page.locator('#historyYear').fill(str(n));page.locator('#historyYear').press('Enter')
  page.wait_for_function('(n)=>window.__sigong.chronicleScene.assets.plan.year===n&&!window.__sigong.engine.fly',arg=n)
 def select(id):
  value=page.locator('#sceneDestination option').evaluate_all('(rows,id)=>rows.find(o=>o.dataset.sceneRow===id)?.value',id)
  check(id+' can be selected',bool(value));page.locator('#sceneDestination').select_option(value);page.wait_for_function('!window.__sigong.engine.fly')
  return page.evaluate('''id=>{const {chronicleScene:c}=window.__sigong,a=c.assets,e=a.plan.events.find(e=>e.id===id);return {year:a.plan.year,kind:a.rows.find(r=>r.sceneId===id&&r.kind==='event')?.sceneKind,place:e.scenePlace,
    people:a.rows.filter(r=>r.sceneId===id&&r.kind==='person').map(r=>r.entityId),sides:e.sides,effects:e.effects,
    invaderModels:a.rows.filter(r=>r.sceneId===id&&r.side==='invader').length,dropped:a.stats.dropped};}''',id)
 try:
  page.goto(a.base,wait_until='domcontentloaded');page.locator('#enter').click()
  page.wait_for_function('window.__sigong?.chronicleScene.assets?.scenery.stats.ready&&!window.__sigong.chronicleScene.chronicle.loading')
  counts=page.evaluate('''()=>{const c=window.__sigong.chronicleScene.chronicle;return {newClaims:c.data.claims.filter(c=>c.id.startsWith('claim-scenes-122-')).length,claims:c.data.claims.length,error:c.error,packets:window.__sigong.world.scenePackets.length};}''')
  check('The served API contains the new actual Opus claims',counts['newClaims']>280,counts)
  for n in [-500,300,700,1000,1200,1400,1500,1700,1800,1919,1950]:
   year(n);r['coverage'].append(page.evaluate('''()=>{const a=window.__sigong.chronicleScene.assets;return {year:a.plan.year,locatedEvents:new Set(a.rows.filter(r=>r.kind==='event').map(r=>r.sceneId||r.id)).size,namedPeople:a.rows.filter(r=>r.kind==='person').length};}'''))
  check('Sparse sample years gain local activities beyond the capital',all(row['locatedEvents']>=2 for row in r['coverage'] if row['year'] in [700,1000,1200,1500,1700,1800]),r['coverage'])
  check('Byeokgolje coordinates remain regional references',page.evaluate('window.__sigong.world.scenePackets.filter(s=>s.id.includes("byeokgolje")).every(s=>s.place.precision==="area")'))
  year(1500);s=select('scene-jl2-jepo-waegwan-1423-1510');check('Jepo shows local residence and trade',s['kind']=='market' and not s['dropped'],s)
  page.screenshot(path=str(a.out/'jepo-1500.png'))
  check('Historical map labels omit modern postal districts',page.evaluate('window.__sigong.world.geography.markers.filter(m=>m.region).every(m=>!/(특별자치|특별시|광역시)/.test(m.row.label))'))
  year(1700);s=select('scene-jl2-tongjeyeong-duryongpo-1603-1895');check('A founding officer does not remain at the naval office in 1700','person-jl2-yi-gyeongjun' not in s['people'])
  year(1800);s=select('scene-jl2-bunwonri-1752-1883');check('Bunwon is a working pottery scene',s['kind']=='kiln' and not s['dropped'],s);page.screenshot(path=str(a.out/'bunwon-1800.png'))
  check('Mandongmyo does not backdate the 1844 rite to 1800',page.evaluate('!window.__sigong.chronicleScene.assets.plan.events.some(e=>e.id.includes("mandongmyo"))'))
  year(1271);s=select('scene-syj122-hangpaduri-1271-1273');check('The 1271 fortress does not show the 1273 attacking force',not s['effects']['attack']['enabled'] and not s['invaderModels'],s)
  year(1273);s=select('scene-syj122-hangpaduri-1271-1273');check('The attacking force appears in its documented year',s['effects']['attack']['enabled'] and s['invaderModels']>0,s)
  year(1899);s=select('scene-mod-dongnip-sinmun-1896');check('The newspaper continues after Seo Jae-pil leaves','person-mod-seo-jaepil' not in s['people'] and s['kind']=='publication',s)
  year(1925);s=select('scene-mod-seoul-station-1925');check('The old station uses its dated name and a regional coordinate',s['place']['label']=='경성역' and s['place']['precision']=='area' and 'person-mod-aomi-hajime' not in s['people'],s)
  for n,event in [(1270,'event-encykorea-gaegyeong-hwando-1270'),(2018,'event-kslv-test-launch-2018')]:
   year(n);check(str(n)+' reuses the same evidenced place coordinate',page.evaluate('id=>window.__sigong.chronicleScene.assets.rows.some(r=>r.kind==="event"&&r.entityId===id)',event))
  year(1232);s=select('scene-syj122-buinsa-1232');check('Buinsa uses an area reference after the temple relocation',s['place']['precision']=='area',s)
  check('No browser errors',not r['errors'],r['errors'])
 finally:
  (a.out/'report.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n',encoding='utf8');b.close()
