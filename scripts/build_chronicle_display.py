"""Prepare display-only geography and a subset of the original Fantology catalog (#94)."""
import argparse
import gzip
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--catalog', type=Path, required=True)
    args = parser.parse_args()
    source = json.loads(args.catalog.read_text(encoding='utf-8'))
    wanted = {'human', 'scribe', 'monk', 'spearman', 'chancellor', 'battle', 'hanging_scroll',
              'pine', 'fir', 'oak', 'house', 'courtyard_house', 'pagoda', 'academy_hall', 'gatehouse', 'farmhouse'}
    catalog = {k: v for k, v in source.items() if k not in ('categories', 'blueprints', 'coreOverrides')}
    catalog['categories'] = {}
    for key, category in source['categories'].items():
        cores = [c for c in category['cores'] if c.split('|')[0] in wanted]
        if cores:
            catalog['categories'][key] = {**category, 'cores': cores}
    catalog['blueprints'] = {k: source['blueprints'][k] for k in sorted(wanted)}
    catalog['coreOverrides'] = {k: v for k, v in source['coreOverrides'].items() if k in wanted}
    app = ROOT / 'services/host/app'
    (app / 'history-asset-catalog.json').write_text(json.dumps(catalog, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    path = ROOT / 'data/maps/cliopatria-korea-v013.geojson.gz'
    features = json.load(gzip.open(path))['features']
    feature = next(f for f in features if f['id'] == 'cliopatria-13124')
    outline = {'type': 'Feature', 'properties': {
        'purpose': 'Fixed peninsula display silhouette, not the political boundary of the selected year.',
        'sourceFile': 'data/maps/cliopatria-korea-v013.geojson.gz',
        'sourceFeature': feature['id'], 'sourceSha256': hashlib.sha256(path.read_bytes()).hexdigest(),
        'sourceProperties': feature['properties']}, 'geometry': feature['geometry']}
    (app / 'korea-outline.json').write_text(json.dumps(outline, ensure_ascii=False, separators=(',', ':'))+'\n', encoding='utf-8')
    district_path = ROOT / 'data/maps/hgis-districts-1910-1945.geojson.gz'
    groups = {}
    for district in json.load(gzip.open(district_path))['features']:
        props = district['properties']
        name = props['sourceRecord']['name']
        if name[-1:] in ('군', '부', '시'):
            name = name[:-1]
        if len(name) < 2:
            continue
        geometry = district['geometry']
        polygons = [geometry['coordinates']] if geometry['type'] == 'Polygon' else geometry['coordinates']
        ring = max((p[0] for p in polygons), key=len)
        lon = (min(p[0] for p in ring)+max(p[0] for p in ring))/2
        lat = (min(p[1] for p in ring)+max(p[1] for p in ring))/2
        groups.setdefault(name, []).append({'id': district['id'], 'labelKo': name, 'label': name,
            'candidates': [{'lon': lon, 'lat': lat, 'basis': '국편 1910~1945 경계 자료의 범위 중심 · 화면 배치 참고점',
                'claimId': props['claimId'], 'citesChunk': props['citesChunk'], 'fromSource': props['fromSource']}],
            'displayReference': True})
    anchors = []
    for records in groups.values():
        first = records[0]['candidates'][0]
        if all(abs(r['candidates'][0]['lon']-first['lon']) < .5 and abs(r['candidates'][0]['lat']-first['lat']) < .5 for r in records):
            anchors.append(records[0])
    (app / 'history-place-anchors.json').write_text(json.dumps({'purpose': 'Display references; not historical location claims.',
        'sourceFile': str(district_path.relative_to(ROOT)), 'sourceSha256': hashlib.sha256(district_path.read_bytes()).hexdigest(),
        'places': anchors}, ensure_ascii=False, separators=(',', ':'))+'\n', encoding='utf-8')
    terrain = args.catalog.with_name('terrain.js').read_text(encoding='utf-8')
    tree = 'function makeTreeGeometry() {' + terrain.split('function makeTreeGeometry() {', 1)[1].split('\n}', 1)[0] + '\n}'
    proof = {'source': '/home/lia/fantology/services/host/app/asset-catalog.json',
        'originalCatalogSha256': hashlib.sha256(args.catalog.read_bytes()).hexdigest(), 'selectedCores': sorted(wanted),
        'treeSource': '/home/lia/fantology/services/host/app/terrain.js:makeTreeGeometry',
        'treeFunctionSha256': hashlib.sha256(tree.encode()).hexdigest(),
        'blueprintSha256': {k: hashlib.sha256(json.dumps(v, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
            for k, v in catalog['blueprints'].items()}}
    (ROOT / 'docs/research/peninsula-assets-94.json').write_text(json.dumps(proof, indent=2)+'\n', encoding='utf-8')
    print(f'{len(wanted)} original blueprints; outline {feature["id"]}')


if __name__ == '__main__':
    main()
