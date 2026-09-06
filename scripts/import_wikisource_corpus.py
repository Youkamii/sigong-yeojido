"""Import cached public article text, retaining revision, header and editorial markup."""
import argparse
import gzip
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import shutil
from urllib.parse import quote
from import_location_research import markdown
from fetch_wikisource_corpus import WORKS, HOST

VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}
BLOCK = {'p', 'div', 'table', 'tr', 'li', 'dt', 'dd', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'br', 'hr'}
OMIT = {'mw-editsection', 'noprint', 'licenseContainer', 'licensetpl', 'toc'}


def write_output(path, text):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding='utf-8', newline='\n')


class Article(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.parts = {'body': [], 'header': []}
        self.annotations, self.images = [], []
        self.found = False
        self.in_content = False
        self.quality = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        classes = set(attrs.get('class', '').split())
        if attrs.get('id') == 'mw-content-text':
            self.in_content = True
        if attrs.get('id') == 'textquality':
            self.quality = attrs.get('class')
        if not self.stack:
            if self.found or not self.in_content or 'mw-parser-output' not in classes:
                return
            self.found = True
            mode = 'body'
        else:
            mode = self.stack[-1]['mode']
        if tag in ('script', 'style', 'noscript') or classes & OMIT:
            mode = 'skip'
        elif (attrs.get('id') == 'headerContainer' or 'messagebox' in classes) and mode != 'skip':
            mode = 'header'
        if mode != 'skip' and tag in BLOCK:
            self.parts[mode].append('\n')
        if mode != 'skip' and tag in ('td', 'th'):
            self.parts[mode].append('\t')
        annotation = None
        if mode == 'body' and tag in ('span', 'small', 'sup', 'sub') and attrs.get('title'):
            annotation = {'tag': tag, 'title': attrs['title'], 'textParts': []}
            self.annotations.append(annotation)
        if tag == 'img' and mode == 'body':
            self.images.append({k: attrs[k] for k in ('src', 'alt', 'title') if k in attrs})
        if tag not in VOID:
            self.stack.append({'tag': tag, 'mode': mode, 'annotation': annotation})

    def handle_endtag(self, tag):
        match = next((i for i in range(len(self.stack) - 1, -1, -1) if self.stack[i]['tag'] == tag), None)
        if match is None:
            return
        mode = self.stack[match]['mode']
        if mode != 'skip' and tag in BLOCK:
            self.parts[mode].append('\n')
        del self.stack[match:]

    def handle_data(self, data):
        if self.stack and self.stack[-1]['mode'] != 'skip':
            self.parts[self.stack[-1]['mode']].append(data)
            for frame in self.stack:
                if frame['annotation'] is not None:
                    frame['annotation']['textParts'].append(data)

    def result(self):
        if not self.found:
            raise ValueError('No actual article container')
        def clean(parts):
            text = re.sub(r'[ \t\r\f\v]+', ' ', ''.join(parts))
            return '\n'.join(line.strip() for line in text.splitlines() if line.strip())
        return {'text': clean(self.parts['body']), 'headerText': clean(self.parts['header']),
                'editorialTitles': [{'tag': a['tag'], 'title': a['title'], 'text': ''.join(a['textParts'])}
                                    for a in self.annotations], 'imageReferences': self.images,
                'publisherQualityFlag': self.quality}


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--cache', type=Path, required=True)
    ap.add_argument('--research', type=Path, required=True)
    ap.add_argument('--data', type=Path, default=Path('data'))
    ap.add_argument('--out', type=Path, required=True)
    args = ap.parse_args()
    run = json.loads((args.research / 'run.json').read_text(encoding='utf-8'))
    assert 'claude-opus-5' in run['modelsObserved'] and run['effort'] == 'max'
    results = []
    for key, (title, label) in WORKS.items():
        cache = args.cache / key
        manifest = json.loads((cache / 'manifest.json').read_text(encoding='utf-8'))
        sid = 'src-zhws-' + key
        folder = args.data / 'sources' / sid.removeprefix('src-')
        (folder / 'html').mkdir(parents=True, exist_ok=True)
        rows, checked = [], []
        for page in manifest['pages']:
            raw = gzip.decompress((cache / page['file']).read_bytes())
            assert hashlib.sha256(raw).hexdigest() == page['htmlSha256']
            html = raw.decode('utf-8')
            assert f'"wgRevisionId":{page["revid"]}' in html
            parsed = Article()
            parsed.feed(html)
            contents = parsed.result()
            metadata = (page['title'] == title and key != 'balhaego') or not contents['text']
            if not contents['text']:
                contents['text'] = contents['headerText']
            assert contents['text'], page['title']
            cid = f'chunk_zhws_{key}_{page["pageid"]}_{page["revid"]}'
            permalink = HOST + '/w/index.php?title=' + quote(page['title']) + '&oldid=' + str(page['revid'])
            row = {'id': cid, 'sourceId': sid, **contents, 'permalink': permalink,
                   'locator': page['title'] + ' · revision ' + str(page['revid']), 'lang': 'zh', 'date': None,
                   'chunkType': 'source-metadata' if metadata else 'transcription-page',
                   'pageId': page['pageid'], 'revisionId': page['revid'], 'sourceUrl': page['url'],
                   'htmlSha256': page['htmlSha256'], 'license': manifest['license'],
                   'editorNotes': ['공개 페이지의 본문 전사. 위키문헌 머리말은 headerText, 글자 설명은 editorialTitles에 보존한다.',
                                   'HTML 원문을 별도 보존했다. 위키텍스트 API는 robots 제한으로 요청하지 않았다.',
                                   '기관 원판본·완역본과 구별한다. 이미지 내용은 전사하지 않았다.']}
            rows.append(row)
            shutil.copyfile(cache / page['file'], folder / 'html' / page['file'])
            checked.append({**page, 'chunkId': cid, 'chunkType': row['chunkType'], 'textChars': len(row['text']),
                            'headerChars': len(row['headerText']), 'editorialTitles': len(row['editorialTitles']),
                            'imageReferences': len(row['imageReferences']), 'publisherQualityFlag': row['publisherQualityFlag']})
        write_output(folder / 'chunks.jsonl', ''.join(json.dumps(r, ensure_ascii=False, sort_keys=True) + '\n' for r in rows))
        write_output(folder / 'fetch-meta.json', json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
        missing = manifest['missingLinkedPages']
        limits = {
            'goryeo-dogyeong': '卷一~卷四十 40권과 序·行狀·跋文 페이지가 있다. 역사 원본의 그림 복원이나 원판본 전면 대조는 하지 않았다.',
            'sinjeung-yeoji': '卷001~卷033 페이지가 있고 卷034~卷055는 없다. 卷033의 적은 본문은 권 전체의 완성을 뜻하지 않는다.',
            'gyewon': '序와 卷一~卷二十 페이지가 있다. 卷一은 렌더링 본문 4,175자이며 목차만 있는 페이지가 아니다. 後記·附錄은 없고 표제 페이지에 제공처의 25% 품질 표시와 결자 경고가 있다.',
            'balhaego': '중국어 위키문헌의 단일 渤海考 전사본이다. 한국어 번역본이나 1권본 계열과 합치지 않는다.',
            'dongguk-tonggam': '卷一~卷三·外紀와 부속 글만 있다. 나머지 권 전문은 없다.',
            'maecheon': '卷之一·卷之二 페이지만 있다. 이 두 권 내부도 원판본과 대조하지 않아 완전하다고 판정하지 않는다.',
        }[key]
        write_output(args.data / 'sources' / (sid.removeprefix('src-') + '.md'), markdown({
            'type': 'Source', 'id': sid, 'label': label + ' · 위키문헌 전사', 'sourceKind': '공개 고전 전사본',
            'sourceGroup': '공개 고전 전사', 'compiler': '중국어 위키문헌 편집자; 원 저자 표시는 원 페이지 머리말에 보존',
            'composedYear': None, 'coversFrom': None, 'coversTo': None, 'defaultLens': False,
            'resource': HOST + '/wiki/' + quote(title), 'edition': '2026-09-07 수집, 페이지별 revision 고정',
            'license': 'CC-BY-SA-4.0', 'status': 'draft', 'verified': None,
        }, f'[{title}]({HOST}/wiki/{quote(title)}) · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). '
           '편집자 귀속과 변경 이력은 각 원 페이지의 역사(history)와 영구 버전 링크로 연결한다.\n\n'
           f'실제 수집 {len(rows)}페이지. {limits}\n\n'
           '원 HTML과 revision을 보존했다. 본문 표시에서 편집 버튼·이용허락 상자 등 화면 요소를 제외하고, '
           '머리말·글자 설명은 별도 필드로 옮겼다. 숨긴 글자를 임의로 복원하거나 문장을 현대화하지 않았다. '
           '다른 문서·틀을 불러오는 본문은 페이지 revision만으로 모든 내용을 고정할 수 없어 실제 HTML 해시도 함께 보존한다. '
           '이 전사본의 정확한 저본과 편집 이력의 원판본 대조는 미확인이다. 한글 번역문은 포함하지 않는다. '
           '편찬연도와 기록 대상 기간을 추정해 채우지 않았다. '
           '조사 단서 Claude Opus 5 / Max, 원 페이지 대조·변환 Codex.'))
        results.append({'source': sid, 'pages': checked, 'missingLinkedPages': missing, 'limits': limits,
                        'shortTranscriptions': [p['title'] for p in checked if p['chunkType'] != 'source-metadata' and p['textChars'] < 500]})
    saved = args.data / 'research/wikisource-corpus-80'
    saved.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(args.research / 'run.json', saved / 'run.json')
    shutil.copyfile(args.cache / 'robots.txt', saved / 'robots.txt')
    report = {'sources': len(results), 'pages': sum(len(r['pages']) for r in results), 'works': results,
              'researchSession': run['sessionId'], 'researchExitCode': run['exitCode'], 'researchIsError': run['isError'],
              'apiRequested': False, 'humanReviewed': False, 'translationIncluded': False}
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({k: v for k, v in report.items() if k != 'works'}, ensure_ascii=False))


if __name__ == '__main__':
    main()
