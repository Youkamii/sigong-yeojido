# 이슈 #96 · gap_years 집중 보정 수집 보고서

- 작업 폴더: `C:\Users\gkfkd\AppData\Local\Temp\sigong-fill-96\gap_years`
- 수집 일시(UTC): 2026-09-07 14:43 ~ 14:57
- 다운로드 수행: 이 폴더의 `fetch.py`(Python `urllib`)를 Bash로 직접 실행. 원본 바이트는 `raw/`에 저장, `manifest.json`에 URL·수집 UTC·HTTP 상태·바이트 길이·SHA256 기록(robots.txt 포함, 총 43건).
- User-Agent: `SigongYeojido-DataCollector/1.0 (issue #96 gap_years; Claude Code agent run by [contact omitted]; contact: [contact omitted]) Python-urllib/3.12`
- TLS 설정 변경 없음. 기관 연락 없음. NIKH/KCI/KISS/db.itkc 요청 없음. 다른 과제 산출물 접근·수정 없음.

## 완료 집계

| 항목 | 수 |
|---|---|
| 배정 인물 | 6 |
| 수집 완료 인물 | 6 |
| 소스 카드 | 6 |
| 발췌(excerpt) | 25 |
| 신규 엔터티 | 6 (Person 6) |
| 클레임 | 32 |
| 미확보 사실(missing) | 6 |

발췌는 모두 저장된 원본 HTML을 태그 제거만 한 뒤의 **연속 렌더링 텍스트와 정확히 일치**함을 `build_result.py`가 기계적으로 검증했고(불일치 시 빌드 실패), 페이지당 공백 기준 단어 수는 각각 19 / 24 / 11 / 18 / 9 / 16 으로 25단어 상한 이내다. 시간 객체의 `verbatim`도 해당 발췌의 부분 문자열임을 검증했다.

## 1) year800 공백 보정 — 신라 두 왕 (한국민족문화대백과사전, 한국학중앙연구원)

**소성왕** — `https://encykorea.aks.ac.kr/Article/E0030131` · `raw/encykorea-E0030131-soseongwang.html`
- 재위: `재위: 798년~800년` (항목 '정의') → `claim-soseong-reign` (798~800)
- 재위(본문): `재위 799∼800.` → `claim-soseong-reign-body` (799~800)
- 사망: `사망 연도 800년`, 본문 `재위 2년째인 800년 6월에 죽었다.` → `claim-soseong-died`, `claim-soseong-died-month`
- 출생: **미상**(출처 표기 그대로). 추정하지 않음.
- 소속: `syj:isKingOf` → 기존 `polity-tongil-silla`

**애장왕** — `https://encykorea.aks.ac.kr/Article/E0035230` · `raw/encykorea-E0035230-aejangwang.html`
- 재위: `재위: 800~809` ('내용 요약') → `claim-aejang-reign`
- 즉위: `800년 6월 13세의 어린 나이에 왕위에 올랐다.` → `claim-aejang-accession` (800년 6월)
- 출생 `788(원성왕 4)` / 사망 `809년(애장왕 10) 7월` → `claim-aejang-born`(788), `claim-aejang-died`(809)
- 소속: `syj:isKingOf` → 기존 `polity-tongil-silla`

→ **year800에 사람이 있음이 원문으로 확인됨**: 소성왕은 800년 6월 사망, 애장왕은 같은 800년 6월 즉위(재위 800~809). 두 재위 구간이 800년에서 맞물려 연결된 연대기가 된다.

## 2) 2016–2025 재직 근거 — 대통령 4인 (행정안전부 대통령기록관)

AKS 항목이 아니므로 소스 카드의 `publisher`는 **행정안전부 대통령기록관**으로 표기했고, ID는 `src-presidential-...`을 사용했다. 관계는 `syj:memberOf`(→ `polity-rok`)를 사용하고 `isKingOf`는 쓰지 않았다. 생몰 구간은 만들지 않았고, 현재까지 활동을 연장하지 않았다. **종료된 재임 구간만** 수집했다.

| 인물 | 엔터티 | 재임기간(원문) | 구간 | 종료 확정 |
|---|---|---|---|---|
| 이명박 | `person-presidential-yi-myeongbak` | `재임기간 2008. 2 ~ 2013. 2` | 2008–2013 | 원문 월 단위 종료 |
| 박근혜 | `person-presidential-bak-geunhye` | `재임기간 2013. 2 ~ 2017. 3` | 2013–2017 | `파면 (2017년 3월 10일, 헌법재판소 탄핵결정으로 파면)` |
| 문재인 | `person-presidential-mun-jaein` | `재임기간 2017.5 ~ 2022.5` | 2017–2022 | 원문 월 단위 종료 |
| 윤석열 | `person-presidential-yun-seogyeol` | `재임기간 2022.5 ~ 2025.4` | 2022–2025 | `파면 (2025년 4월 4일, 헌법재판소 탄핵결정으로 파면)` |

윤석열의 **종료 시점(2025.4, 파면 2025년 4월 4일)이 공식 페이지에 공표되어 있어 그대로 수집**했다. 재임 구간은 `syj:activeIn` + `{"kind":"time"}`으로 기록했으며, 출처가 월까지만 공표하므로 `precision`은 `month`(파면 일자는 `day`), `earliest`/`latest`는 연 단위 경계다.

## 미확보 사실 / 판단 근거 (result.json `missing` 6건)

1. **소성왕 출생 연도** — 원문이 `출생 연도 미상`. 추정 금지 원칙에 따라 미기록.
2. **소성왕 재위 시작 연도 불일치** — 같은 항목 안에서 '정의'는 798년~800년, 본문은 `재위 799∼800.`. 어느 한쪽을 임의 선택하지 않고 두 클레임으로 각각 기록하고 상호 참조 note를 달았다. **표시용 기본값으로는 정의문(798~800) 사용을 권장**한다.
3. **애장왕–소성왕 부자 관계** — 해당 문장이 링크로 분절되어 연속 렌더링 텍스트가 아니고, 허용 술어 목록에 친자 관계 술어가 없어 수집하지 않음.
4. **대통령 4인의 AKS 항목 부재** — 사이트 자체 검색 경로 `/Article/Search`는 `robots.txt`에서 `Disallow`이므로 요청하지 않았다(“Respect the site's actual robots groups”). 대신 Wikidata의 `Encyclopedia of Korean Culture ID`(P9475)를 조회했고 네 사람 모두 값이 없었다. 따라서 지시대로 대통령기록관 공식 페이지로 대체했다. *AKS 항목이 "확실히 없다"는 것이 아니라, robots 허용 범위 안에서는 확인할 방법이 없었다는 뜻이다.*
5. **재임기간의 일(day) 단위 시작·종료** — 대통령기록관 약력은 월 단위까지만 공표. 박근혜·윤석열만 파면 일자가 일 단위로 병기됨.
6. **네 명을 함께 담은 재임기간 명부(index/roster) 페이지 없음** — 과제는 "index/roster 페이지 최대 2쪽"을 지시했으나, `www.pa.go.kr` 전체 메뉴에는 '대통령이야기 > 개인별 페이지'만 있고 재임기간을 함께 적은 명부가 없다. 역대 대통령 웹사이트 목록(`/portal/webSite/webHistoryList.do`)과 영문 연혁(`/en/history.html`)을 실제로 받아 확인했으나 재임기간 표기가 없었다. 그래서 **개인별 '약력' 4쪽**(history17~20.jsp)을 사용했다 — 배정 인물 1인당 1쪽이며 추가 명부는 쓰지 않았다. 이 점이 지시와 다른 유일한 부분이다.

## 검토가 필요한 항목 (사람 확인 요망)

- `syj:memberOf → polity-rok` 4건: 인용문은 `제17대 대통령` 등 서수 직위까지만 적고 **`대한민국`이라는 문자열은 약력 페이지에 없다.** 발행 기관이 대한민국 행정안전부 대통령기록관이라는 점에 근거한 귀속이므로 각 클레임 note에 그대로 표시해 두었다.
- 기존 ID 재사용(`polity-tongil-silla`, `polity-rok`)은 **catalog.json의 라벨 대조로만** 확인했다. catalog.json은 id/label/type만 제공하고 원 출처 카드를 포함하지 않으므로 그 이상은 검증하지 못했다. 신규 인물 6명은 catalog.json에 동명 인물이 없었다(`소성`·`애장`·대통령 4인 모두 0건 — 동명 충돌 없음).
- 소성왕 재위 798 vs 799 불일치(위 2번).

## robots 및 라이선스

- `encykorea.aks.ac.kr/robots.txt`(raw/encykorea-robots.txt): `User-agent: *`에 대해 `/Article/Search`, `/Media/Search`, `/Article/WriterArticles`, `/Article/Hashtag` 금지. **금지 경로는 한 번도 요청하지 않았다.** 사용한 경로는 `/Article/E00…`, `/Guide/…`, `/sitemap.xml`, `/`(모두 허용).
- `www.pa.go.kr/robots.txt`: HTTP 200이지만 본문이 `/security/error_service.html` 오류 페이지("요청하신 페이지가 없거나, 서비스가 제한되었습니다")로 반환됨 → 유효한 robots 지시문이 없음(raw/pa-robots.txt에 원본 그대로 저장). 그 상태에서도 요청은 소수의 공개 콘텐츠 페이지로만 제한했다.
- 라이선스(각 소스 카드 `license` 필드에 실제 표기 그대로 기록):
  - AKS: 저작권법 제24조의2 공공저작물 자유이용, 항목 원고 전체 이용 가능, `[출처 : 항목명 - 한국민족문화대백과사전]` 출처 표기 필요 (`/Guide/ContentUse`).
  - 대통령기록관: 페이지 푸터 공공누리 마크 alt `공공누리 공공저작물 자유이용허락 출처표시 변경금지`, 포털 저작권정책상 어느 유형이든 출처 표시 필수 (`/portal/siteInfo/siteInfo04.do`).
  - OpenAPI는 인증키 신청(기관 등록)이 필요해 사용하지 않았다.

## 항목 ID를 찾은 방법 (증거 아님, 경로 확인용)

encykorea 자체 검색이 robots로 금지되어 있어, 표제어→항목 ID 해석에만 외부 조회를 썼다. 두 왕의 항목 ID(E0030131, E0035230)는 Wikidata P9475 값으로 확인했고(`raw/discovery/`), 확인 후 **사실은 전적으로 encykorea 원문에서만** 발췌했다. `raw/probe/`에는 ID 순서 이분 탐색을 시도하다 중단한 무관한 항목 10건이 남아 있다(표제어 표기가 색인 순서와 어긋나 폐기). 이 파일들은 어떤 클레임에도 쓰이지 않았고 manifest에는 투명하게 기록되어 있다.

## 산출 파일

- `result.json` — 소스/엔터티/클레임/미확보 (스키마 준수)
- `progress.json` — 인물별 수집 상태
- `manifest.json` — 전체 다운로드 43건(robots.txt 2건 포함)
- `raw/` — 원본 바이트 (사용 소스 6건 + robots/가이드/탐색 파일)
- `report.md` — 본 보고서
- 헬퍼: `fetch.py`, `strip.py`, `probe.py`, `build_result.py` (이 폴더 안에서만 실행)
