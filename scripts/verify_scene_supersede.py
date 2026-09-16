"""#186 화면 검증: 숨긴 기존 장면이 지도·사건 목록·이야기에서 빠지고, 항목 장면이 사료 선택과 무관하게 배치되는지.

로컬 뷰어(기본 8884)를 Playwright 로 열어 표본 연도를 캡처하고 docs/research/scene-supersede-186/report.json 을 쓴다.
  --check supersede : 경주 553·645·1238 — supersededBy 패킷이 어디에도 다시 나타나지 않는지, 대체 항목 장면이 배치됐는지
  --check items     : 553·1238 경주, 1019 개경, 1894 공주 — itemId 패킷의 배치 수와 카드 문구(좌표 출처·누락 근거 안내)
"""
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
parser.add_argument('--base', default='http://127.0.0.1:8884')
parser.add_argument('--browser', default=r'C:\Program Files\Google\Chrome\Application\chrome.exe')
parser.add_argument('--out', type=Path, default=Path('docs/research/scene-supersede-186'))
parser.add_argument('--check', choices=['supersede', 'items'], action='append', help='기본은 둘 다')
args = parser.parse_args()
checks = args.check or ['supersede', 'items']
args.out.mkdir(parents=True, exist_ok=True)

READY = 'window.__sigong?.chronicleScene.assets?.scenery.stats.ready&&!__sigong.chronicleScene.chronicle.loading&&!__sigong.engine.fly'
GYEONGJU = (129.2167, 35.85)
SUPERSEDE_YEARS = [553, 645, 1238]
ITEM_VIEWS = [(553, 'gyeongju', GYEONGJU, 'scene-hs-s3-hwangnyongsa'), (1238, 'gyeongju', GYEONGJU, 'scene-gl2-hwangnyongsa'),
              (1019, 'gaegyeong', (126.5433, 37.985), 'scene-ge3-01'), (1894, 'gongju', (127.12, 36.45), 'scene-hs-ugeumchi')]

PACKET_STATE = '''()=>{
    const s=__sigong.chronicleScene,packets=s.world.scenePackets,year=s.chronicle.year;
    const hidden=new Set(packets.filter(p=>p.supersededBy).map(p=>p.id));
    const items=packets.filter(p=>p.itemId),itemIds=new Set(items.map(p=>p.id));
    const active=items.filter(p=>!p.supersededBy&&p.startYear<=year&&p.endYear>=year);
    const itemRows=s.assets.rows.filter(r=>itemIds.has(r.sceneId));
    const loaded=new Set(s.chronicle.data.claims.map(c=>c.id));
    const describe=p=>({id:p.id,itemId:p.itemId,title:p.title,coordinates:[p.place?.lon,p.place?.lat],
        entityLoaded:s.chronicle.data.entities.some(e=>e.id===p.eventId),
        missingClaims:[...new Set([...p.dateClaimIds,...p.actionClaimIds,...(p.place?.claimIds||[])])].filter(id=>!loaded.has(id)),
        inPlan:s.assets.plan.events.some(e=>e.id===p.id),located:!!s.assets.plan.events.find(e=>e.id===p.id)?.scenePlace,
        rowCount:itemRows.filter(r=>r.sceneId===p.id).length});
    return {year,packetCount:packets.length,hiddenCount:hidden.size,
        hiddenInPlan:s.assets.plan.events.filter(e=>hidden.has(e.id)).map(e=>e.id),
        hiddenInRows:s.assets.rows.filter(r=>hidden.has(r.sceneId)&&!r.siteBackground).map(r=>r.id),
        hiddenInTimeline:s.chronicle.context.allEvents.filter(e=>hidden.has(e.sceneId)).map(e=>e.sceneId),
        hiddenInStory:s.chronicle.context.events.filter(e=>hidden.has(e.sceneId)).map(e=>e.sceneId),
        hiddenMarkers:[...document.querySelectorAll('.scene-label,.marker-label')].map(el=>el.textContent).filter(text=>
            packets.some(p=>hidden.has(p.id)&&text.includes(p.title))),
        replacements:packets.filter(p=>p.supersededBy&&p.startYear<=year&&p.endYear>=year).map(p=>describe(packets.find(n=>n.id===p.supersededBy))),
        activeItemPackets:active.length,placedItemScenes:new Set(itemRows.map(r=>r.sceneId)).size,
        plannedItemScenes:s.assets.plan.events.filter(e=>itemIds.has(e.id)).length,itemRows:itemRows.length,
        items:active.map(describe),dropped:s.assets.stats.dropped};
}'''

CARD_STATE = '''id=>{
    const s=__sigong.chronicleScene,entry=s.chronicle.context.allEvents.find(e=>e.sceneId===id);
    if(!entry)throw new Error('Item missing from story: '+id);
    s.chronicle.showEvent(entry);
    const activity=s.activity(entry.id);
    return {sceneId:id,entityLoaded:s.chronicle.data.entities.some(e=>e.id===entry.id),
        missingClaimIds:activity.missingClaimIds,placement:activity.placement,coordinateNote:activity.coordinateNote};
}'''


def goto_year(page, year, lon, lat):
    page.locator('#historyYear').fill(str(year))
    page.locator('#historyYear').press('Enter')
    page.wait_for_function('n=>__sigong.chronicleScene.assets.plan.year===n&&' + READY, arg=year)
    page.evaluate('''([lon,lat])=>{
        const {world:w,engine:e}=__sigong,[x,z]=w.toWorld(lon,lat);
        e.fly=null;e.controls.target.set(x,w.surfaceAt(x,z),z);
        e.camera.position.set(x,e.controls.target.y+113,z+113);e.controls.update();
    }''', [lon, lat])
    page.wait_for_timeout(1200)


def shot(page, name):
    path = args.out / f'{name}.jpg'
    page.screenshot(path=str(path), type='jpeg', quality=82)
    return {'screenshot': path.name, 'bytes': path.stat().st_size}


def check_supersede(page, report):
    rows = []
    for year in SUPERSEDE_YEARS:
        goto_year(page, year, *GYEONGJU)
        row = page.evaluate(PACKET_STATE)
        row.update(shot(page, f'gyeongju-{year}'))
        rows.append(row)
        print(json.dumps({k: row[k] for k in ['year', 'packetCount', 'hiddenCount', 'hiddenInPlan', 'hiddenInRows', 'hiddenInTimeline',
                          'hiddenInStory', 'hiddenMarkers', 'replacements']}, ensure_ascii=False), flush=True)
        page.locator('#atlasEventsButton').click()
        page.wait_for_timeout(600)
        row['eventListWithHidden'] = page.evaluate('''()=>{
            const packets=__sigong.chronicleScene.world.scenePackets.filter(p=>p.supersededBy);
            return [...document.querySelectorAll('#atlasEvents button, #atlasEvents li')].map(el=>el.textContent)
                .filter(text=>packets.some(p=>text.includes(p.title)));
        }''')
        page.keyboard.press('Escape')
        page.wait_for_timeout(300)
    hidden_ok = all(not row[key] for row in rows for key in ['hiddenInPlan', 'hiddenInRows', 'hiddenInTimeline', 'hiddenInStory', 'hiddenMarkers', 'eventListWithHidden'])
    replacements_ok = all(item['inPlan'] and item['located'] for row in rows for item in row['replacements'])
    report['supersede'] = {'years': rows, 'hiddenPacketsExcluded': hidden_ok, 'replacementsPlaced': replacements_ok}
    assert hidden_ok, '숨긴 패킷이 화면 어딘가에 다시 나타났다'
    assert replacements_ok, '대체 항목 장면이 지도에 놓이지 않았다'


def check_items(page, report):
    rows = []
    for year, city, (lon, lat), target in ITEM_VIEWS:
        goto_year(page, year, lon, lat)
        row = page.evaluate(PACKET_STATE)
        row['view'] = {'city': city, 'lon': lon, 'lat': lat}
        row.update(shot(page, f'item-packets-{city}-{year}'))
        card = page.evaluate(CARD_STATE, target)
        page.wait_for_function(READY)
        page.locator('#atlasStory').wait_for(state='visible')
        notice = page.locator('#atlasStory .activity-missing-claims')
        if card['missingClaimIds']:
            assert str(len(card['missingClaimIds'])) in notice.inner_text()
        page.locator('#atlasStory .atlas-story-evidence > summary').click()
        placement = page.locator('#atlasStory .atlas-placement-note')
        assert placement.locator('h4').inner_text() == '지도 위치'
        placement.scroll_into_view_if_needed()
        assert '항목 조사에서 확인한 좌표' in placement.inner_text()
        card['text'] = page.locator('#atlasStory').inner_text()
        card['loadedProofs'] = page.locator('#atlasStory [data-story-claim]').count()
        card.update({'card' + k.capitalize(): v for k, v in shot(page, f'item-packets-{city}-{year}-card').items()})
        page.locator('#atlasStory [data-close]').click()
        row['card'] = card
        assert row['placedItemScenes'] == row['activeItemPackets'] == row['plannedItemScenes'], row
        assert not row['hiddenInPlan'] and not row['hiddenInRows']
        rows.append(row)
        print(json.dumps({k: row[k] for k in ['year', 'activeItemPackets', 'placedItemScenes', 'itemRows']} | {'placement': card['placement'],
                          'missing': len(card['missingClaimIds'])}, ensure_ascii=False), flush=True)
    report['itemPackets'] = {'years': rows, 'allActiveItemsPlaced': True}


report = {'base': args.base, 'checks': checks, 'errors': []}
with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path=args.browser)
    page = browser.new_page(viewport={'width': 1280, 'height': 800}, device_scale_factor=1)
    page.set_default_timeout(120000)
    page.on('pageerror', lambda error: report['errors'].append(str(error)))
    try:
        page.goto(args.base, wait_until='domcontentloaded')
        page.locator('#enter').click()
        page.wait_for_function(READY)
        report['loaded'] = page.evaluate('''()=>{
            const c=__sigong.chronicleScene.chronicle;
            return {error:c.error,claims:c.data.claims.length,entities:c.data.entities.length,
                sourceCount:c.callbacks.filters().sources.size,origin:c.callbacks.filters().origin};
        }''')
        print(json.dumps(report['loaded'], ensure_ascii=False), flush=True)
        if 'supersede' in checks:
            check_supersede(page, report)
        if 'items' in checks:
            check_items(page, report)
        assert not report['errors'], report['errors']
        report['passed'] = True
    finally:
        (args.out / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
        browser.close()
