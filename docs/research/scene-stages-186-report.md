# #186 교과서 항목 kind별 무대 재설계 작업 보고

브랜치 `feat/scene-stages-186`, 기준 HEAD `eb972f2c1d6628a205b0ab9023c033eff13d833d`. 작업 트리만 수정했다. 커밋·푸시·배포, 새 콘솔 창·브라우저·로컬 서버 실행은 하지 않았다.

## 바꾼 분기 목록

아래 조형 이름은 조립기에 전달하는 이름이다. 건물과 인물은 기존 마지막 변환 루프에서 시대별 `era_*`, `figure_*` 이름으로 바뀐다. 새 무대의 compact는 primary 한 행만 남긴다. 기존 sceneFunction과 정규식 특수 분기의 우선순위를 유지했다.

| kind | primary | 상징물·배경 | 인물 |
| --- | --- | --- | --- |
| court | setting 건물, 기본 palace | table + 띄운 book | 군주 1 + 학자 6; on-site 군주가 있으면 익명 군주 생략; 근대는 human 6 |
| assembly | 1876 전 setting 건물; 이후 banner | table + book / civic_hall + 추가 banner | 학자 8 / human 16, 반원 반지름 9 / 8~12 |
| survey | hanging_scroll | table + book, setting 건물, handcart | working 학자 3 / modern_figure 3 |
| ritual | 불교 pagoda / 근대 행사 civic_hall / 나머지 table 제단 | 법당 / banner 2 / setting 건물 + pine 4 | 승려 4 / human 12 / 학자 6(근대 human) |
| construction | fortress gatehouse / 궁 palace / 사찰 pagoda / 근대 산업 steelworks | 기존 성벽·공사·사찰·산업 무대 재사용; 궁은 handcart 2 + groundbreaking | 궁은 working field_worker 6; 그 밖 기존 공사 인부 |
| tradition | book | 전근대 korean_house, 공연 키워드 string_instrument; 근대 civic_hall + banner | civilian 2, 공연 4 / modern_figure 4 |
| excavation | 선사 rural_hut / 도자기 rural_store(가마) / 무덤 heritage_tomb / 나머지 dig_site | 선사 집 3채 + 곡식 + 작은 발굴장 + 조건부 standing_stone; 무덤 pine 4 + 작은 발굴장 | 선사 rural_figure 4; 나머지 기존 가마·발굴 인물 |
| market | 기존 market / 근대 금융·경제 civic_hall | 기존 장터 / car 2 + table + handcart | 기존 장터 인물 / modern_figure 6 |
| migration | handcart | 추가 handcart | walking civilian 12 |
| naval | ship / 근대 motor_ship | 기존 naval_expedition의 해안 탐색과 배 3척 | 해안 인물 4 |
| fire | setting 건물, 기본 house | effects.fire 없이도 불 효과; 대상 없으면 primary | walking civilian 4 |
| disaster | rural_store | 군집 | civilian 8, 결정론 무작위, victim·idle, 익명 군사 없음 |
| settlement | 선사 rural_hut | 집 5채 + grain_stack + 조건부 standing_stone, 궁·성벽 없음 | rural_figure 4 |
| relief | grain_stack | 기존 구휼 무대 | 기존 구휼 인물 |

publication·siege·battle·portrait·heritage는 기존 무대를 유지했다. settlement의 -500년 이상 구간과 construction의 나머지 범용 공사도 유지했다. `scene-jl-donghak-yongdam-1860` 예외를 유지했다.

## 수정 파일

- `services/host/app/chronicle-event-scenes.js`: kind 분기·setting 도우미·화재 기본 효과.
- `tests/scene-kinds.test.mjs`: 39개 테스트 추가, 총 51개. primary·상징물·인원·배치·compact·실제 메시 조립 누락·해안 배치·분기 우선순위 확인.
- `tests/city-composition.test.mjs`: 기존 court 학자 수 기대값 한 줄을 8에서 확정 설계의 6으로 변경. 이 변경 없이는 요구한 전체 테스트 조건과 새 설계가 충돌한다.
- `docs/research/scene-model-audit-186.json`: 지정 스크립트로 다시 생성.
- 이 보고서.

금지한 파일, vendor, history-scenes.json, 데이터 파일, audit 스크립트는 수정하지 않았다.

## 카탈로그에 없어서 대체한 조형

이름이 없어서 대체한 조형은 없다. `korean_house`, `rural_figure`, `hanging_scroll` 등은 원본 카탈로그에 있다. `heritage_tomb`은 기존 heritage 실루엣이다.

`era_earlymodern_market_0..2`와 `era_modern_market_0..2`는 원본 JSON에 직접 적혀 있지 않지만, 기존 `extendBuildingCatalog`가 실행 시 여섯 조형을 생성한다. 따라서 일반 근대 장터는 market을 그대로 사용했다. 여섯 키의 존재와 실제 메시 조립 누락 0을 테스트했다.

**착석 표현의 한계:** assembly 전근대 학자 8명을 반지름 9의 앞쪽 반원으로 배치했지만, 실제 앉은 자세와 탁자를 향한 개별 회전은 구현되지 않았다. 기존 조형 동작에 sitting이 없고 `chronicle-assets.js`의 모델 전달 경로도 yaw를 전달하지 않아 `idle`을 사용했다. 이 부분은 확정 설계와 다른 표현이며 화면으로 확인하지 않았다.

## 검증 결과

- 새 장면 테스트: 51개 통과.
- 지정 `node --test tests/`: Node v22.17.0에서 tests 디렉터리를 모듈로 해석해 MODULE_NOT_FOUND, 종료 코드 1. 원문을 아래에 수록했다.
- 같은 범위의 모든 `.mjs` 파일 37개를 명시한 전체 실행: 288개 중 287개 통과, 기존 허용 실패 `tests/test_place_state.mjs`의 `outside candidates retain dates, sources and authorship instead of vanishing` 1개만 실패, 종료 코드 1.
- `python services/validate.py`: 종료 코드 0, 마지막 출력 OK. CONFLICT 및 중복 ID WARN도 원문 그대로 수록했다. 데이터 변경은 없다.
- `git diff --check`: 통과.

## Audit 표

지정 명령: `node scripts/audit_scene_models.mjs --items-only --out docs/research/scene-model-audit-186.json`

```text
{"packets":983,"errors":0,"classes":308}
```

983건 중 313건의 조형 목록 또는 primary/compositionKind가 바뀌었다. sceneFunction이 있는 347건과 보존 대상 5개 kind의 조형 목록·primary·compositionKind는 기준 audit와 동일하다. 기존 정규식 특수 무대도 동일하다.

아래 표는 heritageType을 합쳐 요청한 `kind | setting | compositionKind | primary | 건수` 기준으로 집계한 304행이다. 스크립트 원래 classes 308행과 집계 차원만 다르며 총합은 983이다.

| kind | setting | compositionKind | primary | 건수 |
| --- | --- | --- | --- | --- |
| assembly | academy | assembly | banner | 5 |
| assembly | academy | assembly | era_goryeo_hall_0 | 3 |
| assembly | academy | assembly | era_joseon_hall_0 | 3 |
| assembly | academy | assembly | era_three_hall_0 | 2 |
| assembly | academy | teaching | era_earlymodern_hall_0 | 4 |
| assembly | academy | teaching | era_goryeo_hall_0 | 2 |
| assembly | academy | teaching | era_joseon_hall_0 | 3 |
| assembly | academy | teaching | era_three_hall_0 | 1 |
| assembly | academy | uprising_battle | banner | 2 |
| assembly | battle | assembly | banner | 1 |
| assembly | battle | migration | handcart | 1 |
| assembly | office | assembly | banner | 35 |
| assembly | office | assembly | era_goryeo_hall_0 | 5 |
| assembly | office | assembly | era_joseon_hall_0 | 6 |
| assembly | office | assembly | era_three_hall_0 | 1 |
| assembly | office | civil_conflict | banner | 2 |
| assembly | office | relief | grain_stack | 1 |
| assembly | office | teaching | era_joseon_hall_0 | 1 |
| assembly | office | teaching | era_three_hall_0 | 1 |
| assembly | office | uprising_battle | banner | 3 |
| assembly | palace | assembly | banner | 1 |
| assembly | palace | assembly | era_goryeo_hall_0 | 1 |
| assembly | palace | assembly | era_joseon_hall_0 | 7 |
| assembly | palace | assembly | era_three_hall_0 | 3 |
| assembly | palace | uprising_battle | banner | 2 |
| assembly | temple | assembly | pagoda | 1 |
| assembly | temple | civil_conflict | banner | 1 |
| assembly | temple | uprising_battle | banner | 1 |
| assembly | village | assembly | banner | 3 |
| assembly | village | assembly | era_joseon_house_0 | 5 |
| assembly | village | civil_conflict | banner | 1 |
| assembly | village | uprising_battle | banner | 6 |
| assembly | 없음 | assembly | banner | 16 |
| assembly | 없음 | assembly | era_early_hall_0 | 3 |
| assembly | 없음 | assembly | era_goryeo_hall_0 | 4 |
| assembly | 없음 | assembly | era_three_hall_0 | 3 |
| assembly | 없음 | civil_conflict | banner | 2 |
| assembly | 없음 | fortress | era_joseon_gate_0 | 1 |
| assembly | 없음 | harbor | era_earlymodern_courtyard_0 | 1 |
| assembly | 없음 | harbor | era_joseon_courtyard_0 | 1 |
| assembly | 없음 | rail_station | station | 1 |
| assembly | 없음 | relief | grain_stack | 1 |
| assembly | 없음 | teaching | era_earlymodern_hall_0 | 3 |
| assembly | 없음 | teaching | era_three_hall_0 | 1 |
| assembly | 없음 | uprising_battle | banner | 5 |
| battle | academy | uprising_battle | banner | 1 |
| battle | battle | battle | banner | 12 |
| battle | battle | civil_conflict | banner | 6 |
| battle | battle | fortress | era_goryeo_gate_0 | 2 |
| battle | battle | fortress | era_joseon_gate_0 | 1 |
| battle | battle | harbor | era_joseon_courtyard_0 | 2 |
| battle | battle | naval_expedition | (none) | 1 |
| battle | battle | rail | station | 1 |
| battle | battle | uprising_battle | banner | 15 |
| battle | office | civil_conflict | banner | 1 |
| battle | office | uprising_battle | banner | 1 |
| battle | palace | battle | banner | 1 |
| battle | palace | civil_conflict | banner | 2 |
| battle | village | civil_conflict | banner | 2 |
| battle | village | uprising_battle | banner | 1 |
| battle | 없음 | battle | banner | 13 |
| battle | 없음 | civil_conflict | banner | 6 |
| battle | 없음 | fortress | era_earlymodern_gate_0 | 1 |
| battle | 없음 | uprising_battle | banner | 4 |
| construction | academy | construction | era_earlymodern_hall_0 | 1 |
| construction | academy | construction | era_goryeo_courtyard_0 | 1 |
| construction | battle | construction | era_three_courtyard_0 | 1 |
| construction | battle | fortress | era_joseon_gate_0 | 1 |
| construction | office | construction | era_goryeo_courtyard_0 | 2 |
| construction | palace | construction | era_joseon_courtyard_0 | 4 |
| construction | palace | palace_construction | era_joseon_hall_0 | 1 |
| construction | temple | temple | pagoda | 1 |
| construction | 없음 | construction | era_early_courtyard_0 | 3 |
| construction | 없음 | construction | era_earlymodern_hall_0 | 4 |
| construction | 없음 | construction | era_joseon_courtyard_0 | 1 |
| construction | 없음 | construction | era_modern_hall_0 | 5 |
| construction | 없음 | construction | era_three_courtyard_0 | 2 |
| construction | 없음 | fortress | era_goryeo_gate_0 | 4 |
| construction | 없음 | fortress | era_joseon_gate_0 | 4 |
| construction | 없음 | kiln | era_early_store_0 | 1 |
| construction | 없음 | rail_station | station | 3 |
| construction | 없음 | temple | pagoda | 1 |
| court | academy | court | era_joseon_hall_0 | 1 |
| court | academy | teaching | era_joseon_hall_0 | 1 |
| court | battle | court | banner | 1 |
| court | office | civil_conflict | banner | 1 |
| court | office | court | era_earlymodern_hall_0 | 14 |
| court | office | court | era_goryeo_hall_0 | 9 |
| court | office | court | era_joseon_hall_0 | 12 |
| court | office | court | era_modern_hall_0 | 2 |
| court | office | court | era_three_hall_0 | 11 |
| court | office | persecution | figure_joseon_commoner | 4 |
| court | office | persecution | figure_transition_commoner | 4 |
| court | office | rail | station | 1 |
| court | office | relief | grain_stack | 1 |
| court | office | teaching | era_earlymodern_hall_0 | 1 |
| court | palace | civil_conflict | banner | 5 |
| court | palace | court | era_early_hall_0 | 3 |
| court | palace | court | era_earlymodern_hall_0 | 5 |
| court | palace | court | era_goryeo_hall_0 | 8 |
| court | palace | court | era_joseon_hall_0 | 11 |
| court | palace | court | era_three_hall_0 | 14 |
| court | palace | rail | station | 1 |
| court | village | persecution | figure_joseon_commoner | 1 |
| court | 없음 | civil_conflict | banner | 1 |
| court | 없음 | court | era_earlymodern_hall_0 | 1 |
| court | 없음 | court | era_goryeo_hall_0 | 5 |
| court | 없음 | court | era_joseon_hall_0 | 1 |
| court | 없음 | court | era_three_hall_0 | 4 |
| court | 없음 | persecution | figure_transition_commoner | 1 |
| court | 없음 | rail | station | 1 |
| disaster | 없음 | civil_conflict | banner | 1 |
| disaster | 없음 | disaster | era_modern_store_0 | 1 |
| disaster | 없음 | persecution | figure_transition_commoner | 1 |
| excavation | palace | construction | era_goryeo_courtyard_0 | 1 |
| excavation | village | excavation | dig_site | 1 |
| excavation | village | excavation | heritage_tomb | 1 |
| excavation | 없음 | excavation | dig_site | 2 |
| excavation | 없음 | excavation | era_early_house_0 | 7 |
| excavation | 없음 | excavation | heritage_tomb | 10 |
| excavation | 없음 | kiln | era_goryeo_store_0 | 1 |
| excavation | 없음 | kiln | era_joseon_store_0 | 2 |
| fire | palace | civil_conflict | banner | 1 |
| fire | temple | fire | pagoda | 2 |
| fire | village | persecution | figure_transition_commoner | 1 |
| fire | 없음 | naval_expedition | (none) | 1 |
| fire | 없음 | persecution | figure_transition_commoner | 1 |
| heritage | academy | heritage | heritage_stele | 1 |
| heritage | battle | heritage | era_goryeo_gate_0 | 1 |
| heritage | office | heritage | book | 1 |
| heritage | office | heritage | era_joseon_hall_0 | 5 |
| heritage | office | heritage | heritage_blade | 1 |
| heritage | office | heritage | ship | 1 |
| heritage | palace | heritage | heritage_instrument | 2 |
| heritage | temple | heritage | book | 1 |
| heritage | temple | heritage | era_goryeo_hall_0 | 3 |
| heritage | temple | heritage | era_three_hall_0 | 2 |
| heritage | temple | heritage | hanging_scroll | 1 |
| heritage | temple | heritage | heritage_lantern | 1 |
| heritage | temple | heritage | heritage_pagoda_3 | 3 |
| heritage | temple | heritage | heritage_pagoda_5 | 1 |
| heritage | temple | heritage | heritage_statue | 2 |
| heritage | village | heritage | hanging_scroll | 1 |
| heritage | village | heritage | heritage_stele | 1 |
| heritage | 없음 | heritage | (none) | 1 |
| heritage | 없음 | heritage | book | 1 |
| heritage | 없음 | heritage | era_earlymodern_gate_0 | 1 |
| heritage | 없음 | heritage | era_joseon_hall_0 | 6 |
| heritage | 없음 | heritage | era_three_gate_0 | 2 |
| heritage | 없음 | heritage | hanging_scroll | 1 |
| heritage | 없음 | heritage | heritage_bell | 2 |
| heritage | 없음 | heritage | heritage_blade | 3 |
| heritage | 없음 | heritage | heritage_instrument | 1 |
| heritage | 없음 | heritage | heritage_jar | 3 |
| heritage | 없음 | heritage | heritage_kiln | 2 |
| heritage | 없음 | heritage | heritage_pagoda_3 | 2 |
| heritage | 없음 | heritage | heritage_pagoda_5 | 3 |
| heritage | 없음 | heritage | heritage_site | 2 |
| heritage | 없음 | heritage | heritage_statue | 4 |
| heritage | 없음 | heritage | heritage_stele | 8 |
| heritage | 없음 | heritage | heritage_tomb | 6 |
| heritage | 없음 | heritage | heritage_tower | 1 |
| heritage | 없음 | heritage | wall | 2 |
| market | office | harbor | era_joseon_courtyard_0 | 2 |
| market | office | market | era_earlymodern_market_0 | 1 |
| market | office | market | era_goryeo_market_0 | 1 |
| market | office | market | era_joseon_market_0 | 3 |
| market | village | harbor | era_earlymodern_courtyard_0 | 1 |
| market | village | market | era_goryeo_market_0 | 1 |
| market | village | market | era_joseon_market_0 | 5 |
| market | 없음 | harbor | era_early_courtyard_0 | 1 |
| market | 없음 | harbor | era_earlymodern_courtyard_0 | 1 |
| market | 없음 | harbor | era_goryeo_courtyard_0 | 2 |
| market | 없음 | harbor | era_joseon_courtyard_0 | 1 |
| market | 없음 | harbor | era_modern_courtyard_0 | 1 |
| market | 없음 | harbor | era_three_courtyard_0 | 2 |
| market | 없음 | irrigation | era_modern_house_0 | 1 |
| market | 없음 | market | era_early_market_0 | 2 |
| market | 없음 | market | era_earlymodern_hall_0 | 3 |
| market | 없음 | market | era_earlymodern_market_0 | 3 |
| market | 없음 | market | era_goryeo_market_0 | 2 |
| market | 없음 | market | era_joseon_market_0 | 1 |
| market | 없음 | market | era_modern_hall_0 | 1 |
| market | 없음 | market | era_three_market_0 | 2 |
| migration | battle | civil_conflict | banner | 1 |
| migration | office | migration | handcart | 2 |
| migration | palace | migration | handcart | 6 |
| migration | temple | migration | handcart | 1 |
| migration | temple | temple | pagoda | 2 |
| migration | village | harbor | era_joseon_courtyard_0 | 1 |
| migration | village | migration | handcart | 4 |
| migration | village | persecution | figure_transition_commoner | 1 |
| migration | 없음 | migration | handcart | 12 |
| migration | 없음 | persecution | figure_goryeo_commoner | 1 |
| naval | battle | naval_expedition | (none) | 1 |
| naval | 없음 | harbor | (none) | 5 |
| naval | 없음 | harbor | era_goryeo_courtyard_0 | 1 |
| naval | 없음 | harbor | era_three_courtyard_0 | 1 |
| naval | 없음 | naval | (none) | 4 |
| naval | 없음 | naval_expedition | (none) | 11 |
| portrait | academy | portrait | era_earlymodern_hall_0 | 4 |
| portrait | academy | portrait | era_goryeo_hall_0 | 5 |
| portrait | academy | portrait | era_joseon_hall_0 | 8 |
| portrait | academy | portrait | era_modern_hall_0 | 1 |
| portrait | academy | portrait | era_three_hall_0 | 1 |
| portrait | battle | portrait | banner | 20 |
| portrait | office | portrait | era_earlymodern_hall_0 | 7 |
| portrait | office | portrait | era_goryeo_hall_0 | 8 |
| portrait | office | portrait | era_joseon_hall_0 | 6 |
| portrait | office | portrait | era_modern_hall_0 | 4 |
| portrait | office | portrait | era_three_hall_0 | 1 |
| portrait | palace | portrait | era_early_hall_0 | 6 |
| portrait | palace | portrait | era_earlymodern_hall_0 | 7 |
| portrait | palace | portrait | era_goryeo_hall_0 | 14 |
| portrait | palace | portrait | era_joseon_hall_0 | 20 |
| portrait | palace | portrait | era_three_hall_0 | 20 |
| portrait | temple | portrait | pagoda | 17 |
| portrait | village | portrait | era_early_house_0 | 1 |
| portrait | village | portrait | era_earlymodern_house_0 | 21 |
| portrait | village | portrait | era_goryeo_house_0 | 1 |
| portrait | village | portrait | era_joseon_house_0 | 12 |
| portrait | village | portrait | era_modern_house_0 | 3 |
| portrait | village | portrait | era_three_house_0 | 2 |
| publication | academy | print_workshop | era_earlymodern_hall_0 | 2 |
| publication | academy | print_workshop | era_joseon_hall_0 | 1 |
| publication | academy | publication | table | 2 |
| publication | office | irrigation | era_joseon_house_0 | 1 |
| publication | office | print_workshop | era_earlymodern_hall_0 | 9 |
| publication | office | print_workshop | era_goryeo_hall_0 | 1 |
| publication | office | print_workshop | era_joseon_hall_0 | 8 |
| publication | office | publication | table | 3 |
| publication | office | teaching | era_joseon_hall_0 | 1 |
| publication | palace | print_workshop | era_joseon_hall_0 | 5 |
| publication | palace | publication | table | 2 |
| publication | temple | print_workshop | era_earlymodern_hall_0 | 1 |
| publication | temple | print_workshop | era_goryeo_hall_0 | 1 |
| publication | temple | print_workshop | era_three_hall_0 | 1 |
| publication | temple | publication | table | 3 |
| publication | village | irrigation | era_goryeo_house_0 | 1 |
| publication | village | print_workshop | era_joseon_hall_0 | 1 |
| publication | village | publication | table | 1 |
| publication | 없음 | print_workshop | era_earlymodern_hall_0 | 1 |
| publication | 없음 | print_workshop | era_goryeo_hall_0 | 2 |
| publication | 없음 | publication | table | 7 |
| publication | 없음 | relief | grain_stack | 1 |
| relief | office | relief | grain_stack | 2 |
| relief | village | relief | grain_stack | 1 |
| relief | 없음 | relief | grain_stack | 4 |
| ritual | academy | ritual | table | 1 |
| ritual | office | persecution | figure_transition_commoner | 1 |
| ritual | office | ritual | table | 1 |
| ritual | palace | ritual | pagoda | 1 |
| ritual | palace | ritual | table | 2 |
| ritual | temple | persecution | figure_three_kingdoms_commoner | 1 |
| ritual | temple | ritual | pagoda | 1 |
| ritual | temple | ritual | table | 2 |
| ritual | temple | temple | pagoda | 6 |
| ritual | village | persecution | figure_joseon_commoner | 1 |
| ritual | village | ritual | table | 2 |
| ritual | village | temple | pagoda | 1 |
| ritual | 없음 | persecution | figure_joseon_commoner | 2 |
| ritual | 없음 | ritual | era_modern_hall_0 | 2 |
| ritual | 없음 | ritual | table | 9 |
| ritual | 없음 | temple | pagoda | 2 |
| settlement | office | migration | handcart | 1 |
| settlement | palace | fortress | era_three_gate_0 | 1 |
| settlement | temple | temple | pagoda | 1 |
| settlement | village | fortress | era_three_gate_0 | 1 |
| settlement | village | migration | handcart | 2 |
| settlement | village | settlement | era_three_hall_0 | 1 |
| settlement | 없음 | fortress | era_early_gate_0 | 1 |
| settlement | 없음 | irrigation | era_early_house_0 | 1 |
| settlement | 없음 | settlement | era_early_hall_0 | 1 |
| settlement | 없음 | settlement | era_early_house_0 | 8 |
| settlement | 없음 | settlement | era_goryeo_hall_0 | 2 |
| settlement | 없음 | settlement | era_three_hall_0 | 1 |
| siege | battle | civil_conflict | banner | 1 |
| siege | battle | fortress | era_goryeo_gate_0 | 6 |
| siege | battle | fortress | era_joseon_gate_0 | 2 |
| siege | battle | fortress | era_three_gate_0 | 2 |
| siege | 없음 | fortress | era_early_gate_0 | 1 |
| siege | 없음 | fortress | era_joseon_gate_0 | 4 |
| siege | 없음 | fortress | era_three_gate_0 | 3 |
| siege | 없음 | siege | era_goryeo_gate_0 | 1 |
| siege | 없음 | siege | era_three_gate_0 | 1 |
| survey | office | irrigation | era_goryeo_house_0 | 1 |
| survey | office | migration | handcart | 2 |
| survey | office | survey | hanging_scroll | 12 |
| survey | palace | survey | hanging_scroll | 2 |
| survey | temple | survey | hanging_scroll | 1 |
| survey | village | survey | hanging_scroll | 1 |
| survey | 없음 | irrigation | era_three_house_0 | 2 |
| survey | 없음 | survey | hanging_scroll | 16 |
| tradition | academy | tradition | book | 1 |
| tradition | office | tradition | book | 1 |
| tradition | temple | temple | pagoda | 1 |
| tradition | temple | tradition | book | 2 |
| tradition | village | irrigation | era_goryeo_house_0 | 1 |
| tradition | village | irrigation | era_joseon_house_0 | 2 |
| tradition | village | market | era_goryeo_market_0 | 1 |
| tradition | village | tradition | book | 2 |
| tradition | 없음 | irrigation | era_three_house_0 | 1 |
| tradition | 없음 | temple | pagoda | 1 |
| tradition | 없음 | tradition | book | 7 |

## 설계와 어긋난 행 및 보존한 예외

### 새 기본 무대와 primary 대조

sceneFunction과 기존 compositionKind 특수 분기를 제외한 325건을 원본 연도·setting·제목·요약으로 확정 설계와 대조했다. 324건은 예상 primary와 일치한다. 다음 1건은 기존 정규식 분기를 그대로 유지하라는 조건 때문에 이전 무대가 남았다.

| id | 제목 | kind / setting | kind 설계 primary | 실제 primary | 이유 |
| --- | --- | --- | --- | --- | --- |
| scene-hs-ge2-12mok | 12목 설치 | assembly / 없음 | era_goryeo_hall_0 | banner | 요약의 ‘공무를 빙자해’가 기존 personalFire의 `/분신\|자해/`에 걸린다. 기존 분기 보존 조건에 따라 변경하지 않았다. |

신규 분기로 바뀐 장면에서 primary 불일치는 발견하지 못했다. 단 assembly의 착석·개별 회전은 위에 적은 미구현 사항이다.

### Primary 없는 기존 24건

아래 24건은 기준 audit에서도 primary가 없었다. audit의 world.contains가 항상 true여서 물 위 조형을 제외하는 기존 조립 규칙에 걸린다. 새 오류가 아니지만 이 audit만으로 해당 장면의 배나 수중 문화재를 검증할 수 없다. 새 육지 naval 분기는 별도의 해안 world에서 전근대 ship·근대 motor_ship, 3척/compact 1척, 해안 인물 4명을 검증했다. 현재 983개 항목에는 sceneFunction 없이 육지 naval 새 분기를 타는 실제 사례가 없다.

| id | 제목 | kind | setting | compositionKind | primary |
| --- | --- | --- | --- | --- | --- |
| scene-hs-tsushima | 대마도 정벌(기해동정) | naval | 없음 | naval_expedition | (none) |
| scene-hs-ct2-004 | 흥남 철수 | naval | 없음 | harbor | (none) |
| scene-hs-ct2-005 | 인천 상륙 작전 | naval | 없음 | naval_expedition | (none) |
| scene-hs-c3-012 | 베트남 파병 — 사이공에 닿은 수송선 | naval | 없음 | naval_expedition | (none) |
| scene-ge3-19 | 송과의 교류 | naval | 없음 | harbor | (none) |
| scene-gl2-japan | 여·원 연합군의 일본 원정 | naval | 없음 | naval_expedition | (none) |
| scene-gl3-waegu-invasion | 왜구의 침입 | naval | 없음 | naval | (none) |
| scene-gl4-jinpo | 진포 대첩 | naval | 없음 | harbor | (none) |
| scene-gl4-gwaneumpo | 관음포 대첩 | naval | 없음 | harbor | (none) |
| scene-gl4-daemado | 박위의 쓰시마 정벌 | naval | 없음 | naval_expedition | (none) |
| scene-hs-jl1-hansando-battle | 한산도 대첩 | naval | 없음 | naval | (none) |
| scene-hs-jl1-myeongnyang-battle | 명량 해전 | naval | 없음 | naval | (none) |
| scene-hs-jl1-noryang-battle | 노량 해전 | naval | 없음 | naval | (none) |
| scene-hs3-naseon | 나선 정벌 | battle | battle | naval_expedition | (none) |
| scene-mt1-general-sherman | 제너럴셔먼호 사건 | fire | 없음 | naval_expedition | (none) |
| scene-mt1-unyo-incident | 운요호 사건 | naval | battle | naval_expedition | (none) |
| scene-hs-geomundo | 영국 함대의 거문도 점령 | naval | 없음 | harbor | (none) |
| scene-hs-cheongil | 청일 전쟁 — 풍도 앞바다 | naval | 없음 | naval_expedition | (none) |
| scene-mt3-russo-japanese | 러일 전쟁 | naval | 없음 | naval_expedition | (none) |
| scene-hs-nb1-munmu-underwater-tomb | 문무대왕릉(대왕암) | heritage | 없음 | heritage | (none) |
| scene-hs-nb1-jangmunhyu-dengzhou | 장문휴의 등주 공격 | naval | 없음 | naval_expedition | (none) |
| scene-hs-s3-usanguk | 이사부의 우산국 복속 | naval | 없음 | naval_expedition | (none) |
| scene-hs-sg5-baekgang | 백강 전투 | naval | 없음 | naval_expedition | (none) |
| scene-hs-sg5-gibeolpo | 기벌포 전투 | naval | 없음 | naval_expedition | (none) |

### 기존 특수 분기로 유지한 무대

sceneFunction 지정 347건은 모두 그대로 유지했다. sceneFunction 없이 기존 정규식으로 다른 compositionKind가 된 아래 21건도 그대로 유지했다. kind별 새 기본 무대와 달라도 이번 수정 대상에서 제외하는 것이 요청 범위에 맞다.

| id | 제목 | kind | compositionKind | primary |
| --- | --- | --- | --- | --- |
| scene-je1-gwageo-1392 | 과거제 — 개경(옛 고려 궁성 일대) (1392) | assembly | teaching | era_joseon_hall_0 |
| scene-je1-sungkyunkwan-1398 | 성균관 — 한양 성균관 (1398) | assembly | teaching | era_joseon_hall_0 |
| scene-je5-baegundong-seowon | 백운동 서원 | assembly | teaching | era_joseon_hall_0 |
| scene-je5-dosan-seowon | 도산서원 | assembly | teaching | era_joseon_hall_0 |
| scene-hs-c1-gyoyungnyeong | 제1차 조선 교육령 | assembly | teaching | era_earlymodern_hall_0 |
| scene-hs-c1-gwangbokhoe | 대한 광복회 결성 | assembly | teaching | era_earlymodern_hall_0 |
| scene-hs-ge2-gukjagam | 국자감 | assembly | teaching | era_goryeo_hall_0 |
| scene-hs-ge4-yanghyeongo | 관학 진흥책과 양현고 | assembly | teaching | era_goryeo_hall_0 |
| scene-mt1-seowon-abolition | 서원 철폐 | court | teaching | era_joseon_hall_0 |
| scene-hs-wonsanhaksa | 원산 학사 설립 | assembly | teaching | era_earlymodern_hall_0 |
| scene-hs-mission-schools | 정동의 선교 학교들 | assembly | teaching | era_earlymodern_hall_0 |
| scene-hs-yugyeong | 육영공원 개교 | assembly | teaching | era_earlymodern_hall_0 |
| scene-hs-eulmi-reform | 을미개혁과 단발령 | court | teaching | era_earlymodern_hall_0 |
| scene-mt3-gwangmu | 광무개혁 | court | rail | station |
| scene-mt3-hanil-protocol | 한일 의정서 | court | rail | station |
| scene-hs-mt4-daehan-jaganghoe | 대한 자강회 | assembly | teaching | era_earlymodern_hall_0 |
| scene-hs-mt4-sinminhoe | 신민회 | assembly | teaching | era_earlymodern_hall_0 |
| scene-hs-mt4-gando-convention | 간도 협약 | court | rail | station |
| scene-hs-nb1-9seodang-10jeong | 9서당 10정 — 군대를 새로 짜다 | assembly | teaching | era_three_hall_0 |
| scene-hs-nb2-3s6b | 발해 3성 6부와 주자감 | assembly | teaching | era_three_hall_0 |
| scene-hs-sg2-taehak | 태학 설립 | assembly | teaching | era_three_hall_0 |

construction의 강화·고창·화순 고인돌 3건은 확정 정규식의 성곽·궁·사찰·근대산업에 해당하지 않아 범용 공사 무대를 유지했다. 이를 선사 취락으로 바꾸는 것은 이번 construction 설계에 포함되지 않는다.

## 미확인

- 실제 브라우저 화면에서 한눈에 장면 종류를 알아볼 수 있는지, 이름표와 건물·인물의 시각적 겹침: NOT_RUN. 브라우저·로컬 서버 실행 금지에 따랐다.
- 실제 착석 자세 및 탁자를 향한 회전: 미구현, idle 반원 배치로 표현했다.
- 실제 지도 해안에서 naval의 배치: NOT_RUN. 해안 stub의 모델 위치와 개수만 검증했다.
- 알려진 test_place_state 실패의 수정은 이번 범위 밖이다.


## 테스트·검증 원문

(node 테스트 288건 중 287 통과·알려진 실패 1건, audit 983건 오류 0, validate OK — 원문 로그는 저장소 밖 작업 기록에 둔다.)

## 적대 리뷰(정합성·보안·단순화 3렌즈) 반영 — 리더

CONFIRMED 로 채택해 고친 것:
- 공사(construction) 무대 판정을 **항목 장면에만** 적용하고 한 글자 대안(`성 `·`사 `·`절`·`궁`)을 없앴다. 옛 장면(나로호 발사·보림사 주성 발원·오대산사고 등)이 탑·성곽 무대로 가던 오탐을 막는다. setting(palace·temple)을 우선 본다.
- 육지 기준점의 archetype naval 장면에 배를 띄우는 것도 **항목 장면만**. 옛 육지 해군 장면은 근거를 로드하면 무대가 바뀌던 역전이 없어졌다.
- **바다(medium sea) 장면인데 기준점이 육지**면(왜구의 침입·노량 해전·대마도 정벌 등 12건) 순수 바다 분기 대신 원정 무대(해안 밖 배 3척 + 해안 인물)로 조립한다. 이전에는 배가 전부 생략되고 축척이 0 에 가까워져 장면이 통째로 사라졌다(공개 화면에서도 같은 상태였음).
- primary 무대 건물이 (0,-14) 에서 물에 빠지면 기준점으로 되돌린다 → 강화·한산도 같은 해안 장면이 `unlocated` 로 빠지지 않는다. 해군 무대에서 배를 하나도 못 놓으면 선착장이 primary.
- kind fire 의 불은 항목 장면 또는 effect 기록이 없는 장면에만 켠다(`effects.fire.enabled:false` 로 명시된 옛 장면은 근거 게이트 존중).
- 익명 군주 생략 조건이 asset-plan 이 넘기는 한글 역할(`군주`)과 조형 이름(`…_ruler`)을 본다(왕비·왕자는 제외).
- 고분 정규식에서 한 글자 `능` 제거(금동대향로 요약 "능산리" 오탐), `묘` 는 제목에서만.
- 종묘·사직처럼 setting 이 temple 인 유교 제례는 제단 뒤에 탑이 아니라 전각.
- else 분기의 도달 불가 court·assembly 잔재 삭제, portrait 무대 표를 `SETTING_STAGES` 하나로, `stageText` 제목 중복 제거, 캐시 키(`sceneVisualKey`)에 선사(-500)·항목 여부 추가, 테스트 파일 LF 통일, 이 보고서의 로그 덤프·로컬 경로 제거.
- 회귀 테스트 추가(`tests/scene-kinds.test.mjs` 마지막 test): 옛 장면 오탐 3건, 고인돌 선돌 무대, 한글 군주 역할, fire 게이트, 육지 기준점 바다 장면, 물에 빠진 primary 복귀, 종묘 전각.

기각·보류: 같은 배치 패턴의 도우미 추출(동작 동일 리팩터, 이번 범위 밖), compact naval `48/.16`(이미 제거), `event.year>=-500` 중복 검사(제거).
