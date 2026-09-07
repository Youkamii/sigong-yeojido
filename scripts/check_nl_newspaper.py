"""Independently compare the fixed NL Turtle string literals with extracted articles."""
import argparse
from collections import Counter
from datetime import date
import hashlib
import json
from pathlib import Path
import re
from zipfile import ZipFile


def sha(value):
    return hashlib.sha256(value.encode('utf-8') if isinstance(value, str) else value).hexdigest()


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--zip', type=Path, required=True)
    ap.add_argument('--chunks', type=Path, required=True)
    ap.add_argument('--out', type=Path, required=True)
    args = ap.parse_args()
    with ZipFile(args.zip) as archive:
        text = archive.read('독립신문(서재필).ttl').decode('utf-8')
    records = re.split(r'^nlk:(CNTS-\d+)\s+a\s+', text, flags=re.M)
    rows = {r['recordId']: r for r in (json.loads(line) for line in args.chunks.read_text(encoding='utf-8').splitlines())}
    assert (len(records) - 1) // 2 == len(rows) == 19635
    seen = set()
    counts = Counter()
    for identifier, body in zip(records[1::2], records[2::2], strict=True):
        row = rows[identifier]

        def literal(predicate):
            matches = re.findall(re.escape(predicate) + r'\s+"((?:\\.|[^"\\])*)"\s*;', body)
            assert len(matches) == 1, (identifier, predicate, len(matches))
            return json.loads('"' + matches[0] + '"')

        abstract = literal('dcterms:abstract')
        issued = literal('dcterms:issued')
        separation = row['abstractSeparation']
        start, end = separation['originalStart'], separation['originalEnd']
        assert row['text'] == abstract[start:end]
        assert row['charCount'] == len(row['text'])
        assert separation['prefix'] == abstract[:start]
        assert abstract[end:].startswith(separation['separator'])
        modernized = abstract[end + len(separation['separator']):]
        assert separation['modernizedChars'] == len(modernized)
        assert separation['modernizedSha256'] == sha(modernized)
        assert separation['providerAbstractSha256'] == sha(abstract)
        assert row['publicationDateRaw'] == issued
        assert row['date'] == date(int(issued[:4]), int(issued[4:6]), int(issued[6:8])).isoformat()
        assert row['dateKind'] == 'newspaper-publication'
        counts.update([issued[:4]])
        seen.add(identifier)
    assert seen == set(rows)
    result = {'checkedArticles': len(seen), 'independentParser': 'fixed-snapshot Turtle literal lexer and JSON string decoding; does not call rdflib or importer',
              'exactOriginalSubstrings': len(seen), 'publicationDatesChecked': len(seen), 'byYear': dict(sorted(counts.items())),
              'chunksSha256': sha(args.chunks.read_bytes()), 'failures': [],
              'limits': ['Checks the published transcription, not the blocked original scan images or historical truth.']}
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8', newline='\n')
    print(json.dumps(result, ensure_ascii=False))


if __name__ == '__main__':
    main()
