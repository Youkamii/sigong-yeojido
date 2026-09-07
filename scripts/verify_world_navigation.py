"""Live event and navigation acceptance. No fixture responses or injected claims."""
import argparse,json
from pathlib import Path
from playwright.sync_api import sync_playwright
p=argparse.ArgumentParser(description=__doc__)
p.add_argument('--base',required=True);p.add_argument('--browser',required=True);p.add_argument('--out',type=Path,required=True)
args=p.parse_args();args.out.mkdir(parents=True,exist_ok=True)
report={'base':args.base,'checks':[],'errors':[]}
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path=args.browser)
    page=browser.new_page(viewport={'width':1440,'height':1000});page.set_default_timeout(120000)
    page.on('pageerror',lambda e:report['errors'].append(str(e)))
    def check(name,ok,detail=None):
        row={'name':name,'pass':bool(ok),'detail':detail};report['checks'].append(row)
        print(json.dumps(row,ensure_ascii=False),flush=True);assert ok,(name,detail)
    def year(n):
        c=page.locator('#historyTime [type=number]');c.fill(str(n));c.press('Enter')
        page.wait_for_function('(n)=>window.__sigong.chronicleScene.assets.plan.year===n',arg=n)
        page.wait_for_function('!document.querySelector("#chronicle [role=status]") && !window.__sigong.engine.fly')
    def select(id):
        page.locator('#sceneDestination').select_option(id)
        page.wait_for_function('!window.__sigong.engine.fly')
    def snapshot(id):
        return page.evaluate("""id=>{const r=window.__sigong,a=r.chronicleScene.assets,w=r.world,
          event=a.plan.events.find(e=>e.entityId===id),rows=a.rows.filter(x=>x.entityId===id||x.eventId===id),fires=[];
          a.group.traverse(o=>{if(o.name==='event-fire')fires.push({side:o.userData.targetSide});});
          return {place:event?.scenePlace,effects:event?.effects,rows:rows.map(x=>({kind:x.kind,archetype:x.archetype,id:x.entityId,
            side:x.side,shipSide:x.shipSide,compact:x.compact,coordinates:w.coordinatesAt(x.position.x,x.position.z),
            inside:w.contains(x.position.x,x.position.z),action:x.action})),fires,stats:a.stats};}""",id)
    def capture(name):page.screenshot(path=str(args.out/(name+'.png')))
    try:
        page.goto(args.base,wait_until='domcontentloaded');page.locator('#enter').click()
        page.wait_for_function('window.__sigong?.chronicleScene.assets?.revision>0')
        year(1593);select('person-encykorea-yi-sunsin');s=snapshot('event-yinav-hansando-honyeong-1593')
        check('1593 Yi Sunsin is placed within Hansando through his dated activity',any(r['id']=='person-encykorea-yi-sunsin' and r['inside'] and 128.45<r['coordinates'][0]<128.57 and 34.74<r['coordinates'][1]<34.85 for r in s['rows']),s)
        check('The selected activity shows place, role and evidence','한산도' in page.locator('.selected-activity').inner_text() and page.locator('.selected-activity [data-chronicle-claim]').count()>0)
        page.locator('.selected-activity details summary').first.click();page.locator('.selected-activity [data-chronicle-claim]').first.click()
        check('An activity opens its actual stored quote',bool(page.locator('#evi .quote').inner_text().strip()))
        page.keyboard.press('Escape');capture('yi-hansando-1593')
        for n,id in [(1592,'event-encykorea-hansando-daecheop-1592'),(1594,'event-yinav-danghangpo-2-1594'),(1597,'event-yinav-myeongnyang-1597'),(1598,'event-yinav-noryang-1598')]:
            year(n);select(id);s=snapshot(id);ships=[r for r in s['rows'] if r['archetype']=='ship']
            check(str(n)+': opposing fleets stay in the researched sea area',len(ships)>=4 and all(not r['inside'] for r in ships) and {'naval','invader'}<=set(r['side'] for r in ships),s)
            check(str(n)+': named people stay with their own fleet',all(r.get('side')==r.get('shipSide') for r in s['rows'] if r['kind']=='person'))
            if n==1592:
                check('Wakizaka belongs to the Japanese fleet',any(r['id']=='person-yinav-wakizaka' and r.get('shipSide')=='invader' for r in s['rows']))
                check('Recorded ship fires target Japanese vessels',s['effects']['fire']['enabled'] and any(f['side']=='invader' for f in s['fires']))
            if n==1594:check('Distant command does not place Yi Sunsin in Danghangpo',not any(r['id']=='person-encykorea-yi-sunsin' for r in s['rows']))
            if n==1597:check('Fire arrows do not imply burning ships at Myeongnyang',not s['effects']['fire']['enabled'] and not any(f['side']=='invader' for f in s['fires']))
            check(str(n)+': no model or action dropped',not s['stats']['dropped'] and s['stats']['built']==s['stats']['requested'])
            capture('naval-'+str(n))
        year(1592);select('event-dongnae-jeontu-1592');s=snapshot('event-dongnae-jeontu-1592')
        check('Selecting a nearby siege unfolds walls and opposing troops',sum(r['archetype']=='wall' for r in s['rows'])>=4 and {'invader','defender'}<=set(r.get('side') for r in s['rows']),s);capture('dongnae-1592')
        select('event-hanyang-palace-fire-1592');s=snapshot('event-hanyang-palace-fire-1592')
        check('Palace fire appears without inventing a named arsonist',s['effects']['fire']['enabled'] and not any(r['kind']=='person' for r in s['rows']));capture('palace-fire-1592')
        year(1919);select('event-declaration-printing-1919');s=snapshot('event-declaration-printing-1919')
        check('Printing includes tables, books, cart and three working participants',{'table','book','handcart'}<=set(r['archetype'] for r in s['rows']) and sum(r.get('action')=='working' for r in s['rows'])==3,s);capture('printing-1919')
        page.set_viewport_size({'width':480,'height':900})
        check('Mobile keeps scene navigation available',page.locator('#sceneDestination').is_visible() and page.locator('#three canvas').bounding_box()['height']>300);capture('mobile')
        page.set_viewport_size({'width':1440,'height':1000});page.locator('#wholeMapBtn').click()
        page.wait_for_function('!window.__sigong.engine.fly');capture('whole-map')
        check('The large peninsula is retained',page.evaluate('window.__sigong.world.bounds.maxZ-window.__sigong.world.bounds.minZ>1000'))
        page.locator('#sourcesBtn').click();page.locator('#noSources').click()
        page.wait_for_function('window.__sigong.chronicleScene.assets.rows.length===0')
        check('All sources off removes all historical scenes',page.evaluate('window.__sigong.chronicleScene.assets.plan.events.length===0'))
        check('No browser execution errors',not report['errors'],report['errors'])
    finally:
        (args.out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        browser.close()
