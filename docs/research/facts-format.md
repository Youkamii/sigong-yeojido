# 사실 조사 결과 형식 (facts collection) — 공용 스펙

조사 작업 폴더 `data/research/<collection>/<job>/` 에 아래 파일이 있다. `<collection>` 예: `facts-ancient`, `<job>` 예: `goguryeo_early`.

| 파일 | 필수 | 내용 |
|---|---|---|
| `result.json` | 예 | 아래 구조 |
| `run.json` | 예 | `{"task":"<job>","runner":"workflow","modelRequested":"claude-opus-5","effort":"high","modelsObserved":["claude-opus-5"],"started":<epoch 초>,"exitCode":0,"isError":false,"sessionId":"<문자열>"}` — 기존 `claude -p` 실행의 run.json 과 같은 키를 쓰되 runner 가 `workflow` 이면 effort 는 `high` 또는 `max` 를 허용한다 |
| `manifest.json` | 예 | 웹에서 내려받은 원본 목록 배열. 내려받은 것이 없으면 `[]`. 항목: `{url,fetchedUtc,httpStatus,byteLength,sha256,rawFile}` |
| `raw/*.html` | 웹 출처가 있을 때 | 원본 바이트. sha256 이 manifest·sources 와 일치 |
| `report.md` | 선택 | 조사원의 자유 보고 |

## result.json

```json
{
  "collection": "facts-ancient",
  "job": "goguryeo_early",
  "cell": {"polity": "고구려", "from": -37, "to": 300, "regions": ["north"], "categories": {"settlement": 5, "administration": 5, "facility": 3, "economy": 3, "disaster": 2, "culture": 2}},
  "sources": [ ...웹 출처(기존 형식)... ],
  "entities": [ {"id": "place-guknaeseong", "type": "Place", "label": "국내성"} ],
  "claims": [ ...아래... ],
  "scenes": [ ...아래... ],
  "facts": [ ...아래... ],
  "missing": [ {"id": "miss-1", "topic": "...", "detail": "...", "neededSource": "..."} ]
}
```

### sources[] (웹 출처만, 기존 import_period_research 형식 그대로)

`{id, title, publisher, url, rawFile, sha256, httpStatus, byteLength, fetchedUtc, license, excerpts:[{id, text, locator}]}`.
제약: 출처당 발췌 단어 합계 25 이하, 각 `text` 는 raw HTML 의 텍스트에 그대로 존재. 허용 출처: 한국민족문화대백과(encykorea.aks.ac.kr, 짧은 인용), 위키백과 ko/en (좌표·표시용), 국가유산포털(heritage.go.kr), 국립중앙박물관·국립문화유산연구원 해설, 공공누리 표시가 있는 기관 페이지. **db.history.go.kr 은 robots 로 수집 금지** — 원문은 로컬 chunk 로만 인용한다.

### claims[]

```json
{"id": "claim-gg-guknae-move-3", "subject": "polity-goguryeo", "predicate": "syj:capitalMovedTo",
 "object": {"kind": "entity", "id": "place-guknaeseong"},
 "sourceId": "src-samguksagi", "citesChunk": "chunk_samguksagi_sg_013_0020_0230",
 "quote": "移都於國內", "note": "유리명왕 22년(서기 3) 국내성 천도"}
```

근거는 둘 중 하나다.

- **로컬 원문**: `sourceId` + `citesChunk` + `quote`. `quote` 는 그 chunk `text` 의 부분 문자열(모든 공백 제거 후 비교)이고 `sourceId` 는 chunk 의 `sourceId` 와 같다. chunk 에 `date.raw` 가 있으면 시간 주장의 `year`/`earliest`/`latest` 는 `date.raw` 앞 4자리(부호 포함) 서기연과 같아야 한다.
- **웹 발췌**: `sourceId` + `citesExcerpt` (기존 규칙: verbatim 이 발췌 안에, 연도 숫자가 발췌 안에).

object.kind: `year | time | entity | literal | location`. time: `{kind:'time', verbatim, year, precision('year'|'month'|'day'|'decade'|'century'), earliest, latest}` — 원문 인용이면 verbatim 은 chunk text 와 quote 양쪽에 있어야 한다. location: `{kind:'location', lat, lon, precision('site'|'area'|'region')}`. literal: `{kind:'literal', value, unit?}`.

predicate 허용 목록(검증기가 파일 `scripts/fact_predicates.json` 로 읽는다, 확장 가능):
`syj:occurredIn`(time) · `syj:tookPlaceAt`(entity|location) · `syj:locatedAt`(location, validFrom/validTo 선택) · `syj:foundedIn` · `syj:establishedIn` · `syj:endedIn` · `syj:builtIn` · `syj:destroyedIn` · `syj:capitalMovedTo`(entity) · `syj:capitalOf`(entity) · `syj:administeredAs`(literal: 州·郡·縣·京·小京 등 원문 표기) · `syj:householdCount`(literal 수, unit '戶') · `syj:populationCount`(literal 수, unit '口') · `syj:participatedIn`(entity) · `syj:reignedFrom`/`syj:reignedTo`(time) · `syj:producedAt`(entity: 가마·제철·시장) · `syj:routeConnects`(entity) · `syj:relatedTo`(entity, 분류 불가 시).

### scenes[] (기존 build_history_scenes 형식 + 추가 필드)

기존 필수: `id, eventId, title, startYear<=endYear, kind, summary, dateClaimIds(비지 않음), actionClaimIds(비지 않음), place|null, participants[], effects{}`. kind 는 기존 값(`settlement|construction|battle|siege|naval|fire|court|assembly|publication|excavation|tradition`)에 `disaster|relief|market|ritual|migration|survey|portrait|heritage` 를 더해 쓴다.
`heritageType`: heritage일 때 필수. `pagoda|stele|hall|tomb|fortress|site|artifact|bridge|kiln` 중 하나이며, `heritageFloors`는 석탑의 표시용 층수로 정수 3(기본) 또는 5다. 실제 층수를 새로 주장하는 값이 아니다.
`portrait`: 참여 인물 1명을 중심에 놓는다. `place.setting`만 무대 힌트로 쓰며 허용값은 `palace|office|temple|battle|village|academy`(궁궐·관아·사찰·전장·마을·서원)다. 사찰은 목탑 무대다. 무대는 항상 사건 행으로 남으며 인물 정보가 없거나 가까운 이웃 때문에 compact로 표시해도 사라지지 않는다. participantGroups 수행원은 전체 4명까지다. `portrait|heritage`는 kind로만 쓰고 sceneFunction에는 쓰지 않는다.
`heritage.persistence`: `{kind:"facility", from, to, basisClaimIds}`가 있으면 건립 장면 이후 지정 기간에 같은 외형·크기로 존속한다. from/to를 명시하며 `to:null`은 현존으로 2100년 상한까지 표시한다. 왕조 경계 상한은 적용하지 않으며 항목 조사가 소실 연도를 명시해야 한다. basisClaimIds가 있으면 “기록된 존속(근거 n건)”으로 표시한다. 카드의 문화재 근거 설명은 summary와 place.coordinateNote에 기록한다.
추가(모두 검증기가 확인): `category`(아래 10개 중 하나) · `region`(`capital|north|central|south|island`) · `decade`(startYear 를 10으로 내림) · 선택 `sceneFunction`(`rail_station|temple|print_workshop|migration|persecution|naval_expedition|civil_conflict|uprising_battle|market|relief|construction_site|fortress|harbor|kiln|irrigation`) · 선택 `participantGroups[{entityId?,label,role,stance,side,count,claimIds[]}]` · 선택 `persistence {kind:'city'|'facility'|'institution'|'none', from, to|null, basisClaimIds[]}`.
place: `{label, medium('land'|'sea'), precision('site'|'area'), lon, lat, claimIds[], coordinateSourceIds[], coordinateNote, setting?(palace|office|temple|battle|village|academy)}` — 좌표는 반드시 sources[] 의 발췌(위키 표시 좌표 등)나 location 주장에 근거를 둔다.

### 집단 어휘 정규화

`build_history_scenes.py`는 `--collection`이 `facts-`로 시작할 때만 `scene_vocabulary.normalize_group(group, scene)`으로 집단을 정규화한다. 조사 원본은 그대로 두고 세계 표시용 `history-scenes.json`에 적용한다. 다른 컬렉션은 기존 어휘를 유지한다.

| 필드 | 원문 키워드 예 | 표시 값 |
|---|---|---|
| role | 승려·주지·법사·monk·출가 | monk |
| role | 왕·군주·천도 주체·추장 | ruler |
| role | 관인·official·감독·통치·사절·host·주체·state | scholar |
| role | 인부·역부·노동·부역·축성 인력·builder·worker·기술 인력·수축 | worker |
| role | 군사·garrison·병·soldier·주둔 | soldier |
| role | 피해자·victim·수급자·recipient·beneficiary·유민·이재민·수혜 | civilian |
| role | 이주민·migrant·정착민·주민·거주자·상인·trader·행상·guest·참석·미상 | commoner |
| stance | 피해·피동·유망·victim | victim |
| stance | 이주·정착·이탈·항해·marching·귀부·도래 | marching |
| stance | 동원·부역·시공·노동·징발·수축·축성·worker | worker |
| stance | 방어·주둔·defend·defensive·항복 | defender |
| stance | hostile·attacker·공격 | attacker |
| stance | neutral·미상·주도·의례·참석 등 나머지 | bystander |
| side | civilian·피해·수급·주민 등 민간 집단 | c |
| side | 장면에서 처음 나오는 정치체 및 state·defender | a |
| side | 다른 정치체 및 attacker, 그 밖의 값 | b |

영문은 대소문자를 구별하지 않는다. 이미 통제 어휘인 role과 side는 유지한다. 역할 키워드가 겹치면 위 표 순서로 고르되, 일반적인 `주체`·`state`는 구체적인 역할 키워드가 없을 때 scholar로 둔다. stance는 role에서 추측하지 않고 원문 stance로만 정한다.

주체 정치체는 제목 → 요약 → participants의 entityId·label·role·side → 집단의 원문 side 순으로 읽으며, 각 문자열에서 처음 나오는 정치체를 택한다. 고구려/goguryeo, 백제/baekje, 신라/silla/사로국, 가락/가야/gaya, 발해/balhae 등은 같은 정치체로 본다. 같은 장면의 같은 원문 side는 역할이나 처리 순서가 달라도 같은 코드가 된다. a·b는 화면의 편 구분이며 역사적 적대 관계를 새로 주장하지 않는다.

기존 label은 보존하고, 비어 있으면 원문 side와 role을 합친다(예: `고구려 이주민`). 원문 값은 각 집단의 `sourceRole/sourceStance/sourceSide`에 남긴다. basis가 없거나 비어 있으면 `조사 장면의 집단(원문 역할: <role>, 자세: <stance>, 편: <side>) — count 는 표현값`을 채운다. count는 정수로 바꾸고 0 이하·누락·변환 불가 값은 1로 둔다. 소수는 소수점 아래를 버린다.

집단 claimIds는 장면의 `dateClaimIds ∪ actionClaimIds ∪ relatedClaimIds ∪ participants[].claimIds` 안의 값만 남기고, 비면 actionClaimIds로 채운다. entityId가 participants에 없으면 null로 둔다. 집단이 있는 장면의 participantGroupsNote는 정확히 `count 는 화면 표현값이며 사료의 인원수가 아니다`다. 빈 집단 배열은 participantGroups와 participantGroupsNote를 생략한다.

조립기는 sceneFunction을 우선한다. `construction_site`는 기존 construction 구성(공사 인력·손수레), `fortress`, `relief`, `market`, `irrigation`, `kiln`, `harbor`는 각각 기존 구성을 사용한다. 기존 8개 함수의 동작을 유지하고 지속 시설 행은 facilityLook을 우선한다.

### facts[] (평면 목록, 커버리지 집계용 — 장면이 없어도 사실은 남긴다)

```json
{"id": "fact-gg-003", "category": "administration", "region": "north", "decade": 0, "year": 3, "yearVerbatim": "二十二年",
 "placeLabel": "국내성", "modernPlace": "중국 지린성 지안", "lon": 126.19, "lat": 41.13, "coordinateBasis": "src-kowiki-guknaeseong ex-1",
 "what": "고구려가 졸본에서 국내성으로 도읍을 옮겼다", "claimIds": ["claim-gg-guknae-move-3"], "sceneId": "scene-gg-guknae-move-3",
 "persistence": {"kind": "city", "from": 3, "to": 427}, "density": null, "confidence": "high", "note": ""}
```

category 10개: `settlement`(취락·인구) · `administration`(행정·도읍) · `facility`(시설) · `economy`(생활·경제) · `disaster`(재해·질병·구휼) · `culture`(종교·문화·교육) · `transport`(교통·길) · `foreign`(대외) · `person`(인물) · `war`(전쟁·군사).
제약: `claimIds` 비지 않음, 각 id 는 같은 result.json 의 claims 에 있음. `lon/lat` 가 있으면 `coordinateBasis` 필수. `density` 가 있으면 `{households?:number, population?:number, unit?:string, claimIds:[]}`. `confidence` 는 `high|medium|low`.

### 검증기 출력

`python scripts/check_fact_research.py data/research/facts-ancient [--job goguryeo_early] [--json report.json]`

- 실패(exit 1): 구조 누락, 인용 불일치, chunk 없음, 연도 불일치, 허용 밖 predicate/category/region/kind/sceneFunction, claimIds 참조 오류, 좌표 근거 없음, 발췌 25단어 초과·HTML 불일치·sha256 불일치, run.json 조건 위반.
- 표: (1) category × 10년, (2) region × 10년, (3) job 별 사실 수·장면 수·claim 수. `--json` 에 같은 내용.

## 검색 CLI (#181)

Python 3, 표준 라이브러리만 사용한다. 두 CLI의 파일 입출력과 터미널 출력은 UTF-8이다. 실행 위치와 무관하게 이 저장소의 `data/sources/*/chunks.jsonl`을 한 번씩 열어 스트리밍한다. 존재하지 않는 실록·승정원일기 파일은 건너뛰고 로컬에 있으면 읽는다. Git 명령이나 네트워크 요청은 실행하지 않는다.

| 인자 | 기본값 / 동작 |
|---|---|
| `--source` | 생략하면 로컬 전체. `src-samguksagi` 같은 sourceId, 반복 가능 |
| `--from`, `--to` | 서기연 포함 범위. 음수는 기원전 |
| `--keyword` | 반복 시 AND. 각 단어가 `text`, `locator`, `title`, `indexTerms[].text` 중 하나에 부분 일치 |
| `--locator` | locator 부분 일치 |
| `--id` | 일치하는 조각 하나의 **전체 필드 JSON 한 줄**. source·연도·keyword·locator·fields·format 선택을 무시. 없으면 출력 없이 exit 1 |
| `--limit` | 50, 양의 정수 |
| `--format` | `jsonl` 또는 `table`, 기본 `jsonl`. table은 탭으로 구분 |
| `--fields` | 쉼표 구분. 기본 `id,sourceId,locator,date,text,permalink`. 없는 필드는 null |

연도는 `services/host/server.py`의 `year_of`와 같은 정규식 `^(-?\d{3,4})(?=-|$)`을 쓴다. 실제 `chunk_samguksagi_sg_001_0020_0010`(혁거세 즉위)의 `date.raw`는 `-0057-04-15L0`이므로 -57이다. 따라서 원래 스펙의 “앞 4자리(부호 포함)”는 정확히 **부호와 그 뒤 3~4자리 숫자**로 읽어야 한다. `0551-01-99L0`은 551, `0000`과 `9999` 이상, `03**-99-99L0` 등은 미상이다.

raw가 없거나 빈 값일 때만 label의 `(-?\d+)년`을 쓴다. raw가 있으나 미상이면 재위년 label로 대신하지 않는다. 날짜가 없는 금석문·집성은 연도 조건을 주면 제외되지만 keyword만 주면 포함된다. 기원전 decade도 `year // 10 * 10`이므로 -57은 -60이다.

```console
python scripts/search_chunks.py --source src-samguksagi --from 551 --to 551 --keyword 娘城 --fields id,date
{"id": "chunk_samguksagi_sg_004_0040_0150", "date": {"label": "12년 3월", "raw": "0551-03-99L0"}}

python scripts/search_chunks.py --source src-geumseok-gskh_001_0040_0030 --keyword 寺 --limit 1 --fields id,date
{"id": "chunk_geumseok-gskh_001_0040_0030_gskh_001_0040_0030_0010", "date": null}

python scripts/search_chunks.py --source src-samguksagi --from -57 --to -57 --keyword 赫居世 --fields id,date
python scripts/search_chunks.py --id chunk_samguksagi_sg_004_0040_0150
python scripts/search_chunks.py --help
```

## 검증 구현의 구체화 (#180)

- `collection`과 `job`, run의 `task`는 실제 폴더 이름과 일치해야 한다. 모든 최상위 배열과 cell은 필수다. ID는 각 배열 내에서 중복될 수 없고, excerpt ID는 result 전체에서 유일하다. 엔티티 ID는 기존 저장소 엔티티를 가리킬 수도 있어 같은 result의 entities에 한정하지 않는다.
- `run.json`의 모든 표 키를 검사한다. `modelRequested`는 `claude-opus-5`, `modelsObserved`는 정확히 `["claude-opus-5"]`, `exitCode`는 정수 0, `isError`는 JSON false, `started`는 0 이상의 유한한 수다. runner는 비지 않은 문자열이며 workflow 외 runner는 기존 규칙대로 max만 허용한다. run의 실제 모델 실행 여부를 외부에서 확인하지는 않는다.
- `year` object는 `{kind:"year", value:<정수>}`다. 시간 predicate는 time과 year를 둘 다 허용한다. time의 year/earliest/latest는 필수 정수이고 `earliest <= year <= latest`다. 서기 0은 허용하지 않는다. raw로 서기연을 알 수 있을 때 로컬 시간 값 전부가 그 연도와 같아야 한다. 미상 raw 또는 date null이면 연도 일치 검사를 생략한다.
- `quote`와 로컬 time.verbatim 비교는 유니코드 공백을 전부 제거한다. 빈 인용은 실패다. `citesChunk`와 `citesExcerpt`는 정확히 하나만 있어야 한다. 필요한 chunk만 보관하고 collection 전체에서 chunk 파일을 최대 한 번 읽는다.
- 웹 검증은 기존 적재 스크립트를 **import하지 않고 복제**했다. `HTMLParser(convert_charrefs=True).handle_data`를 모아 (1) 붙인 텍스트, (2) 그 공백을 한 칸으로 합친 텍스트, (3) 각 HTML 텍스트 조각 사이에 공백을 넣고 합친 텍스트 중 하나에서 발췌가 그대로 나와야 한다. 단어 수는 기존과 같은 `len(text.split())`다.
- 웹 연도도 기존과 같은 숫자 부분 문자열 검사다. 기원전은 절댓값 숫자와 기원전/서기전/B.C./BCE/BC 표식이 필요하다. 기존의 기원전 세기 earliest 변환과 “이듬해” latest 예외도 보존했다. 번역이나 자연어 주장의 역사적 타당성까지 판정하지 않는다.
- manifest의 각 원본을 읽어 SHA-256·byteLength·HTTP 200·UTC 시각을 검사하고 source의 동일 필드와 비교한다. URL은 기존처럼 URL 디코딩 후 끝 `/`를 제거해 비교한다. rawFile은 해당 job의 raw 아래 HTML이어야 한다. UTF-8 HTML을 사용한다.
- 허용 도메인은 `encykorea.aks.ac.kr`, `ko.wikipedia.org`, `en.wikipedia.org`, `heritage.go.kr`, `museum.go.kr`, `nrich.go.kr` 및 그 하위 도메인이다. 그 밖에는 license의 `공공누리`/`KOGL`과 HTML 원본의 `공공누리`/`kogl.or.kr` 표시를 함께 확인한다. 기관 운영 주체의 진위는 오프라인으로 확인하지 않는다. `db.history.go.kr` 원본은 manifest에서 실패한다. license 문자열이 없다는 사실 자체는 경고다.
- facts 필수 키는 `id, category, region, decade, year, yearVerbatim, placeLabel, modernPlace, what, claimIds, confidence, note`다. placeLabel/modernPlace/note는 빈 문자열을 허용한다. 장면이 없는 사실은 sceneId를 생략하거나 null로 둔다. 좌표·persistence·density도 없으면 생략/null 가능하다. 좌표를 쓰면 lon/lat를 모두 넣어야 한다.
- 좌표는 유한한 수이며 lon -180~180, lat -90~90이다. scene은 place.claimIds의 location object와 좌표가 같거나 coordinateSourceIds 출처의 한 발췌에 두 십진 좌표 수가 있어야 한다. fact.coordinateBasis는 공백으로 구분한 `sourceId excerptId` 또는 `location claimId`(실제 claim ID 문자열)를 받는다. 문자열만 채운 가짜 근거와 다른 좌표는 실패한다. 도·분·초 좌표의 자동 변환은 구현하지 않았다. 십진 좌표 발췌나 location 주장을 제공한다.
- 선택 validFrom/validTo는 claim 또는 location object에 둘 수 있고 정수·순서 관계를 검사한다. persistence는 from 정수, to는 null 또는 from 이상 정수다. scene persistence가 none이 아니면 basisClaimIds는 비지 않아야 한다. participantGroups.count는 null 또는 0 이상 수, claimIds는 비지 않아야 한다. density는 수치·unit 자료형과 비지 않은 claimIds를 검사한다. 인구/호수 literal은 0 이상 수와 각 단위 口/戶를 확인한다.
- participants는 배열이며 기존 build_history_scenes의 규칙대로 각 항목의 entityId와 비지 않은 claimIds를 검사한다. effects는 객체이며 각 효과의 enabled는 불리언, claimIds는 참조 목록이다. enabled가 true면 claimIds는 비지 않아야 한다. cell 목표 미달은 실패 조건이 아니며, 표는 scenes가 아닌 facts를 센다. 실패한 job도 구조가 읽힌 사실은 집계에 포함한다. 이를 검증을 통과한 사실 수로 해석해서는 안 된다.

```console
python scripts/check_fact_research.py tests/fixtures/facts/facts-ancient --job silla_551
python scripts/check_fact_research.py data/research/facts-ancient --job goguryeo_early --json report.json
python -m unittest discover -s tests -p "test_*.py"
```

실패는 `job/파일/항목/이유` 한 줄씩, 경고는 `WARNING ` 접두사로 출력한다. 정상은 exit 0, 검증 실패는 exit 1, 잘못된 CLI 인자는 argparse의 exit 2다. stdout에는 항상 세 집계 표와 PASS/FAIL 요약이 나온다. `--json`은 다음 구조이며 warnings를 추가 제공한다. 빈 조합은 JSON에서 생략하고 텍스트 표에서는 0으로 표시한다.

```json
{
  "jobs": [{"job":"silla_551","facts":4,"scenes":1,"claims":5,"chunkClaims":4,"excerptClaims":1,"failures":0}],
  "failures": [],
  "warnings": [],
  "coverage": {
    "byCategoryDecade": {"administration":{"550":1},"culture":{"550":1},"settlement":{"-60":1},"facility":{"550":1}},
    "byRegionDecade": {"capital":{"550":1},"central":{"550":1},"south":{"-60":1},"north":{"550":1}},
    "totals": {"facts":4,"scenes":1,"claims":5,"chunkClaims":4,"excerptClaims":1}
  }
}
```

픽스처의 로컬 인용 세 조각은 실제 삼국사기 원문이다. 웹 HTML·URL·run은 자동 검사용 합성 자료이며 실제 웹 다운로드나 모델 실행의 증거가 아니다. 다섯 변형(quote 불일치, chunk 없음, 연도 불일치, predicate 밖, claimIds 참조 오류)은 각각 실패 하나를 기대한다. 추가 테스트는 공백, 구조, 웹 인용·해시, run, 좌표, 선택 필드, CLI exit와 JSON 집계를 검사한다.

## 세계 연결 규칙

`summarize_facts.py`가 만든 요약을 다음 명령으로 세계 표시용 파일에 연결한다.

```console
python scripts/build_fact_layers.py --summary data/research/<collection>/summary --out services/host/app/fact-layers.json
python scripts/build_fact_layers.py --summary data/research/<collection>/summary --out services/host/app/fact-layers.json --merge
```

출력은 `{version:1, generatedFrom:[컬렉션 이름], density:[], administrative:[]}`다. `placeLabel`은 `label`로 옮기며 수치와 `claimIds`를 보존한다. 좌표가 하나라도 없으면 제외하고 stdout의 `excludedMissingCoordinates`에 종류별 개수를 낸다. 좌표·호수·인구는 유한한 수, 연도는 정수여야 한다. 숫자 문자열·불리언은 오류이며, 미상 호수·인구와 종료 연도는 null로 남긴다. `--merge`는 밀도의 `(label, year)`, 행정 기록의 `(label, from)`이 같으면 새 기록으로 교체하고 다른 기록과 컬렉션 이름은 유지한다. 실제 조사 결과가 없는 초기 앱 파일은 빈 배열이며 테스트의 가상 기록은 앱에 넣지 않는다.

세계에 장면을 연결할 때 `chronicle-scenery.js`에서 `fact-layers.json`을 읽어 `world.factLayers`와 밀도 계산 모듈에 같은 데이터를 둔다. 장면과 배경의 구역 생성도 이 데이터를 쓴다. 읽기에 실패하면 콘솔에 알리고 빈 사실 계층으로 기존 표시를 유지한다.

추정 마을은 기존 시대 비율과 위도 계수를 곱한 값에 다음 밀도 계수를 곱한다.

```text
가구 환산 수 = max(households, population / 5, 100)  (null은 0)
밀도 계수 = clamp(0.6 + log10(가구 환산 수) / 4, 0.6, 1.8)
최종 통과 기준 = clamp(기존 시대·위도 기준 × 밀도 계수, 0.05, 0.95)
```

`world.toWorld(lon, lat)`로 바꾼 기록 좌표가 사이트에서 반경 **40단위 이내**(약 26km)이고 기록 연도와 현재 연도의 차이가 **150년 이내**일 때만 적용한다. 여러 기록이면 공간상 가장 가까운 것 하나를 쓰고, 거리가 같으면 파일에서 먼저 나온 기록을 쓴다. 900호는 약 1.34배, 10,000호는 1.6배, 100호는 1.1배다. 해당 기록이나 위치·연도 문맥이 없으면 기존 값을 그대로 쓴다. 사이트 seed를 이용한 선택 방식은 유지하며 밀도 기록이 있으면 같은 시대 안의 연도 변화도 다시 계산한다.

행정 기록은 `city`를 `regional` 구역(반경 28), `institution`을 `town` 구역(반경 19)으로 만든다. **`facility`는 시설이므로 구역에서 제외하고 콘솔에 개수를 보고**한다. `none`도 구역을 만들지 않는다. 시작은 `from`, 끝은 `to`이며 종료 미상은 `endYear:2100, openEnded:true`로 표시한다. ID는 `inhabited:fact:<slug(label)>:<from>`이고 slug는 한글 등 글자와 숫자를 남기고 공백·구두점을 하이픈으로 바꾼다. `claimIds`는 원본 그대로, `sourceIds`는 `['facts']`다. 기존 구역과 경위도 거리 0.03도 이내이며 기간이 **한 해라도 겹치면** 추가하지 않는다(양 끝 연도 포함). 기존 장면·장소 구역을 우선하며 앞서 추가한 행정 구역과의 중복도 제외한다.

이 연결은 **화면 표현용이며 복원이 아니다**. 인구를 5로 나누는 가정, 거리·연도 창, 구역 크기와 집 수는 당시 가구 규모·행정 경계·인구 분포를 입증하지 않는다. 종료 미상의 2100년은 표시 범위 끝일 뿐 존속을 입증하는 연도가 아니다. 좌표가 없는 기록은 임의 위치를 부여하지 않는다.
