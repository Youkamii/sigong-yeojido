import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
import zipfile

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("extract_nikh", ROOT / "services/ingestion/extract_nikh_xml.py")
extractor = importlib.util.module_from_spec(spec)
spec.loader.exec_module(extractor)


class ExtractionTests(unittest.TestCase):
    def test_root_level2_and_wrapper_keep_depth_sections_and_editions(self):
        xml = '<level2 id="waa_101"><front><biblioData><title><mainTitle>元年</mainTitle></title></biblioData></front><text><content><paragraph>序</paragraph></content></text><level5 id="waa_101_001"><text><content><paragraph>甲<annotation type="校"><noteContent>乙</noteContent></annotation><index type="지명">漢城</index></paragraph></content></text></level5></level2>'
        with tempfile.TemporaryDirectory() as tmp:
            zip_path = Path(tmp) / "sample.zip"
            with zipfile.ZipFile(zip_path, "w") as z:
                z.writestr("a.xml", xml)
                z.writestr("b.xml", '<item>' + xml.replace("waa", "wba") + '</item>')
            chunks, report = extractor.extract("joseon-sillok", zip_path)
            self.assertEqual([c["level"] for c in chunks], [2, 5, 2, 5])
            self.assertEqual([c["chunkType"] for c in chunks], ["section", "article"] * 2)
            self.assertEqual([c["sourceId"] for c in chunks], ["src-sillok-waa"] * 2 + ["src-sillok-wba"] * 2)
            self.assertEqual(chunks[1]["text"], "甲漢城")
            self.assertEqual(chunks[1]["annotations"][0]["offset"], 1)
            self.assertEqual(report["stats"]["articles"], 2)
            for run in ("one", "two"):
                with extractor.OutputWriter(Path(tmp) / run) as writer:
                    saved, _ = extractor.extract("joseon-sillok", zip_path, emit=writer)
                    self.assertEqual(saved, [])
            for path in (Path(tmp) / "one").glob("*/*.jsonl"):
                self.assertEqual(path.read_bytes(), (Path(tmp) / "two" / path.relative_to(Path(tmp) / "one")).read_bytes())
            rows = [json.loads(x) for x in (Path(tmp) / "one/sillok-waa/annotations.jsonl").read_text(encoding="utf-8").splitlines()]
            self.assertEqual(rows[0]["chunkId"], chunks[1]["id"])

    def test_duplicate_id_rejected_while_streaming(self):
        xml = '<level2 id="a"><text><content><paragraph>甲</paragraph></content></text></level2>'
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "sample.zip"
            with zipfile.ZipFile(path, "w") as z:
                z.writestr("a.xml", xml)
                z.writestr("b.xml", xml)
            with self.assertRaises(extractor.ExtractError):
                extractor.extract("fixture", path, emit=lambda row: None)

    def test_draft_proofreading_is_preserved_with_its_type(self):
        xml = extractor.ET.fromstring('<level5 id="woa_x"><text><content><paragraph>甲<proofreading type="산삭">乙</proofreading>丙</paragraph></content></text></level5>')
        chunk, art = extractor.extract_article(xml, "sillok-woa", ["기사"])
        self.assertEqual(chunk["text"], "甲乙丙")
        self.assertEqual(chunk["proofreadings"], [{"type": "산삭", "offset": 1, "end": 2, "parentSeq": None, "text": "乙"}])
        self.assertFalse(art.unknown_tags)


if __name__ == "__main__":
    unittest.main()
