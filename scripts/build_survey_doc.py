"""조사 결과 JSON → 저장소 문서(markdown) + 기계용 JSON 생성."""
import io
import json
import os

SRC = r"C:/Users/gkfkd/AppData/Local/Temp/claude/C--Users-gkfkd-Git-Map-of-the-Great-East/b9392d05-46a9-47ee-95d8-776ccbb96f63/tasks/w3hnwl0rt.output"
OUT_MD = "survey-round1.md"
OUT_JSON = "survey-round1.json"

d = json.load(io.open(SRC, encoding="utf-8"))
res = d["result"]
surveys = res["surveys"]
critics = res.get("critics", [])

PHASE_TITLE = {
    "수집경로": "1군 · 원문을 어디서 어떻게 받나",
    "비문심층": "2군 · 광개토왕비 심층",
    "기술": "3군 · 기술 선행사례",
}
KEY_TITLE = {
    "db-history": "국사편찬위원회 한국사데이터베이스",
    "sillok": "조선왕조실록 · 승정원일기",
    "itkc": "한국고전종합DB (한국고전번역원)",
    "encykorea": "한국민족문화대백과사전",
    "epigraph": "금석문 DB",
    "ctext": "중국 고전 원문 (ctext 외)",
    "japan": "일본 사료 원문",
    "wiki": "위키미디어 계열",
    "pubdata": "공공데이터포털 · 공공 API",
    "geo": "역사 지리 · 지도",
    "gg-readings": "광개토왕비 판독본 계보",
    "gg-sinmyo": "신묘년조 해석사",
    "gg-places": "비문 지명 비정 논쟁",
    "gg-crosscheck": "비문 ↔ 타 사료 대조",
    "gg-calendar": "연호 · 간지 · 역법 변환",
    "gg-tomb": "수묘인 기사",
    "tech-onto": "역사 온톨로지 표준 · 선행사례",
    "tech-hanmun": "한문 텍스트 처리 도구",
}
CONF_MARK = {"confirmed": "확인", "probable": "추정", "unverified": "미확인"}

L = []
A = L.append

tot = {"confirmed": 0, "probable": 0, "unverified": 0}
allf = 0
for s in surveys:
    for f in s.get("findings", []):
        allf += 1
        tot[f.get("confidence", "unverified")] = tot.get(f.get("confidence", "unverified"), 0) + 1

A("# 사료 조사 1차 — 원문 소재와 이용조건")
A("")
A("> 2026-09-04 실행. 서브에이전트 18갈래 + 완결성 비평 2 = 20개 병렬 (Opus 5 / effort max).")
A(f"> 발견 {allf}건 — 확인 {tot['confirmed']} / 추정 {tot['probable']} / 미확인 {tot['unverified']}.")
A("> 원본은 `data/research/survey-round1.json`.")
A("")
A("에이전트에게 준 규칙은 하나였다 — **역사를 쓰지 말고 원문이 어디 있는지 찾아와라.**")
A("AI가 요약한 역사 서술은 근거가 아니므로 그래프에 넣지 않는다. 여기 모인 것은")
A("\"사실\"이 아니라 \"사실의 출처와 그 출처에 닿는 방법\"이다.")
A("")
A("`확인` = 에이전트가 실제로 페이지를 열어 본 것. `추정` = 근거 있는 추측. `미확인` = 확인 못 함.")
A("")

# 요약 표
A("## 갈래별 집계")
A("")
A("| 갈래 | 주제 | 발견 | 확인 | 추정 | 미확인 | 미해결 |")
A("|---|---|---:|---:|---:|---:|---:|")
for s in surveys:
    c = {"confirmed": 0, "probable": 0, "unverified": 0}
    for f in s.get("findings", []):
        c[f.get("confidence", "unverified")] = c.get(f.get("confidence", "unverified"), 0) + 1
    A(
        f"| `{s['key']}` | {KEY_TITLE.get(s['key'], s['key'])} | {len(s.get('findings', []))} "
        f"| {c['confirmed']} | {c['probable']} | {c['unverified']} | {len(s.get('unknowns', []))} |"
    )
A("")

# 본문
for phase in ["수집경로", "비문심층", "기술"]:
    A("---")
    A("")
    A(f"# {PHASE_TITLE[phase]}")
    A("")
    for s in surveys:
        if s.get("phase") != phase:
            continue
        A(f"## {KEY_TITLE.get(s['key'], s['key'])}  `{s['key']}`")
        A("")
        for f in s.get("findings", []):
            mark = CONF_MARK.get(f.get("confidence"), "?")
            A(f"### [{mark}] {f.get('title','')}")
            A("")
            what = (f.get("what") or "").strip()
            A(what)
            A("")
            bits = []
            if f.get("url"):
                bits.append(f"- **URL** — {f['url']}")
            if f.get("accessMethod"):
                bits.append(f"- **접근** — {f['accessMethod']}")
            if f.get("license"):
                bits.append(f"- **이용조건** — {f['license']}")
            if bits:
                A("\n".join(bits))
                A("")
            if f.get("note"):
                A(f"> {f['note']}")
                A("")
        unk = s.get("unknowns", [])
        if unk:
            A("**이 갈래가 확인하지 못한 것**")
            A("")
            for u in unk:
                A(f"- {u}")
            A("")
        nxt = s.get("recommendedNext", [])
        if nxt:
            A("**다음에 팔 것**")
            A("")
            for u in nxt:
                A(f"- {u}")
            A("")

# 비평
A("---")
A("")
A("# 완결성 비평")
A("")
A("조사가 끝난 뒤 별도 에이전트 2개가 \"무엇이 빠졌나\"를 판정했다.")
A("")
for i, cr in enumerate(critics, 1):
    if not cr:
        continue
    A(f"## 비평 {i}")
    A("")
    A((cr.get("verdict") or "").strip())
    A("")
    gaps = cr.get("gaps", [])
    if gaps:
        A("### 지적된 구멍")
        A("")
        for g in gaps:
            A(f"#### [{g.get('severity','?')}] {g.get('gap','')}")
            A("")
            A(f"**왜** — {g.get('why','')}")
            A("")
            A(f"**어떻게 메우나** — {g.get('howToFill','')}")
            A("")
    sus = cr.get("suspectFindings", [])
    if sus:
        A("### 의심스러운 발견")
        A("")
        for s2 in sus:
            A(f"- **{s2.get('finding','')}**")
            A(f"  - 의심: {s2.get('doubt','')}")
        A("")

io.open(OUT_MD, "w", encoding="utf-8", newline="\n").write("\n".join(L))
io.open(OUT_JSON, "w", encoding="utf-8", newline="\n").write(
    json.dumps(res, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
)
print("md :", os.path.getsize(OUT_MD), "bytes,", len(L), "lines")
print("json:", os.path.getsize(OUT_JSON), "bytes")
