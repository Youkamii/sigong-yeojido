# 시공여지도 #92 — 고대·중세(약 350–1392) 수집 보고

- 작업 폴더: `C:\Users\gkfkd\AppData\Local\Temp\sigong-period-research-92\ancient-medieval`
- 수집 일시(UTC): 2026-09-07T01:22Z ~ 01:26Z
- 출처: 한국민족문화대백과사전 (https://encykorea.aks.ac.kr), 발행 한국학중앙연구원 — **단일 출처만 사용**
- 다운로드 방식: 이 폴더의 `fetch.py` (Python 3.12 urllib, `ssl.create_default_context()` 기본 검증, TLS 완화 없음)
- User-Agent: `SigongYeojidoResearchBot/1.0 (non-commercial historical data collection; Python-urllib/3.12)`
- 요청 간격 3초, 총 12건 요청(robots.txt·sitemap.xml 포함), 전부 HTTP 200

## robots.txt 준수

`raw/robots.txt` (실제 다운로드본, 182바이트):

```
User-agent: *
Disallow: /Article/Search
Disallow: /Media/Search
Disallow: /Article/WriterArticles
Disallow: /Article/Hashtag

Sitemap: https://encykorea.aks.ac.kr/sitemap.xml
```

- 금지된 4개 경로는 **한 번도 요청하지 않았음**. 항목 ID 탐색은 (a) 기존 `sources.json`에 이미 있던 ID와
  (b) 외부 웹 검색 결과(사이트 무부하)로 해결했고, 실제 요청은 허용된 `/Article/E…`와 robots가 스스로
  광고하는 `sitemap.xml`뿐임.
- NIKH, KCI/KISS, db.itkc: 요청하지 않음. 기관 연락: 하지 않음.

## 완료 수량

| 항목 | 수 |
|---|---|
| 실제 수집 소스(웹페이지) | 10 |
| 원본 HTML 저장 | `raw/` 10개 + robots.txt + sitemap.xml |
| 발췌(excerpt) | 49개, 총 187단어 (페이지당 최대 24단어 ≤ 한도 25) |
| 엔티티 | 23 (Person 9, Event 5, Polity 6, Place 3) |
| 클레임 | 63 |
| missing 기록 | 9 |

### 인물 8명 — 전원 생몰 또는 명시적 활동 구간 확보 (목표 6–8 충족)

| 인물 | 엔티티 ID | 생 | 몰 | 재위/활동 | 소스 |
|---|---|---|---|---|---|
| 광개토왕 | `person-encykorea-gwanggaeto` (신규) | 374 | 412~413 (양립 병기) | 391~413 및 391~412 (항목 내 불일치, 둘 다 보존) | E0005057 |
| 장수왕 | `person-encykorea-jangsu` (신규) | 394 | 491 | 413~490 및 413~491 (항목 내 불일치, 둘 다 보존) | E0048605 |
| 진흥왕 | `person-encykorea-jinheung` (기존 재사용) | 526~534 (병기) | 576 | 540~576 | E0055013 |
| 문무왕 | `person-encykorea-munmu` (기존 재사용) | **미상** | 681 | 재위 661~681 | E0019473 |
| 대조영 | `person-encykorea-daejoyeong` (기존 재사용) | **미상** | 719 | 재위 698~719 | E0003841 (표제어 '고왕') |
| 왕건 | `person-encykorea-goryeo-taejo` (신규) | 877 | 943 | 918~943 | E0059032 (표제어 '태조') |
| 공민왕 | `person-encykorea-gongmin` (신규) | 1330 | 1374 | 1351~1374 | E0004295 |
| 최영 | `person-encykorea-choeyeong` (신규) | 1316 | 1388 | 1388 문하시중 (activeIn) | E0057469 |

부수적으로 `person-encykorea-yi-seonggye`(기존 ID)를 위화도회군 참가자로 인용했다.

### 사건 5건 — 전부 연도 확보 (목표 4–6 충족)

| 사건 | 엔티티 ID | 연도 근거 | 장소 | 인물/국가 연결 |
|---|---|---|---|---|
| 평양(성) 천도 | `event-pyongyang-transfer-427` | 427 — 장수왕 항목 | `place-pyongyangseong` | 장수왕 |
| 발해 건국 | `event-balhae-founding-698` | 698 — 고왕 항목 | 없음(발췌 내 미표기) | 대조영 |
| 고려 건국 | `event-goryeo-founding-918` | 918 — 태조 항목 | `place-cheorwon-pojeongjeon` | 왕건 |
| 후삼국 통일 | `event-husamguk-unification-936` | 936 — '종결 시기' | 없음(항목 내 미표기) | 왕건 / 고려·신라·후백제 |
| 위화도회군 | `event-wihwado-hoegun-1388` | 1388 — '정의' | `place-wihwado` | 이성계, 최영 |

인물↔사건 인용 링크 9건(`syj:hasParticipant`), 인물↔국가 7건(`syj:isKingOf`), 장소 3건(`syj:tookPlaceAt`).
추가로 광개토왕→장수왕(장자), 최영→공민왕, 최영→위화도회군을 `syj:describedAs`로 보존했다(현행 술어
목록에 친자·진압 같은 관계 술어가 없음).

## 확보하지 못한 사실 (result.json `missing`)

1. **문무왕 출생 연도** — 사전이 '출생 연도미상'으로 표기. 추정하지 않음.
2. **대조영 출생 연도** — 사전이 '출생 연도미상'으로 표기. 추정하지 않음.
3. **최영 재위** — 왕이 아니므로 재위 구간 없음. 1388년 문하시중 재직만 명시 확인.
4. **후삼국 통일 장소** — 항목에 사건 장소 표기 없음. 국가 소속으로부터 장소를 추론하지 않음.
5. **발해 건국 장소** — 인용한 문장에 장소 없음. 항목 본문에 동모산(東牟山) 축성 서술이 있으나
   페이지당 25단어 한도 안에서 인용하지 못함(다음 라운드 후보).
6. **광개토왕 단일 몰년** — 412년(광개토왕릉비) / 413년(삼국사기) 병기. 하나로 확정하지 않고 412~413 보존.
7. **진흥왕 단일 출생 연도** — '534년(526년)' 병기. 526~534 보존.
8. **광개토왕 단일 재위** — 같은 항목의 '정의'(391년~413년)와 '개설'(391∼412)이 불일치. 둘 다 보존.
9. **장수왕 단일 재위** — '정의'(413년~490년)와 '개설'(413∼491)이 불일치. 둘 다 보존.

## 동일인 판정 주의 (자동 병합 금지)

- `person-encykorea-goryeo-taejo`(고려 태조 왕건)는 카탈로그의 `person-joseon-taejo`,
  `ent-wca-taejo`, `person-encykorea-yi-seonggye`와 **동명이인이 아니라 서로 다른 인물**임. 병합 금지.
- `person-encykorea-gwanggaeto` ↔ 기존 `person-gwanggaeto`(광개토왕릉비 계열): 동일 인물일 가능성이
  높으나 출처 계열이 달라 자동 병합하지 않음. 사람 검토 필요.
- `person-encykorea-gongmin` ↔ 기존 `person-goryeo-gongminwang`: 위와 같음.
- `person-encykorea-daejoyeong`(기존 ID 재사용): 이번 소스의 표제어는 '고왕'이며, 본문
  '본명은 대조영(大祚榮)이다.'를 연결 근거로 인용했다. 기존 항목은 '발해'(E0021626) 기반이므로 검토 권장.
- `polity-tongil-silla`(신규): 문무왕 항목의 '정의'가 쓰는 명칭. 기존 `polity-silla`와의 동일성/승계
  관계는 발췌만으로 판정 불가.
- `place-pyongyangseong`(신규): `sources.json`의 `src-encykorea-pyongyangseong`(평양성 E0059975)과
  같은 대상인지 미확인. 좌표는 수집하지 않음(3개 Place 모두 좌표 없음).

## 기존 ID 재사용 정책 (병합 시 주의)

`src-encykorea-jinheung`, `src-encykorea-munmu`는 `sources.json`에 이미 있는 ID이며 **URL이 완전히
동일**하여 그대로 재사용했다. 병합할 때는 excerpts를 **덮어쓰지 말고 합집합으로** 처리할 것.
나머지 8개 소스 ID는 신규다.

## 라이선스

각 항목 하단 고지 그대로: 「한국민족문화대백과사전은 공공저작물로서 공공누리 제도에 따라 이용
가능합니다.」 + 인용 시 '[출처 : 항목명 - 한국민족문화대백과사전]' 표기 의무. 공공누리 **유형 번호는
본문에 표기되어 있지 않아 미확인**으로 기록했다. (미디어 자료는 개별 표시 확인 필요 — 이번 수집은
본문 텍스트만 사용.)

## 검증

`verify.py`가 result.json을 raw 바이트로부터 독립 재검증한다(실행 결과 FAILURES: none):

- 모든 발췌가 `strip_html(raw)`의 **정확한 부분 문자열**임 (HTML 태그 제거 + 엔티티 해제만 수행;
  호환 한자·문장부호·`∼`/`~`·`｢｣`·`|` 구분자 원형 유지)
- 저장된 sha256 = 디스크 파일 sha256 = manifest.json 값, HTTP 200
- 모든 `time` 객체의 `verbatim`이 인용 발췌의 부분 문자열
- 모든 claim의 subject/object 엔티티와 citesExcerpt가 실재하고, 술어가 허용 목록 안에 있음
- 페이지당 발췌 단어 수 ≤ 25, 고아 엔티티 없음

## 데이터 성격

현행 인용 데이터는 AI 초안이며 사람 검토를 거치지 않았다. 특히 위 '동일인 판정 주의'와
'단일 값 확정 불가' 항목은 반드시 검토 대상이다.

## 산출물

| 경로 | 내용 |
|---|---|
| `result.json` | 스키마 결과물 (sources/entities/claims/missing) |
| `manifest.json` | 12건 요청의 URL·UTC·HTTP status·byte length·SHA256 |
| `progress.json` | 진행 상태 (소스별 증분 저장) |
| `raw/` | 원본 HTML 10개 + `robots.txt` + `sitemap.xml` (수정 없는 원본 바이트) |
| `txt/` | 태그만 제거한 대조용 텍스트 (검증 편의용, 파생물) |
| `fetch.py` `strip.py` `build_result.py` `verify.py` `infobox.py` `peek.py` | 이 폴더 내 수집·검증 헬퍼 |
