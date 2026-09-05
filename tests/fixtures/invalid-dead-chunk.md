---
type: Claims
chunk: chunk_gwanggaeto_9-99
source: src-gwanggaeto
generated_by: claude
generated_at: 2026-09-05
status: draft
---

# 무효 fixture — 죽은 chunk id

chunk_gwanggaeto_9-99 는 어느 chunks.jsonl 에도 없다. 검사 (b). 기대: dead-chunk 실패.
chunk 가 없으니 quote 비교는 할 수 없고, 그 실패는 따로 나오지 않아야 한다.

```claims-json
[
  {
    "id": "claim-gwanggaeto-9-99-ghost",
    "subject": "chunk_gwanggaeto_9-99",
    "predicate": "syj:readsCharacterAs",
    "object": {"kind": "literal", "value": "海", "position": "渡海"},
    "citesChunk": "chunk_gwanggaeto_9-99",
    "quote": "而倭以辛卯年來渡海破百殘",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "존재하지 않는 대목을 가리킨다"
  }
]
```
