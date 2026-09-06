"""Preserve selected Korean polity records from the published Cliopatria v0.1.3 dataset."""
import argparse
from collections import Counter
import gzip
import hashlib
import json
from pathlib import Path
import shutil
import zipfile
import shapely
from import_location_research import markdown, write_same

SOURCE = 'src-cliopatria-korea-v013'
MAP = 'cliopatria-korea-v013'
URL = 'https://github.com/Seshat-Global-History-Databank/cliopatria/tree/v0.1.3'
ZIP_SHA = 'a6417c73f16049ff7a21c75dce52dde641b659255e22ed30294b47a35b664123'
NAMES = {'Gojoseon': '고조선', 'Korean Jin': '진', 'Byeonhan': '변한', 'Jinhan': '진한', 'Mahan': '마한',
         'Goguryeo': '고구려', 'Baekje': '백제', 'Silla': '신라', 'Unified Silla': '통일신라',
         'Balhae': '발해', 'Hubaekje': '후백제', 'Taebong': '태봉', 'Goryeo': '고려', 'Joseon': '조선',
         'Korean Empire': '대한제국', "Democratic People's Republic of Korea": '북한', 'Republic of Korea': '대한민국'}


def canonical(value): return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':'))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--zip', type=Path, required=True)
    ap.add_argument('--research', type=Path, required=True)
    ap.add_argument('--data', type=Path, default=Path('data'))
    ap.add_argument('--out', type=Path, required=True)
    args = ap.parse_args()
    run = json.loads((args.research/'run.json').read_text(encoding='utf-8'))
    assert 'claude-opus-5' in run['modelsObserved'] and run['effort'] == 'max'
    assert hashlib.sha256(args.zip.read_bytes()).hexdigest() == ZIP_SHA
    with zipfile.ZipFile(args.zip) as archive:
        member = 'cliopatria_polities_only.geojson'; raw = archive.read(member); dataset = json.loads(raw)
    assert dataset['crs']['properties']['name'] == 'urn:ogc:def:crs:OGC:1.3:CRS84'
    features, chunks, records, invalid, invalid_display = [], [], [], [], []
    counts = Counter(); vertices = Counter()
    for index, feature in enumerate(dataset['features']):
        original = feature['properties']
        if original['Name'] not in NAMES: continue
        assert original['Type'] == 'POLITY'
        start, end = original['FromYear'], original['ToYear']
        assert isinstance(start, int) and isinstance(end, int) and start <= end
        geometry_hash = hashlib.sha256(canonical(feature['geometry']).encode()).hexdigest()
        shape = shapely.from_geojson(json.dumps(feature['geometry']))
        assert shape.geom_type in ('Polygon', 'MultiPolygon') and not shape.is_empty
        display = shapely.simplify(shape, .002, preserve_topology=True)
        fid = f'cliopatria-{index:05d}'
        if not shape.is_valid: invalid.append(fid)
        if not display.is_valid: invalid_display.append(fid)
        vertices['original'] += int(shapely.get_num_coordinates(shape))
        vertices['display'] += int(shapely.get_num_coordinates(display))
        record = {'recordIndex': index, 'properties': original, 'geometrySha256': geometry_hash}
        text = json.dumps(record, ensure_ascii=False, sort_keys=True, indent=2)
        cid = 'chunk_'+fid; claimid = 'claim-'+fid+'-boundary'; eid = 'place-'+fid
        label = NAMES[original['Name']]+' · '+original['Name']
        chunk = {'id': cid, 'sourceId': SOURCE, 'text': text, 'chunkType': 'dataset-record',
                 'locator': f'{member} › features[{index}]', 'permalink': URL, 'lang': 'en',
                 'geometrySha256': geometry_hash}
        chunks.append(chunk); records.append(record); counts[original['Name']] += 1
        outside = shape.bounds[0] < 123 or shape.bounds[2] > 132 or shape.bounds[1] < 33 or shape.bounds[3] > 43.5
        properties = {'id': fid, 'label': label, 'kind': 'polity-boundary', 'fromSource': SOURCE,
                      'origin': 'ai', 'claimId': claimid, 'citesChunk': cid, 'validFrom': start, 'validTo': end,
                      'begin': str(start), 'end': str(end), 'sourceRecord': original,
                      'originalGeometrySha256': geometry_hash, 'originalGeometryValid': bool(shape.is_valid),
                      'originalGeometryIssue': None if shape.is_valid else shapely.is_valid_reason(shape),
                      'displayGeometryValid': bool(display.is_valid),
                      'displayGeometryIssue': None if display.is_valid else shapely.is_valid_reason(display),
                      'precision': 'display-simplification-0.002-degrees', 'outsideDiorama': outside,
                      'bounds': list(shape.bounds), 'recordIndex': index}
        features.append({'type': 'Feature', 'id': fid, 'properties': properties,
                         'geometry': json.loads(shapely.to_geojson(display))})
        write_same(args.data/'entities/place'/(eid+'.md'), markdown(
            {'type': 'Place', 'id': eid, 'label': label+' (Cliopatria '+str(index)+')'},
            '이 데이터셋의 특정 기간 경계 레코드다. 기존 역사 국가·지명 엔티티와 합치지 않는다.'))
        claim = {'id': claimid, 'subject': eid, 'predicate': 'syj:hasBoundaryRecord',
                 'object': {'kind': 'literal', 'value': MAP+'.geojson#'+fid},
                 'fromSource': SOURCE, 'citesChunk': cid, 'quote': text, 'origin': 'ai', 'status': 'draft',
                 'validFrom': start, 'validTo': end, 'generatedBy': 'codex', 'generatedAt': '2026-09-07',
                 'note': 'Cliopatria v0.1.3의 한 경계 견해다. FromYear/ToYear를 그대로 보존하며 음수는 제공처의 BCE 표기다. '
                         '해당 국가의 실제 건국·멸망 연도로 판정하지 않는다. 원 도형은 CRS84 경도·위도이며 표시용으로 0.002도 단순화했다.'}
        write_same(args.data/'claims'/SOURCE.removeprefix('src-')/(cid+'.md'), markdown(
            {'type': 'Claims', 'source': SOURCE, 'chunk': cid, 'status': 'draft', 'generated_by': 'codex'},
            '```claims-json\n'+json.dumps([claim], ensure_ascii=False, indent=2)+'\n```'))
    assert len(features) == 94 and len(counts) == 17
    write_same(args.data/'sources'/SOURCE.removeprefix('src-')/'chunks.jsonl',
               ''.join(json.dumps(c, ensure_ascii=False, sort_keys=True)+'\n' for c in chunks))
    map_path = args.data/'maps'/(MAP+'.geojson.gz'); map_path.parent.mkdir(parents=True, exist_ok=True)
    payload = canonical({'type': 'FeatureCollection', 'features': features}).encode()
    compressed = gzip.compress(payload, mtime=0)
    if map_path.exists(): assert map_path.read_bytes() == compressed
    map_path.write_bytes(compressed)
    write_same(args.data/'sources'/(SOURCE.removeprefix('src-')+'.md'), markdown({
        'type': 'Source', 'id': SOURCE, 'label': 'Cliopatria · 한국사 국가 경계 94개',
        'sourceKind': '현대 연구 데이터셋 · 역사 정치집단 경계', 'sourceGroup': '역사 공간 자료',
        'compiler': 'Ed Chalstrey · James Bennett · Seshat Global History Databank',
        'composedYear': 2025, 'coversFrom': min(p['properties']['validFrom'] for p in features),
        'coversTo': max(p['properties']['validTo'] for p in features), 'defaultLens': False, 'resource': URL,
        'edition': 'v0.1.3 · 2025-01-21', 'license': 'CC-BY-4.0', 'status': 'draft', 'verified': None,
    }, 'Cliopatria v0.1.3에서 한국사 관련 국가·정치집단 17개 이름에 해당하는 경계 레코드 94개를 선택했다.\n\n'
       '한 데이터셋의 시기별 경계 견해이며 확정 국경이 아니다. 원 FromYear·ToYear는 도형의 적용 기간이다. '
       '다른 사료의 건국·멸망 연도를 이 값으로 바꾸지 않는다. 원 데이터에 없는 해와 국가는 채우지 않는다.\n\n'
       '제공: Ed Chalstrey, James Bennett, Seshat Global History Databank. '
       '[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) · '
       '[배포본](https://zenodo.org/records/14714684) · '
       '[이용조건](https://github.com/Seshat-Global-History-Databank/cliopatria/blob/v0.1.3/LICENSE.md).\n\n'
       '수정: 한국사 이름 선택, 표시 이름에 한글 병기, 도형 0.002도 단순화. 원 필드와 도형 해시를 보존한다. '
       '원 데이터의 위키백과·Seshat 식별자는 참고 연결이며 개별 고지도와의 대조를 마친 근거가 아니다. '
       '조사 Claude Opus 5 / Max, 배포본 대조·변환 Codex. 사람의 역사 경계 검토는 없다.'))
    lens_path = args.data/'lenses.json'; lenses = json.loads(lens_path.read_text(encoding='utf-8'))
    lens = {'id': 'cliopatria-korea', 'label': 'Cliopatria · 국가 경계',
            'description': '한국사 관련 17개 정치집단의 시기별 경계 견해. 개별 국가의 건국·멸망 연도와 구분한다.',
            'sources': [SOURCE], 'year': 500, 'historyLevel': 0}
    lenses['lenses'] = [l for l in lenses['lenses'] if l['id'] != lens['id']] + [lens]
    lens_path.write_text(json.dumps(lenses, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    report = {'zipSha256': ZIP_SHA, 'member': member, 'memberSha256': hashlib.sha256(raw).hexdigest(),
              'upstreamFeatures': len(dataset['features']), 'selected': len(features), 'names': dict(counts),
              'crs': dataset['crs'], 'originalInvalid': invalid, 'displayInvalid': invalid_display,
              'vertices': dict(vertices), 'records': records, 'mapBytes': len(compressed),
              'mapSha256': hashlib.sha256(compressed).hexdigest(), 'humanReviewed': False,
              'researchSession': run['sessionId'], 'researchExitCode': run['exitCode'],
              'researchIsError': run['isError'], 'researchLeadOnly': True}
    saved = args.data/'research/cliopatria-79'; saved.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(args.research/'run.json', saved/'run.json')
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(json.dumps({k: v for k, v in report.items() if k != 'records'}, ensure_ascii=False))


if __name__ == '__main__': main()
