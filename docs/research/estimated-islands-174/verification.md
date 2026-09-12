# 이슈 #174 후속: 섬의 추정 생활 배경

작업 브랜치는 시작부터 `feat/era-world-174-islands`였으며 그대로 유지했다.
HEAD는 `4b0bbfca4988617d749d4dbcea78d4535ea84592`다. 커밋, 푸시, 서버 재시작, 배포는 실행하지 않았다.

## 바꾼 파일

- `services/host/app/settlement-regions.js`: 가장 큰 링의 기존 격자는 유지하고, 섬별 격자와 작은 배경 배치를 추가했다.
- `services/host/app/chronicle-scenery.js`: 양보 조건을 통과한 후보에 링별 최소 선택을 추가했다.
- `tests/estimated-sites.test.mjs`: 본토 회귀, 작은 섬, 지형 조건, 최소 seed 선택, 양보, 실제 지형, 같은 시대 재사용 검사를 추가했다.
- `scripts/check_estimated_islands.mjs`: 실제 지형과 문서화 zone, 도시 프로필을 불러와 생성자와 `refreshPeriod`를 실행한다.
- 이 폴더의 `verification.md`, `tests-before.tap`, `tests-targeted.tap`, `tests-after.tap`, `world-before.json`, `world-after.json`: 보고와 실행 원문이다.

## 핵심 diff

- 링 면적으로 본토를 찾는다. 본토의 24단위 격자, id, seed, 고도·경사·해안 조건과 배치 순서는 유지한다.
- 섬의 기본 간격은 `max(8, min(24, width / 4))`, 목표 개수는 `max(2, ceil(area / 576))`다. 부족하면 최대 7회 더 세분한다.
- 섬 후보의 반경과 해안 여백을 줄이되 고도·경사 검사는 유지한다. 지형 조건을 만족하지 않는 지점을 억지로 채우지는 않는다.
- 후보에 `ringIndex`를 기록한다. 문서화·도시·사건에 양보한 뒤 시대 문턱을 통과한 후보가 없는 링은 남은 후보 중 최소 seed 한 곳을 선택한다.
- 작은 후보는 기존 집 배치 간격 때문에 집이 0채가 되는 문제가 있어 집의 위치·크기, 밭, 길을 후보 반경에 맞춰 축소한다. 본토 후보에는 적용되지 않는다.
- 앱의 후보 생성 호출은 생성자 한 곳, 선택 호출은 `refreshPeriod` 한 곳을 유지했다. 같은 시대 안에서 연도를 바꾸면 후보와 선택 결과를 재사용하는 테스트를 통과했다.

## 테스트 원문

원문: [변경 전 전체](tests-before.tap), [변경 후 집중](tests-targeted.tap), [변경 후 전체](tests-after.tap).

```text
node --test tests/estimated-sites.test.mjs
# tests 8
# pass 8
# fail 0

node --test tests/*.mjs
# tests 90
# pass 89
# fail 1
```

전체 테스트 종료 코드는 1이다. 유일한 실패는 변경 전에도 재현된 `tests/test_place_state.mjs:63`의
`outside candidates retain dates, sources and authorship instead of vanishing`, `0 !== 1`이다.
변경 전에는 85개 중 84개 통과, 같은 1개 실패였다. `git diff --check`는 종료 코드 0이다.

## 실제 world 결과

실행: `node scripts/check_estimated_islands.mjs`.
실제 `ChronicleWorld`에 outline, elevation, geography, neighbor outline, 장소 자료, 장면 자료와 도시 프로필을 사용했다.
Node에서 캔버스의 텍스처 그리기만 stub 처리했다. 지형 삼각형과 `surfaceAt`, `ChronicleScenery.refreshPeriod`의 배치·개요 메시 생성은 실제 코드다.

원문: [변경 전](world-before.json), [변경 후](world-after.json).

- 전체 후보: 112 → 360. 본토 후보: **110 → 110**. 평지 stub: **261 → 261**.
- 섬 123개 링 모두 면적별 목표 개수를 충족했다. 문서화·도시·사건 점유를 주지 않은 선택 테스트에서는 선사·조선 모두 모든 링에 한 곳 이상 남았다.
- 제주(ring 4): 2 → 6개. 강화(ring 10), 거제(ring 2), 진도(ring 3): 각각 0 → 2개.

| 연도 | 제주 선택 전 → 후 | 본토 선택 전 → 후 | 제주 배치에 남은 사이트 | 제주 집 | 제주 밭 |
|---|---:|---:|---:|---:|---:|
| -2000 | 0 → 1 | 10 → 10 | 1 | 4 | 0 |
| 600 | 0 → 2 | 21 → 21 | 2 | 24 | 19 |
| 1795 | 0 → 2 | 43 → 43 | 2 | 35 | 19 |
| 2020 | 1 → 2 | 57 → 57 | 2 | 37 | 18 |

집과 밭 수는 화면 배치 수이며 역사적 인구나 가구 수의 추정이 아니다.
1955년부터 실제 제주 도시 프로필 반경 안의 후보가 제외되는 테스트도 통과했다.

## 미검증

- 브라우저 화면, 실제 카메라 거리에서의 가독성 및 작은 섬의 축소된 집 크기: NOT_RUN.
- 김만덕 구휼 등 실제 사건 배치를 합친 전체 화면: NOT_RUN. 위 실제 world 수치는 사건 점유 배열을 비운 상태이며, 문서화 zone과 도시 프로필은 적용했다. 사건 점유 양보 자체는 단위 테스트로 확인했다.
- 모든 입력 지형에 대한 무조건 최소 개수 보장: 하지 않는다. 전부 높은 지형, 가파른 경사, 비정상 높이는 계속 제외하며 현재 실제 지형의 모든 섬 링은 목표를 충족했다.

## 제안

다음 화면 검수에서 제주와 강화·거제·진도를 여러 시대와 가까운 카메라 거리로 확인하고, 축소된 집 크기가 보기 적당한지 점검한다.
