---
type: Claims
chunk: chunk_period96_joseon_rulers_encykorea-taejo-reign
source: src-encykorea-taejo-yiseonggye
generated_by: Claude Opus 5 (workflow, #192)
generated_at: 2026-09-15
status: draft
---

# 같은 인물의 다른 표기 연결 — 표제어 정의

이 사료가 켜졌을 때만 화면이 두 개체를 하나로 보여 준다. 데이터의 개체는 합치지 않는다(docs/02-schema.md §10).

```claims-json
[
  {
    "id": "claim-identity-192-encykorea-taejo-e0059033-wca-taejo",
    "subject": "ent-wca-taejo",
    "predicate": "syj:sameEntityAs",
    "object": {
      "kind": "entity",
      "id": "person-encykorea-taejo-e0059033"
    },
    "citesChunk": "chunk_period96_joseon_rulers_encykorea-taejo-reign",
    "quote": "조선의 제1대(재위: 1392년~1398년) 왕.",
    "fromSource": "src-encykorea-taejo-yiseonggye",
    "origin": "ai",
    "status": "draft",
    "note": "태조실록 표기용 ent-wca-taejo는 1392년 즉위·1335년생·1408년몰로 적혀 있어 인용문이 밝힌 조선 제1대 왕(재위 1392~1398)과 이름·연대가 모두 맞는다. 고려 태조(왕건)가 아니라 조선 태조다. 자동 병합 아님, 표시 병합용. 조사 Claude Opus 5(high) 워크플로, 반증 검증 통과, 확신 high. 자동 병합 아님 — 켜진 사료에 따른 표시 병합용(#192)."
  },
  {
    "id": "claim-identity-192-encykorea-taejo-e0059033-joseon-taejo",
    "subject": "person-joseon-taejo",
    "predicate": "syj:sameEntityAs",
    "object": {
      "kind": "entity",
      "id": "person-encykorea-taejo-e0059033"
    },
    "citesChunk": "chunk_period96_joseon_rulers_encykorea-taejo-reign",
    "quote": "조선의 제1대(재위: 1392년~1398년) 왕.",
    "fromSource": "src-encykorea-taejo-yiseonggye",
    "origin": "ai",
    "status": "draft",
    "note": "person-joseon-taejo도 재위 1392~1398년·생몰 1335~1408년으로 적혀 있어 인용문의 조선 제1대 왕과 동일하다. 두 id 모두 태조실록 즉위 기사의 조선 태조를 가리킨다. 자동 병합 아님, 표시 병합용. 조사 Claude Opus 5(high) 워크플로, 반증 검증 통과, 확신 high. 자동 병합 아님 — 켜진 사료에 따른 표시 병합용(#192)."
  }
]
```
