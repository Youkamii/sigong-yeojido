import importlib.util
import json
from pathlib import Path
import tempfile
import threading
import unittest
from unittest.mock import patch
from urllib.request import urlopen
from urllib.error import HTTPError
from urllib.parse import urlencode


ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("viewer_server", ROOT / "services/host/server.py")
server = importlib.util.module_from_spec(spec)
spec.loader.exec_module(server)


class NameMatchingTests(unittest.TestCase):
    def test_three_digit_inscription_years_and_unknown_dates(self):
        self.assertEqual(server.year_of("798-99-99"), 798)
        self.assertEqual(server.year_of("-0041-99-99"), -41)
        self.assertIsNone(server.year_of("05##-99-99"))
        self.assertIsNone(server.year_of("9999-99-99"))
        self.assertIsNone(server.year_of("12345-01-01"))

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

    def test_source_specific_place_does_not_count_a_homonym_in_another_book(self):
        place = {"id": "p", "label": "陳設", "sourceId": "src-a"}
        with patch.object(server, "index", return_value=self.idx), patch.object(server, "merged_places", return_value={"places": [place]}):
            counts = server.places_with_mentions()["places"][0]["mentions"]
        self.assertEqual(counts, {"src-a": 1})


class ApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.httpd = server.ThreadingHTTPServer(("127.0.0.1", 0), server.Handler)
        cls.thread = threading.Thread(target=cls.httpd.serve_forever, kwargs={"poll_interval": 0.01}, daemon=True)
        cls.thread.start()
        cls.url = f"http://127.0.0.1:{cls.httpd.server_port}"

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        cls.httpd.server_close()
        cls.thread.join()

    def get(self, path):
        with urlopen(self.url + path, timeout=5) as response:
            return json.load(response)

    def test_empty_source_selection_is_distinct_from_no_filter(self):
        idx = {"chunks": [{"id": "c", "sourceId": "src-a", "text": "place", "date": "0918"}],
               "countryTerms": {}, "byYear": {918: [0]},
               "claims": [{"id": "cl", "subject": "p", "citesChunk": "c", "fromSource": "src-a"}]}
        with patch.object(server, "index", return_value=idx):
            for endpoint in ["/api/mentions?names=place", "/api/year?y=918", "/api/claims?subject=p"]:
                with self.subTest(endpoint=endpoint):
                    self.assertEqual(self.get(endpoint)["total"], 1)
                    self.assertEqual(self.get(endpoint + "&sources=")["total"], 0)
                    self.assertEqual(self.get(endpoint + "&sources=src-a")["total"], 1)
                    self.assertEqual(self.get(endpoint + "&sources=src-b")["total"], 0)

    def test_claim_without_chunk_still_obeys_source_filter(self):
        idx = {"chunks": [], "claims": [{"id": "cl", "subject": "p", "fromSource": "src-a"}]}
        with patch.object(server, "index", return_value=idx):
            self.assertEqual(self.get("/api/claims?subject=p&sources=")["total"], 0)

    def test_graph_empty_selection_and_failures_are_distinct(self):
        with patch.object(server, "index", side_effect=AssertionError("graph must use Fuseki")):
            self.assertEqual(self.get('/api/graph?entity=person-gwanggaeto&sources=')['claims'],[])
        with patch.object(server, "neighborhood", side_effect=server.GraphUnavailable('unavailable')):
            with self.assertRaises(HTTPError) as error:
                self.get('/api/graph?entity=person-gwanggaeto')
            self.assertEqual(error.exception.code,503)
            self.assertEqual(json.load(error.exception),{'error':'unavailable'})
            error.exception.close()

    def test_graph_chunk_opening_obeys_source_selection(self):
        row={'id':'chunk-a','sourceId':'src-a','text':'actual text','locator':'first'}
        with patch.object(server,'index',return_value={'chunkById':{'chunk-a':row}}):
            self.assertEqual(self.get('/api/chunk?id=chunk-a')['chunk'],row)
            self.assertFalse(self.get('/api/chunk?id=chunk-a&sources=')['found'])
            self.assertFalse(self.get('/api/chunk?id=missing')['found'])

    def test_origin_filter_keeps_human_claims_and_intersects_sources(self):
        claims = [dict(id=origin or "unknown", subject="p", origin=origin, fromSource="src-a")
                  for origin in ("ai", "human", None)]
        idx = {"chunks": [], "claims": claims}
        with patch.object(server, "index", return_value=idx):
            self.assertEqual(self.get("/api/claims?subject=p")["total"], 3)
            human = self.get("/api/claims?subject=p&origin=human")
            self.assertEqual([c["id"] for c in human["claims"]], ["human"])
            self.assertEqual(human["allClaims"], 1)
            self.assertEqual(self.get("/api/claims?subject=p&origin=ai")["total"], 1)
            self.assertEqual(self.get("/api/claims?subject=p&origin=human&sources=")["total"], 0)
            self.assertEqual(self.get("/api/claims?subject=p&origin=human&sources=src-b")["total"], 0)
            with self.assertRaises(HTTPError) as error:
                self.get("/api/claims?subject=p&origin=reviewed")
            self.assertEqual(error.exception.code, 400)
            error.exception.close()

    def test_oversized_names_rejected_before_indexing(self):
        with patch.object(server, "index", side_effect=AssertionError("must not scan")):
            for query in (urlencode({"names": ",".join(["name"] * 9)}),
                          urlencode({"names": "字" * 33}),
                          urlencode([("names", "name")] * 9)):
                with self.subTest(query=query), self.assertRaises(HTTPError) as error:
                    self.get("/api/mentions?" + query)
                self.assertEqual(error.exception.code, 400)
                error.exception.close()

    def test_name_and_result_limits_accept_boundary(self):
        names = ["a" * 32] + [f"name{i}" for i in range(7)]
        idx = {"chunks": [{"id": str(i), "sourceId": "src-a", "text": names[0]} for i in range(501)], "countryTerms": {}}
        with patch.object(server, "index", return_value=idx):
            result = self.get("/api/mentions?" + urlencode({"names": ",".join(names), "limit": 999999}))
        self.assertEqual(result["total"], 501)
        self.assertEqual(len(result["chunks"]), 500)

    def test_chunk_pages_return_complete_rows_without_internal_file_positions(self):
        with tempfile.TemporaryDirectory() as tmp:
            directory = Path(tmp) / "sources/a"
            directory.mkdir(parents=True)
            rows = [{"id": str(i), "sourceId": "src-a", "text": "漢城", "annotations": [{"text": "校勘"}],
                     "locator": "卷一", "date": {"raw": "1392"}} for i in range(3)]
            (directory / "chunks.jsonl").write_text("\n".join(json.dumps(x, ensure_ascii=False) for x in rows) + "\n", encoding="utf-8")
            with patch.object(server, "DATA", Path(tmp)):
                compact = server.collect_chunks()
            self.assertNotIn("annotations", compact[0])
            idx = {"chunks": compact, "countryTerms": {}, "byYear": {1392: [0, 1, 2]}}
            with patch.object(server, "index", return_value=idx):
                page = self.get("/api/chunks?offset=1&limit=1")
                self.assertEqual(page["total"], 3)
                self.assertEqual(page["chunks"], rows[1:2])
                self.assertEqual(self.get("/api/chunks?sources=")["total"], 0)
                self.assertEqual(self.get("/api/year?y=1392&limit=1")["chunks"], rows[:1])
                self.assertEqual(self.get("/api/mentions?" + urlencode({"names": "漢城", "limit": 1}))["chunks"], rows[:1])


class PlaceMergeTests(unittest.TestCase):
    def test_research_source_and_exact_evidence_survive_merge(self):
        researched = {"id": "place-goryeosa-001", "label": "西京", "sourceId": "src-goryeosa",
                      "candidates": [], "evidence": [{"chunkId": "c", "quote": "幸西京."}]}
        with tempfile.TemporaryDirectory() as tmp:
            data = Path(tmp)
            (data / "places.json").write_text('{"places": []}', encoding="utf-8")
            (data / "places-candidates-goryeosa.json").write_text(json.dumps({"places": [researched]}), encoding="utf-8")
            with patch.object(server, "DATA", data):
                result = server.merged_places()["places"][0]
        self.assertEqual(result["sourceId"], "src-goryeosa")
        self.assertEqual(result["evidence"], researched["evidence"])
        self.assertEqual(result["origin"], "ai")

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
        self.assertEqual([(c['lat'],c['lon']) for c in places[0]['candidates']],[(37,127)])
        self.assertEqual([(c['lat'],c['lon'],c['validFrom']) for c in places[1]['candidates']],[(38,125,475)])
        self.assertEqual(places[0]['candidates'][0]['id'],'loc-p-1')
        self.assertFalse(places[0]['candidates'][0]['grounded'])
        self.assertEqual(places[1]["aliases"], ["漢忽"])

    def test_same_label_unions_candidates_without_losing_provenance(self):
        first = {"lat": 37, "lon": 127, "sourceUrl": "https://example.org/a"}
        second = dict(first, sourceUrl="https://example.org/b")
        with tempfile.TemporaryDirectory() as tmp:
            data = Path(tmp)
            for filename, label, candidates in [("places.json", "平穰", [first]), ("places-candidates-a.json", "平壤", [first, second])]:
                (data / filename).write_text(json.dumps({"places": [{"id": "p", "label": label, "aliases": ["平壤"], "candidates": candidates}]}), encoding="utf-8")
            with patch.object(server, "DATA", data):
                places = server.merged_places()["places"]
        self.assertEqual(len(places), 1)
        self.assertEqual(places[0]['candidates'][0]['sourceUrl'],first['sourceUrl'])
        self.assertEqual(places[0]['candidates'][1]['sourceUrl'],second['sourceUrl'])
        self.assertEqual(places[0]['candidates'][1]['origin'],'ai')
        self.assertEqual(places[0]['candidates'][1]['from'],'places-candidates-a.json')
        self.assertNotEqual(places[0]['candidates'][0]['id'],places[0]['candidates'][1]['id'])


if __name__ == "__main__":
    unittest.main()
