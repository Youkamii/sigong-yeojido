---
type: Claims
chunk: chunk_gwanggaeto_1-06
source: src-gwanggaeto
generated_by: claude-fable-5-1
generated_at: 2026-09-05
status: draft
---

# 1면 6줄 — 사망, 갑인년 산릉 이장과 입비

하늘이 돌보지 않아 39세에 세상을 떠났고(晏駕棄國), 甲寅年 9월 29일 乙酉에 산릉으로 옮겨 모시고 이에 비를 세워
훈적을 새겨 후세에 전한다고 말한다. 그 뒤 "其辭曰" 로 본문이 시작된다.

시간은 verbatim(甲寅年九月廿九日乙酉)을 그대로 보존한 TimeSpan 으로 담고, 서기 414 환산은 별도 convertsTo claim 으로 뺐다 —
환산의 근거는 비문 안에 없기 때문이다. 날짜 간지 乙酉 는 검증하지 않았다(표기 보존만).

claim 으로 만들지 않은 것: 사망 연도(비문은 나이만 말한다), 비의 위치(좌표는 places.json 이 현존 소재지로 갖고 있다).

```claims-json
[
  {
    "id": "claim-gwanggaeto-1-06-gwanggaeto-died-age",
    "subject": "person-gwanggaeto",
    "predicate": "syj:diedAtAge",
    "object": {
      "kind": "literal",
      "value": "卅有九"
    },
    "citesChunk": "chunk_gwanggaeto_1-06",
    "quote": "卅有九晏駕棄國",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "주어는 1면 4줄 끝에서 이어지는 광개토왕이다(4줄 이후 이름이 다시 나오지 않는다). 사망 연도는 비문에 없고 나이만 있다."
  },
  {
    "id": "claim-gwanggaeto-1-06-stele-erected-time",
    "subject": "event-gwanggaeto-stele-erected",
    "predicate": "syj:occurredAt",
    "object": {
      "kind": "time",
      "id": "ts-gwanggaeto-gapin-9-29",
      "verbatim": "甲寅年九月廿九日乙酉",
      "precision": "day"
    },
    "citesChunk": "chunk_gwanggaeto_1-06",
    "quote": "以甲寅年九月廿九日乙酉遷就山陵於是立碑銘記勳績",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "遷就山陵(산릉으로 옮김)과 立碑 가 한 문장에 있어 한 event 로 묶었다. 날짜 간지 乙酉 는 검증하지 않고 표기대로 보존한다."
  },
  {
    "id": "claim-gwanggaeto-1-06-gapin-converts-414",
    "subject": "ts-gwanggaeto-gapin-9-29",
    "predicate": "syj:convertsTo",
    "object": {
      "kind": "year",
      "value": 414
    },
    "citesChunk": "chunk_gwanggaeto_1-06",
    "quote": "以甲寅年九月廿九日乙酉",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "비문은 서기 연도를 말하지 않는다. 서기 414년이라는 값은 永樂五年=乙未 를 395년으로 놓는 통상 기년과 간지 60년 주기에 의존한 환산이다(비문 내부 산술로는 甲寅 = 永樂 廿四年 상당). 현대 연구서 Source 가 들어오면 그쪽 convertsTo 와 병존시킨다."
  },
  {
    "id": "claim-gwanggaeto-1-06-stele-self-mention",
    "subject": "place-gwanggaeto-stele",
    "predicate": "syj:mentionedIn",
    "object": {
      "kind": "literal",
      "value": "碑",
      "position": "立碑"
    },
    "citesChunk": "chunk_gwanggaeto_1-06",
    "quote": "於是立碑銘記勳績",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "비가 자기 자신을 가리키는 자리. 立碑 의 목적(銘記勳績, 以永後世)이 이어진다."
  }
]
```
