---
type: Claims
source: src-samguksagi
chunk: chunk_samguksagi_sg_023_0020_0010
status: draft
generated_by: claude-opus-5
---

```claims-json
[
  {
    "id": "claim-baekje-onjo-father-samguksagi",
    "subject": "person-onjo",
    "predicate": "syj:hasParent",
    "object": {
      "kind": "entity",
      "id": "person-jumong"
    },
    "fromSource": "src-samguksagi",
    "citesChunk": "chunk_samguksagi_sg_023_0020_0010",
    "quote": "百濟始祖温祚王, 其父鄒牟, 或云朱蒙.",
    "origin": "ai",
    "status": "draft",
    "generatedBy": "claude-opus-5",
    "generatedAt": "2026-09-06",
    "note": "기존 entities.json 의 person-chumo(鄒牟王)는 광개토왕릉비 표기로 만들어진 껍데기다. 여기 鄒牟 와 같은 인물인지는 sameEntityAs Claim 으로 따로 세워야 하며 자동 병합하면 안 된다(schema §10). 삼국유사 남부여 조는 같은 대목을 인용하면서 雛牟王 으로 적는다 — claim-baekje-onjo-samgukyusa 참조. 조사 초안의 추가 문맥: {\"note\": \"본문은 鄒牟 를 앞세우고 或云朱蒙 을 붙인다. 두 표기를 하나로 합치지 않는다.\"}"
  },
  {
    "id": "claim-baekje-founded-hongga3-samguksagi",
    "subject": "polity-baekje",
    "predicate": "syj:foundedIn",
    "object": {
      "kind": "time",
      "id": "ts-baekje-founded-hongga3-samguksagi",
      "verbatim": "前漢 成帝鴻嘉三年",
      "precision": "year"
    },
    "fromSource": "src-samguksagi",
    "citesChunk": "chunk_samguksagi_sg_023_0020_0010",
    "quote": "國號十濟. 是前漢 成帝鴻嘉三年也.",
    "origin": "ai",
    "status": "draft",
    "generatedBy": "claude-opus-5",
    "generatedAt": "2026-09-06",
    "note": "같은 chunk 의 원주(annotation)는 시조를 沸流王 으로 보는 다른 계통을 싣는다 — claim-baekje-biryu-variant 참조. 삼국유사 변한백제 조는 鴻嘉四年甲辰 이라 적는다 — claim-baekje-onjo-hongga4-samgukyusa 참조. 두 값을 합치지 않았다. 국호 十濟 → 百濟 변경은 별도 Claim(claim-baekje-rename). 조사 초안의 추가 문맥: {\"conversionNote\": \"국편 date.raw 가 -0018 이고 본문 연호도 鴻嘉三年 이라 두 값이 맞물린다. 그래도 환산 자체를 Claim 으로 둘 것(schema §8.1).\", \"conversionStatus\": \"candidate\", \"year\": -18}"
  },
  {
    "id": "claim-baekje-rename-and-buyeo-surname",
    "subject": "polity-baekje",
    "predicate": "syj:hasName",
    "object": {
      "kind": "literal",
      "value": "百濟 (十濟 에서 고침). 왕실 성은 扶餘, 세계는 고구려와 함께 扶餘에서 나왔다고 함"
    },
    "fromSource": "src-samguksagi",
    "citesChunk": "chunk_samguksagi_sg_023_0020_0010",
    "quote": "後以來時, 百姓樂從, 攺號百濟. 其世系, 與髙句麗同出扶餘, 故以扶餘爲氏.",
    "origin": "ai",
    "status": "draft",
    "generatedBy": "claude-opus-5",
    "generatedAt": "2026-09-06",
    "note": "국호 변경 연도를 확정하지 않는다. 본문이 시점을 특정하지 않는다. hasName 은 schema §11 의 다중값 술어이므로 十濟/百濟가 함께 있어도 충돌로 세지 않는다. 기존 entities.json 에 polity-buk-buyeo(北夫餘)가 있으나 여기 扶餘 와 같은 대상인지 판정하지 않았다."
  }
]
```
