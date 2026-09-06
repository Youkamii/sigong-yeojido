#!/usr/bin/env python3
"""F5 DoD 점검 — 실제 data/ 와 빌드 산출물에 대해 (#5). 표준 라이브러리만.

실행:  python tests/check_build.py [--data data] [--ttl data/build/sigong.ttl] [--json OUT.json]
       exit 0 이면 전부 통과. 마지막에 stats JSON 을 찍는다.

점검 항목:
  1 build        임시 파일로 두 번 빌드한다 — 둘 다 exit 0
  2 no-text      Chunk 노드는 원 레코드의 허용 메타데이터만 갖는다. Claim의 근거 인용은 허용한다
  3 cites        모든 syj:Claim 이 syj:citesChunk 하나를 갖고, 그 chunk 가 chunks.jsonl 에 있고, TTL 에 syj:Chunk 노드로 있고,
                 syj:isSupportedBy 리터럴이 같은 id 다
  4 digest       TTL 의 syj:claimDigest 가 data/claims/*/.digests.json 의 값과 일치한다 (기록된 claim 전부 · 기록 없는 Claim 수도 보고)
  5 determinism  두 번 빌드한 결과가 바이트 동일하고 --ttl 파일과도 같다
  6 syntax       services/ttl_check.py 통과 · 접두어 syj/rdf/rdfs/xsd 뿐 · 빈 노드 없음 · owl 없음 · BOM/CRLF 없음
                 + rdflib 가 이미 설치돼 있으면 그것으로도 파싱해 트리플 수를 대조 (설치하지 않는다) + riot 이 PATH 에 있으면 riot --validate
  7 refs         subject · objectEntity · objectTime · objectLocation · citesChunk · fromSource · involvesClaim · aboutSubject ·
                 candidateOf · definedBy 가 가리키는 노드가 전부 TTL 에 타입을 갖는다
  8 conflicts    syj:Conflict 집합 == TTL 의 Claim 만으로 다시 계산한 충돌 집합 (같은 subject·predicate 에 다른 object 값)
  9 provenance   모든 Claim: origin(human|ai) · status · fromSource · quote · claimDigest 하나씩, object 속성 정확히 하나
"""
from __future__ import annotations

import argparse
import io
import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "services"))
import build_ttl as B  # noqa: E402
import ttl_check as T  # noqa: E402

SYJ = B.NS
RDFS_LABEL = "http://www.w3.org/2000/01/rdf-schema#label"
WS_RE = re.compile(r"\s+")
OBJECT_PREDS = ("objectEntity", "objectLiteral", "objectYear", "objectTime", "objectLocation")
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


class Checker:
    def __init__(self, out):
        self.out = out
        self.results: dict[str, dict] = {}

    def check(self, name: str, ok: bool, detail: str = "") -> bool:
        self.results[name] = {"ok": bool(ok), "detail": detail}
        print(f"[{'pass' if ok else 'FAIL'}] {name}: {detail}", file=self.out)
        return bool(ok)

    def skip(self, name: str, detail: str) -> None:
        self.results[name] = {"ok": True, "skipped": True, "detail": detail}
        print(f"[skip] {name}: {detail}", file=self.out)

    @property
    def failed(self) -> int:
        return sum(1 for r in self.results.values() if not r["ok"])


def load_chunks(data_dir: Path) -> dict[str, dict]:
    inputs = B.V.load_inputs(data_dir)
    if inputs.failures:
        raise ValueError('; '.join(f.render() for f in inputs.failures))
    return inputs.chunks


def chunk_metadata_errors(graph, chunks):
    nodes=set(T.Index(graph).of_type(syj('Chunk')))
    fields={RDFS_LABEL:'id',syj('locator'):'locator',syj('fromSource'):'sourceId',syj('lang'):'lang',syj('permalink'):'permalink'}
    bad=[]
    for subject,predicate,value in graph:
        if subject not in nodes:continue
        if predicate==T.RDF_TYPE:
            if value!=syj('Chunk'):bad.append(subject+': unexpected type')
            continue
        cid=subject.removeprefix(SYJ)
        if cid not in chunks:continue  # The citation check reports missing records.
        row=chunks.raw(cid) if hasattr(chunks,'raw') else chunks[cid]
        field=fields.get(predicate)
        expected=row.get(field) if field else None
        actual=value.removeprefix(SYJ) if predicate==syj('fromSource') else T.literal_value(value)
        if field is None or actual!=expected:bad.append(subject+': unexpected metadata '+predicate)
    return bad


def uses_owl(graph):
    namespace='http://www.w3.org/2002/07/owl#'
    return any(term.startswith(namespace) or re.search(r'\^\^<http://www\.w3\.org/2002/07/owl#[^>]+>$',term)
               for triple in graph for term in triple)


def load_recorded_digests(data_dir: Path) -> dict[str, str]:
    recorded: dict[str, str] = {}
    for path in sorted((data_dir / "claims").glob("*/.digests.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        claims = data.get("claims") if isinstance(data, dict) and "claims" in data else data
        recorded.update(claims)
    return recorded


def object_key(idx: T.Index, claim: str) -> tuple:
    """validate.py 의 충돌 규칙(object JSON 의 정규형 비교)을 TTL 만으로 흉내낸다."""
    for pred in OBJECT_PREDS:
        objs = idx.objects(claim, syj(pred))
        if not objs:
            continue
        obj = objs[0]
        if pred == "objectLiteral":
            return ("literal", T.literal_value(obj), idx.value(claim, syj("position")))
        if pred == "objectLocation":
            return ("location", idx.value(obj, syj("lat")), idx.value(obj, syj("lon")), idx.value(obj, syj("precision")), idx.value(obj, syj("basis")))
        if pred == "objectYear":
            return ("year", T.literal_value(obj))
        return (pred, obj)  # entity · time: IRI 가 곧 정체다 (TimeSpan 재정의는 빌드가 막는다)
    return ("none",)


def expected_conflicts(idx, claims):
    groups={}
    for claim in claims:
        subject=idx.objects(claim,syj('subject'))[0]
        predicate=idx.objects(claim,syj('predicate'))[0]
        if 'syj:'+predicate.removeprefix(SYJ) in B.V.MULTI_VALUED_PREDICATES:continue
        groups.setdefault((subject,predicate),{}).setdefault(object_key(idx,claim),set()).add(claim)
    return {key:{claim for members in values.values() for claim in members} for key,values in groups.items() if len(values)>1}


def run(data_dir: Path, ttl_path: Path, out) -> tuple[int, dict]:
    c = Checker(out)
    tmp = Path(tempfile.mkdtemp(prefix="syj-check-build-"))
    stats: dict = {}
    try:
        # 1 build ×2
        logs = []
        outs = []
        for i in (1, 2):
            sink = io.StringIO()
            code, result = B.build(data_dir, tmp / f"build{i}.ttl", out=sink)
            logs.append(sink.getvalue())
            outs.append((code, result))
        ok = all(code == 0 for code, _ in outs)
        c.check("1 build exit 0 (twice)", ok, f"exit codes {[code for code, _ in outs]}")
        if not ok:
            print(logs[0], file=out)
            return 1, {"checks": c.results}
        result = outs[0][1]
        stats = dict(result.stats)
        stats["sha256"] = result.sha256
        for line in logs[0].splitlines():
            if line.startswith("  by class") or line.startswith("  citations") or line.startswith("  places.json") or line.startswith("  locations") or line.startswith("WARN"):
                print("      " + line.strip(), file=out)

        with io.open(tmp / "build1.ttl", encoding="utf-8", newline="") as fh:  # newline="" — CRLF 가 있으면 그대로 보인다
            ttl = fh.read()
        parsed = T.check_text(ttl)
        idx = T.Index(parsed.graph)
        chunks = load_chunks(data_dir)

        # 2 no-text
        leaks=chunk_metadata_errors(parsed.graph,chunks)
        n_checked=len(idx.of_type(syj('Chunk')))
        c.check("2 no chunk text in TTL", not leaks, f"{n_checked} Chunk nodes checked against original metadata; unexpected fields or values: {leaks[:5]}")

        # 3 cites
        claims = idx.of_type(syj("Claim"))
        chunk_nodes = set(idx.of_type(syj("Chunk")))
        bad: list[str] = []
        for cl in claims:
            cites = idx.objects(cl, syj("citesChunk"))
            if len(cites) != 1:
                bad.append(f"{cl}: {len(cites)} citesChunk")
                continue
            cid = cites[0][len(SYJ) :]
            if cid not in chunks:
                bad.append(f"{cl}: {cid} not in corpus or citation samples")
            if cites[0] not in chunk_nodes:
                bad.append(f"{cl}: {cid} has no syj:Chunk node")
            if idx.value(cl, syj("isSupportedBy")) != cid:
                bad.append(f"{cl}: isSupportedBy != citesChunk")
        c.check("3 every Claim cites one existing chunk (URI edge + literal)", not bad, f"{len(claims)} claims, {len(chunk_nodes)} chunk nodes; problems: {bad[:5]}")

        # 4 digest
        recorded = load_recorded_digests(data_dir)
        mismatched = [cid for cid, d in recorded.items() if idx.value(SYJ + cid, syj("claimDigest")) != d]
        unrecorded = [cl for cl in claims if cl[len(SYJ) :] not in recorded]
        c.check(
            "4 claimDigest == .digests.json",
            not mismatched and len(recorded) > 0,
            f"{len(recorded)} recorded, {len(mismatched)} mismatched, {len(unrecorded)} claims without a record (promoted from places.json): {[u[len(SYJ):] for u in unrecorded][:5]}",
        )

        # 5 determinism
        b1, b2 = (tmp / "build1.ttl").read_bytes(), (tmp / "build2.ttl").read_bytes()
        same = b1 == b2
        detail = f"two builds identical: {same}; sha256 {result.sha256}"
        if ttl_path.is_file():
            same_file = ttl_path.read_bytes() == b1
            detail += f"; matches {ttl_path.as_posix()}: {same_file}"
            same = same and same_file
        else:
            detail += f"; {ttl_path.as_posix()} missing"
            same = False
        c.check("5 deterministic (byte-identical)", same, detail)

        # 6 syntax
        prefixes_ok = set(parsed.prefixes) == {"syj", "rdf", "rdfs", "xsd"}
        blank = any(s.startswith("_:") or o.startswith("_:") for s, _, o in parsed.graph)
        owl = bool(uses_owl(parsed.graph))
        c.check(
            "6 turtle syntax (ttl_check.py)",
            parsed.ok and prefixes_ok and not blank and not owl and not ttl.startswith("﻿") and "\r" not in ttl,
            f"errors={parsed.errors} prefixes={sorted(parsed.prefixes)} triples={parsed.triples} blank_nodes={blank} owl={owl}",
        )
        c.check("6 triple count agrees with builder", parsed.triples == result.stats["triples"], f"parser {parsed.triples} vs builder {result.stats['triples']}")
        try:
            import rdflib  # 설치하지 않는다 — 있으면 독립 파서로 대조
        except ImportError:
            c.skip("6 rdflib parse", "rdflib not installed")
        else:
            g = rdflib.Graph()
            try:
                g.parse(data=ttl, format="turtle")
                c.check("6 rdflib parse", len(g) == parsed.triples, f"rdflib {rdflib.__version__}: {len(g)} triples (ours {parsed.triples})")
            except Exception as exc:  # noqa: BLE001 — 파서 오류를 그대로 보고
                c.check("6 rdflib parse", False, f"rdflib {rdflib.__version__} rejected the file: {exc}")
        riot = shutil.which("riot")
        if riot:
            proc = subprocess.run([riot, "--validate", str(tmp / "build1.ttl")], capture_output=True, text=True)
            c.check("6 riot --validate", proc.returncode == 0, (proc.stdout + proc.stderr).strip()[:300] or "ok")
        else:
            c.skip("6 riot --validate", "riot (Apache Jena) not in PATH")

        # 7 refs
        dangling = [(s, p, o) for s, p, o in parsed.graph if p in LINK_PREDS and not idx.types(o)]
        c.check("7 every link resolves to a typed node", not dangling, f"{sum(1 for _, p, _ in parsed.graph if p in LINK_PREDS)} link triples; dangling: {dangling[:3]}")

        # 8 conflicts
        expected = expected_conflicts(idx,claims)
        found: dict[tuple[str, str], set[str]] = {}
        for node in idx.of_type(syj("Conflict")):
            key = (idx.objects(node, syj("aboutSubject"))[0], idx.objects(node, syj("aboutPredicate"))[0])
            found[key] = set(idx.objects(node, syj("involvesClaim")))
        c.check("8 Conflict nodes == recomputed conflicts", expected == found, f"{len(found)} Conflict nodes, {len(expected)} recomputed groups; equal={expected == found}")

        # 9 provenance
        prov_bad: list[str] = []
        for cl in claims:
            if idx.value(cl, syj("origin")) not in ("human", "ai"):
                prov_bad.append(f"{cl}: origin")
            if idx.value(cl, syj("status")) not in ("draft", "stable", "deprecated"):
                prov_bad.append(f"{cl}: status")
            for pred in ("fromSource", "quote", "claimDigest", "subject", "predicate"):
                if len(idx.objects(cl, syj(pred))) != 1:
                    prov_bad.append(f"{cl}: {pred}")
            if sum(1 for pred in OBJECT_PREDS if idx.objects(cl, syj(pred))) != 1:
                prov_bad.append(f"{cl}: object")
        origins = {}
        for cl in claims:
            o = idx.value(cl, syj("origin"))
            origins[o] = origins.get(o, 0) + 1
        c.check("9 provenance on every Claim", not prov_bad, f"origins {origins}; problems: {prov_bad[:5]}")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

    stats["checks"] = c.results
    stats["checksFailed"] = c.failed
    return (1 if c.failed else 0), stats


def main(argv: list[str]) -> int:
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(errors="backslashreplace")
        except (AttributeError, ValueError):
            pass
    ap = argparse.ArgumentParser(description="F5 DoD checks against real data/ (docs/02-schema.md)")
    ap.add_argument("--data", default=str(B.DATA_DIR))
    ap.add_argument("--ttl", default=str(B.DEFAULT_OUT))
    ap.add_argument("--json", default=None, help="also write the stats JSON here")
    args = ap.parse_args(argv)
    code, stats = run(Path(args.data).resolve(), Path(args.ttl).resolve(), sys.stdout)
    text = json.dumps(stats, ensure_ascii=False, indent=2, sort_keys=True)
    if args.json:
        Path(args.json).write_text(text + "\n", encoding="utf-8")
    print(text)
    print("check-build " + ("OK" if code == 0 else f"FAILED ({stats.get('checksFailed')} checks)"))
    return code


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
