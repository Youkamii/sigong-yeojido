---
type: Claims
chunk: chunk_gwanggaeto_1-04
source: src-gwanggaeto
generated_by: claude-fable-5-1
generated_at: 2026-09-05
status: draft
---

# 1면 4줄 — 유류왕 계승과 17세손 광개토왕

추모왕이 승천하며 세자 儒留王에게 뒷일을 맡겼고(顧命), 유류왕은 도로써 다스렸으며, (大朱)留王이 기업을 이어받았고,
17세손 國岡上廣開土境平安好太王에 이르렀다고 말한다.

claim 으로 만들지 않은 것:
- **大朱留王.** 전사본이 `大朱，留王` 으로 쉼표를 찍어 이름이 갈라져 있다. 판독본 대조 없이 한 이름으로 합치지 않기 위해
  이 인물은 엔티티도 claim 도 만들지 않았다. 학술 판독본 Source 가 들어오면 그때 단다.
- **17세손의 셈법.** 十七世孫 이 누구로부터 몇 대인지, 삼국사기 왕대(광개토왕 = 19대)와 왜 다른지는 비문 밖의 문제다.
  literal 표기(describedAs)와 기준 인물을 추모왕으로 잡은 relation(descendantOf)을 별개 claim 으로 나눠, 후자만 끄면 표기만 남게 했다.

```claims-json
[
  {
    "id": "claim-gwanggaeto-1-04-yuryu-mentioned",
    "subject": "person-yuryu",
    "predicate": "syj:mentionedIn",
    "object": {
      "kind": "literal",
      "value": "儒留王"
    },
    "citesChunk": "chunk_gwanggaeto_1-04",
    "quote": "顧命世子儒留王",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft"
  },
  {
    "id": "claim-gwanggaeto-1-04-yuryu-title-seja",
    "subject": "person-yuryu",
    "predicate": "syj:hasTitle",
    "object": {
      "kind": "literal",
      "value": "世子"
    },
    "citesChunk": "chunk_gwanggaeto_1-04",
    "quote": "顧命世子儒留王",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft"
  },
  {
    "id": "claim-gwanggaeto-1-04-yuryu-heir-of-chumo",
    "subject": "person-yuryu",
    "predicate": "syj:heirOf",
    "object": {
      "kind": "entity",
      "id": "person-chumo"
    },
    "citesChunk": "chunk_gwanggaeto_1-04",
    "quote": "顧命世子儒留王",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "顧命(유언으로 뒷일을 맡김)의 주체는 앞 줄부터 이어지는 鄒牟王이다. 이 줄에 이름이 다시 나오지는 않는다."
  },
  {
    "id": "claim-gwanggaeto-1-04-gwanggaeto-mentioned",
    "subject": "person-gwanggaeto",
    "predicate": "syj:mentionedIn",
    "object": {
      "kind": "literal",
      "value": "國岡上廣開土境平安好太王"
    },
    "citesChunk": "chunk_gwanggaeto_1-04",
    "quote": "□至十七世孫國岡上廣開土境平安好太王",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "비문에 나오는 왕호의 온전한 형태. 3면 2줄·4면 5줄·4면 8줄은 平安 두 자가 빠진 國岡上廣開土境好太王 으로 적는다."
  },
  {
    "id": "claim-gwanggaeto-1-04-gwanggaeto-17th-generation",
    "subject": "person-gwanggaeto",
    "predicate": "syj:describedAs",
    "object": {
      "kind": "literal",
      "value": "十七世孫"
    },
    "citesChunk": "chunk_gwanggaeto_1-04",
    "quote": "□至十七世孫國岡上廣開土境平安好太王",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "누구로부터 17세손인지 이 줄은 이름을 다시 쓰지 않는다. 표기만 담은 claim."
  },
  {
    "id": "claim-gwanggaeto-1-04-gwanggaeto-descendant-of-chumo",
    "subject": "person-gwanggaeto",
    "predicate": "syj:descendantOf",
    "object": {
      "kind": "entity",
      "id": "person-chumo"
    },
    "citesChunk": "chunk_gwanggaeto_1-04",
    "quote": "□至十七世孫國岡上廣開土境平安好太王",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "十七世孫 의 기준을 1줄의 始祖 鄒牟王 으로 잡은 claim. 기준 인물 이름이 이 줄에 없으므로 literal claim 과 분리했다 — 이 claim 만 끄면 순수 표기만 남는다. 세대 수와 삼국사기 왕대의 차이는 비문 밖의 문제다."
  }
]
```
