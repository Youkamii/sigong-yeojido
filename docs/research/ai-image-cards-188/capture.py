"""#188: 실제 로컬 뷰어의 상상도 카드와 다음 렌더 화질을 검사한다."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT = Path(__file__).resolve().parent
READY = 'window.__sigong?.chronicleScene.assets?.scenery.stats.ready&&!__sigong.chronicleScene.chronicle.loading&&!__sigong.engine.fly'
report = {'checks': [], 'errors': [], 'requests': [], 'captures': []}


def check(name, ok, detail=None):
    row = {'name': name, 'pass': bool(ok), 'detail': detail}
    report['checks'].append(row)
    print(json.dumps(row, ensure_ascii=False), flush=True)
    assert ok, row


with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path=r'C:\Program Files\Google\Chrome\Application\chrome.exe')
    context = browser.new_context(viewport={'width': 1280, 'height': 1360}, device_scale_factor=1)
    page = context.new_page()
    page.set_default_timeout(180000)
    page.on('pageerror', lambda error: report['errors'].append(str(error)))
    page.on('request', lambda request: report['requests'].append(request.url) if '/ai-images/' in request.url or '/ai-image-map.json' in request.url else None)

    def ready():
        page.wait_for_function(READY)

    def year(value):
        page.evaluate('year=>__sigong.chronicleScene.chronicle.chooseYear(year)', value)
        page.wait_for_function('year=>__sigong.chronicleScene.chronicle.year===year', arg=value)
        ready()

    def show(entity):
        page.evaluate('id=>__sigong.chronicleScene.chronicle.showEntity(id)', entity)
        page.locator('#atlasStory').wait_for(state='visible')
        ready()

    def loaded():
        page.wait_for_function("()=>{const img=document.querySelector('#atlasStory .atlas-ai-image img');return img?.complete&&img.naturalWidth>0;}")
        return page.locator('#atlasStory .atlas-ai-image img').get_attribute('src')

    def capture(name):
        path = OUT / name
        page.locator('#atlasEvents' if name=='03-hansando-card.png' else '#atlasStory').screenshot(path=str(path))
        check(name+' <= 1MB', path.stat().st_size <= 1000000, path.stat().st_size)
        report['captures'].append(name)

    try:
        page.goto('http://127.0.0.1:8881/?q=low', wait_until='domcontentloaded')
        page.locator('#enter').click()
        ready()
        check('viewer ready', page.evaluate(READY))
        year(1446)
        show('person-encykorea-sejong-e0029857')
        check('Sejong uses preview at low quality', loaded().endswith('sejong-portrait-512.jpg'))
        check('low quality never requests full portrait', not any(url.endswith('/sejong-portrait.jpg') for url in report['requests']))
        figure = page.locator('#atlasStory .atlas-ai-image')
        check('AI notice is visible', figure.locator('figcaption').inner_text().startswith('AI 생성 상상도'))
        check('full-size link', figure.locator('a').get_attribute('href').endswith('sejong-portrait.jpg') and figure.locator('a').get_attribute('rel') == 'noopener')
        check('details collapsed', not figure.locator('details').evaluate('(node)=>node.open'))
        before = figure.inner_html()
        page.evaluate("__sigong.engine.setQuality('medium',{manual:true,persist:false})")
        check('quality event preserves open panel', figure.inner_html() == before)
        show('person-encykorea-sejong-e0029857')
        check('next render uses full-size at medium', loaded().endswith('sejong-portrait.jpg'))
        figure.locator('summary').click()
        check('generation metadata', all(text in figure.locator('details').inner_text() for text in ['바탕 자료', '상상한 부분과 한계', '2026-09-13', 'codex gpt-6-astra']))
        capture('01-sejong-medium.png')
        page.set_viewport_size({'width': 820, 'height': 1180})
        page.evaluate("__sigong.engine.setQuality('low',{manual:true,persist:false})")
        show('person-encykorea-sejong-e0029857')
        check('tablet preview', loaded().endswith('-512.jpg'))
        dimensions = figure.evaluate('''node=>{const img=node.querySelector('img'),badge=node.querySelector('figcaption .atlas-ai-badge');return {imageHeight:img.clientHeight,imageWidth:img.clientWidth,width:node.clientWidth,badgeFont:parseFloat(getComputedStyle(badge).fontSize),overflow:document.documentElement.scrollWidth>innerWidth};}''')
        check('tablet image and badge fit', dimensions['imageHeight'] <= 320 and dimensions['imageWidth'] <= dimensions['width'] and dimensions['badgeFont'] >= 12 and not dimensions['overflow'], dimensions)
        capture('02-sejong-tablet-low.png')
        page.set_viewport_size({'width': 1280, 'height': 900})
        year(1592)
        page.locator('#atlasEventsButton').click()
        card = page.locator('.event-strip-card[data-scene-id="scene-hansando-daecheop-1592"]')
        # 사건 목록의 현재 가상 창에 한산도 카드가 들어오도록 실제 장면 선택을 쓴다.
        if card.count() == 0:
            page.evaluate('''()=>{const c=__sigong.chronicleScene.chronicle;const event=c.context.allEvents.find(e=>e.sceneId==='scene-hansando-daecheop-1592');c.timeline.setYear(event.lo,true);}''')
        card.scroll_into_view_if_needed()
        card.locator('img').wait_for(state='visible')
        page.wait_for_function("()=>{const img=document.querySelector('[data-scene-id=scene-hansando-daecheop-1592] img');return img?.complete&&img.naturalWidth>0;}")
        check('Hansando card uses preview', card.locator('img').get_attribute('src').endswith('hansando-1592-512.jpg'))
        check('Hansando thumbnail is 56 x 56', card.locator('img').evaluate('(img)=>img.clientWidth===56&&img.clientHeight===56'))
        check('card badge is at least 12px', card.locator('.atlas-ai-card-label').evaluate('(node)=>parseFloat(getComputedStyle(node).fontSize)>=12'))
        check('card badge inside card', card.locator('.atlas-ai-card-label').evaluate('(node)=>node.getBoundingClientRect().bottom<=node.closest("button").getBoundingClientRect().bottom'))
        plain_card = page.locator('.event-strip-card').filter(has_not=page.locator('.atlas-ai-thumbnail')).first
        check('unmapped card keeps icon and omits badge', plain_card.locator('.atlas-event-card-body>svg').count() == 1 and plain_card.locator('.atlas-ai-card-label').count() == 0)
        capture('03-hansando-card.png')
        card.click()
        ready()
        check('Hansando story uses scene mapping', loaded().endswith('hansando-1592-512.jpg'))
        capture('04-hansando-story.png')
        show('person-encykorea-yi-sunsin')
        # 현장 활동이 있으면 장면 매핑이 인물 매핑보다 먼저 적용된다.
        show('person-joseon-sejong')
        check('second Sejong entity also mapped', loaded().endswith('sejong-portrait-512.jpg'))
        year(1446)
        show('event-encykorea-hunminjeongeum-banpo-1446')
        check('Hunminjeongeum event mapping', loaded().endswith('sejong-hunminjeongeum-1446-512.jpg'))
        unmapped = page.evaluate('''()=>__sigong.chronicleScene.chronicle.data.entities.find(e=>e.type==='Person'&&e.id.includes('jeong-inji'))?.id''')
        check('unmapped test entity exists', bool(unmapped), unmapped)
        show(unmapped)
        check('unmapped entity has no figure', page.locator('#atlasStory .atlas-ai-image').count() == 0)
        check('index and map fetched once', report['requests'].count('http://127.0.0.1:8881/assets/ai-images/index.json') == 1 and report['requests'].count('http://127.0.0.1:8881/app/ai-image-map.json') == 1)
        page.route('**/assets/ai-images/index.json', lambda route: route.abort())
        page.goto('http://127.0.0.1:8881/?q=low', wait_until='domcontentloaded')
        page.locator('#enter').click()
        ready()
        year(1446)
        show('person-encykorea-sejong-e0029857')
        check('failed image index leaves story usable', page.locator('#atlasStory h2').inner_text() == '세종' and page.locator('#atlasStory .atlas-ai-image').count() == 0)
        check('no page errors', not report['errors'], report['errors'])
    finally:
        (OUT / 'browser-results.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
        context.close()
        browser.close()
