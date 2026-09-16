"""개체 이름 원본 정리 (#200).

data/entities/<type>/<id>.md 머리말의 label 을 화면 규칙(services/entity_labels.py)으로 정리하고
 - 떼어낸 설명은 labelNote 에
 - 설명에 섞인 자료 식별자('HGIS 176301' 같은 것)는 sourceRef 에
 - '집단 행위자' 꼬리는 kind: "group" 으로
 - 원래 이름은 aliases 에(검색이 계속 잡히도록)
남긴다. 정리 뒤 같은 유형·같은 이름이 서로 다른 개체에 생기면(sameEntityAs 로 묶이지 않은 채)
그 개체들은 손대지 않고 충돌 목록으로만 보고한다 — 새 이름을 지어내지 않는다.

    python scripts/clean_entity_labels.py            # 미리 보기(집계만)
    python scripts/clean_entity_labels.py --apply     # 파일 수정
    python scripts/clean_entity_labels.py --report docs/research/entity-labels-200.json
"""
import argparse
import collections
import io
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "services"))
from entity_labels import clean_label, split_source_refs  # noqa: E402
from frontmatter import parse_front_matter  # noqa: E402
from validate import parse_claims_text  # noqa: E402


def scalar(value: str) -> str:
    """머리말에 쓰는 따옴표 스칼라. 파서가 바깥 따옴표만 벗기므로 값을 그대로 감싼다."""
    if '"' in value and not (value.startswith('\\"') or value.endswith('\\"')):
        raise ValueError(f"cannot quote front matter scalar: {value!r}")
    return f'"{value}"'


def _key(line: str) -> str | None:
    return line.split(":", 1)[0].strip() if ":" in line and not line[:1].isspace() and not line.startswith("-") else None


def render(meta_lines: list[str], updates: dict) -> list[str]:
    """label/labelHanja 뒤에 labelNote·sourceRef·kind·aliases 를 끼워 넣은 머리말 줄 목록. 나머지 줄은 그대로 둔다."""
    anchor = max((i for i, line in enumerate(meta_lines) if _key(line) in ("label", "labelHanja")), default=-1)
    if anchor < 0:
        raise ValueError("front matter has no label line")
    added = [f'labelNote: {scalar(updates["labelNote"])}'] if updates.get("labelNote") else []
    if updates.get("sourceRef"):
        added.append("sourceRef:")
        added.extend(f"  - {scalar(ref)}" for ref in updates["sourceRef"])
    if updates.get("kind"):
        added.append(f'kind: {scalar(updates["kind"])}')
    if updates.get("aliases"):
        added.append("aliases:")
        added.extend(f"  - {scalar(alias)}" for alias in updates["aliases"])

    out: list[str] = []
    i = 0
    while i < len(meta_lines):
        line, key = meta_lines[i], _key(meta_lines[i])
        i += 1
        if key in ("labelNote", "sourceRef", "kind", "aliases"):  # 이미 있던 값은 새로 쓴다
            while i < len(meta_lines) and _key(meta_lines[i]) is None:
                i += 1
            continue
        out.append(f'label: {scalar(updates["label"])}' if key == "label" else line)
        if i - 1 == anchor:
            out.extend(added)
    return out


def rewrite(path: Path, updates: dict) -> str:
    with io.open(path, encoding="utf-8", newline="") as handle:
        text = handle.read()
    newline = "\r\n" if "\r\n" in text else "\n"  # 작업 트리의 줄 끝을 그대로 지킨다
    lines = text.replace("\r\n", "\n").split("\n")
    if lines[0] != "---":
        raise ValueError(f"{path}: front matter must open with '---'")
    end = lines.index("---", 1)
    body = render(lines[1:end], updates)
    return newline.join(["---", *body, "---", *lines[end + 1:]])


def load_entities(data: Path) -> list[dict]:
    rows = []
    for path in sorted((data / "entities").glob("*/*.md")):
        meta, _ = parse_front_matter(path.read_text(encoding="utf-8"))
        rows.append({"id": path.stem, "path": path, "type": meta.get("type"),
                     "label": meta.get("label") or "", "aliases": list(meta.get("aliases") or []),
                     "labelNote": str(meta.get("labelNote") or ""), "kind": str(meta.get("kind") or ""),
                     "sourceRef": [str(ref) for ref in (meta.get("sourceRef") or [])]})
    return rows


def same_entity_pairs(data: Path) -> list[tuple[str, str]]:
    pairs = []
    for path in sorted((data / "claims").glob("**/*.md")):
        try:
            _, claims = parse_claims_text(path.read_text(encoding="utf-8"))
        except Exception:
            continue  # 깨진 주장 파일은 validate.py 가 잡는다
        for claim in claims:
            obj = claim.get("object") if isinstance(claim, dict) else None
            if isinstance(obj, dict) and claim.get("predicate") == "syj:sameEntityAs" and obj.get("kind") == "entity":
                pairs.append((claim["subject"], obj.get("id")))
    return pairs


def plan(rows: list[dict], pairs: list[tuple[str, str]]) -> tuple[list[dict], list[dict]]:
    """정리안과 충돌 목록. 충돌에 걸린 개체는 손대지 않는다."""
    by_id = {r["id"]: r for r in rows}
    parent = {r["id"]: r["id"] for r in rows}

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for a, b in pairs:  # 같은 유형끼리만 — chronicle_query.build_same_entity_map 과 같은 조건
        if a in parent and b in parent and by_id[a]["type"] == by_id[b]["type"]:
            ra, rb = find(a), find(b)
            if ra != rb:
                parent[ra] = rb

    cleaned = {r["id"]: clean_label(r["label"], r["type"]) for r in rows}
    held: set[str] = set()
    conflicts: list[dict] = []
    for _ in range(10):
        labels = {i: (by_id[i]["label"] if i in held else cleaned[i]["label"]) for i in by_id}
        groups: dict[tuple, list[str]] = collections.defaultdict(list)
        for i, r in by_id.items():
            groups[(r["type"], labels[i])].append(i)
        fresh: set[str] = set()
        for (type_, label), ids in sorted(groups.items()):
            if len(ids) < 2 or len({find(i) for i in ids}) < 2:
                continue  # 하나이거나 sameEntityAs 로 이미 같은 개체
            if len({by_id[i]["label"] for i in ids}) < 2:
                continue  # 정리 전부터 이름이 똑같던 개체 — 이번 정리가 만든 충돌이 아니다
            touched = [i for i in ids if i not in held and cleaned[i]["changed"]]
            if not touched:
                continue  # 이미 손대지 않기로 한 것뿐이다
            fresh.update(touched)
            conflicts.append({"type": type_, "label": label, "held": touched,
                              "entities": {i: by_id[i]["label"] for i in sorted(ids)}})
        if not fresh:
            break
        held |= fresh

    actions = []
    for r in rows:
        c = cleaned[r["id"]]
        was_note, was_refs = str(r.get("labelNote") or ""), list(r.get("sourceRef") or [])
        if r["id"] in held or not c["changed"]:
            # 이름은 그대로 두고, 이미 적어 둔 설명에서 자료 식별자만 sourceRef 로 옮긴다 (#200 2차).
            note, refs = split_source_refs(was_note)
            refs = list(dict.fromkeys([*was_refs, *refs]))
            if note == was_note and refs == was_refs:
                continue
            actions.append({"id": r["id"], "path": r["path"], "type": r["type"], "from": r["label"],
                            "label": r["label"], "labelNote": note, "sourceRef": refs,
                            "kind": str(r.get("kind") or ""), "aliases": list(r["aliases"])})
            continue
        aliases = [a for a in r["aliases"] if a != c["label"]]
        if r["label"] != c["label"] and r["label"] not in aliases:
            aliases.append(r["label"])
        actions.append({"id": r["id"], "path": r["path"], "type": r["type"], "from": r["label"],
                        "label": c["label"], "labelNote": c["note"],
                        "sourceRef": list(dict.fromkeys([*was_refs, *c["sourceRef"]])),
                        "kind": "group" if c["group"] else "", "aliases": aliases})
    return actions, conflicts


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--data", type=Path, default=ROOT / "data")
    ap.add_argument("--apply", action="store_true", help="파일에 쓴다 (기본은 미리 보기)")
    ap.add_argument("--report", type=Path, help="집계·충돌·표본을 JSON 으로 저장")
    args = ap.parse_args()

    rows = load_entities(args.data)
    actions, conflicts = plan(rows, same_entity_pairs(args.data))
    for action in actions:
        text = rewrite(action["path"], action)
        meta, _ = parse_front_matter(text)  # 되읽어 같은 값인지 확인한다 — 따옴표가 값을 바꾸면 여기서 멈춘다
        wrote = (meta.get("label"), meta.get("labelNote") or "", meta.get("kind") or "",
                 list(meta.get("aliases") or []), [str(ref) for ref in (meta.get("sourceRef") or [])])
        if wrote != (action["label"], action["labelNote"], action["kind"], action["aliases"], action["sourceRef"]):
            raise SystemExit(f"{action['path']}: front matter round trip changed the value: {wrote!r}")
        if args.apply:
            with io.open(action["path"], "w", encoding="utf-8", newline="") as handle:
                handle.write(text)

    by_type = collections.Counter(a["type"] for a in actions)
    summary = {"entities": len(rows), "cleaned": len(actions),
               "labelNote": sum(1 for a in actions if a["labelNote"]),
               "sourceRef": sum(len(a["sourceRef"]) for a in actions),
               "group": sum(1 for a in actions if a["kind"]),
               "aliases": sum(len(a["aliases"]) for a in actions),
               "held": sum(len(c["held"]) for c in conflicts),
               "conflictGroups": len(conflicts), "byType": dict(by_type)}
    print(json.dumps(summary, ensure_ascii=False, sort_keys=True))
    if args.report:
        payload = {"summary": summary, "conflicts": conflicts,
                   "samples": [{k: a[k] for k in ("id", "type", "from", "label", "labelNote", "sourceRef", "kind")}
                               for a in actions]}
        args.report.write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
