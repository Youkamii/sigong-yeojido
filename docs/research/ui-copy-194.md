# 뷰어 UI 문구 인벤토리 (#194)

기준: `copy-style-193.md`와 `humanize-korean/references/quick-rules.md` v2.0. 제품 기준의 쉬운 용어·해요체를 우선했다. 스킬의 별도 윤문 산출 절차는 작업 지시대로 생략했다.

화면 문구 **811건**: **변경 327건 / 유지 484건**. 같은 문구도 파일·위치가 다르면 각각 센다. 문자열 리터럴과 템플릿의 고정 부분을 추출했으며, 보간식 양옆의 고정 문구는 별도 행이다. 동적 목록의 표시 구분자 변경 9건도 포함했다. 주석·콘솔·정규식과 화면에 쓰이지 않는 조형 설명은 제외했다. 텍스트·접근성 속성이 한 문자열 안에 있으면 요소별로 나눴다. 위치의 행 번호는 수정 전 기준이다.

`atlas-story.js`는 #193 문구를 그대로 유지했다. AI 이미지의 alt·NOTICE도 유지했다. 기존 index 라벨과 무관하게 화면 배지는 `AI 상상도`로 표시하며, `index.json`은 수정하지 않았다.

## 바뀐 구현 파일

- `scripts/ai_images/finalize_image.py`
- `services/host/app/ai-images.js`
- `services/host/app/atlas-chat.js`
- `services/host/app/atlas-data.js`
- `services/host/app/atlas-events.js`
- `services/host/app/atlas-search.js`
- `services/host/app/atlas-ui.js`
- `services/host/app/chat.js`
- `services/host/app/chronicle-assets.js`
- `services/host/app/chronicle-geography.js`
- `services/host/app/chronicle-load.js`
- `services/host/app/chronicle-scene.js`
- `services/host/app/chronicle-sites.js`
- `services/host/app/chronicle-territories.js`
- `services/host/app/chronicle.js`
- `services/host/app/compare.js`
- `services/host/app/event-timeline.js`
- `services/host/app/facility-persistence.js`
- `services/host/app/graph.js`
- `services/host/app/historical-regions.js`
- `services/host/app/history-map.js`
- `services/host/app/people.js`
- `services/host/app/quality-gate.js`
- `services/host/app/timeline.js`
- `services/host/index.html`

구현 25개 파일 외에, 문구를 비교하는 테스트 6개와 이 인벤토리를 바꿨다. 전체 변경 파일은 32개다.

- `tests/ai-images.test.mjs`
- `tests/branch-review-regressions.test.mjs`
- `tests/continuing-cities.test.mjs`
- `tests/facility-persistence.test.mjs`
- `tests/historical-regions.test.mjs`
- `tests/scene-kinds.test.mjs`
- `docs/research/ui-copy-194.md` (새 파일)

## 문구 표

**기준**: 브랜치 `feat/ui-register-198` 워킹트리, 2026-09-16(#198 2차 적대 리뷰 반영 뒤).

**표 읽는 법 — 지금 화면에 있는 문구는 이렇게 읽는다.** '전'은 #194 이전 값, '후'는 #194 작업의 결과값이다. 그 뒤 #198 이 문체를 -ㅂ니다체로 바꾸고 적대 리뷰 반영이 얹혔으므로 **현재 값은 '#198 재조정' 열이 정한다**: 이 열이 `유지` 로 시작하면 '후' 가 곧 현재 코드 값이고, 그 밖에는 `값 — 사유` 형태로 **맨 앞 값이 현재 코드 값**이다. 현재 코드에 그 문구 자체가 없으면 '후' 를 `(코드에 없음)` 으로 적고 '#198 재조정' 에 사유를 남겼다.

**기계 대조**: 위 규칙으로 뽑은 현재 값 773행을 워킹트리 소스와 문자열 대조했다 — **불일치 0건**(2026-09-16 재대조, #203 감사 6). 앞선 판(804행·불일치 0건, #198 감사 C-33)의 주장은 사실이 아니었다: 연도 슬라이더 2행이 #196 의 연도 이동 개선 뒤 값과 달랐다. 이 대조는 `tests/ui-copy-inventory.test.mjs` 로 남겨 두어, 다음에 문구가 바뀌면 문서를 안 고친 사실이 자동으로 잡힌다. `(코드에 없음)` 으로 적은 38행은 화면 경로가 사라진 문구다(각주 ㄱ·ㄹ). 파일이 옮겨간 문구는 '파일' 열을 옮겨간 곳으로 고쳤다. 서버·브라우저는 띄우지 않았다 — 대조는 소스 문자열까지다.

각주 ㄱ. `atlas-story.js` 의 `함께 참여`·`출생`·`사망`·`생몰 미확인` 네 행과 `ai-images.js` 의 AI 고지 문장은 #197 카드 개편·#198 고지문 삭제(Q5=a)로 문구 자체가 없어졌다. 행을 지우지 않고 '후' 를 `(코드에 없음)`, '#198 재조정' 을 사유로 남긴다.
각주 ㄴ. `chronicle-scene.js` 의 조작 안내는 현재 `index.html` 의 3D 전환 경로에서만 설정한다.
각주 ㄷ. `scripts/ai_images/finalize_image.py` 의 `NOTICE` 상수는 `index.json` 호환으로만 남아 있고 화면 경로가 없다(Q5=a).
각주 ㄹ. `chronicle.js` 의 `showEntity` 카드 32행은 #203 감사 1·5 에서 지웠다. 이 분기는 `presentEntity` 가 언제나 카드를 열어 화면에 한 번도 나오지 않았고, 실제로 보이는 카드는 `atlas-story.js` 다. 같은 뜻의 문구는 `atlas-story.js` 행에 있다.

| 파일 | 위치(함수/요소) | 전 | 후 | 바꾼 이유 | #198 재조정 |
|---|---|---|---|---|---|
| services/host/index.html | title / 문자열 (수정 전 6행) | 시공여지도 | 시공여지도 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / h1 (수정 전 274행) | 시공여지도 | 시공여지도 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / div (수정 전 274행) | SIGONG YEOJIDO | SIGONG YEOJIDO | 기준서 §1 / B-2 우리말 표기 | 유지 |
| services/host/index.html | body / p (수정 전 274행) | 김정호는 자기 시대의 조선을 목판에 새겼다. 대동여지도는 한 시점의 공간이다. ⏎        여기서는 거기에 시간을 얹는다 — 그리고 모든 선에 어느 사료가 그렇게 말했는지를 달아둔다. | 김정호는 자기 시대의 조선을 목판에 새겼다. 대동여지도는 한 시점의 공간이다. ⏎        이 지도에서는 시간도 살펴봐요. 각 선을 그린 근거도 자료에서 확인해요. | 기준서 §1 쉬운 용어 | 김정호는 자기 시대의 조선을 목판에 새겼습니다. 대동여지도는 한 시점의 공간입니다. ⏎       이 지도에서는 시간도 살펴봅니다. 각 선을 그린 근거도 사료(역사 기록)에서 확인합니다. — 문장 유지·문체만 -ㅂ니다체 (Q10=b·Q3=b) · '사료' 첫 등장 풀이 1회 (Q9=a) |
| services/host/index.html | body / div / aria-label (수정 전 274행) | 시작 화질 | 시작 화질 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / strong (수정 전 274행) | 낮음 | 낮음 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / span (수정 전 274행) | 패드·오래된 기기, 빠른 시작 | 패드나 오래된 기기에서 빠르게 | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/index.html | body / strong (수정 전 274행) | 보통 | 보통 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / span (수정 전 274행) | 노트북 | 노트북 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / strong (수정 전 274행) | 높음 | 높음 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / span (수정 전 274행) | 데스크톱·고성능 | 성능 좋은 컴퓨터 | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/index.html | body / button#enter (수정 전 274행) | 들어가기 | 들어가기 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / div (수정 전 274행) | 대동여지도 (규장각 소장본) · Public domain · commons.wikimedia.org | 대동여지도 (규장각 소장본) · 저작권 제한 없음 · commons.wikimedia.org | 기준서 §1 나열 축소 | 유지 |
| services/host/index.html | body / span (수정 전 274행) | 시공여지도 | 시공여지도 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / small (수정 전 274행) | SIGONG YEOJIDO | SIGONG YEOJIDO | 기준서 §1 / B-2 우리말 표기 | 유지 |
| services/host/index.html | body / button#b2d (수정 전 274행) | 지도 | 지도 보기 | 기준서 §2 버튼·안내 | 지도 — 짧은 모드 이름 (Q4=b) · aria-label "평면 지도로 보기" |
| services/host/index.html | body / button#b3d (수정 전 274행) | 3D | 입체로 보기 | 기준서 §2 버튼·안내; 기준서 §1 / B-2 우리말 표기 | 3D — 짧은 모드 이름 (Q4=b) · 영어 예외 3D · aria-label "입체 지도로 보기" |
| services/host/index.html | body / button#bgraph (수정 전 274행) | 그래프 | 연결 보기 | 기준서 §2 버튼·안내 | 연결 — 짧은 모드 이름 (Q4=b) · aria-label "출처 연결 보기" |
| services/host/index.html | body / button#bchat (수정 전 274행) | 질문 | 물어보기 | 기준서 §2 버튼·안내 | 질문 — 짧은 모드 이름 (Q4=b) · aria-label "사료에 질문하기" |
| services/host/index.html | body / button#bcompare (수정 전 274행) | 비교 | 비교하기 | 기준서 §2 버튼·안내 | 비교 — 짧은 모드 이름 (Q4=b) · aria-label "사료별 사건 비교하기" |
| services/host/index.html | body / button#sourcesBtn (수정 전 274행) | 기본 사료 5종 | 기본 자료 5종 보기 | 기준서 §1 쉬운 용어; 기준서 §2 버튼·안내 | 기본 사료 5종 보기 — '사료' 되살림 (Q9=a) |
| services/host/index.html | body / button#evidenceBtn (수정 전 274행) | 출처 열기 | 출처 열기 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / label / title (수정 전 274행) | 작성자가 사람으로 기록된 연결만 표시한다. 원문은 그대로 볼 수 있다. | 사람이 작성한 연결만 보여줘요. 원문은 그대로 볼 수 있어요. | 기준서 §2 안내 말투 / E-7 | 사람이 작성한 연결만 보여줍니다. 원문은 그대로 볼 수 있습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/index.html | body / input#humanOnly (수정 전 274행) | AI 연결 제외 | AI 연결 제외 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / span#toGate (수정 전 274행) | ← 대동여지도 | ← 대동여지도 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / div (수정 전 274행) | 찾기 | 찾기 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / input#q / aria-label (수정 전 274행) | 찾기 | 찾기 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / input#q / placeholder (수정 전 274행) | 지명 · 인물 · 나라 · 사건 | 지명, 인물, 나라, 사건 찾기 | 기준서 §1 나열 축소 | 유지 |
| services/host/index.html | body / div (수정 전 274행) | 주 렌즈 | 기준 자료 | 기준서 §1 쉬운 용어 | 주로 볼 사료 — '사료' 되살림 (Q9=a) · 화면 실제 문구는 '주로 볼 자료'였다 |
| services/host/index.html | body / select#lensSelect / aria-label (수정 전 274행) | 주 렌즈 | 기준 자료 | 기준서 §1 쉬운 용어 | 주로 볼 사료 — '사료' 되살림 (Q9=a) |
| services/host/index.html | body / label (수정 전 274행) | 역사 지도 종류 | 역사 지도 종류 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / select#historyLevel / aria-label (수정 전 274행) | 역사 지도 종류 | 역사 지도 종류 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / option (수정 전 274행) | 국가·정치집단 경계 | 나라·세력 경계 | 기준서 §1 짧고 자연스러운 표현 | 나라·집단 경계 — '세력'→'집단' |
| services/host/index.html | body / option (수정 전 274행) | 도 경계 | 도 경계 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / option (수정 전 274행) | 군·부 등 경계 | 군·부 등 경계 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / option (수정 전 274행) | 읍·면 등 경계 | 읍·면 등 경계 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / option (수정 전 274행) | 사건 관련 장소 | 사건 관련 장소 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / option (수정 전 274행) | 역로·현재 옛길 | 옛 역로·현재 옛길 | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/index.html | body / button#historyMapBtn (수정 전 274행) | 역사 경계 0개 · 출처 | 역사 경계 0개 · 출처 보기 | 기준서 §2 버튼·안내 | 유지 |
| services/host/index.html | body / p (수정 전 274행) | 주 렌즈는 진하게, 추가로 켠 비교 사료는 옅게 겹쳐 보인다. | 기준 자료는 진하게 보여요. 비교할 자료는 옅게 겹쳐 보여요. | 기준서 §1 쉬운 용어; 기준서 §2 안내 말투 / E-7 | 주로 볼 사료는 진하게 보입니다. 비교할 사료는 옅게 겹쳐 보입니다. — 문체 -ㅂ니다 (Q3=b) · '사료' 되살림 (Q9=a) |
| services/host/index.html | body / button#allSources (수정 전 274행) | 5종 모두 켜기 | 5종 모두 켜기 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / button#noSources (수정 전 274행) | 모두 끄기 | 모두 끄기 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / div (수정 전 274행) | 사료 | 자료 | 기준서 §1 쉬운 용어 | 유지 |
| services/host/index.html | body / div (수정 전 274행) | 범례 | 범례 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / i (수정 전 274행) | 위치 확정 | 위치 확정 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / i (수정 전 274행) | 통설 | 널리 인정된 위치 | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/index.html | body / i (수정 전 274행) | 비정이 갈림 | 위치 해석이 갈림 | 기준서 §1 쉬운 용어 | 유지 |
| services/host/index.html | body / i (수정 전 274행) | 위치 미정 | 위치 미확인 | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/index.html | body / div (수정 전 274행) | 데이터 | 자료 현황 | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/index.html | body / h2 (수정 전 274행) | 1593년 | 1593년 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / p (수정 전 274행) | 동시대 인물과 사건 | 동시대 인물과 사건 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / button#periodSceneBtn (수정 전 274행) | 이 시대 가까이 | 이 시대 가까이 보기 | 기준서 §2 버튼·안내 | 유지 |
| services/host/index.html | body / button#wholeMapBtn (수정 전 274행) | 한반도 전체 | 한반도 전체 보기 | 기준서 §2 버튼·안내 | 유지 |
| services/host/index.html | body / button#eastAsiaBtn (수정 전 274행) | 주변국까지 | 주변국까지 보기 | 기준서 §2 버튼·안내 | 유지 |
| services/host/index.html | body / label (수정 전 274행) | 장면 이동 | 장면 이동 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / select#sceneDestination / aria-label (수정 전 274행) | 인물과 사건 장면으로 이동 | 인물과 사건 장면으로 이동 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / button#sceneZoomIn / aria-label (수정 전 274행) | 지도 확대 | 지도 확대하기 | 기준서 §2 버튼·안내 | 유지 |
| services/host/index.html | body / button#sceneZoomOut / aria-label (수정 전 274행) | 지도 축소 | 지도 축소하기 | 기준서 §2 버튼·안내 | 유지 |
| services/host/index.html | body / summary (수정 전 274행) | 지도 표시 | 지도 표시 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / legend (수정 전 274행) | 이름표 | 이름표 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / input (수정 전 274행) | 당시 수도 | 당시 수도 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / input (수정 전 274행) | 대표 산·섬 | 대표 산·섬 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / input (수정 전 274행) | 다른 지명·봉우리 | 다른 지명·봉우리 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / input (수정 전 274행) | 인물 이름 | 인물 이름 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / input (수정 전 274행) | 사건 이름 | 사건 이름 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / input (수정 전 274행) | 도시·시설 이름 | 도시·시설 이름 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / legend (수정 전 274행) | 풍경 | 풍경 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / input (수정 전 274행) | 국가 영역 | 국가 영역 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / input (수정 전 274행) | 마을·밭·동물 (추정 배경 · 사료 없음) | 마을, 밭, 동물 (추정 배경, 자료 없음) | 기준서 §1 쉬운 용어; 기준서 §1 나열 축소 | 마을, 밭, 동물 (추정 배경, 사료 없음) — '사료' 되살림 (Q9=a) |
| services/host/index.html | body / input (수정 전 274행) | 추정 배경 흐리게 | 추정 배경 흐리게 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / input (수정 전 274행) | 숲 | 숲 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / input (수정 전 274행) | 길 | 길 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / input (수정 전 274행) | 기록 사이의 추정 성곽 | 기록 사이의 추정 성곽 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / summary (수정 전 274행) | 설화·전승 따로 보기 | 설화·전승 따로 보기 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / p (수정 전 274행) | 이야기의 무대를 한 편씩 봅니다. 연도를 바꾸면 지도에서 닫힙니다. | 이야기의 무대를 한 편씩 보세요. 연도를 바꾸면 지도에서 닫혀요. | 기준서 §2 버튼·안내 | 이야기의 무대를 한 편씩 보십시오. 연도를 바꾸면 지도에서 닫힙니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/index.html | body / label (수정 전 274행) | 이야기 | 이야기 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / option (수정 전 274행) | 이야기를 골라 보기 | 이야기를 골라 보기 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / div#sceneEvents / aria-label (수정 전 274행) | 3D 지도의 사건 | 입체 지도의 사건 | 기준서 §1 / B-2 우리말 표기 | 유지 |
| services/host/index.html | body / aside#sceneFocus / aria-label (수정 전 274행) | 현장의 사건과 핵심 인물 | 현장의 사건과 핵심 인물 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / div#sceneGeography / aria-label (수정 전 274행) | 산맥과 섬 | 산맥과 섬 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / select#geographyDestination / aria-label (수정 전 274행) | 지역과 산맥, 섬으로 이동 | 지역과 산맥, 섬으로 이동 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / label / title (수정 전 274행) | 북위 38도인 위도선입니다. 현재의 군사분계선과 다릅니다. | 북위 38도인 위도선이에요. 현재의 군사분계선과는 달라요. | 기준서 §2 안내 말투 / E-7 | 북위 38도인 위도선입니다. 현재의 군사분계선과는 다릅니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/index.html | body / input#showParallel38 (수정 전 274행) | 북위 38° | 북위 38° | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / button#geographyClose / aria-label (수정 전 274행) | 지리 설명 닫기 | 지리 설명 닫기 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / div#graph / aria-label (수정 전 274행) | 출처 그래프 | 출처 연결 | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/index.html | body / div#chat / aria-label (수정 전 274행) | 사료 출처 챗봇 | 자료를 읽고 답하는 AI | 기준서 §1 쉬운 용어 | 사료를 읽고 답하는 AI — '사료' 되살림 (Q9=a) |
| services/host/index.html | body / div#compare / aria-label (수정 전 274행) | 사료별 사건 비교 | 자료별 사건 비교 | 기준서 §1 쉬운 용어 | 사료별 사건 비교 — '사료' 되살림 (Q9=a) |
| services/host/index.html | body / div#hint (수정 전 274행) | 지명을 클릭하면 출처가 열린다 | 지명을 누르면 출처가 열려요 | 기준서 §1 짧고 자연스러운 표현 | 지명을 누르면 출처가 열립니다 — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/index.html | body / button#resetMap (수정 전 274행) | 전체 지도 | 전체 지도 보기 | 기준서 §2 버튼·안내 | 유지 |
| services/host/index.html | body / div#historyTime / aria-label (수정 전 274행) | 역사 시간 탐색 | 역사 시간 탐색 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / span#yearL (수정 전 274행) | 서기 | 서기 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / button#yearBtn / title (수정 전 274행) | 이 해로 연대가 붙은 기사를 본다 | 이 해로 날짜가 붙은 기록을 보세요 | 기준서 §2 버튼·안내 | 이 해로 날짜가 붙은 기록을 보십시오 — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/index.html | body / button#yearBtn (수정 전 274행) | 이 해의 기록 | 이 해의 기록 보기 | 기준서 §2 버튼·안내 | 유지 |
| services/host/index.html | body / button#timeClaimsBtn (수정 전 274행) | 연대 주장 | 연도 기록 보기 | 기준서 §1 쉬운 용어; 기준서 §2 버튼·안내 | 유지 |
| services/host/index.html | body / div#tl / aria-label (수정 전 274행) | 사료별 시간 막대 | 자료별 시간 막대 | 기준서 §1 쉬운 용어 | 사료별 시간 막대 — '사료' 되살림 (Q9=a) |
| services/host/index.html | body / aside#chronicle / aria-label (수정 전 274행) | 이 시대의 인물과 사건 | 이 시대의 인물과 사건 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | body / aside#evi / aria-label (수정 전 274행) | 사료와 주장 출처 | 자료와 기록 출처 | 기준서 §1 쉬운 용어 | 사료와 기록 출처 — '사료' 되살림 (Q9=a) |
| services/host/index.html | body / p (수정 전 274행) | 지도에서 지명을 고르면 그 지명이 어느 사료 어느 대목에서 나왔는지, 위치를 무엇으로 보는지가 여기 열린다. | 지도에서 지명을 골라 보세요. 이름이 나온 자료와 위치를 정한 근거가 여기에 열려요. | 기준서 §1 쉬운 용어; 기준서 §2 버튼·안내 | 지도에서 지명을 골라 보십시오. 이름이 나온 사료와 위치를 정한 근거가 여기에 열립니다. — 문체 -ㅂ니다/-십시오 (Q3=b) · '사료' 되살림 (Q9=a) |
| services/host/index.html | showHistoricalList / 문자열 (수정 전 513행) | 출처에 있는 선을 표시한다. 현재 옛길 안내 코스는 제공 자료의 기준연도에만 참고 표시하며 과거 노선과의 동일성은 각 출처에서 확인할 수 있다. 서로 떨어진 선을 잇거나 역참 점으로 길을 만들지 않는다. | 출처에 있는 선을 보여줘요. 현재 옛길 안내 코스는 자료의 기준연도에만 참고로 보여줘요. 과거에도 같은 길이었는지는 출처에서 확인하세요. 떨어진 선을 잇거나 역참 위치로 길을 만들지는 않아요. | 기준서 §2 안내 말투 / E-7; 기준서 §2 버튼·안내 | 출처에 있는 선을 보여줍니다. 현재 옛길 안내 코스는 자료의 기준연도에만 참고로 보여줍니다. 과거에도 같은 길이었는지는 출처에서 확인하십시오. 떨어진 선을 잇거나 역참 위치로 길을 만들지는 않습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/index.html | showHistoricalList / 문자열 (수정 전 513행) | 기록의 기준연도에 맞춰 사건 관련 장소를 표시한다. 점은 국가유산청의 현재 목록 좌표이며 전투 범위가 아니다. 사건 전체의 시작·끝을 이 연도로 정하지 않는다. | 기록의 기준연도에 맞춰 사건 장소를 보여줘요. 점은 국가유산청의 현재 목록에 있는 위치예요. 전투 범위나 사건 전체의 시작·끝 연도를 뜻하지는 않아요. | 기준서 §2 안내 말투 / E-7 | 기록의 기준연도에 맞춰 사건 장소를 보여줍니다. 점은 국가유산청의 현재 목록에 있는 위치입니다. 전투 범위나 사건 전체의 시작·끝 연도를 뜻하지는 않습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/index.html | showHistoricalList / 문자열 (수정 전 513행) | Cliopatria v0.1.3의 시기별 경계 견해다. 1911~1947년은 국사편찬위원회 1910~1945 행정구역(13도)을 합친 참고 도형으로 보충하며, 그 출처를 끄면 비어 있다. 도형 적용 기간을 국가의 건국·멸망 연도로 판정하지 않는다. | Cliopatria v0.1.3에서 제시한 시기별 경계예요. 1911~1947년은 국사편찬위원회 1910~1945 행정구역 13도를 합쳐 보충했어요. 그 출처를 끄면 이 기간은 비어 있어요. 경계의 표시 기간이 건국·멸망 연도를 뜻하지는 않아요. | 기준서 §1 짧고 자연스러운 표현 | Cliopatria v0.1.3에서 제시한 시기별 경계입니다. 1911~1947년은 국사편찬위원회 1910~1945 행정구역 13도를 합쳐 보충했습니다. 그 출처를 끄면 이 기간은 비어 있습니다. 경계의 표시 기간이 건국·멸망 연도를 뜻하지는 않습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/index.html | showHistoricalList / 문자열 (수정 전 513행) | ~1945년 기관 레코드 중 선택한 해와 기간이 겹치는 경계를 표시한다. 같은 해에 바뀐 경계는 함께 보이며, 변경일과 기관의 추정 표기는 각 출처에 남아 있다. | ~1945년 기관 기록에서 고른 해에 해당하는 경계를 보여줘요. 같은 해에 바뀐 경계는 함께 보여요. 변경일과 기관이 추정한 내용은 각 출처에서 확인하세요. | 기준서 §1 쉬운 용어; 기준서 §2 안내 말투 / E-7; 기준서 §2 버튼·안내 | ~1945년 기관 기록에서 고른 해에 해당하는 경계를 보여줍니다. 같은 해에 바뀐 경계는 함께 보입니다. 변경일과 기관이 추정한 내용은 각 출처에서 확인하십시오. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/index.html | showHistoricalList / h3 (수정 전 514행) | 선택한 해의 | 선택한 해의 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showHistoricalList / 문자열 (수정 전 514행) | 국가·정치집단 경계 | 나라·세력 경계 | 기준서 §1 짧고 자연스러운 표현 | 나라·집단 경계 — '세력'→'집단' |
| services/host/index.html | showHistoricalList / 문자열 (수정 전 514행) | 도 경계 | 도 경계 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showHistoricalList / 문자열 (수정 전 514행) | 군·부 등 경계 | 군·부 등 경계 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showHistoricalList / 문자열 (수정 전 514행) | 읍·면 등 경계 | 읍·면 등 경계 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showHistoricalList / 문자열 (수정 전 514행) | 사건 관련 장소 | 사건 관련 장소 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showHistoricalList / 문자열 (수정 전 514행) | 역로·옛길 | 역로·옛길 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showHistoricalList / 문자열 (수정 전 515행) | 역로 이름 찾기 | 역로 이름 찾기 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showHistoricalList / 문자열 (수정 전 515행) | 경계 이름 찾기 | 경계 이름 찾기 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showHistoricalList / 문자열 (수정 전 515행) | 역로 이름 찾기 | 역로 이름 찾기 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showHistoricalList / 문자열 (수정 전 515행) | 역사 경계 이름 찾기 | 역사 경계 이름 찾기 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | render / 문자열 (수정 전 520행) |  · 출처 |  · 출처 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showHistoricalList / p (수정 전 522행) | 현재 연도·사료·작성자 선택에서 표시할 자료가 없다. | 고른 연도와 자료, 작성자에 맞는 결과가 없어요. | 기준서 §1 쉬운 용어; 기준서 §2 안내 말투 / E-7; 기준서 §1 나열 축소 | 고른 연도와 사료, 작성자에 맞는 결과가 없습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) · '사료' 되살림 (Q9=a) |
| services/host/index.html | showHistoricalFeature / 화면 문구 (수정 전 528행) | · 역사 국가 경계 (참고 도형) | · 역사 국가 경계 (참고 도형) | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showHistoricalFeature / p (수정 전 528행) | 국사편찬위원회 1910~1945 행정구역 13도를 합쳐 만든 참고 도형이며 실제 국경·통치 범위가 아닙니다. 1945~1947년은 위도 38도선으로 나눈 구역입니다. | 국사편찬위원회 1910~1945 행정구역 13도를 합친 참고 경계예요. 실제 국경·통치 범위와는 달라요. 1945~1947년은 위도 38도선으로 나눈 구역이에요. | 기준서 §2 안내 말투 / E-7 | 국사편찬위원회 1910~1945 행정구역 13도를 합친 참고 경계입니다. 실제 국경·통치 범위와는 다릅니다. 1945~1947년은 위도 38도선으로 나눈 구역입니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/index.html | showHistoricalFeature / 문자열 (수정 전 532행) | 출처 | 출처 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showHistoricalFeature / 문자열 (수정 전 536행) | 사료 카드 | 자료 설명 보기 | 기준서 §1 쉬운 용어; 기준서 §2 버튼·안내 | 사료 설명 보기 — '사료' 되살림 (Q9=a) |
| services/host/index.html | showHistoricalFeature / 문자열 (수정 전 536행) | 경계 목록 | 경계 목록 보기 | 기준서 §2 버튼·안내 | 유지 |
| services/host/index.html | showHistoricalFeature / 문자열 (수정 전 541행) | 년 기록 ·  | 년 기록 ·  | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showHistoricalFeature / 화면 문구 (수정 전 541행) | · AI 연결 | · AI 연결 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showHistoricalFeature / p (수정 전 542행) | 기관 원 좌표 | 기관 원 좌표 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showHistoricalFeature / 문자열 (수정 전 543행) |  · 지정 면적  |  · 지정 면적  | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showHistoricalFeature / p (수정 전 544행) | 기준연도 출처: | 기준연도 출처: | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showHistoricalFeature / button (수정 전 544행) | 좌표 원 레코드 | 위치 원자료 보기 | 기준서 §1 쉬운 용어; 기준서 §2 버튼·안내 | 유지 |
| services/host/index.html | showHistoricalFeature / button (수정 전 544행) | 사건 출처 | 사건 출처 보기 | 기준서 §2 버튼·안내 | 유지 |
| services/host/index.html | showHistoricalFeature / button (수정 전 544행) | 연도 출처 | 연도 출처 보기 | 기준서 §2 버튼·안내 | 유지 |
| services/host/index.html | showHistoricalFeature / button (수정 전 544행) | 그래프 연결 | 연결 보기 | 기준서 §2 버튼·안내 | 유지 |
| services/host/index.html | showHistoricalFeature / p (수정 전 553행) | 원 이름: | 원래 이름: | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/index.html | showHistoricalFeature / 문자열 (수정 전 553행) |  · 원 면적  |  · 원래 면적  | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/index.html | showHistoricalFeature / p (수정 전 553행) | 한 데이터셋의 경계 견해다. 적용 기간의 양 끝을 포함하며 음수는 제공처의 기원전 표기다. 국가의 실제 건국·멸망 연도를 뜻하지 않는다. | 한 자료에서 제시한 경계예요. 표시 기간은 시작과 끝 연도를 포함해요. 음수는 제공처가 기원전을 적은 방식이에요. 실제 건국·멸망 연도를 뜻하지는 않아요. | 기준서 §1 짧고 자연스러운 표현 | 한 자료에서 제시한 경계입니다. 표시 기간은 시작과 끝 연도를 포함합니다. 음수는 제공처가 기원전을 적은 방식입니다. 실제 건국·멸망 연도를 뜻하지는 않습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/index.html | showHistoricalFeature / p (수정 전 553행) | 원 도형 CRS84 경도·위도. 개별 고지도와의 대조는 미확인이다. | 원 경계는 CRS84 방식의 경도·위도예요. 개별 고지도와 대조했는지는 미확인이에요. | 기준서 §1 짧고 자연스러운 표현 | 원 경계는 CRS84 방식의 경도·위도입니다. 개별 고지도와 대조했는지는 미확인입니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/index.html | showHistoricalFeature / p (수정 전 553행) | 한반도 표시 범위 밖의 일부 경계는 3D에서 생략된다. | 한반도 표시 범위 밖의 일부 경계는 입체 지도에서 생략해요. | 기준서 §1 / B-2 우리말 표기 | 한반도 표시 범위 밖의 일부 경계는 입체 지도에서 생략합니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/index.html | showHistoricalFeature / p (수정 전 554행) | 원 호칭 | 원 호칭 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showHistoricalFeature / 문자열 (수정 전 554행) | 미기재 | 미기재 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showHistoricalFeature / 문자열 (수정 전 554행) |  · 상위 구역 코드  |  · 상위 구역 번호  | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/index.html | showHistoricalFeature / 문자열 (수정 전 554행) | 없음 | 없음 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showHistoricalFeature / 문자열 (수정 전 554행) | 시작 출처 미기재 | 시작 출처 미기재 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showHistoricalFeature / 문자열 (수정 전 554행) | 종료 출처 미기재 | 종료 출처 미기재 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showHistoricalFeature / p (수정 전 554행) | 기관 표기: | 기관 표기: | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showHistoricalFeature / 문자열 (수정 전 554행) | 미기재 | 미기재 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showHistoricalFeature / 문자열 (수정 전 554행) |  · 신뢰도 코드  |  · 신뢰도 표시  | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/index.html | showHistoricalFeature / 문자열 (수정 전 554행) | 미기재 | 미기재 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showHistoricalFeature / 문자열 (수정 전 555행) | 현재 옛길 참고 | 현재 옛길 참고 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showHistoricalFeature / 문자열 (수정 전 555행) | 역로 | 역로 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showHistoricalFeature / 문자열 (수정 전 555행) | 역사  | 역사  | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showHistoricalFeature / 문자열 (수정 전 555행) | 국가 | 국가 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showHistoricalFeature / 문자열 (수정 전 555행) | 행정 | 행정 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showHistoricalFeature / 문자열 (수정 전 555행) |  경계 |  경계 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showHistoricalFeature / 문자열 (수정 전 556행) | 사람 작성 | 사람 작성 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showHistoricalFeature / 문자열 (수정 전 556행) | AI 변환 | AI 변환 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showHistoricalFeature / 문자열 (수정 전 556행) | 출처의 선 기록 | 출처의 선 기록 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showHistoricalFeature / 문자열 (수정 전 556행) | 표시용 경계 단순화 | 표시용 경계 단순화 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showHistoricalFeature / button (수정 전 558행) | 별도 역사 설명 | 역사 설명 보기 | 기준서 §2 버튼·안내 | 유지 |
| services/host/index.html | showHistoricalFeature / 문자열 (수정 전 559행) | 원 도형의 꼭짓점 수가 부족하다. | 원 경계를 그릴 꼭짓점이 부족해요. | 기준서 §1 짧고 자연스러운 표현 | 원 경계를 그릴 꼭짓점이 부족합니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/index.html | showHistoricalFeature / 문자열 (수정 전 559행) | 원 도형에 자기 교차가 있다. | 원 경계선이 서로 엇갈려요. | 기준서 §1 짧고 자연스러운 표현 | 원 경계선이 서로 엇갈립니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/index.html | showHistoricalFeature / 화면 문구 (수정 전 559행) | 원 좌표 해시와 표시용 단순화 결과를 함께 보존한다. | 원 좌표의 확인값과 간단히 그린 경계를 함께 보관해요. | 기준서 §2 안내 말투 / E-7 | 원 좌표의 확인값과 간단히 그린 경계를 함께 보관합니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/index.html | showHistoricalFeature / p (수정 전 560행) | 표시용 도형에도 오류가 남아 있다. 원 레코드와 도형의 확인이 필요하다. | 표시한 경계에도 오류가 있어요. 원자료와 경계를 확인해 주세요. | 기준서 §1 쉬운 용어; 기준서 §2 버튼·안내 | 표시한 경계에도 오류가 있습니다. 원자료와 경계를 확인해 주십시오. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/index.html | showHistoricalFeature / button (수정 전 560행) | 원 레코드 | 원자료 보기 | 기준서 §1 쉬운 용어; 기준서 §2 버튼·안내 | 유지 |
| services/host/index.html | showHistoricalFeature / button (수정 전 560행) | 사료 카드 | 자료 설명 보기 | 기준서 §1 쉬운 용어; 기준서 §2 버튼·안내 | 사료 설명 보기 — '사료' 되살림 (Q9=a) |
| services/host/index.html | showHistoricalFeature / 문자열 (수정 전 561행) | 역로 | 역로 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showHistoricalFeature / 문자열 (수정 전 561행) | 경계 | 경계 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showHistoricalFeature / 화면 문구 (수정 전 561행) | 목록 | 목록 보기 | 기준서 §2 버튼·안내 | 유지 |
| services/host/index.html | showChunk / p (수정 전 583행) | 원문을 불러오는 중… | 원문을 불러오고 있어요… | 기준서 §2 안내 말투 / E-7 | 원문을 불러오고 있습니다… — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/index.html | showChunk / 문자열 (수정 전 586행) | 원문 조회 실패 | 원문을 불러오지 못했어요. | 기준서 §1 짧고 자연스러운 표현 | 원문을 불러오지 못했습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/index.html | showChunk / h3 (수정 전 589행) | 인용한 원문 | 인용한 원문 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showChunk / p (수정 전 589행) | 현재 사료 선택에서 원문을 찾지 못했다. | 고른 자료에서 원문을 찾지 못했어요. | 기준서 §1 쉬운 용어; 기준서 §2 안내 말투 / E-7 | 고른 사료에서 원문을 찾지 못했습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) · '사료' 되살림 (Q9=a) |
| services/host/index.html | showGraphClaim / 문자열 (수정 전 601행) | 기원전  | 기원전  | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showGraphClaim / 문자열 (수정 전 601행) | 년 | 년 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showGraphClaim / 문자열 (수정 전 603행) | 시작 미상 | 시작 미확인 | 기준서 §2 안내 말투 / E-7 | 유지 |
| services/host/index.html | showGraphClaim / 문자열 (수정 전 603행) | 끝 미상 | 끝 미확인 | 기준서 §2 안내 말투 / E-7 | 유지 |
| services/host/index.html | showGraphClaim / 문자열 (수정 전 604행) | AI 추출 | AI 추출 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showGraphClaim / 문자열 (수정 전 604행) | 사람 | 사람 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showGraphClaim / button (수정 전 606행) | 인용한 원문 열기 | 인용한 원문 열기 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showGraphClaim / button (수정 전 606행) | 사료 카드 | 자료 설명 보기 | 기준서 §1 쉬운 용어; 기준서 §2 버튼·안내 | 사료 설명 보기 — '사료' 되살림 (Q9=a) |
| services/host/index.html | setDrawer / 문자열 (수정 전 618행) | 출처 닫기 | 출처 닫기 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | setDrawer / 문자열 (수정 전 618행) | 출처 열기 | 출처 열기 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | setDrawer / 문자열 (수정 전 619행) | 사료 닫기 | 자료 닫기 | 기준서 §1 쉬운 용어 | 사료 닫기 — '사료' 되살림 (Q9=a) |
| services/host/index.html | setDrawer / 문자열 (수정 전 619행) | 기본 사료 5종 | 기본 자료 5종 보기 | 기준서 §1 쉬운 용어; 기준서 §2 버튼·안내 | 기본 사료 5종 보기 — '사료' 되살림 (Q9=a) |
| services/host/index.html | renderOutside / 문자열 (수정 전 661행) | 다른 지역의 기록  | 다른 지역의 기록  | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | renderOutside / 문자열 (수정 전 661행) | 개 | 개 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | renderOutside / 문자열 (수정 전 667행) | 위치 후보 | 위치 후보 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | renderOutside / 문자열 (수정 전 667행) | ) → 지도·출처 | ) → 지도·출처 보기 | 기준서 §2 버튼·안내 | 유지 |
| services/host/index.html | module / 문자열 (수정 전 750행) | 지명 | 지명 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | module / 문자열 (수정 전 750행) | 인물 | 인물 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | module / 문자열 (수정 전 750행) | 나라 | 나라 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | module / 문자열 (수정 전 750행) | 사건 | 사건 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | module / 문자열 (수정 전 750행) | 관직 | 관직 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | module / 문자열 (수정 전 750행) | 관서·조직 | 관서·조직 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | module / 문자열 (수정 전 750행) | 시점 | 시점 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | module / 문자열 (수정 전 750행) | 좌표 | 좌표 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | module / 문자열 (수정 전 750행) | 충돌 | 충돌 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | setYearUI / 문자열 (수정 전 785행) | 기원전 | 기원전 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | setYearUI / 문자열 (수정 전 785행) | 서기 | 서기 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | yearText / 문자열 (수정 전 808행) | 기원전  | 기원전  | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | yearText / 문자열 (수정 전 808행) | 년 | 년 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | yearText / 문자열 (수정 전 808행) | 서기  | 서기  | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | yearText / 문자열 (수정 전 808행) | 년 | 년 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | refreshTimeClaims / 문자열 (수정 전 834행) | 연대 조회 실패 | 연도 기록을 불러오지 못했어요. | 기준서 §1 짧고 자연스러운 표현 | 연도 기록을 불러오지 못했습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/index.html | refreshTimeClaims / 문자열 (수정 전 836행) | 연대 주장  | 연도 기록 보기  | 기준서 §1 쉬운 용어; 기준서 §2 버튼·안내 | 유지 |
| services/host/index.html | showTimeClaims / h3 (수정 전 849행) | 선택한 사료의 연대 주장 | 선택한 자료의 연도 기록 | 기준서 §1 쉬운 용어 | 선택한 사료의 연도 기록 — '사료' 되살림 (Q9=a) |
| services/host/index.html | showTimeClaims / p (수정 전 849행) | 원표기와 환산 주장은 별도로 남긴다. 연도 버튼은 그 환산의 출처와 시간축을 함께 연다. 범위가 없는 날짜는 미상이다. | 원래 날짜와 서기로 바꾼 날짜를 따로 보여줘요. 연도를 누르면 출처와 시간 막대가 함께 열려요. 날짜 범위가 없으면 미확인으로 표시해요. | 기준서 §1 쉬운 용어; 기준서 §2 안내 말투 / E-7 | 원래 날짜와 서기로 바꾼 날짜를 따로 보여줍니다. 연도를 누르면 출처와 시간 막대가 함께 열립니다. 날짜 범위가 없으면 미확인으로 표시합니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/index.html | showTimeClaims / 화면 문구 (수정 전 853행) | · 원표기 출처 | · 원래 날짜 출처 보기 | 기준서 §2 버튼·안내 | 유지 |
| services/host/index.html | showTimeClaims / 문자열 (수정 전 857행) | 시작 미상 | 시작 미확인 | 기준서 §2 안내 말투 / E-7 | 유지 |
| services/host/index.html | showTimeClaims / 문자열 (수정 전 857행) | 끝 미상 | 끝 미확인 | 기준서 §2 안내 말투 / E-7 | 유지 |
| services/host/index.html | showTimeClaims / p (수정 전 860행) | 선택한 조건의 서기 환산 없음 | 고른 조건에 맞는 서기 날짜가 없어요 | 기준서 §1 짧고 자연스러운 표현 | 고른 조건에 맞는 서기 날짜가 없습니다 — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/index.html | showTimeClaims / p (수정 전 863행) | 선택한 조건의 연대 주장이 없다. | 고른 조건에 맞는 연도 기록이 없어요. | 기준서 §1 쉬운 용어; 기준서 §2 안내 말투 / E-7 | 고른 조건에 맞는 연도 기록이 없습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/index.html | refreshYearCount / 문자열 (수정 전 871행) | 이 해의 기록  | 이 해의 기록 보기  | 기준서 §2 버튼·안내 | 유지 |
| services/host/index.html | showYear / p (수정 전 881행) | 찾는 중… | 찾고 있어요… | 기준서 §2 안내 말투 / E-7 | 찾고 있습니다… — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/index.html | showYear / 문자열 (수정 전 886행) |  ·  | ,  | 기준서 §1 동적 목록의 3개 이상 가운뎃점 나열 방지 | 유지 |
| services/host/index.html | showYear / div (수정 전 888행) | 이 해로 연대가 붙은 기사 — 국편 dateOccured 기준. 연대가 없는 기사(비문·삼국유사 대부분)는 여기 없다. | 국사편찬위원회가 이 해로 날짜를 붙인 기록이에요. 날짜가 없는 기록은 여기에 나오지 않아요. 비문·삼국유사 기록 대부분이 이에 해당해요. | 기준서 §2 안내 말투 / E-7; 기준서 §1 / B-2 우리말 표기 | 국사편찬위원회가 이 해로 날짜를 붙인 기록입니다. 날짜가 없는 기록은 여기에 나오지 않습니다. 비문·삼국유사 기록 대부분이 이에 해당합니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/index.html | showYear / div (수정 전 888행) | 기록 | 기록 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showYear / 문자열 (수정 전 891행) | 켜진 사료에 이 해의 기사가 없다 | 고른 자료에 이 해의 기록이 없어요 | 기준서 §1 쉬운 용어; 기준서 §2 안내 말투 / E-7 | 고른 사료에 이 해의 기록이 없습니다 — 문체 -ㅂ니다/-십시오 (Q3=b) · '사료' 되살림 (Q9=a) |
| services/host/index.html | showYear / 문자열 (수정 전 893행) | 건 중 앞  | 건 중 앞  | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showYear / 화면 문구 (수정 전 893행) | 건만 보인다. | 건만 보여요. | 기준서 §2 안내 말투 / E-7 | 건만 보입니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/index.html | chunkCard / 문자열 (수정 전 907행) |  ·  | ,  | 기준서 §1 동적 목록의 3개 이상 가운뎃점 나열 방지 | 유지 |
| services/host/index.html | chunkCard / 문자열 (수정 전 909행) | 결자  | 빠진 글자  | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/index.html | chunkCard / 문자열 (수정 전 910행) | 한자  | 한자  | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | chunkCard / 문자열 (수정 전 911행) |  ·  | ,  | 기준서 §1 동적 목록의 3개 이상 가운뎃점 나열 방지 | 유지 |
| services/host/index.html | chunkCard / 문자열 (수정 전 912행) | 원문 보기 | 원문 보기 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | chunkCard / p (수정 전 916행) | 제공처 스캔 이미지 · 전사문·번역문 없음. 이미지를 누르면 원래 크기로 열린다. | 제공처가 올린 원문 사진이에요. 옮겨 쓴 글과 번역문은 없어요. 누르면 원래 크기로 열려요. | 기준서 §1 나열 축소 | 제공처가 올린 원문 사진입니다. 옮겨 쓴 글과 번역문은 없습니다. 누르면 원래 크기로 열립니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/index.html | chunkCard / p (수정 전 917행) | 저장된 본문 텍스트가 없다. | 저장된 본문이 없어요. | 기준서 §1 쉬운 용어; 기준서 §2 안내 말투 / E-7 | 저장된 본문이 없습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/index.html | renderRail / p (수정 전 925행) | 사료 없음 | 자료 없음 | 기준서 §1 쉬운 용어 | 사료 없음 — '사료' 되살림 (Q9=a) |
| services/host/index.html | renderRail / 문자열 (수정 전 934행) | 수록 항목과 출처 | 수록 항목과 출처 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showSource / p (수정 전 977행) | 카드를 여는 중… | 카드를 열고 있어요… | 기준서 §2 안내 말투 / E-7 | 카드를 열고 있습니다… — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/index.html | showSource / p (수정 전 981행) | 카드가 없다: | 자료 설명이 없어요. | 기준서 §2 안내 말투 / E-7 | 사료 설명이 없습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) · '사료' 되살림 (Q9=a) |
| services/host/index.html | yr / 문자열 (수정 전 983행) | 기원전  | 기원전  | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showSource / 문자열 (수정 전 985행) | 다루는 기간 | 다루는 기간 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showSource / 문자열 (수정 전 985행) | 미상 | 미확인 | 기준서 §2 안내 말투 / E-7 | 유지 |
| services/host/index.html | showSource / 문자열 (수정 전 986행) | 쓰인 때 | 쓰인 때 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showSource / 문자열 (수정 전 986행) | 미상 | 미확인 | 기준서 §2 안내 말투 / E-7 | 유지 |
| services/host/index.html | showSource / 문자열 (수정 전 987행) | 엮은이 | 엮은이 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showSource / 문자열 (수정 전 987행) | 미상 | 미확인 | 기준서 §2 안내 말투 / E-7 | 유지 |
| services/host/index.html | showSource / 문자열 (수정 전 988행) | 원문 조각 | 원문 대목 | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/index.html | showSource / 문자열 (수정 전 989행) | 이용허락 | 이용허락 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showSource / 문자열 (수정 전 989행) | 미확인 | 미확인 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showSource / 문자열 (수정 전 990행) | 확인 | 확인 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showSource / 문자열 (수정 전 990행) | 미확인 | 미확인 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showSource / 문자열 (수정 전 991행) | 상태 | 상태 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showSource / 문자열 (수정 전 991행) |  · 기본 렌즈 |  · 기본 자료 | 기준서 §1 쉬운 용어 | · 기본 사료 — '사료' 되살림 (Q9=a) |
| services/host/index.html | showSource / span (수정 전 995행) | 사료 카드 | 자료 설명 | 기준서 §1 쉬운 용어 | 사료 설명 — '사료' 되살림 (Q9=a) |
| services/host/index.html | showSource / 문자열 (수정 전 997행) | 확인 | 확인 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showSource / 문자열 (수정 전 997행) | 페이지 | 페이지 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | showSource / button (수정 전 1000행) | 수록한 스캔 보기 | 원문 사진 보기 | 기준서 §2 버튼·안내 | 유지 |
| services/host/index.html | showScanPage / p (수정 전 1008행) | 스캔 면을 불러오는 중… | 원문 사진을 불러오고 있어요… | 기준서 §2 안내 말투 / E-7 | 원문 사진을 불러오고 있습니다… — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/index.html | showScanPage / 문자열 (수정 전 1011행) | 스캔 목록 조회 실패 | 원문 사진 목록을 불러오지 못했어요. | 기준서 §1 짧고 자연스러운 표현 | 원문 사진 목록을 불러오지 못했습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/index.html | showScanPage / button (수정 전 1014행) | 사료 카드 | 자료 설명 보기 | 기준서 §1 쉬운 용어; 기준서 §2 버튼·안내 | 사료 설명 보기 — '사료' 되살림 (Q9=a) |
| services/host/index.html | showScanPage / p (수정 전 1017행) | 현재 사료 선택에 표시할 스캔이 없다. 이 사료를 켜면 수록한 면을 볼 수 있다. | 고른 자료에는 표시할 원문 사진이 없어요. 이 자료를 켜면 저장된 사진을 볼 수 있어요. | 기준서 §1 쉬운 용어; 기준서 §2 안내 말투 / E-7 | 고른 사료에는 표시할 원문 사진이 없습니다. 이 사료를 켜면 저장된 사진을 볼 수 있습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) · '사료' 되살림 (Q9=a) |
| services/host/index.html | showScanPage / p (수정 전 1020행) | 스캔 | 원문 사진 | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/index.html | showScanPage / 화면 문구 (수정 전 1020행) | 면 · 본문 전사 0 | 면 · 옮겨 쓴 본문 0 | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/index.html | showScanPage / 화면 문구 (수정 전 1021행) | &gt;앞면 | &gt;앞면 보기 | 기준서 §2 버튼·안내 | 유지 |
| services/host/index.html | showScanPage / 화면 문구 (수정 전 1022행) | &gt;뒷면 | &gt;뒷면 보기 | 기준서 §2 버튼·안내 | 유지 |
| services/host/index.html | showScanPage / label (수정 전 1022행) | 스캔 번호 | 사진 번호 | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/index.html | showScanPage / button (수정 전 1023행) | 이동 | 이동하기 | 기준서 §2 버튼·안내 | 유지 |
| services/host/index.html | renderStats / i (수정 전 1041행) | 지명 | 지명 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | renderStats / i (수정 전 1041행) | 비정 갈림 | 위치 해석이 갈림 | 기준서 §1 쉬운 용어 | 유지 |
| services/host/index.html | renderStats / i (수정 전 1042행) | 위치 미정 | 위치 미확인 | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/index.html | renderStats / i (수정 전 1043행) | 원문 조각 | 원문 대목 | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/index.html | span / 문자열 (수정 전 1207행) | 기원전  | 기원전  | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | span / 문자열 (수정 전 1207행) | 기원전  | 기원전  | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | select / 문자열 (수정 전 1212행) | 출처 | 출처 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | select / span (수정 전 1212행) | AI 연결 · 미검토 | AI 연결 · 사람 확인 전 | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/index.html | select / 화면 문구 (수정 전 1213행) | "&gt;위치 서술 출처 | "&gt;위치 설명 보기 | 기준서 §2 버튼·안내 | 유지 |
| services/host/index.html | select / 화면 문구 (수정 전 1214행) | "&gt;대표점 좌표 출처 | "&gt;대표 위치 출처 보기 | 기준서 §2 버튼·안내 | 유지 |
| services/host/index.html | select / 화면 문구 (수정 전 1215행) | "&gt;사료 카드 | "&gt;자료 설명 보기 | 기준서 §1 쉬운 용어; 기준서 §2 버튼·안내 | ">사료 설명 보기 — '사료' 되살림 (Q9=a) |
| services/host/index.html | select / p (수정 전 1216행) | 현재 작성자 필터에 맞는 좌표 연결이 없다. | 고른 작성자가 연결한 위치가 없어요. | 기준서 §2 안내 말투 / E-7 | 고른 작성자가 연결한 위치가 없습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/index.html | select / b (수정 전 1217행) | 위치가 정해지지 않았다. | 위치 미확인 | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/index.html | select / b (수정 전 1217행) | 비정안이 여럿이거나 확정된 것이 없다. 이 시스템은 판정하지 않으므로 지도에 점을 찍지 않는다. | 위치 해석이 여럿이거나 확인된 위치가 없어요. 여기서 어느 쪽이 맞는지 정하지 않고 지도에도 점을 찍지 않아요. | 기준서 §1 쉬운 용어; 기준서 §2 안내 말투 / E-7 | 위치 해석이 여럿이거나 확인된 위치가 없습니다. 여기서 어느 쪽이 맞는지 정하지 않고 지도에도 점을 찍지 않습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/index.html | select / 문자열 (수정 전 1222행) |  ·  | ,  | 기준서 §1 동적 목록의 3개 이상 가운뎃점 나열 방지 | 유지 |
| services/host/index.html | select / 화면 문구 (수정 전 1223행) | 에 나온 지명 · 이 사료 안에서 원문을 찾는다. | 에 나온 지명 · 이 자료에서 원문을 찾아요. | 기준서 §1 쉬운 용어 | 에 나온 지명 · 이 사료에서 원문을 찾습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) · '사료' 되살림 (Q9=a) |
| services/host/index.html | select / 문자열 (수정 전 1226행) | 좌표 후보 | 위치 후보 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 위치 후보 — 같은 뜻을 두 말로 부르던 것을 통일 (#198 감사 C-17) · scripts/verify_place_research.py 단언 함께 갱신 |
| services/host/index.html | select / 문자열 (수정 전 1226행) | 위치 미정 | 위치 미확인 | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/index.html | select / 문자열 (수정 전 1227행) | 위치 확정 | 위치 확정 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | select / 문자열 (수정 전 1227행) | 통설 | 널리 인정된 위치 | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/index.html | select / 문자열 (수정 전 1227행) | 비정이 갈림 | 위치 해석이 갈림 | 기준서 §1 쉬운 용어 | 유지 |
| services/host/index.html | select / 문자열 (수정 전 1227행) | 위치 미정 | 위치 미확인 | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/index.html | select / span (수정 전 1228행) | 조사(자동) · 미확인 | 조사(자동) · 사람 확인 전 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | select / div (수정 전 1231행) | 원문 출처 | 원문 출처 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | select / p (수정 전 1231행) | 찾는 중… | 찾고 있어요… | 기준서 §2 안내 말투 / E-7 | 찾고 있습니다… — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/index.html | objText / 문자열 (수정 전 1258행) | 기원전  | 기원전  | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | objText / 화면 문구 (수정 전 1258행) | 년 | 년 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | select / 문자열 (수정 전 1273행) | 같은 대상으로 보는 주장 | 같은 대상으로 본 기록 | 기준서 §1 쉬운 용어 | 유지 |
| services/host/index.html | select / span (수정 전 1279행) | 이 항목을 가리키는 주장 | 이 항목을 가리키는 기록 | 기준서 §1 쉬운 용어 | 유지 |
| services/host/index.html | select / span (수정 전 1280행) | 값이 갈림 | 기록이 갈림 | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/index.html | select / 문자열 (수정 전 1281행) | AI 추출 | AI 추출 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | select / 문자열 (수정 전 1281행) | 사람 | 사람 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | select / 화면 문구 (수정 전 1285행) | "&gt;인용한 원문 열기 | "&gt;인용한 원문 열기 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | select / 문자열 (수정 전 1287행) | 사람이 작성한 것으로 기록된 주장이 없다 | 사람이 작성했다고 표시된 기록이 없어요 | 기준서 §1 쉬운 용어; 기준서 §2 안내 말투 / E-7 | 사람이 작성했다고 표시된 기록이 없습니다 — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/index.html | select / 문자열 (수정 전 1287행) | 현재 사료 선택에 맞는 주장이 없다 | 고른 자료에 맞는 기록이 없어요 | 기준서 §1 쉬운 용어; 기준서 §2 안내 말투 / E-7 | 고른 사료에 맞는 기록이 없습니다 — 문체 -ㅂ니다/-십시오 (Q3=b) · '사료' 되살림 (Q9=a) |
| services/host/index.html | select / 문자열 (수정 전 1287행) |  (전체 주장  |  (전체 기록  | 기준서 §1 쉬운 용어 | 유지 |
| services/host/index.html | select / 문자열 (수정 전 1287행) | 건) | 건) | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | select / div (수정 전 1289행) | 주장 | 기록 | 기준서 §1 쉬운 용어 | 유지 |
| services/host/index.html | select / 문자열 (수정 전 1290행) |  · 갈리는 술어  |  · 내용이 다른 항목  | 기준서 §1 쉬운 용어 | 유지 |
| services/host/index.html | select / div (수정 전 1290행) | 사료 한 대목에서 세운 주장(Claim). 인용문은 그 대목의 글자 그대로이고, 누가(사람/AI) 세웠는지 딱지가 붙는다. | 자료 한 대목에서 찾은 기록이에요. 인용문은 원문 그대로예요. 사람과 AI 중 누가 정리했는지도 표시해요. | 기준서 §1 쉬운 용어 | 사료 한 대목에서 찾은 기록입니다. 인용문은 원문 그대로입니다. 사람과 AI 중 누가 정리했는지도 표시합니다. — 문체 -ㅂ니다/-십시오 (Q3=b) · '사료' 되살림 (Q9=a) |
| services/host/index.html | select / 문자열 (수정 전 1292행) |  붉은 줄은 같은 술어에 값이 갈리는 주장 — 어느 쪽이 맞는지는 판정하지 않는다. |  붉은 줄은 같은 항목의 내용이 서로 다른 기록이에요. 어느 쪽이 맞는지는 정하지 않아요. | 기준서 §1 쉬운 용어 | 붉은 줄은 같은 항목의 내용이 서로 다른 기록입니다. 어느 쪽이 맞는지는 정하지 않습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/index.html | select / div (수정 전 1293행) | 원문 출처 | 원문 출처 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | select / p (수정 전 1293행) | 찾는 중… | 찾고 있어요… | 기준서 §2 안내 말투 / E-7 | 찾고 있습니다… — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/index.html | select / p (수정 전 1298행) | 원문 조회에 실패했다. 항목을 다시 선택해 재시도할 수 있다. | 원문을 불러오지 못했어요. 항목을 다시 골라 보세요. | 기준서 §2 안내 말투 / E-7; 기준서 §2 버튼·안내 | 원문을 불러오지 못했습니다. 항목을 다시 골라 보십시오. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/index.html | select / 문자열 (수정 전 1299행) |  ·  | ,  | 기준서 §1 동적 목록의 3개 이상 가운뎃점 나열 방지 | 유지 |
| services/host/index.html | select / p (수정 전 1302행) | 켜진 사료의 원문에서 이 이름을 찾지 못했다. | 고른 자료의 원문에서 이 이름을 찾지 못했어요. | 기준서 §1 쉬운 용어; 기준서 §2 안내 말투 / E-7 | 고른 사료의 원문에서 이 이름을 찾지 못했습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) · '사료' 되살림 (Q9=a) |
| services/host/index.html | select / 문자열 (수정 전 1304행) | 건 중 앞  | 건 중 앞  | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | select / 화면 문구 (수정 전 1304행) | 건만 보인다. | 건만 보여요. | 기준서 §2 안내 말투 / E-7 | 건만 보입니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/index.html | select / div (수정 전 1306행) | 원문 출처 | 원문 출처 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/index.html | select / div (수정 전 1307행) | 두 글자 이상 이름 또는 국명 색인의 정확 일치로 찾음(자동) · 사람이 확인한 연결 아님 | 두 글자 이상 이름이나 나라 이름 색인에서 똑같은 이름을 자동으로 찾았어요. 사람이 확인한 연결은 아니에요 | 기준서 §1 짧고 자연스러운 표현 | 두 글자 이상 이름이나 나라 이름 색인에서 똑같은 이름을 자동으로 찾았습니다. 사람이 확인한 연결은 아닙니다 — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/index.html | select / div (수정 전 1309행) | 한 글자 이름은 원문 자동 검색 안 함 · 국명 색인이 있는 사료에서 정확히 같은 국명만 찾는다. | 한 글자 이름은 원문에서 자동으로 찾지 않아요. 나라 이름 색인이 있는 자료에서 똑같은 나라 이름만 찾아요. | 기준서 §1 쉬운 용어 | 한 글자 이름은 원문에서 자동으로 찾지 않습니다. 나라 이름 색인이 있는 사료에서 똑같은 나라 이름만 찾습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) · '사료' 되살림 (Q9=a) |
| services/host/index.html | module / 문자열 (수정 전 1342행) | 지명을 클릭하면 출처가 열린다 | 지명을 누르면 출처가 열려요 | 기준서 §1 짧고 자연스러운 표현 | 지명을 누르면 출처가 열립니다 — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/index.html | module / 문자열 (수정 전 1348행) | 끌어서 이동 · 휠로 확대 · 오른쪽 드래그로 회전 | 끌어서 이동, 휠로 확대, 오른쪽 버튼으로 회전 | 기준서 §1 나열 축소; 기준서 §2 버튼·안내 | 유지 — #195 이후 명사 나열(끌어서 이동, 휠로 확대, 오른쪽 버튼으로 회전)이라 -요체가 없다 |
| services/host/index.html | init3d / 문자열 (수정 전 1386행) | 끌어서 이동 · 휠로 확대 · 연도로 탐색 | 끌어서 이동, 휠로 확대, 오른쪽 버튼으로 회전 | 기준서 §1 나열 축소; 기준서 §2 버튼·안내 | 유지 — #195 이후 명사 나열이라 -요체가 없다 |
| services/host/index.html | init3d / 문자열 (수정 전 1412행) | 지도 자료를 불러오지 못했습니다. | 지도 자료를 불러오지 못했어요. | 기준서 §2 안내 말투 / E-7 | 지도 자료를 불러오지 못했습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/index.html | init3d / 문자열 (수정 전 1415행) | 국가 영역 자료를 불러오지 못했습니다. | 국가 영역 자료를 불러오지 못했어요. | 기준서 §2 안내 말투 / E-7 | 국가 영역 자료를 불러오지 못했습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/ai-images.js | loadAiImages / 문자열 (수정 전 8행) | AI 이미지 목록을 불러오지 못했습니다. | AI 상상도 목록을 불러오지 못했어요. | 기준서 §2 안내 말투 / E-7; 기준서 §3 배지 통일 | AI 상상도 목록을 불러오지 못했습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/ai-images.js | loadAiImages / 문자열 (수정 전 17행) | AI 생성 상상도 | AI 상상도 | 기준서 §3 배지 통일 | 유지 |
| services/host/app/ai-images.js | loadAiImages / 문자열 (수정 전 18행) | 실제 사료·유물 사진이 아니라 AI가 만든 상상도입니다. | (코드에 없음) | 유지 — 작업 지시의 NOTICE 보존 | 삭제 — AI 고지 문장 완전 삭제 (Q5=a) · notice 기본값·필드 노출 제거 |
| services/host/app/atlas-chat.js | constructor / 문자열 (수정 전 10행) | AI와 역사 이야기 | AI와 역사 이야기 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-chat.js | constructor / 화면 문구 (수정 전 11행) | AI와 역사 이야기 | AI와 역사 이야기 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-chat.js | constructor / button / aria-label (수정 전 11행) | AI 대화 닫기 | AI 대화 닫기 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-chat.js | constructor / 문자열 (수정 전 22행) | 궁금한 역사를 물어보세요 | 궁금한 역사를 물어보세요 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 궁금한 역사를 물어보십시오 — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/atlas-chat.js | constructor / 문자열 (수정 전 23행) | 질문 보내기 | 질문 보내기 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-chat.js | invalidate / 문자열 (수정 전 34행) | 선택한 이야기나 사료가 바뀌었습니다. 현재 기록으로 다시 질문해 보세요. | 고른 이야기나 자료가 바뀌었어요. 현재 기록으로 다시 물어보세요. | 기준서 §1 쉬운 용어; 기준서 §2 안내 말투 / E-7; 기준서 §2 버튼·안내 | 고른 이야기나 사료가 바뀌었습니다. 현재 기록으로 다시 물어보십시오. — 문체 -ㅂ니다/-십시오 (Q3=b) · '사료' 되살림 (Q9=a) |
| services/host/app/atlas-chat.js | renderContext / 문자열 (수정 전 41행) | 선택한 이야기 ·  | 고른 이야기:  | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/app/atlas-chat.js | renderContext / 문자열 (수정 전 43행) | 에 대해 기록은 어떻게 설명하나요? | 에 대해 기록은 어떻게 설명하나요? | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-chat.js | renderContext / 문자열 (수정 전 44행) | 과 관련된 사건을 알려주세요. | 과 관련된 사건을 알려주세요. | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 관련된 사건을 알려주십시오. — #203 감사 7: 받침에 따라 와/과를 고르므로 조사는 이름 쪽에 붙는다 |
| services/host/app/atlas-chat.js | renderContext / p (수정 전 45행) | 이런 질문도 해보세요 | 이런 질문도 해 보세요 | 기준서 §2 버튼·안내 | 이런 질문도 해 보십시오 — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/chronicle.js | TYPE_WORDS (수정 전 atlas-data.js:4 typeName) | 인물 | 인물 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 — 값은 그대로, 대조표만 chronicle.js 의 `TYPE_WORDS` 로 옮겨 여러 화면이 함께 쓴다 (#198 감사 C-18) |
| services/host/app/chronicle.js | TYPE_WORDS (수정 전 atlas-data.js:4 typeName) | 사건 | 사건 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 — 값은 그대로, 대조표만 chronicle.js 의 `TYPE_WORDS` 로 옮겨 여러 화면이 함께 쓴다 (#198 감사 C-18) |
| services/host/app/chronicle.js | TYPE_WORDS (수정 전 atlas-data.js:4 typeName) | 장소 | 장소 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 — 값은 그대로, 대조표만 chronicle.js 의 `TYPE_WORDS` 로 옮겨 여러 화면이 함께 쓴다 (#198 감사 C-18) |
| services/host/app/chronicle.js | TYPE_WORDS (수정 전 atlas-data.js:4 typeName) | 나라 | 나라 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 — 값은 그대로, 대조표만 chronicle.js 의 `TYPE_WORDS` 로 옮겨 여러 화면이 함께 쓴다 (#198 감사 C-18) |
| services/host/app/chronicle.js | TYPE_WORDS (수정 전 atlas-data.js:4 typeName) | 전승 | 전승 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 — 값은 그대로, 대조표만 chronicle.js 의 `TYPE_WORDS` 로 옮겨 여러 화면이 함께 쓴다 (#198 감사 C-18) |
| services/host/app/chronicle.js | TYPE_WORDS (수정 전 atlas-data.js:4 typeName) | 기록 | 기록 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 — 값은 그대로, 대조표만 chronicle.js 의 `TYPE_WORDS` 로 옮겨 여러 화면이 함께 쓴다 (#198 감사 C-18) |
| services/host/app/atlas-data.js | relationName / 문자열 (수정 전 9행) | 자녀 | 자녀 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-data.js | relationName / 문자열 (수정 전 9행) | 자녀 | 자녀 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-data.js | relationName / 문자열 (수정 전 9행) | 부모 | 부모 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-data.js | relationName / 문자열 (수정 전 9행) | 제자 | 제자 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-data.js | relationName / 문자열 (수정 전 9행) | 스승 | 스승 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-data.js | relationDates / 문자열 (수정 전 21행) | 부터 | 부터 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-data.js | relationDates / 문자열 (수정 전 21행) | 까지 | 까지 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-data.js | datesLabel / 문자열 (수정 전 61행) | 연대 미확인 | 연도 미확인 | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/app/atlas-eras.js | module / 문자열 (수정 전 1행) | 고대 | 고대 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-eras.js | module / 문자열 (수정 전 1행) | 삼국 | 삼국 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-eras.js | module / 문자열 (수정 전 1행) | 남북국 | 남북국 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-eras.js | module / 문자열 (수정 전 1행) | 고려 | 고려 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-eras.js | module / 문자열 (수정 전 1행) | 조선 | 조선 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-eras.js | module / 문자열 (수정 전 1행) | 대한제국 | 대한제국 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-eras.js | module / 문자열 (수정 전 1행) | 일제강점기 | 일제강점기 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-eras.js | module / 문자열 (수정 전 1행) | 현대 | 현대 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-events.js | constructor / 문자열 (수정 전 21행) | 연도별 사건 목록 | 연도별 사건 목록 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-events.js | constructor / h2 (수정 전 22행) | 사건 목록 | 사건 목록 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-events.js | constructor / button / aria-label (수정 전 22행) | 사건 목록 닫기 | 사건 목록 닫기 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-events.js | constructor / div / aria-label (수정 전 22행) | 사건 종류 | 사건 종류 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-events.js | constructor / 문자열 (수정 전 22행) | 전체 | 전체 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-events.js | constructor / 문자열 (수정 전 22행) | 전쟁 | 전쟁 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-events.js | constructor / 문자열 (수정 전 22행) | 정치 | 정치 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-events.js | constructor / 문자열 (수정 전 22행) | 문화 | 문화 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-events.js | card / 문자열 (수정 전 39행) |  ·  | ,  | 기준서 §1 동적 목록의 3개 이상 가운뎃점 나열 방지 | 유지 |
| services/host/app/atlas-events.js | card / em (수정 전 39행) | 선택한 사건 보기 | 선택한 사건 보기 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-events.js | card / 화면 문구 (수정 전 39행) | 으로 이동 | 으로 이동 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-events.js | preview / 문자열 (수정 전 41행) | 의 앞뒤 이야기 | 의 앞뒤 이야기 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-search.js | constructor / button / aria-label (수정 전 10행) | 인물·사건 검색 | 인물·사건 찾기 | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/app/atlas-search.js | constructor / input#atlasQuery / aria-label (수정 전 10행) | 인물·사건 찾기 | 인물·사건 찾기 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-search.js | constructor / input#atlasQuery / placeholder (수정 전 10행) | 인물·사건 찾기 | 인물·사건 찾기 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-search.js | constructor / button / aria-label (수정 전 10행) | 검색어 지우기 | 검색어 지우기 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-search.js | constructor / 문자열 (수정 전 12행) | 검색 결과 | 검색 결과 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-search.js | constructor / h2 (수정 전 13행) | 검색 결과 | 검색 결과 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-search.js | constructor / button / aria-label (수정 전 13행) | 검색 결과 닫기 | 검색 결과 닫기 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-search.js | constructor / div / aria-label (수정 전 13행) | 검색 종류 | 검색 종류 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-search.js | constructor / 문자열 (수정 전 13행) | 전체 | 전체 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-search.js | constructor / 문자열 (수정 전 13행) | 인물 | 인물 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-search.js | constructor / 문자열 (수정 전 13행) | 사건 | 사건 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-search.js | render / 문자열 (수정 전 33행) | 자료를 불러오는 중… | 자료를 불러오고 있어요… | 기준서 §2 안내 말투 / E-7 | 자료를 불러오고 있습니다… — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/atlas-search.js | render / 문자열 (수정 전 33행) | 선택한 사료 · 전체 시대에서  | 고른 자료 기준  | 기준서 §1 쉬운 용어 | 고른 사료 기준 — '사료' 되살림 (Q9=a) |
| services/host/app/atlas-search.js | render / 문자열 (수정 전 33행) | 개 | 개 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-search.js | render / 문자열 (수정 전 33행) | 인물이나 사건 이름을 입력해 보세요. | 인물이나 사건 이름을 입력해 보세요. | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 인물이나 사건 이름을 입력해 보십시오. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/atlas-search.js | render / 문자열 (수정 전 34행) | 관련  | 관련  | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-search.js | render / p (수정 전 34행) | 검색 결과가 없습니다. 다른 이름이나 사료 선택을 확인해 주세요. | 검색 결과가 없어요. 다른 이름을 쓰거나 자료를 바꿔 보세요. | 기준서 §1 쉬운 용어; 기준서 §2 안내 말투 / E-7; 기준서 §2 버튼·안내 | 검색 결과가 없습니다. 다른 이름을 쓰거나 사료를 바꿔 보십시오. — 문체 -ㅂ니다/-십시오 (Q3=b) · '사료' 되살림 (Q9=a) |
| services/host/app/atlas-search.js | render / p (수정 전 41행) | 관련 사건 | 관련 사건 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-search.js | render / 문자열 (수정 전 42행) | 기록의 근거 | 출처 보기 | 기준서 §2 버튼·안내 | 유지 |
| services/host/app/atlas-search.js | render / 문자열 (수정 전 43행) | 에서 보기 | 에서 보기 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-search.js | render / 문자열 (수정 전 43행) | 인물 기록 보기 | 인물 기록 보기 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-story.js | constructor / 문자열 (수정 전 46행) | 인물과 사건 이야기 | 인물과 사건 이야기 | 유지 — #193 패널 기준 | 유지 |
| services/host/app/atlas-story.js | sections / 문자열 (수정 전 155행) | 관계 | 관계 | 유지 — #193 패널 기준 | 유지 |
| services/host/app/atlas-story.js | sections / 문자열 (수정 전 156행) | 연표 | 연표 | 유지 — #193 패널 기준 | 유지 |
| services/host/app/atlas-story.js | sections / 문자열 (수정 전 157행) | 장소 | 장소 | 유지 — #193 패널 기준 | 유지 |
| services/host/app/atlas-story.js | sections / 문자열 (수정 전 159행) | 시대 | 시대 | 유지 — #193 패널 기준 | 유지 |
| services/host/app/atlas-story.js | relationGroups / 문자열 (수정 전 164행) | 함께 참여 | (코드에 없음) | 유지 — #193 패널 기준 | 해당 없음 — #197 카드 개편에서 사라진 문구 |
| services/host/app/atlas-story.js | relationGroups / 문자열 (수정 전 164행) | 같은 사건 | 같은 사건 | 유지 — #193 패널 기준 | 유지 |
| services/host/app/atlas-story.js | relationGroups / 문자열 (수정 전 165행) | 같은 사건 | 같은 사건 | 유지 — #193 패널 기준 | 유지 |
| services/host/app/atlas-story.js | relationGroups / 문자열 (수정 전 166행) | 관계 | 관계 | 유지 — #193 패널 기준 | 유지 |
| services/host/app/atlas-story.js | eventHtml / 문자열 (수정 전 181행) | 장소 미확인 | 장소 미확인 | 유지 — #193 패널 기준 | 유지 |
| services/host/app/atlas-story.js | timelineHtml / 문자열 (수정 전 186행) | 연도 미확인 | 연도 미확인 | 유지 — #193 패널 기준 | 유지 |
| services/host/app/atlas-story.js | moreHtml / 화면 문구 (수정 전 190행) | 더 | 더 보기 | 유지 — #193 패널 기준 | 더 보기 — 같은 화면의 다른 버튼과 형태를 맞춤 (#198 감사 C-15) |
| services/host/app/atlas-story.js | sectionHtml / 문자열 (수정 전 200행) | 명 | 명 | 유지 — #193 패널 기준 | 유지 |
| services/host/app/atlas-story.js | sectionHtml / 문자열 (수정 전 210행) | 건 | 건 | 유지 — #193 패널 기준 | 유지 |
| services/host/app/atlas-story.js | sectionHtml / small (수정 전 217행) | 사건 | 사건 | 유지 — #193 패널 기준 | 유지 |
| services/host/app/atlas-story.js | sectionHtml / 문자열 (수정 전 219행) | 곳 | 곳 | 유지 — #193 패널 기준 | 유지 |
| services/host/app/atlas-story.js | sectionHtml / 문자열 (수정 전 227행) |  모두 보기  |  모두 보기  | 유지 — #193 패널 기준 | 유지 |
| services/host/app/atlas-story.js | updateDescription / 문자열 (수정 전 236행) | 접기 | 접기 | 유지 — #193 패널 기준 | 유지 |
| services/host/app/atlas-story.js | updateDescription / 문자열 (수정 전 236행) | 더 보기 | 더 보기 | 유지 — #193 패널 기준 | 유지 |
| services/host/app/atlas-story.js | render / 문자열 (수정 전 247행) |  출생 | (코드에 없음) | 유지 — #193 패널 기준 | 해당 없음 — #197 카드 개편에서 사라진 문구 |
| services/host/app/atlas-story.js | render / 문자열 (수정 전 247행) |  사망 | (코드에 없음) | 유지 — #193 패널 기준 | 해당 없음 — #197 카드 개편에서 사라진 문구 |
| services/host/app/atlas-story.js | render / 문자열 (수정 전 247행) | 생몰 미확인 | (코드에 없음) | 유지 — #193 패널 기준 | 해당 없음 — #197 카드 개편에서 사라진 문구 |
| services/host/app/atlas-story.js | render / 문자열 (수정 전 248행) | 설화·전승 | 설화·전승 | 유지 — #193 패널 기준 | 유지 |
| services/host/app/atlas-story.js | render / span (수정 전 250행) | AI 상상도 | AI 상상도 | 유지 — #193 패널 기준 | 유지 |
| services/host/app/atlas-story.js | render / nav / aria-label (수정 전 254행) | 이야기 목록 | 이야기 목록 | 유지 — #193 패널 기준 | 유지 |
| services/host/app/atlas-story.js | render / 문자열 (수정 전 254행) | 요약 | 요약 | 유지 — #193 패널 기준 | 유지 |
| services/host/app/atlas-story.js | render / 화면 문구 (수정 전 257행) | 출처와 지도 위치 | 출처와 지도 위치 | 유지 — #193 패널 기준 | 유지 |
| services/host/app/atlas-story.js | render / 문자열 (수정 전 257행) | 출처 기록 | 출처 기록 | 유지 — #193 패널 기준 | 유지 |
| services/host/app/atlas-story.js | render / 문자열 (수정 전 257행) | 원문 보기 | 원문 보기 | 유지 — #193 패널 기준 | 유지 |
| services/host/app/atlas-story.js | render / p (수정 전 257행) | 이어진 출처가 없어요. | 이어진 출처가 없어요. | 유지 — #193 패널 기준 | 연결된 출처가 없습니다. — 문체 -ㅂ니다 (Q3=b) · 문구는 #197 판이 기준 |
| services/host/app/atlas-story.js | render / h4 (수정 전 257행) | 지도 위치 | 지도 위치 | 유지 — #193 패널 기준 | 유지 |
| services/host/app/atlas-story.js | render / 문자열 (수정 전 258행) | 이전 | 이전 | 유지 — #193 패널 기준 | 유지 |
| services/host/app/atlas-story.js | render / 문자열 (수정 전 258행) | 지도로 | 지도로 | 유지 — #193 패널 기준 | 유지 |
| services/host/app/atlas-story.js | render / button / aria-label (수정 전 258행) | 이야기 닫기 | 이야기 닫기 | 유지 — #193 패널 기준 | 유지 |
| services/host/app/atlas-story.js | render / button (수정 전 260행) | 더 보기 | 더 보기 | 유지 — #193 패널 기준 | 유지 |
| services/host/app/atlas-story.js | render / p (수정 전 260행) | 이 항목에 이어진 기록과 관계를 보세요. | 이 항목에 이어진 기록과 관계를 보세요. | 유지 — #193 패널 기준 | 이 항목에 연결된 기록과 관계를 보십시오. — 문체 -십시오 (Q3=b) · 문구는 #197 판이 기준 |
| services/host/app/atlas-story.js | render / p (수정 전 261행) | 다른 이름: | 다른 이름: | 유지 — #193 패널 기준 | 유지 |
| services/host/app/atlas-story.js | render / p (수정 전 262행) | 이야기 속 시기: | 이야기 속 시기: | 유지 — #193 패널 기준 | 유지 |
| services/host/app/atlas-story.js | render / br (수정 전 262행) | 기록된 시기: | 기록된 시기: | 유지 — #193 패널 기준 | 유지 |
| services/host/app/atlas-story.js | render / 화면 문구 (수정 전 266행) | 이 이야기 더 물어보기 | 이 이야기 더 물어보기 | 유지 — #193 패널 기준 | 유지 |
| services/host/app/atlas-ui.js | constructor / h1 (수정 전 16행) | 시공여지도 | 시공여지도 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-ui.js | constructor / p (수정 전 16행) | 시간으로 읽는 한국사 | 시간으로 읽는 한국사 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-ui.js | constructor / span (수정 전 17행) | 지도 설정 | 지도 설정 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-ui.js | constructor / aside#atlasSettings / aria-label (수정 전 17행) | 지도 설정 | 지도 설정 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-ui.js | constructor / h2 (수정 전 17행) | 지도 설정 | 지도 설정 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-ui.js | constructor / button / aria-label (수정 전 17행) | 지도 설정 닫기 | 지도 설정 닫기 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-ui.js | constructor / summary (수정 전 18행) | 사료와 출처 설정 | 자료와 출처 설정 | 기준서 §1 쉬운 용어 | 사료(역사 기록)와 출처 설정 — '사료' 되살림 (Q9=a) · 설정 패널 첫 등장 풀이 1회 |
| services/host/app/atlas-ui.js | constructor / label (수정 전 18행) | 시간 막대 범위 | 시간 막대 범위 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-ui.js | constructor / option (수정 전 18행) | 20년 | 20년 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-ui.js | constructor / option (수정 전 18행) | 100년 | 100년 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-ui.js | constructor / option (수정 전 18행) | 전체 시간 | 전체 시간 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-ui.js | constructor / label (수정 전 18행) | 화질 | 화질 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-ui.js | constructor / option (수정 전 18행) | 자동 | 자동 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-ui.js | constructor / option (수정 전 18행) | 낮음 | 낮음 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-ui.js | constructor / option (수정 전 18행) | 보통 | 보통 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-ui.js | constructor / option (수정 전 18행) | 높음 | 높음 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-ui.js | constructor / p (수정 전 18행) | 지도 속 건물과 생활 풍경은 역사 장면을 위한 상징 모형입니다. | 지도 속 건물과 생활 풍경은 역사 장면을 간단히 표현한 모형이에요. | 기준서 §2 안내 말투 / E-7 | 지도 속 건물과 생활 풍경은 역사 장면을 간단히 표현한 모형입니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/atlas-ui.js | constructor / span (수정 전 24행) | AI와 역사 이야기 | AI와 역사 이야기 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-ui.js | constructor / nav / aria-label (수정 전 24행) | 지도 조작 | 지도 조작 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-ui.js | constructor / button / aria-label (수정 전 24행) | 북쪽을 위로 | 북쪽을 위로 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-ui.js | constructor / button (수정 전 24행) | N | 북 | 기준서 §1 / B-2 우리말 표기 | 유지 |
| services/host/app/atlas-ui.js | constructor / button / aria-label (수정 전 24행) | 지도 확대 | 지도 확대하기 | 기준서 §2 버튼·안내 | 유지 |
| services/host/app/atlas-ui.js | constructor / button / aria-label (수정 전 25행) | 지도 축소 | 지도 축소하기 | 기준서 §2 버튼·안내 | 유지 |
| services/host/app/atlas-ui.js | constructor / button#atlasEvidenceClose / aria-label (수정 전 25행) | 출처 닫기 | 출처 닫기 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-ui.js | buildTime / select / aria-label (수정 전 69행) | 시대로 이동 | 시대로 이동하기 | 기준서 §2 버튼·안내 | 유지 |
| services/host/app/atlas-ui.js | buildTime / span (수정 전 69행) | 사건 목록 | 사건 목록 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-ui.js | buildTime / 문자열 (수정 전 80행) | 이전 사건 | 이전 사건 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-ui.js | buildTime / 문자열 (수정 전 80행) | 다음 사건 | 다음 사건 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-ui.js | syncTime / 문자열 (수정 전 95행) | 기원전 | 기원전 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-ui.js | syncTime / 문자열 (수정 전 95행) | 년 | 년 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/atlas-ui.js | update / 문자열 (수정 전 124행) | 인물과 사건을 불러오는 중… | 인물과 사건을 불러오고 있어요… | 기준서 §2 안내 말투 / E-7 | 인물과 사건을 불러오고 있습니다… — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/chat.js | constructor / h2 (수정 전 4행) | 사료에 묻기 | 자료에 묻기 | 기준서 §1 쉬운 용어 | 사료에 묻기 — '사료' 되살림 (Q9=a) |
| services/host/app/chat.js | constructor / p (수정 전 4행) | 선택한 사료에 연결된 주장을 찾아 답한다. 각 문장의 출처를 누르면 인용과 원문을 볼 수 있다. | 고른 자료에 연결된 기록을 찾아 답해요. 문장의 출처를 누르면 인용과 원문이 열려요. | 기준서 §1 쉬운 용어; 기준서 §2 안내 말투 / E-7 | 고른 사료에 연결된 기록을 찾아 답합니다. 문장의 출처를 누르면 인용과 원문이 열립니다. — 문체 -ㅂ니다/-십시오 (Q3=b) · '사료' 되살림 (Q9=a) |
| services/host/app/chat.js | constructor / label (수정 전 4행) | 질문 | 질문 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chat.js | constructor / textarea#chatQuestion / placeholder (수정 전 4행) | 광개토왕의 이름과 즉위에 대해 비문은 어떻게 서술하나? | 비문은 광개토왕의 이름과 즉위를 어떻게 설명하나요? | A-1 목적어로 연결 | 유지 |
| services/host/app/chat.js | constructor / button (수정 전 4행) | 질문하기 | 물어보기 | 기준서 §2 버튼·안내 | 유지 |
| services/host/app/chat.js | filtersChanged / 문자열 (수정 전 15행) | 사료 선택이 바뀌었다. 현재 조건으로 다시 질문할 수 있다. | 자료 선택이 바뀌었어요. 현재 조건으로 다시 물어보세요. | 기준서 §1 쉬운 용어; 기준서 §2 버튼·안내 | 사료 선택이 바뀌었습니다. 현재 조건으로 다시 물어보십시오. — 문체 -ㅂ니다/-십시오 (Q3=b) · '사료' 되살림 (Q9=a) |
| services/host/app/chat.js | ask / 문자열 (수정 전 23행) | 선택한 출처를 읽고 답변하는 중… | 고른 출처를 읽고 답하고 있어요… | 기준서 §2 안내 말투 / E-7 | 고른 출처를 읽고 답하고 있습니다… — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/chat.js | ask / 문자열 (수정 전 31행) | 답변을 불러오지 못했다. | 답변을 불러오지 못했어요. | 기준서 §2 안내 말투 / E-7 | 답변을 불러오지 못했습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/chat.js | ask / 문자열 (수정 전 32행) | 주장  | 기록  | 기준서 §1 쉬운 용어 | 유지 |
| services/host/app/chat.js | ask / 문자열 (수정 전 32행) | 개를 확인했다. | 개를 확인했어요. | 기준서 §2 안내 말투 / E-7 | 개를 확인했습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/chat.js | ask / 문자열 (수정 전 32행) |  검색된 출처 중 일부만 사용했다. |  찾은 출처 중 일부만 썼어요. | 기준서 §2 안내 말투 / E-7 | 찾은 출처 중 일부만 썼습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/chat.js | ask / 문자열 (수정 전 32행) | 답할 출처가 부족하다. | 답할 근거가 부족해요. | 기준서 §1 짧고 자연스러운 표현 | 답할 근거가 부족합니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/chat.js | ask / 문자열 (수정 전 40행) | [출처  | [출처  | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chat.js | ask / p (수정 전 48행) | Claude가 작성한 설명이다. 인용 연결은 확인했으며, 해석은 원문과 함께 검토할 수 있다. | AI가 쓴 설명이에요. 인용 연결은 확인했어요. 해석은 원문과 함께 살펴보세요. | 기준서 §2 버튼·안내 | AI가 쓴 설명입니다. 인용 연결은 확인했습니다. 해석은 원문과 함께 살펴보십시오. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/chronicle-asset-plan.js | module / 문자열 (수정 전 30행) | 군주 | 군주 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-asset-plan.js | module / 문자열 (수정 전 30행) | 지휘관 | 지휘관 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-asset-plan.js | module / 문자열 (수정 전 30행) | 학자 | 학자 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-asset-plan.js | module / 문자열 (수정 전 30행) | 승려 | 승려 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-asset-plan.js | module / 문자열 (수정 전 30행) | 백성 | 백성 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-asset-plan.js | module / 문자열 (수정 전 30행) | 군사 | 군사 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-asset-plan.js | module / 문자열 (수정 전 30행) | 일꾼 | 일꾼 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-asset-plan.js | module / 문자열 (수정 전 30행) | 의병 | 의병 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-asset-plan.js | module / 문자열 (수정 전 30행) | 사신 | 사신 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-asset-plan.js | module / 문자열 (수정 전 30행) | 인쇄공 | 인쇄공 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-asset-plan.js | module / 문자열 (수정 전 30행) | 백성 | 백성 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-asset-plan.js | module / 문자열 (수정 전 30행) | 경찰 | 경찰 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-asset-plan.js | roleLabel / 문자열 (수정 전 32행) | 국가 지도자 | 국가 지도자 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-asset-plan.js | roleLabel / 문자열 (수정 전 32행) | 지도자 | 지도자 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-asset-plan.js | roleLabel / 문자열 (수정 전 32행) | 황제 | 황제 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-asset-plan.js | planChronicleAssets / 문자열 (수정 전 154행) | 지역 기준 추정 배치 ·  | 지역 기준 추정 배치 ·  | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-assets.js | loadHistoryAssets / 문자열 (수정 전 26행) | 인물 조형을 불러오지 못했습니다. | 인물 모형을 불러오지 못했어요. | 기준서 §1 쉬운 용어; 기준서 §2 안내 말투 / E-7 | 인물 모형을 불러오지 못했습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/chronicle-assets.js | locate / 문자열 (수정 전 175행) | 지역 기준 추정 배치 | 지역 기준 추정 배치 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-assets.js | locate / 문자열 (수정 전 175행) | 사건 장소 | 사건 장소 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-assets.js | locate / 문자열 (수정 전 180행) | 출처에 연결된 사건 장소 | 출처에 연결된 사건 장소 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-assets.js | locate / 문자열 (수정 전 184행) | 사건 장소 | 사건 장소 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-assets.js | locate / 문자열 (수정 전 184행) | 지역 기준 추정 배치 | 지역 기준 추정 배치 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-assets.js | rebuild / 문자열 (수정 전 239행) |  · 지역 기준 추정 배치 |  · 지역 기준 추정 배치 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-assets.js | rebuild / 문자열 (수정 전 246행) | 해당 시기의 출현 근거 | 이 시기에 등장한 기록 | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/app/chronicle-assets.js | rebuild / 문자열 (수정 전 273행) | 일부 역사 조형을 만들지 못했습니다. | 일부 역사 모형을 만들지 못했어요. | 기준서 §1 쉬운 용어; 기준서 §2 안내 말투 / E-7 | 일부 역사 모형을 만들지 못했습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/chronicle-geography.js | constructor / 문자열 (수정 전 33행) | 지역·산맥·섬으로 이동 | 지역, 산맥, 섬으로 이동하기 | 기준서 §1 나열 축소; 기준서 §2 버튼·안내 | 유지 |
| services/host/app/chronicle-geography.js | addMarker / 문자열 (수정 전 44행) | 수도 ·  | 수도 ·  | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-geography.js | addMarker / 문자열 (수정 전 48행) | 수도 ·  | 수도 ·  | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-geography.js | showCard / 문자열 (수정 전 78행) | 지역 기준점 · 인물의 실제 위치를 뜻하지 않습니다. | 지역을 나타내는 기준점이에요. 인물의 실제 위치를 뜻하지는 않아요. | 기준서 §2 안내 말투 / E-7 | 지역을 나타내는 기준점입니다. 인물의 실제 위치를 뜻하지는 않습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/chronicle-geography.js | showCard / 문자열 (수정 전 79행) | 년 ·  | 년 ·  | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-geography.js | showCard / 문자열 (수정 전 79행) |  ·  | ,  | 기준서 §1 동적 목록의 3개 이상 가운뎃점 나열 방지 | 유지 |
| services/host/app/chronicle-geography.js | showCard / 문자열 (수정 전 82행) | 위치 자료 더 보기 | 위치 자료 더 보기 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-load.js | loadChronicle / 문자열 (수정 전 91행) | 시대 정보를 불러오지 못했습니다. | 시대 정보를 불러오지 못했어요. | 기준서 §2 안내 말투 / E-7 | 시대 정보를 불러오지 못했습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/chronicle-load.js | loadChronicle / 문자열 (수정 전 93행) | 한 사료의 기록이 조회 한도를 넘었습니다. 일부 기록만 표시하지 않고 조회를 멈췄습니다. | 한 자료의 기록이 한 번에 불러올 양을 넘었어요. 전체를 보여줄 수 없어 불러오기를 멈췄어요. | 기준서 §1 쉬운 용어; 기준서 §2 안내 말투 / E-7 | 한 사료의 기록이 한 번에 불러올 양을 넘었습니다. 전체를 보여줄 수 없어 불러오기를 멈췄습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) · '사료' 되살림 (Q9=a) |
| services/host/app/chronicle-scene.js | sceneDestinationOptions / 문자열 (수정 전 14행) | 도시·시설 ·  | 도시·시설 ·  | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-scene.js | refresh / 문자열 (수정 전 71행) | 이야기를 골라 보기 | 이야기를 골라 보기 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-scene.js | refresh / 문자열 (수정 전 106행) | 인물·사건을 골라 이동 | 인물·사건을 골라 이동 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-scene.js | refresh / 문자열 (수정 전 122행) | 끌어서 이동 · 휠로 확대 · 오른쪽 드래그로 회전 | (코드에 없음) | 기준서 §1 나열 축소; 기준서 §2 버튼·안내 | 해당 없음 — 이 문구는 index.html 의 3D 전환 쪽에만 남아 있다 (각주 ㄴ) |
| services/host/app/chronicle-scene.js | renderFocus / 문자열 (수정 전 133행) | 설화·전승의 무대 | 설화·전승의 무대 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-scene.js | renderFocus / 문자열 (수정 전 133행) | 시설 · 추정 존속 | 시설 · 추정 존속 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-scene.js | renderFocus / 문자열 (수정 전 133행) | 성곽 배경 · 추정 | 성곽 배경 · 추정 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-scene.js | renderFocus / 문자열 (수정 전 133행) | 도시·시설 ·  | 도시·시설 ·  | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-scene.js | renderFocus / 문자열 (수정 전 133행) | 년 | 년 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-scene.js | renderFocus / 문자열 (수정 전 133행) | 년 | 년 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-scene.js | renderFocus / 문자열 (수정 전 133행) | 현장 | 현장 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-scene.js | activity / 문자열 (수정 전 159행) | 기록 사이 추정 배경 | 기록 사이 추정 배경 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-scene.js | activity / 문자열 (수정 전 160행) | 항목 조사에서 확인한 좌표 | 항목 조사에서 확인한 좌표 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-scene.js | activity / 문자열 (수정 전 161행) | 활동은 확인됐으며 지도 위치는 아직 연결되지 않았습니다. | 활동은 확인했어요. 지도 위치는 아직 연결되지 않았어요. | 기준서 §2 안내 말투 / E-7 | 활동은 확인했습니다. 지도 위치는 아직 연결되지 않았습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/chronicle-scene.js | activity / 문자열 (수정 전 164행) | 출처  | 출처  | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-scene.js | activity / 문자열 (수정 전 164행) | 건은 현재 선택한 사료 밖(위키백과 등)의 기록이라 이 화면에는 나오지 않습니다. | 건은 고르지 않은 자료에 있어요. 위키백과 등이 포함돼 있어 이 화면에는 나오지 않아요. | 기준서 §1 쉬운 용어; 기준서 §2 안내 말투 / E-7 | 건은 고르지 않은 사료에 있습니다. 위키백과 등이 포함돼 있어 이 화면에는 나오지 않습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) · '사료' 되살림 (Q9=a) |
| services/host/app/chronicle-sites.js | planHistoricalSites / 문자열 (수정 전 34행) | 년부터  | 년부터  | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-sites.js | planHistoricalSites / 문자열 (수정 전 34행) | 년까지 연결된 기록 사이에 성곽을 이어서 보여줍니다. 계속 같은 모습으로 쓰였다는 확정 기록은 아니며, 마지막 표시 연도가 폐성 연도를 뜻하지도 않습니다. | 년까지 이어지는 기록 사이에 성곽을 보여줘요. 계속 같은 모습으로 쓰였다는 확정 기록은 아니에요. 마지막 표시 연도가 성을 버린 해를 뜻하지도 않아요. | 기준서 §2 안내 말투 / E-7 | 년까지 이어지는 기록 사이에 성곽을 보여줍니다. 계속 같은 모습으로 쓰였다는 확정 기록은 아닙니다. 마지막 표시 연도가 성을 버린 해를 뜻하지도 않습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/chronicle-sites.js | planHistoricalSites / 문자열 (수정 전 35행) | 성곽 ·  | 성곽 ·  | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-sites.js | planHistoricalSites / 문자열 (수정 전 36행) | 기록 사이를 잇는 추정 배경 | 기록 사이를 잇는 추정 배경 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-sites.js | planHistoricalSites / 문자열 (수정 전 38행) | 기록 사이를 잇는 추정 배경입니다. 성의 실제 윤곽이나 건물 배치를 복원한 것은 아닙니다. | 기록 사이를 잇는 추정 배경이에요. 성의 실제 윤곽이나 건물 배치를 복원한 모습은 아니에요. | 기준서 §2 안내 말투 / E-7 | 기록 사이를 잇는 추정 배경입니다. 성의 실제 윤곽이나 건물 배치를 복원한 모습은 아닙니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/chronicle-sites.js | planContinuingCities / 문자열 (수정 전 73행) | 이름 없는 도시 생활 배경 | 이름 없는 도시 배경 | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/app/chronicle-sites.js | planContinuingCities / 문자열 (수정 전 75행) | 과거 도시 기록의 위치를 잇는 추정 배경 · 기록 종료 뒤 존속 | 과거 도시 기록의 위치를 잇는 추정 배경 · 기록 종료 뒤 존속 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-sites.js | planContinuingCities / 문자열 (수정 전 76행) | 이 위치의 도시 기록을 바탕으로 이름 없는 생활 배경을 이어서 보여줍니다. 이전 도시 명칭과 행정 지위, 사건과 인물의 기간을 연장한 것이 아닙니다. 현재 건물과 거리 배치는 복원도가 아닙니다.\n규모는 축소 표현 | 이 위치의 도시 기록을 보고 이름 없는 생활 배경을 이어 보여줘요. 이전 도시 이름과 행정 지위가 계속됐다는 뜻은 아니에요. 사건과 인물의 기간을 늘린 것도 아니에요. 건물과 거리 배치는 복원도가 아니에요.\n규모는 축소 표현 | 기준서 §1 짧고 자연스러운 표현 | 이 위치의 도시 기록을 보고 이름 없는 생활 배경을 이어 보여줍니다. 이전 도시 이름과 행정 지위가 계속됐다는 뜻은 아닙니다. 사건과 인물의 기간을 늘린 것도 아닙니다. 건물과 거리 배치는 복원도가 아닙니다.\n규모는 축소 표현 — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/chronicle-sites.js | planContinuingCities / 문자열 (수정 전 79행) | 기록 종료 뒤 존속 추정 | 기록 종료 뒤 존속 추정 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-sites.js | planContinuingCities / 문자열 (수정 전 81행) | 수집된 과거 도시 위치에 이어지는 이름 없는 추정 생활 배경 · 추정(기록 종료 뒤 존속) | 수집된 과거 도시 위치에 이어지는 이름 없는 추정 생활 배경 · 추정(기록 종료 뒤 존속) | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-territories.js | renderLegend / 문자열 (수정 전 90행) | 국가 영역 ·  | 국가 영역 ·  | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-territories.js | renderLegend / 문자열 (수정 전 90행) | 국가 영역 · 이 연도 자료 없음 | 국가 영역 · 이 연도 자료 없음 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-territories.js | renderLegend / 문자열 (수정 전 95행) |  적용 도형 |  적용 도형 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-territories.js | renderLegend / 문자열 (수정 전 97행) | 시기별 연구 지도와 행정구역 경계를 바탕으로 한 근사 영역입니다. 도형 적용 기간은 건국·멸망 연도와 다를 수 있습니다. | 시기별 연구 지도와 행정구역 경계를 참고해 그린 영역이에요. 표시 기간은 건국·멸망 연도와 다를 수 있어요. | 기준서 §2 안내 말투 / E-7 | 시기별 연구 지도와 행정구역 경계를 참고해 그린 영역입니다. 표시 기간은 건국·멸망 연도와 다를 수 있습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/chronicle-territories.js | renderLegend / 문자열 (수정 전 99행) | 국사편찬위원회 HGIS 1910~1945 행정구역 | 국사편찬위원회 HGIS 1910~1945 행정구역 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-territories.js | renderLegend / 문자열 (수정 전 104행) | 이 시기 영역은 일부 확장·정복 시점이 맞지 않는 참고도입니다. | 이 시기 영역은 참고용이에요. 일부 확장·정복 시점이 맞지 않아요. | 기준서 §2 안내 말투 / E-7 | 이 시기 영역은 참고용입니다. 일부 확장·정복 시점이 맞지 않습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/chronicle-territories.js | renderLegend / 문자열 (수정 전 105행) | 1911–1947년은 행정구역 경계(13도)를 합친 참고도이며, 1945–1947년은 38도선으로 나눈 미·소 군정 구역입니다. 실제 국경·통치 범위가 아닙니다. | 1911–1947년은 행정구역 경계 13도를 합친 참고도예요. 1945–1947년은 38도선으로 나눈 미·소 군정 구역이에요. 실제 국경·통치 범위와는 달라요. | 기준서 §2 안내 말투 / E-7; 기준서 §1 나열 축소 | 1911~1947년은 행정구역 경계 13도를 합친 참고도입니다. 1945~1947년은 38도선으로 나눈 미·소 군정 구역입니다. 실제 국경·통치 범위와는 다릅니다. — 문체 -ㅂ니다/-십시오 (Q3=b) · 연도 범위 물결표 |
| services/host/app/chronicle-territories.js | renderLegend / 문자열 (수정 전 106행) | 국가 영역 참고도이며, 한국전쟁의 전선은 아닙니다. | 국가 영역을 보여주는 참고도예요. 한국전쟁의 전선은 아니에요. | 기준서 §1 짧고 자연스러운 표현 | 국가 영역을 보여주는 참고도입니다. 한국전쟁의 전선은 아닙니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/chronicle-territories.js | renderLegend / 문자열 (수정 전 108행) |  멸망 이후의 고구려 도형은 제외했습니다. |  멸망 이후의 고구려 경계는 제외했어요. | 기준서 §2 안내 말투 / E-7 | 멸망 이후의 고구려 경계는 제외했습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/chronicle-territories.js | renderLegend / 문자열 (수정 전 109행) | 가야 시기까지 변한 이름을 이어 쓴 도형과 668년 뒤의 고구려 도형은 제외했습니다. 1260–1362년은 이 자료의 전체 공백입니다. | 가야 시기까지 변한 이름을 이어 쓴 경계와 668년 뒤의 고구려 경계는 제외했어요. 1260–1362년은 이 자료가 모두 비어 있어요. | 기준서 §2 안내 말투 / E-7 | 가야 시기까지 변한 이름을 이어 쓴 경계와 668년 뒤의 고구려 경계는 제외했습니다. 1260~1362년은 이 자료가 모두 비어 있습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) · 연도 범위 물결표 |
| services/host/app/chronicle-traditions.js | planTraditions / 문자열 (수정 전 6행) | 설화·전승의 무대 · 연도별 사건과 별도 | 설화·전승의 무대 · 연도별 사건과 별도 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-traditions.js | planTraditions / 문자열 (수정 전 10행) | 전승 속 등장인물 | 전승 속 등장인물 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle-traditions.js | planTraditions / 문자열 (수정 전 10행) | 전승 관련 인물 | 전승 관련 인물 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | module / 문자열 (수정 전 15행) | 한국민족문화대백과사전 | 한국민족문화대백과사전 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | module / 문자열 (수정 전 15행) | 한국민족문화대백과사전 | 한국민족문화대백과사전 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | module / 문자열 (수정 전 16행) | 삼국사기 | 삼국사기 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | module / 문자열 (수정 전 17행) | 고려사 | 고려사 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | module / 문자열 (수정 전 18행) | 조선왕조실록 | 조선왕조실록 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | module / 문자열 (수정 전 19행) | 국가유산·공공기록 | 국가유산·공공기록 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | module / 문자열 (수정 전 21행) | 항목 조사 출처 | 항목 조사 출처 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | yearLabel / 문자열 (수정 전 24행) | 기원전  | 기원전  | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | yearLabel / 문자열 (수정 전 24행) | 년 | 년 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | yearLabel / 문자열 (수정 전 24행) | 년 | 년 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | sceneContextLabel / 문자열 (수정 전 26행) | 동시대 인물  | 동시대 인물  | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | sceneContextLabel / 문자열 (수정 전 26행) |  · 주변 사건  | , 주변 사건  | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/app/chronicle.js | sceneContextLabel / 문자열 (수정 전 26행) |  · 추정 배경 마을  | , 추정 배경 마을  | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/app/chronicle.js | sceneContextLabel / 문자열 (수정 전 26행) | (사료 없음) | (자료 없음) | 기준서 §1 쉬운 용어 | (사료 없음) — '사료' 되살림 (Q9=a) |
| services/host/app/chronicle.js | module / 문자열 (수정 전 31행) | 생존 | 생존 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | module / 문자열 (수정 전 31행) | 재위 | 재위 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | module / 문자열 (수정 전 31행) | 활동 | 활동 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | module / 문자열 (수정 전 31행) | 등장 | 등장 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | activityLabel / 문자열 (수정 전 32행) | 전승 연대 | 전승 연대 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | activityLabel / 문자열 (수정 전 32행) | 전승 연대 | 전승 연대 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | module / 문자열 (수정 전 33행) | 건국 | 건국 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | module / 문자열 (수정 전 33행) | 설립 | 설립 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | module / 문자열 (수정 전 33행) | 선포 | 선포 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | module / 문자열 (수정 전 33행) | 즉위 | 즉위 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | module / 문자열 (수정 전 34행) | 참여 | 참여 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | module / 문자열 (수정 전 34행) | 참여 사건 | 참여 사건 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | module / 문자열 (수정 전 34행) | 장소 | 장소 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | module / 문자열 (수정 전 34행) | 장소 | 장소 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | module / 문자열 (수정 전 35행) | 전승의 무대 | 전승의 무대 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | module / 문자열 (수정 전 35행) | 전승 속 등장인물 | 전승 속 등장인물 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | module / 문자열 (수정 전 36행) | 나라 | 나라 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | module / 문자열 (수정 전 36행) | 소속 | 소속 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | module / 문자열 (수정 전 36행) | 소속 | 소속 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | module / 문자열 (수정 전 36행) | 부모 | 부모 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | module / 문자열 (수정 전 36행) | 부모 | 부모 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | module / 문자열 (수정 전 36행) | 자녀 | 자녀 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | module / 문자열 (수정 전 37행) | 건국자 | 건국자 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | module / 문자열 (수정 전 37행) | 이끈 인물 | 이끈 인물 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | module / 문자열 (수정 전 37행) | 설립자 | 설립자 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | module / 문자열 (수정 전 37행) | 같다고 보는 이름 | 같다고 보는 이름 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | module / 문자열 (수정 전 38행) | 관련 | 관련 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | module / 문자열 (수정 전 38행) | 수도 | 수도 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | module / 문자열 (수정 전 38행) | 스승 | 스승 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | module / 문자열 (수정 전 38행) | 제자 | 제자 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | module / 문자열 (수정 전 38행) | 동맹 | 동맹 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | module / 문자열 (수정 전 38행) | 적대 | 적대 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | contextAt / 문자열 (수정 전 102행) | 출생–사망 | 출생–사망 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 출생~사망 — 연도 범위 물결표 |
| services/host/app/chronicle.js | contextAt / 문자열 (수정 전 116행) | 사건 참여 | 사건 참여 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | constructor / label (수정 전 153행) | 연도 입력 | 연도 입력 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | constructor / input#historyYear / aria-label (수정 전 153행) | 탐색 연도 | 연도 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 연도 — 라벨은 짧게 (v2 §1, #198 감사 C-24) |
| services/host/app/chronicle.js | constructor / span (수정 전 153행) | 년 | 년 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | constructor / div / aria-label (수정 전 153행) | 1년씩 이동, 길게 누르면 빨라집니다 | 1년씩 이동해요. 길게 누르면 빨라져요 | 기준서 §1 짧고 자연스러운 표현 | 1년씩 이동합니다. 길게 누르면 빨라집니다 — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/chronicle.js | constructor / button / aria-label (수정 전 153행) | 이전 연도, 길게 누르면 빨라집니다 | 이전 해. 길게 누르면 빨라져요 | 기준서 §1 짧고 자연스러운 표현 | 이전 해. 길게 누르면 빨라집니다 — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/chronicle.js | constructor / button / title (수정 전 153행) | 1년 전 · 길게 누르면 빨라집니다 | 1년 전. 길게 누르면 빨라져요 | 기준서 §1 짧고 자연스러운 표현 | 1년 전. 길게 누르면 빨라집니다 — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/chronicle.js | constructor / button / aria-label (수정 전 153행) | 다음 연도, 길게 누르면 빨라집니다 | 다음 해. 길게 누르면 빨라져요 | 기준서 §1 짧고 자연스러운 표현 | 다음 해. 길게 누르면 빨라집니다 — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/chronicle.js | constructor / button / title (수정 전 153행) | 1년 후 · 길게 누르면 빨라집니다 | 1년 후. 길게 누르면 빨라져요 | 기준서 §1 짧고 자연스러운 표현 | 1년 후. 길게 누르면 빨라집니다 — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/chronicle.js | constructor / button (수정 전 153행) | 이동 | 이동하기 | 기준서 §2 버튼·안내 | 유지 |
| services/host/app/chronicle.js | constructor / small#yearInputHelp (수정 전 153행) | Enter로 이동 · 기원전은 −500처럼 입력 | 숫자를 적고 엔터를 누릅니다. 기원전은 −500처럼 적습니다 | 기준서 §2 버튼·안내; 기준서 §1 / B-2 우리말 표기 | 숫자를 적고 엔터를 누릅니다. 기원전은 −500처럼 적습니다 — 아틀라스에는 '이동하기' 버튼이 없는데 스크린리더가 그 버튼을 누르라고 읽었다 (#198 감사 C-24) |
| services/host/app/chronicle.js | constructor / button / aria-label (수정 전 153행) | 이전 사건 연도로 | 이전 사건으로 이동하기 | 기준서 §2 버튼·안내 | 유지 |
| services/host/app/chronicle.js | constructor / button (수정 전 153행) | ← 이전 사건 | ← 이전 사건 보기 | 기준서 §2 버튼·안내 | 유지 |
| services/host/app/chronicle.js | constructor / button / aria-label (수정 전 153행) | 시간 재생 | 시간 재생하기 | 기준서 §2 버튼·안내 | 유지 |
| services/host/app/chronicle.js | constructor / button (수정 전 153행) | ▶ 재생 | ▶ 재생하기 | 기준서 §2 버튼·안내 | 유지 |
| services/host/app/chronicle.js | constructor / button / aria-label (수정 전 153행) | 다음 사건 연도로 | 다음 사건으로 이동하기 | 기준서 §2 버튼·안내 | 유지 |
| services/host/app/chronicle.js | constructor / button (수정 전 153행) | 다음 사건 → | 다음 사건 보기 → | 기준서 §2 버튼·안내 | 유지 |
| services/host/app/chronicle.js | constructor / label (수정 전 153행) | 주변 사건 | 주변 사건 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | constructor / select / aria-label (수정 전 153행) | 사건 탐색 범위 | 사건 탐색 범위 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | constructor / option (수정 전 153행) | 20년 | 20년 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | constructor / option (수정 전 153행) | 50년 | 50년 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | constructor / option (수정 전 153행) | 100년 | 100년 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | constructor / span (수정 전 153행) | 기원전 2500 | 기원전 2500 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | constructor / input / aria-label (수정 전 153행) | 역사 시간 이동, 좌우로 밀면 1년부터 점점 빨라집니다 | 연도 이동. 좌우로 밀면 1년씩 움직이다 빨라져요 | 기준서 §1 짧고 자연스러운 표현 | 연도 이동. 원하는 연도로 끌어 놓습니다 — #196 연도 이동 개선으로 끌기 안내로 바뀜(2026-09-16 재대조) |
| services/host/app/chronicle.js | constructor / input / title (수정 전 153행) | 좌우로 밀면 1년부터 점점 빨라집니다 · 놓으면 멈춤 | 좌우로 밀면 1년씩 움직이다 빨라져요. 놓으면 멈춰요 | 기준서 §1 짧고 자연스러운 표현 | 끌어서 연도를 고릅니다. 방향키나 마우스 휠로는 1년씩 움직입니다 — #196 연도 이동 개선으로 끌기 안내로 바뀜(2026-09-16 재대조) |
| services/host/app/chronicle.js | stopPlay / 문자열 (수정 전 214행) | ▶ 재생 | ▶ 재생하기 | 기준서 §2 버튼·안내 | 유지 |
| services/host/app/chronicle.js | stopPlay / 문자열 (수정 전 214행) | 시간 재생 | 시간 재생하기 | 기준서 §2 버튼·안내 | 유지 |
| services/host/app/chronicle.js | togglePlay / 문자열 (수정 전 218행) | Ⅱ 멈춤 | Ⅱ 멈추기 | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/app/chronicle.js | togglePlay / 문자열 (수정 전 220행) | 시간 재생 멈춤 | 시간 재생 멈추기 | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/app/chronicle.js | showEntity / 화면 문구 (수정 전 259행) | 로 돌아가기 | (코드에 없음) | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | (코드에 없음) — #203 감사 1·5: 화면에 한 번도 나오지 않던 카드 분기를 지웠다(각주 ㄹ) |
| services/host/app/chronicle.js | showEntity / 문자열 (수정 전 260행) | 인물 | (코드에 없음) | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | (코드에 없음) — #203 감사 1·5: 화면에 한 번도 나오지 않던 카드 분기를 지웠다(각주 ㄹ) |
| services/host/app/chronicle.js | showEntity / 문자열 (수정 전 260행) | 사건 | (코드에 없음) | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | (코드에 없음) — #203 감사 1·5: 화면에 한 번도 나오지 않던 카드 분기를 지웠다(각주 ㄹ) |
| services/host/app/chronicle.js | showEntity / 문자열 (수정 전 260행) | 설화·전승 | (코드에 없음) | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | (코드에 없음) — #203 감사 1·5: 화면에 한 번도 나오지 않던 카드 분기를 지웠다(각주 ㄹ) |
| services/host/app/chronicle.js | showEntity / 문자열 (수정 전 260행) | 나라 | (코드에 없음) | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | (코드에 없음) — #203 감사 1·5: 화면에 한 번도 나오지 않던 카드 분기를 지웠다(각주 ㄹ) |
| services/host/app/chronicle.js | showEntity / 문자열 (수정 전 260행) | 장소 | (코드에 없음) | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | (코드에 없음) — #203 감사 1·5: 화면에 한 번도 나오지 않던 카드 분기를 지웠다(각주 ㄹ) |
| services/host/app/chronicle.js | showEntity / 문자열 (수정 전 260행) | 관련 항목 | (코드에 없음) | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | (코드에 없음) — #203 감사 1·5: 화면에 한 번도 나오지 않던 카드 분기를 지웠다(각주 ㄹ) |
| services/host/app/chronicle.js | showEntity / 문자열 (수정 전 261행) | 이야기의 무대 | (코드에 없음) | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | (코드에 없음) — #203 감사 1·5: 화면에 한 번도 나오지 않던 카드 분기를 지웠다(각주 ㄹ) |
| services/host/app/chronicle.js | showEntity / 문자열 (수정 전 261행) | 도시 생활 배경 · 추정 | (코드에 없음) | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | (코드에 없음) — #203 감사 1·5: 화면에 한 번도 나오지 않던 카드 분기를 지웠다(각주 ㄹ) |
| services/host/app/chronicle.js | showEntity / 문자열 (수정 전 261행) | 시설 · 추정 존속 | (코드에 없음) | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | (코드에 없음) — #203 감사 1·5: 화면에 한 번도 나오지 않던 카드 분기를 지웠다(각주 ㄹ) |
| services/host/app/chronicle.js | showEntity / 문자열 (수정 전 261행) | 성곽 배경 · 추정 | (코드에 없음) | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | (코드에 없음) — #203 감사 1·5: 화면에 한 번도 나오지 않던 카드 분기를 지웠다(각주 ㄹ) |
| services/host/app/chronicle.js | showEntity / 문자열 (수정 전 263행) | 이 시기에 기록된 활동입니다. | (코드에 없음) | 기준서 §2 안내 말투 / E-7 | (코드에 없음) — #203 감사 1·5: 화면에 한 번도 나오지 않던 카드 분기를 지웠다(각주 ㄹ) |
| services/host/app/chronicle.js | showEntity / dt (수정 전 264행) | 이야기 속 시기 | (코드에 없음) | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | (코드에 없음) — #203 감사 1·5: 화면에 한 번도 나오지 않던 카드 분기를 지웠다(각주 ㄹ) |
| services/host/app/chronicle.js | showEntity / dt (수정 전 264행) | 관련 문헌·기록 시기 | (코드에 없음) | 같은 값의 라벨 통일 | (코드에 없음) — #203 감사 1·5: 화면에 한 번도 나오지 않던 카드 분기를 지웠다(각주 ㄹ) |
| services/host/app/chronicle.js | showEntity / p (수정 전 264행) | 이야기와 기록 시기는 다릅니다. 이 표시가 선택한 연도의 실제 사건을 뜻하지는 않습니다. | (코드에 없음) | 기준서 §2 안내 말투 / E-7 | (코드에 없음) — #203 감사 1·5: 화면에 한 번도 나오지 않던 카드 분기를 지웠다(각주 ㄹ) |
| services/host/app/chronicle.js | showEntity / summary (수정 전 268행) | 활동·장소의 출처 | (코드에 없음) | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | (코드에 없음) — #203 감사 1·5: 화면에 한 번도 나오지 않던 카드 분기를 지웠다(각주 ㄹ) |
| services/host/app/chronicle.js | showEntity / 화면 문구 (수정 전 269행) | 개 | (코드에 없음) | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | (코드에 없음) — #203 감사 1·5: 화면에 한 번도 나오지 않던 카드 분기를 지웠다(각주 ㄹ) |
| services/host/app/chronicle.js | showEntity / 문자열 (수정 전 271행) | " target="_blank" rel="noopener"&gt;위치 자료 · | (코드에 없음) | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | (코드에 없음) — #203 감사 1·5: 화면에 한 번도 나오지 않던 카드 분기를 지웠다(각주 ㄹ) |
| services/host/app/chronicle.js | showEntity / 문자열 (수정 전 273행) | (관련) | (코드에 없음) | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | (코드에 없음) — #203 감사 1·5: 화면에 한 번도 나오지 않던 카드 분기를 지웠다(각주 ㄹ) |
| services/host/app/chronicle.js | showEntity / 화면 문구 (수정 전 275행) | · 건물·길·인물 외형은 상징 모형입니다. | (코드에 없음) | 기준서 §2 안내 말투 / E-7; 기준서 §1 나열 축소 | (코드에 없음) — #203 감사 1·5: 화면에 한 번도 나오지 않던 카드 분기를 지웠다(각주 ㄹ) |
| services/host/app/chronicle.js | showEntity / h3 (수정 전 277행) | 시간 | (코드에 없음) | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | (코드에 없음) — #203 감사 1·5: 화면에 한 번도 나오지 않던 카드 분기를 지웠다(각주 ㄹ) |
| services/host/app/chronicle.js | showEntity / 문자열 (수정 전 278행) | 출생 | (코드에 없음) | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | (코드에 없음) — #203 감사 1·5: 화면에 한 번도 나오지 않던 카드 분기를 지웠다(각주 ㄹ) |
| services/host/app/chronicle.js | showEntity / 문자열 (수정 전 278행) | 사망 | (코드에 없음) | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | (코드에 없음) — #203 감사 1·5: 화면에 한 번도 나오지 않던 카드 분기를 지웠다(각주 ㄹ) |
| services/host/app/chronicle.js | showEntity / 문자열 (수정 전 278행) | 사건 | (코드에 없음) | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | (코드에 없음) — #203 감사 1·5: 화면에 한 번도 나오지 않던 카드 분기를 지웠다(각주 ㄹ) |
| services/host/app/chronicle.js | showEntity / 문자열 (수정 전 278행) | 건국 | (코드에 없음) | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | (코드에 없음) — #203 감사 1·5: 화면에 한 번도 나오지 않던 카드 분기를 지웠다(각주 ㄹ) |
| services/host/app/chronicle.js | showEntity / 문자열 (수정 전 278행) | 기록 | (코드에 없음) | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | (코드에 없음) — #203 감사 1·5: 화면에 한 번도 나오지 않던 카드 분기를 지웠다(각주 ㄹ) |
| services/host/app/chronicle.js | showEntity / p (수정 전 279행) | 날짜 출처가 아직 연결되지 않았습니다. | (코드에 없음) | 기준서 §2 안내 말투 / E-7 | (코드에 없음) — #203 감사 1·5: 화면에 한 번도 나오지 않던 카드 분기를 지웠다(각주 ㄹ) |
| services/host/app/chronicle.js | showEntity / h3 (수정 전 279행) | 관련 인물·사건·장소 | (코드에 없음) | 기준서 §1 나열 축소 | (코드에 없음) — #203 감사 1·5: 화면에 한 번도 나오지 않던 카드 분기를 지웠다(각주 ㄹ) |
| services/host/app/chronicle.js | showEntity / p (수정 전 279행) | 이 항목의 전체 기록입니다. 관계가 있었던 시기는 각 출처에서 확인할 수 있습니다. | (코드에 없음) | 기준서 §2 안내 말투 / E-7; 기준서 §2 버튼·안내 | (코드에 없음) — #203 감사 1·5: 화면에 한 번도 나오지 않던 카드 분기를 지웠다(각주 ㄹ) |
| services/host/app/chronicle.js | showEntity / 문자열 (수정 전 281행) | 관련 기록 | (코드에 없음) | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | (코드에 없음) — #203 감사 1·5: 화면에 한 번도 나오지 않던 카드 분기를 지웠다(각주 ㄹ) |
| services/host/app/chronicle.js | showEntity / 화면 문구 (수정 전 281행) | "&gt;출처 ↗ | (코드에 없음) | 기준서 §2 버튼·안내 | (코드에 없음) — #203 감사 1·5: 화면에 한 번도 나오지 않던 카드 분기를 지웠다(각주 ㄹ) |
| services/host/app/chronicle.js | showEntity / p (수정 전 281행) | 연결 출처가 아직 없습니다. | (코드에 없음) | 기준서 §2 안내 말투 / E-7 | (코드에 없음) — #203 감사 1·5: 화면에 한 번도 나오지 않던 카드 분기를 지웠다(각주 ㄹ) |
| services/host/app/chronicle.js | render / 문자열 (수정 전 288행) | 연도 입력 | 연도 입력 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | render / 문자열 (수정 전 292행) | 이 시대의 인물과 사건을 불러오는 중… | 이 시대의 인물과 사건을 불러오고 있어요… | 기준서 §2 안내 말투 / E-7 | 이 시대의 인물과 사건을 불러오고 있습니다… — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/chronicle.js | render / 문자열 (수정 전 293행) | 인물  | 인물  | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | render / 문자열 (수정 전 293행) |  · 주변 사건  | , 주변 사건  | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/app/chronicle.js | render / div (수정 전 294행) | 시간 속으로 | 시간 속으로 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | render / section / aria-label (수정 전 296행) | 이때의 나라와 세력 | 이때의 나라와 세력 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 이때의 나라와 집단 — '세력'→'집단' |
| services/host/app/chronicle.js | render / 문자열 (수정 전 296행) |  재위 |  재위 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | render / h3 (수정 전 297행) | 이 해의 사건 | 이 해의 사건 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | render / summary (수정 전 298행) | 이때의 도시·시설 | 이때의 도시·시설 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | render / 화면 문구 (수정 전 298행) | 곳 | 곳 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | render / summary (수정 전 298행) | 동시대 인물 | 동시대 인물 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | render / 화면 문구 (수정 전 299행) | 명 · 생존·재위·활동 | 명 (생존, 재위, 활동) | 기준서 §1 나열 축소 | 유지 |
| services/host/app/chronicle.js | render / h3 (수정 전 299행) | 이때의 사람들 | 이때의 사람들 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | render / p (수정 전 300행) | 선택한 사료에 이 해의 생존·활동 출처가 연결된 인물이 없습니다. | 고른 자료에는 이 해의 생존·활동 출처가 연결된 인물이 없어요. | 기준서 §1 쉬운 용어; 기준서 §2 안내 말투 / E-7 | 고른 사료에는 이 해의 생존·활동 출처가 연결된 인물이 없습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) · '사료' 되살림 (Q9=a) |
| services/host/app/chronicle.js | render / h3 (수정 전 300행) | 이 시기의 사건 | 이 시기의 사건 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/chronicle.js | render / p (수정 전 305행) | 이 범위에 연결된 사건이 없습니다. 이전·다음 사건으로 이동할 수 있습니다. | 이 기간에 연결된 사건이 없어요. 이전·다음 사건으로 이동해 보세요. | 기준서 §2 안내 말투 / E-7; 기준서 §2 버튼·안내 | 이 기간에 연결된 사건이 없습니다. 이전·다음 사건으로 이동해 보십시오. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/chronicle.js | render / p (수정 전 305행) | 선택한 사료에 출처가 연결된 항목입니다. 출생–사망 연도와 재위·활동 기간을 구별합니다. | 고른 자료에 출처가 연결된 항목이에요. 출생–사망 연도와 재위·활동 기간은 따로 표시해요. | 기준서 §1 쉬운 용어; 기준서 §2 안내 말투 / E-7 | 고른 사료에 출처가 연결된 항목입니다. 출생~사망 연도와 재위·활동 기간은 따로 표시합니다. — 문체 -ㅂ니다/-십시오 (Q3=b) · '사료' 되살림 (Q9=a) · 연도 범위 물결표 |
| services/host/app/chronicle.js | render / 문자열 (수정 전 306행) |  조회 한도에 도달해 일부만 표시합니다. |  한 번에 불러올 양을 넘어 일부만 보여줘요. | 기준서 §1 짧고 자연스러운 표현 | 한 번에 불러올 양을 넘어 일부만 보여줍니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/chronicle.js | personCard / 문자열 (수정 전 310행) | 출생–사망 | 출생–사망 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 출생~사망 — 연도 범위 물결표 |
| services/host/app/chronicle.js | personCard / 문자열 (수정 전 316행) |  ·  | ,  | 기준서 §1 동적 목록의 3개 이상 가운뎃점 나열 방지 | 유지 |
| services/host/app/compare.js | constructor / label (수정 전 7행) | 사건 | 사건 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/compare.js | constructor / select / aria-label (수정 전 7행) | 비교 사건 | 비교 사건 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/compare.js | constructor / button (수정 전 7행) | 이 사례의 사료 켜기 | 이 사례의 자료 켜기 | 기준서 §1 쉬운 용어 | 이 사례의 사료 켜기 — '사료' 되살림 (Q9=a) |
| services/host/app/compare.js | constructor / button (수정 전 7행) | 연도 차이 자동 찾기 | 연도 차이 자동 찾기 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/compare.js | constructor / button (수정 전 7행) | 이전 | 이전 보기 | 기준서 §2 버튼·안내 | 유지 |
| services/host/app/compare.js | constructor / button (수정 전 7행) | 다음 | 다음 보기 | 기준서 §2 버튼·안내 | 유지 |
| services/host/app/compare.js | constructor / 문자열 (수정 전 8행) | 비교 목록 조회 실패 | 비교 목록을 불러오지 못했어요. | 기준서 §1 짧고 자연스러운 표현 | 비교 목록을 불러오지 못했습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/compare.js | show / 문자열 (수정 전 28행) | 사료별 주장을 불러오는 중… | 자료별 기록을 불러오고 있어요… | 기준서 §1 쉬운 용어; 기준서 §2 안내 말투 / E-7 | 사료별 기록을 불러오고 있습니다… — 문체 -ㅂ니다/-십시오 (Q3=b) · '사료' 되살림 (Q9=a) |
| services/host/app/compare.js | show / 문자열 (수정 전 32행) | 수록한 비교 사례가 없다. | 비교할 사례가 없어요. | 기준서 §2 안내 말투 / E-7 | 비교할 사례가 없습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/compare.js | show / 문자열 (수정 전 36행) | 비교 조회 실패 | 비교 결과를 불러오지 못했어요. | 기준서 §1 짧고 자연스러운 표현 | 비교 결과를 불러오지 못했습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/compare.js | findDifferences / 문자열 (수정 전 48행) | 현재 켠 사료의 같은 사건 연결과 연도 근거를 비교한다. 연도를 환산하지 못한 기록은 이 목록에 나오지 않는다. | 고른 자료에서 같은 사건의 연결과 연도 근거를 비교해요. 연도를 서기로 바꾸지 못한 기록은 이 목록에 나오지 않아요. | 기준서 §1 쉬운 용어; 기준서 §2 안내 말투 / E-7 | 고른 사료에서 같은 사건의 연결과 연도 근거를 비교합니다. 연도를 서기로 바꾸지 못한 기록은 이 목록에 나오지 않습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) · '사료' 되살림 (Q9=a) |
| services/host/app/compare.js | findDifferences / 문자열 (수정 전 49행) | 그래프에서 연도 차이를 찾는 중… | 연결된 기록에서 연도 차이를 찾고 있어요… | 기준서 §2 안내 말투 / E-7 | 연결된 기록에서 연도 차이를 찾고 있습니다… — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/compare.js | findDifferences / 문자열 (수정 전 54행) | 연도 차이 조회 실패 | 연도 차이를 불러오지 못했어요. | 기준서 §1 짧고 자연스러운 표현 | 연도 차이를 불러오지 못했습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/compare.js | findDifferences / 문자열 (수정 전 55행) | 연도 차이가 있는 수록 사건  | 연도 차이가 있는 수록 사건  | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/compare.js | findDifferences / 문자열 (수정 전 55행) | 현재 선택에서 연도 차이를 확인할 수 있는 사건 연결이 없다. | 고른 자료에 연도 차이를 확인할 사건 연결이 없어요. | 기준서 §2 안내 말투 / E-7 | 고른 사료에 연도 차이를 확인할 사건 연결이 없습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) · '사료' 되살림 (Q9=a) |
| services/host/app/compare.js | render / 문자열 (수정 전 70행) | 개 사료 ·  | 개 자료,  | 기준서 §1 쉬운 용어 | 개 사료, — '사료' 되살림 (Q9=a) |
| services/host/app/compare.js | render / 문자열 (수정 전 70행) | 개 서술 ·  | 개 기록:  | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/app/compare.js | render / 문자열 (수정 전 70행) | 원표기 다름 | 원래 날짜 다름 | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/app/compare.js | render / 문자열 (수정 전 70행) | 같은 원표기 | 원래 날짜 같음 | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/app/compare.js | render / 문자열 (수정 전 70행) |  · 환산 연도 다름 | , 서기로 바꾼 연도 다름 | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/app/compare.js | render / 문자열 (수정 전 70행) | 현재 선택에 맞는 서술이 없다. 이 사례의 사료를 켤 수 있다. | 고른 자료에 맞는 기록이 없어요. 이 사례의 자료를 켜 보세요. | 기준서 §1 쉬운 용어; 기준서 §2 안내 말투 / E-7; 기준서 §2 버튼·안내 | 고른 사료에 맞는 기록이 없습니다. 이 사례의 사료를 켜 보십시오. — 문체 -ㅂ니다/-십시오 (Q3=b) · '사료' 되살림 (Q9=a) |
| services/host/app/compare.js | render / summary (수정 전 75행) | 해석과 한계 | 해석과 한계 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/compare.js | render / p (수정 전 75행) | 판본: | 판본: | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/compare.js | render / 문자열 (수정 전 76행) | 별도 판본 표기 없음 | 판본 미확인 | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/app/compare.js | render / 문자열 (수정 전 76행) | 편찬자 미상 | 엮은이 미확인 | 기준서 §2 안내 말투 / E-7 | 유지 |
| services/host/app/compare.js | render / 문자열 (수정 전 76행) | 편찬년 미상 | 편찬 연도 미확인 | 기준서 §2 안내 말투 / E-7 | 유지 |
| services/host/app/compare.js | render / 문자열 (수정 전 77행) | AI 추출 | AI 추출 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/compare.js | render / 문자열 (수정 전 77행) | 사람 기록 | 사람 기록 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/compare.js | render / 문자열 (수정 전 77행) |  · 환산  |  · 서기로 바꾼 날짜:  | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/app/compare.js | render / 문자열 (수정 전 77행) | 아래 출처별 표시 | 아래에서 출처별로 보기 | 기준서 §2 버튼·안내 | 유지 |
| services/host/app/compare.js | render / 문자열 (수정 전 77행) | 근거 미수록 | 근거 없음 | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/app/compare.js | render / button (수정 전 77행) | 주장 근거 | 기록 출처 보기 | 기준서 §1 쉬운 용어; 기준서 §2 버튼·안내 | 유지 |
| services/host/app/compare.js | render / button (수정 전 77행) | 원문 | 원문 보기 | 기준서 §2 버튼·안내 | 유지 |
| services/host/app/compare.js | render / button (수정 전 77행) | 사료 카드 | 자료 설명 보기 | 기준서 §1 쉬운 용어; 기준서 §2 버튼·안내 | 사료 설명 보기 — '사료' 되살림 (Q9=a) |
| services/host/app/compare.js | year / 문자열 (수정 전 84행) | 미상 | 미확인 | 기준서 §2 안내 말투 / E-7 | 유지 |
| services/host/app/compare.js | year / 문자열 (수정 전 84행) | 기원전  | 기원전  | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/compare.js | year / 문자열 (수정 전 84행) | 년 | 년 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/compare.js | year / 문자열 (수정 전 84행) | 서기  | 서기  | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/compare.js | year / 문자열 (수정 전 84행) | 년 | 년 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/compare.js | render / 문자열 (수정 전 86행) |  · 연도 근거 |  · 연도 출처 보기 | 기준서 §2 버튼·안내 | 유지 |
| services/host/app/compare.js | render / 문자열 (수정 전 91행) | 같은 사건으로 연결한 근거 | 사건 연결 근거 | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/app/compare.js | render / 문자열 (수정 전 92행) | 현재 사료·작성자 선택에서 사건 연결 근거가 없다. | 고른 자료와 작성자에 맞는 사건 연결 근거가 없어요. | 기준서 §1 쉬운 용어; 기준서 §2 안내 말투 / E-7 | 고른 사료와 작성자에 맞는 사건 연결 근거가 없습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) · '사료' 되살림 (Q9=a) |
| services/host/app/compare.js | render / 문자열 (수정 전 95행) | AI 연결 | AI 연결 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/compare.js | render / 문자열 (수정 전 95행) | 사람 연결 | 사람 연결 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/compare.js | render / summary (수정 전 95행) | 연결 근거와 한계 | 연결 근거와 한계 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/compare.js | render / button (수정 전 95행) | 연결 주장과 원문 | 연결 기록과 원문 보기 | 기준서 §1 쉬운 용어; 기준서 §2 버튼·안내 | 유지 |
| services/host/app/event-timeline.js | constructor / strong (수정 전 28행) | 주요 사건 | 주요 사건 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/event-timeline.js | constructor / span (수정 전 28행) | 좌우로 끌어 탐색 | 좌우로 끌어 보세요 | 기준서 §2 버튼·안내 | 좌우로 끌어 보십시오 — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/event-timeline.js | constructor / button / aria-label (수정 전 28행) | 이전 주요 사건 | 이전 주요 사건 보기 | 기준서 §2 버튼·안내 | 유지 |
| services/host/app/event-timeline.js | constructor / button / aria-label (수정 전 28행) | 다음 주요 사건 | 다음 주요 사건 보기 | 기준서 §2 버튼·안내 | 유지 |
| services/host/app/event-timeline.js | constructor / div / aria-label (수정 전 28행) | 연도순 주요 사건 | 연도순 주요 사건 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/event-timeline.js | constructor / p (수정 전 28행) | 선택한 사료에 연결된 사건이 없습니다. | 고른 자료에 연결된 사건이 없어요. | 기준서 §1 쉬운 용어; 기준서 §2 안내 말투 / E-7 | 고른 사료에 연결된 사건이 없습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) · '사료' 되살림 (Q9=a) |
| services/host/app/event-timeline.js | setEvents / 문자열 (수정 전 51행) | 개 사건 | 개 사건 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/facility-persistence.js | planContinuingFacilities / 문자열 (수정 전 84행) | 전승 | 전승 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/facility-persistence.js | planContinuingFacilities / 문자열 (수정 전 115행) | 기록된 존속(근거  | 기록된 존속(근거  | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/facility-persistence.js | planContinuingFacilities / 문자열 (수정 전 115행) | 건) | 건) | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/facility-persistence.js | planContinuingFacilities / 문자열 (수정 전 115행) | 추정 존속 | 추정 존속 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/facility-persistence.js | planContinuingFacilities / 문자열 (수정 전 119행) |  · 시설 ·  |  시설 ·  | 기준서 §1 나열 축소 | 유지 |
| services/host/app/facility-persistence.js | planContinuingFacilities / 문자열 (수정 전 119행) |  · 시설(추정 존속) |  · 시설(추정 존속) | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/facility-persistence.js | planContinuingFacilities / 문자열 (수정 전 119행) | 건립 기록 뒤 존속 추정 | 건립 기록 뒤 존속 추정 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/facility-persistence.js | planContinuingFacilities / 문자열 (수정 전 120행) | 건립 기록을 근거로 시설이 남아 있다고 추정한 배경이며 이후 변형·훼손 기록은 반영하지 않았다. | 건립 기록을 보고 시설이 남아 있다고 추정한 배경이에요. 이후 모습이 바뀌거나 훼손된 기록은 반영하지 않았어요. | 기준서 §1 짧고 자연스러운 표현 | 건립 기록을 보고 시설이 남아 있다고 추정한 배경입니다. 이후 모습이 바뀌거나 훼손된 기록은 반영하지 않았습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/facility-persistence.js | planContinuingFacilities / 문자열 (수정 전 123행) | 건립 기록과 시설 유형에 따른 존속 추정 | 건립 기록과 시설 유형에 따른 존속 추정 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/facility-persistence.js | planContinuingFacilities / 문자열 (수정 전 125행) | 시설 ·  | 시설 ·  | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/graph.js | constructor / button (수정 전 12행) | 이전 | 이전 보기 | 기준서 §2 버튼·안내 | 유지 |
| services/host/app/graph.js | constructor / button (수정 전 12행) | 다음 | 다음 보기 | 기준서 §2 버튼·안내 | 유지 |
| services/host/app/graph.js | show / 문자열 (수정 전 29행) | 근거 관계를 불러오는 중… | 출처 연결을 불러오고 있어요… | 기준서 §2 안내 말투 / E-7 | 출처 연결을 불러오고 있습니다… — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/graph.js | show / 문자열 (수정 전 38행) | 그래프 조회 실패 | 출처 연결을 불러오지 못했어요. | 기준서 §1 짧고 자연스러운 표현 | 출처 연결을 불러오지 못했습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/graph.js | show / 문자열 (수정 전 41행) | 관련 주장  | 관련 기록  | 기준서 §1 쉬운 용어 | 유지 |
| services/host/app/graph.js | show / 문자열 (수정 전 41행) |  · 좌표  | , 위치  | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/app/graph.js | show / 문자열 (수정 전 41행) |  · 전체 시기 |  (전체 시기) | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/app/graph.js | show / 문자열 (수정 전 45행) | 현재 사료·작성자 선택에 맞는 연결이 없다. | 고른 자료와 작성자에 맞는 연결이 없어요. | 기준서 §1 쉬운 용어; 기준서 §2 안내 말투 / E-7 | 고른 사료와 작성자에 맞는 연결이 없습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) · '사료' 되살림 (Q9=a) |
| services/host/app/graph.js | show / p (수정 전 46행) | 사료 선택을 바꾸거나 다른 항목을 찾아볼 수 있다. 기록이 없다는 것이 없었던 일이라는 뜻은 아니다. | 자료 선택을 바꾸거나 다른 항목을 찾아보세요. 기록이 없다고 없었던 일은 아니에요. | 기준서 §1 쉬운 용어; 기준서 §2 안내 말투 / E-7; 기준서 §2 버튼·안내 | 사료 선택을 바꾸거나 다른 항목을 찾아보십시오. 기록이 없다고 없었던 일은 아닙니다. — 문체 -ㅂ니다/-십시오 (Q3=b) · '사료' 되살림 (Q9=a) |
| services/host/app/graph.js | show / p (수정 전 53행) | 항목을 다시 선택하면 조회를 다시 시도한다. | 항목을 다시 고르면 한 번 더 불러와요. | 기준서 §2 안내 말투 / E-7 | 항목을 다시 고르면 한 번 더 불러옵니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/graph.js | draw / 문자열 (수정 전 74행) | 사람 | 사람 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/graph.js | draw / 문자열 (수정 전 74행) | AI 추출 | AI 추출 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/graph.js | draw / 문자열 (수정 전 74행) | 좌표 근거 연결 | 위치 출처 연결 | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/app/graph.js | draw / 문자열 (수정 전 74행) | 조사 후보 · 미확정 | 위치 후보 · 확인 전 | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/app/graph.js | draw / 문자열 (수정 전 79행) | 인물·장소·대상 | 관련 항목 | 기준서 §1 나열 축소 | 유지 |
| services/host/app/graph.js | draw / 문자열 (수정 전 79행) | 주장 | 기록 | 기준서 §1 쉬운 용어 | 유지 |
| services/host/app/graph.js | draw / 문자열 (수정 전 79행) | 인용한 원문 | 인용한 원문 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/graph.js | draw / 문자열 (수정 전 79행) | 사료 | 자료 | 기준서 §1 쉬운 용어 | 사료 — '사료' 되살림 (Q9=a) |
| services/host/app/graph.js | draw / 문자열 (수정 전 80행) | " aria-label="항목에서 주장, 원문, 사료로 이어지는 근거 그래프"&gt; | " aria-label="항목에서 기록, 원문, 자료로 이어지는 출처 연결"&gt; | 기준서 §1 쉬운 용어 | " aria-label="항목에서 기록, 원문, 사료로 이어지는 출처 연결"> — '사료' 되살림 (Q9=a) |
| services/host/app/historical-regions.js | describeSettlements / 문자열 (수정 전 66행) |  · 조선 수도 |  · 조선 수도 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/historical-regions.js | describeSettlements / 문자열 (수정 전 66행) |  · 기록 사이 도시 배경 |  · 기록 사이 도시 배경 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/historical-regions.js | describeSettlements / 문자열 (수정 전 67행) | 의 수도 역할을  | 의 수도 역할을  | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/historical-regions.js | describeSettlements / 문자열 (수정 전 67행) | 년 구간으로 표시합니다. 도시의 전체 존속 기간을 뜻하지 않으며, 건물 배치는 익명 생활을 보여주는 추정 배경입니다. | 년 구간으로 보여줘요. 도시가 존재한 전체 기간은 아니에요. 건물 배치는 이름 없는 생활 모습을 보여주는 추정 배경이에요. | 기준서 §2 안내 말투 / E-7 | 년 구간으로 보여줍니다. 도시가 존재한 전체 기간은 아닙니다. 건물 배치는 이름 없는 생활 모습을 보여주는 추정 배경입니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/historical-regions.js | describeSettlements / 문자열 (수정 전 67행) | 1399년 개경 천도와 1405년 한양 천도 사이에는 수도로 표시하지 않습니다. 도시는 기록 사이를 잇는 추정 생활 배경으로 남깁니다. | 1399년 개경 천도와 1405년 한양 천도 사이에는 수도로 표시하지 않아요. 도시는 기록 사이를 잇는 추정 생활 배경으로 남겨요. | 기준서 §2 안내 말투 / E-7 | 1399년 개경 천도와 1405년 한양 천도 사이에는 수도로 표시하지 않습니다. 도시는 기록 사이를 잇는 추정 생활 배경으로 남깁니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/historical-regions.js | describeSettlements / 문자열 (수정 전 69행) | 기록상 관련 국가 또는 인물 | 기록상 관련 국가 또는 인물 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/history-map.js | refresh / 문자열 (수정 전 15행) | 역로·옛길 | 역로·옛길 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/history-map.js | refresh / 문자열 (수정 전 15행) | 사건 장소 | 사건 장소 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/history-map.js | refresh / 문자열 (수정 전 15행) | 역사 경계 | 역사 경계 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/history-map.js | refresh / 문자열 (수정 전 16행) |  조회 중… |  불러오고 있어요… | 기준서 §2 안내 말투 / E-7 | 불러오고 있습니다… — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/history-map.js | refresh / 문자열 (수정 전 19행) |  조회 실패 |  자료를 불러오지 못했어요. | 기준서 §1 짧고 자연스러운 표현 | 자료를 불러오지 못했습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/history-map.js | refresh / 문자열 (수정 전 21행) | 개 · 근거 | 개 · 출처 보기 | 기준서 §2 버튼·안내 | 유지 |
| services/host/app/people.js | constructor / summary (수정 전 7행) | 기간·나라로 인물 찾기 | 기간·나라로 인물 찾기 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/people.js | constructor / label (수정 전 7행) | 나라 | 나라 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/people.js | constructor / select / aria-label (수정 전 7행) | 인물의 나라 | 인물의 나라 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/people.js | constructor / label (수정 전 7행) | 시작 연도 | 시작 연도 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/people.js | constructor / label (수정 전 7행) | 끝 연도 | 끝 연도 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/people.js | constructor / button (수정 전 7행) | 조건 검색 | 인물 찾기 | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/app/people.js | constructor / p (수정 전 7행) | 현재 켠 사료 안에서 소속과 활동 기간이 함께 기록된 인물. 재위 기간은 출생–사망 연도 전체와 다르다. | 고른 자료에 소속과 활동 기간이 함께 기록된 인물이에요. 재위 기간은 출생–사망 기간과 달라요. | 기준서 §1 쉬운 용어 | 고른 사료에 소속과 활동 기간이 함께 기록된 인물입니다. 재위 기간은 출생~사망 기간과 다릅니다. — 문체 -ㅂ니다/-십시오 (Q3=b) · '사료' 되살림 (Q9=a) · 연도 범위 물결표 |
| services/host/app/people.js | constructor / button (수정 전 7행) | 더 보기 | 더 보기 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/people.js | search / 문자열 (수정 전 36행) | 조건에 맞는 출처를 찾는 중… | 조건에 맞는 출처를 찾고 있어요… | 기준서 §2 안내 말투 / E-7 | 조건에 맞는 출처를 찾고 있습니다… — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/people.js | search / 문자열 (수정 전 40행) | 인물 조회 실패 | 인물을 불러오지 못했어요. | 기준서 §1 짧고 자연스러운 표현 | 인물을 불러오지 못했습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/people.js | search / 문자열 (수정 전 42행) | 수록 인물  | 수록 인물  | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/people.js | search / 문자열 (수정 전 42행) |  · 다음 결과 있음 |  · 다음 결과 있음 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/people.js | search / 문자열 (수정 전 42행) | 현재 조건에 맞는 수록 주장이 없다. | 고른 조건에 맞는 기록이 없어요. | 기준서 §1 쉬운 용어; 기준서 §2 안내 말투 / E-7 | 고른 조건에 맞는 기록이 없습니다. — 문체 -ㅂ니다/-십시오 (Q3=b) |
| services/host/app/people.js | search / 문자열 (수정 전 44행) | 자동 연결 | 자동 연결 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/people.js | search / 문자열 (수정 전 44행) | 사람 작성 | 사람 작성 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/people.js | search / 문자열 (수정 전 46행) |  · 출처 일부 표시 |  · 출처 일부 표시 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/quality-gate.js | mountQualityChoice / 문자열 (수정 전 10행) | 낮음 | 낮음 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/quality-gate.js | mountQualityChoice / 문자열 (수정 전 10행) | 보통 | 보통 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/quality-gate.js | mountQualityChoice / 문자열 (수정 전 10행) | 높음 | 높음 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/quality-gate.js | mountQualityChoice / 문자열 (수정 전 15행) | 이 기기 추천:  | 이 기기 추천:  | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/quality-gate.js | mountQualityChoice / 문자열 (수정 전 15행) | 검증용 화질(q= | 주소에서 고른 화질:  | 기준서 §1 쉬운 용어; 기준서 §1 / B-2 우리말 표기 | 유지 |
| services/host/app/quality-gate.js | mountQualityChoice / 문자열 (수정 전 15행) | )이 적용됩니다 |  | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/app/territory-labels.js | constructor / 문자열 (수정 전 6행) | 국가 영역 이름 | 국가 영역 이름 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/timeline.js | fmtYear / 문자열 (수정 전 121행) | 기원전  | 기원전  | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/timeline.js | fmtYearFull / 문자열 (수정 전 125행) | 기원전  | 기원전  | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/timeline.js | fmtYearFull / 문자열 (수정 전 125행) | 서기  | 서기  | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/timeline.js | titleOf / 문자열 (수정 전 164행) | 다루는 기간  | 다루는 기간  | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/timeline.js | titleOf / 문자열 (수정 전 166행) | 에 쓰임 | 에 쓰임 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/timeline.js | titleOf / 문자열 (수정 전 167행) | 원문 조각  | 원문 대목  | 기준서 §1 짧고 자연스러운 표현 | 유지 |
| services/host/app/timeline.js | titleOf / 문자열 (수정 전 168행) | 주 렌즈 | 기준 자료 | 기준서 §1 쉬운 용어 | 기준 사료 — '사료' 되살림 (Q9=a) |
| services/host/app/timeline.js | titleOf / 문자열 (수정 전 169행) |  ·  | ,  | 기준서 §1 동적 목록의 3개 이상 가운뎃점 나열 방지 | 유지 |
| services/host/app/timeline.js | constructor / 문자열 (수정 전 190행) | 사료 타임라인 | 자료 타임라인 | 기준서 §1 쉬운 용어 | 사료 타임라인 — '사료' 되살림 (Q9=a) |
| services/host/app/timeline.js | render / 문자열 (수정 전 339행) | 사료 없음 | 자료 없음 | 기준서 §1 쉬운 용어 | 사료 없음 — '사료' 되살림 (Q9=a) |
| services/host/app/timeline.js | render / 문자열 (수정 전 346행) | 현재 연도 | 현재 연도 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/timeline.js | _group / 문자열 (수정 전 376행) | 개 | 개 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/timeline.js | _group / 문자열 (수정 전 380행) | 개 사료 펼치기/접기 | 개 자료 펼치기/접기 | 기준서 §1 쉬운 용어 | 개 사료 펼치기/접기 — '사료' 되살림 (Q9=a) |
| services/host/app/timeline.js | _group / 문자열 (수정 전 391행) |  전체 선택 |  전체 선택 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/timeline.js | _group / 문자열 (수정 전 411행) | 다루는 기간 전체  | 다루는 기간 전체  | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/timeline.js | _group / 문자열 (수정 전 411행) |  · 개별 판본은 펼쳐서 보기 |  · 개별 판본은 펼쳐서 보기 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/timeline.js | _group / 문자열 (수정 전 414행) | 기간 미상 | 기간 미확인 | 기준서 §2 안내 말투 / E-7 | 유지 |
| services/host/app/timeline.js | _track / 문자열 (수정 전 484행) |  · 다루는 기간  |  · 다루는 기간  | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/timeline.js | _track / 문자열 (수정 전 501행) |  기사  |  기사  | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/timeline.js | _track / 문자열 (수정 전 501행) | 건 | 건 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/timeline.js | _track / 문자열 (수정 전 517행) | 년  | 년  | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/timeline.js | _track / 문자열 (수정 전 517행) | 뒤 | 뒤 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/timeline.js | _track / 문자열 (수정 전 517행) | 앞 | 앞 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/timeline.js | _track / 문자열 (수정 전 521행) | 에 쓰임 | 에 쓰임 | 유지 — 기준서 §2·§4, 이름·수치·역할·짧은 문구 보존 | 유지 |
| services/host/app/timeline.js | _track / 문자열 (수정 전 525행) | 기간 미상 | 기간 미확인 | 기준서 §2 안내 말투 / E-7 | 유지 |
| services/host/app/timeline.js | _track / 문자열 (수정 전 535행) | 시작 미상 | 시작 미확인 | 기준서 §2 안내 말투 / E-7 | 유지 |
| services/host/app/timeline.js | _track / 문자열 (수정 전 535행) | 끝 미상 | 끝 미확인 | 기준서 §2 안내 말투 / E-7 | 유지 |
| scripts/ai_images/finalize_image.py | LABEL / 문자열 (수정 전 14행) | AI 생성 상상도 | AI 상상도 | 기준서 §3 배지 통일 | 유지 |
| scripts/ai_images/finalize_image.py | NOTICE / 문자열 (수정 전 15행) | 실제 사료·유물 사진이 아니라 AI 가 만든 상상도입니다. | 실제 사료·유물 사진이 아니라 AI 가 만든 상상도입니다. | 유지 — 작업 지시의 NOTICE 보존 | 유지 — 상수는 `index.json` 호환으로 남아 있고 이 문자열을 화면에 띄우는 경로는 없다 (Q5=a, 각주 ㄷ) |

## 제외 범위와 확인 경로

- `artbible.js`, `assetblueprint.js`, `landmarks.js`, `materials.js`, `style.js`: 조형·재질 설명과 주석. 화면 글자로 출력하지 않는다.
- `assetcatalog.js`, `period-buildings.js`, `heritage-models.js`: 조형 카탈로그의 내부 설명. `cataclysm.js`, `engine.js`: 셰이더 안 주석·내부 처리 문자열.
- `chronicle-event-scenes.js`: 모형 선택용 역할 판별값. 정규식과 비교값은 변경하지 않았다.
- `period-figures.js`: `displayStyle`에 담는 복식 참고 메타데이터. 뷰어 DOM에서 이 설명을 읽지 않는다.
- `inhabited-zones.js`, `settlement-regions.js`: 배경 배치 구역의 `basis` 메타데이터. `chronicle-scenery.js`에서 배치에 사용하며 화면 글자로 출력하지 않는다.
- 다른 `app/*.js`도 모두 문자열을 추출했다. 한글이 주석·정규식에만 있거나 화면용 한글 리터럴이 없는 파일은 표에 들어가지 않는다.
- `atlas-events.js`의 카테고리, `atlas-eras.js`의 시대 이름, 역할·관계 이름은 유지했다. 표시 문구를 데이터 키·CSS 클래스·data-* 값·API 파라미터로 바꾸지 않았다.

## 판단이 갈린 문구 5건

1. **AI 상상도**: 목록의 기존 라벨보다 화면 기준을 우선했다. 배지를 고정하고 NOTICE와 alt는 그대로 뒀다. #193에서 이미 없앤 고지·접힘 블록은 다시 만들지 않았다.
2. **사료 → 자료**: 출처·검색·채팅·설정의 표시 이름을 함께 바꿨다. 원문 인용과 NOTICE, 내부 데이터는 유지했다.
3. **통설 / 비정이 갈림 → 널리 인정된 위치 / 위치 해석이 갈림**: 확정 여부를 바꾸지 않으면서 학생이 이해할 표현으로 풀었다.
4. **북쪽을 위로 / AI와 역사 이야기**: 기준서가 허용한 명확한 문구여서 유지했다. 북쪽 버튼의 영문 N만 북으로 바꿨다.
5. **Cliopatria v0.1.3 등 출처 이름**: 고유명사·버전·단위는 출처 식별과 사실 보존을 위해 유지했다. 일반 안내의 Enter·3D·검증용 화질은 우리말로 바꿨다.

## 검증

- 수정 전 `node --test tests/*.mjs`: 332개 중 331개 통과, 1개 실패.
- 기존 실패: `tests/test_place_state.mjs:63`, `outside candidates retain dates, sources and authorship instead of vanishing` (`0 !== 1`).
- 수정 후 `node --test tests/*.mjs`: **332개 중 331개 통과, 기존 실패 1개, 새 실패 0개**. 종료 코드는 기존 실패 때문에 1이다.
- 문구 비교 테스트는 기대 문구만 수정했다. 인물·장소·기간·출처를 확인하는 기존 검사는 유지했다.
- `git diff --check`: 통과. 대상 JavaScript와 HTML 안 모듈의 구문 분석도 통과했다.
- 수정 전·후의 HTML id, CSS 클래스, data-* 속성, URL, value, name, aria-controls, aria-describedby를 대조해 보존을 확인했다. 문자열 밖 변경은 AI 배지에 기존 index 라벨을 쓰지 않도록 한 부분과 빈 상태에서 내부 id 표시를 뺀 부분뿐이다.
- 서버 실행·브라우저 화면 검증: NOT_RUN (서버를 시작하지 말라는 지시 준수).
- 커밋하지 않음. `.gitignore`와 AI 이미지 `index.json` 변경 없음.

## #198 재조정 (2026-09-16 · copy-style-v2.md 반영)

기준서 `docs/research/copy-style-v2.md`(사용자 결정 Q1~Q12)에 맞춰 위 표에 **`#198 재조정`** 열을 붙였다. 811행 중 **재조정 181행 / 유지 623행 / 유지(사유 설명) 3행 / 해당 없음 4행**이다. '해당 없음'은 #195·#197 에서 이미 다른 문구로 바뀌어 #194 표와 대조할 원문이 남지 않은 행이다.

### 항목별

1. **-ㅂ니다체 복귀 (Q3=b)** — 화면 안내문·빈 상태·오류·툴팁·aria 의 -요/-세요체를 격식 존댓말로 되돌렸다. 서술은 `-ㅂ니다`, 명령·권유는 `-십시오`("골라 보십시오", "확인하십시오", "적으십시오"). #194 가 고친 어색한 온톨로지 용어·번역투(주장→기록, 개체→항목, 렌즈→사료 등)는 그대로 둔다. 검사: UI 코드(`services/host/index.html`, `services/host/app/*.js`)에서 정규식 `해요|어요|예요|세요` **0건**. 남은 `요` 끝 낱말은 `주요`(주요 사건)·`관요`(정규식 안 조형 판정)·`설명하나요`(사용자가 AI 에게 던지는 예시 질문)뿐이다.
2. **모드 버튼 짧게 (Q4=b)** — `지도 · 3D · 연결 · 질문 · 비교`. 버튼 글자는 짧게 줄이고 뜻은 `aria-label` 로 풀었다(평면 지도로 보기 / 입체 지도로 보기 / 출처 연결 보기 / 사료에 질문하기 / 사료별 사건 비교하기). 3D 는 기준서 §2 영어 예외.
3. **'사료' 되살림 (Q9=a)** — 역사 기록을 뜻하는 곳은 '사료'로 되돌렸다. 화면 첫 등장 두 곳에만 풀이를 한 번씩 넣었다: 시작 화면 소개문("사료(역사 기록)에서 확인합니다")과 설정 패널의 출처 설정 제목("사료(역사 기록)와 출처 설정"). **'자료'로 남긴 곳**(데이터 파일·제공 데이터셋을 뜻함): `지도 자료`·`국가 영역 자료`·역사 지도 `자료를 불러오지 못했습니다`(history-map.js), 옛길 코스의 `자료의 기준연도`, Cliopatria 의 `한 자료에서 제시한 경계`·`이 자료가 모두 비어 있습니다`, 레일의 `자료 현황`, `원자료`, `위치 자료`(좌표 제공처), 인물 조형의 `참고한 자료입니다`, 검색 패널의 `자료를 불러오고 있습니다…`(#194 이전에도 '자료').
4. **AI 고지 문장 완전 삭제 (Q5=a)** — `atlas-story.js` 배지의 `title="${image.notice}"` 제거, `ai-images.js` 의 `notice` 기본값·필드 노출 제거(`index.json` 은 읽되 `notice` 는 쓰지 않는다), `scripts/ai_images/finalize_image.py` 의 `NOTICE` 는 `index.json` 호환을 위해 상수로만 남기고 화면 경로가 없음을 주석으로 적었다. `alt` 는 그림 제목만 쓴다. `tests/ai-images.test.mjs`·`scripts/verify_ai_images.py` 의 고지 단언을 없애고, 배지에 title 이 없음을 확인하는 검사로 바꿨다.
5. **초상 카드 폭 전체 (Q8=b)** — `.atlas-story-hero` 를 세로 배치로 바꿨다(초상 → 유형·생몰 → 이름 → 역할 → 설명). 초상은 카드 폭 전체, 세로 최대 320px, `object-fit:contain`, 배지는 좌상단(`top:8px;left:8px`). 720px 이하에서는 세로 최대 260px. 이미지가 없으면 지금처럼 글만 나온다.
6. **연도 범위 물결표** — `1545년~1598년`(공백 없음)으로 통일했다. `atlas-data.js` `datesLabel`·`relationDates`, `chronicle.js` 생몰·시기·연표, `chronicle-asset-plan.js`, `chronicle-territories.js`, `event-timeline.js`, 사료 카드의 '다루는 기간', 경계 주석의 `1911–1947년`류, 낱말 `출생–사망`까지 포함한다. 생몰이 둘 다 불확실할 때만 안쪽 폭을 괄호로 감싼다(`1545년(~1546년)~1598년`) — 물결표가 두 겹이면 어디가 생몰 구분인지 읽히지 않기 때문이다.
7. **'세력' → '집단'** — 역사 지도 종류의 `나라·집단 경계`(선택 상자와 제목 두 곳), `chronicle.js` 의 `aria-label="이때의 나라와 집단"`. 조형 코드(`landmarks.js`·`artbible.js` 등)의 `세력색` 같은 내부 주석·토큰 이름은 화면 문구가 아니어서 건드리지 않았다.

### 검증 (#198)

- `node --test tests/*.mjs`: **338개 중 337개 통과**, 기존 실패 1개(`tests/test_place_state.mjs:63` `outside candidates retain dates, sources and authorship instead of vanishing`, `0 !== 1`)뿐이고 새 실패 0개.
- 문구를 비교하는 테스트 `ai-images` · `branch-review-regressions` · `continuing-cities` · `facility-persistence` · `scene-kinds` · `story-card` 의 기대 문구만 맞췄다.
- 화면 문구를 그대로 기다리는 `scripts/verify_*.py`(graph · ndl_scan · origin_filter · panel_responses · place_research · viewer · ai_images)의 문자열도 함께 맞췄다. 서버·브라우저는 실행하지 않았다(NOT_RUN).
- 데이터 파일(json/md)·`README.md`·`index.json` 은 건드리지 않았다. 커밋하지 않았다.

## #198 2차 — 적대 리뷰 반영으로 바뀐 화면 문구 (2026-09-16)

`work-orders.md` C-5·C-7~C-18·C-24 반영분이다. 위 표의 행이 없던 새 문구는 여기에 적는다.

| 파일 | 위치 | 전 | 후 | 근거 |
|---|---|---|---|---|
| services/host/app/atlas-story.js | sectionHtml / places small | 사건 0 | 연결된 사건 없음 | C-5 — 연결된 사건이 없는 관계 장소에 '사건 0'은 뜻이 통하지 않는다 |
| services/host/app/atlas-story.js | eventHtml·places / 장소 축약 결과가 빈 문자열일 때 | (빈 줄) | 장소 미확인 | C-3 — 괄호 설명만 남은 라벨이 이름 없는 버튼을 만들었다 |
| services/host/index.html | 기록 카드 / span.pred | hasBoundaryRecord·locatedAt 등 영문 술어 | 경계 기록·위치 등 한글 이름, 표에 없으면 관련 기록 | C-7 — `chronicle.js` 의 공용 대조표(`predicateLabel`) |
| services/host/index.html | 사료 설명 카드 / 상태 | draft | 정리 중 | C-8 |
| services/host/index.html | 사료 설명 카드 / 이용허락 | short-excerpt-only 등 영문 코드 | 짧은 인용만 등 한글, 표에 없으면 미확인 | C-8 |
| services/host/index.html | 위치 후보·시점 카드 / precision | approx·site·day 등 | 대략 위치·유적 지점·일 단위, 표에 없으면 표시 안 함 | C-9 — `precisionLabel` |
| services/host/index.html | 기록 카드 / span.cl-note | EPSG:4326·Shapely·schema.md 가 섞인 개발자 메모 | (화면에서 뺌) | C-10 — 데이터는 그대로 두고 표시만 없앤다 |
| services/host/app/graph.js | draw / 노드 이름·설명 | Chunk·Source·Person / 영문 술어 | 원문 대목·사료·인물 / 한글 술어 | C-11 — `typeWord`·`predicateLabel` |
| services/host/index.html | showGraphClaim / h3·술어 | 원본 라벨 · tookPlaceAt | 다듬은 이름 · 장소 | C-12 |
| services/host/index.html | select / h3 | 원본 라벨(예: 고구려 · Goguryeo (Cliopatria 1262)) | 다듬은 이름, 원본은 title 툴팁 | C-13 — 검색·동일성 매칭에 쓰는 names/aliases 는 그대로 |
| services/host/app/chronicle-geography.js | showCard / p | 좌표, 설명문., 연도 · 활동 (한 문단) | 좌표 / 연도 · 활동 / 설명문 (세 문단) | C-14 — 마침표 뒤 쉼표가 붙던 문장 |
| services/host/index.html | showTimeClaims / 연도 기록 버튼 | 1592 ~ 1598 · 삼국사기 | 1592~1598 · 삼국사기 연도 출처 보기 | C-16 — 동사로 끝맺고 물결표 공백 제거 |
| services/host/app/atlas-data.js | typeName | Work·Thing·Institution 등이 모두 '기록' | 기록물·물건·제도·집단·시설·문화유산·유물·문서·개념·시대 | C-18 |

### 함께 고친 검증 스크립트 (#198 2차, 서버는 띄우지 않았다 — 문자열 대조까지)

| 스크립트 | 옛 단언 | 새 단언 | 사유 |
|---|---|---|---|
| `scripts/verify_comparison_discovery.py` | 사건 연결이 없다 | 사건 연결이 없습니다 | C-27 |
| `scripts/verify_quality_gate.py` | 검증용 화질(q=낮음)이 적용됩니다 | 주소에서 고른 화질: 낮음 | C-28 |
| `scripts/verify_historical_sites.py` | 확정 기록은 아니며 | 확정 기록은 아닙니다 | C-29 |
| `scripts/verify_historical_districts.py` | 원 도형에 자기 교차 | 원 경계선이 서로 엇갈립니다 | C-30 |
| `scripts/verify_historical_townships.py` | 표시용 도형에도 오류 | 표시한 경계에도 오류가 있습니다 | C-31 |
| `scripts/verify_chronicle_assets.py` | 조회 중(앱에 없는 문자열 — 대기가 늘 통과) | 불러오고 있습니다 | C-32, 문구 의존임을 주석으로 남김 |
| `scripts/verify_place_research.py` | 좌표 후보 | 위치 후보 | C-17 |
| `scripts/verify_name_claims.py` | `.pred` == hasName / hasStateName | `.pred` == 이름 / 나라 이름 | C-7 로 술어가 한글 대조표를 거친다 |
| `scripts/verify_period_geography.py` | `#geographyCard p` 첫 줄에 연도 | 카드 전체 글자에 연도 | C-14 로 본문이 `<p>` 세 줄로 나뉘어 첫 줄이 좌표가 됐다 |
| `scripts/verify_atlas_ui.py` | `152_year_expires_story` — 연도가 바뀌면 이야기 패널이 닫힌다 | `152_year_keeps_story` — 열린 채 남는다 | C-1 로 동작 자체가 바뀌었다 |
