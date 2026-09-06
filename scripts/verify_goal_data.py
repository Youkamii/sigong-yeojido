"""Check new corpus files against Git and serve their boundary records and added claims through real APIs."""
import argparse
from collections import defaultdict
import hashlib
import json
from pathlib import Path
import subprocess
import sys
from urllib.parse import urlencode
from urllib.request import urlopen


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    ap.add_argument('--base', default='http://127.0.0.1:8870')
    ap.add_argument('--out', type=Path, required=True); args = ap.parse_args()
    root = args.root.resolve(); sys.path.insert(0, str(root / 'services'))
    from validate import parse_claims_text
    def get(path, **params):
        with urlopen(args.base + path + '?' + urlencode(params), timeout=90) as response:
            return json.load(response)
    sources = {source['id']: source for source in get('/api/sources')['sources']}
    groups = {'goryeosa-jeolyo': ['goryeosa-jeolyo'],
              'independence': [f'independence-kd-{n:03d}' for n in range(1, 44) if n != 36],
              'gowundang': ['itkc-gowundang-pilgi'],
              'wikisource': ['zhws-balhaego', 'zhws-dongguk-tonggam', 'zhws-goryeo-dogyeong',
                            'zhws-gyewon', 'zhws-maecheon', 'zhws-sinjeung-yeoji']}
    expected_counts = {'goryeosa-jeolyo': 11226, 'independence': 13366, 'gowundang': 255, 'wikisource': 113}
    assert 'src-independence-kd-036' not in sources
    hashed = {}; samples = []; observed_counts = {}
    for group, slugs in groups.items():
        total = 0
        for slug in slugs:
            source_id = 'src-' + slug; folder = root / 'data/sources' / slug
            rows = [json.loads(line) for line in (folder / 'chunks.jsonl').read_text(encoding='utf-8').splitlines() if line.strip()]
            assert sources[source_id]['chunkCount'] == len(rows), source_id
            assert all(row['sourceId'] == source_id for row in rows)
            total += len(rows)
            for offset in sorted({0, len(rows) - 1}):
                response = get('/api/chunks', sources=source_id, offset=offset, limit=1)
                assert response['total'] == len(rows) and response['chunks'] == [rows[offset]], (source_id, offset)
            samples.append({'source': source_id, 'chunks': len(rows), 'first': rows[0]['id'], 'last': rows[-1]['id']})
            for path in folder.glob('*.jsonl'):
                payload = path.read_bytes(); relative = path.relative_to(root).as_posix()
                blob = hashlib.sha1(b'blob ' + str(len(payload)).encode() + b'\0' + payload).hexdigest()
                expected = subprocess.check_output(['git', 'rev-parse', 'HEAD:' + relative], cwd=root, text=True).strip()
                assert blob == expected, relative
                hashed[relative] = hashlib.sha256(payload).hexdigest()
        assert total == expected_counts[group], (group, total)
        observed_counts[group] = total

    lenses = json.loads((root / 'data/lenses.json').read_text(encoding='utf-8'))['lenses']
    selected = next(lens for lens in lenses if lens['id'] == 'era-spine')['sources'] + ['src-miao2011-pyeongyang']
    by_subject = defaultdict(list)
    for source_id in selected:
        for path in (root / 'data/claims' / source_id.removeprefix('src-')).glob('*.md'):
            _, claims = parse_claims_text(path.read_text(encoding='utf-8'))
            for claim in claims: by_subject[claim['subject'], source_id].append(claim)
    checked = []
    for (subject, source_id), claims in by_subject.items():
        response = get('/api/graph', entity=subject, sources=source_id, limit=100)
        returned = {claim['id']: claim for claim in response['claims']}
        for claim in claims:
            actual = returned[claim['id']]
            for key in ('subject', 'predicate', 'fromSource', 'citesChunk', 'quote', 'origin'):
                assert actual[key] == claim[key], (claim['id'], key)
            for key, value in claim['object'].items():
                assert actual['object'].get(key) == value, (claim['id'], key)
            checked.append(claim['id'])
    assert len(checked) == 45 and len(set(checked)) == 45
    report = {'base': args.base, 'head': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=root, text=True).strip(),
        'newCorpusSources': len(samples), 'newCorpusChunks': sum(observed_counts.values()),
        'byCorpus': observed_counts, 'jsonlFilesMatchedGit': len(hashed), 'sha256': hashed, 'boundarySamples': samples,
        'graphClaimsChecked': len(checked), 'graphRequests': len(by_subject), 'claimIds': sorted(checked),
        'checks': {'file_bytes_match_git': True, 'api_first_last_objects': True, 'source_totals': True,
                   'missing_kd036_preserved': True, 'spine_and_identity_graph_objects': True},
        'limits': ['API tests read the first and last record per new Source; file hashes cover every new JSONL.',
                   'Full corpus interpretation and the missing location evidence in Q6 remain separate.']}
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({key: report[key] for key in ('head', 'newCorpusSources', 'newCorpusChunks',
        'jsonlFilesMatchedGit', 'graphClaimsChecked', 'graphRequests', 'checks')}))


if __name__ == '__main__':
    main()
