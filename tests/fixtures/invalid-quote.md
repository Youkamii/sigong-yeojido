---
type: Claims
chunk: chunk_gwanggaeto_1-09
source: src-gwanggaeto
generated_by: claude
generated_at: 2026-09-05
status: draft
---

# 무효 fixture — 원문에 없는 quote

원문은 渡海 인데 이설(每)을 quote 에 밀어 넣었다: 渡每. 글자 하나 차이지만 원문에 없는
문장을 인용한 것이다. 이설은 object 로 담아야지 quote 를 고치면 안 된다. 검사 (c).
기대: quote-mismatch 실패.

```claims-json
[
  {
    "id": "claim-gwanggaeto-1-09-sinmyo-fabricated",
    "subject": "chunk_gwanggaeto_1-09",
    "predicate": "syj:readsCharacterAs",
    "object": {"kind": "literal", "value": "每", "position": "渡海"},
    "citesChunk": "chunk_gwanggaeto_1-09",
    "quote": "倭以辛卯年來渡每破百殘",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "quote 에 이설을 섞었다 — 원문 위조"
  }
]
```
