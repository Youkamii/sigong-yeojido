# #204 — 철(iron) 재질이 검게 보이는 문제

## 원인 (확인됨 — 실행 중인 뷰어에서 직접 계측)

애초 추정은 "장면에 환경맵이 없어서 PBR 금속이 검게 나온다" 였다. **이 추정은 틀렸다.**

브라우저에서 확인한 사실:

- `scene.environment` 는 살아 있다. `index.html` 초기화에서 `engine.bakeEnvironment(mood)` 가 실제로
  불리고, PMREM cubeUV 텍스처(768×1024)가 씬에 붙어 있다.
- 철 부품 재질은 `MeshPhysicalMaterial`, `envMapIntensity 1.25`, 자체 `envMap` 은 없고
  `scene.environment` 를 받는다. 환경 반사는 정상 경로로 들어온다.

진짜 원인은 **알베도(바탕색)가 너무 어두운 것 + 순금속 설정**의 조합이었다.

- 철 부품은 정점색(vertex color)으로 역할색 `STRUCT.IRON` 을 받는다. 그 값은
  `darken(P.SECOND_SLATE, 0.18)` = `#3d4248`, 선형(linear) RGB 로는 **0.047** 이다.
  실제 메시의 color 속성을 읽어 `0.047, 0.054, 0.065` 를 확인했다.
- `metalness: 1.0` 인 순금속은 **확산광(diffuse)이 0** 이다. 형태를 읽히게 해 주는 KEY·FILL 빛이
  전부 버려지고 거친 하늘 반사만 남는다.
- 여기에 ACES 톤매핑이 어두운 쪽을 더 눌러 화면에서는 완전한 검은 덩어리가 된다.

교차 확인 (모두 실행 중인 화면에서 값을 바꿔 가며 캡처):

- metalness 만 `1.0 → 0.45` 로 낮춘 경우: **거의 달라지지 않았다.** 알베도가 이미 0.047 이라서다.
- 정점색을 3배로 밝힌 경우: 비로소 형태와 음영이 읽혔다. 6배는 콘크리트처럼 떠 보였다.
- 그래서 둘을 같이 고쳤다.

금(`MAT_METAL_GOLD`)은 같은 문제가 아니다. `ACCENT_GOLD` 의 선형값이 **0.578** 로 철의 12배라
metalness 1.0 이어도 죽지 않는다. 1443 장면에서 금만 metalness 0.45 로 내려 찍어 비교했을 때
화면 차이가 없었다 (`gold-1443-before.jpg` ↔ `gold-1443-metalness045-experiment.jpg`).
**금은 손대지 않았다.**

## 바꾼 값

### `services/host/app/artbible.js`

| 항목 | 전 | 후 |
| --- | --- | --- |
| `STRUCT.IRON` (역할색) | `darken(P.SECOND_SLATE, 0.18)` | **그대로** |
| `STRUCT.IRON_METAL` (신규) | — | `lighten(P.SECOND_SLATE, 0.20)` → `#6f747a` (선형 0.159) |
| `MAT_METAL_IRON.metalness` | `1.0` | `0.45` |
| `MAT_METAL_IRON.roughness` | `0.42` | `0.55` |

### `services/host/app/landmarks.js`

- 역할색 표에 `ironMetal` 추가.
- `Assembly.push` 에서 **재질 계열이 IRON 이고 색이 iron 역할색일 때만** `ironMetal` 로 바꾼다.

역할색 `iron` 은 금속 부품 말고 **지붕·창틀의 색**으로도 널리 쓰인다
(`period-buildings.js` 의 `m:'stone', c:'iron'` 기와지붕 등). 그래서 역할색 자체를 밝히면
조선 기와지붕까지 회색으로 떠 버린다 — 실제로 1차 시도에서 그렇게 됐다.
부품이 조립되는 유일한 길목이 `Assembly.push` 라 거기서 철 **재질** 부품만 갈라냈다.
`assetforge.js` 가 `b.box(..., FAMILY.IRON, C.iron)` 처럼 직접 넣는 수십 군데와
`assetblueprint.js` 의 blueprint 경로가 전부 이 한 곳을 지난다.

환경맵은 새로 추가하지 않았다. 이미 있으므로 로딩·성능 비용이 드는 변경은 하지 않았다.

## 캡처

같은 조건(뷰포트 1440×900, 화질 low)에서 철 재질 메시 중 가장 큰 것을 찾아 그 앞에 카메라를
세우고 찍었다. 전후 카메라 위치가 같다 (좌표를 로그로 확인).

| 연도 | 전 | 후 |
| --- | --- | --- |
| 1987 근현대 도시 (이슈 재현 화면) | `before-1987.jpg` | `after-1987.jpg` |
| 1919 일제강점기 역 | `before-1919.jpg` | `after-1919.jpg` |
| 1592 한산도 거북선 | `before-1592.jpg` | `after-1592.jpg` |
| 1443 (참고) | — | `after-1443.jpg` |

1987 에서는 검은 덩어리였던 저장 탱크·굴뚝이 형태와 음영이 읽히는 강철 회색이 됐다.
1919·1592 에서는 지붕 색이 전과 똑같이 어두운 슬레이트로 남아 있다 — 역할색을 건드리지 않았기 때문이다.

금 참고용: `gold-1443-before.jpg`, `gold-1443-metalness045-experiment.jpg` (실험만, 코드 미변경).

## 테스트

`node --test tests/*.mjs` — 404개 중 403 통과, 1 실패.
실패는 기존 실패인 `tests/test_place_state.mjs` 의
"outside candidates retain dates, sources and authorship instead of vanishing" 한 건이며
이번 변경과 무관하다 (변경 전에도 같은 한 건이 실패했다).
