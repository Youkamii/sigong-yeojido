---
type: "Claims"
source: "src-samgukyusa"
chunk: "chunk_samgukyusa_sy_002_0010_0200_0020"
status: "draft"
generated_by: "claude-opus-5"
---

```claims-json
[
  {
    "id": "claim-baekje-founding-sy-nambuyeo-date",
    "subject": "event-baekje-founding-sy-nambuyeo",
    "predicate": "syj:occurredIn",
    "object": {
      "kind": "time",
      "id": "ts-baekje-onjo-samgukyusa",
      "verbatim": "漢成帝鴻佳三年",
      "precision": "year"
    },
    "fromSource": "src-samgukyusa",
    "citesChunk": "chunk_samgukyusa_sy_002_0010_0200_0020",
    "quote": "温祚都河南 慰禮城, 以十臣為輔翼國號十濟. 是漢成帝鴻佳三年也.",
    "origin": "ai",
    "status": "draft",
    "generatedBy": "claude-opus-5",
    "generatedAt": "2026-09-06",
    "note": "삼국유사 자신의 독립 주장이 아니라 명시적 인용이다. 그래서 삼국사기와 같은 값이 나오는 것을 '두 사료의 독립 일치'로 보면 안 된다. 글자 차이가 여럿이다: 雛牟王(유사) vs 鄒牟(사기), 鴻佳(유사) vs 鴻嘉(사기), 弥雛忽(유사) vs 彌鄒忽(사기). 정규화하지 않았다. 같은 삼국유사 안의 변한백제 조는 鴻嘉四年 이라 적는다 — 사료 내부 불일치. 조사 초안의 추가 문맥: {\"conversionNote\": \"鴻佳 는 鴻嘉 의 이체/오각으로 보이나 본문 글자를 고치지 않았다. 국편 date.raw 는 -0018.\", \"conversionStatus\": \"candidate\", \"year\": -18}"
  },
  {
    "id": "claim-baekje-founding-sy-nambuyeo-quotes-sg",
    "subject": "event-baekje-founding-sy-nambuyeo",
    "predicate": "syj:sameEventAs",
    "object": {
      "kind": "entity",
      "id": "event-baekje-founding-sg"
    },
    "fromSource": "src-samgukyusa",
    "citesChunk": "chunk_samgukyusa_sy_002_0010_0200_0020",
    "quote": "史本記云. “百濟始祖 温祚, 其父雛牟王, 或云朱蒙.",
    "origin": "ai",
    "status": "draft",
    "generatedBy": "claude-opus-5",
    "generatedAt": "2026-09-06",
    "note": "완료된 Opus 문면 대조 se-baekje-founding-cross-source. 명시적 본기 인용과 온조·십제·홍가 연호 문맥을 근거로 사건을 연결한다. 독립 사료의 일치로 세지 않는다."
  }
]
```
