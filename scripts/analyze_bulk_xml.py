#!/usr/bin/env python3
"""국편 벌크 XML의 구조를 실측한다 — 무엇이 이미 구조화돼 있는지.

표준 배치: scripts/analyze_bulk_xml.py
실행:      python3 scripts/analyze_bulk_xml.py --dataset 15053635

이 스크립트가 답하는 질문
------------------------
1. 벌크 XML 안의 id가 웹 퍼머링크(db.history.go.kr/id/{id})와 같은가  → 근거 추적 가능 여부
2. 판본 이문(교감주)이 구조화돼 있는가                                 → Claim 층 재료
3. 인명·지명이 태깅돼 있는가                                          → Entity 층 재료
4. 날짜가 기계가 읽는 형식인가                                        → TimeSpan 층 재료
"""
from __future__ import annotations

import argparse
import collections
import io
import json
import re
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BULK_DIR = ROOT / "data" / "bulk"

LEVEL_RE = re.compile(r"<(level\d)\b[^>]*\bid=\"([^\"]+)\"")
ANN_RE = re.compile(r"<annotation\b[^>]*type=\"([^\"]+)\"")
IDX_RE = re.compile(r"<index\b[^>]*type=\"([^\"]+)\"[^>]*>(.*?)</index>", re.S)
DATE_RE = re.compile(r"<dateOccured\b[^>]*\bdate=\"([^\"]+)\"")
DATE_LABEL_RE = re.compile(
    r"<dateOccured\b[^>]*\bdate=\"([^\"]+)\"[^>]*>(.*?)</dateOccured>", re.S
)
SUBJ_RE = re.compile(r"<subjectClass\b[^>]*>(.*?)</subjectClass>", re.S)


def analyze(dataset: str) -> dict:
    zpath = BULK_DIR / f"{dataset}.zip"
    if not zpath.exists():
        raise SystemExit(f"벌크가 없다: {zpath}  (먼저 fetch_datago_bulk.py 실행)")

    levels = collections.Counter()
    ann = collections.Counter()
    idx = collections.Counter()
    subj = collections.Counter()
    date_shapes = collections.Counter()
    date_samples: list[str] = []
    idx_samples: dict[str, list[str]] = {}
    ann_samples: dict[str, list[str]] = {}
    leaf_ids: list[str] = []
    files = 0

    with zipfile.ZipFile(zpath) as z:
        for name in sorted(z.namelist()):
            if not name.lower().endswith(".xml"):
                continue
            files += 1
            s = z.read(name).decode("utf-8", "replace")

            deepest = None
            for tag, node_id in LEVEL_RE.findall(s):
                levels[tag] += 1
                if deepest is None or tag > deepest:
                    deepest = tag
            if deepest:
                leaf_ids += [i for t, i in LEVEL_RE.findall(s) if t == deepest][:2]

            for t in ANN_RE.findall(s):
                ann[t] += 1
            for m in re.finditer(
                r"<annotation\b[^>]*type=\"([^\"]+)\"[^>]*>\s*<noteContent>(.*?)</noteContent>",
                s,
                re.S,
            ):
                t = m.group(1)
                body = re.sub(r"<[^>]+>", "", m.group(2))
                body = re.sub(r"\s+", " ", body).strip()
                if body and len(ann_samples.setdefault(t, [])) < 3:
                    ann_samples[t].append(body[:180])

            for t, body in IDX_RE.findall(s):
                idx[t] += 1
                v = re.sub(r"<[^>]+>", "", body).strip()
                if v and len(idx_samples.setdefault(t, [])) < 6:
                    idx_samples[t].append(v)

            for d in DATE_RE.findall(s):
                date_shapes[re.sub(r"\d", "N", d)] += 1
            for d, label in DATE_LABEL_RE.findall(s):
                if len(date_samples) < 8:
                    date_samples.append(f"{d}  ({re.sub(r'<[^>]+>', '', label).strip()})")

            for body in SUBJ_RE.findall(s):
                subj[re.sub(r"<[^>]+>", "", body).split("＞")[0].strip()] += 1

    return {
        "dataset": dataset,
        "xmlFiles": files,
        "levels": dict(levels),
        "leafIdSamples": leaf_ids[:6],
        "annotations": dict(ann),
        "annotationSamples": ann_samples,
        "indexTerms": dict(idx),
        "indexSamples": idx_samples,
        "dateCount": sum(date_shapes.values()),
        "dateShapes": dict(date_shapes),
        "dateSamples": date_samples,
        "subjectTop": dict(subj.most_common(8)),
    }


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dataset", default="15053635")
    ap.add_argument("--json", action="store_true", help="JSON으로 출력")
    a = ap.parse_args(argv)

    r = analyze(a.dataset)
    if a.json:
        print(json.dumps(r, ensure_ascii=False, indent=2))
        return 0

    print(f"데이터셋   : {r['dataset']}   XML {r['xmlFiles']}개")
    print(f"계층       : {r['levels']}")
    print(f"리프 id 예 : {r['leafIdSamples'][:4]}")
    print(f"  → 웹 퍼머링크: https://db.history.go.kr/id/{r['leafIdSamples'][0] if r['leafIdSamples'] else '?'}")
    print()
    print(f"주석       : {r['annotations']}")
    for t, ss in r["annotationSamples"].items():
        for s in ss[:2]:
            print(f"    [{t}] {s}")
    print()
    print(f"색인어     : {r['indexTerms']}")
    for t, ss in r["indexSamples"].items():
        print(f"    [{t}] {', '.join(ss[:5])}")
    print()
    print(f"날짜       : {r['dateCount']}건  형식 {r['dateShapes']}")
    for s in r["dateSamples"][:4]:
        print(f"    {s}")
    print()
    print(f"주제분류   : {r['subjectTop']}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
