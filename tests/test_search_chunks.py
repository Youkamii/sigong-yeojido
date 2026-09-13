import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import search_chunks as S


class SearchChunksTests(unittest.TestCase):
    def test_real_year_and_keyword(self):
        rows = list(S.search(['src-samguksagi'], 551, 551, ['娘城']))
        self.assertIn('chunk_samguksagi_sg_004_0040_0150', [r['id'] for r in rows])

    def test_real_bce(self):
        rows = list(S.search(['src-samguksagi'], -57, -57, ['赫居世']))
        self.assertIn('chunk_samguksagi_sg_001_0020_0010', [r['id'] for r in rows])
        self.assertTrue(all(S.chunk_year(row) == -57 for row in rows))

    def test_year_rules(self):
        for raw, expected in [('-0057-04-15L0', -57), ('0551-01-99L0', 551),
                              ('877-01', 877), ('03**-99-99L0', None), ('9999-01', None), ('0000', None)]:
            with self.subTest(raw=raw):
                self.assertEqual(S.year_of(raw), expected)
        self.assertEqual(S.chunk_year({'date': {'label': '877년 1월 미상'}}), 877)
        self.assertEqual(S.chunk_year({'date': {'label': '-57년'}}), -57)
        self.assertEqual(S.chunk_year({'date': {'raw': '0551-01', 'label': '12년'}}), 551)
        self.assertIsNone(S.chunk_year({'date': {'raw': '03**-01', 'label': '12년'}}))

    def test_streaming_and_undated_index_terms(self):
        with tempfile.TemporaryDirectory(dir=ROOT / 'tests' / 'fixtures' / 'facts') as temporary:
            root = Path(temporary)
            folder = root / 'geumseok-test'
            folder.mkdir()
            row = dict(id='chunk-test', sourceId='src-geumseok-test', date=None, text='원문',
                       locator='비석', title='제목', indexTerms=[{'text': '寺'}])
            path = folder / 'chunks.jsonl'
            path.write_text(json.dumps(row) + '\n', encoding='utf-8')
            self.assertEqual(list(S.search(keywords=['寺', '원문'], root=root)), [row])
            self.assertEqual(list(S.search(start=1, root=root)), [])
            self.assertEqual(list(S.search(keywords=['寺', '없음'], root=root)), [])
            self.assertEqual(list(S.search(locator='없음', root=root)), [])
            # limit에 도달하면 다음 줄을 파싱하지 않는다.
            with path.open('a', encoding='utf-8') as stream:
                stream.write('invalid JSON\n')
            self.assertEqual(list(S.search(limit=1, root=root)), [row])

    def test_cli_fields_and_exact_id(self):
        script = str(ROOT / 'scripts' / 'search_chunks.py')
        output = subprocess.run([sys.executable, script, '--source', 'src-samguksagi', '--from', '551',
            '--to', '551', '--keyword', '娘城', '--fields', 'id,date'], capture_output=True, encoding='utf-8')
        self.assertEqual(output.returncode, 0, output.stderr)
        self.assertEqual(set(json.loads(output.stdout)), {'id', 'date'})
        output = subprocess.run([sys.executable, script, '--id', 'chunk_samguksagi_sg_004_0040_0150',
            '--fields', 'id', '--format', 'table', '--source', 'src-missing'], capture_output=True, encoding='utf-8')
        self.assertEqual(output.returncode, 0, output.stderr)
        self.assertIn('annotations', json.loads(output.stdout))


if __name__ == '__main__':
    unittest.main()
