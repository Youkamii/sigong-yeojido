# 이슈 #96 · three_kingdoms_late (400–935) 수집 보고

- 수집자: Claude Opus 5 (claude-opus-5), 이 작업 폴더 안에서 직접 다운로드·추출
- 출처: 한국민족문화대백과사전 (https://encykorea.aks.ac.kr), 발행 한국학중앙연구원 — **단일 출처만 사용**
- 수집 일시(UTC): 2026-09-07 14:11 ~ 14:20
- 산출물: `result.json`, `progress.json`, `manifest.json`, `raw/` (원본 HTML 바이트 31건)

## robots 준수

`raw/robots.txt` (SHA256 `29d8b016…48d2`) 의 유일한 그룹은 `User-agent: *` 이며 금지 경로는
`/Article/Search`, `/Media/Search`, `/Article/WriterArticles`, `/Article/Hashtag` 4개다.
따라서 **사이트 검색 경로는 한 번도 요청하지 않았고**, 허용 경로인 `/Article/E00…` 문서 페이지만 받았다.
항목 ID는 (a) 이미 있던 `sources.json`의 URL, (b) 허용된 문서 페이지 안의 관련 항목 링크
(특히 `E0032800` 신라 항목)로 사이트 안에서 해결했고, `을지문덕`·`선덕여왕` 2건만 외부 검색엔진으로 ID를 확인했다.
`/Article/Keyword/진평왕` 을 1회 시도했으나 404였고(금지 경로 아님), 이후 사용하지 않았다.
User-Agent 는 `SigongYeojido-DataCollector/1.0 (Claude Code research agent; one-off historical date collection; low rate)`,
요청 간격 3초, TLS 는 파이썬 기본 검증(`ssl.create_default_context()`) 그대로 사용했다.
NIKH·KCI/KISS·db.itkc 는 요청하지 않았다. 기관 연락 없음.

## 완료 수치

| 항목 | 수 |
|---|---|
| 다운로드(HTTP 200) | 30건 (robots.txt 1 + 문서 29) · 실패 1건(404 키워드 시도) |
| 원본 바이트 | 3,690,722 B (`raw/`, 전 건 SHA256 기록) |
| sources | 29 (기존 source ID 재사용 3: `src-encykorea-jijeung`, `src-encykorea-munmu`, `src-encykorea-balhae`) |
| excerpts | 88개 / 총 425단어 · **페이지당 최대 22단어 (상한 25 준수)** |
| entities | 60 (Person 33, Event 14, Polity 7, Place 6) — 이 중 10개는 기존 ID 재사용 |
| claims | 145 (reignedIn 19, diedIn 21, isKingOf 19, hasParticipant 36, occurredIn 16, describedAs 11, tookPlaceAt 8, activeIn 7, bornIn 5, memberOf 3) |
| missing | 20건 |

모든 발췌문은 내려받은 HTML을 태그 제거만 한 텍스트의 **정확한 연속 부분문자열**임을 `build.py`가 기계적으로 검증했고,
검증 실패 시 빌드가 오류를 출력하도록 되어 있다(현재 오류 0). 호환 한자·문장부호는 원문 그대로 보존했다.

## 배정 인물 22명 — 전원 수집 완료

| 인물 | 엔티티 ID | 재위 | 생 | 몰 |
|---|---|---|---|---|
| 지증왕 | `person-encykorea-jijeung` *(기존 ID 재사용)* | 500–514 | 437 | 514 |
| 진평왕 | `person-encykorea-jinpyeong` | 579–632 | 미상 | 632 |
| 선덕여왕 | `person-encykorea-seondeok` | 632–647 | 미상 | 647 |
| 진덕여왕 | `person-encykorea-jindeok` | 647–654 | 미상 | 654 |
| 태종무열왕 | `person-encykorea-taejong-muyeol` | 654–661 | 603 | 661 |
| 문무왕 | `person-encykorea-munmu` *(기존 ID 재사용)* | 기존 데이터 유지 · 668년 고구려 공격 참여 링크만 보강 | — | — |
| 신문왕 | `person-encykorea-sinmun` | 681–692 | 미상 | 692 |
| 효소왕 | `person-encykorea-hyoso` | 692–702 | 687 | 702 |
| 성덕왕 | `person-encykorea-seongdeok` | 702–737 | 미상 | 737 |
| 경덕왕 | `person-encykorea-gyeongdeok` | 742–765 | 미상 | 765 |
| 혜공왕 | `person-encykorea-hyegong` | 765–780 | 758 | 780 |
| 원성왕 | `person-encykorea-wonseong` | 785–798 | 미상 | 798 |
| 헌덕왕 | `person-encykorea-heondeok` | 809–826 | 미상 | 826 |
| 흥덕왕 | `person-encykorea-heungdeok` | 826–836 | 표기 없음 | 836 |
| 경문왕 | `person-encykorea-gyeongmun` | 861–875 | 미상 | 875 |
| 헌강왕 | `person-encykorea-heongang` | 875–886 | 미상 | 886 |
| 진성여왕 | `person-encykorea-jinseong` | 887–897 | 미상 | 897 |
| 무왕(백제) | `person-encykorea-baekje-mu` | 600–641 | 미상 | 641 |
| 의자왕 | `person-encykorea-uija` | 641–660 | 미상 | 660 |
| 보장왕(연결용) | `person-encykorea-bojang` | 642–668 | 미상 | 682 |
| 연개소문 | `person-encykorea-yeongaesomun` | — (활동 642–665) | 미상 | 665 |
| 을지문덕 | `person-encykorea-euljimundeok` | — (활동 612) | 미상 | 미상 |
| 장보고 | `person-encykorea-jangbogo` | — (활동 828–846) | 미상 | 846 |
| 최치원 | `person-encykorea-choechiwon` | — (활동 857–908 이후) | 857 | 미상 |

재위(reignedIn)와 생몰(bornIn/diedIn)은 서로 다른 술어로 분리해 기록했다.
연개소문·을지문덕·장보고·최치원은 왕이 아니므로 재위 대신 **문헌에 연도가 명시된 활동 구간**만 `syj:activeIn` 으로 넣었고,
사망 연도를 모르는 인물(을지문덕·최치원)에게 사망 연도를 만들어 넣지 않았다.
최치원의 908년은 “908년(효공왕 12) 이후까지 활동하였다”는 서술에 근거한 **활동 확인 하한**이며 사망연도가 아니라고 claim note 에 명시했다.

## 연결된 연대 사건 14건 (요청 8–12건 이상)

| 사건 | ID | 연도 | 장소(명시된 경우) | 참여 |
|---|---|---|---|---|
| 살수대첩 | `event-salsu-daecheop-612` | 612 | 살수(=청천강) | 을지문덕, 우중문, 우문술, 고구려, 수 |
| 연개소문의 정변 | `event-yeongaesomun-coup-642` | 642 | 평양성(“남쪽 성 밖”) | 연개소문, 보장왕 |
| 백제 멸망 | `event-baekje-fall-660` | 660 | — | 의자왕, 태종무열왕, 신라, 당, 백제 |
| 고구려 멸망 | `event-goguryeo-fall-668` | 668 | 평양성 | 보장왕, 문무왕, 김인문, 이세적, 신라, 당, 고구려 |
| 나당전쟁 | `event-nadang-war-671-676` | 671–676 | — | 신라, 당 |
| 기벌포 전투 | `event-gibeolpo-676` | 676 | 기벌포 | 시득, 설인귀, 신라 |
| 신라의 삼국통일 | `event-samguk-tongil-676` | 676 | — | 신라 |
| 발해 건국 | `event-balhae-founding-698` *(기존 ID 재사용)* | 698 | — | — |
| 당의 발해군왕 책봉·국명 ‘발해’ | `event-balhae-renaming-713` | 713 | — | 발해, 당 |
| 발해의 등주 공격 | `event-balhae-deungju-raid` *(기존 ID 재사용, 확인 필요)* | 732 | 등주(登州) | 발해 무왕, 장문휴, 발해 |
| 청해진 설치 | `event-cheonghaejin-establishment-828` | 828 | 완도 | 장보고, 흥덕왕 |
| 장보고 암살 | `event-jangbogo-assassination-846` | 846 | — | 장보고, 염장 |
| 청해진 철폐 | `event-cheonghaejin-abolition-851` | 851 | — | — |
| 발해 멸망 | `event-balhae-fall-926` | 926 | — | 발해 |

장소는 발췌문에 **명시적으로 적힌 것만** 넣었고, 인물의 소속 정치체로부터 위치를 추정하지 않았다. 새 좌표는 추가하지 않았다.

## 기존 ID 재사용과 동일성 판단

직접 확인한 뒤에만 재사용했다.

- `person-encykorea-jijeung`, `person-encykorea-munmu` — `sources.json` 의 대응 source URL(E0054400 / E0019473)이
  이번에 내려받은 URL과 같고 `catalog.json` 레이블도 일치함을 확인.
- `src-encykorea-jijeung` / `src-encykorea-munmu` / `src-encykorea-balhae` — URL이 동일하여 source ID 를 재사용.
- `polity-silla`, `polity-tongil-silla`, `polity-baekje`, `polity-goguryeo`, `polity-balhae` — 레이블·한자 일치.
- `event-balhae-founding-698` — 698년 발해 건국이라는 동일 사건.

**병합 전 확인이 필요한 2건(모두 `note` 로 표시함)**

1. `event-balhae-deungju-raid` — 기존 레코드는 삼국사기 계열 표기(`渤海 靺鞨越海入寇登州`)에서 온 것으로 보이고,
   본 발췌는 민족문화대백과 발해 항목의 “무왕은 732년 9월에 … 등주(登州)를 공격하였고”이다.
   같은 사건으로 판단해 연도·장소·참여자를 붙였으나, 기존 레코드의 원문·연도를 대조하지는 못했다.
2. `place-encykorea-pyongyangseong` — 668년 평양성 함락과 642년 정변의 장소로 사용했으나,
   동명 지명(고려·조선기 평양성 등)과의 구분은 레이블 수준에서만 확인했다.

또한 `person-encykorea-baekje-mu`(백제 무왕)와 `person-encykorea-balhae-mu`(발해 무왕)는 이름이 같아 **별도 ID**로 분리하고 note 를 달았다.
경덕왕은 같은 항목 안에서 ‘신라의 제35대 왕’(내용 요약)과 ‘통일신라의 제35대 왕’(정의)이 함께 쓰여,
발췌문을 따라 `polity-silla` 로 연결하되 note 에 검토 필요를 적었다.

## 미수집 사실 (result.json 의 `missing` 20건)

- **출생 연도 미상 15명**: 진평왕·선덕여왕·진덕여왕·신문왕·성덕왕·경덕왕·원성왕·헌덕왕·경문왕·헌강왕·진성여왕·무왕(백제)·의자왕·연개소문·장보고
  — 사전 인물 정보 표가 “출생 연도미상”으로 표기. 추정하지 않았다.
- **흥덕왕**: 인물 정보 표에 ‘출생 연도’ 행 자체가 없음(사망 연도만 표기).
- **을지문덕**: 항목이 “생몰년은 미상이다.”라고 명시. 연도가 확인되는 기록은 612년 살수대첩뿐.
- **최치원**: “정확한 사망 시기는 알 수 없지만 … 908년 이후까지 활동” — 사망 연도 없음.
- **백제·고구려 존속 시작 연도**: 배정 범위(400–935)와 페이지당 25단어 인용 한도 때문에 두 나라 항목 본문을 따로 받지 않음.
  두 정치체의 종료는 660년·668년 멸망 사건으로 기록했다.
- **매초성 전투(675) 등 나당전쟁 개별 전투**: 삼국통일 항목 본문에 서술되어 있으나 인용 한도 안에서
  전쟁 전체 기간(671–676)과 676년 기벌포 전투를 우선했다.

## 라이선스

각 항목 하단 고지: “한국민족문화대백과사전은 공공저작물로서 공공누리 제도에 따라 이용 가능합니다.
백과사전 내용 중 글을 인용하고자 할 때는 ‘[출처 : 항목명 - 한국민족문화대백과사전]’과 같이 출처 표기를 하여야 합니다.”
공공누리 **유형 등급(제1~4유형)은 항목에 표시되어 있지 않아 unverified** 로 남겼다.
이 고지 문자열이 29개 문서 페이지 전부에 존재함을 빌드 단계에서 확인했다.

## 주의

현재 인용 데이터는 사람 검토를 거치지 않은 AI 초안이다. 병합 전 위 “확인 필요” 2건과 경덕왕 정치체 연결을 사람이 확인할 것.

## 파일 경로 (실제)

- `C:\Users\gkfkd\AppData\Local\Temp\sigong-fill-96\three_kingdoms_late\result.json`
- `C:\Users\gkfkd\AppData\Local\Temp\sigong-fill-96\three_kingdoms_late\progress.json`
- `C:\Users\gkfkd\AppData\Local\Temp\sigong-fill-96\three_kingdoms_late\manifest.json`
- `C:\Users\gkfkd\AppData\Local\Temp\sigong-fill-96\three_kingdoms_late\report.md`
- `C:\Users\gkfkd\AppData\Local\Temp\sigong-fill-96\three_kingdoms_late\raw\` (원본 HTML 31건, robots.txt 포함)
- 수집 스크립트(이 폴더 안에서만 실행): `fetch.py`, `extract.py`, `probe.py`, `build.py`
