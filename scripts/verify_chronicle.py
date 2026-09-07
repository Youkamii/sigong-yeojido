"""Exercise the real time-driven 3D viewer, its cited data and source filters (#91)."""
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright


def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--base',required=True)
    ap.add_argument('--out',type=Path,required=True)
    args=ap.parse_args();args.out.mkdir(parents=True,exist_ok=True)
    report={'base':args.base,'checks':[],'errors':[]}
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage',
            '--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        page=browser.new_page(viewport={'width':1440,'height':1000})
        page.set_default_timeout(20000)
        page.on('pageerror',lambda e:report['errors'].append(str(e)))
        def check(name,ok,detail=None):
            report['checks'].append({'name':name,'pass':bool(ok),'detail':detail})
            assert ok,(name,detail)
        def ready():
            page.wait_for_function("!document.querySelector('#chronicle [role=status]')",timeout=90000)
        def year(value):
            field=page.locator('#historyTime [type=number]');field.fill(str(value));field.press('Enter')
            page.wait_for_function('(y)=>window.__sigong.world._year===y',arg=value)
        try:
            page.goto(args.base.rstrip('/')+'/?q=low',wait_until='domcontentloaded',timeout=90000)
            page.locator('#enter').click()
            page.wait_for_function('window.__sigong||window.__sigongErr',timeout=90000);ready()
            check('3D opens as the primary view',page.evaluate("!!window.__sigong&&!window.__sigongErr&&document.body.classList.contains('mode3d')"))
            check('Separate view tabs are absent from the primary flow',not page.locator('.bar .seg').is_visible())
            for value,minimum,names in [(1392,6,['정도전','정몽주']),(1593,7,['이순신','권율','선조']),(1919,7,['김구','유관순','한용운'])]:
                year(value)
                people=page.locator('.period-person .person-heading>button').all_text_contents()
                events=page.locator('.period-event .event-title').all_text_contents()
                check(f'{value}: contemporary people, events and 3D year agree',len(people)>=minimum and all(any(n in p for p in people) for n in names) and len(events)>=2,
                      {'people':people,'events':events})
                if value==1593:check('Kim Simin does not survive his cited death year',not any('김시민' in p for p in people))
            year(1593)
            page.wait_for_selector('[data-scene-event="event-khs-haengju"]',state='visible',timeout=90000)
            page.locator('[data-scene-event="event-khs-haengju"]').click()
            check('3D event opens its participants',page.locator('#chronicle .relation-row').filter(has_text='권율').count()>0)
            page.locator('#chronicle [data-chronicle-entity="person-encykorea-gwon-yul-e0007022"]').first.click()
            check('Participant opens lifespan and related events',all(s in page.locator('#chronicle').inner_text() for s in ['1537년','1599년','행주대첩']))
            page.locator('#chronicle .entity-date').filter(has_text='1537년').locator('[data-chronicle-claim]').first.click()
            quote=page.locator('#evi .quote').inner_text()
            check('Evidence opens the real source quotation','1537' in quote,quote)
            page.locator('#evi [data-evidence-action=chunk]').click()
            page.wait_for_function("document.querySelector('#evi').textContent.includes('1537')")
            check('Cited excerpt resolves through the live API','1537' in page.locator('#evi').inner_text())
            page.keyboard.press('Escape');year(1593)
            page.locator('#historyTime [data-next]').click()
            next_year=int(page.locator('#historyTime [type=number]').input_value())
            check('Next event advances time',next_year>1593,next_year)
            page.locator('#historyTime [data-previous]').click()
            check('Previous event moves time back',int(page.locator('#historyTime [type=number]').input_value())<next_year)
            year(1593);page.locator('#historyTime [data-play]').click()
            page.wait_for_function('window.__sigong.world._year>1593')
            page.locator('#historyTime [data-play]').click()
            check('Playback advances the scene year',int(page.locator('#historyTime [type=number]').input_value())>1593)
            year(1593);page.locator('#sourcesBtn').click()
            check('Five publication groups are offered',page.locator('.reference-set').count()==5)
            page.locator('#noSources').click();ready()
            check('All sources off clears people and events',page.locator('.period-person,.period-event').count()==0)
            page.locator('#allSources').click();ready();page.keyboard.press('Escape')
            page.locator('#humanOnly').check();ready()
            check('Origin filter clears AI-derived contemporary context',page.locator('.period-person,.period-event').count()==0)
            page.locator('#humanOnly').uncheck();ready();year(1593)
            page.screenshot(path=str(args.out/'desktop-1593.png'))
            page.set_viewport_size({'width':480,'height':900})
            page.wait_for_timeout(500)
            check('Mobile keeps the 3D map and year controls visible',page.locator('#three canvas').is_visible() and page.locator('#historyTime').is_visible())
            check('Mobile has no horizontal page overflow',page.evaluate('document.documentElement.scrollWidth<=innerWidth'))
            page.screenshot(path=str(args.out/'mobile-1593.png'))
            check('No browser JavaScript errors',not report['errors'],report['errors'])
        except Exception as error:
            report['failure']=str(error)
            page.screenshot(path=str(args.out/'failure.png'))
        finally:
            (args.out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
            print(json.dumps(report,ensure_ascii=False),flush=True);browser.close()
    return 1 if report.get('failure') else 0


if __name__=='__main__':
    raise SystemExit(main())
