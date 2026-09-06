import json
from pathlib import Path
import sys
import tempfile
import unittest
import zipfile

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'services/ingestion'))
from extract_jipseong import extract, issued_year


class JipseongTests(unittest.TestCase):
    def test_issued_year_preserves_uncertainty_and_ignores_author_lifetimes(self):
        self.assertEqual(issued_year('432년'), 432)
        self.assertEqual(issued_year('B.C.91년'), -91)
        self.assertEqual(issued_year('0666-08-13'), 666)
        for raw in ['3세기말', '660년경', '1340년 초간', '(승우 445~518)', '823~841년 사이', '']:
            self.assertIsNone(issued_year(raw))

    def test_books_are_distinct_and_unknown_compilation_year_stays_unknown(self):
        def book(lid):
            return f'<level1 id="{lid}"><front><biblioData><title><mainTitle>진서</mainTitle></title><source><dateIssued/></source></biblioData></front><level3 id="{lid}_1"><front><biblioData><title><mainTitle>기사</mainTitle></title><date><dateOccured date="0665-08-99L0"/></date></biblioData></front><text><content><paragraph><pDate type="발생일">0665-08-99L0</pDate>甲乙</paragraph></content></text></level3></level1>'
        with tempfile.TemporaryDirectory() as tmp:
            bulk = Path(tmp) / 'data.zip'
            with zipfile.ZipFile(bulk, 'w') as z:
                z.writestr('a.xml', book('ko_023'))
                z.writestr('b.xml', book('ko_027'))
            output = Path(tmp) / 'sources'
            result = extract(bulk, output)
            self.assertEqual(result['sourceCount'], 2)
            self.assertEqual(result['stats']['chunks'], 2)
            for directory in output.glob('jipseong-*'):
                if not directory.is_dir():
                    continue
                chunk = json.loads((directory / 'chunks.jsonl').read_text(encoding='utf-8'))
                self.assertEqual(chunk['text'], '甲乙')
                self.assertEqual(chunk['paragraphDates'][0]['raw'], '0665-08-99L0')
                card = directory.with_suffix('.md').read_text(encoding='utf-8')
                self.assertIn('composedYear: null', card)
                self.assertIn('coversFrom: 665', card)


if __name__ == '__main__':
    unittest.main()
