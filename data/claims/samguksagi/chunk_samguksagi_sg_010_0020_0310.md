---
type: Claims
source: src-samguksagi
chunk: chunk_samguksagi_sg_010_0020_0310
status: draft
generated_by: claude-opus-5
---

```claims-json
[
  {
    "id": "claim-silla-envoy-bukguk-790",
    "subject": "person-baegeo",
    "predicate": "syj:sentAsEnvoyTo",
    "object": {
      "kind": "entity",
      "id": "polity-bukguk"
    },
    "fromSource": "src-samguksagi",
    "citesChunk": "chunk_samguksagi_sg_010_0020_0310",
    "quote": "三月, 以一吉湌伯魚使北國.",
    "origin": "ai",
    "status": "draft",
    "generatedBy": "claude-opus-5",
    "generatedAt": "2026-09-06",
    "note": "국편이 붙인 기사 제목은 '발해에 사신 백어를 보내고…'이지만 본문 글자는 北國 이다. 北國=渤海 동정은 국편의 판단이며 사료 본문의 주장이 아니다. 이 동정은 별도 sameEntityAs Claim(origin=ai, inferred)으로만 둘 것. 발해 시대 coverage 에 넣었지만 chunk 자체는 신라본기다. 조사 초안의 추가 문맥: {\"note\": \"본문 표기는 北國 이다. 渤海 로 바꾸지 않았다.\"}"
  },
  {
    "id": "claim-facts-ancient-balhae-balhae-790-time",
    "subject": "polity-silla",
    "predicate": "syj:occurredIn",
    "object": {
      "kind": "time",
      "verbatim": "三月",
      "year": 790,
      "precision": "month",
      "earliest": 790,
      "latest": 790,
      "id": "ts-facts-ancient-balhae-balhae-790-time"
    },
    "citesChunk": "chunk_samguksagi_sg_010_0020_0310",
    "quote": "三月, 以一吉湌伯魚使北國.",
    "note": "",
    "fromSource": "src-samguksagi",
    "origin": "ai",
    "status": "draft",
    "generatedBy": "claude-opus-5",
    "generatedAt": "2026-09-13"
  },
  {
    "id": "claim-facts-ancient-balhae-balhae-790",
    "subject": "polity-silla",
    "predicate": "syj:relatedTo",
    "object": {
      "kind": "entity",
      "id": "polity-balhae"
    },
    "citesChunk": "chunk_samguksagi_sg_010_0020_0310",
    "quote": "以一吉湌伯魚使北國",
    "note": "삼국사기 신라본기 원성왕 6년. 北國은 발해를 가리킨다.",
    "fromSource": "src-samguksagi",
    "origin": "ai",
    "status": "draft",
    "generatedBy": "claude-opus-5",
    "generatedAt": "2026-09-13"
  }
]
```
