"""Check catalog points, separate event/date evidence, and the actual 2D/3D/graph UI."""
import argparse
import json
from pathlib import Path
from urllib.parse import urlencode
from playwright.sync_api import sync_playwright
from verify_viewer import LAUNCH_ARGS


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--base', default='http://127.0.0.1:8870')
    ap.add_argument('--out', type=Path, required=True)
    args = ap.parse_args(); args.out.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=LAUNCH_ARGS)
        page = browser.new_page(viewport={'width': 1440, 'height': 1000}); errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.add_init_script("window.__historyStrokes=0;const stroke=CanvasRenderingContext2D.prototype.stroke;CanvasRenderingContext2D.prototype.stroke=function(...a){if(this.canvas.id==='map'&&this.strokeStyle.toLowerCase()==='#d8b463')window.__historyStrokes++;return stroke.apply(this,a);};")

        def get(path, **query):
            response = page.request.get(args.base + path + '?' + urlencode(query), timeout=180000)
            assert response.ok, (response.status, response.text()[:300])
            return response.json()

        def rows(**query):
            return get('/api/history-map', level=4, **query)['features']

        all_rows = rows(); assert len(all_rows) == 5
        for feature in all_rows:
            prop = feature['properties']; year = prop['validFrom']
            assert [r['id'] for r in rows(year=year)] == [feature['id']]
            record = json.loads(get('/api/chunk', id=prop['citesChunk'])['chunk']['text'])
            assert record == prop['sourceRecord']
            assert feature['geometry']['coordinates'] == [float(record['longitude']), float(record['latitude'])]
            assert record['crsInRecord'] is None and record['pointDefinitionInRecord'] is None
            for key, quote in [('eventChunk', 'eventQuote'), ('dateChunk', 'dateQuote')]:
                chunk = get('/api/chunk', id=prop[key])['chunk']; assert chunk['text'] == prop[quote]
                assert chunk['sourceId'] in prop['requiredSources']
            graph = get('/api/graph', entity=prop['eventId'], sources=','.join(prop['requiredSources']))
            relation = next(c for c in graph['claims'] if c['id'] == prop['claimId'])
            assert relation['predicate'] == 'syj:hasEventSite' and relation['object']['id'] == prop['placeId']
            assert any(c['id'] == prop['dateClaimId'] for c in graph['claims'])
        assert not rows(year=1882) and not rows(year=1920)
        assert not rows(origin='human') and not rows(sources='')
        assert not rows(year=1919, sources='src-khs-jeamri')
        assert len(rows(year=1919, sources='src-khs-jeamri,src-much-jeamri')) == 1

        page.goto(args.base + '/?q=low', wait_until='networkidle', timeout=180000)
        page.locator('#enter').click(); page.locator('#lensSelect').select_option('khs-events')
        page.wait_for_function("document.querySelector('#historyMapBtn').textContent==='사건 장소 1개 · 근거'")
        assert page.locator('#historyLevel').input_value() == '4'
        assert page.evaluate('window.__historyStrokes') > 0

        def open_feature(key):
            page.locator('#historyMapBtn').click()
            assert page.locator('[data-feature]').count() == 1
            page.locator('[data-feature="khs-event-' + key + '"]').click()

        open_feature('haengju')
        detail = page.locator('#evi').inner_text()
        assert '126.8247541' in detail and '37.59994084' in detail and '전투' in detail
        page.locator('[data-event-record]').click()
        page.wait_for_function("document.querySelector('#evi').textContent.includes('1333100560000')")
        open_feature('haengju'); page.locator('[data-event-graph]').click()
        page.locator('#graph [data-node="event-khs-haengju"]').wait_for()
        page.locator('#graph [data-node="place-khs-haengju"]').wait_for()
        page.screenshot(path=str(args.out / 'graph.png'))
        page.locator('#b3d').click()
        page.wait_for_function('window.__sigong?.world.historyTargets.length===1', timeout=180000)
        assert page.evaluate('window.__sigong.world.historyTargets[0].geometry.attributes.position.count') == 6
        page.screenshot(path=str(args.out / 'three.png'))
        page.locator('#humanOnly').check(); page.wait_for_function('window.__sigong.world.historyTargets.length===0')
        page.locator('#humanOnly').uncheck(); page.wait_for_function('window.__sigong.world.historyTargets.length===1')
        page.locator('#noSources').click(); page.wait_for_function('window.__sigong.world.historyTargets.length===0')
        page.locator('#lensSelect').select_option('khs-events')
        page.wait_for_function('window.__sigong.world.historyTargets.length===1')

        cursor = page.locator('#tl .tl-cursor')
        cursor.focus()
        for key in ['PageUp'] * 3 + ['Shift+ArrowRight'] * 2 + ['ArrowRight'] * 6:
            cursor.press(key)
        page.wait_for_function("document.querySelector('#yearV').textContent==='1919'&&window.__sigong.world.historyTargets[0]?.userData.feature.id==='khs-event-jeamri'")
        page.locator('#b2d').click(); open_feature('jeamri')
        page.locator('[data-event-date]').click()
        page.wait_for_function("document.querySelector('#evi').textContent.includes('1919년 4월 15일')")
        assert '대한민국역사박물관' in page.locator('#evi').inner_text()
        open_feature('jeamri'); page.screenshot(path=str(args.out / 'map.png'))

        page.locator('#lensSelect').select_option('cliopatria-korea')
        page.wait_for_function("document.querySelector('#historyMapBtn').textContent.includes('4개')")
        assert page.locator('#historyLevel').input_value() == '0'
        page.locator('#lensSelect').select_option('hgis-1910-1945')
        page.wait_for_function("document.querySelector('#historyMapBtn').textContent.includes('26개')")
        assert page.locator('#historyLevel').input_value() == '1'
        page.locator('#lensSelect').select_option('khs-events')
        page.wait_for_function("document.querySelector('#historyMapBtn').textContent==='사건 장소 1개 · 근거'")
        page.set_viewport_size({'width': 480, 'height': 900})
        if page.locator('#sourcesBtn').get_attribute('aria-expanded') != 'true':
            page.locator('#sourcesBtn').click()
        open_feature('haengju')
        assert page.locator('#evi').is_visible() and '행주' in page.locator('#evi h3').inner_text()
        page.screenshot(path=str(args.out / 'mobile.png'))
        assert not errors, errors
        browser.close()
    report = {'base': args.base, 'features': 5, 'claims': 15, 'checks': {
        'reference_years': True, 'raw_coordinates': True, 'separate_event_and_date_evidence': True,
        'requires_date_source': True, 'event_place_graph': True, 'canvas_strokes': True,
        'three_point_geometry': True, 'source_and_ai_filters': True, 'timeline_changes_site': True,
        'switches_map_kind': True, 'mobile': True}, 'pageErrors': errors}
    (args.out / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(report, ensure_ascii=False))


if __name__ == '__main__':
    main()
