# #188 AI 상상도 카드 2차 수정

2026-09-14, `feat/ai-image-cards-188` 작업 트리 검증 결과다. `git rebase main`은 충돌 없이 끝났다. 기준은 `main`의 `8eef53a0`이며, 리베이스된 1차 구현 HEAD는 `f9fac58930085982b6ec861c51c7adfe403fada3`이다. 2차 변경은 커밋·푸시·배포하지 않았다.

## 바꾼 파일

- 표시: [ai-images.js](../../../services/host/app/ai-images.js), [atlas-story.js](../../../services/host/app/atlas-story.js), [atlas-events.js](../../../services/host/app/atlas-events.js), [atlas.css](../../../services/host/app/atlas.css).
- 데이터·생성: [index.json](../../../services/host/assets/ai-images/index.json), [pilot-items.json](../../../scripts/ai_images/pilot-items.json), [finalize_image.py](../../../scripts/ai_images/finalize_image.py), [README.md](../../../scripts/ai_images/README.md). `services/host/app/ai-image-map.json` 삭제.
- 검사: [ai-images.test.mjs](../../../tests/ai-images.test.mjs), [test_finalize_image.py](../../../scripts/ai_images/test_finalize_image.py). 이 폴더의 `capture.py`를 [scripts/verify_ai_images.py](../../../scripts/verify_ai_images.py)로 이동하고 `--url --chrome --out` 인자를 추가했다.
- 산출물: `tests-before.txt` 삭제. [tests-after.txt](tests-after.txt)를 UTF-8, BOM 없이 재생성하고 [browser-results.json](browser-results.json), 아래 캡처 4장과 이 보고서를 갱신했다.

## 핵심 diff

- 각 이미지의 `subjects`에 개체·장면 id를 합쳤다. index 한 번 로드 후 `Map`을 만들고 장면 → 개체 순서로 조회한다. `itemId`, `items`, `pickSrc`, 반환 객체의 `title`을 제거했다. `alt`는 원래 이미지 제목이다.
- 로드 시 `null`, 필수 문자열 누락·잘못된 타입, `/`, `\`, `..`가 있는 파일 경로를 걸러낸다. 잘못된 항목이 섞여도 유효한 매핑은 남는다. 생성 스크립트는 `subjects`가 비어 있지 않은 문자열 배열이고 중복이 없는지 검사한 뒤 그대로 저장한다.
- 이야기 패널은 `image.label` 오버레이 하나와 안내문을 표시한다. 이미지의 원래 너비·높이를 넣고 최대 높이 320px, 비율 유지로 표시한다. 기존 `.atlas-placement-note`를 재사용하며 생성 날짜만 표시한다.
- 사건 카드는 제목·장소 아래 본문 흐름에 `image.label` 배지를 둔다. 배지의 줄 높이와 간격을 줄여 390px에서도 행동 줄이 들어간다. 별도 `relation-chip`, 카드의 추가 아래 패딩·중복 position 규칙을 제거했다.
- 결정: index 로드 실패는 페이지 안에서 재시도하지 않는다. 카드의 안내는 배지로 충분하며 긴 안내문은 이야기 패널에 둔다.

## 테스트 원문

명령·전체 출력·종료 코드는 [tests-after.txt](tests-after.txt)에 있다.

```text
node --test tests/*.mjs
1..218
# tests 218
# suites 0
# pass 217
# fail 1
# cancelled 0
# skipped 0
# todo 0
exit_code=1

node --test --test-skip-pattern="^outside candidates retain dates, sources and authorship instead of vanishing$" tests/*.mjs
1..217
# tests 217
# suites 0
# pass 217
# fail 0
# cancelled 0
# skipped 0
# todo 0
exit_code=0

python -B scripts/ai_images/test_finalize_image.py
.......
----------------------------------------------------------------------
Ran 7 tests in 1.132s

OK
exit_code=0
```

전체 실행의 유일한 실패는 이미 알려진 `tests/test_place_state.mjs:63`의 `outside candidates retain dates, sources and authorship instead of vanishing`이다(`0 !== 1`, 검증문 위치 69행). 두 번째 실행은 그 테스트 이름 하나만 제외했다. 이미지 로드 검사는 9개이며 잘못된 행 혼합, 우선순위, 단일 fetch, 실패 후 재시도 없음 등을 포함한다.

소스의 `git diff --check`는 통과했다. 원문 로그에는 Node가 출력한 공백만 있는 줄 두 개를 그대로 보존해 해당 파일의 공백 경고는 남는다. 로그의 UTF-8 디코딩, BOM·NUL 없음도 확인했다.

## 브라우저 검사 결과

[browser-results.json](browser-results.json): **34/34 통과, pageerror 0건**. 실제 로컬 뷰어와 기존 Fuseki `http://127.0.0.1:3031/sigong/query` 연결로 검사했다. 404 검사에서만 Playwright가 index 응답을 HTTP 404로 바꿨다.

| 캡처 | 확인 결과 |
| --- | --- |
| [세종 · 보통](01-sejong-medium.png) | 본 이미지, 배지 하나, 안내문, 펼친 생성 근거와 날짜 `2026-09-13` |
| [세종 · 낮음 · 820px](02-sejong-tablet-low.png) | 512px 미리보기, 이미지 표시 높이 320px, 배지 글자 12px, 가로 넘침 없음 |
| [한산도 카드 · 390px](03-hansando-card.png) | 56×56 썸네일, index 배지 하나, “선택한 사건 보기”가 온전히 보임 |
| [한산도 이야기](04-hansando-story.png) | 장면 id 매핑, 이미지와 안내문 정상 |

캡처 네 장을 직접 열어 표시도 확인했다. 390px 행동 줄의 아래쪽은 642.09px, 카드 아래쪽은 648px로 카드 안에 들어온다. 초기 검사에서 약 1px 넘친 것을 확인하고 간격을 수정한 뒤 재검사했다.

추가로 세종의 두 개체 id, 훈민정음 반포 개체 id, 이미지 없는 정인지 패널, index 단일 요청을 확인했다. index 404 후에도 세종 제목과 패널이 표시되고 이미지는 생략되며 재요청하지 않는다. 낮음 화질은 첫 본 이미지 요청 없이 미리보기를 쓰고, 화질 변경은 다음 패널 렌더에 반영된다.

재실행 예시(PowerShell, Playwright가 설치된 Python 사용):

```powershell
$env:SIGONG_FUSEKI_QUERY = 'http://127.0.0.1:3031/sigong/query'
python -u services/host/server.py --port 8881
python -B scripts/verify_ai_images.py --url http://127.0.0.1:8881/ --chrome 'C:\Program Files\Google\Chrome\Application\chrome.exe' --out docs/research/ai-image-cards-188
```

## 미확인

- 실물 모바일·태블릿과 Chrome 이외 브라우저: `NOT_RUN`. 이번 결과는 headless Chrome의 화면 크기 모사다.
- 배포 환경: `NOT_RUN`. 판톨로지 이식 파일은 수정하지 않았다.
- 서버에서는 검사 중 `ConnectionAbortedError [WinError 10053]` 로그가 관찰됐다. 브라우저 검사는 모두 통과했으며 이 서버 로그의 원인 분석은 이번 범위에 포함하지 않았다.
- 이번 검사에서 시작한 로컬 서버와 브라우저는 종료했다. 기존 Fuseki 프로세스는 유지했다.
