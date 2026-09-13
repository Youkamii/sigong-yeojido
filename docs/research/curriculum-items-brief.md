# 항목별 근거 조사 지침 — 고등 한국사 항목 목록(#186) → 장면 패킷

목표: `docs/research/curriculum-186/items.merged.json` 의 항목(정리 뒤 약 1,000건) 하나하나를 **근거가 달린 사실·장면**으로 바꿔 3D 지도에 올린다. 형식은 [facts-format.md](facts-format.md)의 `result.json` 을 그대로 쓰고, 검증기 `scripts/check_fact_research.py` 를 통과한 것만 적재한다. 교과서 본문은 어디에도 인용하지 않는다.

## 왜 항목 목록에서 시작하나

앞선 파일럿(#182)은 원문에서 "연도·장소·행위가 붙는 것"을 긁어 403건을 만들었지만 사용자가 "흐름 없는 조각"이라고 평가했다. 이번에는 **무엇을 넣을지**를 교육과정·교과서 항목 목록이 정하고, 조사는 그 항목의 근거를 찾는 일만 한다. 항목에 없는 사실을 새로 만들지 않는다.

## 입력과 출력

- 입력: `items.merged.json` 의 항목. 조사 칸(job)은 시대 파일 하나를 20~25건씩 나눈다(`curriculum-<era>/<era>-<n>`). 약 45칸.
- 출력: `data/research/curriculum-<era>/<job>/result.json` + `run.json` + `manifest.json` + `raw/`(웹 발췌 원문 HTML, sha256). 구조는 facts-format 과 같다: `sources`, `entities`, `claims`, `scenes`, `facts`.
- 항목 1건 = fact 1건 + scene 1건(좌표가 있으면) + claim 3~5건(연도·행위·장소·참여자) + 필요한 entity 껍데기.
- 이미지 프롬프트(#188)는 `images.json` 에 따로 둔다: `[{itemId, sceneId, subjectType, prompt, basis, caveats}]`. `result.json` 에는 넣지 않는다(검증기 형식 유지).

## 근거의 우선순위

1. 로컬 원문 chunk(`data/sources/<src>/chunks.jsonl`, `scripts/search_chunks.py`): 삼국사기·삼국유사·고려사·금석문·집성·민족문화대백과 발췌(`enc-*`, `encykorea-*`)·우리역사넷 항목(`ek-*`, `aks-*`). `citesChunk` + `quote`(chunk 본문의 부분 문자열).
2. 웹 발췌(`citesExcerpt`, 25단어 이내, HTML 원문 저장·sha256): 우리역사넷(contents.history.go.kr 신편 한국사·한국사 연대기·교과서 용어 해설), 한국민족문화대백과(encykorea.aks.ac.kr), 국가유산포털(heritage.go.kr 소재지·지정 내용), 국가기록원·독립기념관 공개 해설. 위키백과는 좌표 보조로만.
3. 금지: db.history.go.kr(조선왕조실록·승정원일기 DB — robots), 교과서 본문·출판사 자료, 블로그.

## 항목 → 사실·장면 대응

| 항목 필드 | 대응 |
|---|---|
| `type` | fact.category: person→`person`, war→`war`, event→행위에 따라 `administration`/`culture`/`foreign`/`war`/`economy`/`settlement`, institution→`administration`, heritage→`facility`(건축·유적) 또는 `culture`(유물·서적), culture→`culture`, economy→`economy`, society→`settlement`, foreign→`foreign`, place→`administration` |
| `sceneType`(+`sceneFunction`) | scene.kind. `portrait`·`heritage` 는 #190 으로 조립기가 받는다. heritage 는 `heritageType`(pagoda·stele·hall·tomb·fortress·site·artifact·bridge·kiln) 필수 |
| `year`/`yearEnd` | scene.startYear/endYear, fact.year·decade, 연도 claim(time object, verbatim 은 근거 발췌 안의 표기) |
| `place` | scene.place(lon/lat, precision site·area·region), fact.placeLabel/modernPlace/coordinateBasis(`sourceId excerptId` 또는 `location claimId`). 문화재는 국가유산포털 소재지. 사건은 도시 중심점이 아니라 **구체 장소**(궁궐·관아·성문·전장·항구·서원)를 찾는다 — 같은 도시 항목이 한 점에 겹치지 않게 |
| `meaning` | fact.what(그대로), scene.summary(한두 문장, 직접 서술) |
| `title`·인물 | portrait: participants[{entityId, role, presence:'on-site'}], entity 는 기존 id(`person-*`)가 있으면 재사용(`/api/entities`·`data/entities/person`), 없으면 `person-hs-<slug>` 껍데기 |
| `curriculum.standard` | fact.note 에 `[10한사1-02-04]` 처럼 남긴다(화면 카드에서 "교육과정" 표시용) |
| `priority` | fact.confidence 와 별개로 `scene.effects.priority` 에 core/standard/extended |
| region | 좌표로 정한다: 위도 ≥ 39 north, 37~39 central(한성·개경·강화 포함 → `capital` 은 도읍 항목만), 35~37 central/south 경계는 경도로(대전 이남 south), 제주·울릉 island, 해외(overseas)는 `north`(만주)·`foreign`(그 밖) |

## 조사 규칙

1. 항목당 근거 2개 이상(핵심은 3개): 연도 근거, 장소 근거, 행위 근거. 근거가 하나도 없는 항목은 `facts` 에 `confidence:'low'` 로만 남기고 장면은 만들지 않는다.
2. 한 칸의 웹 발췌 원문은 `raw/` 에 저장하고 manifest 에 URL·sha256·fetchedUtc·license 를 적는다. 같은 URL 은 한 번만 저장.
3. 장면 좌표는 해당 장면의 `place.claimIds` 에 location claim(lon/lat)이 있거나 `coordinateSourceIds` 의 발췌에 십진 좌표 두 수가 있어야 한다(검증기 규칙).
4. 인물 항목은 대표 활동 연도의 장면 1개(portrait)만 만든다. 그 인물이 다른 항목(사건)에도 나오면 사건 장면의 participants 로 넣고 entityId 를 같게 한다.
5. 문화재 항목은 `persistence {kind:'facility', from:건립/제작 연도, to:현존이면 null, 소실이면 소실 연도}` 를 단다.
6. 교과서 문장을 옮기지 않는다. summary·what 은 조사자가 쓴다.
7. 검증: `python scripts/check_fact_research.py data/research/curriculum-<era> --job <job>` PASS 가 완료 기준. 적대 검수자는 표본 30% 이상을 출처에서 재확인한다.

## 적재 순서

1. `scripts/import_period_research.py --collection curriculum-<era>`(claims·entities·sources 적재, workflow run 확인).
2. `python services/validate.py` → `scripts/build_history_scenes.py` → `scripts/summarize_facts.py` → `scripts/build_fact_layers.py`.
3. 로컬 Fuseki+뷰어로 시대별 캡처(scratchpad `capture_local.py` 계열) → 전부 눈으로 확인 → main 합류 → 사용자 승인 뒤 c2 배포.
4. 이미지(#188)는 `images.json` 의 프롬프트로 Codex 가 생성해 `scripts/ai_images/finalize_image.py` 로 저장하고 `ai-image-map.json` 의 `items` 에 연결한다.

## 순서와 규모

조선 전기(115건, 세종 포함)를 첫 칸으로 돌려 형식·검증·화면을 확인한 뒤 나머지 시대를 병렬로 돌린다. 칸당 조사→적대 검수→수정 3 에이전트(Opus 5 high). 45칸 × 3 = 135 에이전트, 파일럿(45 에이전트 7.6M 토큰) 기준 약 20M 토큰.
