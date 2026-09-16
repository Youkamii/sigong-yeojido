# 합류본 재감사 CONFIRMED 12건 처리 (#203)

기준: 워크트리 `sigong-codex-e`, 브랜치 `feat/post-merge-fixes-203`(main `40280b2f`).
입력: `post-merge-confirmed-203.md` 의 CONFIRMED 12건. 기각 목록은 손대지 않았다.
문구 기준: `docs/research/copy-style-v2.md`.

## 검사 결과

| 검사 | 결과 |
|---|---|
| `node --test tests/*.mjs` | 404건 중 403 통과 · 1 실패 — 합류 전부터 있던 `tests/test_place_state.mjs` 1건(기각 목록 소속) |
| `python -m pytest -q` | 240 passed, 321 subtests passed · 실패 0 |
| `python services/validate.py` | 종료코드 0 · 중복 개체 id 경고 2건 사라짐(개체 13,323개로 두 도구가 일치) |

## 항목별 처리

### 1·5. 좌표 근거 메모가 화면에 안 나온다 / 죽은 카드 분기 (major)

- `services/host/app/atlas-story.js` 의 '지도 위치' 블록에 `activity.coordinateNote` 문단을 `placement` 아래에 넣었다. 배치 문구가 없고 메모만 있어도 블록이 열린다.
- `services/host/app/chronicle.js` 의 `showEntity` 안에 있던 중복 카드 분기(옛 360~384행)를 지웠다. `index.html:434` 가 `presentEntity` 를 `atlasUI.showEntity` 로 잇고 `atlas-ui.js:137` 이 언제나 `true` 를 돌려주므로 이 분기는 초기화 이후 한 번도 실행되지 않았다. 남은 건 `this.callbacks.presentEntity?.(entity,activity);` 한 줄이다.
- 테스트: `tests/scene-kinds.test.mjs` 의 `card.host.innerHTML` 검사 5곳을 실제로 보이는 카드(`AtlasStory.render`)와 `presentEntity` 가 받는 값 검사로 바꿨다. 첫 테스트에 좌표 근거 메모 검사를 새로 넣었다 — `.atlas-placement-note` 블록 안에 배치 문구가 있고, 메모가 있는 경우에만 메모가 그 **아래**에 온다(순서까지 확인).
- 남는 값: 죽은 분기가 함께 찍던 `activity.displayBasis` 는 지시 범위 밖이라 표시하지 않았다. 지우기 전에도 화면에 나오지 않았으므로 되돌아간 것은 없다.

### 2. labelNote 절반이 연도뿐이라 검색 줄이 '사건 · 713 · 713년' (minor)

- 화면: `chronicle.js` 의 `labelNote` 가 값이 연도·날짜뿐이면(같은 파일 `isYearParen`) 빈 문자열을 돌려준다.
- 데이터: `services/entity_labels.py` 에 `clean_note()` 를 두어 `clean_label` 이 연도·날짜뿐인 설명을 labelNote 로 만들지 않게 했다. `scripts/clean_entity_labels.py` 의 '손대지 않는 개체' 경로도 같은 함수를 쓴다.
- `python scripts/clean_entity_labels.py --apply` 실행: 개체 403개에서 연도·날짜뿐인 labelNote 를 지웠다. 다시 돌리면 `cleaned: 0` 으로 멱등이다.
- 테스트: `tests/entity-label-search.test.mjs`(표본을 새 데이터 값으로 맞추고 화면 규칙 검사 추가), `tests/test_entity_labels.py`.

### 3. 역사 지도 요청 실패 시 버튼에 영어 오류 (minor)

- `services/host/app/history-map.js` 의 `refresh` catch 가 `label + ' 자료를 불러오지 못했습니다.'` 를 쓰고, 브라우저가 만든 원문(`Failed to fetch` 등)은 `console.warn` 으로만 남긴다.

### 4. history-coordinates.json 좌표 근거 메모 90건이 개발·영어 용어 (major)

- 90건 전부 우리말로 다시 썼다. 바꾼 규칙: 위키데이터 `Q…`·`P625` → "위키데이터에 적힌 좌표", `WGS84 십진도` → "경도·위도 값", `UI가 그리는` → "지도가 그리는", `앵커` → "기준점", 도분초의 `N/E` → "북위/동경 …도 …분 …초", 정밀도 코드값 `area`/`site` → "일대 기준"/"유적 지점", `medium 은 sea` → "바다 장면", 내부 id(`hgis-admin-*`·`src-*`·`rc-*`·`place-*`)는 삭제하거나 사람이 읽는 이름으로. 수치는 모두 보존했다.
- 생성 경로: `scripts/build_history_coordinates.py` 가 있지만 재빌드는 하지 못했다 — 저장된 원본 `data/research/coordinates-105/coordinates.json` 은 82건이고 배포본은 90건이라 이미 어긋나 있고, 스크립트가 sha256 을 맞춰 보는 원시 응답 파일이 저장소에 없다. 그래서 **원본 82건과 배포본 90건에 같은 규칙을 적용**했다. 재빌드로 되돌아갈 위험은 없다(원본도 같이 고쳤다). 다만 다음에 정식 재빌드를 하려면 원시 응답 파일을 복구해 원본을 90건으로 맞춰야 한다.
- 회귀 검사: `coordinateNote` 90건에서 영어 예외(AI·3D·CRS84·km²·SIGONG YEOJIDO)를 뺀 `[A-Za-z]` **0건**.

### 6. ui-copy-194.md 의 '기계 대조 불일치 0건' 주장이 거짓 (major)

- 668·669행(연도 슬라이더 aria-label·title)의 '#198 재조정' 값을 현재 `chronicle.js:255` 값으로 고쳤다: `연도 이동. 원하는 연도로 끌어 놓습니다` / `끌어서 연도를 고릅니다. 방향키나 마우스 휠로는 1년씩 움직입니다`.
- 이번 작업으로 문구가 바뀐 행도 같이 고쳤다: `atlas-chat.js` 추천 질문 1행(감사 7), `chronicle.js` `showEntity` 32행은 `(코드에 없음)` + 각주 ㄹ(감사 1·5).
- 53행의 주장을 다시 썼다: 현재 값 **773행 대조 · 불일치 0건**(2026-09-16 재대조), 앞선 판의 804행 주장이 틀렸던 이유, `(코드에 없음)` 38행.
- 대조 스크립트를 테스트로 남겼다: `tests/ui-copy-inventory.test.mjs`. 문서의 '표 읽는 법' 규칙을 그대로 구현하고, 줄바꿈 표기 `⏎` 와 HTML 이스케이프(`&gt;`)를 풀어 공백을 하나로 줄인 뒤 소스 문자열에서 찾는다(앞 감사가 오탐 7건을 낸 자리다).

### 7. 추천 질문의 조사 '과' 고정 (minor)

- `services/host/app/atlas-chat.js` 에 `withComparisonParticle` 을 두어 받침 유무로 와/과를 고른다. '장보고와 관련된 사건을 알려주십시오.'
- 같은 파일과 `chronicle.js` 의 다른 조사 연결부도 훑어봤다. `chronicle.js` 의 '1593년로' 는 기각 목록이라 손대지 않았다.
- 테스트: `tests/display-label.test.mjs`.

### 8. 워커 없는 환경에서 settleRefresh 가 안 돈다 (major)

- `services/host/app/chronicle-scenery.js` 의 `requestRefresh` 인라인 폴백에서 `refreshPeriod(preserve)` 뒤에 `settleRefresh()` 를 부른다. 이제 세 경로(워커 응답 · 워커 실패 폴백 · 워커 없음)가 모두 `syncPaths` + `buildForest` 로 끝난다.
- 테스트: `tests/scenery-detail.test.mjs` 에 세 경로의 호출 순서를 맞춰 보는 동치 테스트를 넣었다. 수정을 빼면 인라인 경로에서 실패하는 것을 확인했다.

### 9. 워커 pending 맵에 스냅샷이 쌓인다 (minor)

- `services/host/app/workers/scene-layout.worker.js` 가 요청을 처리할 때 `token` 보다 앞선 키를 지운다. 메인은 마지막으로 보낸 토큰의 응답만 반영하므로(`scene-layout-client.js:44`) 그보다 앞선 배치본은 다시 기준이 될 수 없다. 스크럽 중에도 pending 은 항상 1개다.
- 검사용 `pendingCount` 게터를 더했다. 테스트: `tests/scene-layout-worker.test.mjs`(수정을 빼면 5개까지 쌓이는 것을 확인).

### 10. history-scenes.json 좌표 메모 18건에 내부 레코드 id 노출 (major)

- 18건을 우리말로 다시 썼다. `khs-event-*` 는 "국가유산청 유적 목록의 「…」 항목", `rc-*` 는 "공통 좌표 등록부의 … 항목", `src-*`·`scene-*` 는 사람이 읽는 출처·장면 이름으로 바꿨다. 같은 메모 안의 `Q489139`·`P625`·도분초 `N/E`·`0.76 km` 도 함께 우리말로 옮겼다(지시된 치환 규칙 그대로).
- 파생 규칙대로 **원본을 먼저 고쳤다**: `data/research/{scenes-101/invasion_events, scenes-103/{goryeo_scenes,modern_scenes,contemporary_scenes,joseon_late_scenes,scene_position_repairs}, activity-96/later_capital_activity, scenes-122/modern_localities, scenes-128/{ancient_settlements,middle_kingdoms,early_joseon,later_joseon,modern_localities}, curriculum-colonial/colonial-4}/result.json` 14개 파일. 그 뒤 배포본 `services/host/app/history-scenes.json` 에 같은 값을 직접 반영했다(#199 의 '직접 반영' 절차와 같다 — 원문 HTML 이 없어 임포터를 다시 돌릴 수 없는 묶음이 섞여 있다).
- 회귀 검사: 배포본 `coordinateNote` 1,428건에서 내부 id 패턴(`khs-event-|rc-|scene-|src-|hgis-admin-|place-` + kebab) **0건**.

### 11. '미상'→'미확인' 무경계 치환 (major)

- 규칙: 화면 `chronicle.js` 의 `replaceUnknown`, 데이터 `services/entity_labels.py` 의 `replace_unknown`. 앞뒤가 한글이 아닐 때만 바꾼다.
- 전수 검사: `data/entities` 13,323개에서 `label`·`labelNote` 에 '미확인' 이 든 개체는 2건이고, 그중 한글에 붙어 망가진 것은 `place-hgis-admin-92966` 1건이었다. `label` 을 aliases 에 남아 있던 `평안남도/용강군/다미상면 (HGIS 92966)` 으로 되돌리고, 그러면서 label 과 같아진 aliases 줄을 지웠다(형제 `place-hgis-admin-92967` '다미하면' 과 같은 모양). 나머지 1건(`event-encykorea-seongnihak-doip` 의 `연도 미확인`)은 홀로 선 '미상' 을 바꾼 정상 결과다.
- 테스트: `tests/display-label.test.mjs`, `tests/test_entity_labels.py`.

### 12. 두 유형 폴더에 중복된 개체 id 2건 (major)

- `data/entities/thing/ent-wka-bak-wonjong.md`, `data/entities/thing/ent-wka-seong-huian.md` 를 지웠다. 두 파일은 label 이 id 문자열 그대로인 자동 생성 껍데기였고, `data/entities/person/` 쪽에 `박원종`·`성희안`(labelHanja 포함)이 원본으로 있다. 지운 뒤 `validate.py` 의 중복 경고 2건이 사라지고 개체 수가 13,323개로 `clean_entity_labels.py` 와 일치한다.
- 임포터: `scripts/import_period_research.py` 가 껍데기에 이름만 채워 다시 쓸 때 쓰던 키 목록 `('id','type','label')` 을 `ENTITY_KEYS = ('id','type','label','labelHanja','labelNote','sourceRef','kind','aliases')` 로 넓혔다. 목록 값은 블록 시퀀스로 쓴다(`services/frontmatter.py` 는 한 줄 JSON 배열을 문자열로 읽는다) — 그래서 `entity_markdown()` 을 따로 뒀다.
- 테스트: `tests/test_import_facts.py::test_shell_label_fill_keeps_the_name_cleanup_fields`(키 목록을 되돌리면 실패하는 것을 확인).

## 남은 우려

1. **history-scenes.json 의 나머지 좌표 메모 141건에 영문이 남아 있다.** 지시서의 회귀 검사는 '두 파일의 `coordinateNote` 에서 `[A-Za-z]` 0건' 이지만, 그 141건은 기각 목록의 `[data-final] … 좌표 메모 44건에 위키데이터 코드가, 85건에 영문 토큰이 남아 있다` 항목이라 "기각 목록은 손대지 않는다" 와 충돌한다. 기각 쪽을 따랐다. 확인된 잔존은 `Q8684`·`P625`(위키데이터 코드), `km`·`m`(단위), `N`·`E`(도분초), `Seoul`·`Gungnae` 같은 로마자 표기다. `history-coordinates.json` 90건과 지시된 18건은 0건이다.
2. **중복 껍데기가 다시 생길 수 있다.** `import_period_research.py:257` 은 새 껍데기를 만들기 전에 추정 유형 폴더와 `thing/` 만 뒤진다. `ent-` 처럼 접두어로 유형을 알 수 없는 id 는 `person/` 에 원본이 있어도 못 찾아 `thing/` 껍데기를 또 만든다. 이번 지시는 '키 목록 보완' 까지였으므로 이 탐색 범위는 건드리지 않았다. 다음 작업으로 올린다(모든 유형 폴더를 뒤지거나, `validate.py` 의 중복 경고를 실패로 올리는 방법).
3. **history-coordinates.json 을 정식으로 재빌드할 수 없다.** 위 4번에 적은 대로 저장된 원본이 82건이고 원시 응답 파일이 없다. 지금은 원본·배포본을 같은 규칙으로 함께 고쳐 어긋나지 않게 해 두었다.
4. **`tests/test_place_state.mjs` 1건 실패는 그대로 남는다.** 합류와 무관한 기존 결함으로 기각 목록에 있다.
