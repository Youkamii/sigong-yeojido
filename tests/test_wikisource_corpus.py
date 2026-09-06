import sys
from pathlib import Path
import unittest
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from import_wikisource_corpus import Article


class WikisourceArticleTests(unittest.TestCase):
    def test_header_editor_controls_glyph_titles_and_nested_text(self):
        parser = Article()
        parser.feed('<nav>網站<div class="mw-parser-output">錯</div></nav><div id="mw-content-text"><div class="mw-parser-output"><div id="headerContainer">著者<p>序</p></div>'
                    '<h2>建國<span class="mw-editsection">[編輯]</span></h2><p><sub>臣</sub>聞'
                    '<span title="眘 ※避諱">今上御名</span>。<br/>次行<sup>注</sup></p>'
                    '<div class="licenseContainer">授權說明</div><script>wrong()</script></div></div><footer>Footer</footer>')
        row = parser.result()
        self.assertEqual(row['text'], '建國\n臣聞今上御名。\n次行注')
        self.assertEqual(row['headerText'], '著者\n序')
        self.assertEqual(row['editorialTitles'], [{'tag': 'span', 'title': '眘 ※避諱', 'text': '今上御名'}])

    def test_image_only_body_does_not_invent_a_transcription(self):
        parser = Article()
        parser.feed('<div id="mw-content-text"><div class="mw-parser-output"><div id="headerContainer">卷一</div><img src="image.jpg" alt="書影"/></div></div>')
        row = parser.result()
        self.assertEqual(row['text'], '')
        self.assertEqual(row['imageReferences'], [{'src': 'image.jpg', 'alt': '書影'}])


if __name__ == '__main__':
    unittest.main()
