---
type: "Source"
id: "src-sillok-wma"
label: "명종실록"
sourceKind: "관찬사서"
sourceGroup: "조선왕조실록"
composedYear: 1571
coversFrom: 1545
coversTo: 1567
originalLanguage: "hanmun"
defaultLens: false
license: "open"
licenseDetail: "공공데이터포털 이용허락범위 제한 없음 (국사편찬위원회 벌크 XML)"
licenseVerifiedAt: "2026-09-06"
licenseVerifiedVia: "https://www.data.go.kr/data/15053647/fileData.do"
status: "draft"
verified: null
generated:
  by: codex
  at: 2026-09-06
sources:
  - id: datago-15053647
    resource: https://www.data.go.kr/data/15053647/fileData.do
    provider: 국사편찬위원회
    file: 15053647.zip sha256 9d3b908e14853d1540d8286dc7e397b5d5f3eb472ffffee137dcbd2efa2b740c
    license: 이용허락범위 제한 없음
---

# 명종실록

국사편찬위원회 실록원문 벌크 XML(2022-11-03)의 `wma` 계열 파일을 모은 판본이다.
원문 사료와 수정·보완본을 별도 Source로 둔다. 원문을 합치거나 옳고 그름을 정하지 않는다.

## 연도 근거

[국가기록원 실록 일람표](https://theme.archives.go.kr/next/sillok/sub2_2.do)의 수록 기간 1545~1567, 편찬 연도 1571를 따른다.
XML에 실린 총서·부록의 모든 내용을 이 기간 안의 사건이라고 판정한 것은 아니다.
개별 기사의 연력은 XML `dateOccured`를 그대로 사용하고, 날짜가 없는 기사는 임의로 채우지 않는다.
숙종실록보궐정오는 같은 표의 숙종실록 부록 설명에 따라 1728을 쓴다.
광해군일기 두 판본의 연도도 해당 표의 중초본 1633·정초본 1653을 따른다.

## 담고 있는 것

<!-- counts:start -->
| 부·편 | chunk 수 |
|---|---:|
| 明宗實錄 元年 | 1,032 |
| 明宗實錄 六年 | 1,003 |
| 明宗實錄 二年 | 951 |
| 明宗實錄 三年 | 849 |
| 明宗實錄 十年 | 818 |
| 明宗實錄 十二年 | 799 |
| 明宗實錄 四年 | 764 |
| 明宗實錄 九年 | 730 |
| 明宗實錄 卽位年 | 714 |
| 明宗實錄 十一年 | 672 |
| 明宗實錄 二十年 | 670 |
| 明宗實錄 七年 | 663 |
| 明宗實錄 十三年 | 657 |
| 明宗實錄 八年 | 655 |
| 明宗實錄 五年 | 642 |
| 明宗實錄 二十一年 | 620 |
| 明宗實錄 十四年 | 552 |
| 明宗實錄 十八年 | 536 |
| 明宗實錄 十六年 | 494 |
| 明宗實錄 十五年 | 458 |
| 明宗實錄 十九年 | 450 |
| 明宗實錄 十七年 | 354 |
| 明宗實錄 二十二年 | 254 |
| 附錄 | 3 |
| 明宗實錄 | 1 |
| **합** | **15,341** |

chunk 가 놓인 층: level2 25 · level3 274 · level5 15,042. 연대(dateOccured) 붙은 chunk 15,065, 본문이 빈 chunk 0, 본문 글자 수 2,371,780.
주석 6,102(원주 4,472 · 교감주 1,630), 색인어 66,555(이름 48,585 · 지명 16,232 · 서명 1,601 · 연호 137).
<!-- counts:end -->

숫자는 `scripts/fill_card_counts.py --source sillok-wma`와 같은 코드로 센다.
파일 루트가 level1 또는 level2인 경우를 모두 읽고, `<text>`를 가진 절·기사마다 한 조각으로 보존한다.
빈 본문 수는 위의 실제 집계로 확인한다. 제목만으로 기사의 존재 여부를 판단하지 않는다.
판본·책·면수는 `editionReferences`, 광해군 중초본의 교정 표시는 `proofreadings`에 남긴다.
산삭 등 교정 표시 안의 글자도 본문에 보존하므로 확정된 판독으로 취급하지 않는다.
주석은 본문과 분리하고, 원문의 유니코드 미지원 글자는 `〓`와 국편 코드로 보존한다.

## 이용과 재현

[공공데이터포털 데이터셋](https://www.data.go.kr/data/15053647/fileData.do)은 2026-09-06 확인 시 이용허락범위 제한 없음으로 표시되어 있다.
국편 웹페이지를 수집한 자료가 아니다. 벌크 ZIP과 생성 JSONL은 저장소 밖에서 관리한다.
재현 명령·전체 파일별 SHA256·XML 수 대조는 `docs/research/sillok-ingestion.md`에 적는다.
원문 링크는 `https://sillok.history.go.kr/id/{levelId}`다.
