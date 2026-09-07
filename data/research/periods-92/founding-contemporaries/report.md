# 이슈 #92 · founding-contemporaries 수집 보고서

- 작업 폴더: `C:\Users\gkfkd\AppData\Local\Temp\sigong-period-research-92\founding-contemporaries`
- 수집 일시(UTC): 2026-09-07 01:43 ~ 01:46
- 출처: 한국민족문화대백과사전(https://encykorea.aks.ac.kr) 단일 출판물, 발행 `한국학중앙연구원`
- 다운로드 방식: 이 폴더의 `fetch.py`(Python 3.12 urllib, 기본 TLS 검증 유지, 요청 간 3초 간격)
  - User-Agent: `SigongYeojido-research/0.1 (issue-92 dataset collection; contact dfne.pms@gmail.com) Python-urllib/3.12`
- robots: `raw/robots.txt` 수집·확인. `User-agent: *` 그룹의 Disallow는
  `/Article/Search`, `/Media/Search`, `/Article/WriterArticles`, `/Article/Hashtag`뿐이며
  실제 요청은 모두 허용 경로인 `/Article/E00…`. 사이트 내부 검색은 요청하지 않았고,
  항목 ID는 외부 검색으로만 확인한 뒤 직접 내려받음. NIKH·KCI/KISS·db.itkc 미요청.

## 완료 수량

| 항목 | 수 |
| --- | --- |
| 실제 다운로드 페이지 | 9 (+ robots.txt) — 모두 HTTP 200 |
| 신규 source | 9 (기존 `sources.json`과 ID·URL 중복 없음) |
| 생몰년(출생+사망 모두) 확보 인물 | 8 / 8 |
| 이벤트 엔티티 | 5 (신규 3 + 기존 2에 관계·장소 추가) |
| 연도 부여된 신규 이벤트(`syj:occurredIn`) | 3 |
| 장소 엔티티 | 4 (좌표 없음) |
| claims | 52 (bornIn 8, diedIn 8, describedAs 8, hasParticipant 8, activeIn 6, tookPlaceAt 4, occurredIn 3, memberOf 3, reignedIn 2, isKingOf 2) |
| missing 항목 | 7 |

인용 예산: 페이지당 최대 25단어 준수 — 24/25/23/25/21/24/24/22/24 (`progress.json`의 `quotedWordsPerPage`).

## 인물 (배정 8명 전원)

| 인물 | 엔티티 ID | 생 | 몰 | 1392/1919 연결 |
| --- | --- | --- | --- | --- |
| 이방원(태종) | `ent-wca-taejong` (기존 재사용) | 1367 | 1422 | 재위 1400~1418, 조선개국 참여(관련 사건 필드), 1392 활동, 정몽주 피살 관련 |
| 정몽주 | `person-encykorea-jeong-mongju` (신규) | 1337 | 1392 | 1392 선죽교 피살 |
| 하륜 | `ent-wca-ha-ryun` (기존 재사용) | 1347 | 1416 | 1391 활동, 건국 직후 조선 관직(memberOf 조선) |
| 공양왕 | `person-goryeo-gongyangwang` (기존 재사용) | 1345 | 1394 | 재위 1389~1392, 고려 국왕, 조선 건국 관련 |
| 안창호 | `person-encykorea-an-changho` (신규) | 1878 | 1938 | 1919 활동, 상해임시정부 내무총장 |
| 한용운 | `person-encykorea-han-yongun` (신규) | 1879 | 1944 | 1919 활동, 3·1운동 참여(양쪽 항목에서 확인) |
| 손병희 | `person-encykorea-son-byeonghui` (신규) | 1861 | 1922 | 3·1운동 주동체, 1919-02-27 독립선언문 인쇄 |
| 이승만 | `person-encykorea-yi-seungman` (신규) | 1875 | 1965 | 1919 활동, 임시정부 임시 대통령 추대(1919-09-06) |

## 이벤트와 연결

- `event-jeong-mongju-killed-1392` (신규): 1392, 장소 `place-seonjukgyo`, 참여 정몽주·이방원
- `event-samil-movement-1919` (신규): 1919-03-01, 장소 `place-taehwagwan`, 참여 한용운·손병희,
  「중국 상하이에서의 대한민국임시정부 수립으로 이어졌다」 인용으로 임시정부와 연결
- `event-declaration-printing-1919` (신규): 1919-02-27, 장소 `place-bosungsa`, 참여 손병희
- `event-joseon-founding-1392` (기존): 참여자 이방원·공양왕 추가
- `event-kpg-establishment-1919` (기존): 수립 장소 `place-shanghai` 추가

## 확인 필요 · 모호성 플래그 (사람 검토 대상)

1. **기존 ID 재사용**: `ent-wca-taejong`, `ent-wca-ha-ryun`, `person-goryeo-gongyangwang`은
   카탈로그의 명칭·한자 일치를 근거로 동일 인물로 보고 재사용했으며, 자동 동일시가 아님.
   각 인물의 첫 claim `note`에 동일 취지를 기록.
2. **동명 주의**: 카탈로그에는 신라 `person-muyeol`(태종 춘추공)이 별도로 있으며 조선 태종과 다른 인물.
3. **3·1운동 vs 기존 `event-samil-declaration`(3·1 독립선언서)**: 운동 자체와 선언서 문서는 다른 개체로 보아
   신규 `event-samil-movement-1919`를 만들었음. 두 개체의 관계 설정은 사람 판단 필요.
4. **`claim-jmkill-taejong`**: 발췌는 「이방원의 문객 조영규(趙英珪) 등에게 살해되었다」로, 이방원 본인의
   실행이 아니라 문객에 의한 살해 서술. participant로 기록하되 note에 근거를 명시.
5. **`claim-joseonfounding-part-taejong` / `-gongyang`**: 근거가 본문 서술이 아니라 기본정보표 '관련 사건'
   필드(조선개국 / 조선 건국)임.
6. **`claim-print-part-sonbyeonghui`**: 해당 문장은 손병희 항목 생애 서술 안에 있으나 주어가 생략되어 있음.
7. 라이선스는 `unverified`로 기록(항목 푸터의 "Copyright the Academy of Korean Studies. All Rights Reserved."
   외 본문 재사용 조건 미확인). 일부 미디어에만 공공누리 표기가 있으나 미디어는 수집하지 않음.

## 미수집 사실 (result.json `missing`)

1. `miss-haryun-1392` — 하륜 항목 본문에 '1392' 문자열 자체가 없어 건국 당해 연도 활동 인용 불가. 1391년 활동과 "조선이 건국되자" 임명만 수집.
2. `miss-gongyang-deposition-date` — 공양왕 폐위(1392년 7월, 원주 추방) 서술은 항목에 있으나 페이지당 25단어 상한으로 미인용. 재위 종료 1392만 확보.
3. `miss-taejong-jeongmongju-direct` — 태종 항목의 "이방원이 조영규 등을 시켜 정몽주를 격살" 직접 서술도 단어 상한으로 미인용, 정몽주 항목 인용으로 대체.
4. `miss-anchangho-samil` — 안창호 항목은 "3 · 1운동 직후"로만 서술 → 3·1운동 참여 claim 없음.
5. `miss-yiseungman-samil` — 이승만 항목에 3·1운동 참여 명시 없음 → 임시정부 직책만 수집.
6. `miss-birth-death-month-day` — 태종·정몽주·공양왕·안창호·손병희·이승만은 기본정보표가 생몰 '연도'만 제공(하륜·한용운만 월일 포함). 월일 추정하지 않음.
7. `miss-place-coordinates` — 지시대로 새 좌표 미수집. 장소는 본문 명시 명칭만 기록.

## 산출물 / 재현

- `result.json`, `progress.json`, `manifest.json`, `raw/` (원본 바이트 9개 + robots.txt)
- 헬퍼: `fetch.py`(다운로드), `canon.py`(태그 제거 규칙), `strip.py`(열람), `build.py`(생성), `verify.py`(검증)
- 발췌 규칙(`canon.py`): script/style·주석 제거 → 태그를 공백 1개로 치환 → 엔티티 언이스케이프 → 공백 연속 1개로 축약.
  모든 발췌는 이 규칙으로 만든 텍스트의 정확한 부분 문자열임.
- 검증: `python verify.py` → 모든 발췌 일치, sha256 일치, 페이지당 단어 상한 준수, 미선언 엔티티/잘못된 인용 없음 (`PROBLEMS: none`).
