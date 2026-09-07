# 이슈 #96 · joseon_rulers — 조선 국왕 재위 연표 수집 보고

작업 폴더: `C:\Users\gkfkd\AppData\Local\Temp\sigong-fill-96\joseon_rulers`
수집 일시(UTC): 2026-09-07 14:10 ~ 14:20
수집 방식: 이 폴더의 `fetch.py`(Python 3.12 urllib, 기본 TLS 검증 유지, 요청 간 3초 지연)를 Bash로 직접 실행

## 1. 결과 요약

| 항목 | 수 |
|---|---|
| 배정된 군주 | 27 |
| **재위 구간(`syj:reignedIn`)을 확보한 군주** | **27 / 27** |
| 출생 연도(`syj:bornIn`) | 27 / 27 |
| 사망 연도(`syj:diedIn`) | 27 / 27 |
| `syj:isKingOf` 클레임 | 29 (polity-joseon 27 + polity-daehan-jeguk 2; 고종·순종은 양쪽 보유) |
| `syj:describedAs` | 27 |
| 신규/보강 엔티티 | 28 (인물 27 + 이벤트 1) |
| 전체 클레임 | 140 |
| 소스(발췌 보유) | 28 |
| 실제 내려받은 URL | 31 (robots.txt·sitemap.xml·조선 항목 탐색용 포함) |
| `missing` 항목 | 5 |

재위 구간은 1392년부터 1910년까지 **끊김 없이 연결**된다(각 대의 종료 연도 = 다음 대의 시작 연도).
검증 스크립트 `validate.py` 출력에서 불연속 표시가 하나도 나오지 않았다.

## 2. 준수 사항

* **robots.txt**: `raw/robots.txt`(SHA256 `29d8b0…b48d2`). `User-agent: *` 그룹의 Disallow는
  `/Article/Search`, `/Media/Search`, `/Article/WriterArticles`, `/Article/Hashtag` 뿐이다.
  **사이트 검색은 한 번도 호출하지 않았고**, 표제어 ID는 robots가 허용하는
  `/Article/E0051904`(조선) 및 각 군주 기사 본문의 내부 링크에서만 추출했다.
* User-Agent: `SigongYeojido-ResearchCollector/1.0 (+historical chronology dataset; Python-urllib/3.12; low-volume, robots-respecting)` — 실제 사용한 도구를 그대로 밝힌 값이며 개인 연락처는 넣지 않았다.
* TLS: `ssl.create_default_context()` 기본 검증 그대로. 약화시킨 설정 없음.
* NIKH, KCI/KISS, db.itkc **요청하지 않음**. 기관 연락 없음. 다른 저장소·자격증명 접근 없음.
* 모든 실행은 headless(Bash + python). 창을 띄우는 실행 없음.
* 발췌 예산: **웹페이지당 25 whitespace 단어 이하**를 코드로 강제(최대 20단어, 태조 17 · 순종 20).
* 모든 발췌는 원본 바이트를 HTML 태그 제거만 한 텍스트의 **정확한 연속 부분문자열**임을 `validate.py`가 재확인.
  `~`/`∼`, `·`, `‘ ’`, 괄호 안 한자 등 표기는 원문 그대로 보존.

## 3. 산출 파일 (실제 경로)

* `C:\Users\gkfkd\AppData\Local\Temp\sigong-fill-96\joseon_rulers\result.json` — 최종 데이터(스키마 준수)
* `C:\Users\gkfkd\AppData\Local\Temp\sigong-fill-96\joseon_rulers\manifest.json` — URL / fetched UTC / HTTP status / byte length / SHA256 (robots.txt 포함, 31건)
* `C:\Users\gkfkd\AppData\Local\Temp\sigong-fill-96\joseon_rulers\progress.json` — 소스 단위 진행 기록
* `C:\Users\gkfkd\AppData\Local\Temp\sigong-fill-96\joseon_rulers\report.md` — 이 보고서
* `C:\Users\gkfkd\AppData\Local\Temp\sigong-fill-96\joseon_rulers\raw\` — 원본 바이트 31개(HTML 29 + robots.txt + sitemap.xml)
* 헬퍼(이 폴더 내에서만 작성·실행): `fetch.py`, `strip.py`, `build_result.py`, `emit_result.py`, `validate.py`, `inspect_page.py`, `show_block.py`

## 4. 확보한 재위 연표 (모두 발췌 인용 보유)

| 대 | 군주 | 재위 | 생 | 몰 | 기사 |
|---|---|---|---|---|---|
| 1 | 태조 | 1392–1398 | 1335 | 1408 | E0059033 |
| 2 | 정종 | 1398–1400 | 1357 | 1419 | E0050884 |
| 3 | 태종 | 1400–1418 | 1367 | 1422 | E0059039 |
| 4 | 세종 | 1418–1450 | 1397 | 1450 | E0029857 |
| 5 | 문종 | 1450–1452 | 1414 | 1452 | E0019665 |
| 6 | 단종 | 1452–1455 | 1441 | 1457 | E0013661 |
| 7 | 세조 | 1455–1468 | 1417 | 1468 | E0029849 |
| 8 | 예종 | 1468–1469 | 1450 | 1469 | E0038021 |
| 9 | 성종 | 1469–1494 | 1457 | 1494 | E0029554 |
| 10 | 연산군 | 1494–1506 | 1476 | 1506 | E0036803 |
| 11 | 중종 | 1506–1544 | 1488 | 1544 | E0053932 |
| 12 | 인종 | 1544–1545 | 1515 | 1545 | E0047034 |
| 13 | 명종 | 1545–1567 | 1534 | 1567 | E0018366 |
| 14 | 선조 | 1567–1608 | 1552 | 1608 | E0028912 |
| 15 | 광해군 | 1608–1623 | 1575 | 1641 | E0005335 |
| 16 | 인조 | 1623–1649 | 1595 | 1649 | E0047028 |
| 17 | 효종 | 1649–1659 | 1619 | 1659 | E0065706 |
| 18 | 현종 | 1659–1674 | 1641 | 1674 | E0063418 |
| 19 | 숙종 | 1674–1720 | 1661 | 1720 | E0031837 |
| 20 | 경종 | 1720–1724 | 1688 | 1724 | E0002808 |
| 21 | 영조 | 1724–1776 | 1694 | 1776 | E0037669 |
| 22 | 정조 | 1776–1800 | 1752 | 1800 | E0050867 |
| 23 | 순조 | 1800–1834 | 1790 | 1834 | E0031943 |
| 24 | 헌종 | 1834–1849 | 1827 | 1849 | E0063230 |
| 25 | 철종 | 1849–1863 | 1831 | 1863 | E0056172 |
| 26 | 고종 | 1863–1907 | 1852 | 1919 | E0003939 |
| 27 | 순종 | 1907–1910 (대한제국 황제) | 1874 | 1926 | E0031947 |

재위는 수명과 분리해 기록했다(예: 광해군 재위 1608–1623 / 몰년 1641, 태조 재위 1392–1398 / 몰년 1408,
단종 재위 1452–1455 / 몰년 1457, 고종 재위 1863–1907 / 몰년 1919, 순종 재위 1907–1910 / 몰년 1926).
추론으로 만든 재위 구간은 하나도 없다.

## 5. 대한제국 기간 구분

* 고종: `syj:reignedIn` 1863–1907 은 **조선 제26대 왕** 재위로 기록하고(`syj:isKingOf polity-joseon`),
  “고종은 조선후기 제26대 왕이자 대한제국 제1대 황제이다.” 발췌로 `syj:isKingOf polity-daehan-jeguk`을 별도 클레임으로 추가했다.
* 순종: `syj:reignedIn` 1907–1910 은 “대한제국기 제2대(재위: 1907∼1910) 황제.” 표기에 따라
  **대한제국 황제 재위**로 기록(`syj:isKingOf polity-daehan-jeguk`),
  “주요 경력 조선의 제27대 왕(대한제국의 제2대 황제)” 표기로 `syj:isKingOf polity-joseon`을 따로 붙였다.
* 대한제국 항목(E0015187) 발췌로 1897년 10월 12일 고종의 황제국 선포(기존 이벤트
  `event-encykorea-daehanjeguk-proclaimed-1897`에 `syj:hasParticipant`)와
  1907년 순종 황제 즉위 이벤트(신규 `event-encykorea-sunjong-imperial-accession-1907`)를 추가했다.

## 6. 확보하지 못한 사실 (`result.json`의 `missing` 5건)

1. **고종의 대한제국 황제 재위 구간(1897~1907)을 하나의 명시 구간으로 적은 문장** — E0003939·E0015187 어디에도
   “재위 1897~1907” 형태의 단일 구간 표기가 없다. 1897년 황제국 선포와 1907년 재위 종료는 각각 다른 문장에만
   나오므로, 둘을 합성한 구간은 추론이 되어 기록하지 않았다.
2. **1907년 고종 강제 퇴위의 독립 이벤트** — 발췌가 퇴위 사실은 뒷받침하나 재위 종료 1907년이 이미
   기록되어 있어 중복 이벤트를 만들지 않았다.
3. **양위·즉위 일자(정종·태조 등)** — 페이지당 25단어 예산 안에서 재위·생몰을 우선했고, 양위 날짜는
   별도 문장 발췌가 필요해 이번 범위에서 제외했다.
4. **기존 동명 ID와의 동일인 연결** — 아래 7절. `syj:sameEntityAs`가 허용 술어가 아니어서 클레임으로 만들지 못했다.
5. **출생지 장소 클레임(화령부·한양·해주부·서울 경행방·심양·서울)** — 지침상 인물 위치를 정체에서
   추론하지 않고 명시된 *사건* 장소만 수집 대상이며 새 좌표도 필요 없다고 지정되어 수집하지 않았다.

## 7. ID 처리와 모호성 표시 (사람 검토 필요)

`catalog.json`에는 각 ID의 라벨만 있고 원 소스 레코드가 없어, 라벨만으로 동일성을 확정할 수 없었다.
따라서 **동일 기사 ID가 이미 접미사로 박혀 있어 출처까지 일치하는 3건만 재사용**했다.

* 재사용(검증됨, 동일 기사): `person-encykorea-sejong-e0029857`(E0029857),
  `person-encykorea-seonjo-e0028912`(E0028912), `person-encykorea-gojong-e0003939`(E0003939)
* 신규 생성 24건: 기존 관례인 `person-encykorea-<이름>-e00xxxxx` 형식
* 재사용한 소스 ID: `src-encykorea-taejo-yiseonggye`, `src-encykorea-taejong`, `src-encykorea-sejong`,
  `src-encykorea-seonjo`, `src-encykorea-gojong`, `src-encykorea-daehanjeguk` (모두 URL 동일 확인)

**이름만으로 병합하면 안 되는 후보**(각 엔티티 `note`에 개별 기재):

* 동일인 후보이나 미검증: `person-joseon-taejo`, `person-joseon-sejong`, `person-encykorea-gojong`(광무 항목),
  `ent-wca-taejo`, `ent-wca-taejong`, `ent-wea-sejong`, `ent-wga-sejong`, `ent-wea-munjong`, `ent-wfa-munjong`,
  `ent-wfa-nosangun`(노산군=단종 후보), `ent-wga-sejo`, `ent-wia-seongjong`, `ent-wka-seongjong`,
  `ent-wpa-injo`, `ent-wua-sukjong`, `ent-wua-yeongjo`(라벨이 ‘대왕’이라 특히 위험)
* **동명이인 — 서로 다른 인물**: `person-encykorea-goryeo-taejo`(고려 태조 왕건, E0059032),
  `person-goryeo-myeongjong`(고려 명종), `person-goryeo-hyeonjong`(고려 현종), `person-muyeol`(신라 태종 춘추공)
* **주의**: `ent-wwa-jeongjong`의 라벨은 ‘정종대왕/正宗大王’으로, 조선 제2대 정종(定宗)이 아니라
  제22대 정조(正祖)의 옛 묘호일 수 있다. 이름 유사성만으로 조선 정종에 연결하면 안 된다.
* 1897년 선포 이벤트: `event-encykorea-daehanjeguk-proclaimed-1897`을 라벨 대조만으로 재사용했다.
  카탈로그의 `event-gojong-imperial-enthronement-1897`(환구단 즉위식)과 중복일 수 있어 검토가 필요하다.

## 8. 라이선스

각 기사 페이지 푸터에 “Copyright the Academy of Korean Studies. All Rights Reserved.”가 표기되어 있다
(내려받은 HTML에서 직접 확인). 인용 범위를 넘는 재사용 조건은 이번에 확인하지 않았으므로
각 소스의 `license` 필드에 그대로 적고 “재사용 조건 unverified”로 표시했다.

## 9. 참고

* `raw/E0051904_joseon.html`(조선 항목)과 `raw/sitemap.xml`은 표제어 ID 탐색용으로만 내려받았고
  발췌를 뽑지 않아 `result.json`의 `sources`에는 포함하지 않았다. manifest에는 기록되어 있다.
* `src-encykorea-daehanjeguk`(E0015187)는 기존 데이터셋에도 존재하는 소스 ID다. 이번 작업이 추가한
  발췌는 2건·18단어로 자체 예산 안에 있으나, 다른 수집자의 기존 발췌와 합산하면 페이지 예산을
  넘을 수 있으므로 병합 시 확인이 필요하다.
* 현재 인용 데이터는 AI 초안이며 사람 검수를 거치지 않았다.
