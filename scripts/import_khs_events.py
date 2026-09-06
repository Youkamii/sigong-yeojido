"""Connect researched events to the exact KHS catalog coordinates and short source excerpts."""
import argparse
from collections import defaultdict
import gzip
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import shutil
import xml.etree.ElementTree as ET
from import_location_research import markdown, write_same

QUOTES = [
    ('yongjang', 1270, '배중손이 이끌던 삼별초가 몽골의 침략에 대항하여 항쟁을 벌였던 장소이다.', '원종 11년(1270) 고려가 몽골에 항복을 하였다.'),
    ('haengju', 1593, '임진왜란(1592) 때 권율 장군의 행주대첩으로 널리 알려진 곳으로', '한편 행주대첩은 임진왜란 3대 대첩 중 하나로, 선조 26년(1593)에'),
    ('namhansanseong', 1636, '인조 14년(1636) 병자호란 때 왕이 이곳으로 피신하였는데,', None),
    ('jeamri', 1919, '3·1운동때 일제가 독립운동을 가장 잔인한 방법으로 탄압한 학살현장이다.', None),
    ('jeonnam-office', 1980, '1980년에는 5·18민주화운동의 산 현장으로서', None),
]


class Text(HTMLParser):
    def __init__(self):
        super().__init__(); self.parts = []
    def handle_data(self, value):
        self.parts.append(value)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--research', type=Path, required=True); ap.add_argument('--cache', type=Path, required=True)
    ap.add_argument('--data', type=Path, default=Path('data')); ap.add_argument('--out', type=Path, required=True)
    args = ap.parse_args()
    research = json.loads((args.research / 'result.json').read_text(encoding='utf-8'))
    run = json.loads((args.research / 'run.json').read_text(encoding='utf-8'))
    assert 'claude-opus-5' in run['modelsObserved'] and run['effort'] == 'max'
    checks = {r['url']: r for r in json.loads((args.cache / 'report.json').read_text(encoding='utf-8'))}
    chunks, claims, features, accepted = defaultdict(list), [], [], []

    def raw(url):
        check = checks[url]; assert check.get('robotsAllowed')
        data = (args.cache / check['file']).read_bytes()
        assert hashlib.sha256(data).hexdigest() == check['sha256']
        return data

    def chunk(sid, key, text, url, kind):
        row = {'id': 'chunk_' + key, 'sourceId': sid, 'text': text, 'permalink': url,
               'locator': key, 'lang': 'ko', 'chunkType': kind, 'date': None,
               'originalResponseSha256': checks[url]['sha256']}
        chunks[sid].append(row); return row

    def claim(key, subject, predicate, obj, row, note):
        record = {'id': 'claim-' + key, 'subject': subject, 'predicate': 'syj:' + predicate, 'object': obj,
                  'fromSource': row['sourceId'], 'citesChunk': row['id'], 'quote': row['text'],
                  'origin': 'ai', 'status': 'draft', 'generatedBy': 'codex', 'generatedAt': '2026-09-07', 'note': note}
        claims.append(record); return record

    museum_url = 'https://archive.much.go.kr/data/01/folderView.do?jobdirSeq=178'
    museum_quote = '1919년 4월 15일 제암리(현재의 화성시)에서'
    parser = Text(); parser.feed(raw(museum_url).decode('utf-8')); assert museum_quote in ''.join(parser.parts)
    museum = 'src-much-jeamri'
    museum_chunk = chunk(museum, 'much-jeamri-date', museum_quote, museum_url, 'excerpt')
    write_same(args.data / 'sources/much-jeamri.md', markdown({
        'type': 'Source', 'id': museum, 'label': '대한민국역사박물관 · 제암리 사건 날짜', 'sourceKind': '현대 기관 해설 발췌',
        'sourceGroup': '사건 관련 기관 자료', 'compiler': '대한민국역사박물관', 'resource': museum_url,
        'composedYear': None, 'coversFrom': 1919, 'coversTo': 1919, 'license': 'short-excerpt-only',
        'defaultLens': False, 'status': 'draft', 'verified': None,
    }, '기관 해설의 사건 날짜를 짧게 인용했다. 이 페이지의 박물관 주소를 제암리 좌표로 쓰지 않는다.'))

    for record, (key, year, event_quote, date_quote) in zip(research['records'], QUOTES, strict=True):
        url = record['locationEvidence']['detailSourceUrl']; tree = ET.fromstring(raw(url)); item = tree.find('item')
        assert tree.findtext('ccbaCpno') == record['identifiers']['ccbaCpno']
        text = item.findtext('content') or ''
        assert event_quote in text and (date_quote is None or date_quote in text)
        assert sum(len(q.split()) for q in (event_quote, date_quote) if q) <= 25
        lat, lon = tree.findtext('latitude'), tree.findtext('longitude')
        assert lat == record['coordinates']['asStoredInRecord']['latitude']
        assert lon == record['coordinates']['asStoredInRecord']['longitude']
        fields = {name: (item.findtext(name) or '').strip() for name in ('ccbaMnm1', 'ccbaMnm2', 'ccbaQuan', 'ccbaLcad', 'ccceName', 'ccbaAsdt')}
        fields.update(ccbaCpno=tree.findtext('ccbaCpno'), latitude=lat, longitude=lon,
                      crsInRecord=None, pointDefinitionInRecord=None)
        sid = 'src-khs-' + key; place = 'place-khs-' + key; event = 'event-khs-' + key
        note = '국가유산청 목록과 상세의 경도·위도를 그대로 표시한다. 기준계·오차·중심점 선정 방식은 명시되지 않았다. '
        note += '이 점은 현재 기관 목록의 위치이며 역사 전투·항쟁의 공간 범위가 아니다. 지정 면적도 전투 면적으로 쓰지 않는다.'
        coordinate = chunk(sid, 'khs-' + key + '-record', json.dumps(fields, ensure_ascii=False, sort_keys=True), url, 'dataset-record')
        event_row = chunk(sid, 'khs-' + key + '-event', event_quote, url, 'excerpt')
        date_row = museum_chunk if key == 'jeamri' else event_row if date_quote is None else chunk(sid, 'khs-' + key + '-date', date_quote, url, 'excerpt')
        point = claim('khs-' + key + '-point', place, 'locatedAt', {'kind': 'location', 'lat': float(lat), 'lon': float(lon),
                      'precision': 'heritage-catalog-point-crs-unspecified', 'basis': note}, coordinate, note)
        relation = claim('khs-' + key + '-event-site', event, 'hasEventSite', {'kind': 'entity', 'id': place}, event_row,
                         '기관 해설이 이 유산과 연결한 사건이다. 현재 좌표를 사건의 정확한 교전 지점으로 확정하지 않는다.')
        date_note = ('1270은 해설이 명시한 고려의 항복 연도다. 삼별초 용장성 항쟁 전체의 시작·종료를 정한 것이 아니다.'
                     if key == 'yongjang' else '기관 해설의 사건 기준연도다. 사건 전체 기간과 일별 이동 경로로 확장하지 않는다.')
        date = claim('khs-' + key + '-reference-date', event, 'hasReferenceDate',
                     {'kind': 'time', 'id': 'ts-khs-' + key, 'verbatim': date_row['text'], 'earliest': year, 'latest': year,
                      'precision': 'year'}, date_row, date_note)
        for typ, eid, label in [('Place', place, fields['ccbaMnm1'] + ' · 현재 기관 좌표'), ('Event', event, record['eventName'])]:
            write_same(args.data / 'entities' / typ.lower() / (eid + '.md'), markdown({'type': typ, 'id': eid, 'label': label},
                       '해당 기관 자료의 장소·사건 표기를 가리킨다. 다른 사료의 엔티티와 자동 병합하지 않는다.'))
        site_nature = {
            'yongjang': '성곽·궁궐 터에 연결한 현재 목록 좌표.',
            'haengju': '성곽과 후대 기념시설이 함께 있는 장소의 목록 좌표.',
            'namhansanseong': '산성 지정구역의 목록 좌표.',
            'jeamri': '예배당 터와 후대 기념시설이 함께 있는 장소의 목록 좌표.',
            'jeonnam-office': '등록 대상인 구 본관의 목록 좌표. 본문 건립연도 1930과 시대 필드 1925가 다르다.',
        }[key]
        feature = {'type': 'Feature', 'id': 'khs-event-' + key, 'geometry': {'type': 'Point', 'coordinates': [float(lon), float(lat)]},
                   'properties': {'label': record['eventName'] + ' · ' + fields['ccbaMnm1'], 'kind': 'event-catalog-point',
                       'fromSource': sid, 'requiredSources': sorted({sid, date_row['sourceId']}), 'origin': 'ai',
                       'validFrom': year, 'validTo': year, 'begin': str(year), 'end': str(year), 'sourceRecord': fields,
                       'claimId': relation['id'], 'coordinateClaimId': point['id'], 'dateClaimId': date['id'],
                       'citesChunk': coordinate['id'], 'eventChunk': event_row['id'], 'dateChunk': date_row['id'],
                       'eventQuote': event_quote, 'dateQuote': date_row['text'], 'basis': note, 'dateBasis': date_note,
                       'siteNature': site_nature, 'eventId': event, 'placeId': place}}
        features.append(feature)
        write_same(args.data / 'sources' / (sid.removeprefix('src-') + '.md'), markdown({
            'type': 'Source', 'id': sid, 'label': '국가유산청 · ' + fields['ccbaMnm1'], 'compiler': '국가유산청',
            'sourceKind': '현재 유산 목록의 좌표·역사 해설 발췌', 'sourceGroup': '사건 관련 기관 자료', 'resource': url,
            'composedYear': None, 'coversFrom': year, 'coversTo': year, 'defaultLens': False,
            'license': 'structured-facts-and-short-excerpt', 'status': 'draft', 'verified': None,
        }, '기관 공개 검색 API에서 식별자·명칭·지정 면적·좌표 등 구조화 사실과 짧은 해설만 옮겼다. '
           'API의 본문·이미지 전체 재배포 조건을 확정한 것은 아니며 별도 공간정보 API의 라이선스를 가져오지 않았다.\n\n'
           + note + '\n\n' + date_note + '\n\n제암리 해설에는 사건 연도가 없어 대한민국역사박물관의 직접 날짜를 별도로 연결했다.'
           if key == 'jeamri' else '기관 공개 검색 API의 구조화 사실과 짧은 해설 발췌다. 본문·이미지 전체를 재배포하지 않는다.\n\n' + note + '\n\n' + date_note))
        accepted.append({'key': key, 'fields': fields, 'eventQuoteExact': True, 'dateQuoteExact': True,
                         'sourceUrl': url, 'sha256': checks[url]['sha256'], 'quoteWords': sum(len(q.split()) for q in (event_quote, date_quote) if q)})
    for sid, rows in chunks.items():
        write_same(args.data / 'sources' / sid.removeprefix('src-') / 'chunks.jsonl', ''.join(json.dumps(r, ensure_ascii=False, sort_keys=True) + '\n' for r in rows))
    claim_groups = defaultdict(list)
    for c in claims:
        claim_groups[c['fromSource'], c['citesChunk']].append(c)
    for (sid, chunk_id), group in claim_groups.items():
        write_same(args.data / 'claims' / sid.removeprefix('src-') / (chunk_id + '.md'), markdown(
                   {'type': 'Claims', 'source': sid, 'chunk': chunk_id, 'status': 'draft'},
                   '```claims-json\n' + json.dumps(group, ensure_ascii=False, indent=2) + '\n```'))
    map_path = args.data / 'maps/khs-events.geojson.gz'; map_path.parent.mkdir(parents=True, exist_ok=True)
    map_path.write_bytes(gzip.compress(json.dumps({'type': 'FeatureCollection', 'features': features}, ensure_ascii=False, sort_keys=True).encode(), mtime=0))
    lens_path = args.data / 'lenses.json'; lenses = json.loads(lens_path.read_text(encoding='utf-8'))
    lens = {'id': 'khs-events', 'label': '사건 · 국가유산청 장소', 'description': '기관이 사건과 연결한 장소의 현재 목록 좌표. 기준연도별 표시이며 전투 범위가 아니다.',
            'sources': sorted(chunks), 'year': 1593, 'historyLevel': 4}
    lenses['lenses'] = [l for l in lenses['lenses'] if l['id'] != lens['id']] + [lens]
    lens_path.write_text(json.dumps(lenses, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    saved = args.data / 'research/khs-events-81'; saved.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(args.research / 'run.json', saved / 'run.json')
    report = {'sources': len(chunks), 'chunks': sum(map(len, chunks.values())), 'claims': len(claims), 'features': len(features),
              'records': accepted, 'researchExitCode': run['exitCode'], 'researchSession': run['sessionId'],
              'crsConfirmed': False, 'humanReviewed': False, 'museumDateSource': checks[museum_url],
              'corrections': ['제암리 해설에는 1982가 있다. 사건 연도 1919가 없다는 뜻이며 네 자리 연도 전부가 없다는 조사 요약은 틀렸다.',
                              '구 전남도청의 본문 건립연도는 1930이고 메타데이터 시대 필드는 1925다. 하나로 고치지 않았다.']}
    args.out.parent.mkdir(parents=True, exist_ok=True); args.out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({k: v for k, v in report.items() if k not in ('records', 'museumDateSource')}, ensure_ascii=False))


if __name__ == '__main__':
    main()
