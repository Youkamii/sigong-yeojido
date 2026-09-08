"""Check visible names, dated roles and buildings against the actual public data."""
import argparse,json
from pathlib import Path
from playwright.sync_api import sync_playwright

p=argparse.ArgumentParser(description=__doc__)
p.add_argument('--base',required=True);p.add_argument('--browser',required=True);p.add_argument('--out',type=Path,required=True)
a=p.parse_args();a.out.mkdir(parents=True,exist_ok=True);report={'base':a.base,'checks':[],'errors':[]}
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path=a.browser)
    page=browser.new_page(viewport={'width':1440,'height':1000});page.set_default_timeout(120000)
    page.on('pageerror',lambda e:report['errors'].append(str(e)))
    def check(name,passed,detail=None):
        row={'name':name,'pass':bool(passed),'detail':detail};report['checks'].append(row)
        print(json.dumps(row,ensure_ascii=False),flush=True);assert passed,(name,detail)
    def year(n):
        field=page.locator('#historyTime [type=number]');field.fill(str(n));field.press('Enter')
        page.wait_for_function('(year)=>window.__sigong.chronicleScene.assets.plan.year===year&&!window.__sigong.chronicleScene.chronicle.loading&&!window.__sigong.engine.fly',arg=n)
    def select(id):
        page.locator('#sceneDestination').select_option(id);page.wait_for_function('!window.__sigong.engine.fly')
    try:
        page.goto(a.base,wait_until='domcontentloaded');page.locator('#enter').click()
        page.wait_for_function('window.__sigong?.chronicleScene.assets?.scenery.stats.ready')
        year(1500)
        models=page.evaluate('window.__sigong.chronicleScene.assets.rows.map(r=>r.archetype)')
        check('1500 uses Korean halls and houses without a Western palace dome','korean_hall' in models and 'korean_house' in models and 'palace' not in models,sorted(set(models)))
        regions=page.evaluate('window.__sigong.world.geography.markers.filter(m=>m.region).map(m=>m.row.label)')
        check('1500 keeps Hanseong without modern metropolitan city labels',any('한성부' in name for name in regions) and not any(name in str(regions) for name in ['서울특별시','부산광역시','인천광역시','대구광역시']),regions)
        page.screenshot(path=str(a.out/'hanseong-1500.png'))
        year(1592);select('event-encykorea-hansando-daecheop-1592')
        page.wait_for_function('document.querySelectorAll(".scene-person:not([hidden])").length>=3')
        labels=page.locator('.scene-person:not([hidden])').all_inner_texts()
        check('Selecting a battle reveals key names and their roles without selecting each person',all(any(name in label and len(label.splitlines())>1 for label in labels) for name in ['이순신','이억기','원균']),labels)
        people=page.evaluate('''()=>window.__sigong.chronicleScene.assets.rows.filter(r=>r.kind==='person'&&r.eventId==='event-encykorea-hansando-daecheop-1592').map(r=>({id:r.entityId,model:r.archetype,role:r.role}))''')
        check('Dated naval commanders use the commander silhouette',any(r['id']=='person-encykorea-yi-sunsin' and r['model']=='period_commander' for r in people),people)
        page.screenshot(path=str(a.out/'people-hansando-1592.png'))
        page.set_viewport_size({'width':480,'height':900})
        page.wait_for_function('document.querySelectorAll(".scene-person:not([hidden])").length>0')
        check('Mobile keeps a short readable list of on-map people',1<=page.locator('.scene-person:not([hidden])').count()<=3 and page.locator('#sceneDestination').is_visible())
        page.screenshot(path=str(a.out/'people-mobile-1592.png'))
        page.set_viewport_size({'width':1440,'height':1000})
        year(1919);select('event-declaration-printing-1919')
        models=page.evaluate('''()=>window.__sigong.chronicleScene.assets.rows.filter(r=>r.kind==='person'&&r.eventId==='event-declaration-printing-1919').map(r=>r.archetype)''')
        check('1919 printing participants use modern clothing',len(models)==3 and all(m=='modern_figure' for m in models),models)
        page.screenshot(path=str(a.out/'printing-1919.png'))
        year(1952)
        models=page.evaluate('window.__sigong.chronicleScene.assets.rows.map(r=>r.archetype)')
        check('1952 keeps the modern civic building','civic_hall' in models,sorted(set(models)))
        check('No scene models were dropped',page.evaluate('window.__sigong.chronicleScene.assets.stats.dropped.length===0'))
        check('No browser errors',not report['errors'],report['errors'])
    finally:
        (a.out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8');browser.close()
