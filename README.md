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

현재 구현은 사료 적재·주장 검증·Fuseki와 사료/지명 중심의 2D·3D 뷰어다.
그래프 탐색·근거 챗봇·현대 연구 기본 렌즈·AI 제외 필터·통사 전체의 주장 뼈대는 아직 미완료다.
원문 적재량과 제품 전체 완성도를 구분한다.

## 현재 데이터 (2026-09-06)

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
| **c2 합계** | **955** | **2,566,920** | |

**새 Git 클론에는 카드 955개와 chunks 48,888개가 있다.** 실록 30종과 새 후대 사료의 JSONL은 Git 밖의 c2
`data/sources/sillok-*/`, `seungjeongwon-ilgi/`, `bibyeonsa-deungnok/`에 보관한다.
새 환경에서는 각 적재 문서의 명령으로 생성한다. 파일별 SHA256·독립 XML 집계·두 번 추출한 결과는 Git에 있다.
금석문·집성의 원문 JSONL은 Git에 있다.
집성은 ZIP에 있는 92종의 한국 관련 기사 발췌이며 원 사서 전체가 아니다. 포털 설명의 95종과 차이는 적재 문서에 기록했다.
claims 86개·지명 140개·Conflict 1건, c2 Fuseki 17,136 triples를 검증했다.
추가 지명 80개는 사료별 조사 후보다. 단군 표기 연결도 근거를 붙인 AI 초안이며, 엔티티를 자동으로 합치지 않는다.

## 구조

```
data/
  sources/<src>.md            사료 카드 (frontmatter: composedYear·coversFrom·coversTo·license …)
  sources/<src>/chunks.jsonl  원문 조각 — 단일 진실 원천. RDF 에는 id 만 들어간다
  claims/<src>/<chunk>.md     주장 — ```claims-json 펜스, quote 는 chunk text 의 부분 문자열
  entities/<class>/<id>.md    엔티티 껍데기 (이름뿐 — 속성은 전부 Claim)
  places.json, places-candidates*.json   지명 좌표 후보 (후보 여러 점, 유효기간, 출처)
  geo/                        해안선·하천(Natural Earth), 고도 격자(ETOPO 2022)
services/
  host/server.py              뷰어 서버 (표준 라이브러리, 읽기 전용 API)
  host/index.html, app/       2D 지도 · 타임라인 · 근거/주장 패널 · 3D(korea.js) — app/engine·artbible·materials·style·util 은 판톨로지 이식본(손대지 않음)
  ingestion/                  국편 벌크 XML 추출기(extract_nikh_xml.py), 광개토왕비 판독문 추출기
  validate.py                 F4 검증기 — quote·citesChunk·엔티티·digest·Conflict
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
현재 전체 데이터는 c2 뷰어 시작 시 약 6분 동안 색인을 만들며, 준비 후 RSS 약 3.1 GiB를 쓴다.
API 준비를 확인한 뒤 접속한다. 검증·TTL 빌더는 인용된 원문만 읽어 최대 RSS 약 558 MiB로 전체 자료를 처리했다.
이는 해당 실행의 관측값이다. [측정 기록](docs/research/chunk-index-memory.md)

API: `/api/sources` `/api/places` `/api/entities` `/api/mentions?names=平壤,平穰` `/api/claims?subject=<id>&about=1`
`/api/year?y=918` `/api/density` `/api/elevation` `/api/geo`

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

## 작업 규약

기능마다 GitHub 이슈 → 실행으로 검증 → 이슈 번호 붙인 커밋 → 푸시 전 적대 리뷰. 커밋 메시지는 다음 세션이 그것만 읽고 무엇을/왜 했는지 알 수 있게 쓴다.
