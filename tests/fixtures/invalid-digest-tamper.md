---
type: Claims
chunk: chunk_gwanggaeto_1-09
source: src-gwanggaeto
generated_by: claude
generated_at: 2026-09-05
status: draft
---

# 무효 fixture — 근거를 달아둔 뒤 주장을 바꿨다

옆의 invalid-digest-tamper.digests.json 은 이 claim 의 object 가 `{"kind": "year", "value": 391}`
이던 때 계산한 digest 를 담고 있다. 이 파일은 value 를 451 로 (2주갑 = 120년) 바꿔 놓았다.
근거(citesChunk · quote)는 그대로인데 주장 내용만 달라졌으니 §7.2 가 막아야 한다.
검사 (e). 기대: digest-mismatch 실패.

```claims-json
[
  {
    "id": "claim-gwanggaeto-1-09-sinmyo-year",
    "subject": "ts-sinmyo-gwanggaeto",
    "predicate": "syj:convertsTo",
    "object": {"kind": "year", "value": 451},
    "citesChunk": "chunk_gwanggaeto_1-09",
    "quote": "辛卯年",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "digests 는 391 로 기록됐다. 파일만 451 로 고쳤다"
  },
  {
    "id": "claim-gwanggaeto-1-09-sinmyo-time",
    "subject": "polity-wa",
    "predicate": "syj:mentionedAt",
    "object": {"kind": "time", "id": "ts-sinmyo-gwanggaeto", "verbatim": "辛卯年", "precision": "year"},
    "citesChunk": "chunk_gwanggaeto_1-09",
    "quote": "辛卯年",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft"
  }
]
```
