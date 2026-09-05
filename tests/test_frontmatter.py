from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "services"))
from frontmatter import ParseError, parse_front_matter
import build_ttl
import validate
from test_server import server


class FrontmatterTests(unittest.TestCase):
    def test_source_metadata_has_same_types_in_all_consumers(self):
        path = ROOT / "data/sources/gwanggaeto.md"
        text = path.read_text(encoding="utf-8")
        expected, body = parse_front_matter(text)
        self.assertEqual(server.parse_frontmatter(path), expected)
        self.assertEqual(build_ttl.parse_card_front_matter(text), expected)
        self.assertEqual(validate.parse_front_matter(text)[0], expected)
        self.assertIs(expected["defaultLens"], False)
        self.assertIsNone(expected["verified"])
        self.assertEqual(expected["composedYear"], 414)
        self.assertIn("by", expected["generated"])
        self.assertIn("resource", expected["sources"][0])
        self.assertTrue(body.startswith("\n# 광개토왕릉비"))

    def test_bom_crlf_nested_provenance_and_quoted_scalars(self):
        text = '\ufeff---\r\ntype: "Claims"\r\nverified:\r\n  by: reader\r\n  at: 2026-09-06\r\ncode: "001"\r\n---\r\nbody'
        meta, body = parse_front_matter(text)
        self.assertEqual(meta["type"], "Claims")
        self.assertEqual(meta["verified"], {"by": "reader", "at": "2026-09-06"})
        self.assertEqual(meta["code"], "001")
        self.assertEqual(body, "body")

    def test_duplicate_and_unparsed_lines_are_rejected(self):
        for body in ("id: a\nid: b", "id: a\n  stray: b", "id: a\n- orphan", "a:\n\tb: c"):
            with self.subTest(body=body), self.assertRaises(ParseError):
                parse_front_matter("---\n" + body + "\n---\n")


if __name__ == "__main__":
    unittest.main()
