---
type: Claims
chunk: chunk_gwanggaeto_3-03
source: src-gwanggaeto
generated_by: claude-fable-5-1
generated_at: 2026-09-05
status: draft
---

# 3면 3줄 — 영락 14년 갑진, 왜의 대방계 침입

十四年 甲辰에 倭가 법도를 어기고 帶方界에 침입했고, (결자) 石城 · 連船 (결자) 왕이 몸소 (결자) 平穰에서
(다음 줄) 맞부딪쳤다고 말한다.

claim 으로 만들지 않은 것: 帶方 의 위치(황해도/요동 — places.json 후보 2점), 石城 의 비정, 결자 자리의 보충.

```claims-json
[
  {
    "id": "claim-gwanggaeto-3-03-yeongnak-14-time",
    "subject": "event-gwanggaeto-yeongnak-14",
    "predicate": "syj:occurredAt",
    "object": {
      "kind": "time",
      "id": "ts-gwanggaeto-yeongnak-14",
      "verbatim": "十四年甲辰",
      "precision": "year"
    },
    "citesChunk": "chunk_gwanggaeto_3-03",
    "quote": "十四年甲辰而倭不軌，侵入帶方界",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft"
  },
  {
    "id": "claim-gwanggaeto-3-03-yeongnak-14-converts-404",
    "subject": "ts-gwanggaeto-yeongnak-14",
    "predicate": "syj:convertsTo",
    "object": {
      "kind": "year",
      "value": 404
    },
    "citesChunk": "chunk_gwanggaeto_3-03",
    "quote": "十四年甲辰",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "비문은 서기 연도를 말하지 않는다. 서기 404년이라는 값은 永樂 원년을 391년(辛卯)으로 놓는 통상 기년과 간지 60년 주기에 의존한 환산이다. 간지와 연도의 대응은 check_claims.py 가 60갑자 산술로 검증한다. 다른 환산이 있으면 별도 convertsTo claim 으로 병존시킨다."
  },
  {
    "id": "claim-gwanggaeto-3-03-daebang-mentioned",
    "subject": "place-daebang",
    "predicate": "syj:mentionedIn",
    "object": {
      "kind": "literal",
      "value": "帶方界"
    },
    "citesChunk": "chunk_gwanggaeto_3-03",
    "quote": "侵入帶方界",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "places.json 의 place-daebang 과 같은 id. 帶方 의 위치는 비문 밖의 논쟁이다."
  },
  {
    "id": "claim-gwanggaeto-3-03-pyongyang-mentioned",
    "subject": "place-pyongyang",
    "predicate": "syj:mentionedIn",
    "object": {
      "kind": "literal",
      "value": "平穰"
    },
    "citesChunk": "chunk_gwanggaeto_3-03",
    "quote": "從平穰",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "왕이 出發한 곳으로 읽히나 앞뒤가 결자다. 2면 7줄의 平穰 과 같은 표기라 같은 엔티티에 걸었다."
  },
  {
    "id": "claim-gwanggaeto-3-03-wa-mentioned",
    "subject": "polity-wa",
    "predicate": "syj:mentionedIn",
    "object": {
      "kind": "literal",
      "value": "倭"
    },
    "citesChunk": "chunk_gwanggaeto_3-03",
    "quote": "而倭不軌",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft"
  }
]
```
