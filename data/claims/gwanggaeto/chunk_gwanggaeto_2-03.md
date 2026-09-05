---
type: Claims
chunk: chunk_gwanggaeto_2-03
source: src-gwanggaeto
generated_by: claude-fable-5-1
generated_at: 2026-09-05
status: draft
---

# 2면 3줄 — 아리수 도하와 백잔 국성 압박

(성 목록 끝) 其國城에 이르렀는데 적이 굴복하지 않고 나와 싸우자, 왕이 크게 노해 阿利水를 건너 정병을 보내 성을
압박했다고 말한다. 뒤쪽은 결자.

claim 으로 만들지 않은 것: 阿利水 = 한강, 其國城 = 풍납토성 같은 비정(places.json 후보 좌표로만 둔다), 성 목록의 성들.

```claims-json
[
  {
    "id": "claim-gwanggaeto-2-03-arisu-mentioned",
    "subject": "place-arisu",
    "predicate": "syj:mentionedIn",
    "object": {
      "kind": "literal",
      "value": "阿利水"
    },
    "citesChunk": "chunk_gwanggaeto_2-03",
    "quote": "王威赫怒渡阿利水",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "왕이 건넌 강. 한강 비정은 통설이지 비문의 말이 아니다 — 좌표는 places.json 의 후보로만 둔다."
  },
  {
    "id": "claim-gwanggaeto-2-03-baekje-capital-mentioned",
    "subject": "place-hanseong",
    "predicate": "syj:mentionedIn",
    "object": {
      "kind": "literal",
      "value": "其國城"
    },
    "citesChunk": "chunk_gwanggaeto_2-03",
    "quote": "其國城",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "其 는 앞 줄부터 이어지는 정벌 대상 殘國 을 받는다. places.json 의 place-hanseong(百殘國城) 과 같은 id. 이 성이 어디인지는 비문에 없다."
  }
]
```
