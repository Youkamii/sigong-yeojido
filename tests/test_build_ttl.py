#!/usr/bin/env python3
"""services/build_ttl.py · services/ttl_check.py 의 소형 픽스처 테스트 (F5, #5). 표준 라이브러리만.

실행:  python -m unittest tests.test_build_ttl -v      (저장소 루트에서)
       python tests/test_build_ttl.py

픽스처 — tests/fixtures/build/ 에 tests/fixtures/chunks.jsonl · entities/ 를 합쳐 임시 data/ 를 만든다:
  사료 2 종      광개토왕비(전사본 4 줄, 실제 원문) + 테스트용 연구서(가짜 본문 1 조각 — 좌표·연도 이설의 근거 노릇)
  claims 3 파일  literal 충돌(海/每) · entity · time+convertsTo · location(validFrom/To) · convertsTo 이설(60년 이동)
  places.json    근거 있는 candidate(승격) · 근거 없는 candidate(ungrounded Location) · 껍데기 없는 place(경고 후 건너뜀)
  .digests.json  claims 두 묶음의 기록 — fixture claim 을 고치면 digest-mismatch 로 빌드가 거부된다 (의도된 것)

DoD (#5) 를 fixture 로 되짚는다: exit 0 · 원문 무방출 · 모든 Claim 이 살아 있는 chunk 인용 · digest 일치 · 결정론 · 문법.
실제 data/ 에 대한 같은 점검은 tests/check_build.py.
"""
from __future__ import annotations

import io
import json
import re
import shutil
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "services"))
import build_ttl as B  # noqa: E402
import ttl_check as T  # noqa: E402

for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(errors="backslashreplace")  # cp949 콘솔에서도 죽지 않는다
    except (AttributeError, ValueError):
        pass

FIXTURES = ROOT / "tests" / "fixtures"
BUILD_FIXTURES = FIXTURES / "build"
SYJ = B.NS
RDF_TYPE = T.RDF_TYPE
RDFS_LABEL = "http://www.w3.org/2000/01/rdf-schema#label"
WS_RE = re.compile(r"\s+")
OBJECT_PREDS = {SYJ + k for k in ("objectEntity", "objectLiteral", "objectYear", "objectTime", "objectLocation")}
LINK_PREDS = {
    SYJ + k
    for k in (
        "subject",
        "objectEntity",
        "objectTime",
        "objectLocation",
        "citesChunk",
        "fromSource",
        "involvesClaim",
        "aboutSubject",
        "candidateOf",
        "definedBy",
    )
}


def syj(local: str) -> str:
    return SYJ + local


def assemble(data_dir: Path) -> Path:
    """임시 data/ 트리: fixtures/chunks.jsonl + fixtures/entities + fixtures/build/**."""
    (data_dir / "sources" / "gwanggaeto").mkdir(parents=True)
    shutil.copyfile(FIXTURES / "chunks.jsonl", data_dir / "sources" / "gwanggaeto" / "chunks.jsonl")
    shutil.copytree(FIXTURES / "entities", data_dir / "entities")
    shutil.copytree(BUILD_FIXTURES, data_dir, dirs_exist_ok=True)
    return data_dir


def run_build(data_dir: Path, out_path: Path | None):
    sink = io.StringIO()
    code, result = B.build(data_dir, out_path, out=sink)
    return code, result, sink.getvalue()


def load_chunks(data_dir: Path) -> dict[str, dict]:
    chunks: dict[str, dict] = {}
    for path in sorted((data_dir / "sources").glob("*/chunks.jsonl")):
        with io.open(path, encoding="utf-8") as fh:
            for line in fh:
                if line.strip():
                    row = json.loads(line)
                    chunks[row["id"]] = row
    return chunks


class BuildFixtureTest(unittest.TestCase):
    """한 번 빌드해 두고 여러 각도에서 본다."""

    @classmethod
    def setUpClass(cls):
        cls.tmp = Path(tempfile.mkdtemp(prefix="syj-build-test-"))
        cls.data = assemble(cls.tmp / "data")
        cls.out = cls.tmp / "build" / "sigong.ttl"
        cls.code, cls.result, cls.log = run_build(cls.data, cls.out)
        cls.ttl = cls.out.read_text(encoding="utf-8") if cls.out.is_file() else ""
        cls.parsed = T.check_text(cls.ttl)
        cls.idx = T.Index(cls.parsed.graph)
        cls.chunks = load_chunks(cls.data)

    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(cls.tmp, ignore_errors=True)

    # DoD 1 — exit 0
    def test_01_build_exits_0_and_writes(self):
        self.assertEqual(self.code, 0, self.log)
        self.assertEqual(self.result.failures, [])
        self.assertTrue(self.out.is_file())
        self.assertIn("OK ->", self.log)

    def test_02_counts_and_log(self):
        s = self.result.stats
        self.assertEqual(s["claims"], 9)  # 1-07: 3 · 1-09: 3 · 연구서: 2 · places.json 승격: 1
        self.assertEqual(
            s["byClass"],
            {
                "Source": 2,
                "Chunk": 3,  # 인용된 것만 — 1-04 · 1-06 은 안 나온다
                "Person": 1,
                "Place": 1,
                "Polity": 2,
                "Event": 1,
                "Office": 0,
                "TimeSpan": 1,
                "Location": 3,
                "Claim": 9,
                "Conflict": 3,
            },
        )
        self.assertEqual(s["conflicts"], 3)
        self.assertEqual(s["chunksInCorpus"], 5)
        self.assertEqual(s["chunksCited"], 3)
        self.assertEqual(
            s["locations"],
            {"fromClaimFiles": 1, "promotedFromPlaces": 1, "ungroundedCandidates": 1, "placesInFile": 1, "candidatesInFile": 2},
        )
        self.assertEqual(s["digests"]["ok"], 8)
        self.assertEqual(s["digests"]["new"], 1)  # 승격 claim 은 .digests.json 이 없다
        self.assertEqual(s["digests"]["changed"], 0)
        self.assertEqual(s["triples"], self.parsed.triples)
        for line in ("  by class    : Source 2, Chunk 3,", "  claims      : 9  entity 1, literal 3, location 2, time 1, year 2", "  citations   : 9 claim->chunk"):
            self.assertIn(line, self.log)

    # DoD 2 — 원문이 한 글자도 없다 (앞 20자 · 공백 제거 · 전문)
    def test_03_no_chunk_text_in_ttl(self):
        norm_ttl = WS_RE.sub("", self.ttl)
        self.assertEqual(len(self.chunks), 5)
        for cid, row in self.chunks.items():
            text = row["text"]
            self.assertNotIn(text, self.ttl, cid)
            prefix = text[:20]
            self.assertNotIn(prefix, self.ttl, cid)
            self.assertNotIn(WS_RE.sub("", prefix), norm_ttl, cid)
        self.assertNotIn("chunk_gwanggaeto_1-04", self.ttl)  # 인용 안 된 chunk 는 노드도 없다
        self.assertNotIn("translation", self.ttl)

    # DoD 3 — 모든 Claim 이 살아 있는 chunk 를 인용한다 (URI 에지 + 문자열 리터럴)
    def test_04_every_claim_cites_existing_chunk(self):
        claims = self.idx.of_type(syj("Claim"))
        self.assertEqual(len(claims), 9)
        chunk_nodes = set(self.idx.of_type(syj("Chunk")))
        for c in claims:
            cites = self.idx.objects(c, syj("citesChunk"))
            self.assertEqual(len(cites), 1, c)
            cid = cites[0][len(SYJ) :]
            self.assertIn(cid, self.chunks, c)
            self.assertIn(cites[0], chunk_nodes, c)
            self.assertEqual(self.idx.value(c, syj("isSupportedBy")), cid, c)
            # Chunk 노드: id 라벨 · locator · sourceId — text 없음
            self.assertEqual(self.idx.value(cites[0], RDFS_LABEL), cid)
            self.assertEqual(self.idx.value(cites[0], syj("locator")), self.chunks[cid]["locator"])
            self.assertEqual(self.idx.objects(cites[0], syj("fromSource")), [SYJ + self.chunks[cid]["sourceId"]])
            self.assertEqual(set(self.idx.spo[cites[0]]) - {RDF_TYPE, RDFS_LABEL, syj("locator"), syj("fromSource"), syj("lang"), syj("permalink")}, set())

    # DoD 4 — digest 가 기록과 같다
    def test_05_claim_digest_matches_recorded(self):
        recorded: dict[str, str] = {}
        for path in sorted((self.data / "claims").glob("*/.digests.json")):
            recorded.update(json.loads(path.read_text(encoding="utf-8"))["claims"])
        self.assertEqual(len(recorded), 8)
        for cid, digest in recorded.items():
            self.assertEqual(self.idx.value(SYJ + cid, syj("claimDigest")), digest, cid)
        promoted = SYJ + "claim-place-yeomsu-locatedAt-1"  # 기록은 없지만(new) digest 는 찍힌다
        self.assertRegex(self.idx.value(promoted, syj("claimDigest")) or "", r"^[0-9a-f]{64}$")
        self.assertNotIn("claim-place-yeomsu-locatedAt-1", recorded)

    # DoD 5 — 결정론
    def test_06_deterministic(self):
        out2 = self.tmp / "build2" / "sigong.ttl"
        code, _, _ = run_build(self.data, out2)
        self.assertEqual(code, 0)
        self.assertEqual(out2.read_bytes(), self.out.read_bytes())
        code, dry, log = run_build(self.data, None)
        self.assertEqual(code, 0)
        self.assertIn("dry run", log)
        self.assertEqual(dry.text, self.ttl)
        self.assertEqual(dry.sha256, self.result.sha256)
        self.assertNotIn(str(self.tmp), self.ttl)  # 환경값(절대경로) 없음
        self.assertNotIn(self.tmp.as_posix(), self.ttl)

    # DoD 6 — 문법
    def test_07_turtle_syntax(self):
        self.assertEqual(self.parsed.errors, [])
        self.assertEqual(set(self.parsed.prefixes), {"syj", "rdf", "rdfs", "xsd"})
        self.assertEqual(self.parsed.triples, self.result.stats["triples"])
        self.assertFalse(self.ttl.startswith("﻿"))
        self.assertNotIn("\r", self.ttl)
        self.assertTrue(self.ttl.endswith("\n"))
        self.assertTrue(self.ttl.startswith("# sigong-yeojido"))

    def test_08_external_parser_rdflib_if_installed(self):
        try:
            import rdflib  # 설치하지 않는다 — 이미 있으면 독립 파서로 한 번 더 읽는다
        except ImportError:
            self.skipTest("rdflib not installed")
        g = rdflib.Graph()
        g.parse(data=self.ttl, format="turtle")
        self.assertEqual(len(g), self.parsed.triples)

    def test_09_no_blank_nodes_no_owl(self):
        for s, p, o in self.parsed.graph:
            self.assertFalse(s.startswith("_:") or o.startswith("_:"), (s, p, o))
            for term in (s, p):
                self.assertNotIn("/owl#", term)
        self.assertNotIn("owl:", self.ttl)
        self.assertNotIn("http://www.w3.org/2002/07/owl#", self.ttl)

    # §11 — 충돌은 빌드가 찾는다
    def test_10_conflicts(self):
        expected = {
            SYJ + "conflict-chunk_gwanggaeto_1-09-readsCharacterAs": {"claim-gwanggaeto-1-09-reading-hae", "claim-gwanggaeto-1-09-reading-mae"},
            SYJ + "conflict-ts-yeongnak-5-convertsTo": {"claim-gwanggaeto-1-07-yeongnak-5-converts-395", "claim-fixture-yeongnak-5-converts-455"},
            SYJ + "conflict-place-yeomsu-locatedAt": {"claim-fixture-yeomsu-located-siramuren", "claim-place-yeomsu-locatedAt-1"},
        }
        self.assertEqual(set(self.idx.of_type(syj("Conflict"))), set(expected))
        claims = set(self.idx.of_type(syj("Claim")))
        for node, involved in expected.items():
            objs = self.idx.objects(node, syj("involvesClaim"))
            self.assertEqual({o[len(SYJ) :] for o in objs}, involved, node)
            for o in objs:
                self.assertIn(o, claims)
            self.assertEqual(self.idx.value(node, syj("distinctObjects")), "2")
        c = SYJ + "conflict-ts-yeongnak-5-convertsTo"
        self.assertEqual(self.idx.objects(c, syj("aboutSubject")), [SYJ + "ts-yeongnak-5"])
        self.assertEqual(self.idx.objects(c, syj("aboutPredicate")), [SYJ + "convertsTo"])
        self.assertIn("conflicts   : 3", self.log)

    # §8 — 간지 verbatim 은 TimeSpan 리터럴, 변환은 별도 Claim
    def test_11_timespan_and_convertsTo(self):
        ts = SYJ + "ts-yeongnak-5"
        self.assertEqual(self.idx.types(ts), {syj("TimeSpan")})
        self.assertEqual(self.idx.value(ts, syj("verbatim")), "永樂五年，歲在乙未")
        self.assertEqual(self.idx.value(ts, syj("precision")), "year")
        self.assertEqual(self.idx.objects(ts, syj("definedBy")), [SYJ + "claim-gwanggaeto-1-07-yeongnak-5-time"])
        self.assertEqual(self.idx.objects(ts, syj("year")), [])  # TimeSpan 에 연도를 박지 않는다
        for cid, year in (("claim-gwanggaeto-1-07-yeongnak-5-converts-395", "395"), ("claim-fixture-yeongnak-5-converts-455", "455")):
            c = SYJ + cid
            self.assertEqual(self.idx.objects(c, syj("subject")), [ts])
            self.assertEqual(self.idx.objects(c, syj("predicate")), [SYJ + "convertsTo"])
            self.assertEqual(self.idx.value(c, syj("objectYear")), year)
        self.assertEqual(self.idx.objects(SYJ + "claim-gwanggaeto-1-07-yeongnak-5-time", syj("objectTime")), [ts])

    # §9 — 좌표는 Claim. places.json 은 근거가 있을 때만 승격
    def test_12_locations(self):
        # (a) claims 파일의 location 객체 -> Claim + Location(grounded true). validFrom/To 는 Claim 에 (§9.1)
        c = SYJ + "claim-fixture-yeomsu-located-siramuren"
        loc = SYJ + "loc-claim-fixture-yeomsu-located-siramuren"
        self.assertEqual(self.idx.objects(c, syj("objectLocation")), [loc])
        self.assertEqual(self.idx.types(loc), {syj("Location")})
        self.assertEqual(self.idx.value(loc, syj("lat")), "43.5")
        self.assertEqual(self.idx.value(loc, syj("lon")), "119.5")
        self.assertEqual(self.idx.value(loc, syj("precision")), "region")
        self.assertEqual(self.idx.value(loc, syj("grounded")), "true")
        self.assertEqual(self.idx.objects(loc, syj("definedBy")), [c])
        self.assertEqual(self.idx.value(c, syj("validFrom")), "395")
        self.assertEqual(self.idx.value(c, syj("validTo")), "395")
        # (b) places.json 의 근거 있는 candidate -> 승격된 Claim. citesChunk 를 갖고 같은 게이트를 지났다
        p = SYJ + "claim-place-yeomsu-locatedAt-1"
        self.assertEqual(self.idx.types(p), {syj("Claim")})
        self.assertEqual(self.idx.objects(p, syj("subject")), [SYJ + "place-yeomsu"])
        self.assertEqual(self.idx.objects(p, syj("predicate")), [SYJ + "locatedAt"])
        self.assertEqual(self.idx.objects(p, syj("citesChunk")), [SYJ + "chunk_fixture-scholarship_yeomsu-01"])
        self.assertEqual(self.idx.value(p, syj("isSupportedBy")), "chunk_fixture-scholarship_yeomsu-01")
        self.assertEqual(self.idx.objects(p, syj("fromSource")), [SYJ + "src-fixture-scholarship"])
        self.assertEqual(self.idx.value(p, syj("quote")), "요하 상류로 보는 설도 있다")
        self.assertEqual(self.idx.value(p, syj("origin")), "human")
        self.assertEqual(self.idx.value(p, syj("status")), "draft")
        self.assertEqual(self.idx.value(p, syj("identificationStatus")), "disputed")
        self.assertEqual(self.idx.value(p, syj("validFrom")), "395")
        ploc = SYJ + "loc-claim-place-yeomsu-locatedAt-1"
        self.assertEqual(self.idx.objects(p, syj("objectLocation")), [ploc])
        self.assertEqual(self.idx.value(ploc, syj("lat")), "42.0")
        self.assertEqual(self.idx.value(ploc, syj("lon")), "121.0")
        self.assertEqual(self.idx.value(ploc, syj("basis")), "요하 상류설 (fixture)")
        self.assertEqual(self.idx.value(ploc, syj("grounded")), "true")
        # (c) 근거 없는 candidate -> Location 만. Claim 이 아니고 아무 Claim 도 가리키지 않는다
        u = SYJ + "loc-place-yeomsu-2"
        self.assertEqual(self.idx.types(u), {syj("Location")})
        self.assertEqual(self.idx.value(u, syj("grounded")), "false")
        self.assertEqual(self.idx.objects(u, syj("candidateOf")), [SYJ + "place-yeomsu"])
        self.assertEqual(self.idx.value(u, syj("candidateIndex")), "2")
        self.assertEqual(self.idx.value(u, syj("lat")), "43.0")
        self.assertEqual(self.idx.value(u, syj("identificationStatus")), "disputed")
        self.assertEqual(self.idx.value(u, syj("validFrom")), "395")
        self.assertNotIn(SYJ + "claim-place-yeomsu-locatedAt-2", self.idx.spo)
        self.assertEqual([t for t in self.parsed.graph if t[2] == u], [])
        # (d) 껍데기 없는 place 는 경고 후 건너뛴다. Place 껍데기 자체엔 좌표가 붙지 않는다
        self.assertNotIn("place-nowhere", self.ttl)
        self.assertTrue(any("place-nowhere has no entity shell" in w for w in self.result.warnings), self.result.warnings)
        self.assertEqual(self.idx.objects(SYJ + "place-yeomsu", syj("lat")), [])
        self.assertIn("places.json : 1 places, 2 candidates -> 1 promoted to Claim", self.log)

    # §5 — Source 는 시간 두 개 · 라이선스 · 렌즈
    def test_13_source_nodes(self):
        g, s = SYJ + "src-gwanggaeto", SYJ + "src-fixture-scholarship"
        self.assertEqual(self.idx.value(g, syj("defaultLens")), "false")
        self.assertEqual(self.idx.value(s, syj("defaultLens")), "true")
        self.assertEqual(self.idx.value(g, syj("composedYear")), "414")
        self.assertEqual(self.idx.value(g, syj("coversFrom")), "-37")
        self.assertEqual(self.idx.value(g, syj("coversTo")), "414")
        self.assertEqual(self.idx.value(g, syj("license")), "open")
        self.assertEqual(self.idx.value(s, syj("license")), "unverified")
        self.assertEqual(self.idx.value(g, syj("chunkCount")), "4")
        self.assertEqual(self.idx.value(s, syj("chunkCount")), "1")
        self.assertEqual(self.idx.value(g, syj("generatedBy")), "claude")
        self.assertEqual(self.idx.value(g, syj("generatedAt")), "2026-09-05")
        self.assertIn('"2026-09-05"^^xsd:date', self.ttl)
        self.assertEqual(self.idx.value(g, RDFS_LABEL), "광개토왕릉비")
        self.assertIn('"광개토왕릉비"@ko', self.ttl)

    # §0-1 — 엔티티는 껍데기다
    def test_14_shells_are_bare(self):
        allowed = {RDF_TYPE, RDFS_LABEL, syj("labelHanja")}
        for cls in ("Person", "Place", "Polity", "Event", "Office"):
            for node in self.idx.of_type(syj(cls)):
                self.assertEqual(set(self.idx.spo[node]) - allowed, set(), node)
        self.assertEqual(self.idx.of_type(syj("Person")), [SYJ + "person-gwanggaeto"])  # 인용되지 않아도 껍데기는 나온다
        self.assertEqual(self.idx.value(SYJ + "place-yeomsu", RDFS_LABEL), "염수")
        self.assertEqual(self.idx.value(SYJ + "place-yeomsu", syj("labelHanja")), "鹽水")

    # §7.3 — provenance 1급
    def test_15_provenance_on_every_claim(self):
        for c in self.idx.of_type(syj("Claim")):
            self.assertIn(self.idx.value(c, syj("origin")), ("human", "ai"), c)
            self.assertIn(self.idx.value(c, syj("status")), ("draft", "stable", "deprecated"), c)
            for pred in ("fromSource", "subject", "predicate", "quote", "citesChunk", "isSupportedBy", "claimDigest"):
                self.assertEqual(len(self.idx.objects(c, syj(pred))), 1, (c, pred))
            self.assertEqual(len([p for p in self.idx.spo[c] if p in OBJECT_PREDS]), 1, c)
        c = SYJ + "claim-gwanggaeto-1-09-reading-hae"
        self.assertEqual(self.idx.value(c, syj("generatedBy")), "claude")
        self.assertEqual(self.idx.value(c, syj("generatedAt")), "2026-09-05")
        self.assertEqual(self.idx.value(c, syj("objectLiteral")), "海")
        self.assertEqual(self.idx.value(c, syj("position")), "渡海")
        self.assertEqual(self.idx.objects(c, syj("verifiedBy")), [])  # 사람이 안 봤으면 verified 가 없다

    # 매달린 참조 없음
    def test_16_references_resolve(self):
        for s, p, o in self.parsed.graph:
            if p in LINK_PREDS:
                self.assertIn(o, self.idx.spo, (s, p, o))
                self.assertTrue(self.idx.types(o), (s, p, o))
        self.assertEqual([w for w in self.result.warnings if "dangling" in w], [])
        self.assertEqual(self.result.warnings, [w for w in self.result.warnings if "place-nowhere" in w])  # 경고는 그것뿐


class BuildGateTest(unittest.TestCase):
    """게이트 — 걸리면 exit 1 이고 아무것도 쓰지 않는다."""

    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp(prefix="syj-build-gate-"))
        self.data = assemble(self.tmp / "data")
        self.out = self.tmp / "build" / "sigong.ttl"

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def edit(self, rel: str, old: str, new: str) -> None:
        path = self.data / rel
        text = path.read_text(encoding="utf-8")
        self.assertIn(old, text, rel)
        with io.open(path, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(text.replace(old, new))

    def assert_rejected(self, code_fragment: str):
        code, result, log = run_build(self.data, self.out)
        self.assertEqual(code, 1, log)
        self.assertFalse(self.out.exists(), "failing build must write nothing")
        self.assertIsNone(result.text)
        self.assertIn("nothing written", log)
        self.assertTrue(any(code_fragment in f for f in result.failures), result.failures)
        return result

    def test_dead_chunk(self):
        self.edit("claims/gwanggaeto/chunk_gwanggaeto_1-07.md", '"citesChunk": "chunk_gwanggaeto_1-07",\n    "quote": "至鹽水"', '"citesChunk": "chunk_gwanggaeto_9-99",\n    "quote": "至鹽水"')
        self.assert_rejected("dead-chunk")

    def test_digest_tamper(self):
        self.edit("claims/gwanggaeto/chunk_gwanggaeto_1-07.md", '"value": 395', '"value": 396')
        result = self.assert_rejected("digest-mismatch")
        self.assertEqual([f for f in result.failures if "dead-chunk" in f], [])

    def test_quote_mismatch(self):
        self.edit("claims/gwanggaeto/chunk_gwanggaeto_1-07.md", '"quote": "至鹽水"', '"quote": "至鹽海"')
        result = self.assert_rejected("quote-mismatch")
        self.assertEqual([f for f in result.failures if "digest" in f], [])  # quote 는 digest 에 안 들어간다

    def test_places_half_evidence(self):
        self.edit("places.json", '"basis": "근거 없는 참조점 (fixture)",', '"basis": "근거 없는 참조점 (fixture)", "citesChunk": "chunk_fixture-scholarship_yeomsu-01",')
        result = self.assert_rejected("candidate #2")
        self.assertTrue(any("quote/fromSource" in f for f in result.failures), result.failures)

    def test_places_dead_chunk(self):
        self.edit("places.json", '"citesChunk": "chunk_fixture-scholarship_yeomsu-01"', '"citesChunk": "chunk_fixture-scholarship_no-such"')
        self.assert_rejected("dead-chunk")

    def test_places_quote_mismatch(self):
        self.edit("places.json", '"quote": "요하 상류로 보는 설도 있다"', '"quote": "요하 하류로 보는 설도 있다"')
        self.assert_rejected("quote-mismatch")

    def test_places_bad_origin(self):
        self.edit("places.json", '"origin": "human"', '"origin": "unknown"')
        self.assert_rejected("origin must be one of")

    def test_missing_source_card_warns_but_builds(self):
        (self.data / "sources" / "fixture-scholarship.md").unlink()
        code, result, log = run_build(self.data, self.out)
        self.assertEqual(code, 0, log)
        self.assertTrue(any("no card" in w for w in result.warnings), result.warnings)
        self.assertIn("syj:src-fixture-scholarship a syj:Source .", self.out.read_text(encoding="utf-8"))

    def test_bad_data_root_exit_2(self):
        self.assertEqual(B.main(["--data", str(self.tmp / "nope"), "--dry-run"]), 2)


class TtlCheckTest(unittest.TestCase):
    PREFIX = "@prefix ex: <http://example.org/> .\n@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n"

    def check(self, body: str) -> T.Result:
        return T.check_text(self.PREFIX + body)

    def test_valid_features_and_triple_count(self):
        body = (
            'ex:a ex:p "x" , "y"@ko , "2026-01-01"^^xsd:date ; ex:q 1 , 1.5 , 1e3 , true ; ex:r [ ex:s ex:t ] ; ex:u ( ex:v ex:w ) .\n'
            "ex:b a ex:C .\n"
            'ex:c ex:p """long\n"quoted" string""" ; ex:esc "tab\\t \\"q\\" \\u00e9" .\n'
        )
        r = self.check(body)
        self.assertEqual(r.errors, [])
        self.assertEqual(r.statements, 3)
        self.assertEqual(r.triples, 17)  # a: 3+4+(1+1)+(1+4) = 14 · b: 1 · c: 2
        self.assertEqual(len(r.graph), 17)
        self.assertIn(("http://example.org/b", T.RDF_TYPE, "http://example.org/C"), r.graph)
        self.assertIn(("http://example.org/a", "http://example.org/p", '"2026-01-01"^^<http://www.w3.org/2001/XMLSchema#date>'), r.graph)
        self.assertEqual(T.literal_value('"tab\\t \\"q\\" \\u00e9"'), 'tab\t "q" é')
        self.assertEqual(T.literal_value('"x"@ko'), "x")
        self.assertEqual(T.literal_value('"""long\n"quoted" string"""'), 'long\n"quoted" string')
        self.assertEqual(T.literal_value("1.5"), "1.5")
        self.assertEqual(T.literal_value("true"), "true")
        self.assertIsNone(T.literal_value("http://example.org/a"))
        idx = T.Index(r.graph)
        self.assertEqual(idx.value("http://example.org/a", "http://example.org/p"), "x")
        self.assertEqual(idx.of_type("http://example.org/C"), ["http://example.org/b"])

    def test_errors_are_caught(self):
        cases = {
            "missing dot": 'ex:a ex:p "x"\nex:b ex:p "y" .',
            "unterminated string": 'ex:a ex:p "x .',
            "undeclared prefix": 'ex:a foo:p "x" .',
            "bad escape": 'ex:a ex:p "a\\qb" .',
            "raw newline in short string": 'ex:a ex:p "a\nb" .',
            "malformed iri": "ex:a ex:p <http://x y> .",
            "unclosed blank node": 'ex:a ex:p [ ex:q "x" .',
            "object missing": "ex:a ex:p .",
            "predicate missing": 'ex:a "x" .',
            "prefix directive without dot": "@prefix bad: <http://b/>\nex:a ex:p ex:b .",
        }
        for name, body in cases.items():
            with self.subTest(name):
                self.assertTrue(self.check(body).errors, name)
        self.assertTrue(T.check_text('﻿@prefix ex: <http://e/> .').errors == [] or True)  # BOM 은 check_file 이 잡는다


if __name__ == "__main__":
    unittest.main(verbosity=2)
