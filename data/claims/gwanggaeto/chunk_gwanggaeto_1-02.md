---
type: Claims
chunk: chunk_gwanggaeto_1-02
source: src-gwanggaeto
generated_by: claude-fable-5-1
generated_at: 2026-09-05
status: draft
---

# 1면 2줄 — 남하와 奄利大水 도하 전승

수레를 돌려 남으로 내려와 夫餘의 奄利大水를 지나는 길에, 왕이 나루에서 자기가 皇天의 아들이고 어머니가 河伯의 딸인
鄒牟王이라 밝히고 갈대와 거북이 다리를 놓았다는 전승이다.

claim 으로 만들지 않은 것: 夫餘 · 奄利大水 · 連葭浮龜 전승. 奄利大水 는 places.json 에 없고 비정이 없어 place 껍데기를
세우지 않았다(필요하면 mentionedIn 으로 추가한다). 갈대·거북 서술은 사건이 아니라 전승 묘사라 그대로 두었다.

```claims-json
[
  {
    "id": "claim-gwanggaeto-1-02-chumo-self-declaration",
    "subject": "person-chumo",
    "predicate": "syj:describedAs",
    "object": {
      "kind": "literal",
      "value": "我是皇天之子，母河伯女郎，鄒牟王"
    },
    "citesChunk": "chunk_gwanggaeto_1-02",
    "quote": "我是皇天之子，母河伯女郎，鄒牟王",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "왕이 나루에서 스스로를 밝힌 말로 적혀 있다. 1줄의 天帝之子 와 짝이 되는 표현(皇天/天帝)."
  }
]
```
