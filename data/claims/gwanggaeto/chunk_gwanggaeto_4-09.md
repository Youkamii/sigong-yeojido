---
type: Claims
chunk: chunk_gwanggaeto_4-09
source: src-gwanggaeto
generated_by: claude-fable-5-1
generated_at: 2026-09-05
status: draft
---

# 4면 9줄 — 수묘인 매매 금지 규정

비문의 마지막 줄. 守墓人은 지금부터 서로 팔아넘길 수 없고, 부유한 자라도 마음대로 살 수 없으며, 어기고 판 자는 형벌에
처하고 산 자는 수묘를 지게 한다는 규정(制)이다.

세 조항을 각각 claim 으로 담았다. claim 으로 만들지 않은 것: 制 의 주체(비문에 이름이 없다 — 비를 세운 왕이라는 보충은 넣지 않았다),
檀買 의 판독(擅買 로 고쳐 읽지 않았다).

```claims-json
[
  {
    "id": "claim-gwanggaeto-4-09-sumyoin-rule-no-resale",
    "subject": "office-sumyoin",
    "predicate": "syj:subjectToRule",
    "object": {
      "kind": "literal",
      "value": "自今以後不得更相轉賣"
    },
    "citesChunk": "chunk_gwanggaeto_4-09",
    "quote": "又制守墓人自今以後不得更相轉賣",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "制(규정)의 주체는 비문에 이름이 없다. 주체를 보충하지 않았다."
  },
  {
    "id": "claim-gwanggaeto-4-09-sumyoin-rule-no-purchase",
    "subject": "office-sumyoin",
    "predicate": "syj:subjectToRule",
    "object": {
      "kind": "literal",
      "value": "雖有富足之者亦不得檀買"
    },
    "citesChunk": "chunk_gwanggaeto_4-09",
    "quote": "雖有富足之者亦不得檀買",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "같은 줄 又制守墓人 규정의 둘째 조항. 檀買 는 전사본 표기 그대로다."
  },
  {
    "id": "claim-gwanggaeto-4-09-sumyoin-rule-penalty",
    "subject": "office-sumyoin",
    "predicate": "syj:subjectToRule",
    "object": {
      "kind": "literal",
      "value": "其有違令賣者刑之買人，制令守墓之"
    },
    "citesChunk": "chunk_gwanggaeto_4-09",
    "quote": "其有違令賣者刑之買人，制令守墓之",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "같은 줄 又制守墓人 규정의 셋째 조항. 파는 자는 刑, 사는 자는 수묘를 지게 한다."
  }
]
```
