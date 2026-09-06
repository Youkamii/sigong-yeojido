#!/usr/bin/env python3
"""국편 벌크 XML의 색인어(<index type="…">)를 type별로 세어 빈도순 목록을 낸다.

표준 배치: scripts/list_index_terms.py
실행:      python3 scripts/list_index_terms.py --dataset 15053635
산출:      data/research/samguksagi-index-terms.json  (결정론 — 두 번 실행해도 바이트가 같다)

왜 따로 뽑나
------------
chunks.jsonl 추출은 다른 파이프라인이 맡는다. 여기서는 지도에 찍을 지명·국명 후보를
고르기 위해 색인어 **표기 단위** 빈도만 센다. 색인어는 국편의 개체 판정이지 우리 판정이
아니며(docs/research/bulk-xml-findings.md §3-3), 같은 표기가 시대에 따라 다른 곳을
가리킬 수 있으므로 여기 숫자는 "몇 번 태깅됐나"일 뿐이다.

표준 라이브러리로 XML 구조를 읽는다. 중첩된 index도 각각 세며,
표기는 공용 추출기의 term_text를 사용해 주석을 빼고 문자참조를 해독한다.
"""
from __future__ import annotations

import argparse
import collections
import json
import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
BULK_DIR = ROOT / "data" / "bulk"
OUT_DIR = ROOT / "data" / "research"
sys.path.insert(0, str(ROOT / "services"))
from ingestion.extract_nikh_xml import term_text

WS_RE = re.compile(r"\s+")


def list_terms(zpath: Path) -> dict:
    counts: dict[str, collections.Counter] = collections.defaultdict(collections.Counter)
    files = 0
    with zipfile.ZipFile(zpath) as z:
        for name in sorted(z.namelist()):
            if not name.lower().endswith(".xml"):
                continue
            files += 1
            root = ET.fromstring(z.read(name))
            for element in root.iter("index"):
                typ = element.get("type")
                if not typ:
                    continue
                term = WS_RE.sub("", term_text(element))
                if term:
                    counts[typ][term] += 1

    types = {}
    for typ in sorted(counts):
        c = counts[typ]
        types[typ] = {
            "total": sum(c.values()),
            "distinct": len(c),
            "terms": [
                {"term": t, "count": n}
                for t, n in sorted(c.items(), key=lambda kv: (-kv[1], kv[0]))
            ],
        }
    return {
        "dataset": zpath.stem,
        "xmlFiles": files,
        "generatedBy": "scripts/list_index_terms.py",
        "note": "색인어 표기 단위 빈도. 국편의 태깅이며 개체 단위가 아니다 (南堂 5회 = 5건).",
        "types": types,
    }


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dataset", default="15053635")
    ap.add_argument("--zip", help="벌크 zip 경로 (기본: data/bulk/{dataset}.zip)")
    ap.add_argument("--out", help="산출 JSON 경로 (기본: data/research/samguksagi-index-terms.json)")
    ap.add_argument("--top", type=int, default=15, help="콘솔에 보여줄 type별 상위 N")
    a = ap.parse_args(argv)

    zpath = Path(a.zip) if a.zip else BULK_DIR / f"{a.dataset}.zip"
    if not zpath.exists():
        raise SystemExit(f"bulk zip not found: {zpath}  (run fetch_datago_bulk.py first)")
    out = Path(a.out) if a.out else OUT_DIR / "samguksagi-index-terms.json"

    r = list_terms(zpath)
    out.parent.mkdir(parents=True, exist_ok=True)
    with open(out, "w", encoding="utf-8", newline="\n") as f:
        json.dump(r, f, ensure_ascii=False, indent=2, sort_keys=True)
        f.write("\n")

    print(f"dataset={r['dataset']} xmlFiles={r['xmlFiles']} -> {out.resolve()}")
    for typ, info in r["types"].items():
        print(f"[{typ}] total={info['total']} distinct={info['distinct']}")
        for e in info["terms"][: a.top]:
            print(f"    {e['count']:5d}  {e['term']}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
