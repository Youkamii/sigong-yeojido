"""Build reference polygons from the stored HGIS provinces (requires Shapely 2)."""
import gzip
import json
from hashlib import sha256
from pathlib import Path

from shapely import make_valid, union_all
from shapely.geometry import MultiPolygon, Polygon, box, mapping, shape

from import_location_research import markdown

ROOT = Path(__file__).resolve().parents[1]
SOURCE = 'src-hgis-admin-1910-1945'
CATALOG = 'polity-gap-1911-1947'


def main():
    data = ROOT / 'data'
    source = data / 'maps/hgis-provinces-1910-1945.geojson.gz'
    with gzip.open(source, 'rt', encoding='utf-8') as stream:
        provinces = json.load(stream)['features']
    selected = sorted((f for f in provinces if f['properties']['validFrom'] <= 1940 <= f['properties']['validTo']),
                      key=lambda f: f['id'])
    assert len(selected) == 13
    geography = union_all([make_valid(shape(f['geometry'])) for f in selected])
    # Same seam closing and simplification as build_peninsula_outline.py.
    geography = geography.buffer(.0005).buffer(-.0005).simplify(.0005, preserve_topology=True)
    # 도 경계 이음새가 내부 구멍(104개)으로 남아 이름표 자리(최대 여유 반지름) 계산을 막는다.
    # 실제 호수가 아니므로 구멍을 버리고, 채색에 보이지 않는 미세 섬(1e-5 deg² 미만)도 뺀다.
    parts = [Polygon(part.exterior) for part in getattr(geography, 'geoms', [geography])
             if part.geom_type == 'Polygon' and part.area >= 1e-5]
    geography = MultiPolygon(parts)
    assert geography.is_valid
    method = ('1940 province selection; make_valid; union; buffer(0.0005)/buffer(-0.0005); '
              'simplify(0.0005 degrees, preserve_topology=True); interiors dropped (province seams); '
              'parts below 1e-5 deg^2 dropped')

    # Claims describe only the source boundary records, not sovereignty or the 38th parallel.
    claims = []
    for feature in selected:
        p = feature['properties']
        claims.append({
            'id': 'claim-polity-gap-input-' + feature['id'],
            'subject': 'place-' + feature['id'], 'predicate': 'syj:hasBoundaryRecord',
            'object': {'kind': 'literal', 'value': 'hgis-provinces-1910-1945.geojson#' + feature['id']},
            'fromSource': SOURCE, 'citesChunk': p['citesChunk'],
            'quote': json.dumps(p['sourceRecord'], ensure_ascii=False, sort_keys=True, indent=2),
            'origin': 'ai', 'status': 'draft', 'validFrom': p['validFrom'], 'validTo': p['validTo'],
            'generatedBy': 'codex', 'generatedAt': '2026-09-13',
            'note': '참고 도형에 사용한 HGIS 경계 레코드의 근거다. 표시 연도와 합치기·38도선 분할 방법은 도형 메타데이터이며, 이 주장은 실제 국경·통치 범위를 뜻하지 않는다.'})

    # 연 단위 화면은 1945년 8월 광복 이후를 표시한다. 군정 도형과 겹치지 않게 1944년까지 둔다.
    # mapLabel 은 지도 위 이름표다. 이름표 글자 크기가 도형 여유 반지름에 비례해 6자 이상은 어느 줌에서도 숨겨지므로 5자 이내로 둔다.
    periods = [
        ('joseon-1911-1945', '조선 (일제강점기 · 조선총독부 관할)', 'Korea under Japanese rule', 1911, 1944, geography, '', '일제강점기'),
        ('usamgik-1945-1947', '38도선 이남 (미군정)', 'US Army Military Government in Korea', 1945, 1947,
         geography.intersection(box(-180, -90, 180, 38)), '; intersection(latitude <= 38.0 degrees)', '미군정'),
        ('soviet-1945-1947', '38도선 이북 (소련군정)', 'Soviet Civil Administration', 1945, 1947,
         geography.intersection(box(-180, 38, 180, 90)), '; intersection(latitude >= 38.0 degrees)', '소련군정'),
    ]
    features = []
    for suffix, korean, english, start, end, geometry, split, map_label in periods:
        assert not geometry.is_empty and geometry.is_valid and geometry.geom_type in ('Polygon', 'MultiPolygon')
        feature_id = 'polity-gap-' + suffix
        properties = {
            'id': feature_id, 'label': korean + ' · ' + english, 'mapLabel': map_label, 'kind': 'polity-reference',
            'precision': 'reference', 'fromSource': SOURCE, 'origin': 'ai',
            'validFrom': start, 'validTo': end,
            'sourceRecord': {'Name': english, 'FromYear': start, 'ToYear': end},
            'derivedFrom': [f['id'] for f in selected], 'method': method + split,
            'referenceYear': 1940, 'sourceSha256': sha256(source.read_bytes()).hexdigest(),
            'claimId': claims[0]['id'], 'citesChunk': claims[0]['citesChunk'],
            'claimIds': [c['id'] for c in claims], 'citesChunks': [c['citesChunk'] for c in claims],
            'note': '1940년 기준 13도 경계를 재사용한 참고도이며 실제 국경·통치 범위가 아니다. 1945년은 8월 광복 이후 기준으로 군정 도형만 표시한다.',
        }
        features.append({'type': 'Feature', 'id': feature_id, 'properties': properties, 'geometry': mapping(geometry)})

    payload = json.dumps({'type': 'FeatureCollection', 'features': features}, ensure_ascii=False,
                         sort_keys=True, separators=(',', ':')).encode('utf-8')
    output = data / 'maps' / (CATALOG + '.geojson.gz')
    output.write_bytes(gzip.compress(payload, mtime=0))
    claim_path = data / 'claims/hgis-admin-1910-1945' / (CATALOG + '.md')
    claim_path.write_text(markdown({'type': 'Claims', 'source': SOURCE, 'status': 'draft', 'generated_by': 'codex'},
                                  '```claims-json\n' + json.dumps(claims, ensure_ascii=False, indent=2) + '\n```'),
                          encoding='utf-8', newline='\n')
    print(json.dumps({'provinces': len(selected), 'features': len(features), 'claims': len(claims),
                      'sha256': sha256(output.read_bytes()).hexdigest()}))


if __name__ == '__main__':
    main()
