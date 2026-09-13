"""Build reference polygons from the stored HGIS provinces (requires Shapely 2)."""
import gzip
import json
from hashlib import sha256
from pathlib import Path

from shapely import make_valid, union_all
from shapely.geometry import MultiPolygon, Polygon, box, mapping, shape

ROOT = Path(__file__).resolve().parents[1]
SOURCE = 'src-hgis-admin-1910-1945'
CATALOG = 'polity-gap-1911-1947'


def main():
    data = ROOT / 'data'
    source = data / 'maps/hgis-provinces-1910-1945.geojson.gz'
    source_hash = sha256(source.read_bytes()).hexdigest()
    with gzip.open(source, 'rt', encoding='utf-8') as stream:
        provinces = json.load(stream)['features']
    selected = sorted((f for f in provinces if f['properties']['validFrom'] <= 1940 <= f['properties']['validTo']),
                      key=lambda f: f['id'])
    if len(selected) != 13:
        raise ValueError(f'Expected 13 provinces for 1940, got {len(selected)}')
    geography = union_all([make_valid(shape(f['geometry'])) for f in selected])
    # Close province seams, then use the catalog display precision.
    geography = geography.buffer(.0005).buffer(-.0005).simplify(.002, preserve_topology=True)
    # 도 경계 이음새가 내부 구멍(104개)으로 남아 이름표 자리(최대 여유 반지름) 계산을 막는다.
    # 실제 호수가 아니므로 구멍을 버리고, 채색에 보이지 않는 미세 섬(1e-5 deg² 미만)도 뺀다.
    parts = [Polygon(part.exterior) for part in getattr(geography, 'geoms', [geography])
             if part.geom_type == 'Polygon' and part.area >= 1e-5]
    geography = MultiPolygon(parts)
    if geography.is_empty or not geography.is_valid:
        raise ValueError('Province union must be nonempty and valid')
    method = ('1940 province selection; make_valid; union; buffer(0.0005)/buffer(-0.0005); '
              'simplify(0.002 degrees, preserve_topology=True); interiors dropped (province seams); '
              'parts below 1e-5 deg^2 dropped; 1945-1947 intersection(latitude <= 38.0 degrees) '
              'and intersection(latitude >= 38.0 degrees) after simplification')

    # 연 단위 화면은 1945년 8월 광복 이후를 표시한다. 군정 도형과 겹치지 않게 1944년까지 둔다.
    # mapLabel 은 지도 위 이름표다. 이름표 글자 크기가 도형 여유 반지름에 비례해 6자 이상은 어느 줌에서도 숨겨지므로 5자 이내로 둔다.
    periods = [
        ('joseon-1911-1944', '일제강점기 조선', 'Korea under Japanese rule', 1911, 1944, geography, '일제강점기'),
        ('usamgik-1945-1947', '38도선 이남 (미군정)', 'US Army Military Government in Korea', 1945, 1947,
         geography.intersection(box(-180, -90, 180, 38)), '미군정'),
        ('soviet-1945-1947', '38도선 이북 (소련군정)', 'Soviet Civil Administration', 1945, 1947,
         geography.intersection(box(-180, 38, 180, 90)), '소련군정'),
    ]
    features = []
    for suffix, korean, english, start, end, geometry, map_label in periods:
        if geometry.is_empty or not geometry.is_valid or geometry.geom_type not in ('Polygon', 'MultiPolygon'):
            raise ValueError(f'Invalid reference polygon: {suffix}')
        feature_id = 'polity-gap-' + suffix
        properties = {
            'id': feature_id, 'label': korean + ' · ' + english, 'mapLabel': map_label, 'kind': 'polity-boundary',
            'precision': 'reference-union-0.002-degrees', 'fromSource': SOURCE, 'origin': 'ai',
            'validFrom': start, 'validTo': end, 'begin': str(start), 'end': str(end),
            'bounds': list(geometry.bounds), 'outsideDiorama': False,
            'displayGeometryValid': True, 'originalGeometryValid': True,
            'displayGeometryIssue': None, 'originalGeometryIssue': None,
            'sourceRecord': {'Name': english, 'FromYear': start, 'ToYear': end, 'derived': True},
            'derivedFrom': [f['id'] for f in selected],
            'derivedLabels': [f['properties']['label'] for f in selected],
            'claimId': selected[0]['properties']['claimId'], 'citesChunk': selected[0]['properties']['citesChunk'],
        }
        features.append({'type': 'Feature', 'id': feature_id, 'properties': properties, 'geometry': mapping(geometry)})

    payload = json.dumps({'type': 'FeatureCollection', 'name': CATALOG,
                          'generated': {'method': method, 'referenceYear': 1940,
                                        'sourceFileSha256': source_hash, 'inputs': [f['id'] for f in selected]},
                          'features': features}, ensure_ascii=False,
                         sort_keys=True, separators=(',', ':')).encode('utf-8')
    output = data / 'maps' / (CATALOG + '.geojson.gz')
    output.write_bytes(gzip.compress(payload, mtime=0))
    print(json.dumps({'provinces': len(selected), 'features': len(features),
                      'sha256': sha256(output.read_bytes()).hexdigest()}))


if __name__ == '__main__':
    main()
