"""Cache permitted article HTML and embedded revision IDs for public works (#80)."""
import argparse
import gzip
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import time
from urllib.parse import parse_qs, quote, unquote, urlparse
from urllib.request import Request, urlopen
import urllib.error
import urllib.robotparser

HOST = 'https://zh.wikisource.org'
UA = 'SigongYeojido/1.0 (public historical transcription; Youkamii/sigong-yeojido)'
WORKS = {
    'goryeo-dogyeong': ('宣和奉使高麗圖經', '고려도경'),
    'sinjeung-yeoji': ('新增東國輿地勝覽', '신증동국여지승람'),
    'gyewon': ('桂苑筆耕集', '계원필경집'),
    'balhaego': ('渤海考', '발해고'),
    'dongguk-tonggam': ('東國通鑒', '동국통감'),
    'maecheon': ('梅泉野錄', '매천야록'),
}


class WorkLinks(HTMLParser):
    def __init__(self, title):
        super().__init__()
        self.title = title
        self.found = set()
        self.missing = set()

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag != 'a' or not attrs.get('href'):
            return
        link = urlparse(attrs['href'])
        if link.netloc and link.netloc != 'zh.wikisource.org':
            return
        if link.path.startswith('/wiki/'):
            title = unquote(link.path[6:]).replace('_', ' ')
        else:
            title = parse_qs(link.query).get('title', [''])[0]
        if not title.startswith(self.title + '/'):
            return
        if 'new' in attrs.get('class', '').split() or 'redlink=1' in link.query:
            self.missing.add(title)
        elif link.path.startswith('/wiki/') and not link.query:
            self.found.add(title)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--cache', type=Path, required=True)
    ap.add_argument('--work', choices=['all', *WORKS], default='all')
    args = ap.parse_args()
    args.cache.mkdir(parents=True, exist_ok=True)
    robots_path = args.cache / 'robots.txt'
    if not robots_path.exists():
        with urlopen(Request(HOST + '/robots.txt', headers={'User-Agent': UA}), timeout=60) as response:
            robots_path.write_bytes(response.read())
    robots = urllib.robotparser.RobotFileParser()
    robots.parse(robots_path.read_text(encoding='utf-8').splitlines())
    selected = WORKS if args.work == 'all' else {args.work: WORKS[args.work]}
    for key, (title, label) in selected.items():
        folder = args.cache / key
        folder.mkdir(exist_ok=True)
        manifest_path = folder / 'manifest.json'
        manifest = json.loads(manifest_path.read_text(encoding='utf-8')) if manifest_path.exists() else {
            'key': key, 'title': title, 'label': label, 'license': 'CC-BY-SA-4.0', 'pages': [],
            'missingLinkedPages': [], 'collectionMethod': 'permitted article HTML; embedded wgRevisionId; API not requested'}
        pages = {page['title']: page for page in manifest['pages']}
        pending, visited, missing = [title], set(), set(manifest['missingLinkedPages'])
        while pending:
            page_title = pending.pop(0)
            if page_title in visited:
                continue
            visited.add(page_title)
            url = HOST + '/wiki/' + quote(page_title.replace(' ', '_'), safe='/')
            if not robots.can_fetch(UA, url):
                raise RuntimeError(f'Article blocked by robots: {url}')
            if page_title in pages:
                raw = gzip.decompress((folder / pages[page_title]['file']).read_bytes())
            else:
                with urlopen(Request(url, headers={'User-Agent': UA}), timeout=90) as response:
                    raw = response.read()
                    if urlparse(response.url).hostname != 'zh.wikisource.org':
                        raise RuntimeError('Unexpected article redirect')
                text = raw.decode('utf-8')
                revision = re.search(r'"wgRevisionId":(\d+)', text)
                pageid = re.search(r'"wgArticleId":(\d+)', text)
                if not revision or not pageid or int(pageid[1]) == 0:
                    raise ValueError(f'No actual revision for {page_title}')
                if 'creativecommons.org/licenses/by-sa/4.0/' not in text:
                    raise ValueError(f'No expected license footer: {page_title}')
                filename = pageid[1] + '-' + revision[1] + '.html.gz'
                (folder / filename).write_bytes(gzip.compress(raw, mtime=0))
                pages[page_title] = {'title': page_title, 'pageid': int(pageid[1]), 'revid': int(revision[1]),
                                     'url': url, 'file': filename, 'htmlBytes': len(raw),
                                     'htmlSha256': hashlib.sha256(raw).hexdigest(),
                                     'fetchedAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}
                print(json.dumps({'work': key, 'revision': int(revision[1]), 'title': page_title}, ensure_ascii=False), flush=True)
                time.sleep(1)
            links = WorkLinks(title)
            links.feed(raw.decode('utf-8'))
            pending.extend(sorted(links.found - visited))
            missing.update(links.missing)
            manifest['pages'] = sorted(pages.values(), key=lambda page: page['title'])
            manifest['missingLinkedPages'] = sorted(missing - pages.keys())
            manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        print(json.dumps({'work': key, 'pages': len(pages), 'missingLinkedPages': manifest['missingLinkedPages']}, ensure_ascii=False), flush=True)


if __name__ == '__main__':
    main()
