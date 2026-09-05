---
type: Claims
chunk: chunk_gwanggaeto_2-07
source: src-gwanggaeto
generated_by: claude-fable-5-1
generated_at: 2026-09-05
status: draft
---

# 2면 7줄 — 왕의 평양 순행과 신라 사신

왕이 平穰으로 내려가 순행하는데 新羅가 사신을 보내 "倭人이 국경에 가득 차 성지를 부수고 奴客을 백성으로 삼으니
왕께 귀의해 명을 청한다" 고 아뢰었고, 태왕이 그 충성을 칭찬했다고 말한다.

claim 으로 만들지 않은 것: 平穰 의 위치(오늘날 평양인지는 갈린다 — places.json 후보 2점), 奴客 이 누구를 가리키는지.

```claims-json
[
  {
    "id": "claim-gwanggaeto-2-07-pyongyang-mentioned",
    "subject": "place-pyongyang",
    "predicate": "syj:mentionedIn",
    "object": {
      "kind": "literal",
      "value": "平穰"
    },
    "citesChunk": "chunk_gwanggaeto_2-07",
    "quote": "王巡下平穰",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "광개토왕대의 平穰 이 오늘날 평양인지는 갈린다(places.json 후보 2점). 비문은 위치를 말하지 않는다."
  },
  {
    "id": "claim-gwanggaeto-2-07-silla-mentioned",
    "subject": "polity-silla",
    "predicate": "syj:mentionedIn",
    "object": {
      "kind": "literal",
      "value": "新羅"
    },
    "citesChunk": "chunk_gwanggaeto_2-07",
    "quote": "而新羅遣使白王云",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft"
  },
  {
    "id": "claim-gwanggaeto-2-07-wa-mentioned",
    "subject": "polity-wa",
    "predicate": "syj:mentionedIn",
    "object": {
      "kind": "literal",
      "value": "倭人"
    },
    "citesChunk": "chunk_gwanggaeto_2-07",
    "quote": "倭人滿其國境",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "신라 사신의 말 안에 나오는 표기(倭人)."
  }
]
```
