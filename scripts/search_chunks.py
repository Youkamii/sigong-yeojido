#!/usr/bin/env python3
"""로컬 원문 조각을 한 번씩 읽어 검색한다 (#181)."""
import argparse
import json
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
SOURCES = ROOT / 'data' / 'sources'
DEFAULT_FIELDS = 'id,sourceId,locator,date,text,permalink'
YEAR_RE = re.compile(r'^(-?\d{3,4})(?=-|$)')


def year_of(raw):
    """services/host/server.py year_of와 같은 규칙: 0, 9999 이상은 미상."""
    match = YEAR_RE.match(raw) if isinstance(raw, str) else None
    year = int(match[1]) if match else None
    return None if year is None or year == 0 or year >= 9999 else year


def chunk_year(chunk):
    date = chunk.get('date')
    if not isinstance(date, dict):
        return year_of(date)
    if date.get('raw'):
        return year_of(date['raw'])
    match = re.search(r'(-?\d+)년', date.get('label') or '')
    return int(match[1]) if match else None


def iter_chunks(sources=None, root=SOURCES):
    """존재하는 sources/*/chunks.jsonl만 스트리밍한다. sourceId로 선택한다."""
    selected = set(sources or [])
    for path in sorted(root.glob('*/chunks.jsonl')):
        if selected and 'src-' + path.parent.name not in selected:
            continue
        with path.open(encoding='utf-8') as stream:
            for number, line in enumerate(stream, 1):
                if not line.strip():
                    continue
                try:
                    chunk = json.loads(line)
                    if not isinstance(chunk, dict):
                        raise ValueError('chunk must be an object')
                except ValueError as exc:
                    raise ValueError(f'{path}:{number}: {exc}') from exc
                if not selected or chunk.get('sourceId') in selected:
                    yield chunk


def search(sources=None, start=None, end=None, keywords=(), locator=None,
           chunk_id=None, limit=50, root=SOURCES):
    count = 0
    for chunk in iter_chunks(sources, root):
        if chunk_id is not None:
            if chunk.get('id') == chunk_id:
                yield chunk
                return
            continue
        if start is not None or end is not None:
            year = chunk_year(chunk)
            if year is None or (start is not None and year < start) or (end is not None and year > end):
                continue
        if locator and locator not in (chunk.get('locator') or ''):
            continue
        if keywords:
            values = [chunk.get(key) or '' for key in ('text', 'locator', 'title')]
            values.extend(term.get('text') or '' for term in chunk.get('indexTerms') or [] if isinstance(term, dict))
            if not all(any(word in value for value in values) for word in keywords):
                continue
        yield chunk
        count += 1
        if count >= limit:
            return


def main(argv=None):
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, 'reconfigure'):
            stream.reconfigure(encoding='utf-8')
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='예:\n  python scripts/search_chunks.py --source src-samguksagi --from 551 --to 551 --keyword 娘城\n'
               '  python scripts/search_chunks.py --from -57 --to -57 --keyword 赫居世 --format table\n'
               '  python scripts/search_chunks.py --keyword 寺 --limit 3 --fields id,locator\n'
               'JSONL 출력 예: {"id": "chunk_samguksagi_sg_004_0040_0150", ...}\n'
               '--id는 다른 검색 조건과 --fields/--format을 무시하고 전체 필드 JSON 한 줄을 출력한다.')
    parser.add_argument('--source', action='append', help='sourceId, 반복 가능; 생략하면 로컬 전체')
    parser.add_argument('--from', dest='start', type=int, help='포함할 첫 서기연 (음수=기원전)')
    parser.add_argument('--to', dest='end', type=int, help='포함할 마지막 서기연')
    parser.add_argument('--keyword', action='append', default=[], help='부분 일치, 반복하면 AND')
    parser.add_argument('--locator', help='locator 부분 일치')
    parser.add_argument('--id', dest='chunk_id', help='정확한 id, 전체 필드 하나 출력; 없으면 exit 1')
    parser.add_argument('--limit', type=int, default=50)
    parser.add_argument('--format', choices=('jsonl', 'table'), default='jsonl')
    parser.add_argument('--fields', default=DEFAULT_FIELDS, help='쉼표로 구분한 JSONL 필드 목록')
    args = parser.parse_args(argv)
    if args.limit < 1:
        parser.error('--limit은 1 이상이어야 합니다')
    if args.start is not None and args.end is not None and args.start > args.end:
        parser.error('--from은 --to 이하여야 합니다')
    fields = [field.strip() for field in args.fields.split(',') if field.strip()]
    if not fields:
        parser.error('--fields가 비어 있습니다')
    found = False
    try:
        rows = search(None if args.chunk_id else args.source, args.start, args.end,
                      args.keyword, args.locator, args.chunk_id, args.limit)
        if args.format == 'table' and not args.chunk_id:
            print('id\tsourceId\tyear\tlocator\ttext')
        for row in rows:
            found = True
            if args.chunk_id or args.format == 'jsonl':
                print(json.dumps(row if args.chunk_id else {key: row.get(key) for key in fields}, ensure_ascii=False))
            else:
                print('\t'.join(' '.join(str(value if value is not None else '').split()) for value in
                                (row.get('id'), row.get('sourceId'), chunk_year(row), row.get('locator'), row.get('text'))))
    except (OSError, ValueError) as exc:
        print(str(exc), file=sys.stderr)
        return 1
    return int(bool(args.chunk_id) and not found)


if __name__ == '__main__':
    raise SystemExit(main())
