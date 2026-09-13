# #190 portrait·heritage 작업 트리 검증

기준 HEAD: `9878f55ec89b750d5cbaab48a83f471645cc55c1`, 브랜치 `feat/scene-kinds-190`.
커밋·푸시·배포는 하지 않았다. 직접 띄운 서버와 브라우저는 종료했다.

## 바꾼 파일과 핵심 diff

| 파일 | 변경 |
|---|---|
| services/host/app/chronicle-event-scenes.js | portrait 반경 7, 중심 인물 1명·수행원 최대 4명·작은 무대. heritage 9종 조립. 성문·가마 구성 공유 |
| services/host/app/heritage-models.js | 새 문화재 blueprint. 기존 재질 계열·artbible 색·베벨 사용 |
| services/host/app/chronicle-asset-plan.js | heritageType·heritageFloors 전달 |
| services/host/app/chronicle-assets.js | 새 카탈로그 확장 연결 2줄 추가·1줄 변경 |
| services/host/app/chronicle-persistence.js | 유형·층수·무대 힌트 캐시 키와 반경 반영 |
| services/host/app/chronicle-scene.js | portrait 위치 설명을 참여자 행에서도 찾음 |
| services/host/app/facility-persistence.js | 명시한 문화재 시설 존속 기간·근거·기존 지형·소멸 판정, 같은 외형 유지 |
| scripts/check_fact_research.py | 두 kind·heritageType 9종·heritageFloors 3/5 검사 |
| scripts/build_history_scenes.py | 허용값 검사와 새 필드 보존 |
| scripts/scene_vocabulary.py | 문화재 유형 목록 공유. 원래 기본 집단을 만들지 않으므로 기본 집단 생성은 추가하지 않음 |
| tests/scene-kinds.test.mjs | 패킷→행→실제 메시·선택 대상→기존 카드 HTML, 9종 외형·수행원 상한·축소·존속·캐시 검사 |
| tests/test_check_fact_research.py | 정상·잘못된 kind/문화재 유형/층수 검사 |
| tests/test_import_facts.py | 실제 빌드의 필드 보존·잘못된 값 거부 검사 |
| tests/fixtures/scene-kinds-190/history-scenes.sample.json | 요청한 표본 4건과 합성 검사용 entities·claims |
| docs/research/facts-format.md | kind 목록과 새 필드 설명 3줄 |
| docs/research/scene-kinds-190/ | 이 보고서, PNG 4장, capture-evidence.json |

## 테스트 원문

`node --test tests/*.mjs`

```text
1..217
# tests 217
# suites 0
# pass 216
# fail 1
# cancelled 0
# skipped 0
# todo 0
# duration_ms 7326.5717
```

알려진 실패 1건: `tests/test_place_state.mjs:69`, `outside candidates retain dates, sources and authorship instead of vanishing`, `0 !== 1`. 그 밖에는 통과했다. 전체 출력: [(테스트 원문은 커밋 메시지·이 보고서 집계)]((테스트 원문은 커밋 메시지·이 보고서 집계)).

`python -m unittest discover -s tests -p "test_*.py"`

```text
Ran 170 tests in 55.071s

OK
```

전체 출력: [](). `data root does not exist`는 없는 경로를 검사하는 기존 테스트 출력이다. 신규 조립기 테스트 8건도 모두 통과했다.

## 캡처

요청한 Fuseki 주소·포트 8880의 로컬 서버, 지정된 Playwright Python과 Chrome headless를 사용했다. 첫 화면에서 ‘들어가기’를 누른 뒤 요청한 준비 판정식을 그대로 사용했다. 연도는 `#historyYear`에 입력 후 Enter, 카메라 target은 `world.toWorld(lon,lat)`의 지표점, 높이 60·거리 60, 화면 1280×800이다.

| 파일 | 크기(bytes) | 확인한 장면 |
|---|---:|---|
| [1443-sejong.png](1443-sejong.png) | 994513 | 경복궁 세종 인물·이름 카드·‘훈민정음을 만든 임금’ 역할 |
| [1441-rain-gauge.png](1441-rain-gauge.png) | 993725 | 한양 관상감 터의 진열 유물 실루엣과 문화재 근거 요약 |
| [751-dabotap.png](751-dabotap.png) | 999384 | 불국사 3층 석탑 설명 모형과 제목·연도 카드 |
| [414-gwanggaeto-stele.png](414-gwanggaeto-stele.png) | 927019 | 국내성 좌표의 비석·받침과 제목·연도 카드 |

4장 모두 직접 열어 확인했다. PNG IDAT만 무손실 재압축했고 압축 해제 바이트가 같음을 검사했다. 브라우저 pageerror는 0건. [capture-evidence.json](capture-evidence.json)에 행·선택 가능 여부·카드 텍스트·좌표 지형 확인을 남겼다.

## 표본 범위와 원복

표본은 사용자 지정 내용을 담은 합성 검사용 데이터다. 실제 `history-scenes.json`에 표본 scenes와 source를 임시 추가했고, 기존 근거 필터를 통과시키기 위한 표본 entities·claims만 Playwright의 `/api/chronicle` 응답에 추가했다. 실제 사료 조사·인용 검증 결과는 아니다.

캡처 뒤 원래 파일 바이트를 복구했다. `git diff --exit-code -- services/host/app/history-scenes.json` 결과는 출력 없음·exit 0. 복구 SHA-256: `c138030b54d90053cf952779af1bed220d5f0c86e38c90126d0f4c39c2dfc558`.

금지된 이식 파일과 vendor 변경 없음, `git diff --check` 통과. 국내성 좌표도 현재 뷰어에서 지형과 비석 표시를 확인했다. #186 실제 982건 연동과 나머지 6종 문화재의 브라우저 캡처는 NOT_RUN이며, 9종 모두 실제 메시 생성·선택 단위 테스트는 통과했다.
