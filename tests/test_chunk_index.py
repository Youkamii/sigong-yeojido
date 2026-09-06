import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]/'services'))
import validate as V


class ChunkIndexTests(unittest.TestCase):
    def test_raw_text_is_loaded_only_on_reference_and_metadata_matches_eager_loader(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp)/'chunks.jsonl'
            rows = [{'id': 'a', 'sourceId': 'src-one', 'text': '甲 乙\n丙', 'locator': '卷 一',
                     'lang': 'hanmun', 'permalink': 'https://example.org/a', 'editorNotes': ['note']},
                    {'id': 'b', 'sourceId': 'src-two', 'text': '丁'}]
            path.write_text('\n'+''.join(json.dumps(r, ensure_ascii=False)+'\n' for r in rows), encoding='utf-8')
            lazy, eager, failures = V.ChunkIndex(), {}, []
            with patch.object(V, 'norm_ws', side_effect=AssertionError('unused text normalized')):
                V.load_chunks_file(path, lazy, failures)
                self.assertEqual(V.Inputs(chunks=lazy).chunk_counts, {'src-one': 1, 'src-two': 1})
                self.assertEqual(V.Inputs(chunks=lazy).sources, ['src-one', 'src-two'])
                self.assertEqual(len(lazy), 2)
            V.load_chunks_file(path, eager, failures)
            self.assertFalse(failures)
            self.assertEqual(dict(lazy), eager)
            self.assertEqual(lazy['a']['norm'], '甲乙丙')
            self.assertNotIn('missing', lazy)
            with self.assertRaises(KeyError):
                lazy['missing']

    def test_duplicate_ids_and_bad_unused_rows_still_fail(self):
        with tempfile.TemporaryDirectory() as tmp:
            index, failures = V.ChunkIndex(), []
            for number in (1, 2):
                path = Path(tmp)/f'{number}.jsonl'
                path.write_bytes(b'{"id":"same","text":"one","sourceId":"src-one"}\n{bad}\n{"id":"no-text"}\n')
                V.load_chunks_file(path, index, failures)
            self.assertEqual(len(index), 1)
            self.assertEqual(index.source_counts, {'src-one': 1})
            self.assertEqual(len(failures), 5)
            self.assertTrue(any('duplicate chunk id same' in f.message for f in failures))


if __name__ == '__main__':
    unittest.main()
