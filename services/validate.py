#!/usr/bin/env python3
"""claims 검증기 — 근거 · quote · digest · 엔티티 참조 · 충돌을 검사한다.

표준 배치: services/validate.py
실행:      python services/validate.py [--data DIR] [--write-digests]
           python services/validate.py --self-test

입력:
  data/sources/*/chunks.jsonl     원문 조각 (id · sourceId · text · locator · lang · permalink)
  data/claims/<src>/<chunk>.md    주장 파일 — 머리말 + ```claims-json 펜스 하나
  data/entities/<type>/<id>.md    엔티티 껍데기 — 파일 이름이 id 다

검사 (docs/02-schema.md §7.1 · §7.2 · §11):
  parse            공용 머리말 규칙을 따르고, claims-json 펜스가 하나이며 JSON 배열이다
  shape            필수 필드 · object.kind · origin · status 가 규약대로다. claim id 중복 금지
  no-evidence      citesChunk 가 비었다                                        -> 실패
  dead-chunk       citesChunk 가 어느 chunks.jsonl 에도 없다                   -> 실패
  quote-mismatch   quote 가 그 chunk 원문의 부분 문자열이 아니다 (공백 제거 후 비교) -> 실패
  missing-entity   object.kind=entity 인데 그 id 의 엔티티 파일이 없다          -> 실패
  digest-mismatch  기록된 digest 와 다르다 — 근거를 달아둔 뒤 주장을 바꾼 것 (§7.2) -> 실패
  conflict         같은 (subject, predicate) 에 다른 object 가 둘 이상 (§11)   -> 정보. 실패 아님

digest:
  sha256(id | subject | predicate | json.dumps(object, sort_keys=True, ensure_ascii=False) | citesChunk)
  claims 파일에는 쓰지 않는다. 검증기가 계산해 data/claims/<src>/.digests.json 에 기록·대조한다.
  - 읽을 때는 두 배치를 받는다: {"claims": {id: sha}} 와 평평한 {id: sha} (scripts/check_claims.py 형태)
  - 파일이 없으면: 전부 new 로 보고한다. --write-digests 로만 만든다
  - 파일에 없는 id: new (정보). --write-digests 로만 기록된다 — 사람이 검토한 뒤 명시적으로
  - 파일과 다른 id: 실패. --write-digests 가 있으면 갱신(refreshed)
  - 파일에만 있는 id: stale (정보). --write-digests 가 지운다

원칙:
  - 표준 라이브러리만
  - 실패가 하나라도 있으면 어떤 파일도 쓰지 않는다
  - .digests.json 은 sort_keys 로 써서 두 번 실행하면 바이트가 같다
  - 원문은 chunks.jsonl 에만 산다. 여기서는 읽기만 한다
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import re
import shutil
import sys
import tempfile
from dataclasses import dataclass, field
from pathlib import Path

from frontmatter import ParseError, parse_front_matter

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
FIXTURES_DIR = ROOT / "tests" / "fixtures"
DIGESTS_FILENAME = ".digests.json"
DIGEST_ALGORITHM = (
    "sha256(id|subject|predicate|json.dumps(object,sort_keys=True,ensure_ascii=False)|citesChunk)"
)

OBJECT_KINDS = ("entity", "literal", "year", "time", "location")
ORIGINS = ("human", "ai")
STATUSES = ("draft", "stable", "deprecated")
MULTI_VALUED_PREDICATES = frozenset({
    "syj:mentionedIn", "syj:describedAs", "syj:instructs",
    "syj:hasTitle", "syj:hasOutcome", "syj:subjectToRule",
})
REQUIRED_TEXT_FIELDS = (
    "id",
    "subject",
    "predicate",
    "citesChunk",
    "quote",
    "fromSource",
    "origin",
    "status",
)

FENCE_OPEN_RE = re.compile(r"^```claims-json[ \t]*$", re.MULTILINE)
FENCE_RE = re.compile(r"^```claims-json[ \t]*\n(.*?)^```[ \t]*$", re.MULTILINE | re.DOTALL)
WS_RE = re.compile(r"\s+")
STEMS = "甲乙丙丁戊己庚辛壬癸"
BRANCHES = "子丑寅卯辰巳午未申酉戌亥"
GANZHI_RE = re.compile(f"[{STEMS}][{BRANCHES}]")


@dataclass
class Failure:
    code: str
    where: str
    claim_id: str | None
    message: str

    def render(self) -> str:
        head = f"FAIL [{self.code}] {self.where}"
        if self.claim_id:
            head += f" :: {self.claim_id}"
        return f"{head} -- {self.message}"


@dataclass
class ClaimsDoc:
    path: Path
    label: str
    source_key: str  # data/claims/<source_key>/ — digests 파일을 고르는 키
    meta: dict
    claims: list
    expected_chunk: str | None = None  # 파일 이름에서 온 chunk id (경고용)
    expected_source: str | None = None  # 디렉터리에서 온 source id (경고용)


@dataclass
class SourceDigests:
    recorded: dict[str, str] | None  # None = .digests.json 이 없다
    computed: dict[str, str] = field(default_factory=dict)
    status: dict[str, str] = field(default_factory=dict)  # id -> ok|new|changed|refreshed
    stale: list[str] = field(default_factory=list)


@dataclass
class Report:
    n_claims: int = 0
    failures: list[Failure] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    conflicts: list[dict] = field(default_factory=list)
    digests: dict[str, SourceDigests] = field(default_factory=dict)


@dataclass
class Inputs:
    chunks: dict[str, dict] = field(default_factory=dict)
    entities: dict[str, str] = field(default_factory=dict)
    docs: list[ClaimsDoc] = field(default_factory=list)
    digests: dict[str, dict[str, str] | None] = field(default_factory=dict)
    failures: list[Failure] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    n_claim_files: int = 0

    @property
    def sources(self) -> list[str]:
        return sorted({c["sourceId"] for c in self.chunks.values() if isinstance(c["sourceId"], str)})


# ----------------------------------------------------------------------------
# 작은 도구
# ----------------------------------------------------------------------------


def norm_ws(text: str) -> str:
    """공백(유니코드 포함)을 전부 지운다 — quote 비교 기준 (§7.1)."""
    return WS_RE.sub("", text)


def rel(path: Path) -> str:
    try:
        return path.resolve().relative_to(ROOT).as_posix()
    except ValueError:
        return path.as_posix()


def read_text(path: Path) -> str:
    with io.open(path, encoding="utf-8") as fh:  # newline=None: CRLF 도 LF 로 읽는다
        return fh.read()


def claim_digest(claim: dict) -> str:
    payload = "|".join(
        [
            claim["id"],
            claim["subject"],
            claim["predicate"],
            json.dumps(claim["object"], sort_keys=True, ensure_ascii=False),
            claim["citesChunk"],
        ]
    )
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def render_digests(computed: dict[str, str]) -> str:
    payload = {
        "algorithm": DIGEST_ALGORITHM,
        "claims": dict(sorted(computed.items())),
        "version": 1,
    }
    return json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True) + "\n"


def load_digests(path: Path) -> dict[str, str] | None:
    """두 배치를 읽는다: {"claims": {id: sha}} (이 파일이 쓰는 형태) 와
    평평한 {id: sha} (scripts/check_claims.py 가 F3 에서 쓴 형태). 같은 digest 알고리즘이다."""
    if not path.is_file():
        return None
    try:
        data = json.loads(read_text(path))
    except json.JSONDecodeError as exc:
        raise ParseError(f"not valid JSON: {exc.msg} (line {exc.lineno})") from None
    if isinstance(data, dict) and "claims" not in data and all(isinstance(v, str) for v in data.values()):
        claims: dict | None = data  # 평평한 배치
    else:
        claims = data.get("claims") if isinstance(data, dict) else None
    if not isinstance(claims, dict):
        raise ParseError("expected an object with a 'claims' map of id -> sha256")
    for cid, digest in claims.items():
        if not isinstance(digest, str) or not re.fullmatch(r"[0-9a-f]{64}", digest):
            raise ParseError(f"claims[{cid!r}] is not a lowercase sha256 hex digest")
    return dict(claims)


# ----------------------------------------------------------------------------
# 파싱 — 머리말 · claims-json 펜스
# ----------------------------------------------------------------------------


def parse_claims_text(text: str) -> tuple[dict, list]:
    meta, body = parse_front_matter(text)
    if meta.get("type") != "Claims":
        raise ParseError(f"front matter 'type' must be 'Claims' (got {meta.get('type')!r})")
    opens = len(FENCE_OPEN_RE.findall(body))
    if opens != 1:
        raise ParseError(f"exactly one ```claims-json fence is required (found {opens})")
    fences = FENCE_RE.findall(body)
    if len(fences) != 1:
        raise ParseError("```claims-json fence is not closed")
    try:
        data = json.loads(fences[0])
    except json.JSONDecodeError as exc:
        raise ParseError(
            f"claims-json is not valid JSON: {exc.msg} (fence line {exc.lineno}, col {exc.colno})"
        ) from None
    if not isinstance(data, list):
        raise ParseError("claims-json must be a JSON array")
    return meta, data


def load_claims_doc(
    path: Path,
    *,
    source_key: str,
    label: str,
    expected_chunk: str | None = None,
    expected_source: str | None = None,
) -> ClaimsDoc:
    try:
        text = read_text(path)
    except UnicodeDecodeError as exc:
        raise ParseError(f"file is not UTF-8: {exc.reason} at byte {exc.start}") from None
    meta, claims = parse_claims_text(text)
    return ClaimsDoc(
        path=path,
        label=label,
        source_key=source_key,
        meta=meta,
        claims=claims,
        expected_chunk=expected_chunk,
        expected_source=expected_source,
    )


# ----------------------------------------------------------------------------
# 적재 — chunks · entities · claims
# ----------------------------------------------------------------------------


def load_chunks_file(path: Path, chunks: dict[str, dict], failures: list[Failure]) -> None:
    where = rel(path)
    with io.open(path, encoding="utf-8") as fh:
        for lineno, raw in enumerate(fh, 1):
            line = raw.strip()
            if not line:
                continue
            try:
                row = json.loads(line)
            except json.JSONDecodeError as exc:
                failures.append(Failure("chunks", where, None, f"line {lineno}: invalid JSON ({exc.msg})"))
                continue
            cid = row.get("id") if isinstance(row, dict) else None
            text = row.get("text") if isinstance(row, dict) else None
            if not isinstance(cid, str) or not cid or not isinstance(text, str):
                failures.append(Failure("chunks", where, None, f"line {lineno}: 'id' and 'text' are required"))
                continue
            if cid in chunks:
                failures.append(
                    Failure("chunks", where, None, f"line {lineno}: duplicate chunk id {cid} (also in {chunks[cid]['file']})")
                )
                continue
            chunks[cid] = {
                "sourceId": row.get("sourceId"),
                "text": text,
                "norm": norm_ws(text),
                "file": where,
                # 빌더(build_ttl.py)가 Chunk 노드에 쓰는 메타데이터 — 원문이 아닌 것만 (translation 은 두지 않는다)
                "locator": row.get("locator"),
                "lang": row.get("lang"),
                "permalink": row.get("permalink"),
                "editorNotes": row.get("editorNotes", []),
            }


def load_entities(entities_dir: Path, warnings: list[str]) -> dict[str, str]:
    """data/entities/<type>/<id>.md — 파일 이름이 id 다. 머리말 id 가 다르면 경고만."""
    entities: dict[str, str] = {}
    if not entities_dir.is_dir():
        return entities
    for path in sorted(entities_dir.glob("**/*.md")):
        where = rel(path)
        eid = path.stem
        try:
            meta, _ = parse_front_matter(read_text(path))
            declared = meta.get("id", "")
            if declared and declared != eid:
                warnings.append(f"{where}: front matter id {declared!r} != filename {eid!r}; using filename")
        except (ParseError, UnicodeDecodeError) as exc:
            warnings.append(f"{where}: entity front matter unreadable ({exc}); using filename as id")
        if eid in entities:
            warnings.append(f"{where}: duplicate entity id {eid} (also {entities[eid]})")
            continue
        entities[eid] = where
    return entities


def load_inputs(data_dir: Path) -> Inputs:
    inputs = Inputs()

    sources_dir = data_dir / "sources"
    if sources_dir.is_dir():
        for path in sorted(sources_dir.glob("*/chunks.jsonl")):
            load_chunks_file(path, inputs.chunks, inputs.failures)

    inputs.entities = load_entities(data_dir / "entities", inputs.warnings)

    claims_dir = data_dir / "claims"
    if not claims_dir.is_dir():
        return inputs
    for path in sorted(claims_dir.glob("**/*.md")):
        inputs.n_claim_files += 1
        parts = path.relative_to(claims_dir).parts
        if len(parts) < 2:
            inputs.failures.append(
                Failure("layout", rel(path), None, "claims files must live under data/claims/<sourceId>/")
            )
            continue
        key = parts[0]
        if key not in inputs.digests:
            digests_path = claims_dir / key / DIGESTS_FILENAME
            try:
                inputs.digests[key] = load_digests(digests_path)
            except (ParseError, UnicodeDecodeError) as exc:
                inputs.failures.append(Failure("digests", rel(digests_path), None, f"unreadable: {exc}"))
                inputs.digests[key] = {}
        try:
            inputs.docs.append(
                load_claims_doc(
                    path,
                    source_key=key,
                    label=rel(path),
                    expected_chunk=path.stem,
                    expected_source=f"src-{key}",
                )
            )
        except ParseError as exc:
            inputs.failures.append(Failure("parse", rel(path), None, str(exc)))
    return inputs


# ----------------------------------------------------------------------------
# 검사
# ----------------------------------------------------------------------------


def check_shape(claim, index: int, where: str, failures: list[Failure]) -> bool:
    """필수 필드와 값의 모양. False 면 뒤의 검사를 건너뛴다."""
    if not isinstance(claim, dict):
        failures.append(Failure("shape", where, None, f"claims[{index}] is not a JSON object"))
        return False
    cid = claim.get("id")
    tag = cid if isinstance(cid, str) and cid.strip() else f"claims[{index}]"
    ok = True

    def bad(message: str) -> None:
        nonlocal ok
        ok = False
        failures.append(Failure("shape", where, tag, message))

    for key in REQUIRED_TEXT_FIELDS:
        value = claim.get(key)
        if not isinstance(value, str):
            bad(f"{key}: string is required")
        elif key != "citesChunk" and not value.strip():  # 빈 citesChunk 는 no-evidence 로 따로 잡는다
            bad(f"{key}: must not be empty")

    obj = claim.get("object")
    if not isinstance(obj, dict) or obj.get("kind") not in OBJECT_KINDS:
        bad("object.kind must be one of " + "|".join(OBJECT_KINDS))
    else:
        if obj["kind"] == "entity" and not (isinstance(obj.get("id"), str) and obj["id"].strip()):
            bad("object.kind=entity needs a non-empty 'id'")
        if obj["kind"] == "year" and (
            isinstance(obj.get("value"), bool) or not isinstance(obj.get("value"), int)
        ):
            bad("object.kind=year needs an integer 'value'")
        if obj["kind"] == "literal" and not (isinstance(obj.get("value"), str) and obj["value"].strip()):
            bad("object.kind=literal needs a non-empty 'value'")
        if obj["kind"] == "time":
            for key in ("id", "verbatim", "precision"):
                if not (isinstance(obj.get(key), str) and obj[key].strip()):
                    bad(f"object.kind=time needs a non-empty '{key}'")
        if obj["kind"] == "location":
            for key in ("lat", "lon"):
                if isinstance(obj.get(key), bool) or not isinstance(obj.get(key), (int, float)):
                    bad(f"object.kind=location needs a numeric '{key}'")

    origin = claim.get("origin")
    if isinstance(origin, str) and origin not in ORIGINS:
        bad("origin must be one of " + "|".join(ORIGINS))
    status = claim.get("status")
    if isinstance(status, str) and status not in STATUSES:
        bad("status must be one of " + "|".join(STATUSES))
    return ok


def validate(
    chunks: dict[str, dict],
    entities: dict[str, str],
    docs: list[ClaimsDoc],
    digests_by_source: dict[str, dict[str, str] | None],
    *,
    refresh_digests: bool = False,
) -> Report:
    report = Report()
    failures = report.failures
    warnings = report.warnings
    seen_ids: dict[str, str] = {}
    by_key: dict[tuple[str, str], dict[str, list[str]]] = {}
    timespans = {}
    for doc in docs:
        for claim in doc.claims:
            obj = claim.get("object") if isinstance(claim, dict) else None
            if isinstance(obj, dict) and obj.get("kind") == "time" and isinstance(obj.get("id"), str):
                timespans[obj["id"]] = obj

    for doc in sorted(docs, key=lambda d: (d.source_key, d.path.as_posix())):
        where = doc.label
        if doc.expected_chunk and doc.meta.get("chunk") != doc.expected_chunk:
            warnings.append(f"{where}: front matter chunk {doc.meta.get('chunk')!r} != filename {doc.expected_chunk!r}")
        if doc.expected_source and doc.meta.get("source") != doc.expected_source:
            warnings.append(f"{where}: front matter source {doc.meta.get('source')!r} != directory {doc.expected_source!r}")

        sd = report.digests.setdefault(
            doc.source_key, SourceDigests(recorded=digests_by_source.get(doc.source_key))
        )
        report.n_claims += len(doc.claims)

        for index, claim in enumerate(doc.claims):
            if not check_shape(claim, index, where, failures):
                continue
            cid = claim["id"]
            if cid in seen_ids:
                failures.append(Failure("shape", where, cid, f"duplicate claim id (also in {seen_ids[cid]})"))
                continue
            seen_ids[cid] = where

            # (b) 근거가 있고, 살아 있는 chunk 인가
            chunk_id = claim["citesChunk"]
            chunk = None
            if not chunk_id.strip():
                failures.append(Failure("no-evidence", where, cid, "citesChunk is empty"))
            else:
                chunk = chunks.get(chunk_id)
                if chunk is None:
                    failures.append(
                        Failure("dead-chunk", where, cid, f"citesChunk {chunk_id!r} does not exist in any chunks.jsonl")
                    )
                if doc.meta.get("chunk") and chunk_id != doc.meta["chunk"]:
                    warnings.append(f"{where} :: {cid}: cites {chunk_id} but the file is for {doc.meta['chunk']}")

            # (c) quote 가 원문의 부분 문자열인가 (공백 제거 후)
            if chunk is not None:
                if norm_ws(claim["quote"]) not in chunk["norm"]:
                    failures.append(
                        Failure("quote-mismatch", where, cid, f"quote is not a substring of {chunk_id} text: {claim['quote']!r}")
                    )
                if chunk["sourceId"] != claim["fromSource"]:
                    warnings.append(
                        f"{where} :: {cid}: fromSource {claim['fromSource']!r} != chunk sourceId {chunk['sourceId']!r}"
                    )

            # (d) entity 객체는 껍데기 파일이 있어야 한다
            obj = claim["object"]
            check_reading_and_calendar(claim, chunk, timespans, where, failures)
            if claim["subject"] != chunk_id and claim["subject"] not in entities and claim["subject"] not in chunks and claim["subject"] not in timespans:
                failures.append(Failure("missing-entity", where, cid, "subject is not an entity, chunk or defined TimeSpan"))
            if obj["kind"] == "time" and chunk is not None:
                verbatim = norm_ws(obj["verbatim"])
                if verbatim not in chunk["norm"] or verbatim not in norm_ws(claim["quote"]):
                    failures.append(Failure("time", where, cid, "time.verbatim must occur in the cited text and quote"))
            if obj["kind"] == "entity" and obj["id"] not in entities:
                failures.append(
                    Failure("missing-entity", where, cid, f"object entity {obj['id']!r} has no file under entities/")
                )

            # (e) digest — 근거를 달아둔 뒤 주장이 바뀌지 않았는가
            digest = claim_digest(claim)
            sd.computed[cid] = digest
            if sd.recorded is None or cid not in sd.recorded:
                sd.status[cid] = "new"
            elif sd.recorded[cid] == digest:
                sd.status[cid] = "ok"
            elif refresh_digests:
                sd.status[cid] = "refreshed"
            else:
                sd.status[cid] = "changed"
                failures.append(
                    Failure(
                        "digest-mismatch",
                        where,
                        cid,
                        "claim content changed after its evidence was recorded "
                        f"(recorded {sd.recorded[cid][:12]}.., now {digest[:12]}..) - review, then --write-digests",
                    )
                )

            # (f) 충돌 후보 — 같은 (subject, predicate)
            if claim["predicate"] not in MULTI_VALUED_PREDICATES:
                canon = json.dumps(obj, sort_keys=True, ensure_ascii=False)
                by_key.setdefault((claim["subject"], claim["predicate"]), {}).setdefault(canon, []).append(cid)

    for sd in report.digests.values():
        if sd.recorded:
            sd.stale = sorted(cid for cid in sd.recorded if cid not in sd.computed)

    for (subject, predicate), objects in sorted(by_key.items()):
        if len(objects) > 1:
            report.conflicts.append(
                {
                    "subject": subject,
                    "predicate": predicate,
                    "objects": [{"object": canon, "claims": ids} for canon, ids in sorted(objects.items())],
                }
            )
    return report


# ----------------------------------------------------------------------------
# 보고 · 기록
# ----------------------------------------------------------------------------


def check_reading_and_calendar(claim: dict, chunk: dict | None, timespans: dict,
                               where: str, failures: list[Failure]) -> None:
    """F3 보조 검증기의 판독·간지 검사를 빌드와 일반 검증에도 적용한다."""
    obj = claim["object"]

    def bad(code, message):
        failures.append(Failure(code, where, claim["id"], message))

    if claim["predicate"] == "syj:readsCharacterAs":
        if obj["kind"] != "literal" or not all(isinstance(obj.get(k), str) and obj[k].strip() for k in ("position", "value")):
            bad("reading", "readsCharacterAs needs literal position and value")
        elif chunk is not None:
            position, value = norm_ws(obj["position"]), norm_ws(obj["value"])
            if claim["subject"] != claim["citesChunk"]:
                bad("reading", "readsCharacterAs subject must be the cited chunk")
            if position not in chunk["norm"]:
                bad("reading", "position not found in chunk text")
            notes = [norm_ws(n) for n in chunk.get("editorNotes", []) if isinstance(n, str)]
            if value not in position and not any(value in n for n in notes):
                bad("reading", "reading is neither at the text position nor in editorNotes")
    if claim["predicate"] == "syj:convertsTo":
        span = timespans.get(claim["subject"])
        if obj["kind"] != "year" or span is None:
            bad("calendar", "convertsTo needs a year object and a defined TimeSpan subject")
        else:
            match = GANZHI_RE.search(str(span.get("verbatim", "")))
            cycle = (obj["value"] - 4) % 60
            expected = STEMS[cycle % 10] + BRANCHES[cycle % 12]
            if match and match.group() != expected:
                bad("calendar", f"year {obj['value']} is {expected}, but verbatim says {match.group()}")


def digest_totals(report: Report) -> dict[str, int]:
    totals = {"ok": 0, "new": 0, "changed": 0, "refreshed": 0, "stale": 0}
    for sd in report.digests.values():
        for status in sd.status.values():
            totals[status] += 1
        totals["stale"] += len(sd.stale)
    return totals


def print_report(report: Report, inputs: Inputs, refresh: bool, out) -> None:
    def say(line: str = "") -> None:
        print(line, file=out)

    totals = digest_totals(report)
    say("sigong-yeojido validate")
    say(f"  sources     : {len(inputs.sources)}  {', '.join(inputs.sources) or '-'}")
    say(f"  chunks      : {len(inputs.chunks)}")
    say(f"  claim files : {inputs.n_claim_files}")
    say(f"  claims      : {report.n_claims}")
    say(f"  entities    : {len(inputs.entities)}")
    say(f"  conflicts   : {len(report.conflicts)}  (informational)")
    say(
        "  digests     : "
        + " ".join(f"{k}={v}" for k, v in totals.items())
    )
    say(f"  warnings    : {len(report.warnings)}")
    say(f"  failures    : {len(report.failures)}")

    for conflict in report.conflicts:
        say(f"CONFLICT ({conflict['subject']}, {conflict['predicate']})")
        for item in conflict["objects"]:
            say(f"    {', '.join(item['claims'])} -> {item['object']}")
    for warning in report.warnings:
        say(f"WARN {warning}")
    for key, sd in sorted(report.digests.items()):
        new = sorted(cid for cid, st in sd.status.items() if st == "new")
        if new and sd.recorded is not None:
            say(f"DIGEST NEW {key}: {len(new)} claims not yet recorded - review, then run --write-digests")
        for cid, st in sorted(sd.status.items()):
            if st in ("changed", "refreshed"):
                say(f"DIGEST {st.upper()} {key}/{cid}")
        for cid in sd.stale:
            suffix = " (pruned by --write-digests)" if refresh else " (in .digests.json but no such claim)"
            say(f"DIGEST STALE {key}/{cid}{suffix}")
    for failure in report.failures:
        say(failure.render())


def write_digest_files(claims_dir: Path, report: Report, refresh: bool) -> list[tuple[Path, str]]:
    """실패가 없고 --write-digests 를 명시했을 때만 기록한다."""
    actions: list[tuple[Path, str]] = []
    if not refresh:
        return actions
    for key in sorted(report.digests):
        sd = report.digests[key]
        path = claims_dir / key / DIGESTS_FILENAME
        content = render_digests(sd.computed)
        if sd.recorded is None:
            if not sd.computed:
                continue
            action = "created"
        elif refresh:
            if path.is_file() and path.read_bytes() == content.encode("utf-8"):
                continue
            action = "updated"
        else:
            continue
        path.parent.mkdir(parents=True, exist_ok=True)
        with io.open(path, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(content)
        actions.append((path, action))
    return actions


def run(data_dir: Path, *, write_digests: bool, out=None) -> tuple[int, Report]:
    out = out or sys.stdout
    inputs = load_inputs(data_dir)
    report = validate(inputs.chunks, inputs.entities, inputs.docs, inputs.digests, refresh_digests=write_digests)
    report.failures = inputs.failures + report.failures
    report.warnings = inputs.warnings + report.warnings
    print_report(report, inputs, write_digests, out)
    if report.failures:
        print(f"FAILED ({len(report.failures)} failures) - nothing written", file=out)
        return 1, report
    for path, action in write_digest_files(data_dir / "claims", report, write_digests):
        print(f"DIGESTS {action} {rel(path)}", file=out)
    print("OK", file=out)
    return 0, report


# ----------------------------------------------------------------------------
# --self-test — tests/fixtures/
# ----------------------------------------------------------------------------

# fixture 이름 -> 기대. codes 는 실패 코드의 정확한 집합이어야 한다 (더 있어도, 덜 있어도 실패).
SELF_TEST_CASES: dict[str, dict] = {
    "valid-basic": {"codes": set(), "conflicts": 0},
    "valid-conflict": {"codes": set(), "conflicts": 1},
    "invalid-parse": {"codes": {"parse"}},
    "invalid-no-evidence": {"codes": {"no-evidence"}},
    "invalid-dead-chunk": {"codes": {"dead-chunk"}},
    "invalid-quote": {"codes": {"quote-mismatch"}},
    "invalid-missing-entity": {"codes": {"missing-entity"}},
    "invalid-digest-tamper": {"codes": {"digest-mismatch"}},
}


def self_test_fixtures(out) -> list[str]:
    problems: list[str] = []
    chunk_failures: list[Failure] = []
    chunks: dict[str, dict] = {}
    chunks_path = FIXTURES_DIR / "chunks.jsonl"
    if chunks_path.is_file():
        load_chunks_file(chunks_path, chunks, chunk_failures)
    else:
        problems.append(f"fixture chunks missing: {rel(chunks_path)}")
    for failure in chunk_failures:
        problems.append(f"fixture chunks broken: {failure.render()}")
    entities = load_entities(FIXTURES_DIR / "entities", [])
    print(f"fixtures: chunks={len(chunks)} entities={len(entities)}", file=out)

    fixture_files = sorted(FIXTURES_DIR.glob("*.md")) if FIXTURES_DIR.is_dir() else []
    names = {p.stem for p in fixture_files}
    for missing in sorted(set(SELF_TEST_CASES) - names):
        problems.append(f"fixture missing: {missing}.md")
    for extra in sorted(names - set(SELF_TEST_CASES)):
        problems.append(f"fixture without an expectation in SELF_TEST_CASES: {extra}.md")

    for path in fixture_files:
        name = path.stem
        expect = SELF_TEST_CASES.get(name)
        if expect is None:
            continue
        sidecar = FIXTURES_DIR / f"{name}.digests.json"
        try:
            recorded = load_digests(sidecar)
        except ParseError as exc:
            problems.append(f"{name}: sidecar digests unreadable: {exc}")
            recorded = None
        first_message = ""
        n_claims = 0
        n_conflicts = 0
        n_warnings = 0
        try:
            doc = load_claims_doc(path, source_key=name, label=rel(path))
            report = validate(chunks, entities, [doc], {name: recorded})
            codes = sorted({f.code for f in report.failures})
            n_claims = report.n_claims
            n_conflicts = len(report.conflicts)
            n_warnings = len(report.warnings)
            if report.failures:
                first_message = report.failures[0].message
        except ParseError as exc:
            codes = ["parse"]
            first_message = str(exc)

        want = sorted(expect["codes"])
        ok = codes == want
        if "conflicts" in expect and n_conflicts != expect["conflicts"]:
            ok = False
        if not want and n_warnings:
            ok = False
        if codes:
            detail = f"failed as expected [{', '.join(codes)}] -- {first_message}"
            if not ok:
                detail = f"failed with [{', '.join(codes)}], expected [{', '.join(want)}] -- {first_message}"
        else:
            detail = f"passed (claims={n_claims}, conflicts={n_conflicts}, warnings={n_warnings})"
            if not ok:
                detail += f", expected codes [{', '.join(want)}] conflicts={expect.get('conflicts', '*')} warnings=0"
        print(f"[{'pass' if ok else 'FAIL'}] {name:<24}: {detail}", file=out)
        if not ok:
            problems.append(f"{name}: {detail}")
    return problems


def self_test_end_to_end(out) -> list[str]:
    """실제 파일 배치로 normal 모드를 돌려 본다: 생성 -> 결정론 -> 변조 실패 -> --write-digests -> 안정."""
    problems: list[str] = []

    def check(condition: bool, label: str) -> None:
        print(f"[{'pass' if condition else 'FAIL'}] e2e {label}", file=out)
        if not condition:
            problems.append(f"e2e {label}")

    tmp = Path(tempfile.mkdtemp(prefix="syj-validate-selftest-"))
    try:
        source_dir = tmp / "sources" / "gwanggaeto"
        source_dir.mkdir(parents=True)
        shutil.copyfile(FIXTURES_DIR / "chunks.jsonl", source_dir / "chunks.jsonl")
        shutil.copytree(FIXTURES_DIR / "entities", tmp / "entities")
        claims_dir = tmp / "claims" / "gwanggaeto"
        claims_dir.mkdir(parents=True)
        claim_file = claims_dir / "chunk_gwanggaeto_1-09.md"
        claim_file.write_bytes((FIXTURES_DIR / "valid-basic.md").read_bytes())
        digests_path = claims_dir / DIGESTS_FILENAME
        sink = io.StringIO()

        code, r1 = run(tmp, write_digests=False, out=sink)
        sd = r1.digests.get("gwanggaeto")
        check(code == 0 and sd is not None, "run1 valid claims exit 0")
        check(not digests_path.exists(), "run1 does not create .digests.json without approval flag")
        check(sd is not None and set(sd.status.values()) == {"new"} and len(sd.status) == 4, "run1 reports every claim as new")
        check(not r1.warnings, "run1 emits no warnings for a well-placed file")
        code, _ = run(tmp, write_digests=True, out=sink)
        check(code == 0 and digests_path.is_file(), "explicit --write-digests records reviewed claims")
        bytes1 = digests_path.read_bytes() if digests_path.is_file() else b""

        code, r2 = run(tmp, write_digests=False, out=sink)
        sd = r2.digests.get("gwanggaeto")
        check(code == 0 and sd is not None and set(sd.status.values()) == {"ok"}, "run2 every digest ok")
        check(digests_path.read_bytes() == bytes1, "run2 .digests.json byte-identical (deterministic)")

        text = read_text(claim_file)
        check('"value": 396' in text, "tamper target present in valid-basic")
        with io.open(claim_file, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(text.replace('"value": 396', '"value": 456'))
        code, r3 = run(tmp, write_digests=False, out=sink)
        check(
            code == 1 and [f.code for f in r3.failures] == ["digest-mismatch"],
            "run3 tampered object fails with digest-mismatch only",
        )
        check(digests_path.read_bytes() == bytes1, "run3 failing run writes nothing")

        code, r4 = run(tmp, write_digests=True, out=sink)
        sd = r4.digests.get("gwanggaeto")
        check(
            code == 0 and sd is not None and sd.status.get("claim-gwanggaeto-1-09-yeongnak-6-year") == "refreshed",
            "run4 --write-digests refreshes the changed claim",
        )
        bytes4 = digests_path.read_bytes()
        check(bytes4 != bytes1, "run4 .digests.json updated")

        code, r5 = run(tmp, write_digests=False, out=sink)
        sd = r5.digests.get("gwanggaeto")
        check(code == 0 and sd is not None and set(sd.status.values()) == {"ok"}, "run5 stable after refresh")
        check(digests_path.read_bytes() == bytes4, "run5 .digests.json unchanged")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    return problems


def self_test(out) -> int:
    problems = self_test_fixtures(out)
    problems += self_test_end_to_end(out)
    if problems:
        print(f"self-test FAILED ({len(problems)} problems)", file=out)
        for problem in problems:
            print(f"  - {problem}", file=out)
        return 1
    print(f"self-test OK ({len(SELF_TEST_CASES)} fixtures + end-to-end)", file=out)
    return 0


# ----------------------------------------------------------------------------


def main(argv: list[str]) -> int:
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(errors="backslashreplace")  # cp949 콘솔에서도 죽지 않는다
        except (AttributeError, ValueError):
            pass
    ap = argparse.ArgumentParser(description="claims validator (docs/02-schema.md 7.1 / 7.2 / 11)")
    ap.add_argument("--data", default=str(DATA_DIR), help="data root (default: data/)")
    mode = ap.add_mutually_exclusive_group()
    mode.add_argument(
        "--write-digests", action="store_true", help="record/refresh .digests.json - only after human review"
    )
    mode.add_argument("--self-test", action="store_true", help="run tests/fixtures/ and exit 1 on any mismatch")
    args = ap.parse_args(argv)
    if args.self_test:
        return self_test(sys.stdout)
    data_dir = Path(args.data).resolve()
    if not data_dir.is_dir():
        print(f"data root does not exist: {data_dir}", file=sys.stderr)  # 오타로 조용히 통과하지 않게
        return 2
    code, _ = run(data_dir, write_digests=args.write_digests)
    return code


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
