#!/usr/bin/env python3
"""codex 교차검증 결과 → 문서 + 집계.

표준 배치: scripts/build_xcheck_doc.py

판정 표기가 회차마다 다르다 — codex가 `오류`(백틱), **키-N — 오류**(굵게),
### [키-N] 오류(제목) 세 형태를 섞어 쓴다. 백틱만 세면 크게 누락된다
(1차를 처음 집계할 때 실제로 그렇게 틀렸다: 57건을 35건으로 셈).
따라서 항목 헤더에서 판정을 뽑는다.
"""
from __future__ import annotations

import io
import os
import re
import sys

KINDS = ["오류", "의심", "거짓확인", "편향/과잉확신", "편향/과잉일반화"]
BIAS = {"편향/과잉확신", "편향/과잉일반화"}


def tally(text: str, key: str) -> dict:
    c = {k: 0 for k in KINDS}
    pat = re.compile(
        r"(?:###\s*)?(?:\*\*)?\[?" + re.escape(key) + r"-\d+\]?\s*(?:—|-|:|\s)+\s*"
        r"`?\*{0,2}(" + "|".join(re.escape(k) for k in KINDS) + r")\*{0,2}`?"
    )
    for m in pat.finditer(text):
        c[m.group(1)] += 1
    return c


def missing_count(text: str) -> int:
    if "## 누락" not in text:
        return 0
    return len(re.findall(r"^\s*[-*]\s", text.split("## 누락")[-1], re.M))


def build(round_no: int, out_dir: str, keys: list, titles: dict, items: int, header: str) -> str:
    rows, tot = [], {k: 0 for k in KINDS}
    total = 0
    for k in keys:
        p = os.path.join(out_dir, f"{k}.md")
        if not os.path.exists(p):
            continue
        t = io.open(p, encoding="utf-8").read()
        c = tally(t, k)
        s = sum(c.values())
        total += s
        for x in KINDS:
            tot[x] += c[x]
        rows.append((k, c, s, missing_count(t), t.strip()))

    bias = sum(tot[b] for b in BIAS)
    L = []
    A = L.append
    A(f"# 교차검증 {round_no}차 — codex gpt-5.6-sol (effort max)")
    A("")
    A(header)
    A("")
    A(f"**결과: {items}항목 중 {total}건에 문제. 약 {round(total/items*100)}%.**")
    A(f"오류 {tot['오류']} · 의심 {tot['의심']} · 거짓확인 {tot['거짓확인']} · 편향/과잉 {bias}")
    A("")
    A("## 갈래별")
    A("")
    A("| 갈래 | 주제 | 오류 | 의심 | 거짓확인 | 편향 | 계 | 누락 지적 |")
    A("|---|---|---:|---:|---:|---:|---:|---:|")
    for k, c, s, miss, _ in rows:
        b = sum(c[x] for x in BIAS)
        A(f"| `{k}` | {titles.get(k,k)} | {c['오류']} | {c['의심']} | {c['거짓확인']} | {b} | {s} | {miss} |")
    A(f"| | **합계** | **{tot['오류']}** | **{tot['의신'] if False else tot['의심']}** "
      f"| **{tot['거짓확인']}** | **{bias}** | **{total}** | |")
    A("")
    for k, c, s, miss, body in rows:
        A("---")
        A("")
        A(f"# {titles.get(k,k)}  `{k}`")
        A("")
        A(body)
        A("")
    return "\n".join(L)


R1_KEYS = ["gg-readings", "gg-sinmyo", "gg-places", "gg-crosscheck", "gg-calendar", "gg-tomb"]
R1_TITLES = {
    "gg-readings": "판독본 계보", "gg-sinmyo": "신묘년조 해석사", "gg-places": "지명 비정 논쟁",
    "gg-crosscheck": "비문 ↔ 타 사료 대조", "gg-calendar": "연호 · 간지 · 역법", "gg-tomb": "수묘인 기사",
}
R2_KEYS = ["goryeo", "joseon", "modern", "contemp", "diachronic", "dprk",
           "overseas", "archaeology", "cn-jp-scholarship", "license-final",
           "bulk-verify", "id-rules"]
R2_TITLES = {
    "goryeo": "고려 컬렉션", "joseon": "조선 컬렉션", "modern": "근대 컬렉션",
    "contemp": "현대 컬렉션", "diachronic": "한국사 총설", "dprk": "북한 사료·연구",
    "overseas": "재외 한국학", "archaeology": "고고학 자료",
    "cn-jp-scholarship": "중국·일본 학계", "license-final": "라이선스 확정",
    "bulk-verify": "벌크 파일 실검증", "id-rules": "식별자 체계",
}

H1 = """> 2026-09-04. 1차 조사의 **비문심층 6갈래 154항목**을 외부 모델로 교차검증했다.
> 조사는 Opus 5, 검증은 codex gpt-5.6-sol / effort max — 같은 모델의 다수결이 아니라 다른 계열의 독립 검증이다.
>
> **집계 정정 (2026-09-05)**: 처음 이 문서를 만들 때 판정 표기를 백틱만 세어
> 57건을 35건으로 잘못 집계했다(23%로 보고). codex는 백틱·굵은글씨·제목 세 형태를
> 섞어 쓴다. 항목 헤더에서 판정을 뽑도록 고쳤고, 아래가 바른 수치다.
> 특히 `gg-readings`를 "오류 0건"이라고 보고했으나 실제로는 오류 7 · 편향 4다."""

H2 = """> 2026-09-05. 2차 조사의 **12갈래 259항목**을 같은 방식으로 교차검증했다.
> 2차는 역사 사실보다 접근 경로·라이선스·법령 인용이 많아 검증 항목을 거기에 맞췄다.
> `거짓확인`은 "확인했다"고 적었으나 실제로는 확인되지 않은 것 — 특히 "없음을 확인했다"는 주장이다."""


def main(argv):
    base = os.path.dirname(os.path.abspath(__file__))
    d1 = os.path.join(base, "xcheck", "out")
    d2 = os.path.join(base, "xcheck2", "out")
    io.open("xcheck-round1.md", "w", encoding="utf-8", newline="\n").write(
        build(1, d1, R1_KEYS, R1_TITLES, 154, H1))
    io.open("xcheck-round2.md", "w", encoding="utf-8", newline="\n").write(
        build(2, d2, R2_KEYS, R2_TITLES, 259, H2))
    print("xcheck-round1.md", os.path.getsize("xcheck-round1.md"))
    print("xcheck-round2.md", os.path.getsize("xcheck-round2.md"))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
