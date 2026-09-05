---
type: Claims
chunk: chunk_gwanggaeto_1-08
source: src-gwanggaeto
generated_by: claude-fable-5-1
generated_at: 2026-09-05
status: draft
---

# 1면 8줄 — 회군 경로와 '백잔·신라는 옛 속민'

수레를 돌려 襄平道를 지나 候城·力城·北豊 쪽으로 동래하며 땅을 둘러보고 사냥하며 돌아왔다는 회군 기사 뒤에,
"百殘·新羅는 옛 속민" 이라는 신묘년조의 앞부분이 시작된다(由來朝貢 은 다음 줄).

claim 으로 만들지 않은 것:
- **누구의 屬民 인지.** 비문은 쓰지 않는다. 비를 세운 쪽의 시점에서 '우리의' 로 읽는 것이 통례이나 그 보충은 넣지 않았다.
- **襄平道 · 候城 · 力城 · 北豊 · 五備.** 요동 방면 지명들. places.json 에 없어 껍데기를 세우지 않았다.
- **百殘 = 百濟.** 비문은 百濟 를 百殘 으로 적는다. 엔티티 id 는 편의상 polity-baekje 로 두되 표기 百殘 은 literal 로 보존했다.

```claims-json
[
  {
    "id": "claim-gwanggaeto-1-08-baekje-mentioned",
    "subject": "polity-baekje",
    "predicate": "syj:mentionedIn",
    "object": {
      "kind": "literal",
      "value": "百殘"
    },
    "citesChunk": "chunk_gwanggaeto_1-08",
    "quote": "百殘新羅舊是屬民",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "비문은 百濟 를 百殘 으로 적는다. 百殘=百濟 동일시는 통설이지만 비문 자체가 말하는 것은 아니다 — 엔티티 id 는 편의상 polity-baekje 로 두고 표기는 그대로 보존한다."
  },
  {
    "id": "claim-gwanggaeto-1-08-silla-mentioned",
    "subject": "polity-silla",
    "predicate": "syj:mentionedIn",
    "object": {
      "kind": "literal",
      "value": "新羅"
    },
    "citesChunk": "chunk_gwanggaeto_1-08",
    "quote": "百殘新羅舊是屬民",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft"
  },
  {
    "id": "claim-gwanggaeto-1-08-baekje-former-subject",
    "subject": "polity-baekje",
    "predicate": "syj:describedAs",
    "object": {
      "kind": "literal",
      "value": "舊是屬民"
    },
    "citesChunk": "chunk_gwanggaeto_1-08",
    "quote": "百殘新羅舊是屬民",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "누구의 屬民 인지 비문은 쓰지 않는다. 그 보충은 claim 에 넣지 않았다."
  },
  {
    "id": "claim-gwanggaeto-1-08-silla-former-subject",
    "subject": "polity-silla",
    "predicate": "syj:describedAs",
    "object": {
      "kind": "literal",
      "value": "舊是屬民"
    },
    "citesChunk": "chunk_gwanggaeto_1-08",
    "quote": "百殘新羅舊是屬民",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "누구의 屬民 인지 비문은 쓰지 않는다. 그 보충은 claim 에 넣지 않았다."
  }
]
```
