---
type: Claims
chunk: chunk_gwanggaeto_1-09
source: src-gwanggaeto
generated_by: claude
generated_at: 2026-09-05
status: draft
---

# 1면 9행 신묘년조 — 유효 fixture (기본)

검증기 self-test 용. object kind 를 literal · entity · year 하나씩 쓴다.
quote 는 전부 chunk_gwanggaeto_1-09 원문의 부분 문자열이고, entity 객체(polity-baekje)는
tests/fixtures/entities/ 에 껍데기가 있다. 기대: 실패 0 · 충돌 0 · 경고 0.

```claims-json
[
  {
    "id": "claim-gwanggaeto-1-09-sinmyo-hae",
    "subject": "chunk_gwanggaeto_1-09",
    "predicate": "syj:readsCharacterAs",
    "object": {"kind": "literal", "value": "海", "position": "渡海"},
    "citesChunk": "chunk_gwanggaeto_1-09",
    "quote": "而倭以辛卯年來渡海破百殘",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "전사본 본문의 판독"
  },
  {
    "id": "claim-gwanggaeto-1-09-wa-attacked-baekje",
    "subject": "polity-wa",
    "predicate": "syj:attacked",
    "object": {"kind": "entity", "id": "polity-baekje"},
    "citesChunk": "chunk_gwanggaeto_1-09",
    "quote": "倭以辛卯年來渡海破百殘",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "전사본을 글자 그대로 읽은 해석. 주어 판독 논쟁은 별도 Claim 으로 담는다"
  },
  {
    "id": "claim-gwanggaeto-1-09-yeongnak-6-year",
    "subject": "ts-yeongnak-6",
    "predicate": "syj:convertsTo",
    "object": {"kind": "year", "value": 396},
    "citesChunk": "chunk_gwanggaeto_1-09",
    "quote": "以六年丙申",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "영락 6년 병신 = 396년. 역법 변환도 Claim 이다 (§8.1). self-test 의 변조 대상이 이 value 다"
  }
]
```
