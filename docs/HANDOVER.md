# 인수인계 — 시공여지도 (2026-09-06 새벽 기준)

이 문서는 Claude 세션(2026-09-04~06)이 한 일 전부와, 다음 작업자(Codex)가 이어받을 때 알아야 할 것을 적는다.
하위 에이전트(워크플로)가 만든 것까지 포함한다. 사실은 **확인됨**(실행·화면으로 검증) / **미확인** 으로 나눠 적는다.

---

## 0. 한 줄 요약

한반도 중심 역사 온톨로지. 사료 원문 → chunk(JSONL) → 주장(Claim, 마크다운) → TTL → Fuseki. 화면은 대동여지도 진입 →
2D 시간축 지도 + 판톨로지(fantology) 렌더링 코어를 그대로 이식한 3D 디오라마 + 사료별 시간 막대 타임라인 + 근거/주장 패널.
사료 4종(광개토왕릉비·삼국사기·삼국유사·고려사, 37,003 chunk)까지 들어갔고, 뷰어는 c2 에서 돌며 12항목 자동 검증을 통과한다.

## 1. 사용자 요구사항 — 바뀌지 않는 것

- 판톨로지의 설계 원칙 계승: 3층(엔티티 / Claim / Source·chunk), 판본은 1급 시민, 개방세계, **근거 없으면 답하지 않는다, 판정하지 않는다**, 어긋나는 기록은 나란히 보인다, 출처는 병기한다.
- **3D 는 판톨로지 구현 자산을 그대로 쓴다** (`services/host/app/engine.js·artbible.js·materials.js·style.js·util.js`, `vendor/` — 손대지 않는다. 지형만 `korea.js` 로 갈아끼웠다). 사용자가 이걸 어겼을 때 크게 화냈다.
- 처음 화면은 대동여지도. 시간축 지도에서 사료마다 막대(다루는 기간)와 점(편찬 연도)이 있고 체크박스로 사료를 켜고 끈다. 진한 선 = 학계 통설이 기본, 나머지는 흐리게 겹친다.
- AI 가 이은 연결은 화면에 표시한다(자동/미확인 딱지). 출처 병기, 판본별 보기.
- 사료는 "전부, 모조리" 수집. 고조선~현대 통사, 뼈대 먼저.
- 구축·배포는 **c2**(lia-c2). c3 는 개인비서 서버라 쓰지 않는다. c2 의 FinBridge(:8891) 등 다른 서비스를 건드리지 않는다.
- 기능마다 GitHub 이슈, 이슈 번호 붙인 기능별 커밋. **화면을 직접 보기 전에 "된다"고 말하지 않는다.** 말은 짧고 쉽게.
- 2026-09-06 지시: **개발용 하위 에이전트는 Fable 5.1 effort high 로만**(max 금지). 토큰을 너무 썼다. 이후 작업은 Codex 로.

## 2. 어디에 무엇이 있나

| 것 | 위치 |
|---|---|
| GitHub | `Youkamii/sigong-yeojido` (public). main 최신 = 이 문서 커밋 |
| c2 작업본 | `ssh lia-c2` → `~/sigong-yeojido` (remote `git@github-sigong:Youkamii/sigong-yeojido.git`, 배포키 `~/.ssh/id_sigong`, git user Youkamii) |
| 로컬 클론 | `C:\Users\gkfkd\Git\sigong-yeojido` |
| 옛 저장소 | `C:\Users\gkfkd\Git\Map-of-the-Great-East` — 비어 있음. `.claude/worktrees/` 에 워크플로 워크트리 13개(전부 GitHub 브랜치로 백업됨). 세션 끝나면 지워도 됨 |
| 뷰어 서버 | c2 `:8870` — `cd ~/sigong-yeojido && setsid nohup python3 services/host/server.py --port 8870 > /tmp/sigong-server.log 2>&1 < /dev/null &` (시작 때 색인을 만드느라 ~8초) |
| 외부 URL | cloudflared 터널 `https://undertaken-coleman-interests-bruce.trycloudflare.com` (c2 pid 146152, 로그 /tmp/sigong-tunnel.log — 재시작하면 URL 이 바뀐다) |
| Fuseki | c2 `~/sigong-yeojido/.fuseki/` (Temurin JRE 21 + Fuseki 6.2.0 포터블, sudo 없이). `scripts/fuseki.sh start|stop|status|load <ttl>|query '<sparql>'`. 127.0.0.1:3030, 데이터셋 `/sigong`, **인메모리(멈추면 데이터 사라짐)**. 지금 떠 있고 1,711 트리플 적재됨(pid 167737) |
| TTL | `python3 services/build_ttl.py` → `data/build/sigong.ttl` (gitignore). c2 에는 에이전트가 만든 84,548 B 판이 있고, 로컬 main 빌드는 86,219 B (사료 4종 반영) |
| 검증 하네스 | c2 `~/sigong-yeojido/.venv-build/bin/python scripts/verify_viewer.py --url "http://127.0.0.1:8870/?q=low" --out /tmp/verify` → 12항목 + PNG (`/tmp/verify/*.png`, scp 로 받아 눈으로 본다) |
| 3D 진단 | `scripts/diag_3d.py` (컴포저/직접 렌더 비교, 픽셀 RGBA 샘플) |
| 벌크 zip | c2 `~/sigong-yeojido/data/bulk/1505363{4,5,7}.zip` (gitignore). 에이전트 클론 `~/work/corpus-*/data/bulk/` 에 15053630·15053631·15053647 도 받아 둠 |
| 문서 | `docs/00-vision.md` 원칙, `docs/01-sources.md` 사료 목록(확인된 것 절), `docs/02-schema.md` 스키마 정본, `docs/research/` 조사·교차검증·벌크 XML 구조, `README.md` |

## 3. 지금까지 된 것 (main, 커밋 순)

### 3.1 온톨로지·데이터
| 커밋 | 내용 | 이슈 | 상태 |
|---|---|---|---|
| (초기) | 광개토왕릉비 판독문(위키문헌 CC BY-SA 4.0) → `data/sources/gwanggaeto/chunks.jsonl` 42 chunk, 사료 카드 | #1 #2 닫음 | 확인됨 |
| 6cf2eaa | F3 주장 추출 — claims 85건(27 파일), 엔티티 껍데기 30, `scripts/check_claims.py` | #3 | 검증자 PASS |
| c33ee3e | F4 검증기 `services/validate.py` (quote·citesChunk·엔티티·digest·Conflict) + fixtures 8 + e2e | #4 | 검증자 PASS |
| 2c1fda2 | F3·F4 digest 파일 형식 통일(`{"algorithm","claims","version"}`, validate.py 가 정본) | #4 | 확인됨 |
| 169469a | 삼국사기 벌크(15053635) 5,170 → (b1d37a8·ba0743e) 5,237 chunk, 주석 3,339, 색인어 14,667 | #8 | 검증자 PARTIAL→해소 |
| 71a78a0 | 고도 격자 NOAA ETOPO 2022(CC0) `data/geo/korea-elevation.json` | #9 닫음 | 검증자 PASS |
| ba0743e | 추출기 계층 재귀 — `<text>` 가진 요소마다 chunk, `level`·`chunkType` 필드, 표·목록 태그 | #8 #13 #14 | 확인됨 |
| 4706bf3 | 삼국유사(15053634) 517 chunk, 카드(1281 추정·-2333 환산·936) | #13 닫음 | 확인됨 |
| fbe1547 | 고려사(15053637) 31,207 chunk(연대 27,470), 카드, chunks.jsonl 30.5 MB 커밋 | #14 닫음 | 확인됨 |
| bae6b5b | 삼국사기 색인 지명 좌표 후보 94 `data/places-candidates.json` + `scripts/list_index_terms.py` | #11 닫음 | 검증자 PASS(Wikidata 전수 대조) |
| fb52ed0 | F6 Fuseki 포터블 설치·조작 스크립트 | #6 | 검증자 PASS |
| 81a8c8b | F5 TTL 빌더 `services/build_ttl.py` + `ttl_check.py` + 테스트 27 + `tests/check_build.py` | #5 | SPARQL 검증 8/8 PASS(c2 적재본) |

### 3.2 뷰어 (`services/host/`)
| 커밋 | 내용 |
|---|---|
| 56aa0c3 | 판톨로지 렌더링 코어 이식(engine·artbible·materials·style·util·vendor) + `korea.js` |
| 838b761 | 바다·라벨 검게 깨지던 원인 — MAT_WATER 프리셋에 bumpScale 없음 → uniform NaN. korea.js 에서 명시 |
| 2562b36 | 실측 고도 격자 지형 디오라마(치마·바닥·바다면, 틀 밖 후보 미표시), `/api/elevation` |
| abeaab5 | 타임라인 통합(`app/timeline.js`, 24701d4) — 막대·점·체크박스·커서 |
| 8b98ae0 | 지명 aliases(平穰/平壤) 근거 검색 |
| 86b2a6e | `/api/mentions` 서버 검색(원문 4.9 MB 를 브라우저로 안 보냄), 지명별 mentions, 사료 토글이 지명 흐림에 반영 |
| 411670c | `/api/claims?subject=&about=1` 주장 패널(술어·목적어·인용문·origin 딱지) |
| ce10b20 | 지명 후보 94 통합 — 후보별 validFrom/validTo, 도읍 이동 표시, "조사(자동)·미확인" 딱지 |
| ae46802 | `/api/places` 가 `places-candidates*.json` 전부 병합 |
| 2efd9ba | 찾기(`/api/entities`, 인물·나라·사건 → 주장) + 서버 색인 예열 |
| 3525274 | 연력 — `/api/year` 이 해의 기록, `/api/density` 막대 밀도 띠, chunkCard 공용 |
| 0ea8120 | 3D 라벨 예산 24 |
| 08bb86a | 사료 카드 열람 `/api/source?id=` (mdLite 렌더러) |
| 629d4dd | 주장 패널 "값이 갈림" 표시(MULTI 술어 제외) |
| a28b361 | `/api/sources`·`/api/chunks` 캐시(3.1 s → 8 ms) |

하네스 12항목: gate_visible · map_land_drawn · map_pick_opens_evidence · entity_search_shows_claims · source_card_opens · timeline_mounted · timeline_click_changes_year · year_records_open · three_loaded · three_draws · three_pick_opens_evidence · console_errors_zero — 전부 PASS (a28b361 시점, 확인됨).

### 3.3 조사·문서
- 사료 조사 1·2차(에이전트 20개, 661건) `docs/research/survey-round{1,2}.md`, codex gpt-5.6-sol 교차검증 `xcheck-round{1,2}.md`(지적률 37%·60%), 국편 벌크 XML 구조 `bulk-xml-findings.md`(세 데이터셋 실측 비교표).
- `docs/02-schema.md` §13 Fuseki 호스트 c2 로 정정. `docs/01-sources.md` 확인된 사료 절. `README.md`.

## 4. 데이터 현황

| 사료 | 데이터셋 | 이용허락(확인일) | chunk | 연대 있음 | 주석 | 색인어 | 비고 |
|---|---|---|---:|---:|---:|---:|---|
| 광개토왕릉비 | 위키문헌 | CC BY-SA 4.0 (09-04) | 42 | 0 | 편집자 주 | – | 판독본 한 벌뿐 |
| 삼국사기 | 15053635 | 제한 없음 (09-05) | 5,237 | 3,948 | 3,339 | 14,667 | level3 기사 + level2 절 67 |
| 삼국유사 | 15053634 | 제한 없음 (09-05) | 517 | 196 | 1,903 | 5,690 | level4 기사, 王曆 은 표, 檀君=壇君 |
| 고려사 | 15053637 | 제한 없음 (09-05) | 31,207 | 27,470 | 735 | 124,396 | 세가 "왕N년›월›기사"(level5), 고려세계 id 에 `$` |

지명 58(손질본 10 + 조사본 48, 후보 90), 엔티티 껍데기 30, claims 85(전부 광개토왕비, origin ai, status draft), Conflict(validate.py 규칙) 12, TTL 1,711 트리플(c2 적재본; 로컬 main 빌드는 사료 4종 반영으로 더 큼).

## 5. 하위 에이전트(워크플로) 산출물 — 전부

### 5.1 `wf_c6ec2a22-8c1` 병렬 구축 1라운드 (12 에이전트, 전부 완료)
| 에이전트 | 산출물 | 브랜치(GitHub 백업) | main 반영 | 검증자 판정 |
|---|---|---|---|---|
| 삼국사기 벌크 추출 | extract_nikh_xml.py, samguksagi.md, chunks·annotations·index-terms | agent/worktree-wf_c6ec2a22-8c1-1 (ee4881a) | 169469a | PARTIAL(±5% 미달 → b1d37a8 로 해소) |
| 고도 격자 | fetch_elevation.py, korea-elevation.json | …-2 (c4dea96) | 71a78a0 | PASS |
| F3 claims | claims 85·엔티티 30·check_claims.py | …-3 (d07f8da) | 6cf2eaa | PASS |
| F4 validate.py | validate.py + fixtures | …-4 (cf3d79f) | c33ee3e | PASS |
| 타임라인 UI | timeline.js + timeline-demo.html | …-5 (00cec87) | 24701d4 | PASS |
| 지명 좌표 후보(#11) | places-candidates.json 94 후보, list_index_terms.py, research/samguksagi-index-terms.json | …-6 (04710a4) | bae6b5b | PASS (minor 4: 중첩 index 정규식 14건 오집계, 미해독 문자참조 29, --out 경로, kind 어휘) |

에이전트가 남긴 미결: 삼국사기 dateOccured 'L0' 접미사 의미 미확인; 웹/벌크 글자 차이(淲/㴲) 전수 대조 불가(robots); `.gitattributes *.jsonl eol=lf` 제안; 퍼머링크 검증기는 스크래치에만.

### 5.2 `wf_681abf90-f8d` F5 TTL + F6 Fuseki (5 에이전트, 4 완료)
- F6 준비: c2 `.fuseki/` 설치, `scripts/fuseki.sh`·`fuseki_load.py`·`tests/fixtures/fuseki-sample.ttl` → e8621f3 → main fb52ed0. DoD 전부 c2 실행 관측. 재부팅 자동 시작 없음(제안: crontab @reboot).
- F5 빌더: `services/build_ttl.py`(validate.py 파서·게이트·충돌 규칙 재사용), `ttl_check.py`, `tests/test_build_ttl.py`(27), `tests/check_build.py` → 0aca2c3 (브랜치 agent/f5-ttl-wf_681abf90-f8d-1) → main 81a8c8b(로컬에서 `validate.py` OK · `build_ttl.py` OK · unittest OK 확인).
  - 결정: 규칙용 리터럴은 `syj:isSupportedBy`(스키마 §7). places.json 후보는 citesChunk·quote·fromSource 세 필드가 다 있을 때만 `syj:locatedAt` Claim 으로 승격, 없으면 `syj:Location(grounded false)` — 현재 후보는 전부 승격 0.
  - 경고: `place-gungnae` 엔티티 껍데기 없음 → 후보 건너뜀(껍데기 파일 하나 만들면 됨).
  - 제안: `docs/02-schema.md` §9 두 번째 예시가 citesChunk 없이 적혀 있어 §0-3·§11 과 어긋남 — 문서 정정 필요.
  - validate.py 를 두 곳 고침(chunk 로더가 locator·lang·permalink 도 들도록; 평면 digest 형식도 읽도록).
- 적재: c2 `data/build/sigong.ttl` load → 1,711 트리플, 타입별 수 F5 로그와 일치.
- SPARQL 검증: 8/8 PASS(Claim 85, digest 85/85 일치, Chunk 에 text 없음, person-gwanggaeto 주장 13, 좌표 후보 = Location 노드, Conflict 12, TimeSpan verbatim 10, owl:sameAs 0).
- **미실행**: TTL 스키마 적대 리뷰(세션 한도).

### 5.3 `wf_6ada6fe6-175` 적대 리뷰 (34 에이전트) — 확인된 결함은 §6.

### 5.4 `wf_668890c6-ba3` 사료 3라운드 (#15 실록·#16 금석문·#17 집성) — **세션 한도로 셋 다 도중 사망**
남은 상태(c2, 미커밋):
- `~/work/corpus-joseon-sillok/` — 15053647.zip 받아 둠(추출 전).
- `~/work/corpus-godae-geumseokmun/` — 15053630.zip, `data/sources/godae-geumseokmun/` 추출 시도본, `extract_nikh_xml.py` 수정본(미커밋).
- `~/work/corpus-godae-saryo-jipseong/` — 15053631.zip, 원 사서별 분할 시도본(`data/sources/jipseong-beiqishu/`, `jipseong-beishi/`, `jipseong-cefuyuangui/`), 추출기 수정본.
- 스크립트: `workflows/scripts/sigong-corpus-round3-wf_668890c6-ba3.js`(재개는 `resumeFromRunId: wf_668890c6-ba3`, 캐시 없음). **effort 를 high 로 낮춰서** 다시.

### 5.5 `wf_e37d2b0e-000` 지명 2라운드 (#18 고려사·삼국유사 색인 지명 좌표) — **세션 한도로 사망, 산출물 없음**
워크트리 `Map-of-the-Great-East/.claude/worktrees/wf_e37d2b0e-000-{1,2}` 에 부분 파일이 있을 수 있음(미확인).

## 6. 적대 리뷰에서 **확인된** 결함 (고쳐야 할 것)

리뷰어 3(정합성·보안·단순화) → 발견 31건 → 반박 검증에서 확인된 것. 줄 번호는 리뷰 시점(3525274 전후) 기준이라 지금과 다를 수 있다.

### major (먼저)
1. **한 글자 라벨의 부분 문자열 일치가 근거 수·사료 토글을 오염** — `server.py` `places_with_mentions()`·`mentions()` 의 `any(n in t for n in names)`. 조사본 한 글자 국명 10개(遼 唐 魏 漢 倭 隋 燕 梁 陳 宋)가 陳設·漢山·거란 遼 등을 잡아 전체 mentions 의 72.5% 를 차지. 고침: 이름 길이 ≥ 2 조건, 한 글자는 다자 alias(大唐·後漢 …)로만, 삼국사기·삼국유사는 index-terms type=국명 정확 일치 활용(고려사 index-terms 엔 국명 type 없음). 화면엔 "한 글자라 자동 검색 안 함" 표시.
2. **`/api/places` 병합의 id 충돌이 다른 개념을 조용히 버림** — `place-hanseong`(손질본 百殘國城 vs 조사본 漢城 후보 5), `place-daebang`(帶方界 vs 帶方). `candidatesAlsoIn` 은 화면에 안 나옴. 고침: label 이 다르면 시작 로그 경고 + 조사본 label 을 aliases 로 접고 후보를 실제로 합치거나 조사본 id 를 바꾼다(place-baekje-capital 등).
3. **사료를 전부 끄면 근거가 전 사료로 나옴** — 클라이언트 `sources=`(빈값) 을 `parse_qs` 가 버려 필터 없음(`/api/mentions`, `/api/year`, claims 필터도). 고침: `parse_qs(..., keep_blank_values=True)` 로 빈 목록 = 아무것도 안 켬.
4. **검증기 두 벌·digest 정책 반대** — `scripts/check_claims.py` 는 플래그 없이 새 claim digest 를 자동 기록(사람 검토 게이트 우회), validate.py 는 `--write-digests` 로만. 고침: check_claims.py 의 digest 기록을 없애고 validate.py 로 단일화(check_claims 의 판독·간지 검사만 validate.py 로 옮기거나 남김).
5. **frontmatter 파서 세 벌**(server.py·validate.py·check_claims.py) 계약이 다름 — 서버는 `generated`·`sources`·`verified`(중첩) 를 버린다. 고침: 파서 하나(services/ 공용 모듈)로.
6. **/api/mentions names 수·길이 무제한** → 요청 1건으로 수십 초 CPU. 고침: names ≤ 8개, 각 ≤ 32자, limit 상한.
7. **근거 패널 innerHTML XSS 경로** — esc 가 `&`·`<` 만 바꿈, `href` 속성에 `"` 미이스케이프, sourceUrl/permalink 스킴 검사 없음(국편 XML·AI 조사본이 그대로 흘러듦). 고침: esc 에 `>` `"` `'` 추가, href 는 http(s) 만.
8. ('살아 있는가' 규칙 두 벌) 2D `activeAt/candActive` 와 3D `_isLive/_candActive` — 한 모듈로.
9. `/api/sources` 매 요청 재파싱 — **고침(a28b361)**.

### medium
- 3D 는 틀(123–132E·33–43.5N) 밖 후보를 표시 없이 뺀다(낙랑 요서설 사라짐, 대방계 기둥 하나) — `hiddenOutside` 를 화면에.
- `/api/places` 캐시 경합(늦게 끝난 계산이 새 캐시를 덮음; 잠금 범위) — 반박 검증은 한도로 미실행(plausible).
- 연결 타임아웃 없음(slowloris), `do_GET` 예외 처리 없음(깨진 데이터 파일 하나로 응답 없이 끊김), 정적 경로 `startswith` 접두 검사(형제 디렉터리 잠재), 서버 소스·pyc·데모 페이지가 공개 URL 로 노출 + Server 헤더 버전.
- check_claims.py 와 validate.py 의 "삭제된 claim" 판정 다름.

### minor
- 하네스가 index.html 의 2D 투영식·상수(26·54·18)를 복사해 씀(hits 노출로 대체), 죽은 mousemove 블록.
- 상태 색이 index.html 에 세 벌(범례·통계·COLOR)이고 3D 는 artbible PALETTE 라 레일 범례 색이 3D 와 다름.
- index.html 모듈 스크립트 ~600줄 — 갈라야 함(근거 패널·타임라인·3D 초기화·찾기).
- 죽은 CSS(range 슬라이더·.ticks), `state.chunks` 미사용, 추출기 docstring 이 재귀 이전 설계(level3 고정, 153/5,389건)를 말함, korea.js 폴리곤 판 폴백 ~130줄 죽은 코드, 기간 null 후보 = 영구로 그림(미상과 구분 안 됨), 삼국사기 카드에 counts 마커 없음(수치 수동), `candidatesAlsoIn` 미표시, "서버는 아무것도 쓰지 않는다" vs `__pycache__`.

## 7. 남은 일 (우선순위)

1. §6 major 1~8 수정 → 하네스 12/12 → 커밋(#7 #4).
2. Conflict 규칙: `validate.py` 에 `MULTI_VALUED_PREDICATES = {mentionedIn, describedAs, instructs, hasTitle, hasOutcome, subjectToRule}` 를 두고 (f) 충돌 집계에서 제외, `build_ttl.py` 도 같은 목록 import, `docs/02-schema.md` §11 에 명시. 뷰어 `index.html` 의 MULTI 와 같은 목록. `tests/fixtures/valid-conflict.md` 는 readsCharacterAs 라 영향 없음. **재검증 정정:** 기존 12건 중 11건이 다치 술어다. `chunk_gwanggaeto_1-09`의 `readsCharacterAs`(海/每) 1건은 유지한다(#27).
3. F5→F6 파이프라인 자동화: 데이터가 바뀌면 `build_ttl.py` → `fuseki.sh load`(또는 `fuseki_load.py --replace`). Fuseki 인메모리라 재시작하면 재적재 필요 — TDB2(`--tdb2 --loc .fuseki/db`) 로 바꿀지는 사용자 결정(§13 미결).
4. 사료 3라운드 재개(#15 #16 #17) — c2 `~/work/corpus-*` 상태에서. 실록은 실록마다 Source 로 나누는 규칙표(왕대·완성 연도·출처) 필요. 45 MB 넘는 jsonl 은 커밋하지 않고 c2 작업본에만(README 규칙).
5. 지명 2라운드(#18) 재실행. 결과는 `data/places-candidates-<src>.json`(서버가 병합).
6. 타임라인 행이 30개를 넘으면(실록) 사료 종류별 묶기·접기 — `timeline.js` 에 group 개념.
7. 이름 표기 변형(壇君/檀君, 平穰/平壤) → `sameEntityAs` Claim 으로 승격(§8), 지금은 places.json aliases 임시.
8. 판톨로지 물질화 연출(엔진에 있음: `patchFanMaterial`·`uMaterialize`), 3D 라벨 겹침 개선.
9. 국편 `dateOccured` 'L' 접미사 의미 확인, 삼국사기 웹/벌크 글자 차이.
10. 라이선스 기관 문의 여부는 사용자 결정(국편 웹은 저작권법 24조의2 학술·개인 한정, 벌크는 데이터셋별 확인 완료).
11. 승정원일기(15064218)·비변사등록(15053636)·고순종실록(15053646)은 대용량 저장 전략(git 밖, 재현 스크립트) 정한 뒤.

열린 이슈: #3 #4 #5 #6 #7 #8 #12 #15 #16 #17 #18. 닫힌 이슈: #1 #2 #9 #10 #11 #13 #14. #5 #6 은 81a8c8b·fb52ed0 + 적재 검증 PASS 로 닫아도 된다(코멘트 남기고).

## 8. 규칙·함정

- 커밋: 이슈 번호를 제목에, 본문은 다음 사람이 커밋만 읽고 무엇을/왜/검증을 알게. **Co-Authored-By·"Generated with …" 절대 금지**, 귀속(attribution) 줄 없음. author 는 Youkamii.
- 푸시 전 적대 리뷰 1회가 규칙(이번엔 §6 결과가 그것).
- 새 콘솔 창 금지(Start-Process/start/wt). 백그라운드는 `setsid nohup … &`.
- **ssh 한 줄 명령 안에 작은따옴표·`<span` 같은 문자를 넣지 말 것** — 두 번 서버를 죽였다. 패치는 파일로 만들어 scp 후 실행.
- 서버 재시작은 `old=$(pgrep -f "^python3 services/host/server.py"); kill $old` — `pkill -f services/host/server.py` 는 ssh 셸 자신을 죽인다.
- 국편 사이트(db.history.go.kr, contents.history.go.kr)는 robots.txt 전면 Disallow — 긁지 않는다. 벌크 다운로드는 한 번만(캡차 경로 있음).
- 판톨로지 이식 파일은 건드리지 않는다. 팔레트는 artbible PALETTE 만.
- WebGL 헤드리스 캡처는 `composer.render()` → `toDataURL` (뷰포트 스크린샷은 검게 나옴). gstack /browse 는 WebGL 에서 죽어서 c2 Playwright 하네스로 대체.
- 하위 에이전트 세션 한도: "resets HH:MM" 이 뜨면 그 뒤 `Workflow({scriptPath, resumeFromRunId})` 로 재개(완료분은 캐시). **effort 는 high 까지.**
- 워크플로 워크트리는 `Map-of-the-Great-East` 저장소의 `origin/main` 에서 갈라진다 — 새 워크플로 전에 거기서 `git fetch origin`.
- 메모리(Claude): `C:\Users\gkfkd\.claude\projects\C--Users-gkfkd-Git-Map-of-the-Great-East\memory\` — `sigong-resume-point.md`, `feedback-verify-and-plain.md`, `feedback-subagent-model-tokens.md`.

## 9. 검증 절차 (이어받는 사람이 처음 할 일)

```bash
ssh lia-c2
cd ~/sigong-yeojido && git pull --ff-only
curl -s http://127.0.0.1:8870/api/sources | head -c 300           # 뷰어 살아 있나
.venv-build/bin/python scripts/verify_viewer.py --url "http://127.0.0.1:8870/?q=low" --out /tmp/verify   # 12/12
python3 services/validate.py                                        # OK
python3 services/build_ttl.py && scripts/fuseki.sh status           # TTL 빌드, Fuseki 상태
scripts/fuseki.sh query 'SELECT (COUNT(*) AS ?n) WHERE {?s ?p ?o}'  # 1711
```
PNG 는 `scp lia-c2:/tmp/verify/04-3d.png .` 로 받아 눈으로 본다.
