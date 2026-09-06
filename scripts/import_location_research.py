#!/usr/bin/env python3
"""Import completed, attributed location research without turning regions into sites."""
import argparse
import json
import shutil
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'services'))
import validate as V


def write_same(path, text):
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists() and path.read_text(encoding='utf-8') != text:
        raise ValueError(f'refusing to replace different content: {path}')
    path.write_text(text, encoding='utf-8')


def markdown(fields, body):
    return '---\n' + '\n'.join(f'{k}: {json.dumps(v, ensure_ascii=False)}' for k, v in fields.items()) + '\n---\n\n' + body + '\n'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--research', type=Path, required=True)
    ap.add_argument('--data', type=Path, default=ROOT / 'data')
    ap.add_argument('--out', type=Path, required=True)
    args = ap.parse_args()
    research = json.loads((args.research / 'result.json').read_text(encoding='utf-8'))
    run = json.loads((args.research / 'run.json').read_text(encoding='utf-8'))
    assert run['exitCode'] == 0 and not run['isError'] and 'claude-opus-5' in run['modelsObserved']
    sources = {s['id']: s for s in research['sources']}
    drafts = {c['claimId']: c for c in research['locationClaims']}
    chunks = defaultdict(list)
    claims = []
    entities = {}
    withheld = []
    lens_file=args.data/'lenses.json'
    lens_config=json.loads(lens_file.read_text(encoding='utf-8')) if lens_file.exists() else {'lenses':[]}
    default_sources=set(next((l['sources'] for l in lens_config['lenses'] if l['id']==lens_config.get('default')),[]))

    def entity(eid, label, hanja=None):
        entities[eid] = {'type': 'Place', 'id': eid, 'label': label}
        if hanja:
            entities[eid]['labelHanja'] = hanja
        return eid

    def chunk(source, suffix, text, title, url=None, **extra):
        row = {'id': f'chunk_{source}_{suffix}', 'sourceId': 'src-' + source,
               'text': text, 'title': title, 'locator': title, 'lang': 'ko',
               'permalink': url or sources[source]['url'], 'date': None,
               'chunkType': 'excerpt', 'charCount': len(text), 'annotations': [], **extra}
        chunks[source].append(row)
        return row

    def claim(cid, subject, predicate, obj, row, quote, note='', **extra):
        assert quote in row['text']
        rec = {'id': 'claim-' + cid, 'subject': subject, 'predicate': 'syj:' + predicate,
               'object': obj, 'fromSource': row['sourceId'], 'citesChunk': row['id'],
               'quote': quote, 'origin': 'ai', 'status': 'draft',
               'generatedBy': 'claude-opus-5', 'generatedAt': '2026-09-06', 'note': note, **extra}
        claims.append(rec)
        return rec

    rows = {}
    for sid, source in sources.items():
        if source.get('quotes'):
            text = '\n\n'.join(source['quotes'])
            if sid == 'nahf-ismy-gungnaeseong':
                text += '\n\n' + source['coordinatesOnPage'][0]['extractedFrom']
            rows[sid] = chunk(sid, 'excerpt', text, source['title'] + ' · 짧은 발췌',
                             editorNotes=['각 문단은 별도로 발췌했다. 문단 사이의 원문은 수록하지 않았다.'])

    coordinate_claims = {}
    def modern_region(draft):
        coord = draft['coordinateSource']
        rid = coord['recordId']
        eid = entity('place-geonames-' + rid, coord['name'])
        if rid not in coordinate_claims:
            # A record transcription, not a fabricated prose quotation.
            record = {k: coord[k] for k in ('recordId', 'name', 'featureClass', 'dms', 'decimal', 'datum') if k in coord}
            text = json.dumps(record, ensure_ascii=False, sort_keys=True)
            row = chunk('geonames', rid, text, 'GeoNames ' + coord['name'], coord['recordUrl'],
                        lang='und', chunkType='record-excerpt')
            coordinate_claims[rid] = claim('geonames-' + rid, eid, 'locatedAt',
                {'kind': 'location', 'lat': draft['lat'], 'lon': draft['lon'],
                 'precision': 'modern-region-representative-point',
                 'basis': 'GeoNames 현대 행정구역·도시 대표점. 역사 지명의 좌표를 뜻하지 않는다. WGS84.'}, row, text)
        return eid

    def in_region(key, subject, predicate='locatedIn', quote=None, dates=False):
        draft = drafts[key]
        target = modern_region(draft)
        extra = {}
        if dates:
            assert draft.get('validityQuote') in rows[draft['sourceId']]['text']
            extra = {'validFrom': draft.get('validFrom'), 'validTo': draft.get('validTo'),
                     'validityQuote': draft['validityQuote']}
        return claim(key.removeprefix('lc-'), subject, predicate, {'kind': 'entity', 'id': target},
                     rows[draft['sourceId']], quote or draft['quote'], draft['limitations'], **extra)

    # This label is already the repository's 國內城 shell; no identity merge is introduced.
    in_region('lc-gungnae-jian-encykorea', 'place-gungnae', dates=True)
    draft = drafts['lc-gungnae-jian-nahf-site']
    row = rows[draft['sourceId']]
    # The quotation includes the page's actual map parameters and its stated period.
    claim('gungnae-jian-nahf-site', 'place-gungnae', 'locatedAt',
          {'kind': 'location', 'lat': draft['lat'], 'lon': draft['lon'],
           'precision': draft['precision'], 'basis': draft['limitations']}, row, row['text'],
          draft['limitations'], validFrom=3, validTo=427)
    in_region('lc-gungnae-tieling-bok', 'place-gungnae')
    in_region('lc-pyongyang-anhakgung-encykorea', entity('place-anhakgung', '안학궁', '安鶴宮'))
    withheld.append({'id': 'anhakgung-period', 'reason': '427~567 is reported as an earlier interpretation; not assigned as an unconditional validity period'})

    # The cited historical district is not silently identified with today's GeoNames district.
    fort = entity('place-nangnang-toseong', '낙랑토성', '樂浪土城')
    old_district = entity('place-taedongmyeon-encykorea', '대동군 대동면 (낙랑토성 기사 표기)')
    row = rows['encykorea-nangnang-toseong']
    claim('nangnang-toseong-district', fort, 'locatedIn', {'kind': 'entity', 'id': old_district}, row, sources['encykorea-nangnang-toseong']['quotes'][0],
          '기사의 행정구역 표기를 보존한다. 현재 행정구역과의 대응을 확인하지 못해 좌표를 붙이지 않았다.')
    joseon = entity('place-joseonhyeon', '낙랑군 조선현', '朝鮮縣')
    claim('joseonhyeon-seat-toseong', joseon, 'seatLocatedIn', {'kind': 'entity', 'id': fort}, row,
          sources['encykorea-nangnang-toseong']['quotes'][1], '군·현의 전 영역이 아니라 현청의 위치 설명이다.')
    in_region('lc-nangnang-lulong-lee', joseon, 'northOf')
    withheld.append({'id': 'taedong-coordinate', 'reason': 'historical district to modern district identity is not established'})

    daebang = entity('place-daebang-gun', '대방군', '帶方郡')
    in_region('lc-daebang-hwanghae-encykorea', daebang, 'southeastOf')
    withheld.append({'id': 'daebang-period', 'reason': '314 comes from another source and is not assigned to this location opinion'})
    moved = entity('place-daebang-gun-moved', '옮겨간 대방군', '帶方郡')
    draft = drafts['lc-daebang-moved-liaoxi-gong']
    in_region(draft['claimId'], moved, quote=draft['supportingQuotes'][0])
    withheld.append({'id': 'moved-daebang-period', 'reason': 'a destruction year does not establish the later Baoding location start year'})
    withheld.extend([
        {'id': 'pyongyang-first-map-point', 'reason': 'the page does not identify one of its seven points as the whole city representative point'},
        {'id': 'pyongyang-identity', 'reason': 'the modern article does not identify its 平壤 with the stele 平穰'},
        {'id': 'nangnang-grave-boundary', 'reason': 'grave distribution is not an administrative boundary'},
        {'id': 'reported-daebang-view', 'reason': 'the encyclopedia reports another opinion without identifying its primary proponent'}])

    for sid, source in sources.items():
        fields = {'type': 'Source', 'id': 'src-' + sid, 'label': source['title'],
                  'sourceKind': '지명 좌표' if sid == 'geonames' else '연구·해설',
                  'sourceGroup': '현대 좌표' if sid == 'geonames' else '현대 위치 연구',
                  'composedYear': source.get('year'), 'coversFrom': None, 'coversTo': None,
                  'compiler': source.get('author', source['institution']), 'originalLanguage': 'und' if sid == 'geonames' else 'ko',
                  'defaultLens': 'src-'+sid in default_sources, 'license': 'CC-BY-4.0' if sid == 'geonames' else 'restricted',
                  'licenseDetail': source['license'], 'status': 'draft', 'verified': None,
                  'resource': source['url'], 'accessed': source['accessed'], 'generated_by': 'claude-opus-5'}
        body = '# ' + source['title'] + '\n\n' + source['institution'] + '\n\n'
        body += f"[원 출처]({source['url']}) · 열람 {source['accessed']}\n\n"
        body += source.get('notes', '') + '\n\n짧은 발췌·레코드만 수록했다. 전문을 적재한 자료가 아니다.\n\n'
        body += '이용 조건: ' + source['license'] + '\n\n'
        if source.get('licenseUrl'):
            body += f"[이용 조건 안내]({source['licenseUrl']})\n\n"
        body += '조사 Claude Opus 5 / Max effort, 데이터 형식·인용 대조 Codex. 사람의 검토 완료 기록은 없다.'
        write_same(args.data / 'sources' / (sid + '.md'), markdown(fields, body))
        write_same(args.data / 'sources' / sid / 'chunks.jsonl', ''.join(json.dumps(c, ensure_ascii=False, sort_keys=True) + '\n' for c in chunks[sid]))
    for eid, fields in entities.items():
        path = args.data / 'entities' / 'place' / (eid + '.md')
        if not path.exists():
            write_same(path, markdown(fields, '이름을 찾기 위한 껍데기다. 위치·기간·동일성은 사료별 주장으로 다룬다.'))
    grouped = defaultdict(list)
    for rec in claims:
        grouped[(rec['fromSource'], rec['citesChunk'])].append(rec)
    for (source, cid), group in grouped.items():
        fields = {'type': 'Claims', 'source': source, 'chunk': cid, 'status': 'draft', 'generated_by': 'claude-opus-5'}
        text = markdown(fields, '```claims-json\n' + json.dumps(group, ensure_ascii=False, indent=2) + '\n```')
        V.parse_claims_text(text)
        write_same(args.data / 'claims' / source.removeprefix('src-') / (cid + '.md'), text)
    for name in ('run.json', 'result.json'):
        target = args.data / 'research' / 'location-lens-49' / name
        target.parent.mkdir(parents=True, exist_ok=True)
        if target.resolve() != (args.research / name).resolve():
            shutil.copyfile(args.research / name, target)
    report = {'sources': len(sources), 'chunks': sum(map(len, chunks.values())), 'claims': len(claims),
              'claimIds': [c['id'] for c in claims], 'withheld': withheld, 'humanReviewed': False,
              'datePolicy': 'only each source own quoted validity is applied; reported or other-source periods are withheld'}
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(report, ensure_ascii=False))


if __name__ == '__main__':
    main()
