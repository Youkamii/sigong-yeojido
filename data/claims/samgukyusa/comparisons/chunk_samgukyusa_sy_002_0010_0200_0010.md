---
type: "Claims"
source: "src-samgukyusa"
chunk: "chunk_samgukyusa_sy_002_0010_0200_0010"
status: "draft"
generated_by: "claude-opus-5"
---

```claims-json
[
  {
    "id": "claim-sabi-transfer-sy-date",
    "subject": "event-sabi-transfer-sy",
    "predicate": "syj:occurredIn",
    "object": {
      "kind": "time",
      "id": "ts-sabi-transfer-sy",
      "verbatim": "百濟聖王二十六年戊午春",
      "precision": "year"
    },
    "fromSource": "src-samgukyusa",
    "citesChunk": "chunk_samgukyusa_sy_002_0010_0200_0010",
    "quote": "按三國史記, “百濟聖王二十六年戊午春, 移都扵泗泚, 國號南扶餘.”",
    "origin": "ai",
    "status": "draft",
    "generatedBy": "claude-opus-5",
    "generatedAt": "2026-09-06",
    "note": "삼국유사가 인용한 삼국사기 문면(二十六年)이 현전 삼국사기 문면(十六年)과 다르다. 전승 과정의 차이인지 판본 차이인지 확정하지 않는다. 이 chunk 는 국편 date.raw 가 인용문의 기년이 아니라 간지 쪽을 따른 사례로 보이며, 날짜 필드를 사실로 박으면 안 되는 근거가 된다. 조사 초안의 추가 문맥: {\"validFromVerbatim\": \"聖王 二十六年 戊午 春\"}"
  },
  {
    "id": "claim-sabi-transfer-sy-quotes-sg",
    "subject": "event-sabi-transfer-sy",
    "predicate": "syj:sameEventAs",
    "object": {
      "kind": "entity",
      "id": "event-sabi-transfer-sg"
    },
    "fromSource": "src-samgukyusa",
    "citesChunk": "chunk_samgukyusa_sy_002_0010_0200_0010",
    "quote": "按三國史記, “百濟聖王二十六年戊午春, 移都扵泗泚, 國號南扶餘.”",
    "origin": "ai",
    "status": "draft",
    "generatedBy": "claude-opus-5",
    "generatedAt": "2026-09-06",
    "note": "按三國史記라는 명시적 출처와 移都·國號南扶餘 문맥을 근거로 연결한다. 十六年/二十六年戊午 차이와 泗沘/泗泚 차이는 고치지 않는다."
  }
]
```
