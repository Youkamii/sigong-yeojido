"""Exercise the year-linked event strip and restored scenes using the real API."""
import argparse,json
from pathlib import Path
from playwright.sync_api import sync_playwright
p=argparse.ArgumentParser(description=__doc__);p.add_argument('--base',required=True);p.add_argument('--browser',required=True);p.add_argument('--out',type=Path,required=True)
a=p.parse_args();a.out.mkdir(parents=True,exist_ok=True);r={'base':a.base,'checks':[],'errors':[]}
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path=a.browser);page=b.new_page(viewport={'width':1440,'height':1000});page.set_default_timeout(120000);page.on('pageerror',lambda e:r['errors'].append(str(e)))
 def check(name,ok,detail=None):
  row={'name':name,'pass':bool(ok),'detail':detail};r['checks'].append(row);print(json.dumps(row,ensure_ascii=False),flush=True);assert ok,row
 def year(n):
  page.locator('#historyYear').fill(str(n));page.locator('#historyYear').press('Enter');page.wait_for_function('(n)=>__sigong.chronicleScene.assets.plan.year===n&&!__sigong.engine.fly',arg=n)
 try:
  page.goto(a.base,wait_until='domcontentloaded');page.locator('#enter').click();page.wait_for_function('window.__sigong?.chronicleScene.assets?.scenery.stats.ready&&!__sigong.chronicleScene.chronicle.loading')
  check('The slider track has a pointer cursor',page.locator('.time-slider input').evaluate('e=>getComputedStyle(e).cursor')=='pointer')
  year(1593);check('The event strip follows numeric year entry',page.locator('.event-strip-cursor').inner_text()=='1593년')
  check('Chronological cards are bounded to a small visible window',page.locator('.event-strip-card').count()<=20 and page.locator('.event-strip-card').count()>2)
  page.screenshot(path=str(a.out/'timeline-1593.png'))
  year(1281);check('The second Japanese expedition remains in the event list',page.evaluate('__sigong.chronicleScene.chronicle.context.allEvents.some(e=>e.id==="event-encykorea-ilbon-wonjeong"&&e.lo===1281)'))
  year(1193);entries=page.evaluate('__sigong.chronicleScene.chronicle.context.events.filter(e=>e.lo===1193&&e.sceneId).map(e=>({sceneId:e.sceneId,title:e.title}))')
  check('1193 scenes at distinct places are separate cards',len({e['sceneId'] for e in entries})>=2,entries)
  scene=next(e for e in entries if '효심' in e['title']);card=page.locator('.event-strip-card[data-scene-id="'+scene['sceneId']+'"]');card.click()
  page.wait_for_function('!__sigong.engine.fly');check('A timeline card selects its specific scene',page.evaluate('__sigong.chronicleScene.assets.activeScene')==scene['sceneId'])
  year(1800);details=page.evaluate('''()=>{const a=__sigong.chronicleScene.assets,id='scene-jl2-bunwonri-1752-1883';return a.rows.filter(r=>r.sceneId===id).map(r=>({kind:r.kind,archetype:r.archetype,compact:r.compact}));}''')
  check('Bunwon retains workshop details before selecting it',len(details)>5 and not any(e.get('compact') for e in details),details)
  page.screenshot(path=str(a.out/'restored-bunwon-1800.png'))
  old=page.evaluate('__sigong.chronicleScene.chronicle.year');page.locator('[data-event-prev]').click();page.wait_for_function('(n)=>__sigong.chronicleScene.assets.plan.year<n',arg=old)
  check('Previous event moves both the strip and the map',page.evaluate('__sigong.chronicleScene.chronicle.timeline.year===__sigong.chronicleScene.assets.plan.year'))
  year(1593);rect=page.locator('.event-strip-window').bounding_box();page.mouse.move(rect['x']+rect['width']*.6,rect['y']+48);page.mouse.down();page.mouse.move(rect['x']+rect['width']*.25,rect['y']+48,steps=12);page.mouse.up()
  page.wait_for_function('__sigong.chronicleScene.assets.plan.year!==1593&&!__sigong.chronicleScene.chronicle.pendingYear')
  check('Dragging the event strip changes its year and the map',page.evaluate('__sigong.chronicleScene.chronicle.timeline.year===__sigong.chronicleScene.assets.plan.year'))
  before=page.evaluate('__sigong.chronicleScene.chronicle.year');page.locator('.event-strip-window').focus();page.keyboard.press('ArrowRight')
  page.wait_for_function('(n)=>__sigong.chronicleScene.assets.plan.year>n',arg=before)
  check('Keyboard navigation moves to the next dated event',page.evaluate('__sigong.chronicleScene.chronicle.timeline.year===__sigong.chronicleScene.assets.plan.year'))
  year(1593);page.locator('[data-play]').click();page.wait_for_function('__sigong.chronicleScene.chronicle.year>=1594');page.locator('[data-play]').click()
  check('Playback moves the event strip with the year',page.evaluate('__sigong.chronicleScene.chronicle.timeline.year===__sigong.chronicleScene.chronicle.year'))
  year(-500);check('BCE entry is preserved while nearby dated records remain discoverable',page.locator('.event-strip-cursor').inner_text()=='기원전 500년')
  page.set_viewport_size({'width':480,'height':900});year(1593);page.wait_for_timeout(300)
  layout=page.evaluate('''()=>{const bar=document.querySelector('.timebar').getBoundingClientRect(),c=__sigong.engine.renderer.domElement.getBoundingClientRect();return {barBottom:bar.bottom,canvasHeight:c.height,viewportWidth:innerWidth,bodyWidth:document.body.scrollWidth};}''')
  check('Mobile retains map space without horizontal page overflow',layout['canvasHeight']>=230 and layout['bodyWidth']<=layout['viewportWidth'],layout)
  page.screenshot(path=str(a.out/'timeline-mobile.png'))
  page.locator('#sourcesBtn').click();page.locator('#noSources').click();page.wait_for_function('__sigong.chronicleScene.assets.rows.length===0')
  check('Source deselection removes the event strip cards too',page.locator('.event-strip-card').count()==0 and page.locator('.event-strip-empty').is_visible())
  check('No browser errors',not r['errors'],r['errors'])
 finally:
  (a.out/'report.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n',encoding='utf8');b.close()
