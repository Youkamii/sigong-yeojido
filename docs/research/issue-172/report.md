# 이슈 #172 작업 트리 보고

기준 HEAD: `3b0e90f2`. 커밋·푸시·서버 재시작·배포 없이 작업 트리만 수정했다.

## 바꾼 파일

- `services/host/app/scenery-period.js`: 사이트별 전환 시점, 집 변종 선택 공통 함수.
- `services/host/app/settlement-regions.js`: 사이트 시대별 밀도·밭, 정렬·필터 뒤에도 유지되는 `lotIndex`.
- `services/host/app/scenery-house-form.js` (신규): 상세 카탈로그에 대응하는 원경 지붕 형태·비율.
- `services/host/app/scenery-overview.js`: 6각 원뿔·맞배·평지붕, 비율·방향 적용, 변경된 480단위 묶음만 재생성.
- `services/host/app/chronicle-scenery.js`: 사이트 프리셋 연결, 셀·상세 캐시 재사용, 부분 갱신 통계.
- `tests/scenery-period.test.mjs` (신규): 결정론, 모든 경계, 도시 예외, 북부 현대 회귀.
- `tests/scenery-overview.test.mjs`: 실제 정점의 꼭짓점·용마루·평지붕, 비율·방향, 기존 삼각형 예산과 비교.
- `tests/scenery-detail.test.mjs`: 상세 변종·인물 일치, 부분 갱신·역방향·추가·제거·전체 재생성 동등성.
- `scripts/check_scenery_identity.mjs` (신규): 실제 지형·사이트로 삼각형 수와 연도 갱신 비용 재현.
- `docs/research/issue-172/`: 이 보고서와 `far-before.txt`, `far-after.txt`, `refresh-cost.txt`, `tests-before.txt`, `tests-after.txt`.

판톨로지 이식 파일 5개와 `services/host/vendor/`의 Git diff는 비어 있다. `agents/openai.yaml`을 수정하지 않았으며, 금지한 폴더의 파일을 읽거나 실행하지 않았다.

## 핵심 diff

```js
export function sitePeriod(site,year){
  const offset=(Number(site.seed)>>>0)%51-25;
  return sceneryPeriod(site.kind==='urban'?year:year-offset);
}
```

`sceneryPeriod(year)`와 시대 표는 그대로 유지했다. 같은 사이트에 하나의 오프셋을 써서 인접 경계의 순서가 뒤집히지 않는다. 현재 표의 1955·1973을 포함한 12개 경계를 모두 적용했다. 근대의 여러 경계는 ±25년 구간이 겹치므로 Y−26에서 '그 경계를 아직 넘지 않음', Y+26에서 '이미 넘음'을 검사하고, 간격이 넓은 경계는 정확한 이전·다음 프리셋도 검사했다.

```diff
- add(h.archetype||'rural_cottage',h.x,h.z,h.scale,h.angle||0);
+ add(sceneryHouseRecipe(h,period,site,h.index).archetype,h.x,h.z,h.scale,h.angle||0,true);
```

집의 고정 `lotIndex`로 원경과 근경이 같은 변종을 선택한다. 상세 셀을 가까운 집부터 정렬하거나 사건에 가려진 집을 필터해도 변종이 바뀌지 않는다. 지붕의 주된 가로·세로 비율과 `site.angle + house.angle`을 원경에 적용했다. 선사는 6각 원뿔, 기와집은 기존 상세 카탈로그처럼 맞배형, 현대는 평지붕 상자와 낮은 맞배형을 해당 상세 집과 동일하게 선택한다. 현대의 기와·판지붕 농가를 모두 평지붕으로 바꾸지는 않았다.

연도 키에 사이트별 프리셋 ID를 넣었다. 같은 프리셋이면 연도가 바뀌어도 재생성하지 않는다. 변경된 사이트만 배치를 만들고, 기존 원경 묶음 중 해당 사이트가 들어간 묶음만 다시 만든다. 변하지 않은 상세 캐시와 다른 묶음의 GPU 자원은 유지한다. 농촌 사이트의 추가·제거도 부분 갱신한다. 도시 경계가 달라져 주변 필지를 다시 잘라야 하거나 사건 점유가 바뀌면 전체 배치를 갱신하는 기존 경로를 쓴다. 이름 있는 사건·도시 장면 코드는 수정하지 않았다.

북부 1700년 대체는 작업 시작 전에 이미 `068143dd`에서 제거돼 있었다. 과거 위치는 `068143dd^:services/host/app/scenery-period.js:33`(주거)와 `:37`(창고·시장)이다. 기존 코드의 남은 위도 37.7 조건은 트랙터 선택뿐이다. 1980년 위도 39·경도 125.8을 포함해 남북의 같은 seed가 같은 주거·창고·시장 프리셋을 고르는 회귀 테스트를 추가했다.

## 테스트 원문

명령: `node --test tests/*.mjs` (종료 코드 1: 알려진 실패 1건).

변경 전 원문: [tests-before.txt](tests-before.txt). 변경 후 전체 원문: [tests-after.txt](tests-after.txt).

```text
1..107
# tests 107
# suites 0
# pass 106
# fail 1
# cancelled 0
# skipped 0
# todo 0
# duration_ms 2940.3107
```

```text
not ok 95 - outside candidates retain dates, sources and authorship instead of vanishing
    Expected values to be strictly equal:
    0 !== 1
```

실패 위치는 `tests/test_place_state.mjs:69:10`. 변경 전에도 같은 테스트에서 `expected: 1`, `actual: 0`으로 실패했다(99건 중 98건 통과). 새 테스트 8건을 포함한 나머지 106건은 통과했다.

추가로 실행한 `node scripts/test_scenery_period.mjs` (종료 코드 0):

```text
PASS: era settings, mixed roofs, tools, anonymous people, northern source scope and wildlife display
```

`git diff --check` 종료 코드 0. 공백 오류 없음.

## farTriangles 전후

실제 `ChronicleWorld` 지형·문서화 사이트·추정 사이트·도시 프로필을 읽고 `ChronicleScenery.refreshPeriod()`의 `stats.farTriangles`를 비교했다. 사건 점유는 빈 배열, Node의 캔버스 텍스처 그리기만 대체했다. 상세 주택을 만드는 경로는 측정에 호출하지 않았다.

| 연도 | 변경 전 | 변경 후 | 차이 |
|---|---:|---:|---:|
| -2000 | 12,638 | 13,750 | +8.80% |
| -500 | 32,332 | 34,530 | +6.80% |
| 600 | 52,542 | 52,542 | 0.00% |
| 1200 | 67,246 | 67,246 | 0.00% |
| 1700 | 82,864 | 82,864 | 0.00% |
| 1960 | 95,254 | 93,954 | -1.36% |
| 1975 | 101,048 | 98,564 | -2.46% |
| 2000 | 91,072 | 99,576 | +9.34% |
| 2020 | 89,836 | 98,020 | +9.11% |

모든 측정이 ±20% 안이다. `farDraws`도 각 연도에서 동일한 14~24개였다. 1960년 집 수는 사이트별 전환으로 4,275→4,259가 됐고 나머지 측정 연도의 집 수는 동일했다. 별도 테스트에서는 같은 사이트·집 배열을 두고 변경 전 삼각형 계산식과 새 실제 지오메트리도 비교했다.

원문: [변경 전](far-before.txt), [변경 후](far-after.txt).
재현: `node scripts/check_scenery_identity.mjs`.

연도 갱신 비용 원문: [refresh-cost.txt](refresh-cost.txt).
재현: `node scripts/check_scenery_identity.mjs --refresh`.
1392년 경계의 1367~1417년을 순서대로 이동한 51회에서 갱신 사이트 1~15개, 재사용 셀 166~191개, 다시 만든 draw 묶음 3~18개였다. `refreshPeriod` 자체는 12.83~151.13ms, 경로 동기화 등을 포함한 `setYear`는 13.12~152.45ms였다. 구간 밖 1361·1362·1366·1418·1501·1502년에는 재생성 0회였다. 이 수치는 로컬 Node의 단일 실행으로, 브라우저 GPU 프레임 시간이 아니다. 사이트 시작·종료나 도시 활성화가 있는 해는 경계 구간 밖에서도 기존처럼 갱신할 수 있다.

## 미검증

- 브라우저/WebGL에서 실제 원경↔근경 화면 전환과 지붕색 체감: NOT_RUN.
- 브라우저 GPU 프레임 시간·메모리·실제 사건 점유가 있는 장면의 성능: NOT_RUN.
- 서버 재시작·배포 후 검증: NOT_RUN (요청으로 실행 금지).
- 원경은 주요 형태의 단순 모델이다. 처마 장식·마루·현관 같은 세부까지 상세 모델과 동일하지 않다.

## 제안

반영 전 브라우저에서 선사·조선·현대의 같은 사이트를 확대·축소하고, 1392년 전후를 연도별로 이동하며 형상 전환과 프레임 지연을 확인한다. 상세 카탈로그의 주요 지붕 치수가 바뀔 때에는 `scenery-house-form.js`도 함께 갱신한다.
