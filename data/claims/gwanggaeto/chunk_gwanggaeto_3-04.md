---
type: Claims
chunk: chunk_gwanggaeto_3-04
source: src-gwanggaeto
generated_by: claude-fable-5-1
generated_at: 2026-09-05
status: draft
---

# 3면 4줄 — 14년 기사의 결과와 영락 17년 정미

(14년 기사 이어) 선봉이 맞부딪쳐 왕의 군대가 요격해 倭寇가 궤멸하고 참살이 무수했다고 한 뒤, 十七年 丁未에
보기 5만을 보냈다(대상은 결자 …城)고 말한다.

claim 으로 만들지 않은 것: 17년 정벌의 대상(결자라 추정해 넣지 않았다).

```claims-json
[
  {
    "id": "claim-gwanggaeto-3-04-yeongnak-14-outcome",
    "subject": "event-gwanggaeto-yeongnak-14",
    "predicate": "syj:hasOutcome",
    "object": {
      "kind": "literal",
      "value": "倭寇潰敗，斬殺無數"
    },
    "citesChunk": "chunk_gwanggaeto_3-04",
    "quote": "倭寇潰敗，斬殺無數",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft"
  },
  {
    "id": "claim-gwanggaeto-3-04-yeongnak-17-time",
    "subject": "event-gwanggaeto-yeongnak-17",
    "predicate": "syj:occurredAt",
    "object": {
      "kind": "time",
      "id": "ts-gwanggaeto-yeongnak-17",
      "verbatim": "十七年丁未",
      "precision": "year"
    },
    "citesChunk": "chunk_gwanggaeto_3-04",
    "quote": "十七年丁未，教遣步騎五萬",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "정벌 대상은 결자(□□□□□□□□□城)라 알 수 없다. 대상을 추정해 넣지 않았다."
  },
  {
    "id": "claim-gwanggaeto-3-04-yeongnak-17-converts-407",
    "subject": "ts-gwanggaeto-yeongnak-17",
    "predicate": "syj:convertsTo",
    "object": {
      "kind": "year",
      "value": 407
    },
    "citesChunk": "chunk_gwanggaeto_3-04",
    "quote": "十七年丁未",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "비문은 서기 연도를 말하지 않는다. 서기 407년이라는 값은 永樂 원년을 391년(辛卯)으로 놓는 통상 기년과 간지 60년 주기에 의존한 환산이다. 간지와 연도의 대응은 check_claims.py 가 60갑자 산술로 검증한다. 다른 환산이 있으면 별도 convertsTo claim 으로 병존시킨다."
  }
]
```
