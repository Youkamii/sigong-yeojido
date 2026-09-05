---
type: Source
id: src-goryeosa
label: 고려사
labelHanja: 高麗史
sourceKind: 관찬사서
composedYear: 1451
coversFrom: 918
coversTo: 1392
compiler: 정인지·김종서 등
originalLanguage: hanmun
defaultLens: false
license: open
licenseDetail: 공공데이터포털 "이용허락범위 제한 없음" (국사편찬위원회 제공 벌크 XML)
licenseVerifiedAt: 2026-09-05
licenseVerifiedVia: https://www.data.go.kr/data/15053637/fileData.do
status: draft
generated:
  by: claude-fable-5-1
  at: 2026-09-05
verified: null
sources:
  - id: datago-15053637
    resource: https://www.data.go.kr/data/15053637/fileData.do
    provider: 국사편찬위원회 한국사데이터베이스 (공공데이터포털 파일데이터 15053637 "고려사 원문")
    file: 15053637.zip 5,573,780 bytes, sha256 043981df716f21ace96915ea09e77eb6488a2b8aa3b9b3761aff2139210a6578
    license: 이용허락범위 제한 없음
    fetched: 2026-09-05
---

# 고려사

조선 문종 1년(1451) 김종서·정인지 등이 왕명으로 완성한 기전체 관찬 사서. 139권 — 세가(世家) 46·지(志) 39·표(表) 2·
열전(列傳) 50·목록 2. 고려 태조(918)부터 공양왕(1392)까지를 다룬다. 조선 초에 편찬됐으므로 고려를 보는
눈이 조선의 것이라는 점을 렌즈 이름에 새겨 둔다.

재료는 **국사편찬위원회가 공공데이터포털에 개방한 벌크 XML**(`15053637`, 2022-11-03 판)이다.
국편 사이트는 `robots.txt`로 수집을 막고 있어 긁지 않는다(`docs/research/bulk-xml-findings.md`).

## 연도를 이렇게 잡은 이유

- **composedYear 1451**: 문종 원년 8월 완성(정인지의 「進高麗史箋」). 벌크 XML 각 권 첫머리에도 "正憲大夫工曹判書 … 鄭麟趾奉敎修"가 붙어 있다.
- **coversFrom 918**: 세가 권1 태조 즉위. 세가 앞의 「고려세계(高麗世系)」는 태조 이전의 세계(世系)와 설화를 다루지만,
  연대를 못 박을 수 없어 막대는 918부터 둔다.
- **coversTo 1392**: 공양왕 4년 고려 멸망. 우왕·창왕은 세가가 아니라 열전(신우·신창)에 있다 — 조선의 편찬 관점이다.

## 담고 있는 것

국편 XML 의 계층은 권(level1) › 왕·편(level2) › 연차·조(level3) › 월·항목(level4) › 기사(level5)까지 내려간다.
세가는 "왕 N년 › M월 › 기사" 로 기사 하나가 한 사건이고 대부분 `dateOccured` 가 붙어 있다. chunk 는 본문을 가진 가장 아래 요소다.
아래 수치는 `scripts/fill_card_counts.py --source goryeosa` 가 chunks.jsonl 에서 센다.

<!-- counts:start -->
| 부·편 | chunk 수 |
|---|---:|
| 世家 | 15,670 |
| 志 | 12,190 |
| 列傳 | 3,299 |
| 表 | 35 |
| 그 밖(고려세계·목록 등) | 13 |
| **합** | **31,207** |

chunk 가 놓인 층: level1 3 · level2 73 · level3 488 · level4 19,486 · level5 11,157. 연대(dateOccured) 붙은 chunk 27,470, 본문이 빈 chunk 0, 본문 글자 수 2,204,429.
주석 735(연문 711 · 교감주 22 · 원주 1 · 각주 1), 색인어 124,396(이름 66,285 · 관직 37,477 · 지명 16,876 · 단체 2,666 · 서명 1,092).
<!-- counts:end -->

추출: `python3 services/ingestion/extract_nikh_xml.py --source goryeosa` → `data/sources/goryeosa/{chunks,annotations,index-terms}.jsonl` (chunks 약 30 MB).
chunk id 는 `chunk_goryeosa_{levelId}`, permalink 는 `https://db.history.go.kr/id/{levelId}`.

## 조심할 것

- 고려세계(高麗世系) 절의 levelId 에는 `$` 가 들어 있다(`kr_$s02_0010`). 국편 id 그대로 둔다 — 파일명·IRI 에 쓸 때 이스케이프에 주의.
- 표(表)는 XML `tableGroup/table` 이다. 행마다 줄바꿈으로 펴 놓았고 열 구조는 원본 XML 에만 있다.
- 주석은 `연문`(衍文 — 국편이 잘못 들어간 글자로 본 것) 이 대부분이고 교감주는 20건 안팎이다. 교감 정보가 거의 없는 판이다.
- 본문에 규장각 원본 이미지 링크(`link type="original"`)가 섞여 있었다 — 국편의 편집 장치라 버렸다.
- 색인어 type 에 `관직`·`단체` 가 있다(삼국사기의 `관서` 와 이름이 다르다). 지명 색인은 이름 색인의 1/4 정도로 성기다.
