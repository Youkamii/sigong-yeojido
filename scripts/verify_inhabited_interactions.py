"""Fixed headless views against real APIs; optional interception replaces frontend files only."""
import argparse,json
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright
p=argparse.ArgumentParser();p.add_argument('--frontend',type=Path);p.add_argument('--out',type=Path,required=True);a=p.parse_args();a.out.mkdir(parents=True,exist_ok=True)
report={'frontend':str(a.frontend),'errors':[]}
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path=r'C:\Program Files\Google\Chrome\Application\chrome.exe')
 page=b.new_page(viewport={'width':1256,'height':809});page.set_default_timeout(120000)
 page.on('pageerror',lambda e:report['errors'].append(str(e)))
 if a.frontend:
  def serve(route,request):
   path=urlparse(request.url).path;f=a.frontend/('index.html' if path=='/' else path.lstrip('/'))
   if (path=='/' or path.startswith('/app/')) and f.is_file():route.fulfill(body=f.read_bytes(),content_type='text/html' if path=='/' else 'application/javascript' if path.endswith('.js') else 'text/css' if path.endswith('.css') else 'application/json')
   else:route.continue_()
  page.route('https://sigong.rabbion.info/**',serve)
 try:
  page.goto('https://sigong.rabbion.info/',wait_until='domcontentloaded');page.locator('#enter').click()
  page.wait_for_function('window.__sigong?.chronicleScene.assets?.scenery.stats.ready&&!__sigong.chronicleScene.chronicle.loading&&!__sigong.engine.fly')
  page.evaluate('__sigong.engine.setQuality("medium",{manual:true,persist:false})')
  report['checks']=[]
  def check(name,value):
   report['checks'].append({'name':name,'pass':bool(value)});print(name,bool(value),flush=True)
  def year(y):
   page.locator('#historyYear').fill(str(y));page.locator('#historyYear').press('Enter')
   page.wait_for_function('y=>{const c=__sigong.chronicleScene,s=c.assets.scenery;return c.chronicle.year===y&&!c.chronicle.loading&&s.stats.ready&&s.stats.year===y}',arg=y)
  def focus():
   page.evaluate('() => {const {world:w,engine:e,chronicleScene:c}=__sigong,s=c.assets.scenery,site=s.landscapeCells[0].site;e.flyTo(w.center.clone().set(site.x,w.surfaceAt(site.x,site.z),site.z),65,100);}')
   page.wait_for_function('!__sigong.engine.fly');page.wait_for_timeout(400)
  def duplicates():
   return page.evaluate('()=>{const s=__sigong.chronicleScene.assets.scenery,visible=[...s.detailCache.values()].filter(d=>d.group.visible),errors=[];for(const m of s.overview.children)for(const r of m.userData.houseRanges||[]){const expected=visible.some(d=>d.site.id===r.id&&d.indices.includes(r.index));if(Boolean(r.hidden)!==expected)errors.push({id:r.id,index:r.index,hidden:r.hidden,expected});}return errors;}')
  year(1100);focus()
  page.evaluate('()=>{const s=__sigong.chronicleScene.assets.scenery;window.qa166={overview:s.overview,period:s.period.id,occupancy:s.occupancyKey,details:[...s.detailCache.values()],builds:s.stats.modelBuilds};}')
  year(1101);page.wait_for_timeout(300)
  report['reuse']=page.evaluate('()=>{const s=__sigong.chronicleScene.assets.scenery;return {occupancyUnchanged:s.occupancyKey===qa166.occupancy,overviewSame:s.overview===qa166.overview,buildsBefore:qa166.builds,buildsAfter:s.stats.modelBuilds,period:s.period.id};}')
  check('same_era_reuses_overview_when_occupancy_unchanged',not report['reuse']['occupancyUnchanged'] or report['reuse']['overviewSame'])
  check('same_era_no_duplicate_far_near_roofs',not duplicates())
  year(1391);focus();page.evaluate('()=>{const s=__sigong.chronicleScene.assets.scenery;qa166.overview=s.overview;qa166.period=s.period.id;qa166.details=[...s.detailCache.values()];}')
  year(1392);page.wait_for_timeout(400)
  check('era_boundary_replaces_overview_and_old_details',page.evaluate('()=>{const s=__sigong.chronicleScene.assets.scenery;return s.period.id!==qa166.period&&s.overview!==qa166.overview&&qa166.details.every(d=>d.group.parent===null);}'))
  check('era_boundary_no_duplicate_roofs',not duplicates())
  focus()
  page.evaluate('()=>{const s=__sigong.chronicleScene.assets.scenery;qa166.savedOccupied=s.occupied;qa166.site=[...s.detailCache.values()].find(d=>d.group.visible)?.site||s.landscapeCells[0].site;s.sync([...s.occupied,{x:qa166.site.x,z:qa166.site.z,radius:qa166.site.radius}]);}')
  page.wait_for_timeout(350)
  check('synthetic_same_era_occupancy_hides_site',page.evaluate('()=>{const s=__sigong.chronicleScene.assets.scenery;return !s.landscapeCells.some(c=>c.site.id===qa166.site.id)&&![...s.detailCache.values()].some(d=>d.site.id===qa166.site.id&&d.group.visible);}'))
  check('occupancy_no_duplicate_roofs',not duplicates())
  page.evaluate('()=>__sigong.chronicleScene.assets.scenery.sync(qa166.savedOccupied)');page.wait_for_timeout(350)
  check('occupancy_restore_no_duplicate_roofs',not duplicates())
  page.evaluate('document.querySelector("[data-map-display=scenery]").click()');year(1500)
  check('scenery_toggle_survives_era_change',page.evaluate('!__sigong.chronicleScene.assets.scenery.group.visible'))
  page.evaluate('document.querySelector("[data-map-display=scenery]").click();document.querySelector("[data-map-display=paths]").click()');year(1960)
  check('path_toggle_survives_era_change',page.evaluate('()=>{const s=__sigong.chronicleScene.assets.scenery;let shown=0;s.group.traverse(o=>{if(o.name==="scenery-lanes"&&o.visible)shown++;});return s.group.visible&&shown===0;}'))
  page.evaluate('document.querySelector("[data-map-display=paths]").click()')
  year(1593)
  page.locator('#atlasQuery').fill('\uAD8C\uC728');page.locator('#atlasQuery').press('Enter')
  page.locator('[data-search-go]').first.click();page.wait_for_function('!__sigong.engine.fly')
  check('factual_story_navigation',page.locator('#atlasStory').is_visible())
  related=page.locator('[data-story-entity*="gwon-yul"]')
  if related.count():related.first.click()
  check('factual_person_story', '\uAD8C\uC728' in page.locator('#atlasStory').inner_text())
  check('anonymous_scenery_has_no_factual_picks',page.evaluate('()=>{const a=__sigong.chronicleScene.assets,decorative=new Set();a.scenery.group.traverse(o=>decorative.add(o));return !a.picks.some(p=>decorative.has(p))&&!a.rows.some(r=>decorative.has(r.pick));}'))
  check('no_browser_errors',not report['errors'])
  failed=[c['name'] for c in report['checks'] if not c['pass']]
  if failed:raise AssertionError('Failed checks: '+', '.join(failed))

 except Exception as e:
  report['failure']=str(e);page.screenshot(path=str(a.out/'failure.png'));raise
 finally:
  (a.out/'report.json').write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf8');b.close()
