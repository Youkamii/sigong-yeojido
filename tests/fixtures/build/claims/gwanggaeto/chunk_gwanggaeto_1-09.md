---
type: Claims
chunk: chunk_gwanggaeto_1-09
source: src-gwanggaeto
generated_by: claude
generated_at: 2026-09-05
status: draft
---

# 1면 9행 신묘년조 — 빌드 fixture (literal 충돌 · entity)

渡海 의 海 를 每 로 읽는 이설이 전사본 편집자 주석(或解作"每"字)으로 남아 있다 — 같은 (subject, predicate) 에
다른 object 둘, 충돌 하나. entity 객체(polity-baekje)는 tests/fixtures/entities/ 에 껍데기가 있다.

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
  }
]
```
