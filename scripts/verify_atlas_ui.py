"""Exercise the reference UI with real history APIs; only chat transport is mocked."""
import argparse
import json
import time
from pathlib import Path
from urllib.parse import urlparse

from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--url', default='https://sigong.rabbion.info/')
parser.add_argument('--frontend', type=Path)
parser.add_argument('--out', type=Path, required=True)
parser.add_argument('--browser', default=r'C:\Program Files\Google\Chrome\Application\chrome.exe')
parser.add_argument('--rivers', action='store_true', help='Expect the separate river preview instead of the restored map')
args = parser.parse_args()
args.out.mkdir(parents=True, exist_ok=True)
report = {'url': args.url, 'frontend': str(args.frontend) if args.frontend else 'public',
          'checks': {}, 'errors': [], 'chat': 'MOCK_TRANSPORT_ONLY',
          'device': 'Desktop Chrome; touch viewport emulation, not a physical tablet'}

def check(name, condition):
    report['checks'][name] = bool(condition)
    if not condition:
        raise AssertionError(name)

sample = '''async()=>{const frames=[];let previous;await new Promise(resolve=>{let start;function step(t){start??=t;if(previous)frames.push(t-previous);previous=t;if(t-start<1400)requestAnimationFrame(step);else resolve();}requestAnimationFrame(step);});frames.sort((a,b)=>a-b);const e=__sigong.engine;return {fps:1000*frames.length/frames.reduce((a,b)=>a+b,0),p95:frames[Math.floor(frames.length*.95)],stats:{...e.stats}};}'''
settled = '''()=>{const a=window.__sigong?.chronicleScene.assets,e=window.__sigong?.engine;if(!a||e.fly)return false;const r=a.rowFor(a.selected,a.selectedRow);return r&&r.pick.getWorldPosition(r.position.clone()).distanceTo(e.controls.target)<.1;}'''

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path=args.browser)
    page = browser.new_page(viewport={'width': 1586, 'height': 992}, has_touch=True)
    page.set_default_timeout(45000)
    page.on('pageerror', lambda error: report['errors'].append(str(error)))
    if args.frontend:
        def serve(route, request):
            path = urlparse(request.url).path
            file = args.frontend / ('index.html' if path == '/' else path.lstrip('/'))
            if (path == '/' or path.startswith('/app/')) and file.is_file():
                kind = 'text/html' if path == '/' else 'application/javascript' if path.endswith('.js') else 'text/css' if path.endswith('.css') else 'application/json'
                route.fulfill(content_type=kind, body=file.read_bytes())
            else:
                route.continue_()
        page.route('https://sigong.rabbion.info/**', serve)

    def shot(name):
        page.screenshot(path=str(args.out / (name + '.jpg')), type='jpeg', quality=86)

    def year(value):
        page.locator('#historyYear').fill(str(value))
        page.locator('#historyYear').press('Enter')
        page.wait_for_function('(y)=>__sigong.chronicleScene.chronicle.year===y', arg=value)

    def close():
        page.keyboard.press('Escape')

    try:
        start = time.perf_counter()
        page.goto(args.url, wait_until='domcontentloaded')
        page.locator('#enter').click()
        page.wait_for_function('window.__sigong?.chronicleScene.assets?.scenery.stats.ready&&!__sigong.chronicleScene.chronicle.loading&&!__sigong.engine.fly')
        report['readySeconds'] = time.perf_counter() - start
        page.evaluate('__sigong.engine.setQuality("medium",{manual:true,persist:false})')
        box = page.locator('#three').bounding_box()
        check('150_full_viewport_map', box['width'] == 1586 and box['height'] == 992)
        check('150_pointer_timeline', page.locator('.time-slider input').evaluate('(e)=>getComputedStyle(e).cursor') == 'pointer')
        year(1592);year(1593)
        check('150_year_input', page.locator('.time-slider input').input_value() == '1593')
        year(-108)
        check('150_bce', '기원전' in page.locator('.time-year').inner_text())
        year(1593)
        page.locator('[data-play]').click()
        page.wait_for_function('__sigong.chronicleScene.chronicle.year>1593')
        page.locator('[data-play]').click()
        check('150_play_pause', page.locator('[data-play]').get_attribute('aria-pressed') == 'false')
        year(1593)

        page.locator('#atlasSettingsButton').click()
        check('150_settings', page.locator('#atlasSettings').is_visible())
        rivers = page.locator('[data-map-rivers]')
        if args.rivers:
            rivers.uncheck();check('150_rivers_off', page.evaluate('!__sigong.world.rivers.group.visible'))
            rivers.check()
        else:
            check('156_previous_map', rivers.count() == 0 and page.evaluate('!__sigong.world.rivers'))
        page.locator('.atlas-source-fold>summary').click()
        page.locator('#noSources').click()
        page.wait_for_function('!__sigong.chronicleScene.chronicle.loading&&__sigong.chronicleScene.chronicle.data.entities.length===0')
        check('150_empty_source_map', page.evaluate('__sigong.chronicleScene.assets.rows.length===0'))
        close()
        page.locator('#atlasQuery').fill('권율');page.locator('#atlasQuery').press('Enter')
        check('151_empty_sources', page.locator('.atlas-search-results .atlas-result').count() == 0)
        page.locator('#atlasSettingsButton').click();page.locator('#allSources').click()
        page.wait_for_function('!__sigong.chronicleScene.chronicle.loading&&__sigong.chronicleScene.chronicle.data.entities.length>0')
        close()
        page.locator('#atlasQuery').fill('권율');page.locator('#atlasQuery').press('Enter')
        check('151_person_search', page.locator('.atlas-search-detail h2').inner_text() == '권율')
        check('151_related_event', '행주대첩' in page.locator('.atlas-search-results').inner_text())
        page.locator('[data-search-type="Event"]').click()
        check('151_type_filter', page.locator('.atlas-search-results [data-search-entity^="person"]').count() == 0)
        page.locator('[data-search-type="all"]').click()
        shot('search')
        page.locator('[data-search-go]').click();page.wait_for_function(settled)
        check('151_scene_jump', page.evaluate('__sigong.chronicleScene.assets.activeScene==="scene-haengju-1593"'))
        check('152_scene_in_view', page.evaluate('''()=>{const a=__sigong.chronicleScene.assets,r=a.rowFor(a.selected,a.selectedRow),p=r.position.clone().project(__sigong.engine.camera);return Math.abs(p.x)<.1&&Math.abs(p.y)<.25;}'''))
        shot('story')
        report['localPerformance'] = page.evaluate(sample)
        page.locator('[data-story-relations]').click();shot('relations')
        page.locator('[data-story-entity*="gwon-yul"]').first.click()
        check('152_related_person', page.locator('#atlasStory h2').inner_text() == '권율')
        page.locator('[data-story-back]').click()
        check('152_back', '행주대첩' in page.locator('#atlasStory h2').inner_text())
        page.locator('.atlas-story-evidence summary').click();page.locator('[data-story-claim]').first.click()
        page.wait_for_function('document.querySelector(".stage").classList.contains("evidence-open")')
        check('152_real_evidence', page.locator('#evi').is_visible())
        page.locator('#atlasEvidenceClose').click()

        page.locator('[data-story-chat]').click();shot('chat')
        requests = []
        claim = page.evaluate('''()=>{const c=__sigong.chronicleScene.chronicle.data.claims.find(c=>c.subject==='event-khs-haengju');return {...c,chunk:c.chunk||{locator:c.citesChunk}};}''')
        def chat_route(route):
            requests.append(route.request.post_data_json)
            route.fulfill(content_type='application/json', body=json.dumps({'status': 'answered', 'evidenceCount': 1,
                'sentences': [{'text': 'UI 전송 확인용 모의 응답입니다.', 'citations': [claim]}]}))
        page.route('**/api/chat', chat_route)
        page.locator('#atlasChat textarea').fill('행주대첩에 대해 설명해줘')
        page.locator('#atlasChat form button').click()
        page.wait_for_selector('#atlasChat .chat-sentence')
        check('153_context_sent', requests[0]['entity'] == 'event-khs-haengju' and len(requests[0]['sources']) > 0)
        check('153_map_visible', page.locator('#three').is_visible() and page.locator('#atlasChat').is_visible())
        page.locator('#atlasChat .chat-citation').click();page.wait_for_selector('.stage.evidence-open')
        check('153_citation', page.locator('#evi').is_visible());page.locator('#atlasEvidenceClose').click()
        year(1594)
        check('153_context_invalidated', page.locator('#atlasChat .chat-sentence').count() == 0)
        page.unroute('**/api/chat', chat_route)
        close();year(1593)

        page.locator('#atlasEventsButton').click();page.locator('[data-event-category="war"]').click()
        check('154_virtual_cards', page.locator('#atlasEvents .event-strip-card').count() < 16)
        check('154_category', page.locator('[data-event-category="war"]').get_attribute('aria-selected') == 'true')
        shot('events')
        year(1592);check('154_year_sync', '1592' in page.locator('.atlas-event-caption').inner_text())
        year(1593);page.locator('[data-scene-id="scene-haengju-1593"]').click();page.wait_for_function(settled)
        check('154_event_to_scene', page.locator('#atlasStory').is_visible() and page.locator('#atlasEvents').is_hidden())
        year(1594);check('152_year_expires_story', page.locator('#atlasStory').is_hidden())
        year(1593)
        page.locator('#atlasSettingsButton').click();page.locator('#wholeMapBtn').click();close()
        page.wait_for_function('!__sigong.engine.fly')
        shot('overview');report['overviewPerformance'] = page.evaluate(sample)
        check('150_peninsula_islands', page.evaluate('!!__sigong.world.geography.markers.find(m=>m.row.id==="ulleungdo")&&!!__sigong.world.geography.markers.find(m=>m.row.id==="dokdo-dongdo")'))
        page.set_viewport_size({'width':390,'height':844})
        page.wait_for_timeout(300);shot('mobile-map')
        check('150_mobile_map', page.locator('#three').bounding_box()['height']==844)
        controls=page.locator('.atlas-time').bounding_box()
        check('150_mobile_controls', controls['x']>=0 and controls['x']+controls['width']<=390)
        page.locator('.atlas-search-bar button[type=submit]').click()
        page.locator('#atlasQuery').fill('권율');page.locator('#atlasQuery').press('Enter')
        check('151_mobile_search', page.locator('#atlasQuery').is_visible())
        shot('mobile-search')
        page.locator('[data-search-go]').click();page.wait_for_function(settled)
        panel=page.locator('#atlasStory').bounding_box();bar=page.locator('.timebar').bounding_box()
        check('152_mobile_panel_bounds', panel['x']>=0 and panel['x']+panel['width']<=390 and panel['y']+panel['height']<=bar['y'])
        shot('mobile-story')
        close();page.locator('#atlasEventsButton').click();shot('mobile-events')
        check('154_mobile_events', page.locator('#atlasEvents').bounding_box()['width']<=390)
        check('no_browser_errors', not report['errors'])
    except Exception as error:
        report['failure']=str(error);shot('failure')
    finally:
        (args.out/'checks.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        print(json.dumps({'checks':report['checks'],'errors':report['errors'],'failure':report.get('failure'),
                          'readySeconds':report.get('readySeconds'),'localPerformance':report.get('localPerformance'),
                          'overviewPerformance':report.get('overviewPerformance')}))
        browser.close()
    if report.get('failure'):
        raise SystemExit(1)
