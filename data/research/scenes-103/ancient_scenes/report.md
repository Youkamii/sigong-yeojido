# ancient_scenes — 918년 이전 한국사 장면 조사 보고

실행자: Claude Opus 5 (Max) · 작업 폴더: `C:\Users\gkfkd\AppData\Local\Temp\sigong-completion-103\ancient_scenes`
담당 구간: **918년 이전** (초기 국가 · 삼국 · 남북국). 918년 이후는 다른 담당자 몫이라 손대지 않았다.

## 0. 재부팅 복구 상태 (사실 그대로)

- `--resume`는 실패했다(`recovery.json`, `run.json.resume-failed`). 그래서 이번은 **같은 과제를 잇는 새 CLI 세션**이다.
- `recovered-activity.json`에 남은 재부팅 이전 활동은 입력 파일 열람(폴더 목록, `prompt.md`, `run.json`, `events.jsonl`, `existing-sites.json`, `existing-scenes.json`)까지였다. **다운로드·발췌·장면은 하나도 없었다.** 따라서 "이미 끝난 검색을 반복"한 것은 없고, 조사 자체는 이번 세션에서 처음 수행했다.
- 이전 세션이 확인해 둔 사실 두 가지는 그대로 재사용했다: `existing-scenes.json`의 기존 13개 장면은 모두 1592~1598·1919년이라 내 구간과 겹치지 않는다는 것, `existing-sites.json`의 5개 feature도 1270년 이후라 재사용할 대상이 없다는 것.

## 1. 산출물 경로

| 파일 | 내용 |
|---|---|
| `result.json` | `{sources, entities, claims, scenes, missing}` — **장면 21개, 출처 33개, claim 144개, 엔티티 82개, missing 16건** |
| `manifest.json` | 실제 요청 65건의 `url·fetchedUtc·httpStatus·byteLength·sha256·rawFile` |
| `raw/` | 내려받은 원본 바이트 65개 파일(약 8.3MB). encykorea 35, 위키백과(한국어) 16, 위키데이터 10, 위키백과(영어) 1, robots 3 |
| `progress.json` | 진행 상태(장면 1개 쓸 때마다 flush+fsync로 갱신) |
| `report.md` | 이 문서 |
| `missing_data.json` | `result.json`의 `missing` 원본 |
| `sources_data.py` / `scenes_data.py` / `scene_defs.py` / `build_result.py` | 결과를 만든 데이터·조립 스크립트(검증 포함). 애플리케이션 코드가 아니라 이 폴더 안의 조사 도구다. |
| `fetch.py` / `extract.py` | 15초 타임아웃·재시도 1회 다운로더, HTML 스트리퍼 |

## 2. 만든 장면 (연대순 21개)

| 장면 | 연도 | kind | 장소 표시 | 좌표 근거 |
|---|---|---|---|---|
| `scene-anc-geumseong-bce37` 금성 축조 전승 | -37 | construction | 경주 (area) | HGIS 경주 anchor |
| `scene-anc-gammunguk-231` 감문국 정벌 | 231 | battle | 개령 (area) | HGIS 개령 anchor |
| `scene-anc-pyongyangseong-371` 평양성 전투 | 371 | battle | 평양 (area) | HGIS 평양 anchor |
| `scene-anc-taehak-372` 태학 설립 | 372 | assembly | 국내성 (site) | 위키데이터 Q711386 |
| `scene-anc-pyongyang-transfer-427` 평양 천도 | 427 | court | 평양 (area) | HGIS 평양 anchor |
| `scene-anc-usanguk-512` 우산국 복속 | 512 | naval | 울릉도 (area) | HGIS 울릉도 anchor |
| `scene-anc-ichadon-527` 이차돈 순교 | 527 | court | 경주 흥륜사 일대 (area) | HGIS 경주 anchor |
| `scene-anc-gwansanseong-554` 관산성 전투 | 554 | battle | 옥천 (area) | HGIS 옥천 anchor |
| `scene-anc-salsu-612` 살수대첩 | 612 | battle | 살수(청천강) (area) | 위키데이터 Q499266 |
| `scene-anc-yeongaesomun-642` 연개소문 정변 | 642 | court | 평양성 (area) | HGIS 평양 anchor |
| `scene-anc-hwangnyongsa-tap-645` 구층목탑 조성 | 643~645 | construction | 경주 황룡사(터) (site) | 위키백과 황룡사 |
| `scene-anc-hwangsanbeol-660` 황산벌 전투 | 660 | battle | 논산 연산 (area) | HGIS 연산 anchor |
| `scene-anc-sabi-660` 사비성 포위·항복 | 660 | siege | 부여 사비(부소산성) (area) | 위키백과 부소산성 |
| `scene-anc-goguryeo-fall-668` 평양성 함락 | 668 | siege | 평양성 (area) | HGIS 평양 anchor |
| `scene-anc-gibeolpo-676` 기벌포 전투 | 676 | naval | 금강 하구 앞바다 (sea·area) | 위키데이터 Q489139 + 위키백과 기벌포 |
| `scene-anc-gameunsa-682` 감은사 창건 | 682 | construction | 경주 양북 감은사 (site) | 위키백과 감은사 |
| `scene-anc-balhae-698` 동모산 축성·건국 | 698 | construction | 동모산 (**좌표 null**) | 없음(§3 참조) |
| `scene-anc-bulguksa-751` 불국사 창건 | 751 | construction | 경주 토함산 불국사 (site) | 위키백과 불국사 |
| `scene-anc-cheonghaejin-828` 청해진 설치 | 828 | construction | 완도 장도 (site) | 위키데이터 Q625594 |
| `scene-anc-jangbogo-846` 장보고 암살 | 846 | court | 청해진 일대 (area, 지점 미상) | 위키데이터 Q625594 |
| `scene-anc-cheonghaejin-abolition-851` 청해진 철폐·주민 이주 | 851 | assembly | 완도 장도 (site) | 위키데이터 Q625594 |

kind 분포: construction 6, battle 5, court 4, siege 2, naval 2, assembly 2. 갈등만이 아니라 **교육기관 설립(372), 사찰·목탑 조성(645·682·751), 천도(427), 해상무역 기지 운영과 주민 강제 이주(828·851)** 같은 민간·문화·행정 활동을 함께 넣었다. 각 장면에 Codex가 쓸 `visualActions`(한국어, 출처 범위 안)를 붙였다.

기존 카탈로그 Event ID를 쓴 장면이 14개(금성·감문국·평양성371·태학·평양천도·살수·연개소문·백제멸망·고구려멸망·기벌포·발해건국·청해진 설치/암살/철폐), 새 Event ID가 7개(우산국512·이차돈527·관산성554·구층목탑645·황산벌660·감은사682·불국사751)다. Person/Place/Polity도 카탈로그에 있으면 그대로 썼고(예: `person-encykorea-euljimundeok`, `place-encykorea-salsu`, `place-sabi`, `place-gungnae`), 동명이인·유사명 병합은 하지 않았다.

## 3. 구체적으로 비어 있는 연결 고리 (`result.json`의 `missing` 16건 요약)

1. **평양성 좌표 없음** — 371·427(대성산성 비정)과 642·668의 평양성 좌표를 못 구했다. ko.wikipedia 「대성산성」·「안학궁」·「평양성」에 좌표 없음, 위키데이터 Q55728993·Q4873114에 P625 없음, en.wikipedia 「Taesong Fortress」에도 없음. 네 장면이 같은 평양 anchor 한 점으로 겹친다. → 기관 실측 좌표가 들어오면 **시기별로 두 지점(대성산성/장안성)을 갈라야 한다.**
2. **살수 전투 지점 미상** — 출처는 "살수=청천강"까지만. 위키데이터 항목 좌표(하류 쪽 39°36′N 125°25′E)를 표시점으로 썼고 상류 발원지 좌표는 쓰지 않았다.
3. **기벌포 해전 지점 미상** — 위키백과의 "서천군 장항읍 일대·금강 하구" 비정 + 위키데이터 금강 좌표로 바다 위 점을 잡았다. 서천군 중심점으로 바꾸지 않았다.
4. **동모산 좌표 없음** — 위키백과·위키데이터 모두 좌표 없음. 돈화현 시 중심점으로 대체하지 않고 `lon/lat`을 null로 두었다.
5. **흥륜사 절터 좌표 없음**, 그리고 이차돈 처형 지점 자체가 출처에 없음.
6. **장보고 암살 지점 없음** — `tookPlaceAt`이 아니라 `relatedTo`로 청해진과 연결했다.
7. **장도가 coastline.json에 없음** — 청해진 3개 장면 좌표가 단순화된 해안선 밖으로 찍힌다. 렌더러 쪽 처리 필요.
8. **국내성 좌표는 한반도 캔버스 밖**(태학 장면).
9. **국학(682) 장소 근거 없음** — 항목을 내려받았지만(`raw/enc-E0006550-gukhak.html`) 소재지 서술이 없어 장면을 만들지 않았다. 통일신라 학술 장면을 더 넣으려면 소재지를 밝힌 출처가 필요하다.
10. **불국사 창건 연대 이설(751 vs 742)** — 한쪽으로 확정하지 않고 `claim-anc-bulguksa-dispute`로 남겼다.
11. **소국 측 인물 없음**(감문국·우산국) / **사비성 포위의 신라 측 지휘관 없음** / **668년 함락 현장 인물 없음**(보장왕은 `related`로 내림).
12. **의자왕의 사비성→웅진성 이동**을 두 지점으로 나누려면 웅진성(공주) 좌표가 더 필요하다.
13. **국가유산청 계열 실측 좌표 미확보** — 앞선 실행 기록에 연결 시간 초과가 보고돼 있어 이번엔 요청하지 않고 접속되는 출처로 대체했다.
14. **장면화하지 않은 기존 카탈로그 사건**: 167·245·248·297·373·392(장소 서술 없음), 671~676 나당전쟁·676 삼국통일(여러 해에 걸친 서술), 713 책봉·732 등주 침입(무대가 한반도 밖).

## 4. 방법과 확인한 것

- **다운로드**: 자체 `fetch.py`(urllib, 타임아웃 15초, 재시도 최대 1회, 창 없이 실행). robots를 먼저 받아 확인했다 — encykorea는 `/Article/Search` 등만 금지라 `/Article/E…`는 허용, 위키백과·위키데이터는 `/wiki/Special:`과 `/w/`가 금지라 `Special:EntityData` 대신 `/wiki/Q…` 문서를 받았다. NIKH·KCI·KISS·ITKC는 요청하지 않았다.
- **발췌 규칙**: 모든 발췌는 저장된 원본 바이트를 HTML 스트립·공백 정규화한 텍스트에 **글자 그대로 존재하는지 자동 검증**했고(`build_result.py`의 validate), **웹페이지 1개당 발췌 총합 25단어 이하**를 코드로 강제했다(최대 25, 초과 시 빌드 실패). 한 곳에서 원문이 호환 한자 U+F90A(金)를 쓰는 것을 발견해 원문 글자 그대로 맞췄다.
- **검증 항목**: claim→출처/발췌 일치, 발췌 ID 중복, claim ID 중복, 엔티티 존재, 장면이 참조하는 claim 존재, presence/side/kind 값, 좌표 반쪽(lon만 있고 lat 없음) 여부, 근거 없는 effect 활성화 여부.
- **좌표 성격 분리**: 역사 서술(연도·행위·장소 이름)은 encykorea 발췌로, 지리 좌표는 HGIS anchor 또는 위키백과/위키데이터 발췌로 따로 근거를 달았다. 모든 `place.coordinateNote`에 "이 점이 무엇을 가리키는지"를 적었다(예: 현재 사찰 위치 표시 좌표이지 창건 당시 가람 범위가 아님).
- **바다/육지 확인**: 기벌포·청해진·청천강 후보점을 동봉된 `coastline.json` 다각형에 대해 점-내포 판정했다. 기벌포 점은 바다, 살수 점은 육지임을 확인하고 각각 `medium`을 정했다. 해상 활동을 육지로 옮기거나 섬을 군 중심으로 옮기는 처리는 하지 않았다.
- **전승과 사실 구분**: 금성 축조(서기전 37) 장면은 건국신화 전승임을 별도 claim(`claim-anc-geumseong-legendary`)으로 남기고 혁거세를 현장 인물이 아니라 `related`로 두었다.
- **양측 분리**: 전쟁 장면은 `side`를 invader/defender/naval로 나누고 역할 문구에 소속(백제 측·신라 측·수나라군 등)을 적어, 연합군이라도 신라군·당군을 각각의 참가자로 남겼다.
- **하지 않은 것**: 생몰년 수집, 재위 기간만의 수집, 병력 수·진형·경로·불탄 건물 추정, 애플리케이션 수정, git, 외부 메시지, 에이전트 생성. 화재 효과는 근거가 없어 21개 장면 모두 `fire.enabled=false`로 두었다.
