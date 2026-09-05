# 시공여지도 — SIGONG YEOJIDO, A Spacetime Atlas of History

한반도를 중심으로 한 역사 온톨로지. 사료(원문)를 조각(chunk)으로 쪼개고, 그 조각을 근거로 세운 주장(Claim)으로
사람·장소·나라·사건을 잇는다. **근거 없으면 답하지 않고, 판정하지 않고, 어긋나는 기록은 나란히 보인다.**
화면은 대동여지도로 들어가 시간축 지도(2D)와 판톨로지에서 이어받은 3D 디오라마로 갈라진다.

- 원칙과 그림: `docs/00-vision.md`
- 사료 목록·라이선스: `docs/01-sources.md`, 사료 카드 `data/sources/*.md`
- 스키마 정본(3층: 엔티티 / Claim / Source·chunk): `docs/02-schema.md`
- 조사 기록(사료 조사 1·2차, codex 교차검증, 국편 벌크 XML 구조): `docs/research/`

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

API: `/api/sources` `/api/places` `/api/entities` `/api/mentions?names=平壤,平穰` `/api/claims?subject=<id>&about=1`
`/api/year?y=918` `/api/density` `/api/elevation` `/api/geo`

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

## 작업 규약

기능마다 GitHub 이슈 → 실행으로 검증 → 이슈 번호 붙인 커밋 → 푸시 전 적대 리뷰. 커밋 메시지는 다음 세션이 그것만 읽고 무엇을/왜 했는지 알 수 있게 쓴다.
