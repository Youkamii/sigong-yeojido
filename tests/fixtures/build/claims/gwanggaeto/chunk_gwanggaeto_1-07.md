---
type: Claims
chunk: chunk_gwanggaeto_1-07
source: src-gwanggaeto
generated_by: claude
generated_at: 2026-09-05
status: draft
---

# 1면 7줄 영락 5년 비려 정벌 — 빌드 fixture (시간 · 지명)

time 객체(ts-yeongnak-5) · 그 TimeSpan 의 convertsTo · 지명 언급. 원문은 tests/fixtures/chunks.jsonl 의
chunk_gwanggaeto_1-07 이고 quote 는 전부 그 부분 문자열이다.

```claims-json
[
  {
    "id": "claim-gwanggaeto-1-07-yeongnak-5-time",
    "subject": "event-gwanggaeto-yeongnak-5",
    "predicate": "syj:occurredAt",
    "object": {"kind": "time", "id": "ts-yeongnak-5", "verbatim": "永樂五年，歲在乙未", "precision": "year"},
    "citesChunk": "chunk_gwanggaeto_1-07",
    "quote": "永樂五年，歲在乙未",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft"
  },
  {
    "id": "claim-gwanggaeto-1-07-yeongnak-5-converts-395",
    "subject": "ts-yeongnak-5",
    "predicate": "syj:convertsTo",
    "object": {"kind": "year", "value": 395},
    "citesChunk": "chunk_gwanggaeto_1-07",
    "quote": "永樂五年，歲在乙未",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "영락 5년 을미 = 395년. 역법 변환도 Claim 이다 (§8.1)"
  },
  {
    "id": "claim-gwanggaeto-1-07-yeomsu-mentioned",
    "subject": "place-yeomsu",
    "predicate": "syj:mentionedIn",
    "object": {"kind": "literal", "value": "鹽水"},
    "citesChunk": "chunk_gwanggaeto_1-07",
    "quote": "至鹽水",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft"
  }
]
```
