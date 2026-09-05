---
type: Claims
chunk: chunk_gwanggaeto_1-03
source: src-gwanggaeto
generated_by: claude-fable-5-1
generated_at: 2026-09-05
status: draft
---

# 1면 3줄 — 忽本 건도와 승천 전승

沸流를 건너 忽本 서쪽 산 위에 도읍을 세웠고(建都), 하늘이 黃龍을 내려 왕을 맞이했으며 왕이 忽本 동쪽 언덕에서
(다음 줄) 용을 타고 승천했다고 말한다.

claim 으로 만들지 않은 것:
- **永樂世位.** 전사본은 建都焉 바로 뒤에 永樂世位 를 이어 적는데 구두점이 없고 다른 판독본과 대조하지 않았다. 무슨 말인지
  확정하지 않고 claim 에서 뺐다.
- **沸流.** 강 이름인지 지역 이름인지 이 줄만으로는 정하지 않았다. 껍데기를 세우지 않았다.
- **忽本 = 卒本.** 삼국사기의 卒本 과 같은 곳이라는 동일시는 이 비문에 없다.

```claims-json
[
  {
    "id": "claim-gwanggaeto-1-03-holbon-mentioned",
    "subject": "place-holbon",
    "predicate": "syj:mentionedIn",
    "object": {
      "kind": "literal",
      "value": "忽本"
    },
    "citesChunk": "chunk_gwanggaeto_1-03",
    "quote": "忽本西城山上，而建都焉",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "같은 줄에 忽本東岡 도 나온다. places.json 에 없는 지명이라 새 껍데기를 세웠다. 삼국사기의 卒本 과의 동일시는 이 비문에 없다."
  },
  {
    "id": "claim-gwanggaeto-1-03-chumo-capital-holbon",
    "subject": "person-chumo",
    "predicate": "syj:establishedCapitalAt",
    "object": {
      "kind": "entity",
      "id": "place-holbon"
    },
    "citesChunk": "chunk_gwanggaeto_1-03",
    "quote": "忽本西城山上，而建都焉",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "建都 의 주어는 1면 1줄부터 이어지는 鄒牟王(이 줄의 王) 이다. 이 줄에 이름이 다시 나오지는 않는다."
  }
]
```
