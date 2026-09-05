---
type: Claims
chunk: chunk_gwanggaeto_1-09
source: src-gwanggaeto
generated_by: claude
generated_at: 2026-09-05
status: draft
---

# 1면 9행 신묘년조 — 유효 fixture (충돌)

같은 (subject, predicate) 에 다른 object 가 둘. 渡海 의 海 를 每 로 읽는 이설이
전사본 편집자 주석(或解作"每"字)으로 남아 있다. 두 주장 다 quote 는 원문 그대로다 —
이설이라고 해서 원문을 고쳐 인용하면 안 된다 (그건 invalid-quote 가 잡는다).
기대: 실패 0 · 충돌 1 (정보) · 경고 0.

```claims-json
[
  {
    "id": "claim-gwanggaeto-1-09-reading-hae",
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
    "id": "claim-gwanggaeto-1-09-reading-mae",
    "subject": "chunk_gwanggaeto_1-09",
    "predicate": "syj:readsCharacterAs",
    "object": {"kind": "literal", "value": "每", "position": "渡海"},
    "citesChunk": "chunk_gwanggaeto_1-09",
    "quote": "而倭以辛卯年來渡海破百殘",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "전사본 편집자 주석의 이설 (editorNotes: 或解作每字)"
  }
]
```
