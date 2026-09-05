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


class PlaceMergeTests(unittest.TestCase):
    def test_different_concepts_keep_candidates_and_local_variant_links(self):
        base = {"id": "p", "label": "百殘國城", "candidates": [{"lat": 37, "lon": 127}]}
        extra = {"id": "p", "label": "漢城", "candidates": [{"lat": 38, "lon": 125, "validFrom": 475}]}
        variant = {"id": "variant", "label": "漢忽", "variantOf": "p"}
        with tempfile.TemporaryDirectory() as tmp:
            data = Path(tmp)
            (data / "places.json").write_text(json.dumps({"places": [base]}), encoding="utf-8")
            (data / "places-candidates-a.json").write_text(json.dumps({"places": [extra, variant]}), encoding="utf-8")
            with patch.object(server, "DATA", data), self.assertLogs(level="WARNING"):
                places = server.merged_places()["places"]
        self.assertEqual(len(places), 2)
        self.assertNotEqual(places[0]["id"], places[1]["id"])
        self.assertEqual(places[0]["candidates"], base["candidates"])
        self.assertEqual(places[1]["candidates"], extra["candidates"])
        self.assertEqual(places[1]["aliases"], ["漢忽"])

    def test_same_label_unions_candidates_without_losing_provenance(self):
        first = {"lat": 37, "lon": 127, "sourceUrl": "https://example.org/a"}
        second = dict(first, sourceUrl="https://example.org/b")
        with tempfile.TemporaryDirectory() as tmp:
            data = Path(tmp)
            for filename, candidates in [("places.json", [first]), ("places-candidates-a.json", [first, second])]:
                (data / filename).write_text(json.dumps({"places": [{"id": "p", "label": "漢城", "candidates": candidates}]}), encoding="utf-8")
            with patch.object(server, "DATA", data):
                places = server.merged_places()["places"]
        self.assertEqual(len(places), 1)
        self.assertEqual(places[0]["candidates"], [first, second])


if __name__ == "__main__":
    unittest.main()
