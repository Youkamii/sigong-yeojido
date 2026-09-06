---
type: Claims
chunk: chunk_encykorea_E0013538-01
source: src-encykorea-dangun
generated_by: Codex
generated_at: 2026-09-06
status: draft
---

# 단군의 두 문헌 표기를 연결하는 주장

백과의 인물 설명을 근거로 삼국유사의 壇君과 제왕운기 계통의 檀君을 연결한다.
두 엔티티를 합치지 않으며, 이 사료를 켰을 때만 해당 주장을 보여 준다.
어느 글자가 원형인지, 고조선의 위치·연대가 무엇인지는 판단하지 않는다.

```claims-json
[
  {
    "id": "claim-identity-dangun-orthographic",
    "subject": "person-dangun-samgukyusa",
    "predicate": "syj:sameEntityAs",
    "object": {"kind": "entity", "id": "person-dangun"},
    "citesChunk": "chunk_encykorea_E0013538-01",
    "quote": "『삼국유사』에서는 ‘제단 단(壇)’자로 단군을 기록하고 있고 『제왕운기』에서는 ‘박달나무 단(檀)’자를 사용하여",
    "fromSource": "src-encykorea-dangun",
    "origin": "ai",
    "status": "draft",
    "note": "이 인물의 문헌별 표기 연결에 한정한다. 글자의 원형·생몰년·강역을 정하거나 엔티티를 자동 병합하지 않는다. 조사 Claude Opus 5 Max, 원문 대조·통합 Codex."
  }
]
```
