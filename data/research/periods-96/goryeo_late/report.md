# 이슈 #96 · goryeo_late (1170–1392) 수집 보고서

- 작업 폴더: `C:\Users\gkfkd\AppData\Local\Temp\sigong-fill-96\goryeo_late`
- 생성 시각(UTC): 2026-09-07T14:38:59Z
- 단일 출처: 한국민족문화대백과사전(한국학중앙연구원) https://encykorea.aks.ac.kr — 다른 출판물은 사용하지 않음
- 이용 조건(사전 페이지 고지 그대로): "한국민족문화대백과사전은 공공저작물로서 공공누리 제도에 따라 이용 가능합니다.",
  "백과사전 내용 중 글을 인용하고자 할 때는 '[출처 : 항목명 - 한국민족문화대백과사전]'과 같이 출처 표기를 하여야 합니다."
  공공누리 유형 번호는 항목 페이지에 표기되어 있지 않아 result.json의 `license` 필드에 그 사실을 그대로 적었다.

## 1. 실제 다운로드

- 다운로더: 이 폴더의 `fetch.py` (Bash에서 실행한 Python `urllib`). TLS 기본 검증을 그대로 사용했고 약화시키지 않음.
- User-Agent(사실 그대로): `SigongYeojido-Collector/0.1 (research data collection for Sigong Yeojido issue 96; Python-urllib/3.12)`
- 요청 간 3초 간격, 완전 헤드리스, 새 창 없음.
- **robots.txt 준수**: `raw/robots.txt`는 `/Article/Search`, `/Media/Search`, `/Article/WriterArticles`,
  `/Article/Hashtag`를 금지한다. 이 경로들은 한 번도 요청하지 않았고, 허용된 `/Article/E0xxxxxx`와 `/sitemap.xml`만 사용했다.
  항목 ID는 (a) 웹 검색 결과와 (b) 이미 내려받은 항목 안에 렌더링된 «관련 항목» 링크에서 확인했다.
- NIKH / KCI / KISS / db.itkc: 요청하지 않음. 기관 연락 없음. 자격증명·다른 저장소 접근 없음. 애플리케이션 코드·git 미변경.

| 구분 | 건수 |
|---|---|
| manifest.json 총 기록 | 39 |
| HTTP 200 (원본 바이트를 raw/에 저장) | 37 |
| HTTP 404 (경로 탐색 중 실패 — 정직하게 기록, 사용 안 함) | 2 |
| SHA256·바이트 길이 재검증 불일치 | 0 |

404로 기록된 경로(현재 사이트에 없음): `/Article/Keyword/%EC%A0%95%EC%A4%91%EB%B6%80`, `/Article/List/Field/%EC%97%AD%EC%82%AC%3E%EA%B3%A0%EB%A0%A4%EC%8B%9C%EB%8C%80%EC%82%AC/%EC%A0%84%EC%B2%B4?p=1`

## 2. 결과 요약

| 항목 | 수 |
|---|---|
| sources (실제 수집한 사전 항목 페이지) | 35 |
| excerpts (태그 제거만 한 렌더링 텍스트와 정확히 일치 확인) | 109 |
| entities | 45 (Person 23 · Event 15 · Polity 3 · Place 4) |
| claims | 157 |
| missing | 9 |

술어별 클레임 수: `syj:activeIn` 13, `syj:bornIn` 19, `syj:describedAs` 42, `syj:diedIn` 22, `syj:hasParticipant` 12, `syj:isKingOf` 12, `syj:occurredIn` 16, `syj:reignedIn` 15, `syj:tookPlaceAt` 6

페이지당 발췌 단어 예산(25단어) 준수: 최대 25단어, 초과 0건.

발췌는 원본 코드포인트를 그대로 보존한다. 예를 들어 삼별초항쟁 정의의 麗·聯은 사전 원문이 CJK 호환 한자
(U+F988, U+F997)를 쓰고 있어 통합 한자로 바꾸지 않고 그대로 저장했다(`repair.py`가 이를 원본 바이트에서 복원).

## 3. 배정 인물 23명 — 전원 완료

| 인물 | 엔티티 ID | 출생 | 사망 | 재위 | 활동 연도 |
|---|---|---|---|---|---|
| 명종 | `person-encykorea-myeongjong` | 1131 | 1202 | 1170~1197 | — |
| 신종 | `person-encykorea-sinjong` | 1144 | 1204 | 1197~1204 | — |
| 희종 | `person-encykorea-huijong` | 1181 | 1237 | 1204~1211 | — |
| 강종 | `person-encykorea-gangjong` | 1152 | 1213 | 1211~1213 | — |
| 고종 | `person-encykorea-goryeo-gojong` | 1192 | 1259 | 1213~1259 | — |
| 원종 | `person-encykorea-wonjong` | 1219 | 1274 | 1259~1274 | — |
| 충렬왕 | `person-encykorea-chungnyeol` | 1236 | 1308 | 1274~1308 | — |
| 충선왕 | `person-encykorea-chungseon` | 1275 | 1325 | 1298~1298, 1308~1313 | — |
| 충숙왕 | `person-encykorea-chungsuk` | 1294 | 1339 | 1313~1330, 1332~1339 | — |
| 충혜왕 | `person-encykorea-chunghye` | 1315 | 1344 | 1330~1332, 1339~1344 | — |
| 충목왕 | `person-encykorea-chungmok` | 1337 | 1348 | 1344~1348 | — |
| 충정왕 | `person-encykorea-chungjeong` | 1338 | 1352 | 1348~1351 | — |
| 정중부 | `person-encykorea-jeongjungbu` | 1106 | 1179 | — | — |
| 이의방 | `person-encykorea-yiuibang` | — | 1174 | — | 1170 |
| 이의민 | `person-encykorea-yiuimin` | — | 1196 | — | — |
| 최충헌 | `person-encykorea-choechungheon` | 1149 | 1219 | — | 1196 |
| 최우 | `person-encykorea-choeu` | — | 1249 | — | 1219 |
| 김윤후 | `person-encykorea-gimyunhu` | — | — | — | 1253, 1232 |
| 김방경 | `person-encykorea-gimbanggyeong` | 1212 | 1300 | — | 1270 |
| 일연 | `person-encykorea-iryeon` | 1206 | 1289 | — | 1277, 1283 |
| 이규보 | `person-encykorea-yigyubo` | 1168 | 1241 | — | 1217 |
| 이제현 | `person-encykorea-yijehyeon` | 1287 | 1367 | — | 1314 |
| 문익점 | `person-encykorea-munikjeom` | 1329 | 1398 | — | 1363 |

- 재위는 생존 기간과 분리해 `syj:reignedIn` TimeSpan으로만 기록했고, 생몰년은 `syj:bornIn`/`syj:diedIn`으로 따로 기록했다.
- 복위한 왕(충선왕·충숙왕·충혜왕)은 재위 구간을 TimeSpan 2개로 나눠 기록했다.
- 사전이 "미상"이라고 적은 생몰년(이의방·이의민·최우 출생, 김윤후 생몰)은 추정하지 않고 `missing`에 근거 발췌와 함께 남겼다.
- 인물의 위치는 소속 정권에서 추론하지 않았고, 장소는 사건 항목에 명시된 것만 수집했다.

## 4. 연결된 사건 · 정권 · 장소

| 라벨 | ID | 타입 | 연도 / @장소 / +참여자 |
|---|---|---|---|
| 무신정변(무신란) 1170 | `event-encykorea-musinjeongbyeon` | Event | 1170, +정중부, +이의방, +이의민 |
| 만적의 난 1198 | `event-encykorea-manjeok-rebellion` | Event | 1198, @개경 |
| 구주성전투 (몽고 제1차 침략, 1231) | `event-encykorea-gujuseong-battle` | Event | 1231, @구주성(龜州城) |
| 강화천도 1232 | `event-encykorea-ganghwa-cheondo` | Event | 1232, @강화도, +최우 |
| 처인성전투 (몽골 제2차 침입, 1232) | `event-encykorea-cheoinseong-battle` | Event | 1232, @처인성, +김윤후 |
| 대장도감 설치 1236 | `event-encykorea-daejangdogam-1236` | Event | 1236, +고종 |
| 해인사 대장경(팔만대장경) 완성 1251 | `event-encykorea-palman-daejanggyeong-1251` | Event | 1251, +최우 |
| 삼별초항쟁 1270~1273 | `event-encykorea-sambyeolcho-hangjaeng` | Event | 1270, +김방경, 1273 |
| 개경 환도 1270 | `event-encykorea-gaegyeong-hwando-1270` | Event | 1270, @개경 |
| 일본원정 (여원연합군, 1274·1281) | `event-encykorea-ilbon-wonjeong` | Event | 1274, 1281, +김방경 |
| 홍건적의 고려 침입 1359 | `event-encykorea-hongeonjeok-1359` | Event | 1359 |
| 홍건적의 고려 재침입 1361 (개경 함락) | `event-encykorea-hongeonjeok-1361` | Event | 1361, @개경 |
| 문익점의 목화 종자 반입 1363 | `event-encykorea-mokhwa-doip-1363` | Event | 1363, +문익점 |
| 원간섭기 1259~1356 | `event-encykorea-won-ganseopgi` | Event | 1259~1356 |
| 성리학(주자학) 도입 (연도 미상) | `event-encykorea-seongnihak-doip` | Event | 연도 미상 |
| 무신정권 1170~1270 | `polity-encykorea-musin-jeonggwon` | Polity | 1170~1270 |
| 삼별초 (군사 조직) | `polity-encykorea-sambyeolcho` | Polity | 1273 |
| 홍건적 (원말 한족 반란군) | `polity-encykorea-hongeonjeok` | Polity | 연도 미상 |

요구된 8~12개 대비 연도가 붙은 사건 14개를 수집했다(무신정변, 만적의 난, 구주성전투=몽고 1차 침략,
강화천도, 처인성전투, 대장도감 설치, 팔만대장경 완성, 삼별초항쟁, 개경 환도, 일본원정, 홍건적 1359·1361,
목화 종자 반입, 원간섭기). 성리학 도입만 연도가 없다(6절).

## 5. 1200년·1300년 커버리지 (요구 사항)

- **1200년**: 생존 7명 — 명종(1131~1202), 신종(1144~1204, 재위 1197~1204), 희종(1181~1237), 강종(1152~1213),
  고종(1192~1259), 최충헌(1149~1219), 이규보(1168~1241). 재위: 신종. 진행 중 기간: 무신정권(1170~1270).
- **1300년**: 생존 5명 — 충렬왕(1236~1308, 재위 1274~1308), 충선왕(1275~1325), 충숙왕(1294~1339),
  김방경(1212~1300), 이제현(1287~1367). 재위: 충렬왕. 진행 중 기간: 원간섭기(1259~1356).
- 1175·1235·1270·1330년에도 생존/재위 인물이 채워진다(`verify.py` 출력으로 확인).

## 6. 누락 사실 (`missing`)

- **이의방 출생 연도** — 이의방 항목 인물 정보 표가 "출생 연도미상"으로 표기. (근거 발췌 `ex-yiuibang-birth`)
- **이의민 출생 연도** — 이의민 항목 인물 정보 표가 "출생 연도미상"으로 표기. (근거 발췌 `ex-yiuimin-birth`)
- **최우 출생 연도** — 최우 항목 인물 정보 표가 "출생 연도미상"으로 표기. (근거 발췌 `ex-choeu-birth`)
- **김윤후 사망 연도** — 인물 정보 표가 "사망 연도미상"으로 표기. 생몰년 대신 활동 연도 1232·1253만 수집. (근거 발췌 `ex-gimyunhu-death`)
- **김윤후 출생 연도** — 인물 정보 표가 "출생 연도미상"으로 표기(사망 연도와 별도 근거). (근거 발췌 `ex-gimyunhu-birth`)
- **삼별초 설치(창설) 연도** — 삼별초 항목이 "삼별초의 정확한 설치연대는 알 수 없으나,"라고 명시. (근거 발췌 `ex-sambyeolcho-nodate`)
- **성리학(주자학) 도입 연도** — 성리학 항목이 "충렬왕 때(13세기 후반)로 추정된다"라고만 서술하여 명시 연도 없음. 연도 클레임 미생성. (근거 발췌 `ex-seongnihak-intro`)
- **정중부·이의민의 집권 개시 연도(각 인물 항목 기준)** — 페이지당 25단어 발췌 예산 안에서 각 인물 항목의 집권 개시 문장을 함께 담지 못함. 무신정변(1170)·무신정권(1170~1270) 항목으로 대체 연결.
- **홍건적 침입과 기존 최영·공민왕 엔티티의 직접 연결** — 홍건적 항목 본문에 공민왕 파천·최영의 흥왕사의 난 진압 서술이 있으나 25단어/페이지 예산을 초과하여 발췌하지 않음. person-encykorea-choeyeong / person-encykorea-gongmin 연결 클레임 미수집.

## 7. 동일성 · 재사용 플래그 (사람 검토 필요)

- 기존 카탈로그에 같은 이름의 ID가 있으나(`person-goryeo-myeongjong`, `person-goryeo-wonjong`,
  `person-jeongjungbu`, `person-choechungheon`) **자동으로 동일 인물로 보지 않았다**. 이 작업 폴더에서는 그 ID들의
  원 출처를 확인할 수 없어 라벨만으로 병합할 수 없으므로, 사전 항목에 근거한 별도 `person-encykorea-*` ID를 만들고
  각 클레임 note에 "동일성 미검증"을 명시했다. 병합 여부는 사람이 판단해야 한다.
- 특히 기존 `person-encykorea-gojong-e0003939`는 **다른 항목(E0003939)**이다. 이번에 수집한 고려 제23대 고종은
  **E0003938**이며 서로 다른 인물이다.
- 기존 ID 중에서는 `polity-goryeo`(라벨 "고려")만 재사용했다. 라벨이 정확히 일치하고 후보가 하나뿐이지만 원 출처를
  확인하지 못했으므로 모든 `syj:isKingOf` 클레임 note에 그 한계를 적어 두었다.
- 스키마 타입이 Person/Event/Polity/Place 4종뿐이라 무신정권·삼별초·홍건적은 Polity로, 원간섭기는 Event로 근사
  분류했고 각 note에 근사 분류임을 적었다.
- 현재 인용 데이터는 AI 초안이며 사람 검토를 거치지 않았다.

## 8. 파일 경로

- `C:\Users\gkfkd\AppData\Local\Temp\sigong-fill-96\goryeo_late\result.json`
- `C:\Users\gkfkd\AppData\Local\Temp\sigong-fill-96\goryeo_late\progress.json`
- `C:\Users\gkfkd\AppData\Local\Temp\sigong-fill-96\goryeo_late\manifest.json`
- `C:\Users\gkfkd\AppData\Local\Temp\sigong-fill-96\goryeo_late\report.md`
- `C:\Users\gkfkd\AppData\Local\Temp\sigong-fill-96\goryeo_late\excerpts.json`
- `C:\Users\gkfkd\AppData\Local\Temp\sigong-fill-96\goryeo_late\fetch.py`
- `C:\Users\gkfkd\AppData\Local\Temp\sigong-fill-96\goryeo_late\build.py`
- `C:\Users\gkfkd\AppData\Local\Temp\sigong-fill-96\goryeo_late\strip.py`
- `C:\Users\gkfkd\AppData\Local\Temp\sigong-fill-96\goryeo_late\verify.py`
- `C:\Users\gkfkd\AppData\Local\Temp\sigong-fill-96\goryeo_late\repair.py`
- `C:\Users\gkfkd\AppData\Local\Temp\sigong-fill-96\goryeo_late\raw\ (robots.txt + sitemap.xml + 항목 HTML 원본)`

원본 HTML 바이트는 모두 `raw/`에 있고, `manifest.json`의 URL·수집 UTC 시각·HTTP 상태·바이트 길이·SHA256이
재계산 값과 전부 일치한다(`verify.py`).
