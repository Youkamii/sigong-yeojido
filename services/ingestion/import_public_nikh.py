"""Import checked public NIKH collections with their own licensing and bibliography."""
import argparse
from collections import Counter
import json
from pathlib import Path
import re
import sys
import zipfile
from xml.etree import ElementTree as ET
from extract_nikh_xml import ROOT, OutputWriter, extract, plain, sha256_of
sys.path.insert(0, str(ROOT/'scripts'))
from fill_card_counts import build, START, END
from import_location_research import markdown

COLLECTIONS = {
    'goryeosa-jeolyo': {'dataset': '15115521', 'label': '고려사절요', 'group': '고려사절요',
                        'kind': '관찬 사서 · 공개 XML', 'language': 'hanmun'},
}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--source', choices=COLLECTIONS, required=True)
    ap.add_argument('--bulk', type=Path, required=True)
    ap.add_argument('--download-meta', type=Path, required=True)
    ap.add_argument('--out', type=Path, required=True)
    ap.add_argument('--report', type=Path, required=True)
    args = ap.parse_args()
    config = COLLECTIONS[args.source]
    download = json.loads(args.download_meta.read_text(encoding='utf-8'))
    assert download['dataset'] == config['dataset'] and download['sha256'] == sha256_of(args.bulk)
    assert download['licenseOnPage'] == '공공저작물 : 출처표시 (제 1유형)'
    assert download['bytes'] == args.bulk.stat().st_size
    expected, xml_files, titles = {}, [], []
    with zipfile.ZipFile(args.bulk) as z:
        for name in sorted(z.namelist()):
            if not name.endswith('.xml'):
                continue
            root = ET.fromstring(z.read(name)); xml_files.append(name)
            titles.extend(plain(e) for e in root.findall('.//level1/front/biblioData/title/mainTitle'))
            for e in root.iter():
                if re.fullmatch(r'level\d+', e.tag) and e.find('text') is not None:
                    lid = e.get('id'); assert lid and lid not in expected, lid
                    expected[lid] = 'section' if any(re.fullmatch(r'level\d+', c.tag) for c in e) else 'article'
    years, kinds = Counter(), Counter()
    with OutputWriter(args.out) as writer:
        def emit(row):
            assert expected.pop(row['levelId']) == row['chunkType']
            row['lang'] = config['language']
            writer(row); kinds[row['chunkType']] += 1
            raw = (row.get('date') or {}).get('raw') or ''
            m = re.match(r'^(-?\d{4})(?:-|$)', raw)
            if m and int(m[1]) < 9999:
                years[int(m[1])] += 1
        _, result = extract(args.source, args.bulk, emit=emit)
    assert not expected and not result['unknownTags'] and not result['stats'].get('textNoId')
    source = args.source
    fields = {'type': 'Source', 'id': 'src-'+source, 'label': config['label'],
              'sourceKind': config['kind'], 'sourceGroup': config['group'],
              'compiler': '국사편찬위원회 공개 XML', 'composedYear': None,
              'coversFrom': min(years) if years else None, 'coversTo': max(years) if years else None,
              'resource': download['pageUrl'], 'originalLanguage': config['language'],
              'defaultLens': False, 'license': 'KOGL-1', 'licenseDetail': download['licenseOnPage'],
              'licenseVerifiedAt': '2026-09-07', 'licenseVerifiedVia': download['pageUrl'],
              'bulkSha256': download['sha256'], 'status': 'draft', 'verified': None}
    body = f'''공공데이터포털에서 국사편찬위원회가 제공한 XML {len(xml_files)}개 전체를 추출했다.
현재 전재본의 본문·주석·색인·날짜 원표기를 보존한다. 번역본을 추가한 것으로 세지 않는다.
편찬 연도는 이번 XML의 서지에서 서기 숫자로 확인하지 않아 미상으로 둔다.
수록 기간은 XML 날짜의 최솟값과 최댓값이며 사서 전체의 역사적 범위를 확정한 값이 아니다.

인용 링크는 원 XML의 기사 ID에 따른 국편 주소다. 국편 웹 본문을 별도로 수집하지 않았다.
원 데이터 제공: 국사편찬위원회. [공공누리 제1유형](https://www.kogl.or.kr/info/licenseType1.do).
수정: XML을 기사별 JSONL로 나누고 주석·색인을 별도 필드에 보존했다. 원문 글자는 바꾸지 않았다.

{START}
{build(source, args.out)}
{END}

재현: `services/ingestion/import_public_nikh.py`와 관련 추출 보고서.
'''
    (args.out/(source+'.md')).write_text(markdown(fields, body.rstrip()), encoding='utf-8', newline='\n')
    result.update(download=download, xmlFiles=xml_files, volumeTitles=titles,
                  sourceCounts=dict(writer.counts), chunkKinds=dict(kinds),
                  yearRange=[min(years), max(years)] if years else [None, None],
                  years=dict(sorted(years.items())), independentXmlIdCheck={'missing': 0, 'duplicates': 0},
                  outputs={p.relative_to(args.out).as_posix(): {'bytes': p.stat().st_size, 'sha256': sha256_of(p)}
                           for p in sorted(writer.paths)})
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(result, ensure_ascii=False, sort_keys=True, indent=2)+'\n', encoding='utf-8')
    print(json.dumps({k: result[k] for k in ('sourceCounts', 'stats', 'yearRange', 'unknownTags')}, ensure_ascii=False))


if __name__ == '__main__':
    main()
