---
type: Claims
source: src-samgukyusa
chunk: chunk_samgukyusa_sy_001_0020_0020_0020
status: draft
generated_by: claude-opus-5
---

```claims-json
[
  {
    "id": "claim-gojoseon-gogi-hwanung-dangun-birth",
    "subject": "person-dangun-samgukyusa",
    "predicate": "syj:hasParent",
    "object": {
      "kind": "entity",
      "id": "person-hwanung"
    },
    "fromSource": "src-samgukyusa",
    "citesChunk": "chunk_samgukyusa_sy_001_0020_0020_0020",
    "quote": "熊女者無與爲婚故每於壇樹下呪願有孕. 雄乃假化而㛰之. 孕生子號曰壇君王倹.",
    "origin": "ai",
    "status": "draft",
    "generatedBy": "claude-opus-5",
    "generatedAt": "2026-09-06",
    "note": "삼국유사가 『古記』를 인용한 형태다. 『古記』 자체는 현전하지 않아 대조 불가. 桓𡆮(제석 표기)은 이체자 그대로 두었다. 설화 서술을 계보 사실로 확정하지 않는다. predicate 는 제안이며 Codex 가 hasParent 대신 describedAs 로 낮춰도 무방하다. 조사 초안의 추가 문맥: {\"note\": \"桓雄. 熊女는 이름이 없어 별도 엔티티를 세우지 않았다.\"}"
  },
  {
    "id": "claim-gojoseon-gogi-pyongyang-founding",
    "subject": "polity-gojoseon",
    "predicate": "syj:foundedIn",
    "object": {
      "kind": "time",
      "id": "ts-gojoseon-gogi-pyongyang-founding",
      "verbatim": "唐髙即位五十年庚寅",
      "precision": "unknown"
    },
    "fromSource": "src-samgukyusa",
    "citesChunk": "chunk_samgukyusa_sy_001_0020_0020_0020",
    "quote": "以唐髙即位五十年庚寅, 都平壤城始稱朝鮮. 又移都於白岳山阿斯逹",
    "origin": "ai",
    "status": "draft",
    "generatedBy": "claude-opus-5",
    "generatedAt": "2026-09-06",
    "note": "chunk.date 가 null 이라 국편도 이 기사에 서기 환산값을 붙이지 않았다. 唐髙 표기를 唐堯 로 고치지 않았다. 平壤城·白岳山阿斯逹의 위치를 좌표로 확정하지 않는다. 같은 chunk 안에서 도읍이 두 번 나오므로 locatedAt Claim 을 세울 때 시간 범위를 붙여야 한다(schema §9.1). 조사 초안의 추가 문맥: {\"conversionNote\": \"요(唐堯) 즉위 50년 경인을 서기로 환산하는 값은 사료가 주지 않는다. 삼국유사 카드가 적은 기원전 2333 은 『동국통감』 계통의 후대 관행이며 이 사료의 주장이 아니다.\", \"conversionStatus\": \"not-converted\", \"year\": null}"
  },
  {
    "id": "claim-gojoseon-reign-1500-and-gija",
    "subject": "person-dangun-samgukyusa",
    "predicate": "syj:describedAs",
    "object": {
      "kind": "literal",
      "value": "나라를 다스린 기간 1500년, 그 뒤 周 虎王 기묘년에 箕子가 조선에 봉해졌다는 서술"
    },
    "fromSource": "src-samgukyusa",
    "citesChunk": "chunk_samgukyusa_sy_001_0020_0020_0020",
    "quote": "御國一千五百年. 周虎王即位己卯封箕子於朝鮮",
    "origin": "ai",
    "status": "draft",
    "generatedBy": "claude-opus-5",
    "generatedAt": "2026-09-06",
    "note": "'虎王'은 고려 혜종 이름 武 를 피휘한 표기다(같은 사료의 다른 기사에 국편 교감주가 붙어 있음). 武王 으로 정규화하지 않았다. 1500년·기묘년을 절대연대로 환산하지 않는다. 箕子 관련 서술의 사실성은 학설 대상이다. 여기서는 '삼국유사가 그렇게 적었다'만 주장한다."
  }
]
```
