"""Exercise the real supplied 932-point course, its separate evidence and the live viewer."""
import argparse
import json
from pathlib import Path
from urllib.parse import urlencode
import xml.etree.ElementTree as ET
import zipfile

from playwright.sync_api import sync_playwright
from verify_viewer import LAUNCH_ARGS


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--base', default='http://127.0.0.1:8870')
    ap.add_argument('--zip', type=Path, default=Path('data/research/preserved-routes-57/15108080.zip'))
    ap.add_argument('--out', type=Path, required=True)
    args = ap.parse_args(); args.out.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(args.zip) as archive:
        root = ET.fromstring(archive.read('9900000003_대관령숲길/대관령숲길_0000000008.gpx'))
    raw_coordinates = [[float(p.get('lon')), float(p.get('lat'))] for p in root.findall('.//{http://www.topografix.com/GPX/1/1}trkpt')]
    assert len(raw_coordinates) == 932
    sources = ['src-komount-daegwallyeong-2023', 'src-khs-daegwallyeong-description']
    errors = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=LAUNCH_ARGS)
        page = browser.new_page(viewport={'width': 1440, 'height': 1000})
        page.on('pageerror', lambda error: errors.append(str(error)))
        def get(path, **query):
            response = page.request.get(args.base+path+'?'+urlencode(query), timeout=180000)
            assert response.ok, (path, response.status)
            return response.json()
        def rows(**query):
            return get('/api/history-map', level=5, **query)['features']
        records = rows(year=2023, sources=','.join(sources))
        assert len(records) == 1
        feature = records[0]; prop = feature['properties']
        assert prop['kind'] == 'current-old-road-track'
        assert feature['geometry'] == {'type': 'LineString', 'coordinates': raw_coordinates}
        assert prop['historicalValidFrom'] is None and prop['historicalValidTo'] is None
        assert prop['heritageGeometryEquivalenceConfirmed'] is False
        track = get('/api/chunk', id=prop['citesChunk'])['chunk']
        history = get('/api/chunk', id=prop['historyChunk'])['chunk']
        assert json.loads(track['text']) == prop['sourceRecord']
        assert history['text'] == prop['historyQuote'] and history['sourceId'] == sources[1]
        assert track['sourceId'] == sources[0] and history['text'] not in track['text']
        for key, entity, source in [('claimId', 'placeId', sources[0]), ('historyClaimId', 'historyPlaceId', sources[1])]:
            graph = get('/api/graph', entity=prop[entity], sources=source)
            claim = next(c for c in graph['claims'] if c['id'] == prop[key])
            assert claim['fromSource'] == source and claim['predicate'] != 'syj:sameAs'
        assert prop['placeId'] != prop['historyPlaceId']
        for query in ({'year': 1593}, {'year': 2022}, {'year': 2024}, {'sources': ''},
                      {'sources': sources[0]}, {'sources': sources[1]}, {'origin': 'human'}):
            assert not rows(**query), query
        page.add_init_script('''(()=>{
          for(const [method,op] of [['moveTo','M'],['lineTo','L']]){
            const original=Path2D.prototype[method];Path2D.prototype[method]=function(x,y){
              (this.points??=[]).push({op,x,y});return original.call(this,x,y);};
          }
          const stroke=CanvasRenderingContext2D.prototype.stroke;
          CanvasRenderingContext2D.prototype.stroke=function(path){
            if(this.canvas.id==='map'&&this.strokeStyle.toLowerCase()==='#d8b463'&&path?.points)window.__routePath=path;
            return stroke.apply(this,arguments);
          };
        })();''')
        page.goto(args.base+'/?q=low', wait_until='networkidle', timeout=180000)
        page.locator('#enter').click(); page.locator('#gate').wait_for(state='hidden')
        page.locator('#lensSelect').select_option('daegwallyeong-current')
        page.wait_for_function("document.querySelector('#historyMapBtn').textContent.includes('1개')&&window.__routePath?.points.length===932")
        assert page.locator('#yearV').inner_text() == '2023'
        commands = page.evaluate('window.__routePath.points.map(p=>p.op)')
        assert commands == ['M']+['L']*931
        point = page.evaluate('window.__routePath.points[400]')
        bounds = page.locator('#map').bounding_box()
        hit = page.evaluate('''p=>{const r=document.querySelector('#map').getBoundingClientRect();const el=document.elementFromPoint(r.x+p.x,r.y+p.y);return {tag:el?.tagName,id:el?.id,className:el?.className};}''', point)
        page.mouse.click(bounds['x']+point['x'], bounds['y']+point['y'])
        try:
            page.wait_for_function("document.querySelector('#evi h3')?.textContent.includes('현재 옛길 참고')")
        except Exception:
            (args.out/'pick-failure.json').write_text(json.dumps({'bounds': bounds, 'point': point, 'hitElement': hit,
                'evidence': page.locator('#evi').inner_text(), 'pageErrors': errors}, ensure_ascii=False, indent=2), encoding='utf-8')
            page.screenshot(path=str(args.out/'pick-failure.png'))
            raise
        assert '일치한다는 근거는 확인하지 못했다' in page.locator('#evi').inner_text()
        def open_feature():
            page.locator('#historyMapBtn').click()
            page.locator('[data-feature="komount-daegwallyeong-0008"]').click()
        page.locator('[data-history-chunk]').click()
        page.wait_for_function("document.querySelector('#evi').textContent.includes('coordinatesSha256')")
        open_feature(); page.locator('[data-history-description]').click()
        page.wait_for_function("document.querySelector('#evi').textContent.includes('고려시대와 조선시대')")
        assert '국가유산청' in page.locator('#evi').inner_text()
        open_feature(); page.screenshot(path=str(args.out/'map.png'))
        page.locator('#b3d').click()
        page.wait_for_function('window.__sigong?.world.historyTargets.length===1', timeout=180000)
        line = page.evaluate('''()=>{const o=window.__sigong.world.historyTargets[0];return {
          vertices:o.geometry.attributes.position.count,feature:o.userData.feature};}''')
        assert line['vertices'] == 1862 and line['feature']['geometry']['coordinates'] == raw_coordinates
        page.locator('#humanOnly').check(); page.wait_for_function('window.__sigong.world.historyTargets.length===0')
        page.locator('#humanOnly').uncheck(); page.wait_for_function('window.__sigong.world.historyTargets.length===1')
        page.locator('#noSources').click(); page.wait_for_function('window.__sigong.world.historyTargets.length===0')
        page.locator('#lensSelect').select_option('daegwallyeong-current')
        page.wait_for_function('window.__sigong.world.historyTargets.length===1')
        cursor = page.locator('#tl .tl-cursor'); cursor.focus(); cursor.press('ArrowLeft')
        page.wait_for_function("document.querySelector('#yearV').textContent==='2022'&&window.__sigong.world.historyTargets.length===0")
        cursor.press('ArrowRight'); page.wait_for_function('window.__sigong.world.historyTargets.length===1')
        page.locator('#lensSelect').select_option('khs-events')
        page.wait_for_function("document.querySelector('#historyLevel').value==='4'&&window.__sigong.world.historyTargets.length===1")
        page.locator('#lensSelect').select_option('daegwallyeong-current')
        page.wait_for_function("document.querySelector('#historyLevel').value==='5'&&window.__sigong.world.historyTargets.length===1")
        page.locator('#b2d').click(); page.set_viewport_size({'width': 480, 'height': 900})
        if page.locator('#sourcesBtn').get_attribute('aria-expanded') != 'true': page.locator('#sourcesBtn').click()
        open_feature()
        assert page.locator('#evi').is_visible()
        assert '2023년 안내 코스' in page.locator('#evi h3').inner_text()
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
        page.screenshot(path=str(args.out/'mobile.png'))
        assert not errors, errors
        browser.close()
    report = {'base': args.base, 'mode': 'real supplied GPX and live API; no synthetic responses',
              'currentTracks': 1, 'historicalTrackAcceptance': 'NOT_RUN: no verified past-era geometry',
              'points': 932, 'threeVertices': 1862, 'pageErrors': errors, 'checks': {
                  'all_raw_coordinates': True, 'source_records_and_separate_claims': True,
                  'distinct_entities_no_equivalence_claim': True, 'current_period_and_required_sources': True,
                  'real_canvas_pick_and_both_citations': True, 'three_line_geometry': True,
                  'ui_source_year_origin_filters': True, 'switches_map_kind': True, 'mobile': True}}
    (args.out/'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(json.dumps(report, ensure_ascii=False))


if __name__ == '__main__':
    main()
