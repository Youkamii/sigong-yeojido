"""Independently compare imported text with the cached article DOM (BeautifulSoup/lxml)."""
import argparse
import gzip
import hashlib
import json
from pathlib import Path
import re
from bs4 import BeautifulSoup


def normalized(text):
    return re.sub(r'\s+', '', text)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--data', type=Path, default=Path('data'))
    ap.add_argument('--out', type=Path, required=True)
    args = ap.parse_args()
    results = []
    for source in sorted((args.data / 'sources').glob('zhws-*')):
        if not source.is_dir():
            continue
        manifest = json.loads((source / 'fetch-meta.json').read_text(encoding='utf-8'))
        rows = {r['revisionId']: r for r in map(json.loads, (source / 'chunks.jsonl').read_text(encoding='utf-8').splitlines())}
        for page in manifest['pages']:
            raw = gzip.decompress((source / 'html' / page['file']).read_bytes())
            assert hashlib.sha256(raw).hexdigest() == page['htmlSha256']
            parsed = BeautifulSoup(raw.decode('utf-8'), 'lxml')
            article = parsed.select_one('#mw-content-text .mw-parser-output')
            assert article is not None
            for el in list(article.select('script,style,noscript,.mw-editsection,.noprint,.licenseContainer,.licensetpl,.toc')):
                el.decompose()
            headers = article.select('#headerContainer,.messagebox')
            header_text = ''.join(header.get_text() for header in headers)
            for header in headers:
                header.decompose()
            text = article.get_text()
            if not normalized(text):
                text = header_text
            row = rows[page['revid']]
            body_match = normalized(text) == normalized(row['text'])
            header_match = normalized(header_text) == normalized(row['headerText'])
            results.append({'title': page['title'], 'revisionId': page['revid'],
                            'bodyCharactersMatch': body_match, 'headerCharactersMatch': header_match,
                            'bodyCharsWithoutWhitespace': len(normalized(text))})
    failed = [r for r in results if not r['bodyCharactersMatch'] or not r['headerCharactersMatch']]
    report = {'pages': len(results), 'failed': failed, 'records': results,
              'method': 'BeautifulSoup with lxml DOM against stdlib HTMLParser output; whitespace-only normalization'}
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'pages': len(results), 'failed': failed}, ensure_ascii=False))
    if failed:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
