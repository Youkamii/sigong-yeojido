#!/usr/bin/env python3
"""claims 마크다운 검증기 (F3).

실행:  python scripts/check_claims.py [--update-digests]
       (Windows 콘솔은 PYTHONIOENCODING=utf-8 을 주고 실행한다)

무엇을 검사하나 (docs/02-schema.md §7.1 · §7.2 · §11):
  형식    머리말은 `key: value` 스칼라만 / ```claims-json 펜스 정확히 하나 / JSON 배열
  근거    citesChunk 가 chunks.jsonl 에 있고, 파일 머리말의 chunk 와 같다
  quote   quote 가 그 chunk 의 text 부분 문자열이다 (공백 제거 후 비교)
  참조    subject · object 가 가리키는 엔티티 껍데기가 data/entities/ 에 있다
          (subject 는 chunk id, 또는 claims 안의 time 객체로 정의된 TimeSpan id 여도 된다)
  판독    readsCharacterAs — position 이 원문에 있고, value 가 원문 그 자리나 editorNotes 에 있다
  역법    convertsTo — TimeSpan verbatim 의 첫 간지가 object.year 와 60갑자 산술로 맞는다
  digest  sha256(id|subject|predicate|object|citesChunk) 를 .digests.json 에 기록하고 대조한다.
          기록된 claim 의 내용이 바뀌었거나 사라졌으면 실패 — 근거를 달아둔 뒤 주장을
          고치는 것을 막는 장치다. 의도한 변경이면 --update-digests 로 기록을 갱신한다.

하나라도 실패하면 exit 1. 표준 라이브러리만 쓴다.
F4(빌드)는 이 파일의 parse_claims_file() / load_corpus() 를 그대로 가져다 쓰면 된다.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CLAIMS_DIR = ROOT / "data" / "claims"
ENTITIES_DIR = ROOT / "data" / "entities"
SOURCES_DIR = ROOT / "data" / "sources"
PLACES_JSON = ROOT / "data" / "places.json"
DIGEST_FILE = ".digests.json"

# 엔티티 타입 → 디렉터리 (docs/02-schema.md §4 · §12)
ENTITY_TYPES = {
    "Person": "person",
    "Place": "place",
    "Polity": "polity",
    "Event": "event",
    "Office": "office",
}
ENTITY_KEYS = {"type", "id", "label", "labelHanja"}

FM_REQUIRED = {"type", "chunk", "source", "generated_by", "generated_at", "status"}
CLAIM_REQUIRED = {
    "id", "subject", "predicate", "object", "citesChunk",
    "quote", "fromSource", "origin", "status",
}
CLAIM_OPTIONAL = {"note"}
# object.kind → (필수 키, 선택 키). kind 는 항상 있어야 한다
OBJECT_KEYS = {
    "entity": ({"id"}, set()),
    "literal": ({"value"}, {"position"}),
    "year": ({"value"}, set()),
    "time": ({"id", "verbatim", "precision"}, set()),
    "location": ({"lat", "lon"}, set()),
}
PRECISIONS = {"year", "month", "day", "decade", "century", "unknown"}
ORIGINS = {"ai", "human"}
STATUSES = {"draft", "stable", "deprecated"}

CLAIM_ID_RE = re.compile(r"^claim-[a-z0-9]+(?:-[a-z0-9]+)*$")
PREDICATE_RE = re.compile(r"^syj:[A-Za-z][A-Za-z0-9]*$")
TS_ID_RE = re.compile(r"^ts-[a-z0-9]+(?:-[a-z0-9]+)*$")
FM_LINE_RE = re.compile(r"^([A-Za-z][A-Za-z0-9_]*):(?:[ \t]+(.*))?$")
FENCE_OPEN = "```claims-json"
FENCE_RE = re.compile(r"^```claims-json[ \t]*\n(.*?)\n```[ \t]*$", re.S | re.M)

STEMS = "甲乙丙丁戊己庚辛壬癸"
BRANCHES = "子丑寅卯辰巳午未申酉戌亥"
GANZHI_RE = re.compile(f"[{STEMS}][{BRANCHES}]")


class FormatError(ValueError):
    pass


def rel(path: Path) -> str:
    try:
        return path.relative_to(ROOT).as_posix()
    except ValueError:
        return path.as_posix()


def squash(s: str) -> str:
    """공백류를 전부 제거한다 — quote 비교는 이 형태로 한다 (§7.1)."""
    return "".join(ch for ch in s if not ch.isspace())


def ganzhi_of(year: int) -> str:
    """서기(천문 연도, 1 BCE = 0) → 60갑자. 4 CE = 甲子."""
    idx = (year - 4) % 60
    return STEMS[idx % 10] + BRANCHES[idx % 12]


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


# ---------------------------------------------------------------- 파싱

def parse_front_matter(text: str) -> tuple[dict, str]:
    """`---` 로 감싼 머리말 → (dict, 본문). 스칼라 `key: value` 만 허용한다."""
    lines = text.split("\n")
    if not lines or lines[0].strip() != "---":
        raise FormatError("front matter must start with '---' on line 1")
    fm: dict[str, str] = {}
    i = 1
    while i < len(lines) and lines[i].strip() != "---":
        line = lines[i]
        i += 1
        if not line.strip():
            continue
        if line[0].isspace():
            raise FormatError(f"line {i}: indented line in front matter (nesting is not allowed)")
        m = FM_LINE_RE.match(line)
        if not m:
            raise FormatError(f"line {i}: not a 'key: value' line: {line!r}")
        key, val = m.group(1), (m.group(2) or "").strip()
        if not val:
            raise FormatError(f"line {i}: key '{key}' has no scalar value (lists/nesting not allowed)")
        if val.startswith(("- ", "[", "{")) or val in ("|", ">", "|-", ">-"):
            raise FormatError(f"line {i}: key '{key}' is not a scalar: {val!r}")
        if len(val) >= 2 and val[0] == val[-1] and val[0] in "\"'":
            val = val[1:-1]
        if key in fm:
            raise FormatError(f"line {i}: duplicate key '{key}'")
        fm[key] = val
    if i >= len(lines):
        raise FormatError("front matter is not closed with '---'")
    return fm, "\n".join(lines[i + 1:])


def parse_claims_file(path: Path) -> tuple[dict, list[dict]]:
    """claims 마크다운 하나 → (머리말, claim 목록). 형식 위반은 FormatError."""
    text = io.open(path, encoding="utf-8").read()
    fm, body = parse_front_matter(text)
    missing = FM_REQUIRED - set(fm)
    if missing:
        raise FormatError(f"front matter missing keys: {sorted(missing)}")
    if fm["type"] != "Claims":
        raise FormatError(f"front matter type must be 'Claims', got {fm['type']!r}")

    opens = body.count(FENCE_OPEN)
    fences = FENCE_RE.findall(body)
    if opens != 1 or len(fences) != 1:
        raise FormatError(
            f"expected exactly one closed {FENCE_OPEN} fence, found {opens} opener(s) / {len(fences)} closed"
        )
    try:
        claims = json.loads(fences[0])
    except json.JSONDecodeError as e:
        raise FormatError(f"claims-json is not valid JSON: {e}") from e
    if not isinstance(claims, list):
        raise FormatError("claims-json must be a JSON array")
    for n, c in enumerate(claims):
        if not isinstance(c, dict):
            raise FormatError(f"claim #{n} is not an object")
    return fm, claims


def load_chunks(source_id: str) -> dict[str, dict]:
    path = SOURCES_DIR / source_id / "chunks.jsonl"
    if not path.exists():
        raise FormatError(f"chunks file not found: {rel(path)}")
    chunks: dict[str, dict] = {}
    with io.open(path, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if line:
                c = json.loads(line)
                chunks[c["id"]] = c
    return chunks


def load_entities() -> tuple[dict[str, dict], list[str]]:
    """data/entities/<dir>/<id>.md 껍데기를 읽는다. 머리말은 type/id/label/labelHanja 만."""
    entities: dict[str, dict] = {}
    errors: list[str] = []
    if not ENTITIES_DIR.exists():
        return entities, [f"entities dir not found: {rel(ENTITIES_DIR)}"]
    dir_to_type = {v: k for k, v in ENTITY_TYPES.items()}
    for sub in sorted(p for p in ENTITIES_DIR.iterdir() if p.is_dir()):
        if sub.name not in dir_to_type:
            errors.append(f"{rel(sub)}: unknown entity dir (allowed: {sorted(dir_to_type)})")
            continue
        for path in sorted(sub.glob("*.md")):
            where = rel(path)
            try:
                fm, _ = parse_front_matter(io.open(path, encoding="utf-8").read())
            except FormatError as e:
                errors.append(f"{where}: {e}")
                continue
            keys = set(fm)
            if keys != ENTITY_KEYS:
                errors.append(
                    f"{where}: front matter keys must be exactly {sorted(ENTITY_KEYS)}, got {sorted(keys)}"
                )
                continue
            if fm["type"] != dir_to_type[sub.name]:
                errors.append(f"{where}: type {fm['type']!r} does not match dir '{sub.name}'")
            if fm["id"] != path.stem:
                errors.append(f"{where}: id {fm['id']!r} does not match file name")
            if not fm["id"].startswith(sub.name + "-"):
                errors.append(f"{where}: id must start with '{sub.name}-'")
            if fm["id"] in entities:
                errors.append(f"{where}: duplicate entity id {fm['id']!r}")
            entities[fm["id"]] = {
                "type": fm["type"],
                "label": fm["label"],
                "labelHanja": fm["labelHanja"],
                "path": where,
            }
    return entities, errors


def load_places() -> dict[str, str]:
    if not PLACES_JSON.exists():
        return {}
    data = json.loads(io.open(PLACES_JSON, encoding="utf-8").read())
    return {p["id"]: p["label"] for p in data.get("places", [])}


def load_corpus() -> tuple[list[dict], list[str]]:
    """모든 claims 파일을 읽어 [{path, sourceId, front, chunk, claims}] 를 돌려준다."""
    files: list[dict] = []
    errors: list[str] = []
    if not CLAIMS_DIR.exists():
        return files, [f"claims dir not found: {rel(CLAIMS_DIR)}"]
    for src_dir in sorted(p for p in CLAIMS_DIR.iterdir() if p.is_dir()):
        source_id = src_dir.name
        try:
            chunks = load_chunks(source_id)
        except FormatError as e:
            errors.append(f"{rel(src_dir)}: {e}")
            continue
        for path in sorted(src_dir.glob("*.md")):
            where = rel(path)
            try:
                fm, claims = parse_claims_file(path)
            except FormatError as e:
                errors.append(f"{where}: {e}")
                continue
            chunk = chunks.get(fm["chunk"])
            if chunk is None:
                errors.append(f"{where}: front matter chunk {fm['chunk']!r} not in {source_id}/chunks.jsonl")
                continue
            if path.stem != fm["chunk"]:
                errors.append(f"{where}: file name must equal chunk id {fm['chunk']!r}")
            if fm["source"] != chunk["sourceId"]:
                errors.append(f"{where}: front matter source {fm['source']!r} != chunk sourceId {chunk['sourceId']!r}")
            files.append(
                {"path": where, "sourceId": source_id, "front": fm, "chunk": chunk, "chunks": chunks, "claims": claims}
            )
    return files, errors


# ---------------------------------------------------------------- 검증

def check_object(obj: object, where: str) -> list[str]:
    errs: list[str] = []
    if not isinstance(obj, dict) or "kind" not in obj:
        return [f"{where}: object must be a dict with 'kind'"]
    kind = obj["kind"]
    if kind not in OBJECT_KEYS:
        return [f"{where}: object.kind {kind!r} not in {sorted(OBJECT_KEYS)}"]
    required, optional = OBJECT_KEYS[kind]
    keys = set(obj) - {"kind"}
    if keys - required - optional:
        errs.append(f"{where}: object has unknown keys {sorted(keys - required - optional)} for kind {kind!r}")
    if required - keys:
        errs.append(f"{where}: object missing keys {sorted(required - keys)} for kind {kind!r}")
        return errs
    if kind == "year" and (not isinstance(obj["value"], int) or isinstance(obj["value"], bool)):
        errs.append(f"{where}: object.value must be an integer year")
    if kind in ("entity", "time") and not isinstance(obj["id"], str):
        errs.append(f"{where}: object.id must be a string")
    if kind == "time":
        if not TS_ID_RE.match(str(obj["id"])):
            errs.append(f"{where}: time id {obj['id']!r} must look like ts-...")
        if obj["precision"] not in PRECISIONS:
            errs.append(f"{where}: precision {obj['precision']!r} not in {sorted(PRECISIONS)}")
        if not isinstance(obj["verbatim"], str) or not obj["verbatim"]:
            errs.append(f"{where}: time.verbatim must be a non-empty string")
    if kind == "literal":
        if not isinstance(obj["value"], str) or not obj["value"]:
            errs.append(f"{where}: literal value must be a non-empty string")
        if "position" in obj and (not isinstance(obj["position"], str) or not obj["position"]):
            errs.append(f"{where}: literal position must be a non-empty string")
    if kind == "location":
        for k in ("lat", "lon"):
            if not isinstance(obj[k], (int, float)) or isinstance(obj[k], bool):
                errs.append(f"{where}: location.{k} must be a number")
    return errs


def validate(files: list[dict], entities: dict[str, dict]) -> tuple[list[str], dict]:
    errors: list[str] = []
    seen_ids: dict[str, str] = {}
    timespans: dict[str, dict] = {}  # ts id → {verbatim, precision, claim, where}

    # 1차: TimeSpan 정의 수집 (subject 로 참조되는 것은 어디서든 정의돼 있으면 된다)
    for f in files:
        for c in f["claims"]:
            obj = c.get("object")
            if isinstance(obj, dict) and obj.get("kind") == "time" and isinstance(obj.get("id"), str):
                where = f"{f['path']} [{c.get('id', '?')}]"
                if obj["id"] in timespans:
                    errors.append(f"{where}: TimeSpan {obj['id']!r} already defined in {timespans[obj['id']]['where']}")
                else:
                    timespans[obj["id"]] = {
                        "verbatim": obj.get("verbatim", ""),
                        "precision": obj.get("precision"),
                        "where": where,
                    }

    # 2차: claim 하나씩
    stats = {
        "claims": 0,
        "predicates": {},
        "object_kinds": {},
        "readings": {},  # (subject, position) → set(values)
    }
    for f in files:
        chunk = f["chunk"]
        text_sq = squash(chunk["text"])
        notes_sq = [squash(n) for n in chunk.get("editorNotes", [])]
        for n, c in enumerate(f["claims"]):
            cid = c.get("id")
            where = f"{f['path']} [{cid if isinstance(cid, str) else '#' + str(n)}]"
            keys = set(c)
            if keys - CLAIM_REQUIRED - CLAIM_OPTIONAL:
                errors.append(f"{where}: unknown keys {sorted(keys - CLAIM_REQUIRED - CLAIM_OPTIONAL)}")
            if CLAIM_REQUIRED - keys:
                errors.append(f"{where}: missing keys {sorted(CLAIM_REQUIRED - keys)}")
                continue
            for k in ("id", "subject", "predicate", "citesChunk", "quote", "fromSource", "origin", "status"):
                if not isinstance(c[k], str) or not c[k]:
                    errors.append(f"{where}: {k} must be a non-empty string")
            if "note" in c and not isinstance(c["note"], str):
                errors.append(f"{where}: note must be a string")
            if any(not isinstance(c[k], str) for k in ("id", "subject", "predicate", "citesChunk", "quote")):
                continue

            stats["claims"] += 1

            # id
            if not CLAIM_ID_RE.match(c["id"]):
                errors.append(f"{where}: id must match claim-[a-z0-9-]+")
            if c["id"] in seen_ids:
                errors.append(f"{where}: duplicate claim id (also in {seen_ids[c['id']]})")
            seen_ids[c["id"]] = f["path"]

            # predicate / origin / status
            if not PREDICATE_RE.match(c["predicate"]):
                errors.append(f"{where}: predicate must look like syj:name")
            stats["predicates"][c["predicate"]] = stats["predicates"].get(c["predicate"], 0) + 1
            if c["origin"] not in ORIGINS:
                errors.append(f"{where}: origin {c['origin']!r} not in {sorted(ORIGINS)}")
            if c["status"] not in STATUSES:
                errors.append(f"{where}: status {c['status']!r} not in {sorted(STATUSES)}")

            # 근거: citesChunk / fromSource / quote
            if c["citesChunk"] != chunk["id"]:
                errors.append(f"{where}: citesChunk {c['citesChunk']!r} != file chunk {chunk['id']!r}")
            if c["citesChunk"] not in f["chunks"]:
                errors.append(f"{where}: citesChunk {c['citesChunk']!r} does not exist")
            if c["fromSource"] != chunk["sourceId"]:
                errors.append(f"{where}: fromSource {c['fromSource']!r} != chunk sourceId {chunk['sourceId']!r}")
            quote_sq = squash(c["quote"])
            if not quote_sq:
                errors.append(f"{where}: quote is empty")
            elif quote_sq not in text_sq:
                errors.append(f"{where}: quote not found in chunk text: {c['quote']!r}")

            # object
            obj_errs = check_object(c["object"], where)
            errors.extend(obj_errs)
            obj = c["object"]
            kind = obj.get("kind") if isinstance(obj, dict) else None
            if kind:
                stats["object_kinds"][kind] = stats["object_kinds"].get(kind, 0) + 1
            if obj_errs:
                continue

            if kind == "entity" and obj["id"] not in entities:
                errors.append(f"{where}: object entity {obj['id']!r} has no shell in data/entities/")
            if kind == "time" and squash(obj["verbatim"]) not in text_sq:
                errors.append(f"{where}: time.verbatim not found in chunk text: {obj['verbatim']!r}")
            if kind == "time" and squash(obj["verbatim"]) not in quote_sq:
                errors.append(f"{where}: time.verbatim must be inside the quote: {obj['verbatim']!r}")

            # subject: 엔티티 | chunk id | TimeSpan id
            subj = c["subject"]
            if subj in entities:
                pass
            elif subj in f["chunks"]:
                if subj != chunk["id"]:
                    errors.append(f"{where}: subject chunk {subj!r} must be the cited chunk {chunk['id']!r}")
            elif TS_ID_RE.match(subj):
                if subj not in timespans:
                    errors.append(f"{where}: subject TimeSpan {subj!r} is not defined by any time object")
            else:
                errors.append(f"{where}: subject {subj!r} is neither an entity, a chunk id, nor a TimeSpan id")

            # 판독 claim: 글자가 원문 그 자리 또는 editorNotes 에 있어야 한다
            if c["predicate"] == "syj:readsCharacterAs":
                if kind != "literal" or "position" not in obj:
                    errors.append(f"{where}: readsCharacterAs needs a literal object with 'position'")
                elif subj != chunk["id"]:
                    errors.append(f"{where}: readsCharacterAs subject must be the chunk id")
                else:
                    pos_sq, val_sq = squash(obj["position"]), squash(obj["value"])
                    if pos_sq not in text_sq:
                        errors.append(f"{where}: position not found in chunk text: {obj['position']!r}")
                    in_text = val_sq in pos_sq
                    in_notes = any(val_sq in n for n in notes_sq)
                    if not (in_text or in_notes):
                        errors.append(
                            f"{where}: reading {obj['value']!r} is neither in the text at {obj['position']!r} nor in editorNotes"
                        )
                    key = (subj, obj["position"])
                    stats["readings"].setdefault(key, set()).add(obj["value"])

            # 역법 claim: 간지 산술 대조
            if c["predicate"] == "syj:convertsTo":
                if kind != "year":
                    errors.append(f"{where}: convertsTo needs a year object")
                elif not TS_ID_RE.match(subj):
                    errors.append(f"{where}: convertsTo subject must be a TimeSpan id")
                elif subj in timespans:
                    m = GANZHI_RE.search(timespans[subj]["verbatim"])
                    if m:
                        expected = ganzhi_of(obj["value"])
                        if m.group(0) != expected:
                            errors.append(
                                f"{where}: year {obj['value']} is {expected}, but verbatim says {m.group(0)}"
                            )

    return errors, stats


def check_digests(files: list[dict], update: bool) -> tuple[list[str], list[str]]:
    """소스별 .digests.json 기록·대조. (errors, notes) 를 돌려준다."""
    errors: list[str] = []
    notes: list[str] = []
    by_source: dict[str, dict[str, str]] = {}
    for f in files:
        d = by_source.setdefault(f["sourceId"], {})
        for c in f["claims"]:
            if isinstance(c.get("id"), str) and c["id"] not in d and CLAIM_REQUIRED <= set(c):
                try:
                    d[c["id"]] = claim_digest(c)
                except (TypeError, ValueError):
                    pass  # 형식 오류는 validate 가 이미 잡았다

    for source_id, current in sorted(by_source.items()):
        path = CLAIMS_DIR / source_id / DIGEST_FILE
        recorded: dict[str, str] = {}
        if path.exists():
            recorded = json.loads(io.open(path, encoding="utf-8").read())
        changed = sorted(k for k in recorded if k in current and recorded[k] != current[k])
        removed = sorted(k for k in recorded if k not in current)
        added = sorted(k for k in current if k not in recorded)
        for k in changed:
            msg = f"{rel(path)}: digest mismatch for {k} (claim content changed after it was recorded)"
            (notes if update else errors).append(("updated: " if update else "") + msg)
        for k in removed:
            msg = f"{rel(path)}: recorded claim {k} no longer exists"
            (notes if update else errors).append(("dropped: " if update else "") + msg)
        if update or (not changed and not removed):
            if added or changed or removed or not path.exists():
                io.open(path, "w", encoding="utf-8", newline="\n").write(
                    json.dumps(current, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
                )
            notes.append(
                f"digests {source_id}: {len(current)} recorded (new {len(added)}) -> {rel(path)}"
            )
    return errors, notes


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--update-digests", action="store_true", help="accept changed/removed claims and rewrite .digests.json")
    args = ap.parse_args(argv)

    errors: list[str] = []
    entities, ent_errors = load_entities()
    errors.extend(ent_errors)

    places = load_places()
    for eid, e in sorted(entities.items()):
        if e["type"] == "Place" and eid in places and e["labelHanja"] != places[eid]:
            errors.append(f"{e['path']}: labelHanja {e['labelHanja']!r} != places.json label {places[eid]!r}")

    files, load_errors = load_corpus()
    errors.extend(load_errors)

    val_errors, stats = validate(files, entities)
    errors.extend(val_errors)

    notes: list[str] = []
    if not errors:
        dig_errors, notes = check_digests(files, args.update_digests)
        errors.extend(dig_errors)

    # ---- 보고
    by_type: dict[str, int] = {}
    for e in entities.values():
        by_type[e["type"]] = by_type.get(e["type"], 0) + 1
    print(f"claims files : {len(files)}")
    print(f"claims       : {stats['claims']}")
    print(f"entities     : {len(entities)}  " + ", ".join(f"{k} {v}" for k, v in sorted(by_type.items())))
    print("predicates   : " + ", ".join(f"{k} {v}" for k, v in sorted(stats["predicates"].items())))
    print("object kinds : " + ", ".join(f"{k} {v}" for k, v in sorted(stats["object_kinds"].items())))
    contested = {k: v for k, v in stats["readings"].items() if len(v) > 1}
    for (subj, pos), vals in sorted(contested.items()):
        print(f"contested    : {subj} @ {pos} -> {' / '.join(sorted(vals))}")
    for n in notes:
        print(f"note         : {n}")
    for e in errors:
        print(f"ERROR {e}")
    if errors:
        print(f"FAILED: {len(errors)} error(s)")
        return 1
    print("OK")
    return 0


if __name__ == "__main__":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")  # type: ignore[attr-defined]
    except (AttributeError, ValueError):
        pass
    sys.exit(main(sys.argv[1:]))
