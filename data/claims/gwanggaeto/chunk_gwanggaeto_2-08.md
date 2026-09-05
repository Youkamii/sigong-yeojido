---
type: Claims
chunk: chunk_gwanggaeto_2-08
source: src-gwanggaeto
generated_by: claude-fable-5-1
generated_at: 2026-09-05
status: draft
---

# 2면 8줄 — 영락 10년 경자, 신라 구원

사신을 돌려보내며 계책을 알렸고, 十年 庚子에 보기 5만을 보내 新羅를 구원하게 했으며, 男居城에서 新羅城에 이르니
倭가 그 안에 가득했는데 관군이 이르자 倭賊이 물러났다고 말한다.

claim 으로 만들지 않은 것: 男居城(비정 미정), 倭 의 실체.

```claims-json
[
  {
    "id": "claim-gwanggaeto-2-08-yeongnak-10-time",
    "subject": "event-gwanggaeto-yeongnak-10",
    "predicate": "syj:occurredAt",
    "object": {
      "kind": "time",
      "id": "ts-gwanggaeto-yeongnak-10",
      "verbatim": "十年庚子",
      "precision": "year"
    },
    "citesChunk": "chunk_gwanggaeto_2-08",
    "quote": "十年庚子，教遣步騎五萬，往救新羅",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft"
  },
  {
    "id": "claim-gwanggaeto-2-08-yeongnak-10-converts-400",
    "subject": "ts-gwanggaeto-yeongnak-10",
    "predicate": "syj:convertsTo",
    "object": {
      "kind": "year",
      "value": 400
    },
    "citesChunk": "chunk_gwanggaeto_2-08",
    "quote": "十年庚子",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "비문은 서기 연도를 말하지 않는다. 서기 400년이라는 값은 永樂 원년을 391년(辛卯)으로 놓는 통상 기년과 간지 60년 주기에 의존한 환산이다. 간지와 연도의 대응은 check_claims.py 가 60갑자 산술로 검증한다. 다른 환산이 있으면 별도 convertsTo claim 으로 병존시킨다."
  },
  {
    "id": "claim-gwanggaeto-2-08-silla-capital-mentioned",
    "subject": "place-silla-capital",
    "predicate": "syj:mentionedIn",
    "object": {
      "kind": "literal",
      "value": "新羅城"
    },
    "citesChunk": "chunk_gwanggaeto_2-08",
    "quote": "從男居城至新羅城",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "places.json 의 place-silla-capital(新羅城) 과 같은 id. 경주 비정은 통설이지 비문의 말이 아니다."
  },
  {
    "id": "claim-gwanggaeto-2-08-wa-mentioned",
    "subject": "polity-wa",
    "predicate": "syj:mentionedIn",
    "object": {
      "kind": "literal",
      "value": "倭"
    },
    "citesChunk": "chunk_gwanggaeto_2-08",
    "quote": "倭滿其中",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft"
  }
]
```
