---
type: Claims
chunk: chunk_gwanggaeto_1-07
source: src-gwanggaeto
generated_by: claude-fable-5-1
generated_at: 2026-09-05
status: draft
---

# 1면 7줄 — 영락 5년 을미, 비려 정벌

永樂五年 乙未에 왕이 碑麗가 그치지 않으므로 몸소 가서 쳤고, 富山·負山을 지나 鹽水에 이르러 부락 육칠백을 깨뜨리고
소·말·양을 헤아릴 수 없이 얻었다고 말한다.

claim 으로 만들지 않은 것: 富山 · 負山(places.json 에 없고 비정 미정), 碑麗 의 실체(거란계 여부), 鹽水 의 위치.

```claims-json
[
  {
    "id": "claim-gwanggaeto-1-07-yeongnak-5-time",
    "subject": "event-gwanggaeto-yeongnak-5",
    "predicate": "syj:occurredAt",
    "object": {
      "kind": "time",
      "id": "ts-gwanggaeto-yeongnak-5",
      "verbatim": "永樂五年，歲在乙未",
      "precision": "year"
    },
    "citesChunk": "chunk_gwanggaeto_1-07",
    "quote": "永樂五年，歲在乙未，王以碑麗不息",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft"
  },
  {
    "id": "claim-gwanggaeto-1-07-yeongnak-5-converts-395",
    "subject": "ts-gwanggaeto-yeongnak-5",
    "predicate": "syj:convertsTo",
    "object": {
      "kind": "year",
      "value": 395
    },
    "citesChunk": "chunk_gwanggaeto_1-07",
    "quote": "永樂五年，歲在乙未",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "비문은 서기 연도를 말하지 않는다. 서기 395년이라는 값은 永樂 원년을 391년(辛卯)으로 놓는 통상 기년과 간지 60년 주기에 의존한 환산이다. 간지와 연도의 대응은 check_claims.py 가 60갑자 산술로 검증한다. 다른 환산이 있으면 별도 convertsTo claim 으로 병존시킨다."
  },
  {
    "id": "claim-gwanggaeto-1-07-biryeo-mentioned",
    "subject": "place-biryeo",
    "predicate": "syj:mentionedIn",
    "object": {
      "kind": "literal",
      "value": "碑麗"
    },
    "citesChunk": "chunk_gwanggaeto_1-07",
    "quote": "王以碑麗不息",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "정벌 대상. places.json 의 place-biryeo 와 같은 id — 위치·실체 모두 비정이 없다."
  },
  {
    "id": "claim-gwanggaeto-1-07-yeomsu-mentioned",
    "subject": "place-yeomsu",
    "predicate": "syj:mentionedIn",
    "object": {
      "kind": "literal",
      "value": "鹽水"
    },
    "citesChunk": "chunk_gwanggaeto_1-07",
    "quote": "至鹽水",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "왕이 이른 곳. places.json 의 place-yeomsu 와 같은 id — 비정이 없다."
  }
]
```
