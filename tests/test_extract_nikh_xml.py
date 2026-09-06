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
    def test_later_annals_separate_three_series_and_preserve_parent_date_forms(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp)/'later.zip'
            with zipfile.ZipFile(path, 'w') as archive:
                for prefix in ['wza', 'wzb', 'wzc']:
                    archive.writestr(prefix+'.xml', f'''<level2 id="{prefix}_101"><level4 id="{prefix}_day">
                    <front><biblioData><date><dateOccured type="서기" date="1910-01-01L0"/>
                    <dateOccured type="간지">陽曆</dateOccured></date></biblioData></front>
                    <level5 id="{prefix}_article"><front><biblioData><date>
                    <dateOccured type="서기" date="1910-01-01L0"/></date></biblioData></front>
                    <text><content>正文</content></text></level5></level4></level2>''')
            chunks, _ = extractor.extract('gosunjong-sillok', path)
        self.assertEqual([c['sourceId'] for c in chunks], ['src-sillok-wza', 'src-sillok-wzb', 'src-sillok-wzc'])
        for chunk in chunks:
            self.assertEqual(chunk['dateContext']['forms'][1]['label'], '陽曆')
            self.assertNotIn('dateInheritedFrom', chunk)
            self.assertEqual(chunk['dateForms'][0]['raw'], '1910-01-01L0')

    def test_register_preserves_front_matter_without_treating_print_year_as_event(self):
        xml = '''<level1 id="bb_001"><front><biblioData><title><mainTitle>一冊</mainTitle></title>
        <publication><dateIssued date="1959-04-05"/></publication></biblioData>
        <description><introduction><content><paragraph>序甲</paragraph></content></introduction>
        <remarks><content><paragraph>凡例乙</paragraph></content></remarks></description></front>
        <level4 id="bb_001_001"><front><biblioData><date><dateOccured date="1617-01-00L0"/></date></biblioData></front>
        <text><content>正文</content></text></level4></level1>'''
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp)/'register.zip'
            with zipfile.ZipFile(path, 'w') as archive:
                archive.writestr('one.xml', xml)
            chunks, report = extractor.extract('bibyeonsa-deungnok', path)
        front, article = chunks
        self.assertEqual(front['id'], 'chunk_bibyeonsa-deungnok_bb_001__front')
        self.assertEqual(front['text'], '序甲\n凡例乙')
        self.assertIsNone(front['date'])
        self.assertIn('1959-04-05', front['frontMatterXml'])
        self.assertEqual(article['date']['raw'], '1617-01-00L0')
        self.assertEqual(report['stats']['metadata'], 1)

    def test_journal_keeps_parallel_dates_and_inherits_day_without_crossing_siblings(self):
        xml = '''<level2 id="SJW-A01"><front><biblioData><date>
        <dateOccured type="간지">계해</dateOccured><dateOccured type="서기" date="1623"/>
        </date></biblioData></front><level4 id="SJW-A01030120"><front><biblioData><date>
        <dateOccured type="간지">임인</dateOccured><dateOccured type="재위연도">인조 01-03-12L0</dateOccured>
        <dateOccured type="서기" date="1623-03-12L0"/></date></biblioData></front>
        <text><content/></text><level5 id="SJW-A01030120-00100" type="기사"><text><content>甲</content></text></level5>
        </level4><level5 id="SJW-A01-other"><text><content>乙</content></text></level5></level2>'''
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "journal.zip"
            with zipfile.ZipFile(path, "w") as archive:
                archive.writestr("year.xml", xml)
            chunks, _ = extractor.extract("seungjeongwon-ilgi", path)
        day, article, sibling = chunks
        self.assertEqual(day["date"]["raw"], "1623-03-12L0")
        self.assertEqual(len(day["dateForms"]), 3)
        self.assertEqual(article["dateInheritedFrom"], "SJW-A01030120")
        self.assertEqual(article["dateContext"]["forms"], day["dateForms"])
        self.assertEqual(article["date"]["raw"], "1623-03-12L0")
        self.assertEqual(article["recordType"], "기사")
        self.assertEqual(sibling["date"]["raw"], "1623")
        self.assertEqual(sibling["dateInheritedFrom"], "SJW-A01")
        self.assertEqual(article["permalink"], "https://sjw.history.go.kr/id/SJW-A01030120-00100")

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
