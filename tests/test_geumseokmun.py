import sys
from pathlib import Path
import tempfile
import unittest
import zipfile

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "services/ingestion"))
from extract_geumseokmun import date_bounds, extract


class InscriptionTests(unittest.TestCase):
    def test_uncertain_dates_do_not_become_exact_years(self):
        self.assertEqual(date_bounds("0414-99-99"), (414, 414, 414))
        self.assertEqual(date_bounds("05##-99-99"), (None, 500, 599))
        self.assertEqual(date_bounds("9999-99-99"), (None, None, None))
        self.assertEqual(date_bounds(None), (None, None, None))

    def test_sections_inherit_date_only_for_reading_and_use_xml_kind(self):
        def section(lid, kind):
            return f'<level4 id="{lid}"><front><biblioData type="{kind}"><title><mainTitle>같은 제목</mainTitle></title></biblioData></front><text><content><paragraph>甲乙</paragraph></content></text></level4>'
        xml = '<level1 id="g"><front><biblioData><title><mainTitle>고구려</mainTitle></title></biblioData></front><level3 id="stone"><front><biblioData><title><mainTitle>비</mainTitle></title><date><dateOccured date="0414-99-99"/></date></biblioData></front>' + section('read', '판독문') + section('intro', '개관') + '</level3></level1>'
        with tempfile.TemporaryDirectory() as tmp:
            bulk = Path(tmp) / 'data.zip'
            with zipfile.ZipFile(bulk, 'w') as z:
                z.writestr('a.xml', xml)
            result = extract(bulk, Path(tmp) / 'out')
            import json
            chunks = [json.loads(x) for x in (Path(tmp) / 'out/geumseok-stone/chunks.jsonl').read_text(encoding='utf-8').splitlines()]
        self.assertEqual(result['sourceCount'], 1)
        self.assertEqual(chunks[0]['date']['inheritedFrom'], 'stone')
        self.assertIsNone(chunks[1]['date'])
        self.assertIsNone(chunks[0]['reader'])


if __name__ == '__main__':
    unittest.main()
