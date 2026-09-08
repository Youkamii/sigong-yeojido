"""Check dated map labels, menus and cards against the real history API."""
import argparse,json,time
from pathlib import Path
from playwright.sync_api import sync_playwright

p=argparse.ArgumentParser(description=__doc__)
p.add_argument('--base',required=True);p.add_argument('--browser',required=True);p.add_argument('--out',type=Path,required=True)
a=p.parse_args();a.out.mkdir(parents=True,exist_ok=True)
report={'base':a.base,'checks':[],'errors':[],'transitions':[]}
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path=a.browser)
    page=browser.new_page(viewport={'width':1440,'height':1000});page.set_default_timeout(120000)
    page.on('pageerror',lambda error:report['errors'].append(str(error)))
    def check(name,passed,detail=None):
        row={'name':name,'pass':bool(passed),'detail':detail};report['checks'].append(row)
        print(json.dumps(row,ensure_ascii=False),flush=True);assert passed,(name,detail)
    def year(n):
        start=time.monotonic();field=page.locator('#historyTime [type=number]');field.fill(str(n));field.press('Enter')
        page.wait_for_function('(n)=>window.__sigong.chronicleScene.assets.plan.year===n&&!window.__sigong.chronicleScene.chronicle.loading&&!window.__sigong.engine.fly',arg=n)
        report['transitions'].append({'year':n,'seconds':round(time.monotonic()-start,3)})
    try:
        page.goto(a.base,wait_until='domcontentloaded');page.locator('#enter').click()
        page.wait_for_function('window.__sigong?.chronicleScene.assets?.revision>0&&!window.__sigong.chronicleScene.chronicle.loading')
        year(1500)
        labels=page.locator('#geographyDestination option').all_text_contents()
        check('1500 keeps the documented Hanseong and removes modern administration labels',
              any('한성부' in label for label in labels) and not any(any(word in label for word in ['서울특별시','부산광역시','인천광역시','평양시','개성시']) for label in labels),labels)
        value=page.locator('#geographyDestination option').evaluate_all("opts=>opts.find(o=>o.textContent.includes('한성부')).value")
        page.locator('#geographyDestination').select_option(value);page.wait_for_function('!window.__sigong.engine.fly')
        check('Map marker, menu and card agree on the historical place',page.locator('#geographyCard strong').inner_text() in labels
              and '1500년' in page.locator('#geographyCard p').first.inner_text()
              and page.evaluate('(id)=>window.__sigong.world.geography.markers.some(m=>m.row.id===id&&m.region)',value))
        page.screenshot(path=str(a.out/'hanseong-1500.png'))
        year(1700)
        check('An open place card updates its year with the activity',page.locator('#geographyCard').is_visible()
              and '1700년' in page.locator('#geographyCard p').first.inner_text())
        year(1911)
        check('Expired capital disappears from map and menu and closes its old card',not page.locator('#geographyCard').is_visible()
              and not page.evaluate('(id)=>window.__sigong.world.geography.markers.some(m=>m.row.id===id)',value)
              and value not in page.locator('#geographyDestination option').evaluate_all('opts=>opts.map(o=>o.value)'))
        year(1952)
        check('A later documented city appears in its actual period',any('부산 (임시수도)' in label for label in page.locator('#geographyDestination option').all_text_contents()))
        page.locator('#sourcesBtn').click();page.locator('#noSources').click()
        page.wait_for_function('window.__sigong.chronicleScene.assets.rows.length===0')
        check('Deselecting all sources removes historical place labels',page.evaluate('window.__sigong.world.geography.markers.every(m=>!m.region)'))
        check('Physical islands and mountains stay navigable',all(name in page.locator('#geographyDestination option').all_text_contents() for name in ['울릉도','태백산맥']))
        check('No browser errors',not report['errors'],report['errors'])
    finally:
        (a.out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8');browser.close()
