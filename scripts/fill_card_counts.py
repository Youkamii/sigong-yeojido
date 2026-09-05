#!/usr/bin/env python3
"""사료 카드의 '담고 있는 것' 수치를 chunks.jsonl 에서 세어 채운다 (마커 <!-- counts:start --> … <!-- counts:end --> 사이).

표준 배치: scripts/fill_card_counts.py
실행:      python3 scripts/fill_card_counts.py --source samgukyusa
카드 수치를 손으로 적지 않는다 — 추출기가 바뀌면 이 스크립트를 다시 돌려 카드를 맞춘다. 표준 라이브러리만.
"""
from __future__ import annotations

import argparse
import collections
import io
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCES = ROOT / "data" / "sources"
START, END = "<!-- counts:start -->", "<!-- counts:end -->"


def load(p: Path) -> list[dict]:
    return [json.loads(line) for line in io.open(p, encoding="utf-8") if line.strip()]


def group_label(locator: str, source: str) -> str:
    parts = locator.split(" › ")
    if source == "goryeosa":
        l1 = parts[0]
        for key, name in (("世家", "世家"), ("志", "志"), ("表", "表"), ("列傳", "列傳")):
            if key in l1:
                return name
        return "그 밖(고려세계·목록 등)"
    if source == "samgukyusa":
        return parts[1] if len(parts) > 1 else parts[0]
    return parts[0]


def fmt(n: int) -> str:
    return f"{n:,}"


def build(source: str) -> str:
    d = SOURCES / source
    chunks = load(d / "chunks.jsonl")
    ann = load(d / "annotations.jsonl") if (d / "annotations.jsonl").exists() else []
    idx = load(d / "index-terms.jsonl") if (d / "index-terms.jsonl").exists() else []

    groups = collections.Counter(group_label(c["locator"], source) for c in chunks)
    levels = collections.Counter(c.get("level") for c in chunks)
    dated = sum(1 for c in chunks if c.get("date"))
    empty = sum(1 for c in chunks if not c.get("text"))
    ann_t = collections.Counter(a.get("type") for a in ann)
    idx_t = collections.Counter(t.get("type") for t in idx)
    total_chars = sum(c.get("charCount", 0) for c in chunks)

    lines = ["| 부·편 | chunk 수 |", "|---|---:|"]
    for g, n in groups.most_common():
        lines.append(f"| {g} | {fmt(n)} |")
    lines.append(f"| **합** | **{fmt(len(chunks))}** |")
    lines.append("")
    lines.append(
        f"chunk 가 놓인 층: " + " · ".join(f"level{k} {fmt(v)}" for k, v in sorted(levels.items()) if k)
        + f". 연대(dateOccured) 붙은 chunk {fmt(dated)}, 본문이 빈 chunk {fmt(empty)}, 본문 글자 수 {fmt(total_chars)}."
    )
    lines.append(
        f"주석 {fmt(len(ann))}(" + " · ".join(f"{k} {fmt(v)}" for k, v in ann_t.most_common()) + "), "
        f"색인어 {fmt(len(idx))}(" + " · ".join(f"{k} {fmt(v)}" for k, v in idx_t.most_common()) + ")."
    )
    return "\n".join(lines)


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--source", required=True)
    a = ap.parse_args(argv)
    card = SOURCES / f"{a.source}.md"
    text = io.open(card, encoding="utf-8").read()
    if START not in text or END not in text:
        print(f"{card}: 마커가 없다 ({START} … {END})")
        return 1
    block = START + "\n" + build(a.source) + "\n" + END
    new = re.sub(re.escape(START) + r".*?" + re.escape(END), lambda m: block, text, count=1, flags=re.S)
    io.open(card, "w", encoding="utf-8", newline="\n").write(new)
    print(new[new.index(START):new.index(END) + len(END)])
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
