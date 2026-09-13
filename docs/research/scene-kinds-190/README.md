# #190 portrait·heritage 적대 리뷰 반영 2차

브랜치 `feat/scene-kinds-190`. `main`의 문서 커밋 `8eef53a0` 위로 충돌 없이 리베이스했다.
리베이스 후 HEAD: `d5184afbfcbb9a9aeeeeda9a686b271adc4846d8`. 이번 수정은 작업 트리에만 있으며 새 작업 커밋·푸시·배포는 하지 않았다.

## 바꾼 파일 / 핵심 diff

| 파일 | 이번 변경 |
|---|---|
| services/host/app/chronicle-event-scenes.js | 알 수 없는 heritageType→site. portrait 무대 primary 유지, place.setting 표만 사용, temple→pagoda. 죽은 sceneFunction 제거. kiln 직접 메시와 fortress 기존 조립 복구. 공통 크기·반경·초점 사용 |
| services/host/app/heritage-models.js | JS HERITAGE_TYPES 한 곳, HERITAGE_DISPLAY(scale=LANDMARK_SCALE.MAX=2.2, radius=8, focus=40), ledge/band 색 어휘와 base/body/roof/top/ornament 태그 |
| services/host/app/facility-persistence.js | from 유한수 검사, 명시 근거가 있는 문화재의 기록된 존속 문구. from/to·현존·왕조 경계 미적용 계약 주석 |
| services/host/app/chronicle-persistence.js | sceneRadius 공유 함수, compact의 실제 maxRadius도 캐시 키에 포함, 문화재 존속의 0.7 축소 제외 |
| services/host/app/assetcatalog.js | 기본 compileAssetCatalog 경로에서 문화재 카탈로그 확장 |
| services/host/app/chronicle-assets.js | 개별 확장 호출 제거. 단일 모형의 거리 제한에서 도시 중심점 제외; 다른 사건과의 거리 제한은 유지 |
| scripts/scene_vocabulary.py | KINDS, PLACE_SETTINGS, 공통 scene_kind_errors |
| scripts/check_fact_research.py | 공통 검사 사용, place.setting 열거 검사, portrait/heritage sceneFunction 및 portrait 예외 제거 |
| scripts/build_history_scenes.py | 검증기 의존 제거. 공통 검사 결과를 ValueError로 거부하여 python -O에서도 유지 |
| docs/research/facts-format.md | kind·문화재 유형·표시용 층수 3/5·무대 열거·인물/존속 규칙 정리 |
| tests/scene-kinds.test.mjs | 테스트 표본 2건, 존속 1종. 9종 메시·기본 카탈로그·도시 안 크기·미지 유형·빈 참여자/누락 인물·compact 무대 카드·ID 중복·setting 표·캐시 검사 |
| tests/test_check_fact_research.py | 공유 어휘 참조와 새 setting/sceneFunction 계약 검사 |
| tests/test_import_facts.py | 실제 빌드를 python -O로 실행해 kind/type/floors 거부 및 정상 필드 보존 검사 |
| tests/fixtures/scene-kinds-190/history-scenes.sample.json | LF 저장. 캡처용 4건은 유지하고 JS 테스트는 첫 2건만 사용 |
| docs/research/scene-kinds-190/README.md | 이번 결과로 갱신하고 깨진 링크 2곳 제거 |
| docs/research/scene-kinds-190/capture-evidence.json | 장면별 rows에는 id·scale만 보존 |
| docs/research/scene-kinds-190/*.png | 새 크기로 4장 재촬영 |

`tests/scene-function-data.test.mjs`의 하드코딩 목록은 이미 portrait/heritage가 없는 최종 허용목록과 같아 수정하지 않았다.

무대가 사건 행이고 인물은 별도 인물 행이다. 둘 다 primary여도 인물 분기가 먼저 적용되어 사건 ID와 인물 ID가 겹치지 않는다. 참여자가 비었거나 context.people에 없어도 compact 무대·선택 대상·사건 카드가 남는 것을 실제 조립/행/메시/카드 테스트로 확인했다.

단일 모형은 `.16` 축소 대신 `Math.min(displayScale, maxRadius/radius)`를 적용한다. 도시 안 모형의 크기를 도시 중심까지의 거리로 제한하면 측우기가 주변 집보다 작아져, portrait/heritage에서만 도시 중심점을 이웃 거리 계산에서 제외했다. 다른 종류의 조립/배치 규칙은 그대로다.

## 테스트·스크립트 원문

`node --test tests/*.mjs` — exit 1, 알려진 실패 1건 외 통과.

```text
1..217
# tests 217
# suites 0
# pass 216
# fail 1
# cancelled 0
# skipped 0
# todo 0
# duration_ms 6855.2425
```

기존 실패: `tests/test_place_state.mjs:69`, `outside candidates retain dates, sources and authorship instead of vanishing`, `0 !== 1`.

`python -m unittest discover -s tests -p "test_*.py"` — exit 0.

```text
Ran 171 tests in 26.157s

OK
```

기존의 없는 경로 검사에서 출력하는 `data root does not exist`는 정상 테스트 출력이다. 새 Python 빌드 검사는 `-O`로 실행했다.

`node scripts/check_scenery_coexist.mjs` — exit 0.

```json
{
  "year": 1795,
  "sceneId": "scene-syj128-kim-mandeok-jeju-1795",
  "composition": "relief",
  "sceneRadius": 24,
  "eventModels": 9,
  "footprintRadii": [
    3
  ],
  "settlementMarkerRadius": 0,
  "forestAndPathRadius": 24,
  "jejuCandidates": 6,
  "jejuRenderedSites": 1,
  "jejuHouses": 20,
  "sites": [
    {
      "id": "estimated-region:island:4:0:2:1",
      "houses": 20,
      "fields": 7
    }
  ],
  "mode": "Real ChronicleAssets.rebuild, terrain, event models, forest and settlement geometry; single-scene plan; canvas drawing stubbed; no browser or async wildlife."
}
```

`node scripts/test_village_runtime.mjs` — exit 1.

```text
node:internal/modules/run_main:123
    triggerUncaughtException(
    ^

AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

97 !== 88

    at ./scripts/test_village_runtime.mjs:27:52 {
  generatedMessage: true,
  code: 'ERR_ASSERTION',
  actual: 97,
  expected: 88,
  operator: 'strictEqual'
}

Node.js v22.17.0
```

문화재 확장 전 `main:services/host/app/assetcatalog.js`를 사용한 동일 스크립트도 `97 !== 88`로 실패했다. 카탈로그에서 문화재를 찾지 못하는 오류는 없으며, 마을 수 기대값 88과 현재 결과 97의 불일치는 미해결로 남겼다. 그 이후 스크립트 검사는 실행되지 않았다.

기존 조립 결과 대조 원문:

```text
PASS: kiln and fortress models, occupied, geometry, materials and transforms match main (full + compact).
```

## 캡처 4장과 scale

포트 8880 서버에 지정된 Fuseki 주소를 사용했다. 지정된 Playwright Python과 Chrome headless로 1280×800에서 실행했다. 들어가기→연도 입력→장면 준비 대기→기존 카드 선택 후 캡처했다. 카메라는 실제 행 위치를 바라보고 높이 40·수평 거리 60을 사용했다. 카드 선택으로 재조립이 끝난 뒤의 행 scale을 기록했다.

| 캡처 | 장면 | scale |
|---|---|---:|
| [1443-sejong.png](1443-sejong.png) | 세종 · 무대 / 인물 | 1.43 / 3.96 |
| [1441-rain-gauge.png](1441-rain-gauge.png) | 측우기 | 2.20 |
| [751-dabotap.png](751-dabotap.png) | 불국사 다보탑 | 2.20 |
| [414-gwanggaeto-stele.png](414-gwanggaeto-stele.png) | 광개토대왕릉비 | 2.20 |

4장을 직접 열어 확인했다. 측우기와 다보탑이 주변 집보다 크게 보이며 제목·연도·근거 요약 카드가 표시된다. 브라우저 pageerror는 0건이다. [capture-evidence.json](capture-evidence.json)은 실제 표시된 행의 id·scale만 담는다. 표의 값은 선택 화면 기준이며 다른 사건과 가까우면 반경 제한에 따라 작아질 수 있다.

## 원복·미확인

합성 표본 4건과 source를 실제 history-scenes.json에 임시로 추가했고, 표본 entities·claims만 /api/chronicle 응답에 추가했다. 실제 사료 조사·인용 검증 결과가 아니다.

캡처 후 파일을 원래 바이트로 복구했다. `git diff --exit-code -- services/host/app/history-scenes.json`은 출력 없음·exit 0.
복구 SHA-256: `c138030b54d90053cf952779af1bed220d5f0c86e38c90126d0f4c39c2dfc558`.
서버와 브라우저를 종료했다. 새 콘솔 창을 띄우지 않았고 판톨로지 이식 파일은 수정하지 않았다. `git diff --check`도 통과했다.

임시 검사 파일은 `.tmp-scene190/`에 남아 있다. 워크트리 안의 해당 경로를 확인했지만 자동 실행 정책이 폴더 삭제를 `blocked by policy`로 거부했다. 서버·브라우저 프로세스 종료와 임시 패킷 원복은 완료했다.

미확인/미해결: 위의 기존 Node 실패 1건과 마을 런타임 수량 불일치. 실제 조사 982건 연동·나머지 문화재 유형 브라우저 캡처·배포 환경 검증은 NOT_RUN이다. 이번 캡처 4건은 합성 표본이다.
