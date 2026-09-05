---
type: Claims
chunk: chunk_gwanggaeto_1-09
source: src-gwanggaeto
generated_by: claude-fable-5-1
generated_at: 2026-09-05
status: draft
---

# 1면 9줄 — 신묘년조와 영락 6년 병신 백잔 정벌

(앞 줄에서 이어) 由來朝貢, 그런데 倭가 辛卯年에 와서 바다를 건너(渡海) 百殘을 깨고 □□新羅를 신민으로 삼았다 —
이것이 신묘년조다. 이어 六年 丙申에 왕이 몸소 수군을 이끌고 殘國을 쳤고, 그 뒤로 빼앗은 성 목록이 길게 이어진다.

**판독이 갈리는 글자는 각각 별도 claim 이다.** 전사본 본문은 渡海 의 海 로 적고, 같은 자리에 편집자 주석
(editorNotes: 或解作"每"字)이 每 로 읽는 설을 병기한다. 둘 다 이 chunk 를 인용하되 note 로 어느 쪽이 본문이고 어느 쪽이
주석인지 밝혔다. 두 claim 은 같은 subject·predicate·position 을 다투므로 빌드가 Conflict 로 잡아야 한다.

claim 으로 만들지 않은 것 (원문에 없는 해석):
- **문장의 주어.** 倭가 주어인지(왜 주어설) 고구려가 주어인지(고구려 주어설), 渡海 의 주체가 누구인지는 원문 글자에 없다.
  이런 해석은 현대 연구서 Source 가 들어와야 그 Source 의 claim 으로 달 수 있다. 여기서는 만들지 않았다.
- **□□ 자리.** 新羅 앞의 두 결자를 무엇으로 메울지(東□ 등)는 판독본의 문제라 넣지 않았다.
- **성 목록.** 壹八城 이하 성 이름 하나하나는 place 껍데기를 세우지 않았다 — 비정이 대부분 미정이고 판독도 갈린다.
- **討科殘國 의 科.** 전사본 표기 그대로 인용했다(伐 로 고쳐 읽지 않았다).
- **신묘년 event 의 내용.** event-gwanggaeto-sinmyo 는 '신묘년 기사' 라는 대목 자체이지 '왜의 도해' 가 아니다.

```claims-json
[
  {
    "id": "claim-gwanggaeto-1-09-sinmyo-hae",
    "subject": "chunk_gwanggaeto_1-09",
    "predicate": "syj:readsCharacterAs",
    "object": {
      "kind": "literal",
      "value": "海",
      "position": "渡海"
    },
    "citesChunk": "chunk_gwanggaeto_1-09",
    "quote": "而倭以辛卯年來渡海破百殘",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "전사본 본문의 판독. 위키문헌 전사본이 본문 자리에 채택한 글자다. 어느 판독본을 따랐는지는 전사본에 밝혀져 있지 않다."
  },
  {
    "id": "claim-gwanggaeto-1-09-sinmyo-mae",
    "subject": "chunk_gwanggaeto_1-09",
    "predicate": "syj:readsCharacterAs",
    "object": {
      "kind": "literal",
      "value": "每",
      "position": "渡海"
    },
    "citesChunk": "chunk_gwanggaeto_1-09",
    "quote": "而倭以辛卯年來渡海破百殘",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "전사본의 편집자 주석(editorNotes: 或解作\"每\"字). 본문이 아니라 괄호 안에 병기된 이설이며, 누구의 판독인지 주석은 밝히지 않는다. 본문 판독 海 와 같은 자리를 다투므로 빌드가 Conflict 로 잡아야 한다."
  },
  {
    "id": "claim-gwanggaeto-1-09-sinmyo-time",
    "subject": "event-gwanggaeto-sinmyo",
    "predicate": "syj:occurredAt",
    "object": {
      "kind": "time",
      "id": "ts-gwanggaeto-sinmyo",
      "verbatim": "辛卯年",
      "precision": "year"
    },
    "citesChunk": "chunk_gwanggaeto_1-09",
    "quote": "而倭以辛卯年來渡海破百殘",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "이 event 는 '신묘년 기사' 라는 대목 자체다. 문장의 주어가 倭 인지 고구려인지, 누가 무엇을 했는지는 원문에 없는 해석이므로 claim 으로 만들지 않았다."
  },
  {
    "id": "claim-gwanggaeto-1-09-sinmyo-converts-391",
    "subject": "ts-gwanggaeto-sinmyo",
    "predicate": "syj:convertsTo",
    "object": {
      "kind": "year",
      "value": 391
    },
    "citesChunk": "chunk_gwanggaeto_1-09",
    "quote": "辛卯年",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "비문 내부 산술로 辛卯 는 永樂五年=乙未 의 4년 전, 곧 永樂 원년에 해당한다. 서기 391 은 그 원년을 391 로 놓는 통상 기년에 의존한다. 다른 환산이 있으면 별도 claim 으로 병존시킨다."
  },
  {
    "id": "claim-gwanggaeto-1-09-wa-mentioned",
    "subject": "polity-wa",
    "predicate": "syj:mentionedIn",
    "object": {
      "kind": "literal",
      "value": "倭"
    },
    "citesChunk": "chunk_gwanggaeto_1-09",
    "quote": "而倭以辛卯年來渡海破百殘",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "倭 가 무엇을 가리키는지(열도의 세력인지 다른 무엇인지)는 비문에 없다."
  },
  {
    "id": "claim-gwanggaeto-1-09-baekje-mentioned",
    "subject": "polity-baekje",
    "predicate": "syj:mentionedIn",
    "object": {
      "kind": "literal",
      "value": "百殘"
    },
    "citesChunk": "chunk_gwanggaeto_1-09",
    "quote": "而倭以辛卯年來渡海破百殘",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "같은 줄의 討科殘國 은 殘國 으로 줄여 부른다."
  },
  {
    "id": "claim-gwanggaeto-1-09-silla-mentioned",
    "subject": "polity-silla",
    "predicate": "syj:mentionedIn",
    "object": {
      "kind": "literal",
      "value": "新羅"
    },
    "citesChunk": "chunk_gwanggaeto_1-09",
    "quote": "□□新羅以為臣民",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "新羅 앞 두 자는 결자다. 무엇으로 메울지는 넣지 않았다."
  },
  {
    "id": "claim-gwanggaeto-1-09-yeongnak-6-time",
    "subject": "event-gwanggaeto-yeongnak-6",
    "predicate": "syj:occurredAt",
    "object": {
      "kind": "time",
      "id": "ts-gwanggaeto-yeongnak-6",
      "verbatim": "六年丙申",
      "precision": "year"
    },
    "citesChunk": "chunk_gwanggaeto_1-09",
    "quote": "以六年丙申，王躬率水軍討科殘國",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "永樂 두 자는 이 줄에 없고 앞 기사(五年)의 연호가 이어지는 것으로 읽는다. verbatim 은 글자 그대로 六年丙申 만 보존한다."
  },
  {
    "id": "claim-gwanggaeto-1-09-yeongnak-6-converts-396",
    "subject": "ts-gwanggaeto-yeongnak-6",
    "predicate": "syj:convertsTo",
    "object": {
      "kind": "year",
      "value": 396
    },
    "citesChunk": "chunk_gwanggaeto_1-09",
    "quote": "以六年丙申",
    "fromSource": "src-gwanggaeto",
    "origin": "ai",
    "status": "draft",
    "note": "비문은 서기 연도를 말하지 않는다. 서기 396년이라는 값은 永樂 원년을 391년(辛卯)으로 놓는 통상 기년과 간지 60년 주기에 의존한 환산이다. 간지와 연도의 대응은 check_claims.py 가 60갑자 산술로 검증한다. 다른 환산이 있으면 별도 convertsTo claim 으로 병존시킨다."
  }
]
```
