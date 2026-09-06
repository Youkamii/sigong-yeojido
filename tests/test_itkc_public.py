from pathlib import Path
import sys
import unittest
from xml.etree import ElementTree as ET
sys.path.insert(0, str(Path(__file__).resolve().parents[1]/'services/ingestion'))
from extract_itkc_public import extract_record


class ITKCPublicTests(unittest.TestCase):
    def test_lemma_stays_in_text_and_notes_are_scoped_to_the_article(self):
        for body in ('乙', '丙'):
            level = ET.fromstring(f'''<레벨3 id="a"><메타정보><제목정보><제목>甲</제목></제목정보></메타정보>
            <본문정보><내용><단락><주석 id="D001">原文</주석><원주>原註</원주>
            <고유명사 type="">名</고유명사><imghj href="KC04045"/>文</단락></내용></본문정보>
            <주석정보><주석항목 id="D001" type="교감주"><주석명>原文</주석명><주석내용>{body}</주석내용>
            </주석항목></주석정보></레벨3>''')
            row = extract_record(level, 'one.xml', '卷一')
            self.assertEqual(row['text'], '原文 名〓文')
            self.assertEqual([n['text'] for n in row['annotations']], [body, '原註'])
            self.assertEqual(row['indexTerms'], [{'type': '', 'text': '名'}])
            self.assertEqual(row['newChars'][0]['code'], 'KC04045')
            self.assertEqual(row['text'][row['newChars'][0]['offset']], '〓')

    def test_missing_editorial_note_does_not_silently_lose_its_reference(self):
        level = ET.fromstring('<레벨3 id="a"><본문정보><내용><단락><주석 id="missing">甲</주석></단락></내용></본문정보></레벨3>')
        with self.assertRaises(KeyError): extract_record(level, 'one.xml', '卷一')
