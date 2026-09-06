"""Index a verified NDL scan as images, keeping untranscribed text empty (#87)."""
import argparse
import hashlib
import json
from pathlib import Path
import shutil

from import_location_research import markdown
from fetch_ndl_scans import MANIFEST, PREFIX

KEY = 'ndl-gyeongguk-1934'
SOURCE = 'src-' + KEY


def rows_for(manifest, image_index):
    canvases = manifest['sequences'][0]['canvases']
    assert len(canvases) == image_index['imageCount'] == 319
    rows = []
    for number, (canvas, image) in enumerate(zip(canvases, image_index['images'], strict=True), 1):
        resource = canvas['images'][0]['resource']
        assert canvas['@id'] == image['canvas'] == PREFIX + f'canvas/{number}'
        assert image['number'] == number and image['url'] == resource['@id']
        assert (image['width'], image['height']) == (resource['width'], resource['height'])
        headings = [r['label'] for r in manifest.get('structures', []) if canvas['@id'] in r.get('canvases', [])]
        rows.append({'id': f'chunk-{KEY}-page-{number:04}', 'sourceId': SOURCE,
                     'text': '', 'charCount': 0, 'date': None, 'lang': 'lzh',
                     'title': ' · '.join(headings) or f'스캔 {number}',
                     'locator': f'NDL 1232807 · 스캔 {number}/319 · 원 코마 표기 {canvas["label"]}',
                     'permalink': f'https://dl.ndl.go.jp/pid/1232807/1/{number}',
                     'chunkType': 'page-image', 'contentKind': 'page-image',
                     'pageNumber': number, 'scanImage': {k: image[k] for k in ('url', 'width', 'height', 'bytes', 'sha256')},
                     'canvas': canvas['@id'], 'providerHeadings': headings,
                     'transcriptionStatus': 'not-transcribed', 'translationStatus': 'not-collected',
                     'annotations': [], 'index': []})
    assert len({r['id'] for r in rows}) == 319
    return rows


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--cache', type=Path, required=True)
    ap.add_argument('--research', type=Path, required=True)
    ap.add_argument('--data', type=Path, default=Path('data'))
    ap.add_argument('--out', type=Path, required=True)
    args = ap.parse_args()
    run = json.loads((args.research / 'run.json').read_text(encoding='utf-8'))
    assert run['exitCode'] == 0 and run['isError'] is False and 'claude-opus-5' in run['modelsObserved']
    raw = (args.cache / 'manifest.json').read_bytes()
    manifest = json.loads(raw)
    index = json.loads((args.cache / 'image-index.json').read_text(encoding='utf-8'))
    assert index['manifestSha256'] == hashlib.sha256(raw).hexdigest()
    metadata = {m['label']: m['value'] for m in manifest['metadata']}
    assert metadata['Title'] == '経国大典' and metadata['Access Restrictions'] == 'PDM'
    rows = rows_for(manifest, index)
    folder = args.data / 'sources' / KEY
    folder.mkdir(parents=True, exist_ok=True)
    chunks = ''.join(json.dumps(row, ensure_ascii=False, separators=(',', ':')) + '\n' for row in rows)
    (folder / 'chunks.jsonl').write_text(chunks, encoding='utf-8', newline='\n')
    fields = {'type': 'Source', 'id': SOURCE, 'label': '경국대전 · NDL 1934년판 스캔',
              'labelHanja': '経国大典', 'sourceKind': '고전 영인본의 펼침면 이미지', 'sourceGroup': '조선 법전',
              'compiler': metadata['Creator'], 'composedYear': None, 'coversFrom': None, 'coversTo': None,
              'edition': '朝鮮総督府中枢院, 昭和9(1934). NDL 청구기호 678-72, 서지 000000744869, 600p ; 23cm',
              'editionYear': 1934, 'resource': 'https://dl.ndl.go.jp/pid/1232807',
              'doi': '10.11501/1232807', 'originalLanguage': 'lzh', 'defaultLens': False,
              'license': 'Public Domain Mark', 'licenseDetail': 'NDL manifest PDM. 출처: 国立国会図書館 National Diet Library, JAPAN',
              'licenseVerifiedAt': '2026-09-07', 'licenseVerifiedVia': 'https://www.ndl.go.jp/jp/use/reproduction/index.html',
              'contentKind': 'page-images', 'pageCount': 319, 'transcribedPages': 0, 'chunkCount': 319,
              'status': 'draft', 'verified': None, 'accessed': '2026-09-07'}
    body = '''국립국회도서관(NDL)의 제공본 319코마를 원 순서대로 보관한다. 코마는 좌우 페이지를 함께 찍은 펼침면 이미지다. 도서관의 서지는 600쪽이며, 319개의 텍스트 기사나 319쪽짜리 책이라는 뜻이 아니다.

전사문·OCR·한국어 번역은 수집하지 않았다. 각 chunk의 text는 빈 문자열이고 원 이미지 URL·크기·SHA256·목차 표기만 기록한다. 스캔에 있는 역사 내용을 읽었다는 Claim도 만들지 않았다. 사료를 켠 뒤 ‘수록한 스캔 보기’를 누르면 제공처의 실제 이미지를 면별로 열 수 있다.

1934는 이 보관 판본의 간행연도다. 법전의 최초 편찬연도나 법의 시행기간으로 사용하지 않는다. 면 목록에는 吏典·戶典·禮典·兵典·刑典·工典의 시작점이 있지만, 모든 글자의 완결이나 다른 판본과의 일치는 확인하지 않았다.

[NDL 제공본](https://dl.ndl.go.jp/pid/1232807) · [서지](https://ndlsearch.ndl.go.jp/books/R100000002-I000000744869) · [이미지 이용 안내](https://www.ndl.go.jp/jp/use/reproduction/index.html) · [IIIF 이용 안내](https://dl.ndl.go.jp/ja/help_iiif)

출처: 国立国会図書館 National Diet Library, JAPAN. manifest의 Access Restrictions는 PDM이다. 보호기간이 끝난 자료는 자유 이용하며 NDL에 신청할 필요가 없다는 안내를 확인했다. 다른 기관의 번역문·OCR·다른 판본에 이 조건을 확장하지 않는다.

원해상도 JPEG 전체는 data/scans/ndl-gyeongguk-1934/에 별도 보관한다. Git에는 원 manifest와 319개 이미지의 해시·크기, 원문 조각의 이미지 참조를 기록한다. scripts/fetch_ndl_scans.py로 다시 받을 수 있다. 웹 열람 이미지는 각 기록의 NDL 원본 URL을 사용한다.'''
    (args.data / 'sources' / (KEY + '.md')).write_text(markdown(fields, body), encoding='utf-8', newline='\n')
    archive = args.data / 'research' / KEY
    archive.mkdir(parents=True, exist_ok=True)
    for name in ('manifest.json', 'image-index.json'):
        shutil.copyfile(args.cache / name, archive / name)
    for name in ('run.json', 'result.json', 'report.md', 'progress.json'):
        shutil.copyfile(args.research / name, archive / ('research-' + name))
    report = {'source': SOURCE, 'scanImages': len(rows), 'transcribedPages': 0, 'translatedPages': 0,
              'newClaims': 0, 'imageBytes': index['bytes'], 'manifestUrl': MANIFEST,
              'manifestSha256': hashlib.sha256(raw).hexdigest(),
              'chunksSha256': hashlib.sha256(chunks.encode()).hexdigest(),
              'imageDimensions': sorted({(r['scanImage']['width'], r['scanImage']['height']) for r in rows}),
              'providerStructures': manifest.get('structures'),
              'researchCorrection': 'Initial 172 canvas summary was wrong; raw manifest and final researcher correction agree on 319.',
              'unverified': ['per-character transcription', 'translation', 'comparison with other editions', 'first compilation year and historical validity period']}
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8', newline='\n')
    print(json.dumps({k: report[k] for k in ('source', 'scanImages', 'transcribedPages', 'newClaims', 'imageBytes')}))


if __name__ == '__main__':
    main()
