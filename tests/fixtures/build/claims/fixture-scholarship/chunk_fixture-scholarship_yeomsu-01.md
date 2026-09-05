---
type: Claims
chunk: chunk_fixture-scholarship_yeomsu-01
source: src-fixture-scholarship
generated_by: claude
generated_at: 2026-09-05
status: draft
---

# 테스트용 연구서 — 좌표 Claim · 연도 이설 (가짜 본문)

이 사료는 존재하지 않는다. location 객체가 syj:Location 노드를 가진 Claim 으로 방출되는지, 같은 TimeSpan 을
60년 다르게 읽는 convertsTo 이설이 충돌로 잡히는지 보기 위한 fixture 다. 본문·좌표·연도는 전부 지어낸 값이다.
validFrom/validTo 는 §9.1 (지명은 시대에 따라 다른 곳을 가리킨다).

```claims-json
[
  {
    "id": "claim-fixture-yeomsu-located-siramuren",
    "subject": "place-yeomsu",
    "predicate": "syj:locatedAt",
    "object": {"kind": "location", "lat": 43.5, "lon": 119.5, "precision": "region", "basis": "시라무렌강 상류설 (fixture)"},
    "citesChunk": "chunk_fixture-scholarship_yeomsu-01",
    "quote": "鹽水는 시라무렌강 상류로 본다",
    "fromSource": "src-fixture-scholarship",
    "origin": "human",
    "status": "draft",
    "validFrom": 395,
    "validTo": 395
  },
  {
    "id": "claim-fixture-yeongnak-5-converts-455",
    "subject": "ts-yeongnak-5",
    "predicate": "syj:convertsTo",
    "object": {"kind": "year", "value": 455},
    "citesChunk": "chunk_fixture-scholarship_yeomsu-01",
    "quote": "永樂五年乙未를 455년으로 읽는다",
    "fromSource": "src-fixture-scholarship",
    "origin": "human",
    "status": "draft",
    "note": "fixture — 같은 간지를 60년 뒤로 읽는 이설. 렌즈를 바꾸면 연표가 밀리는지 보는 장치 (§8.1)"
  }
]
```
