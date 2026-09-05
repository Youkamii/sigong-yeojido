---
type: Claims
chunk: chunk_gwanggaeto_3-06
source: src-gwanggaeto
generated_by: claude-fable-5-1
generated_at: 2026-09-05
status: draft
---

# 3면 6줄 — 영락 20년 경술, 동부여 정벌

廿年 庚戌에 東夫餘가 — 옛날 鄒牟王의 속민이었는데 — 배반하고 조공하지 않으므로 왕이 몸소 가서 쳤고, 군대가
餘城에 이르자 (결자) 했다고 말한다.

claim 으로 만들지 않은 것: 東夫餘 의 위치(두만강/송화강 — places.json 후보 2점), 餘城 의 비정.

```claims-json
[
  {
    "id": "claim-gwanggaeto-3-06-yeongnak-20-time",
    "subject": "event-gwanggaeto-yeongnak-20",
    "predicate": "syj:occurredAt",
    "object": {
      "kind": "time",
      "id": "ts-gwanggaeto-yeongnak-20",
      "verbatim": "廿年庚戌",
      "precision": "year"
    },
    "citesChunk": "chunk_gwanggaeto_3-06",
    "quote": "廿年庚戌，東夫餘舊是鄒牟王屬民中叛不貢，王躬率往討",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft"
  },
  {
    "id": "claim-gwanggaeto-3-06-yeongnak-20-converts-410",
    "subject": "ts-gwanggaeto-yeongnak-20",
    "predicate": "syj:convertsTo",
    "object": {
      "kind": "year",
      "value": 410
    },
    "citesChunk": "chunk_gwanggaeto_3-06",
    "quote": "廿年庚戌",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "비문은 서기 연도를 말하지 않는다. 서기 410년이라는 값은 永樂 원년을 391년(辛卯)으로 놓는 통상 기년과 간지 60년 주기에 의존한 환산이다. 간지와 연도의 대응은 check_claims.py 가 60갑자 산술로 검증한다. 다른 환산이 있으면 별도 convertsTo claim 으로 병존시킨다."
  },
  {
    "id": "claim-gwanggaeto-3-06-dongbuyeo-mentioned",
    "subject": "place-dongbuyeo",
    "predicate": "syj:mentionedIn",
    "object": {
      "kind": "literal",
      "value": "東夫餘"
    },
    "citesChunk": "chunk_gwanggaeto_3-06",
    "quote": "東夫餘舊是鄒牟王屬民",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "places.json 의 place-dongbuyeo 와 같은 id. 위치 비정은 갈린다."
  },
  {
    "id": "claim-gwanggaeto-3-06-dongbuyeo-former-subject",
    "subject": "place-dongbuyeo",
    "predicate": "syj:describedAs",
    "object": {
      "kind": "literal",
      "value": "舊是鄒牟王屬民"
    },
    "citesChunk": "chunk_gwanggaeto_3-06",
    "quote": "東夫餘舊是鄒牟王屬民",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "1면 8줄의 百殘新羅舊是屬民 과 달리 여기서는 누구의 屬民 인지(鄒牟王) 비문이 직접 쓴다."
  }
]
```
