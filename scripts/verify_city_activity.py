"""Verify sourced ongoing city functions in intervening years against the live API."""
import argparse,json
from pathlib import Path
from playwright.sync_api import sync_playwright
p=argparse.ArgumentParser(description=__doc__);p.add_argument('--base',required=True);p.add_argument('--browser',required=True);p.add_argument('--out',type=Path,required=True)
a=p.parse_args();a.out.mkdir(parents=True,exist_ok=True);report={'base':a.base,'checks':[],'errors':[]}
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path=a.browser)
    page=browser.new_page(viewport={'width':1440,'height':1000});page.set_default_timeout(120000)
    page.on('pageerror',lambda e:report['errors'].append(str(e)))
    def check(name,passed,detail=None):
        row={'name':name,'pass':bool(passed),'detail':detail};report['checks'].append(row);print(json.dumps(row,ensure_ascii=False),flush=True)
        assert passed,(name,detail)
    def year(n):
        field=page.locator('#historyTime [type=number]');field.fill(str(n));field.press('Enter')
        page.wait_for_function('(n)=>window.__sigong.chronicleScene.assets.plan.year===n',arg=n)
        page.wait_for_function('!document.querySelector("#chronicle [role=status]")&&!window.__sigong.engine.fly')
    try:
        page.goto(a.base,wait_until='domcontentloaded');page.locator('#enter').click()
        page.wait_for_function('window.__sigong?.chronicleScene.assets?.revision>0')
        page.wait_for_function('window.__sigong.chronicleScene.chronicle.data.claims.some(c=>c.id.startsWith("claim-activity-96-"))||window.__sigong.chronicleScene.chronicle.error')
        samples=[(300,'gyeongju-wolseong-201-935'),(500,'ungjin-capital-475-538'),(600,'sabi-capital-538-660'),(650,'pyongyang-capital-427-668'),
          (1000,'gaegyeong-capital-919-1232'),(1100,'gaegyeong-capital-919-1232'),(1200,'gaegyeong-capital-919-1232'),
          (1250,'ganghwa-capital-1232-1270'),(1300,'gaegyeong-capital-1270-1394'),(1500,'hanseong-capital-1394-1910'),
          (1700,'hanseong-capital-1394-1910'),(1800,'hanseong-capital-1394-1910'),(1952,'busan-temporary-capital-1950-1953')]
        for n,suffix in samples:
            year(n);scene_id='scene-city-'+suffix
            value=page.locator('#sceneDestination option').evaluate_all('(rows,id)=>rows.find(o=>o.dataset.sceneRow===id)?.value',scene_id)
            check(str(n)+' has its documented city scene',bool(value),scene_id)
            page.locator('#sceneDestination').select_option(value);page.wait_for_function('!window.__sigong.engine.fly')
            result=page.evaluate('''id=>{const r=window.__sigong,a=r.chronicleScene.assets,c=r.chronicleScene.chronicle,e=a.plan.events.find(e=>e.id===id),rows=a.rows.filter(row=>row.sceneId===id);
              return {active:a.activeScene,year:c.year,planYear:a.plan.year,located:e.scenePlace,current:c.context.events.some(row=>row.id===e.entityId&&row.current),
                buildings:rows.filter(row=>row.kind==='building').length,anonymous:rows.filter(row=>row.kind==='building'&&row.archetype==='human').length,
                namedPeople:rows.filter(row=>row.kind==='person').length,dropped:a.stats.dropped};}''',scene_id)
            check(str(n)+' shows ongoing town activity with matching time and evidence',result['year']==n and result['planYear']==n and result['active']==scene_id and result['current'] and result['buildings']>=8
              and result['anonymous']>=4 and result['namedPeople']==0 and not result['dropped'],result)
            if n in (600,1000,1250,1700,1952):page.screenshot(path=str(a.out/('city-'+str(n)+'.png')))
        year(1911)
        check('The documented Joseon capital period ends instead of extending indefinitely',page.evaluate('!window.__sigong.chronicleScene.assets.plan.events.some(e=>e.id==="scene-city-hanseong-capital-1394-1910")'))
        page.locator('#sourcesBtn').click();page.locator('#noSources').click()
        page.wait_for_function('window.__sigong.chronicleScene.assets.rows.length===0')
        check('Source deselection also removes continuous city activity',page.evaluate('window.__sigong.chronicleScene.chronicle.context.events.length===0'))
        check('No browser execution errors',not report['errors'],report['errors'])
    finally:
        (a.out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');browser.close()
