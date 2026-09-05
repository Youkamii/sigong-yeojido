---
type: Claims
chunk: chunk_gwanggaeto_1-01
source: src-gwanggaeto
generated_by: claude-fable-5-1
generated_at: 2026-09-05
status: draft
---

# 1면 1줄 — 시조 추모왕의 출자

비문의 첫 줄. 시조 鄒牟王이 나라의 터를 열었고(創基), 北夫餘에서 나왔으며, 天帝의 아들이고 어머니는 河伯의 딸이며,
알을 깨고 태어났다고 말한다. 뒤쪽 여섯 자는 결자다.

claim 으로 만들지 않은 것:
- **나라 이름.** 비문은 創基한 나라의 이름을 적지 않는다 — 高句麗 라는 글자는 이 줄에 없다. `polity-goguryeo` 에 건
  foundedBy claim 하나만이 본문 글자 밖의 판단(이 비가 고구려 왕실의 비라는 사료 층위)에 기대며, note 에 그 점을 밝혔다.
- **天帝 · 河伯.** 이름이 아니라 신격 호칭이므로 person 껍데기를 세우지 않았다. 부모 서술은 describedAs 한 건으로만 담았다.
- **鄒牟王 = 朱蒙.** 삼국사기의 朱蒙 과 같은 인물이라는 동일시는 이 비문에 없다. 다른 사료가 들어오면 sameEntityAs claim 으로 단다.

```claims-json
[
  {
    "id": "claim-gwanggaeto-1-01-chumo-mentioned",
    "subject": "person-chumo",
    "predicate": "syj:mentionedIn",
    "object": {
      "kind": "literal",
      "value": "鄒牟王"
    },
    "citesChunk": "chunk_gwanggaeto_1-01",
    "quote": "惟昔始祖,鄒牟王之創基也",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "비문이 시조를 부르는 표기. 삼국사기의 朱蒙 과 같은 인물이라는 동일시는 이 비문에 없다."
  },
  {
    "id": "claim-gwanggaeto-1-01-chumo-title-sijo",
    "subject": "person-chumo",
    "predicate": "syj:hasTitle",
    "object": {
      "kind": "literal",
      "value": "始祖"
    },
    "citesChunk": "chunk_gwanggaeto_1-01",
    "quote": "惟昔始祖,鄒牟王之創基也",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft"
  },
  {
    "id": "claim-gwanggaeto-1-01-chumo-from-bukbuyeo",
    "subject": "person-chumo",
    "predicate": "syj:comesFrom",
    "object": {
      "kind": "entity",
      "id": "polity-buk-buyeo"
    },
    "citesChunk": "chunk_gwanggaeto_1-01",
    "quote": "出自北夫餘",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "出自 의 주어는 같은 줄 바로 앞의 鄒牟王 이다."
  },
  {
    "id": "claim-gwanggaeto-1-01-bukbuyeo-mentioned",
    "subject": "polity-buk-buyeo",
    "predicate": "syj:mentionedIn",
    "object": {
      "kind": "literal",
      "value": "北夫餘"
    },
    "citesChunk": "chunk_gwanggaeto_1-01",
    "quote": "出自北夫餘",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft"
  },
  {
    "id": "claim-gwanggaeto-1-01-chumo-parentage",
    "subject": "person-chumo",
    "predicate": "syj:describedAs",
    "object": {
      "kind": "literal",
      "value": "天帝之子,母河伯女郎"
    },
    "citesChunk": "chunk_gwanggaeto_1-01",
    "quote": "天帝之子,母河伯女郎",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "天帝·河伯 은 신격 호칭이라 인물 엔티티로 세우지 않았다. 이어지는 剖卵降出生子(난생) 는 별도 claim 을 두지 않았다."
  },
  {
    "id": "claim-gwanggaeto-1-01-goguryeo-founded-by-chumo",
    "subject": "polity-goguryeo",
    "predicate": "syj:foundedBy",
    "object": {
      "kind": "entity",
      "id": "person-chumo"
    },
    "citesChunk": "chunk_gwanggaeto_1-01",
    "quote": "惟昔始祖,鄒牟王之創基也",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "비문은 創基한 나라의 이름을 쓰지 않는다. 대상을 고구려로 잡은 것은 본문 글자가 아니라 이 비가 고구려 왕실의 비라는 사료 카드 층위에서 온다. 그래서 사람이 확인해야 하는 draft 로 둔다."
  }
]
```
