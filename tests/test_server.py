import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch


ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("viewer_server", ROOT / "services/host/server.py")
server = importlib.util.module_from_spec(spec)
spec.loader.exec_module(server)


class NameMatchingTests(unittest.TestCase):
    def setUp(self):
        self.chunks = [
            {"id": "false", "sourceId": "src-a", "text": "陳設於漢山"},
            {"id": "country", "sourceId": "src-a", "text": "使者至陳"},
            {"id": "alias", "sourceId": "src-b", "text": "大唐使者"},
            {"id": "no-index", "sourceId": "src-b", "text": "陳設"},
        ]
        self.idx = {"chunks": self.chunks, "countryTerms": {"country": {"陳"}}, "places": None}

    def test_single_character_uses_country_index_only(self):
        with patch.object(server, "index", return_value=self.idx):
            result = server.mentions(["陳", "漢"], None, 120)
        self.assertEqual([c["id"] for c in result["chunks"]], ["country"])

    def test_alias_and_place_counts_share_matching(self):
        place = {"id": "p", "label": "唐", "aliases": ["大唐"]}
        with patch.object(server, "index", return_value=self.idx), patch.object(server, "merged_places", return_value={"places": [place]}):
            counts = server.places_with_mentions()["places"][0]["mentions"]
            result = server.mentions(server.place_names(place), None, 120)
        self.assertEqual(result["bySource"], {"src-b": 1})
        self.assertEqual(counts, result["bySource"])

    def test_only_country_index_type_is_accepted(self):
        with tempfile.TemporaryDirectory() as tmp:
            source = Path(tmp) / "sources/a"
            source.mkdir(parents=True)
            rows = [{"chunkId": "a", "text": "陳", "type": "이름"},
                    {"chunkId": "b", "text": "陳", "type": "국명"}]
            (source / "index-terms.jsonl").write_text("\n".join(json.dumps(r) for r in rows), encoding="utf-8")
            with patch.object(server, "DATA", Path(tmp)):
                self.assertEqual(server.collect_country_terms(), {"b": {"陳"}})


if __name__ == "__main__":
    unittest.main()
