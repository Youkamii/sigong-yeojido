# 인수인계 — 시공여지도 (2026-09-06, 지명 조사·후대 사료 반영)

이 문서는 Claude 세션(2026-09-04~06)의 작업과 Codex가 이어서 반영한 결과를 적는다.
하위 에이전트(워크플로)가 만든 것까지 포함한다. 사실은 **확인됨**(실행·화면으로 검증) / **미확인** 으로 나눠 적는다.

---

## 최신 진행 — Codex, 2026-09-06

**완료 범위 정정(#45): F1~F6와 사료·지명 중심의 2D/3D 뷰어는 동작하지만, 전체 제품은 미완료다.**
§7은 8개 완료·2개 부분·1개 결정 대기다. 비전·스키마의 그래프·챗봇·기본 렌즈·AI 제외·역사 지도·
통사 주장 뼈대·역사 일관성 규칙 등이 이 단기 목록에서 빠져 있었다.
[전체 작업 목록과 실제 누락 검사](TASKS.md)에 기존 #1~#44와 새 후속 #46~#63을 모두 연결했다.
앞선 "남은 것은 조사뿐"이라는 해석은 맞지 않는다. 아래 운영 수치는 그때 확인한 구현의 범위에서 유효하다.

개발·통합은 Codex가 맡았고, 조사·서지는 **Claude Opus 5 / Max effort**로 호출했다.
지명 조사 8건·별도 검토 3건, 단군 표기·날짜 형식·벌크 메타데이터·후대 사료 서지 4건으로 실질 조사 15건이 끝났다.
실제 모델 `claude-opus-5`를 응답에서 확인했다. 별도 호출 점검 1건은 조사 수에 넣지 않았다.
PowerShell 입력 인코딩이 깨진 벌크 조사 시도 1건은 해당 프로세스만 종료하고 UTF-8 파일 입력으로 재실행했다.
모든 Claude 호출은 `CREATE_NO_WINDOW`·`--safe-mode`·파일 입출력을 썼고 새 터미널 창을 열지 않았다.
원본 호출 기록은 로컬 `%TEMP%/sigong-places-opus5/`, `%TEMP%/sigong-next-opus5/`에 있다.

| 기능 | 이슈 | 커밋 |
|---|---|---|
| 조사 모델·역할 분담, 숨김 실행 기록 | #33 | `99b1240` |
| AI 좌표를 조사 후보로 표시 | #34 | `dd53019` |
| 고려사·삼국유사 각 40개 지명과 사료별 후보 연결 | #18 | `f47d0e0` |
| 단군 표기의 근거 있는 동일성 Claim, 엔티티 병합 없음 | #35 | `0061488` |
| 3D 물질화 연출·라벨 겹침 줄이기 | #37 | `bc9f62e` |
| 날짜 코드·글자 전수 집계와 미발송 문의 초안 | #36 | `0abf77a` |
| 승정원일기 본문·상위 날짜·편집 표지 보존 | #38 | `8fa8610` |
| 비변사등록 기사·권별 서지 구분 | #39 | `36956a4` |
| 고종·순종실록·부록을 3개 Source로 적재 | #40 | `2caabde` |
| 검증·TTL 빌드 시 필요한 원문만 읽기 | #41 | `38ebe0f` |
| 원문 검색 전에 주장 표시, 늦은 응답의 패널 덮어쓰기 수정 | #43 | `c28c59c` |
| 3D 연출 시작 값을 활성화와 동시에 관측하는 검사 | #44 | `ee99c8a` |
| 현재 운영 결과·사료 목록·인수인계 갱신 | #42 | 이 문서 커밋 |

현재 데이터와 검증:

- **Source 955개, c2 chunks 2,566,920개.** 이전 949개·438,370개에 단군 설명 1개·1 chunk와 후대 사료 5개·2,128,549 chunks를 더했다.
- **새 Git 클론은 카드 955개·chunks 48,888개.** 실록 30종과 후대 사료 5개 Source의 JSONL은 c2에만 있다. 신규 ZIP은 `~/work/corpus-next-round/data/bulk/`, 두 차례 추출본은 그 아래 `first/data/sources/`, `second/data/sources/`다. 각 적재 문서와 `*-reproducibility.json`에 명령·SHA256이 있다.
- claims **86**, digest **86/86**, 엔티티 **32**, 지명 **140**(id 전부 유일), Conflict **1**(海/每). 기존 광개토왕비 85개에 단군 표기 Claim 1개를 더했다. 모두 AI 초안이며 대량 원문에서 자동으로 주장을 만들지는 않았다.
- 신규 지명은 사료별 80개·좌표 후보 107개다. 좌표의 Wikidata P625 값 69개를 대조해 불일치 0건이었다. 이는 현대 위치 후보의 좌표 대조이며, 역사 지명 비정이 확정됐다는 뜻은 아니다. 각 항목에 자료와 불확실성을 남겼다.
- 신규 세 데이터셋을 두 번 추출해 카드·JSONL이 바이트 단위로 같음을 확인했다. 독립 XML 집계로 ID·기사/절·날짜 상속·권별 서지를 대조했다. 기존 삼국사기·삼국유사·고려사 JSONL 9개도 새 추출기로 재생성했을 때 바이트가 같았다.
- Python tests **65개**, JavaScript tests **9개**, validate self-test **8 fixtures + e2e** 통과. 새 전체 자료 빌드에서 실패 0, digest 86/86. `place-gungnae` 엔티티 껍데기 누락으로 후보를 건너뛰는 기존 경고 1개는 남아 있다.
- TTL **17,136 triples**, **802,750 bytes**, SHA256 `c0b88e5099cb991415f1c187f519e90b59941df3c123778ac9974071bd381b53`. 전체 자료 빌드는 **94.81초·최대 RSS 571,784 KiB**였다. 기존 자료 438,371개로 만든 TTL도 이전 버전과 바이트가 같았다. [메모리 변경 기록](research/chunk-index-memory.md)
- c2 :8870과 외부 터널에서 **955 Source·2,566,920 chunks** 확인. 운영의 새 JSONL **16개**, 기존 실록 JSONL **90개**를 기록된 SHA256과 전수 대조했다. Fuseki COUNT **17,136**과 TTL 해시도 일치했다.
- 운영 뷰어 **12/12**, 콘솔 오류 **0**. 신규 카드 5개·각 시작/끝 연도 조회·상위 날짜 보존, 실록 묶기·부분/전체 해제, 주장 선표시·늦은 카드 응답 처리 검사를 통과했다. 3D는 3개 카메라 모두 라벨 24개·겹침 0, 연출 시작 0→완료 1, 선택 라벨 유지·전체 해제 시 라벨 0을 확인했다. [운영 검증 JSON](research/later-corpus-acceptance.json)
- [운영 3D 캔버스](research/viewer-production-3d.png)와 [승정원일기 카드](research/viewer-production-seungjeongwon.png)를 내려받아 직접 확인했다. 추가 PNG·로그·보고서는 c2 `/tmp/sigong-later-production/`, 로컬 `%TEMP%/sigong-later-production/`에 있다. 판톨로지 이식 코어·vendor는 `56aa0c3` 이후 변경 없음.
- 뷰어 pid **202873**, 감시 pid **202874**로 시작했다. 로그·pid 파일은 기존 경로를 유지한다. Fuseki pid **167737**, FinBridge :8891 pid **100364**는 유지한다. **재부팅 자동 기동은 아직 없다.**
- 운영 색인 생성 **352.94초**, 준비 후 RSS **3,226,360 KiB**를 관측했다. 시험 서버 :8872는 종료했고 FinBridge 리스너는 배포 전후 같았다. 원문 검색은 자료량에 따라 늦어질 수 있어 주장과 별도로 표시한다. GitHub Actions 실행·커밋 check run은 없어 CI는 **NOT_RUN**이다.

사료별 결과는 [승정원일기](research/seungjeongwon-ilgi-ingestion.md), [비변사등록](research/bibyeonsa-deungnok-ingestion.md),
[고순종실록](research/gosunjong-sillok-ingestion.md)에 있다. 조사 초안의 기간을 그대로 쓰지 않고 실제 XML과 대조했다.
비변사등록은 1616년 기사 3개, 순종실록부록은 1928년 기사가 있어 해당 범위를 카드에 넣었다.
승정원일기의 빈 본문·결락 표지는 지우지 않고 보존했다. 원문이 없는 해를 만들어 채우지 않았다.

## 이전 진행 — Codex, 사료 3라운드

이 절은 지명·후대 사료 반영 전 기록이다. 현재 수치는 위 최신 진행 절을 따른다.

**§7의 1~4·6 완료. 다음은 5, 고려사·삼국유사 지명 후보 조사(#18).** 사료 증가에 필요한 6(묶기·접기)은 4와 함께 처리했다.

**현재 역할 분담(#33, 이후 사용자 지시): 개발·통합·총괄은 Codex, 조사·수집은 Claude Opus 5 / Max effort.**
필요하면 조사 에이전트 10~20개 병렬 호출도 허용하지만, 아래 과거 워크플로를 일괄 재실행하라는 뜻은 아니다. 기능별 이슈·커밋은 유지한다.
별도 터미널 창을 열지 않는다. 로컬 Claude Code 2.1.261의 `claude.exe --print --model claude-opus-5 --effort max`를
`CREATE_NO_WINDOW`로 실행하고 입출력은 파일로 받는다. 사용자 훅·플러그인이 창을 열지 않도록 이 호출에는 `--safe-mode`를 쓴다.
실제 응답의 모델 `claude-opus-5`를 확인했다. 호출 확인 기록: 로컬 `%TEMP%/sigong-opus-probe/run.json`.
#18은 고려사·삼국유사 각 상위 40개를 10개씩 8건으로 나눠 진행 중이다. 입력·진척·산출물은 `%TEMP%/sigong-places-opus5/`에 있다.
조사 초안은 아직 운영 반영 결과가 아니며, 원문·좌표 대조와 별도 조사 검증 후 반영한다.

| 기능 | 이슈 | 커밋 |
|---|---|---|
| 상세 원문을 응답할 때만 읽고, 검색 색인 메모리·원문 응답 크기 제한 | #30 | `9b4d95f` |
| 30개 초과 사료를 종류별로 묶기·접기, 개별 선택 보존 | #31 | `fd876ee` |
| 실록 30종 Source·기사 추출, 독립 XML 수 대조, 재현 기록 | #15 | `26e3456` |
| 금석문 823개 Source, 판독문·개관·번역·참고문헌 구분 | #16 | `115484a` |
| 집성 원 사서 92개 Source, 서지·날짜 원표기 보존 | #17 | `ad1c903` |
| 하네스가 비동기 주장 표시를 기다리도록 수정 | #31 | `ef04d11` |
| 현재 운영 결과와 인수인계 갱신 | #32 | 이 문서 커밋 |

현재 확인값:

- **Source 949개, c2 chunks 438,370개.** 기존 4개·37,003 + 실록 30개·389,483 + 금석문 823개·3,195 + 집성 92개·8,689.
- **새 Git 클론은 카드 949개·chunks 48,887개**다. 실록 JSONL **840,174,964 bytes(약 801 MiB)**는 Git 밖의 c2 `data/sources/sillok-*/`에 있다. [실록 재현 방법](research/sillok-ingestion.md)과 파일별 해시는 Git에 있다. 금석문·집성 JSONL은 모두 Git에 있다.
- claims **85**, digest **85/85**, 엔티티 껍데기 **30**, 지명 **60**(id 전부 유일), Conflict **1**(海/每 판독 차이). 신규 사료에서 자동으로 주장을 만들지는 않았다.
- TTL **17,008 triples**, **796,716 bytes**, SHA256 `5d54dcddef70b33141fe8dc70cc6ca7f969894c2ab8d7e6a0ac29abd5692a885`. c2 Fuseki 교체 적재와 COUNT 대조 완료. `place-gungnae` 엔티티 껍데기 누락으로 후보를 건너뛰는 기존 경고는 남아 있다.
- 세 신규 사료를 두 번 추출해 모든 JSONL·카드의 바이트 일치를 확인했다. 운영 JSONL도 보고서의 SHA256과 전수 대조했다. 기존 삼국사기·삼국유사·고려사 JSONL 9개는 수정된 공용 추출기로 재생성해도 바이트가 같다.
- Python tests **53개**, JavaScript tests **8개**, validate self-test와 실제 claims 검증 통과. c2 운영 :8870 화면 하네스 **12/12**, 콘솔 오류 **0**. 운영 2D·3D PNG를 내려받아 직접 확인했다.
- 실록 30개 접기·부분 선택·전체 해제·시간 범위 유지·태조 카드, 금석문 광개토왕릉비 카드와 414년 판독문 14개, 집성 92개 펼침·三國志 카드도 운영 브라우저/API에서 확인했다. 증거: c2 `/tmp/sigong-source-groups-production/`, `/tmp/sigong-new-corpus-ui-production/`, `/tmp/sigong-corpus-production/`. 운영 화면 PNG는 로컬 `%TEMP%/sigong-corpus-production/`에도 있다.
- 운영 뷰어 RSS **643,008 KiB** 관측. 전체 사료를 넣은 시험본에서 캐시 후 `/api/sources` **99ms**, 전체 `平壤` 검색 **832ms**(각 1회). 전체 사료 선택 파라미터 33,035 bytes는 외부 터널에서도 HTTP 200이었다. 수치는 부하에 따라 달라진다.
- 뷰어: `python3 -u services/host/server.py --port 8870`, 배포 때 pid **192372**, 로그 `/tmp/sigong-server.log`, pid 파일 `/tmp/sigong-server.pid`.
- 자동 적재: `python3 -u scripts/sync_fuseki.py --watch`, 배포 때 pid **192373**, 로그 `/tmp/sigong-sync.log`, pid 파일 `/tmp/sigong-sync.pid`. Fuseki pid **167737**은 유지했다. **재부팅 자동 기동은 아직 없다.**
- 외부 터널에서 Source **949개** 확인. FinBridge :8891 리스너는 배포 전후 동일(pid **100364**). 시험용 뷰어 :8872는 종료했다. 판톨로지 이식 코어·vendor 변경 없음.
- #15 #16 #17 #30 #31은 검증 코멘트를 남기고 닫았다. GitHub Actions 실행 기록은 없다. 이 작업도 하위 에이전트·워크플로·새 터미널 창 없이 진행했다.

집성 포털 설명의 95종과 ZIP의 92개 XML 차이, 불확실한 편찬 시점 42개는 [집성 적재 기록](research/jipseong-ingestion.md)에 남겼다.
없는 원문이나 정확한 연도를 만들어 채우지 않는다. 금석문은 [적재·기존 광개토왕릉비 대조 기록](research/geumseokmun-ingestion.md)을 따른다.

## 이전 진행 — Codex, §7의 1~3

아래 수치는 사료 3라운드 전의 검증 기록이다. 현재 확인값은 위 최신 진행 절을 따른다.

| 기능 | 이슈 | 커밋 |
|---|---|---|
| 한 글자 국명은 국명 색인 정확 일치, 다자 별칭 검색은 유지 | #19 | `7088c9d` |
| 한성·대방 id 충돌 보존, 기존 평양 별칭 유지, 조사 후보 표시 | #20 | `9eef464`, `5f33d08` |
| 빈 사료 선택을 mentions·year·claims 및 열린 패널에 반영 | #21 | `6b79a7b` |
| 검증 명령 통합, 명시적 옵션 없이 digest 생성·수정 금지 | #22 | `6cd824d` |
| 사료·주장·엔티티 머리말 공용 파서 | #23 | `014afb9` |
| 검색 이름 8개·각 32자 제한, 반복 파라미터도 검사 | #24 | `4adbaad` |
| HTML 이스케이프·HTTP(S) 링크·원문 강조, 브라우저 주입 검사 | #25 | `292bff3`, `66b7917` |
| 2D·3D 연도와 사료 활성 조건 공용화 | #26 | `d988a74` |
| 다치 술어 제외, 실제 판독 차이 1건 유지 | #27 | `686856b` |
| 데이터 변경·Fuseki 재시작 뒤 자동 빌드·교체 적재·개수 대조 | #28 | `83c7133` |
| F6 사료 선택·충돌·근거 추적 질의 파일 | #6 | `b0a9dc2` |

현재 확인값:

- 사료 4종, chunks 37,003, claims 85, digest 85/85 일치. 지명 **60개**, 모든 id 유일.
- `漢城` 조사 후보 5개, `帶方` 조사 후보 1개를 별도 지명으로 보존. `平穰/平壤`은 기존 aliases에 따라 한 항목이며 후보 5개.
- Conflict **1건**: 신묘년조 `readsCharacterAs`의 海/每. 기존 12건 중 11건이 다치 술어였다.
- TTL **1,675 triples**, 82,436 bytes. SHA256 `ef0e572768cb0b8dfb23ba74eb8a7f3b592eef4f2a2dc1b35d9e63100540ed55`. c2 Fuseki에 교체 적재·COUNT 대조 완료.
- Python tests **44개**, JavaScript tests **6개**, validate self-test **8 fixtures + e2e** 통과.
- c2 :8870 화면 하네스 **12/12**, 실제 API fixture HTML 주입 검사, 지명 60개의 근거 수 대조, 전체 사료 해제 패널, 연도·사료 조합 16개의 3D 상태 대조 통과.
- 2D·3D·HTML 검사 PNG를 내려받아 직접 확인. 증거: c2 `/tmp/sigong-major-final/`, 로컬 `%TEMP%/sigong-major-final/`.
- 자동 적재의 실제 Fuseki 재시작 검사는 **별도 :3032**에서 수행. 초기 적재·사료 수정 반영·인메모리 소실 복구·잘못된 claim 거부 및 기존 그래프 보존 통과. 증거: `/tmp/sigong-sync-live-_aqhci5o/`.
- 운영 감시: `python3 -u scripts/sync_fuseki.py --watch`, 시작 시 pid **184430**, 로그 `/tmp/sigong-sync.log`, pid 파일 `/tmp/sigong-sync.pid`. 기본 확인 간격 5초. **재부팅 자동 기동은 아직 없음.** 빌더 코드를 바꾸면 감시 명령을 다시 시작한다.
- `queries/q1-source-toggle.rq` 85행, `q2-conflicts.rq` 2행(하나의 판독 충돌), `q4-evidence.rq` 1행을 c2에서 실행 확인.
- 판톨로지 이식 코어·vendor 변경 없음. FinBridge :8891 리스너를 배포 전후 대조하여 동일함을 확인. 시험 뷰어 :8872와 시험 Fuseki :3032는 종료함.
- #5 #6 및 #19~#28 닫음. GitHub Actions 실행 기록은 없음.

사료 3라운드 재개 전에 확인한 것:

- 실록 ZIP `~/work/corpus-joseon-sillok/data/bulk/15053647.zip`: **143,263,188 bytes**, XML **673개**, 압축 해제 약 **814 MiB**.
- 실록은 첫 총서 파일의 루트가 `level1`, 뒤의 연차 파일은 `level2`다. 기존 추출기의 `root.iter("level1")`만으로는 뒤 파일의 기사가 빠진다. **먼저 파일 루트부터 순회하도록 고치고 fixture 및 XML 기사 수로 대조해야 한다.**
- 예: `2nd_waa_000.xml`은 太祖實錄 총서, `2nd_waa_101.xml`은 태조 원년. 실록마다 Source를 나누고, 완성 연도는 별도 근거로 확인한다.
- 금석문 ZIP은 XML 10개·약 13 MiB, 집성은 XML 92개·약 20 MiB. 기존 `corpus-*`의 미커밋 추출기와 부분 산출물은 보존했다. 아직 main에 합치지 않았다.
- 큰 산출물은 README의 45 MB 규칙을 따른다. 실제 추출량과 뷰어 메모리 사용량을 측정한 뒤 운영 데이터에 반영한다.
- 이 세션에는 Fable 5.1 호출 기능이 없어서 하위 에이전트·워크플로를 사용하지 않았다.

---

## 0. 한 줄 요약

한반도 중심 역사 온톨로지. 사료 원문 → chunk(JSONL) → 주장(Claim, 마크다운) → TTL → Fuseki. 화면은 대동여지도 진입 →
2D 시간축 지도 + 판톨로지(fantology) 렌더링 코어를 그대로 이식한 3D 디오라마 + 사료별 시간 막대 타임라인 + 근거/주장 패널.
기존 사료에 실록·금석문·집성·승정원일기·비변사등록·고순종실록과 단군 설명을 더해 c2에는 Source 955개·2,566,920 chunk가 있다. 뷰어는 c2에서 돌며 12항목 자동 검증을 통과한다.

## 1. 사용자 요구사항 — 바뀌지 않는 것

- 판톨로지의 설계 원칙 계승: 3층(엔티티 / Claim / Source·chunk), 판본은 1급 시민, 개방세계, **근거 없으면 답하지 않는다, 판정하지 않는다**, 어긋나는 기록은 나란히 보인다, 출처는 병기한다.
- **3D 는 판톨로지 구현 자산을 그대로 쓴다** (`services/host/app/engine.js·artbible.js·materials.js·style.js·util.js`, `vendor/` — 손대지 않는다. 지형만 `korea.js` 로 갈아끼웠다). 사용자가 이걸 어겼을 때 크게 화냈다.
- 처음 화면은 대동여지도. 시간축 지도에서 사료마다 막대(다루는 기간)와 점(편찬 연도)이 있고 체크박스로 사료를 켜고 끈다. 진한 선 = 학계 통설이 기본, 나머지는 흐리게 겹친다.
- AI 가 이은 연결은 화면에 표시한다(자동/미확인 딱지). 출처 병기, 판본별 보기.
- 사료는 "전부, 모조리" 수집. 고조선~현대 통사, 뼈대 먼저.
- 구축·배포는 **c2**(lia-c2). c3 는 개인비서 서버라 쓰지 않는다. c2 의 FinBridge(:8891) 등 다른 서비스를 건드리지 않는다.
- 기능마다 GitHub 이슈, 이슈 번호 붙인 기능별 커밋. **화면을 직접 보기 전에 "된다"고 말하지 않는다.** 말은 짧고 쉽게.
- 2026-09-06 최신 지시: **개발·총괄은 Codex, 조사·수집은 Claude Opus 5 / Max effort**. 필요한 조사 병렬 호출 10~20개도 허용. 이전 개발용 하위 에이전트의 Fable 5.1 high 제한을 조사에 적용하지 않는다. 새 터미널 창은 열지 않는다.

## 2. 어디에 무엇이 있나

| 것 | 위치 |
|---|---|
| GitHub | `Youkamii/sigong-yeojido` (public). main 최신 = 이 문서 커밋 |
| c2 작업본 | `ssh lia-c2` → `~/sigong-yeojido` (remote `git@github-sigong:Youkamii/sigong-yeojido.git`, 배포키 `~/.ssh/id_sigong`, git user Youkamii) |
| 로컬 클론 | `C:\Users\gkfkd\Git\sigong-yeojido` |
| 옛 저장소 | `C:\Users\gkfkd\Git\Map-of-the-Great-East` — 비어 있음. `.claude/worktrees/` 에 워크플로 워크트리 13개(전부 GitHub 브랜치로 백업됨). 세션 끝나면 지워도 됨 |
| 뷰어 서버 | c2 `:8870` — 저장소 루트에서 `python3 -u services/host/server.py --port 8870`. 백그라운드 실행, 로그 `/tmp/sigong-server.log`, pid 파일 `/tmp/sigong-server.pid`. 시작 시 전체 색인을 만드므로 API 준비까지 기다린다 |
| 외부 URL | cloudflared 터널 `https://undertaken-coleman-interests-bruce.trycloudflare.com` (c2 pid 146152, 로그 /tmp/sigong-tunnel.log — 재시작하면 URL 이 바뀐다) |
| Fuseki | c2 `~/sigong-yeojido/.fuseki/` (Temurin JRE 21 + Fuseki 6.2.0 포터블, sudo 없이). `scripts/fuseki.sh`로 시작·종료·상태·적재·질의. 127.0.0.1:3030, 데이터셋 `/sigong`, **인메모리(멈추면 데이터 사라짐)**. 17,136 트리플, pid 167737. `sync_fuseki.py --watch`가 소실 시 재적재 |
| TTL | `python3 services/build_ttl.py` → `data/build/sigong.ttl` (gitignore). c2 전체 자료 802,750 B·17,136 트리플, SHA256은 최신 진행 절. 시험 빌드 94.81초·최대 RSS 571,784 KiB 관측 |
| 검증 하네스 | c2 `~/sigong-yeojido/.venv-build/bin/python scripts/verify_viewer.py --url "http://127.0.0.1:8870/?q=low" --out /tmp/verify` → 12항목 + PNG (`/tmp/verify/*.png`, scp 로 받아 눈으로 본다) |
| 3D 진단 | `scripts/diag_3d.py` (컴포저/직접 렌더 비교, 픽셀 RGBA 샘플) |
| 벌크 zip | c2 `~/sigong-yeojido/data/bulk/1505363{4,5,7}.zip` (gitignore). 에이전트 클론 `~/work/corpus-*/data/bulk/` 에 15053630·15053631·15053647 도 받아 둠 |
| 실록 Git 밖 원문 | c2 `~/sigong-yeojido/data/sources/sillok-*/` (기존 30개 + 고순종 3개 폴더). 기존은 `sillok-ingestion.md`·`sillok-extraction.json`, 고순종은 `gosunjong-sillok-ingestion.md`·`gosunjong-reproducibility.json` |
| 후대 일기·등록 Git 밖 원문 | c2 `data/sources/seungjeongwon-ilgi/`, `bibyeonsa-deungnok/`. ZIP은 `~/work/corpus-next-round/data/bulk/15064218.zip`, `15053636.zip`, `15053646.zip`. 재현·독립 집계·해시는 `docs/research/` 각 적재 문서·JSON |
| 문서 | `docs/00-vision.md` 원칙, `docs/01-sources.md` 사료 목록(확인된 것 절), `docs/02-schema.md` 스키마 정본, `docs/research/` 조사·교차검증·벌크 XML 구조·신규 3종 적재 기록, `README.md` |

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
| 조선왕조실록 | 15053647 | 제한 없음 (09-06) | 389,483 | 380,785 | 68,209 | 2,040,834 | 30 Source, 기사 381,672·절 7,811, JSONL은 c2만 |
| 한국고대금석문 | 15053630 | 제한 없음 (09-06) | 3,195 | 판독문만 조성 시점 상속 | 10,505 | 6,842 | 823 Source, 판독·개관·번역·참고문헌 분리 |
| 한국고대사료집성 | 15053631 | 제한 없음 (09-06) | 8,689 | 3,439 | 8,924 | 187,760 | 92 Source, 원 사서별 발췌 |
| 단군 표기 설명 | 한국민족문화대백과사전 | 짧은 인용만 (09-06) | 1 | 0 | – | – | 본문 전체 재배포 조건 미확인 |
| 승정원일기 | 15064218 | 제한 없음 (09-06) | 2,001,115 | 2,001,115 | 147,061 | 9,809,671 | 기사·좌목·요목 1,897,041 + 일자 절 104,074, 편집 표지 별도 |
| 비변사등록 | 15053636 | 제한 없음 (09-06) | 93,801 | 93,522 | 31,675 | 998 | 기사·좌목 93,528 + 권별 서지 273 |
| 고종·순종실록·부록 | 15053646 | 제한 없음 (09-06) | 33,633 | 33,630 | 3,492 | 121,037 | 3 Source, 기사 32,800 + 절 833 |

합계 **955 Source, c2 2,566,920 chunks**. Git에는 대용량 JSONL을 뺀 **48,888 chunks**를 수록했다.
지명 **140**, 엔티티 껍데기 **32**, claims **86**(광개토왕비 85 + 단군 표기 1, origin ai, status draft), Conflict **1**, TTL **17,136** 트리플.

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
이 절은 당시 중단 기록이다. **Codex가 ZIP을 재사용해 새로 전체 추출·검증했고 세 건 모두 main/c2에 반영했다.** 이전 미커밋 시도본은 보존했다.
당시 남은 상태(c2, 미커밋):
- `~/work/corpus-joseon-sillok/` — 15053647.zip 받아 둠(추출 전).
- `~/work/corpus-godae-geumseokmun/` — 15053630.zip, `data/sources/godae-geumseokmun/` 추출 시도본, `extract_nikh_xml.py` 수정본(미커밋).
- `~/work/corpus-godae-saryo-jipseong/` — 15053631.zip, 원 사서별 분할 시도본(`data/sources/jipseong-beiqishu/`, `jipseong-beishi/`, `jipseong-cefuyuangui/`), 추출기 수정본.
- 스크립트: `workflows/scripts/sigong-corpus-round3-wf_668890c6-ba3.js`(재개는 `resumeFromRunId: wf_668890c6-ba3`, 캐시 없음). **effort 를 high 로 낮춰서** 다시.

### 5.5 `wf_e37d2b0e-000` 지명 2라운드 (#18 고려사·삼국유사 색인 지명 좌표) — **세션 한도로 사망, 산출물 없음**
워크트리 `Map-of-the-Great-East/.claude/worktrees/wf_e37d2b0e-000-{1,2}` 에 부분 파일이 있을 수 있음(미확인).

## 6. 적대 리뷰에서 **확인된** 결함 (당시 기록)

리뷰어 3(정합성·보안·단순화) → 발견 31건 → 반박 검증에서 확인된 것. 줄 번호는 리뷰 시점(3525274 전후) 기준이라 지금과 다를 수 있다.
아래 major 1~9는 모두 수정됐다. medium·minor는 개별 코드의 현재 상태를 확인한 뒤 진행한다.

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

1. **완료** — §6 major 1~8 수정 → 하네스 12/12. 기능별 #19~#26, 커밋과 검증은 최신 진행 절.
2. **완료(#27)** — `validate.py`의 `MULTI_VALUED_PREDICATES`를 충돌 집계에서 제외하고, `build_ttl.py`도 같은 목록을 import한다. 스키마 §11과 뷰어 `MULTI` 목록도 일치한다. **재검증 정정:** 기존 12건 중 11건이 다치 술어다. `chunk_gwanggaeto_1-09`의 `readsCharacterAs`(海/每) 1건은 유지한다.
3. **완료(#28)** — `scripts/sync_fuseki.py --watch`: 데이터 변경 또는 Fuseki 인메모리 데이터 소실 시 빌드·교체 적재·개수 대조. 인메모리를 유지했고, TDB2(`--tdb2 --loc .fuseki/db`) 전환은 여전히 사용자 결정(§13 미결).
4. **완료(#15 #16 #17)** — 실록 30·금석문 823·집성 92 Source. 금석문·집성 어댑터와 실록 추출은 공용 본문 추출기를 쓴다. 각 두 번 추출한 바이트·XML 수·운영 SHA256 대조, 뷰어 12/12 통과. 실록 JSONL은 c2에만 두고 규칙표·재현 명령·해시를 Git에 기록했다.
5. **완료(#18)** — 고려사·삼국유사 각 40개, `data/places-candidates-{goryeosa,samgukyusa}.json`. 사료별 좌표 후보로 보존하며 해당 사료를 끄면 표시·근거도 꺼진다. 현대 좌표 대조와 역사 비정의 확실성은 구분한다.
6. **완료(#31)** — 30개 초과 시 `sourceGroup`으로 시간축·왼쪽 목록 묶기·접기. 현재 15묶음, 펼치기·전체/부분 선택·선택 복원·전체 시간 범위·카드 표시를 브라우저에서 검증했다.
7. **단군 완료·평양 보류(#35)** — 한국민족문화대백과사전의 직접 설명을 인용해 壇君/檀君 `sameEntityAs` Claim을 추가했다. 엔티티는 합치지 않는다. 平穰/平壤을 시대를 넘어 같은 장소라고 단정할 직접 근거는 부족해 기존 검색 aliases만 유지한다.
8. **완료(#37)** — 기존 `patchFanMaterial`·`uMaterialize`를 사용한 물질화 연출. 회전·줌 3개 카메라에서 표시 라벨 24개 이하·겹침 0, 선택한 라벨 유지, 사료 전체 해제 시 라벨 0을 확인했다.
9. **조사 기록 완료·정의 확인 미완료(#36)** — 기존 사료와 고순종실록의 날짜·글자를 전수 집계했다. L1과 윤달 표기는 관련이 있지만 공식 정의는 못 찾았다. 1896년 이후 L0도 있어 L만으로 음력 판정하지 않는다. 淲/㴲 웹 대조는 robots로 **NOT_RUN**. 원표기를 고치지 않고 [문의 초안](research/nikh-inquiry-draft.md)을 남겼다(미발송).
10. 라이선스 기관 문의 여부는 사용자 결정(국편 웹은 저작권법 24조의2 학술·개인 한정, 벌크는 데이터셋별 확인 완료).
11. **완료(#38 #39 #40)** — 승정원일기(15064218)·비변사등록(15053636)·고순종실록(15053646). 원문은 Git 밖, 카드·추출기·독립 집계·두 번 실행한 해시·재현 명령은 Git에 있다. 대량 자료 검증 메모리는 #41, 원문 검색과 주장 표시 분리는 #43으로 고쳤다.

기존 열린 이슈는 #8(웹 퍼머링크 3건 대조), #12(기관 문의·북한 자체 서술)이다.
전체 요구 감사 #45에서 누락·후속 작업 #46~#63을 추가했다. [TASKS.md](TASKS.md)를 전체 목록으로 쓴다.
#3 #4 #7 및 #18·#33~#41·#43·#44는 각 초기 범위에서 닫혔으며 제품 전체 완료를 뜻하지 않는다.
평양은 #61, 날짜 공식 정의는 #62로 후속 추적한다. #42의 운영 기록 뒤 이번 범위 정정은 #45다.

## 8. 규칙·함정

- 커밋: 이슈 번호를 제목에, 본문은 다음 사람이 커밋만 읽고 무엇을/왜/검증을 알게. **Co-Authored-By·"Generated with …" 절대 금지**, 귀속(attribution) 줄 없음. author 는 Youkamii.
- 푸시 전 적대 리뷰 1회가 규칙(이번엔 §6 결과가 그것).
- 새 콘솔 창 금지(Start-Process/start/wt). 백그라운드는 `setsid nohup … &`.
- **ssh 한 줄 명령 안에 작은따옴표·`<span` 같은 문자를 넣지 말 것** — 두 번 서버를 죽였다. 패치는 파일로 만들어 scp 후 실행.
- 서버 재시작은 `/tmp/sigong-server.pid`의 PID를 읽고 `/proc/<pid>/cmdline`이 `python3 -u services/host/server.py --port 8870`, `/proc/<pid>/cwd`가 실제 저장소인지 확인한 뒤 그 PID에만 SIGTERM을 보낸다. 재기동 뒤 pid 파일을 갱신하고 API 준비를 확인한다. `pkill -f services/host/server.py`는 ssh 셸도 죽이므로 쓰지 않는다. 감시 명령도 별도 pid 파일과 명령·cwd를 대조한다.
- 국편 사이트(db.history.go.kr, contents.history.go.kr)는 robots.txt 전면 Disallow — 긁지 않는다. 벌크 다운로드는 한 번만(캡차 경로 있음).
- 판톨로지 이식 파일은 건드리지 않는다. 팔레트는 artbible PALETTE 만.
- WebGL 헤드리스 캡처는 `composer.render()` → `toDataURL` (뷰포트 스크린샷은 검게 나옴). gstack /browse 는 WebGL 에서 죽어서 c2 Playwright 하네스로 대체.
- 하위 에이전트 세션 한도: "resets HH:MM"이 뜨면 중간 산출물과 로그를 남기고 해제 뒤 재개한다. 과거 Workflow 기록은 `resumeFromRunId`를 썼다. **현재 조사 호출은 Claude Opus 5 / Max effort**이므로 과거 스크립트의 모델 설정을 그대로 재사용하지 않는다.
- 워크플로 워크트리는 `Map-of-the-Great-East` 저장소의 `origin/main` 에서 갈라진다 — 새 워크플로 전에 거기서 `git fetch origin`.
- 메모리(Claude): `C:\Users\gkfkd\.claude\projects\C--Users-gkfkd-Git-Map-of-the-Great-East\memory\` — `sigong-resume-point.md`, `feedback-verify-and-plain.md`, `feedback-subagent-model-tokens.md`.

## 9. 검증 절차 (이어받는 사람이 처음 할 일)

```bash
ssh lia-c2
cd ~/sigong-yeojido && git pull --ff-only
curl -fsS http://127.0.0.1:8870/api/sources | python3 -c 'import json,sys; s=json.load(sys.stdin)["sources"]; print(len(s), sum(x["chunkCount"] for x in s))'  # 955 2566920
.venv-build/bin/python scripts/verify_viewer.py --url "http://127.0.0.1:8870/?q=low" --out /tmp/verify   # 12/12
python3 services/validate.py                                        # OK
python3 services/build_ttl.py && scripts/fuseki.sh status           # TTL 빌드, Fuseki 상태
scripts/fuseki.sh query 'SELECT (COUNT(*) AS ?n) WHERE {?s ?p ?o}'  # 현재 데이터: 17136
```
PNG 는 `scp lia-c2:/tmp/verify/04-3d.png .` 로 받아 눈으로 본다.
