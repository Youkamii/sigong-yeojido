"""Verify imported person dates, real evidence, and absence of inferred residency."""
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
        page.wait_for_function('(n)=>window.__sigong.chronicleScene.assets.plan.year===n',arg=n)
        page.wait_for_function('!document.querySelector("#chronicle [role=status]")&&!window.__sigong.engine.fly')
    try:
        page.goto(a.base,wait_until='domcontentloaded');page.locator('#enter').click()
        page.wait_for_function('window.__sigong?.chronicleScene.assets?.revision>0')
        page.wait_for_function('window.__sigong?.chronicleScene.chronicle.data.claims.some(c=>c.id.startsWith("claim-people-96-"))')
        for n,person in [(514,'person-beopheung'),(1430,'ent-wea-ha-yeon'),(1450,'ent-wia-sin-sukju'),(1740,'ent-wua-yeongjo')]:
            year(n)
            page.locator('.era-people summary').click()
            button=page.locator('.era-people [data-chronicle-entity="'+person+'"]')
            check(person+' is discoverable in its sourced period',button.count()==1)
            button.click()
            check(person+' opens dated source evidence',page.locator('#chronicle .entity-date [data-chronicle-claim]').count()>0)
            evidence=page.locator('#chronicle .entity-date [data-chronicle-claim*="claim-people-96-"]').first
            evidence.click()
            quote=page.locator('#evi .quote').inner_text()
            check(person+' resolves a real stored quotation',bool(quote.strip()),quote)
            with page.expect_response(lambda response:'/api/chunk?' in response.url) as response:
                page.locator('#evi [data-evidence-action=chunk]').click()
            chunk=response.value.json()
            check(person+' downloads its cited source excerpt',response.value.ok and quote in str(chunk),chunk.get('id'))
            page.wait_for_function('(quote)=>document.querySelector("#evi").textContent.includes(quote)',arg=quote)
            page.keyboard.press('Escape')
            placement=page.evaluate('''id=>{const a=window.__sigong.chronicleScene.assets;return a.rows.filter(r=>r.kind==='person'&&r.id===id).map(r=>({id:r.id,sceneId:r.sceneId}));}''',person)
            check(person+' lifespan does not invent a map residence',not placement,placement)
            if n in (1450,1740):page.screenshot(path=str(a.out/(person+'.png')))
        year(1476)
        check('Sin Sukju is absent after the sourced 1475 death',page.locator('.era-people [data-chronicle-entity="ent-wia-sin-sukju"]').count()==0)
        year(-2000)
        page.locator('.era-people summary').click()
        tradition=page.locator('.period-person').filter(has=page.locator('[data-chronicle-entity="person-dangun"]'))
        text=tradition.inner_text() if tradition.count()==1 else ''
        check('Dangun chronology is explicitly shown as tradition',tradition.count()==1 and '전승 연대' in text,{'count':tradition.count(),'text':text})
        page.locator('#humanOnly').check()
        page.wait_for_function('!window.__sigong.chronicleScene.chronicle.loading')
        check('AI exclusion removes the newly collected date claims',page.evaluate('!window.__sigong.chronicleScene.chronicle.data.claims.some(c=>c.id.startsWith("claim-people-96-"))'))
        check('No browser execution errors',not report['errors'],report['errors'])
    finally:
        (a.out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');browser.close()
