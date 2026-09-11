import hashlib
import importlib.util
from pathlib import Path
import tempfile
import unittest

spec=importlib.util.spec_from_file_location('regional_import',Path(__file__).resolve().parents[1]/'scripts/import_regional_cities_163.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)

class RegionalImportTests(unittest.TestCase):
    def fixture(self,root):
        raw=b'<html><p>Town 1400 until 1500.</p></html>';(root/'source.html').write_bytes(raw)
        return {'sources':[{'id':'src-test','url':'https://example.org','verifiedFile':'source.html','verifiedSha256':hashlib.sha256(raw).hexdigest(),'excerpts':[{'id':'chunk-test','text':'Town 1400 until 1500.','locator':'p'}]}],
          'claims':[{'id':'claim-test','subject':'event-test','predicate':'syj:activeIn','object':{'kind':'time','id':'time-test','verbatim':'1400','precision':'year-range','earliest':1400,'latest':1499},'fromSource':'src-test','citesChunk':'chunk-test','quote':'Town 1400 until 1500.'}],
          'scenes':[{'id':'scene-test','kind':'settlement','startYear':1400,'endYear':1499,'dateClaimIds':['claim-test'],'actionClaimIds':[],'place':{'precision':'area','claimIds':[]}}]}
    def test_preserves_explicit_interval_and_ai_provenance(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder);data=self.fixture(root);_,_,claims=module.normalize(data,root)
            self.assertEqual(claims[0]['object']['latest'],1499);self.assertEqual(claims[0]['origin'],'ai');self.assertEqual(claims[0]['status'],'draft')
    def test_rejects_quote_absent_from_original(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder);data=self.fixture(root);data['sources'][0]['excerpts'][0]['text']='Town 1300 until 1600.'
            with self.assertRaises(AssertionError):module.normalize(data,root)
    def test_rejects_changed_original_or_missing_scene_evidence(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder);data=self.fixture(root);data['scenes'][0]['dateClaimIds']=['missing']
            with self.assertRaises(AssertionError):module.normalize(data,root)
            data=self.fixture(root);(root/'source.html').write_text('different')
            with self.assertRaises(AssertionError):module.normalize(data,root)

if __name__=='__main__':unittest.main()
