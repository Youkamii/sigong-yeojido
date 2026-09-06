"""Round-trip synthetic geography conditions through a separate, temporary Fuseki process."""
import argparse
import hashlib
import io
import json
import os
from pathlib import Path
import socket
import subprocess
import sys
import tempfile
import time
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1]
sys.path[:0] = [str(ROOT / 'services'), str(ROOT / 'tests')]
import build_ttl as B
import graph_query as Q
from test_geography_rules import fixture
from fuseki_load import upload, count_triples


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--java', required=True); ap.add_argument('--jar', type=Path, required=True)
    ap.add_argument('--out', type=Path, required=True)
    args = ap.parse_args(); args.out.parent.mkdir(parents=True, exist_ok=True)
    assert args.jar.is_file()
    with tempfile.TemporaryDirectory(prefix='sigong-geography-fuseki-') as temp:
        folder = Path(temp); data = folder / 'data'
        for name in ['sources/test', 'claims/test', 'entities/person']:
            (data / name).mkdir(parents=True)
        (data / 'sources/test.md').write_text('---\ntype: Source\nid: src-test\nlabel: Synthetic test\n---\n', encoding='utf-8')
        (data / 'entities/person/person-test.md').write_text('---\ntype: Person\nid: person-test\nlabel: Test person\n---\n', encoding='utf-8')
        (data / 'sources/test/chunks.jsonl').write_text(json.dumps({'id': 'chunk-test', 'sourceId': 'src-test', 'text': 'Synthetic test input.'}) + '\n', encoding='utf-8')
        records = fixture(); records[-1]['object']['hours'] = 3
        def save():
            (data / 'claims/test/chunk-test.md').write_text('---\ntype: Claims\nsource: src-test\nchunk: chunk-test\n---\n```claims-json\n' + json.dumps(records) + '\n```\n', encoding='utf-8')
        save(); ttl = folder / 'fixture.ttl'
        code, built = B.build(data, ttl, io.StringIO()); assert code == 0, built.failures
        with socket.socket() as sock:
            sock.bind(('127.0.0.1', 0)); port = sock.getsockname()[1]
        endpoint = f'http://127.0.0.1:{port}/geography-check'
        process = None
        with (folder / 'java.log').open('wb') as log:
            try:
                process = subprocess.Popen([args.java, '-Xmx128m', '-jar', str(args.jar), '--localhost', '--port',
                    str(port), '--ping', '--update', '--mem', '/geography-check'], cwd=folder,
                    stdin=subprocess.DEVNULL, stdout=log, stderr=log,
                    creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0))
                for _ in range(100):
                    assert process.poll() is None, (folder / 'java.log').read_text(errors='replace')
                    try:
                        with urlopen(endpoint + '/get?default', timeout=1) as response:
                            assert response.status == 200
                        break
                    except OSError:
                        time.sleep(.2)
                else:
                    raise RuntimeError('temporary Fuseki did not become ready')
                upload(endpoint, str(ttl), replace=True)
                os.environ['SIGONG_FUSEKI_QUERY'] = endpoint + '/query'
                graph = Q.neighborhood('person-test', {'src-test'})
                restored = {c['id']: c for c in graph['claims']}
                assert set(restored) == {c['id'] for c in records}
                for claim in records:
                    assert restored[claim['id']]['object'] == claim['object']
                    for key in ['fromSource', 'citesChunk', 'quote', 'origin', 'predicate']:
                        assert restored[claim['id']][key] == claim[key]
                assert not Q.neighborhood('person-test', {'src-test'}, 'human')['claims']
                assert not Q.neighborhood('person-test', {'src-other'})['claims']
                count = count_triples(endpoint); assert count == built.stats['triples']
                original_sha = hashlib.sha256(ttl.read_bytes()).hexdigest()
                records[-1]['object']['hours'] = 4; save()
                code, rejected = B.build(data, ttl, io.StringIO())
                assert code != 0 and any('history-geography' in message for message in rejected.failures), rejected.failures
                assert hashlib.sha256(ttl.read_bytes()).hexdigest() == original_sha
                assert count_triples(endpoint) == count
                assert Q.neighborhood('person-test')['claims'][-1]['object']['hours'] == 3
                report = {'synthetic': True, 'historicalCases': 0, 'claims': 3, 'triples': count,
                    'ttlSha256': original_sha, 'checks': {'actual_sparql_round_trip': True,
                    'full_conditions_preserved': True, 'source_and_origin_filters': True,
                    'contradiction_rejected_before_upload': True, 'previous_graph_preserved': True},
                    'isolation': 'Separate ephemeral localhost port and geography-check dataset; production untouched.',
                    'window': 'CREATE_NO_WINDOW' if os.name == 'nt' else 'headless'}
            finally:
                if process is not None and process.poll() is None:
                    process.terminate()
                    try: process.wait(timeout=10)
                    except subprocess.TimeoutExpired:
                        process.kill(); process.wait(timeout=10)
        args.out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        print(json.dumps(report, ensure_ascii=False))


if __name__ == '__main__':
    main()
