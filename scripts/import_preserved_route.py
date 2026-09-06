"""Import the supplied modern course separately from the heritage description."""
import argparse
import gzip
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import xml.etree.ElementTree as ET
import zipfile

from import_location_research import markdown, write_same
from inspect_preserved_route import inspect

TRACK = 'komount-daegwallyeong-2023'
HISTORY = 'khs-daegwallyeong-description'
FEATURE = 'komount-daegwallyeong-0008'
PAGE = 'https://www.data.go.kr/data/15108080/fileData.do'
HERITAGE = 'https://www.heritage.go.kr/heri/cul/culSelectDetail.do?ccbaCpno=1353200740000'
QUOTE = '대관령 옛길은 고려시대와 조선시대 이래 주요 교통로의 역할뿐 아니라'
BASIS = '공식 코스 범례의 대관령옛길과 연결한 현재 안내 트랙이다. 932개 좌표의 원 순서를 유지했다. GPX 1.1은 WGS84를 선언한다. 모든 고도가 0이고 지점 시각이 같아 실측 고도·속도의 근거로 쓰지 않는다.'
PERIOD = '제공 자료의 기준일은 2023-08-25다. 2023년에만 참고 표시하며 옛길의 존속 기간이 아니다. GPX의 2022년 원시각도 조선 당시 연도로 바꾸지 않는다.'
RELATION = '국가유산청은 같은 이름의 옛길을 역사적으로 설명한다. 이 GPX와 지정구역·고려 또는 조선의 노선이 일치한다는 근거는 확인하지 못했다. 두 장소를 같은 엔티티로 합치지 않았다.'


class Text(HTMLParser):
    def __init__(self):
        super().__init__(); self.parts = []
    def handle_data(self, text):
        self.parts.append(text)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--zip', type=Path, default=Path('data/research/preserved-routes-57/15108080.zip'))
    ap.add_argument('--description', type=Path, required=True)
    ap.add_argument('--research', type=Path, required=True)
    ap.add_argument('--data', type=Path, default=Path('data'))
    ap.add_argument('--out', type=Path, required=True)
    args = ap.parse_args()
    run = json.loads((args.research/'run.json').read_text(encoding='utf-8'))
    result = json.loads((args.research/'result.json').read_text(encoding='utf-8'))
    assert run['exitCode'] == 0 and run['isError'] is False
    assert run['modelsObserved'] == ['claude-opus-5'] and run['effort'] == 'max'
    assert result['integrationReadyCurrentReference'] is True
    assert result['integrationReadyHistoricalRoute'] is False
    inspected = inspect(args.zip)
    raw = args.description.read_bytes()
    assert hashlib.sha256(raw).hexdigest() == 'e3da3193933d56ef2841e10e837d6b3b01f4c4aff2b07f54c104eb209b1a78f7'
    parser = Text(); parser.feed(raw.decode('utf-8'))
    assert QUOTE in ''.join(parser.parts) and len(QUOTE.split()) <= 25
    with zipfile.ZipFile(args.zip) as archive:
        root = ET.fromstring(archive.read(inspected['file']))
    ns = {'g': 'http://www.topografix.com/GPX/1/1'}
    lines = [[[float(p.get('lon')), float(p.get('lat'))] for p in segment.findall('g:trkpt', ns)]
             for segment in root.findall('g:trk/g:trkseg', ns)]
    assert hashlib.sha256(json.dumps(lines, separators=(',', ':')).encode()).hexdigest() == inspected['coordinatesSha256']
    record = {k: inspected[k] for k in ('dataset', 'zipSha256', 'selectedCourse', 'file', 'fileBytes', 'fileSha256',
               'gpxVersion', 'segments', 'points', 'coordinatesSha256', 'allElevationsAsWritten', 'allPointTimesAsWritten', 'metadataTimeAsWritten')}
    record.update(dataAsOf='2023-08-25', creator=root.get('creator'), geometry={'type': 'LineString', 'coordinates': lines[0]})
    chunks = [
        {'id': 'chunk_'+TRACK+'-record', 'sourceId': 'src-'+TRACK, 'text': json.dumps(record, ensure_ascii=False, sort_keys=True),
         'permalink': PAGE, 'locator': inspected['file'], 'lang': 'und', 'date': None, 'chunkType': 'dataset-record'},
        {'id': 'chunk_'+HISTORY, 'sourceId': 'src-'+HISTORY, 'text': QUOTE, 'permalink': HERITAGE,
         'locator': '국가유산 설명 · 한국어 본문', 'lang': 'ko', 'date': None, 'chunkType': 'excerpt',
         'contentUrl': 'https://www.heritage.go.kr/DATA1/heritage/hub_img/html/cul_1353200740000.html',
         'originalResponseSha256': hashlib.sha256(raw).hexdigest()},
    ]
    entities = ['place-komount-daegwallyeong-0008', 'place-khs-daegwallyeong']
    labels = ['대관령옛길 · 2023년 안내 코스', '대관령 옛길 · 국가유산청 설명의 대상']
    claim_ids = ['claim-komount-daegwallyeong-track', 'claim-khs-daegwallyeong-road']
    claims = []
    for index, row in enumerate(chunks):
        slug = row['sourceId'].removeprefix('src-')
        claim = {'id': claim_ids[index], 'subject': entities[index],
                 'predicate': 'syj:hasRouteRecord' if index == 0 else 'syj:describedAs',
                 'object': {'kind': 'literal', 'value': 'historical-routes.geojson#'+FEATURE if index == 0 else '고려시대와 조선시대 이래 주요 교통로'},
                 'fromSource': row['sourceId'], 'citesChunk': row['id'], 'quote': row['text'],
                 'origin': 'ai', 'status': 'draft', 'generatedBy': 'codex', 'generatedAt': '2026-09-07',
                 'note': BASIS+' '+PERIOD if index == 0 else RELATION}
        if index == 0:
            claim.update(validFrom=2023, validTo=2023)
        claims.append(claim)
        write_same(args.data/'sources'/slug/'chunks.jsonl', json.dumps(row, ensure_ascii=False, sort_keys=True)+'\n')
        write_same(args.data/'claims'/slug/(row['id']+'.md'), markdown(
            {'type': 'Claims', 'source': row['sourceId'], 'chunk': row['id'], 'status': 'draft'},
            '```claims-json\n'+json.dumps([claim], ensure_ascii=False, indent=2)+'\n```'))
        write_same(args.data/'entities/place'/(entities[index]+'.md'), markdown(
            {'type': 'Place', 'id': entities[index], 'label': labels[index]}, RELATION))
        write_same(args.data/'sources'/(slug+'.md'), markdown({
            'type': 'Source', 'id': row['sourceId'], 'label': '국가숲길 · 대관령옛길 2023년 코스' if index == 0 else '국가유산청 · 대관령 옛길 설명',
            'sourceKind': '현재 안내 트랙' if index == 0 else '현대 기관 해설 발췌', 'sourceGroup': '옛길 참고 자료',
            'compiler': '한국등산트레킹지원센터' if index == 0 else '국가유산청', 'resource': row['permalink'],
            'composedYear': None, 'coversFrom': 2023 if index == 0 else None, 'coversTo': 2023 if index == 0 else None,
            'license': '이용허락범위 제한 없음' if index == 0 else 'short-excerpt-only',
            'defaultLens': False, 'status': 'draft', 'verified': None,
        }, (BASIS+'\n\n'+PERIOD+'\n\n포털은 무료·이용허락범위 제한 없음으로 배포한다. 원 ZIP의 범례·GPX와 Tranggle 제작 도구 표기를 보존했다.'
            if index == 0 else '국가유산포털 본문에서 짧은 구절만 인용한다. 본문·사진 전체의 재배포 허용으로 넓히지 않는다.')+'\n\n'+RELATION))
    feature = {'type': 'Feature', 'id': FEATURE, 'geometry': record['geometry'], 'properties': {
        'label': labels[0], 'kind': 'current-old-road-track', 'fromSource': chunks[0]['sourceId'],
        'requiredSources': [c['sourceId'] for c in chunks], 'origin': 'ai', 'validFrom': 2023, 'validTo': 2023,
        'begin': '2023-08-25 기준', 'end': '동일 기준일 자료', 'sourceRecord': record, 'claimId': claim_ids[0],
        'citesChunk': chunks[0]['id'], 'basis': BASIS, 'periodNote': PERIOD, 'placeId': entities[0],
        'historyChunk': chunks[1]['id'], 'historySource': chunks[1]['sourceId'], 'historyQuote': QUOTE,
        'historyPlaceId': entities[1], 'historyClaimId': claim_ids[1], 'relatedHistoryNote': RELATION,
        'historicalValidFrom': None, 'historicalValidTo': None, 'heritageGeometryEquivalenceConfirmed': False,
    }}
    path = args.data/'maps/historical-routes.geojson.gz'; path.parent.mkdir(parents=True, exist_ok=True)
    catalog = json.loads(gzip.decompress(path.read_bytes())) if path.exists() else {'type': 'FeatureCollection', 'features': []}
    catalog['features'] = [f for f in catalog['features'] if f['id'] != FEATURE] + [feature]
    path.write_bytes(gzip.compress(json.dumps(catalog, ensure_ascii=False, sort_keys=True).encode(), mtime=0))
    lens_path = args.data/'lenses.json'
    lenses = json.loads(lens_path.read_text(encoding='utf-8')) if lens_path.exists() else {'lenses': []}
    lens = {'id': 'daegwallyeong-current', 'label': '대관령옛길 · 현재 안내',
            'description': '2023년 기준 안내 트랙과 별도 역사 설명. 당시 노선·지정구역과 같은 선인지는 미확인이다.',
            'sources': [c['sourceId'] for c in chunks], 'year': 2023, 'historyLevel': 5}
    lenses['lenses'] = [l for l in lenses['lenses'] if l['id'] != lens['id']] + [lens]
    lens_path.write_text(json.dumps(lenses, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    report = {'sources': 2, 'chunks': 2, 'claims': 2, 'currentTracks': 1, 'verifiedHistoricalTracks': 0,
              'coordinatesUnchanged': True, 'newConnections': 0, 'points': 932, 'distinctEntities': entities,
              'geometryEquivalenceClaimed': False, 'historicalPeriodClaimed': False,
              'researchSession': run['sessionId'], 'sourceRecord': record}
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(json.dumps({k: v for k, v in report.items() if k != 'sourceRecord'}, ensure_ascii=False))


if __name__ == '__main__':
    main()
