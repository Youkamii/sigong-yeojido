import contextlib
import importlib.util
import io
import json
from pathlib import Path
import tempfile
import unittest
import zipfile

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('list_index_terms', ROOT/'scripts/list_index_terms.py')
terms = importlib.util.module_from_spec(spec)
spec.loader.exec_module(terms)


class IndexTermsTests(unittest.TestCase):
    def test_nested_tags_entities_annotations_and_external_output(self):
        xml = '''<root><index type="지명">北<index type="지명">平&#x58E4;</index>城</index>
        <index type="인명">文武<annotation>다른 판독</annotation>王</index>
        <index type="지명">A&amp;B</index></root>'''
        with tempfile.TemporaryDirectory() as tmp:
            source = Path(tmp)/'fixture.zip'
            with zipfile.ZipFile(source,'w') as archive:
                archive.writestr('a.xml',xml)
            out = Path(tmp)/'outside/output.json'
            with contextlib.redirect_stdout(io.StringIO()):
                self.assertEqual(terms.main(['--zip',str(source),'--out',str(out)]),0)
                first = out.read_bytes()
                self.assertEqual(terms.main(['--zip',str(source),'--out',str(out)]),0)
            self.assertEqual(first,out.read_bytes())
            result = json.loads(first)['types']
            self.assertEqual(result['지명']['total'],3)
            self.assertEqual({x['term'] for x in result['지명']['terms']},{'北平壤城','平壤','A&B'})
            self.assertEqual(result['인명']['terms'],[{'term':'文武王','count':1}])


if __name__ == '__main__':
    unittest.main()
