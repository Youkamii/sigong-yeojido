# 시공여지도 — SIGONG YEOJIDO, A Spacetime Atlas of History

한반도를 중심으로 한 역사 온톨로지. 사료(원문)를 조각(chunk)으로 쪼개고, 그 조각을 근거로 세운 주장(Claim)으로
사람·장소·나라·사건을 잇는다. **근거 없으면 답하지 않고, 판정하지 않고, 어긋나는 기록은 나란히 보인다.**
화면은 대동여지도로 들어가 시간축 지도(2D)와 판톨로지에서 이어받은 3D 디오라마로 갈라진다.

- 원칙과 그림: `docs/00-vision.md`
- 사료 목록·라이선스: `docs/01-sources.md`, 사료 카드 `data/sources/*.md`
- 스키마 정본(3층: 엔티티 / Claim / Source·chunk): `docs/02-schema.md`
- 조사 기록(사료 조사 1·2차, codex 교차검증, 국편 벌크 XML 구조): `docs/research/`
- 현재 운영 상태·완료 이슈·다음 작업: [인수인계](docs/HANDOVER.md)
- 전체 요구사항·완료 범위·빠진 기능: [전체 작업 목록](docs/TASKS.md)
- 현재 운영 화면: [시공여지도 열기](https://undertaken-coleman-interests-bruce.trycloudflare.com)

사료 적재·주장 검증·Fuseki, 2D·3D 지도, 그래프 탐색과 Claude Max 근거 챗봇이 동작한다.
현대 연구 기본 렌즈·AI 제외·인물 검색·사료 비교·시간 환산·역사 경계 표시도 구현했다.
Claim 9,416개는 경계 레코드 연결 9,028개와 그 밖의 관계 388개다. 읍·면·국가 경계·사건 장소와 출처 있는 이동 조건 검사까지 구현했다.
통사 자료의 빈 구간·한사군 위치 근거·실제 역로·공식 날짜 코드 확인은 남아 있다.
전체 작업과 미검증 범위는 [TASKS.md](docs/TASKS.md)를 따른다.

## 현재 데이터 (2026-09-07)

| 사료 묶음 | Source | chunk | 재현·검증 |
|---|---:|---:|---|
| 광개토왕릉비·삼국사기·삼국유사·고려사 | 4 | 37,003 | [사료 목록](docs/01-sources.md) |
| 조선왕조실록 | 30 | 389,483 | [실록 적재](docs/research/sillok-ingestion.md) |
| 한국고대금석문 | 823 | 3,195 | [금석문 적재](docs/research/geumseokmun-ingestion.md) |
| 한국고대사료집성 | 92 | 8,689 | [집성 적재](docs/research/jipseong-ingestion.md) |
| 단군 표기 설명(백과사전 짧은 인용) | 1 | 1 | [사료 카드](data/sources/encykorea-dangun.md) |
| 승정원일기 | 1 | 2,001,115 | [승정원일기 적재](docs/research/seungjeongwon-ilgi-ingestion.md) |
| 비변사등록 | 1 | 93,801 | [비변사등록 적재](docs/research/bibyeonsa-deungnok-ingestion.md) |
| 고종실록·순종실록·순종실록부록 | 3 | 33,633 | [고순종실록 적재](docs/research/gosunjong-sillok-ingestion.md) |
| 추가 위치·인물·연대·근현대 발췌·역사 경계 | 44 | 837 | [전체 작업·근거](docs/TASKS.md) |
| 고려사절요 | 1 | 11,226 | [35권·소개와 원 XML 대조](docs/research/goryeosa-jeolyo-76.md) |
| 한국독립운동사자료 42권 | 42 | 13,366 | [kd036 결손·빈 항목 보존](docs/research/independence-77.md) |
| 고운당필기 | 1 | 255 | [254기사·범례](docs/research/itkc-gowundang-78.md) |
| 위키문헌 고전 전사 6종 | 6 | 113 | [실제 HTML·저본·결손](docs/research/wikisource-corpus-80.md) |
| HGIS 읍·면 등(기존 Source 확장) | 0 | 8,176 | [원 기간·도형·반복 대조](docs/research/hgis-townships-75.md) |
| Cliopatria 한국사 국가 경계 | 1 | 94 | [원 기록·기간·표시 한계](docs/research/cliopatria-79.md) |
| 시대별 해설·평양 견해·사건 장소 | 22 | 43 | [시대별 범위](docs/research/claim-periods-51.md) |
| **c2 합계** | **1,072** | **2,601,030** | [운영 기록](docs/research/route-deployed-86.json) |

**새 Git 클론에는 카드 1,072개와 chunks 83,027개가 있다.** 실록 30종과 후대 사료의 전체 JSONL은 Git 밖의 c2
`data/sources/sillok-*/`, `seungjeongwon-ilgi/`, `bibyeonsa-deungnok/`에 보관한다.
새 환경에서는 각 적재 문서의 명령으로 생성한다. 파일별 SHA256·독립 XML 집계·두 번 추출한 결과는 Git에 있다.
금석문·집성의 원문 JSONL은 Git에 있다.
집성은 ZIP에 있는 92종의 한국 관련 기사 발췌이며 원 사서 전체가 아니다. 포털 설명의 95종과 차이는 적재 문서에 기록했다.
실록에서 실제 인용한 29개 JSON 객체는 `citation-chunks.jsonl`로 Git에 넣어 새 클론에서도 검증한다.
전체 적재본이 있으면 모든 필드가 같은지 대조하고 한 번만 센다. [실제 새 복사본 검사](docs/research/goal-clean-clone.json)

Claim 9,416개·인용 chunk 9,240개·Location 230개·Conflict 6개다. 모두 AI 초안이며 사람 검토 완료 기록은 없다.
직접 유적 좌표·현대 대표점·CHGIS 학술 재구성 점·근거가 부족한 조사 후보를 구별한다. 이름이 같다고 엔티티를 자동으로 합치지 않는다.
역사 지도는 HGIS 도 32개·군·부 등 726개·읍면 등 8,176개, Cliopatria 국가 경계 기록 94개, 사건 관련 장소 5개다.
종류·행정 단계 선택과 이름 검색을 지원한다. 데이터셋의 재구성 경계와 기관의 현재 좌표를 역사적 확정 위치·전투 범위로 바꾸지 않는다.
열린 역로·떨어진 선을 그리는 경로도 구현했으나, 원 선 자료에 근거한 한국사 역로는 아직 확보하지 못했다.
근현대 자료는 문서 전사·연설·기관 해설·북한 작성 보고서의 짧은 발췌다. 전문 수집과 구별한다.

## 구조

```
data/
  sources/<src>.md            사료 카드 (frontmatter: composedYear·coversFrom·coversTo·license …)
  sources/<src>/chunks.jsonl  원문 조각 — 단일 진실 원천. RDF 에는 id 만 들어간다
  sources/<src>/citation-chunks.jsonl  대용량 원문 중 실제 인용 객체의 동일 복사본
  claims/<src>/<chunk>.md     주장 — ```claims-json 펜스, quote 는 chunk text 의 부분 문자열
  entities/<class>/<id>.md    엔티티 껍데기 (이름뿐 — 속성은 전부 Claim)
  places.json, places-candidates*.json   지명 좌표 후보 (후보 여러 점, 유효기간, 출처)
  lenses.json, comparisons.json        사료 묶음과 근거가 있는 비교 사례
  maps/                       원 레코드 출처가 붙은 역사 경계
  geo/                        해안선·하천(Natural Earth), 고도 격자(ETOPO 2022)
services/
  host/server.py              뷰어 서버 (표준 라이브러리, 읽기 전용 API)
  host/index.html, app/       2D 지도 · 타임라인 · 근거/주장 패널 · 3D(korea.js) — app/engine·artbible·materials·style·util 은 판톨로지 이식본(손대지 않음)
  ingestion/                  국편 벌크 XML 추출기(extract_nikh_xml.py), 광개토왕비 판독문 추출기
  validate.py                 F4 검증기 — quote·citesChunk·엔티티·digest·Conflict
  build_ttl.py                검증한 주장과 공용 위치 목록을 RDF로 생성
  graph_query.py, time_query.py, people_query.py, comparison_query.py   실제 Fuseki 질의
scripts/                      fetch_datago_bulk.py(공공데이터포털 벌크), fetch_elevation.py, fill_card_counts.py, fuseki.sh, verify_viewer.py, diag_3d.py …
```

## 실행

Python 3.11 이상. 뷰어·추출기는 표준 라이브러리를 사용한다.

```bash
python3 services/host/server.py --port 8870      # 뷰어 http://127.0.0.1:8870  (시작 때 색인을 만든다)
python3 services/validate.py                     # claims 검증 (--write-digests 로 .digests.json 기록)
scripts/fuseki.sh install && scripts/fuseki.sh start   # Fuseki 포터블(.fuseki/), 127.0.0.1:3030, 데이터셋 /sigong
python3 scripts/sync_fuseki.py                        # 검증·TTL 빌드 → 기본 그래프 교체 → 개수 대조
python3 scripts/sync_fuseki.py --watch                # 5초마다 데이터 변경·인메모리 데이터 소실을 확인하고 재적재
```

c2에서 자동 재적재를 계속 실행하려면 저장소 루트에서
`setsid nohup python3 -u scripts/sync_fuseki.py --watch > /tmp/sigong-sync.log 2>&1 < /dev/null &`를 쓴다.
검증에 실패하면 기존 Fuseki 그래프를 유지하고 다음 확인 때 재시도한다. 일반 실행은 digest를 기록하지 않는다.
Fuseki 저장 방식은 인메모리를 유지한다. 서버나 감시 명령을 다시 띄우면 데이터에서 재적재한다.
빌더 코드를 변경했을 때는 감시 명령도 다시 시작한다. 재부팅 후 자동 기동은 아직 설정하지 않았다.
현재 전체 데이터는 c2 뷰어 시작 시 약 7분 동안 색인을 만들며, 준비 후 RSS 약 3.1 GiB를 쓴다.
API 준비를 확인한 뒤 접속한다. 검증·TTL 빌더는 인용된 원문만 읽어 최대 RSS 약 558 MiB로 전체 자료를 처리했다.
이는 해당 실행의 관측값이다. [측정 기록](docs/research/chunk-index-memory.md)

API: `/api/sources` `/api/places` `/api/entities` `/api/mentions?names=平壤,平穰` `/api/claims?subject=<id>&about=1`
`/api/year?y=918` `/api/density` `/api/elevation` `/api/geo`
`/api/chunk?id=<id>` `/api/graph?entity=<id>` `/api/time` `/api/people` `/api/locations`
`/api/lenses` `/api/comparisons` `/api/compare?id=<id>` `/api/comparison-differences`
`/api/history-map?level=0`(국가 경계)·`level=1`(도)·`level=2`(군·부 등)·`level=3`(읍면 등)·`level=4`(사건 장소)·`level=5`(역로, 실제 자료 미확보).
근거 챗봇은 `POST /api/chat`에서 Claude CLI의 Max 구독을 사용한다.

원문 목록은 `/api/chunks?offset=0&limit=120`으로 나눠 읽는다(`limit` 최대 500).
사료를 고르는 API에는 `sources=src-samguksagi,src-goryeosa`를 붙인다. `sources`를 생략하면 전체,
`sources=`는 전체 해제다. 화면의 사료가 30개를 넘으면 종류별로 접고, 묶음을 펼쳐 개별 사료를 고를 수 있다.

## 사료를 더 넣는 순서

1. `python3 scripts/fetch_datago_bulk.py --dataset <번호>` — 국편 벌크(공공데이터포털). 상세 페이지의 이용허락범위를 meta 에 기록한다.
2. `python3 services/ingestion/extract_nikh_xml.py --source <slug> --dataset <번호>` — 계층을 재귀로 내려가며 본문을 가진 요소마다 chunk. 두 번 돌려 sha256 이 같아야 한다.
3. `data/sources/<slug>.md` 카드를 쓴다(연도 근거를 본문에). 수치는 `python3 scripts/fill_card_counts.py --source <slug>` 가 채운다.
4. 뷰어에서 `/api/sources` 와 타임라인 막대를 확인한다.

큰 산출물(45 MB 초과)은 커밋하지 않고 재현 방법만 남긴다. 국편 사이트(db.history.go.kr)는 robots.txt 로 수집을 막으므로 긁지 않는다.

## 검증

- 뷰어: `scripts/verify_viewer.py --url "http://127.0.0.1:8870/?q=low" --out /tmp/verify` — 진입·지도·근거·찾기·사료 카드·타임라인·연력·3D·콘솔 12항목, PNG 를 사람이 본다. WebGL 은 헤드리스 스크린샷이 검게 나오므로 composer.render → toDataURL 로 뽑는다.
- 3D 진단: `scripts/diag_3d.py` (컴포저/직접 렌더 비교, 픽셀 샘플).
- 데이터: `services/validate.py --self-test`, 추출기 두 번 실행 해시 비교.
- 후대 사료: `scripts/verify_later_corpus.py` — 신규 5개 카드·사료 선택·연도별 원문·상위 날짜 보존 검사.
- 패널 응답: `scripts/verify_panel_responses.py` — 원문 검색 응답을 늦춰도 실제 주장은 먼저 뜨고, 늦은 카드 응답이 최신 선택을 덮지 않는지 검사.
- 전체 질의: `scripts/verify_core_questions.py --out /tmp/core-questions.json` — 실제 API·Fuseki, 모든 인용·사료 대조. 현재 8 PASS·Q6 PARTIAL.
- 사료 비교·인물·시간·위치·역사 지도: `verify_comparison_discovery.py`, `verify_people.py`, `verify_time.py`, `verify_location_filters.py`, `verify_historical_map.py`, `verify_historical_districts.py`, `verify_hansagun_sites.py`.
- 새 역사 지도·초기 선택·인용: `verify_historical_townships.py`, `verify_cliopatria.py`, `verify_khs_events.py`, `verify_initial_source_selection.py`, `verify_name_claims.py`, `verify_goal_data.py`.
- [실제 c2 운영 수용](docs/research/goal-production-acceptance.json), [이름·인용 수정 검사](docs/research/name-quotes-production-84-85.json), [역로 표시의 인공 시험 범위](docs/research/route-rendering-86.md). Python 111개·JavaScript 13개와 전체 TTL 검사 통과, GitHub Actions·별도 riot는 NOT_RUN.

## 작업 규약

기능마다 GitHub 이슈를 연결하고 구현·필요한 검사·이슈 번호를 붙인 커밋·서버 반영을 진행한다. 개발·총괄은 Codex, 조사·수집은 Claude Opus 5 / Max effort이며 터미널 창을 열지 않는다. 커밋 메시지는 다음 세션이 그것만 읽고 무엇을/왜 했는지 알 수 있게 쓴다.
