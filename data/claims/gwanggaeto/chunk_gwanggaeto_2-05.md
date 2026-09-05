---
type: Claims
chunk: chunk_gwanggaeto_2-05
source: src-gwanggaeto
generated_by: claude-fable-5-1
generated_at: 2026-09-05
status: draft
---

# 2면 5줄 — 영락 6년 전과와 영락 8년 무술

(앞 줄에서 이어) 뒤의 순종을 기록하고, 이에 58성 700촌을 얻었으며 殘王의 아우와 대신 열 명을 데리고 돌아왔다고
6년 기사를 맺는다. 이어 八年 戊戌에 偏師를 보내 (다음 줄) 帛慎土谷을 살폈다는 8년 기사가 시작된다.

claim 으로 만들지 않은 것: 殘王弟 · 大臣十人(인물 미상), 8년 기사의 대상(帛慎/肅慎 판독이 갈리는 자리라 다음 줄에서도 엔티티를
세우지 않았다).

```claims-json
[
  {
    "id": "claim-gwanggaeto-2-05-yeongnak-6-outcome-cities",
    "subject": "event-gwanggaeto-yeongnak-6",
    "predicate": "syj:hasOutcome",
    "object": {
      "kind": "literal",
      "value": "得五十八城、村七百"
    },
    "citesChunk": "chunk_gwanggaeto_2-05",
    "quote": "於是得五十八城、村七百",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "6년 정벌 한 건의 전과. 3면 8줄의 총계(凡所攻破城六十四村一千四百) 와는 다른 숫자다."
  },
  {
    "id": "claim-gwanggaeto-2-05-yeongnak-8-time",
    "subject": "event-gwanggaeto-yeongnak-8",
    "predicate": "syj:occurredAt",
    "object": {
      "kind": "time",
      "id": "ts-gwanggaeto-yeongnak-8",
      "verbatim": "八年戊戌",
      "precision": "year"
    },
    "citesChunk": "chunk_gwanggaeto_2-05",
    "quote": "八年戊戌，教遣偏師觀",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "대상 帛慎土谷 은 다음 줄(2면 6줄)에 이어진다."
  },
  {
    "id": "claim-gwanggaeto-2-05-yeongnak-8-converts-398",
    "subject": "ts-gwanggaeto-yeongnak-8",
    "predicate": "syj:convertsTo",
    "object": {
      "kind": "year",
      "value": 398
    },
    "citesChunk": "chunk_gwanggaeto_2-05",
    "quote": "八年戊戌",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "비문은 서기 연도를 말하지 않는다. 서기 398년이라는 값은 永樂 원년을 391년(辛卯)으로 놓는 통상 기년과 간지 60년 주기에 의존한 환산이다. 간지와 연도의 대응은 check_claims.py 가 60갑자 산술로 검증한다. 다른 환산이 있으면 별도 convertsTo claim 으로 병존시킨다."
  }
]
```
