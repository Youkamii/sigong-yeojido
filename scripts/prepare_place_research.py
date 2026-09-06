#!/usr/bin/env python3
"""Prepare counted place-index entries and exact source excerpts for research (#18)."""
import argparse
from collections import Counter, defaultdict
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def prepare(source_dir, top=40):
    counts = Counter()
    chunk_ids = defaultdict(list)
    with (source_dir / 'index-terms.jsonl').open(encoding='utf-8') as stream:
        for line in stream:
            if not line.strip():
                continue
            item = json.loads(line)
            if item.get('type') != '지명':
                continue
            term = item['text'].strip()
            if not term:
                continue
            counts[term] += 1
            if item['chunkId'] not in chunk_ids[term] and len(chunk_ids[term]) < 3:
                chunk_ids[term].append(item['chunkId'])
    selected = sorted(counts, key=lambda term: (-counts[term], term))[:top]
    wanted = {cid for term in selected for cid in chunk_ids[term]}
    chunks = {}
    with (source_dir / 'chunks.jsonl').open(encoding='utf-8') as stream:
        for line in stream:
            if line.strip():
                chunk = json.loads(line)
                if chunk['id'] in wanted:
                    chunks[chunk['id']] = chunk
    missing = wanted - chunks.keys()
    if missing:
        raise ValueError(f'Missing source chunks: {sorted(missing)}')
    terms = []
    for rank, term in enumerate(selected, 1):
        samples = []
        for cid in chunk_ids[term]:
            chunk = chunks[cid]
            text = chunk['text']
            position = text.find(term)
            start = max(0, position - 80)
            end = min(len(text), max(position, 0) + len(term) + 120)
            samples.append({'chunkId': cid, 'sourceId': chunk['sourceId'],
                            'locator': chunk.get('locator'), 'date': chunk.get('date'),
                            'permalink': chunk.get('permalink'), 'quote': text[start:end],
                            'quoteStart': start, 'quoteEnd': end,
                            'termInBody': position >= 0})
        terms.append({'rank': rank, 'text': term, 'count': counts[term], 'samples': samples})
    return {'source': source_dir.name, 'indexType': '지명', 'distinctTerms': len(counts),
            'occurrences': sum(counts.values()), 'top': top, 'terms': terms}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', required=True, choices=['goryeosa', 'samgukyusa'])
    parser.add_argument('--top', type=int, default=40)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    if args.top < 1:
        parser.error('--top must be positive')
    result = prepare(ROOT / 'data/sources' / args.source, args.top)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({k: result[k] for k in ['source', 'distinctTerms', 'occurrences', 'top']}))
