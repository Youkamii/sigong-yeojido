# #187 시작 화면 화질 선택 — 2차 수정

A~E 수정과 기능 검증을 마쳤다. **F의 40% 단축 기준은 미달**이다. CPU 6배, 각 3회에서 낮음 중앙값 44.02초, 보통 69.89초로 **37.0% 단축**됐다. 보통의 마을/집/밭은 세 회차 모두 **58/1619/427**이다.

기준 브랜치 `feat/quality-gate-187`, HEAD `724eb5aa5fe732d13b20ebfd64f838ff176ee152`. 커밋·푸시·배포 없이 작업 트리만 수정했다.

## 바꾼 파일

| 파일 | 2차 수정 |
|---|---|
| `services/host/app/scene-quality.js` | `estimatedStride`와 사후 필터 제거, 낮음 `estimatedScale:.25`, 보통·높음 동일 객체 |
| `services/host/app/settlement-regions.js` | 기본 임계에 `context.scale??1` 곱하기 |
| `services/host/app/chronicle-scenery.js` | 부분집합·섬 보장, 동일 예산 전환 시 재빌드 생략, `rebuildForest()`, 점유 격자 항상 사용, 초기 `areaOccupied` 설정 |
| `services/host/app/quality-choice.js` | 추천 규칙, 저장값의 자동 여부, query 우선권과 저장 여부 결정 |
| `services/host/app/quality-gate.js` | 자동 저장 보존, query 버튼 잠금·문구·저장 생략, 수동 이벤트만 선택 반영, 문구 노드 null 검사 |
| `services/host/index.html` | mount 예외 처리, `{name,manual,persist}` 전달, 중복 query 분기 제거 |
| `services/host/app/atlas-ui.js` | 이벤트 detail 방어, 불필요한 title 갱신 제거 |
| `services/host/app/occupancy-grid.js` | `{cellSize,margin}` 인자, 기존 거리식의 덧셈 순서 유지 |
| `tests/scene-quality.test.mjs` | 실제 계획·선택, 결정론·부분집합·layout·섬·격자 상한·재빌드 검사 |
| `tests/quality-choice.test.mjs` | 기기 프로필, 자동 저장, query 저장 생략 검사 |
| `tests/occupancy-grid.test.mjs` | margin 포함 전수 검사와 비교, 칸 경계와 부동소수점 접점 검사 |
| `tests/scenery-detail.test.mjs` | 생성자를 생략한 스텁에 점유 영역 명시 |
| `scripts/measure_first_screen.py` | UTF-8 직접 출력, 배열 요약, URL·숫자 검사, Chrome 인자/채널 폴백 |
| `scripts/verify_quality_gate.py` | 입장·설정·저장·query·화면 검사 재현 스크립트 |
| 이 보고서와 `quality-gate-187/` | 측정·테스트·UI JSON·화면 캡처 교체, `known-failure.txt` 삭제 |

`chronicle-assets.js`는 1차 작업 트리의 숲 예산 적용을 그대로 사용한다. 이번 2차 수정에서는 추가로 바꾸지 않았다. 판톨로지 이식 파일 `engine.js`, `artbible.js`, `materials.js`, `style.js`, `util.js` 및 `vendor/`의 diff는 없다.

## 핵심 diff와 근거

- 낮음은 `seed % 4`로 사후 제거하지 않는다. 같은 후보의 같은 `seed % 100` 값에 더 낮은 임계를 적용한다. 일반 임계 선택은 이로써 보통의 부분집합이 된다.
- 섬 대체 후보와 격자 상한까지 있는 최종 선택에는 추가 처리가 필요하다. 예를 들어 같은 섬의 seed 99는 보통에서 탈락하고 130은 통과하지만, 낮음에서 둘 다 임계 탈락하면 기존 대체 규칙은 99를 새로 선택할 수 있다. 이를 막기 위해 낮음은 먼저 보통에서 최종 선택된 후보 안에서 임계와 섬 보장을 적용한다. 보통에서 유지된 중간·큰 섬은 낮음에서도 후보를 유지하며, 작은 섬의 최소 보장 없음과 기존 격자 상한은 그대로다.
- scale이 없는 기본 임계와 scale 1은 기존 값이다. 기본 임계는 scale .25에서 정확히 1/4이고, 사료 밀도 보정의 기존 최소·최대 제한은 유지한다. 실제 작은 세계의 계획·선택 및 대체 후보·격자 상한 반례를 테스트했다.
- `sceneBudget(new)===sceneBudget(old)`면 화질만 갱신한다. 숲은 `forestKey`의 `treeTrials`로 변화를 구분하고, 예산이 바뀔 때 `treeCandidates`만 무효화한다. 공통 `sync → buildForest → visible`은 `rebuildForest()`로 합쳤다.
- 게이트는 저장된 자동 결과와 미선택 추천값을 `manual:false`로 저장한다. 버튼 선택은 `manual:true`. 유효한 query는 `chooseQuality`에서 우선 적용하며 `persist:false`로 입장과 엔진 모두 저장을 생략한다.
- 점유 격자는 모든 화질에 쓰며 집·밭과 길에 각각 `freeHouse`, `freeRoad`를 사용한다. 최종 판정은 `Math.hypot(...) > radius + circle.radius + margin` 순서를 유지한다.

## 측정 표 — 전·후

Chrome headless, 1280×800, CPU 6배, 회차마다 새 context, 같은 8876 서버를 사용했다. 측정과 브라우저 검사는 서로 겹치지 않게 실행했다. 입장 클릭부터 아래 조건을 처음 만족한 animation frame까지 잰다. 프로파일 모듈 import와 게이트 이전 서버 준비는 포함하지 않는다.

```js
window.__sigong?.chronicleScene.assets?.scenery.stats.ready &&
!__sigong.chronicleScene.chronicle.loading && !__sigong.engine.fly
```

다음의 '전'은 작업 시작 때 있던 **1차 구현의 기존 측정값**이다. 재측정값으로 표시하지 않고 [phase1-summary.json](quality-gate-187/phase1-summary.json)에 따로 남겼다.

| 화질 | 1차 기존 중앙값 | 2차 새 회차 원문(초) | 2차 중앙값 |
|---|---:|---|---:|
| 낮음 | 52.04초 (3회) | 45.09 / 44.02 / 41.50 | 44.02초 |
| 보통 | 118.16초 (3회) | 69.89 / 69.48 / 70.26 | 69.89초 |
| 높음 | 82.44초 (1회) | 83.54 | 83.54초 |

현재 낮음은 보통보다 **37.0% 짧다**. 목표 40%에는 **3.0%p 부족**하며, 보통 중앙값이 같다면 낮음이 **41.93초 이하**여야 한다. 현재 낮음은 **2.09초 초과**했다. 이 결과로 40% 기준 통과를 주장하지 않는다.

별도로 기준 커밋 HEAD의 비교 측정도 새로 실행했다. 작업 트리를 되돌리지 않고 Playwright가 `git show HEAD:services/host/<파일>`의 index.html·atlas-ui.js·chronicle-assets.js·chronicle-scenery.js·settlement-regions.js를 제공했다. 나머지 리소스와 API는 같은 서버를 사용했다. 기준 커밋은 등급별 **1회**이므로 반복 측정의 중앙값과 같은 신뢰도로 해석하지 않는다.

| 화질 | 기준 커밋 새 측정(각 1회) | 2차 새 중앙값 |
|---|---:|---:|
| 낮음 | 74.19초 | 44.02초 |
| 보통 | 89.62초 | 69.89초 |
| 높음 | 96.55초 | 83.54초 |

원문: [before-low.json](quality-gate-187/before-low.json), [before-medium.json](quality-gate-187/before-medium.json), [before-high.json](quality-gate-187/before-high.json), [after-low.json](quality-gate-187/after-low.json), [after-medium.json](quality-gate-187/after-medium.json), [after-high.json](quality-gate-187/after-high.json).

| 장면 통계 | 1차 낮음 | 2차 낮음 | 보통(변경 전·후 동일) |
|---|---:|---:|---:|
| 마을 | 28 | 33 | 58 |
| 집 | 1003 | 948 | 1619 |
| 밭 | 175 | 221 | 427 |
| 추정 마을 | 12 | 17 | 42 |

낮음 추정 마을의 layout 분포는 **0:5 / 1:4 / 2:5 / 3:3**이다. 실제 브라우저에서도 낮음 17개가 보통 42개의 부분집합임을 확인했다. 낮음·보통 6회 모두 기록된 장면 2,239개와 문서화 구역 18개의 ID 해시가 같았다.

| 단계 누적 시간의 중앙값 | 2차 낮음 | 2차 보통 |
|---|---:|---:|
| 지형 | 8.64초 | 8.37초 |
| 장면 조립(내부 작업 포함) | 16.47초 | 42.00초 |
| 숲 | 3.09초 | 29.19초 |
| 추정 배경 | 1.74초 | 2.12초 |
| 첫 render | 0.35초 | 0.37초 |

단계 시간은 동기 호출의 누적값이며 내부 호출이 포함될 수 있어 합산하지 않는다. 첫 render 시간은 GPU 완료 시간이 아니다. 리소스 타이밍은 endpoint별 개수·누적/최대 시간·마지막 수신 시점으로 집계한다. 원래 배열은 개수와 SHA-256만 남긴다.

## 브라우저 검사 결과

[ui.json](quality-gate-187/ui.json): **20/20 통과, pageErrors 0**.

| 검사 | 실제 결과 |
|---|---|
| 저장값 없이 입장 | `{name:"medium",manual:false}` |
| 자동 저장값으로 입장 | `{name:"low",manual:false}`, 엔진 `_qualityLocked:false` |
| 낮음 버튼 클릭 후 입장 | `{name:"low",manual:true}` |
| `?q=low` | 버튼 3개 disabled, `검증용 화질(q=낮음)이 적용됩니다`, 기존 저장 문자열 그대로 |
| 설정 보통→높음 | `modelBuilds:14→14`, `refreshPeriod:0`, `buildForest:0` |
| 자동 화질 이벤트 | 게이트의 기존 수동 선택 유지 |
| detail 없음·추천 문구 노드 없음 | 예외 없음 |
| 390·820·1180px | 가로 넘침 없음, 생성한 화면 캡처 직접 확인 |

화면: [390px](quality-gate-187/gate-390.png), [820px](quality-gate-187/gate-820.png), [1180px](quality-gate-187/gate-1180.png), [낮음 장면](quality-gate-187/scene-low.png).

## 테스트 원문

알려진 `test_place_state.mjs`의 실패 테스트 **한 건만** 이름으로 제외했고, 같은 파일의 나머지 테스트는 실행했다.

```powershell
node --test --test-skip-pattern '^outside candidates retain dates, sources and authorship instead of vanishing$' tests/*.mjs
```

```text
1..207
# tests 207
# suites 0
# pass 207
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 5749.0257
```

전체 TAP: [tests.txt](quality-gate-187/tests.txt). Node의 이름 필터로 제외된 테스트는 위 집계에 들어가지 않는다.

[CLI 검사 원문](quality-gate-187/cli.json): 외부 URL, 음수 runs, 음수 timeout 모두 **exit 2**, stdout 비어 있음. Python 스크립트 문법 검사와 `git diff --check` 통과. JSON·TXT는 UTF-8 BOM 없이 저장한다.

재현 명령(Playwright가 설치된 Python 사용):

```powershell
python scripts/measure_first_screen.py --url http://127.0.0.1:8876 --quality low --cpu 6 --runs 3 --out docs/research/quality-gate-187/after-low.json
python scripts/measure_first_screen.py --url http://127.0.0.1:8876 --quality medium --cpu 6 --runs 3 --out docs/research/quality-gate-187/after-medium.json
python scripts/verify_quality_gate.py --url http://127.0.0.1:8876 --out docs/research/quality-gate-187
```

`--chrome <실행 파일>`을 생략하면 설치된 Chrome 채널을 사용한다. 외부 URL 측정에는 명시적인 `--allow-remote`가 필요하다.

## 미확인·미달

- **성능 목표 미달:** 낮음/보통 40% 단축 조건은 37.0%로 미달이다.
- 실물 패드의 GPU·메모리·발열·터치 사용성은 **NOT_RUN**이다.
- '자동' 선택 뒤 실제 5초 표본 창이 끝나며 보통으로 강등되는 전체 과정은 **NOT_RUN**이다. 동일 예산의 자동 강등은 단위 테스트로, 수동 보통→높음 재빌드 생략은 실제 브라우저로 확인했다.
- 커밋·푸시·배포는 실행하지 않았다. 작업용 8876 서버와 검사 브라우저는 종료했고 리더의 8878 서버는 유지했다.
