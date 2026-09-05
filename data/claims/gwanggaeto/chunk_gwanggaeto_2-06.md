---
type: Claims
chunk: chunk_gwanggaeto_2-06
source: src-gwanggaeto
generated_by: claude-fable-5-1
generated_at: 2026-09-05
status: draft
---

# 2면 6줄 — 영락 9년 기해, 백잔이 왜와 화통

(8년 기사 이어) 帛慎土谷을 살피고 莫新羅城·加太羅谷의 남녀 삼백여 명을 잡아왔으며 이후 조공하고 논사했다고 한 뒤,
九年 己亥에 百殘이 맹세를 어기고 倭와 화통했다(通 은 다음 줄)고 말한다.

claim 으로 만들지 않은 것: 帛慎土谷(帛慎/肅慎 판독이 갈린다), 莫新羅城 · 加太羅谷(비정 미정).

```claims-json
[
  {
    "id": "claim-gwanggaeto-2-06-yeongnak-9-time",
    "subject": "event-gwanggaeto-yeongnak-9",
    "predicate": "syj:occurredAt",
    "object": {
      "kind": "time",
      "id": "ts-gwanggaeto-yeongnak-9",
      "verbatim": "九年己亥",
      "precision": "year"
    },
    "citesChunk": "chunk_gwanggaeto_2-06",
    "quote": "九年己亥，百殘違誓與倭和",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "和通 의 通 은 다음 줄 첫 글자다."
  },
  {
    "id": "claim-gwanggaeto-2-06-yeongnak-9-converts-399",
    "subject": "ts-gwanggaeto-yeongnak-9",
    "predicate": "syj:convertsTo",
    "object": {
      "kind": "year",
      "value": 399
    },
    "citesChunk": "chunk_gwanggaeto_2-06",
    "quote": "九年己亥",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "비문은 서기 연도를 말하지 않는다. 서기 399년이라는 값은 永樂 원년을 391년(辛卯)으로 놓는 통상 기년과 간지 60년 주기에 의존한 환산이다. 간지와 연도의 대응은 check_claims.py 가 60갑자 산술로 검증한다. 다른 환산이 있으면 별도 convertsTo claim 으로 병존시킨다."
  },
  {
    "id": "claim-gwanggaeto-2-06-wa-mentioned",
    "subject": "polity-wa",
    "predicate": "syj:mentionedIn",
    "object": {
      "kind": "literal",
      "value": "倭"
    },
    "citesChunk": "chunk_gwanggaeto_2-06",
    "quote": "百殘違誓與倭和",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft"
  },
  {
    "id": "claim-gwanggaeto-2-06-baekje-mentioned",
    "subject": "polity-baekje",
    "predicate": "syj:mentionedIn",
    "object": {
      "kind": "literal",
      "value": "百殘"
    },
    "citesChunk": "chunk_gwanggaeto_2-06",
    "quote": "百殘違誓與倭和",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "百殘 표기. 百殘=百濟 동일시에 대한 note 는 1면 8줄 claim 참조."
  }
]
```
