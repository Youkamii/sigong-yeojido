---
type: Source
id: src-samgukyusa
label: 삼국유사
labelHanja: 三國遺事
sourceKind: 사찬사서
composedYear: 1281
coversFrom: -2333
coversTo: 936
compiler: 일연
originalLanguage: hanmun
defaultLens: false
license: open
licenseDetail: 공공데이터포털 "이용허락범위 제한 없음" (국사편찬위원회 제공 벌크 XML)
licenseVerifiedAt: 2026-09-05
licenseVerifiedVia: https://www.data.go.kr/data/15053634/fileData.do
status: draft
generated:
  by: claude-fable-5-1
  at: 2026-09-05
verified: null
sources:
  - id: datago-15053634
    resource: https://www.data.go.kr/data/15053634/fileData.do
    provider: 국사편찬위원회 한국사데이터베이스 (공공데이터포털 파일데이터 15053634 "삼국유사 원문")
    file: 15053634.zip 292,276 bytes, sha256 a416af7e82542f5ba0e73a951b1897dfee104589af06bc68ff69412496b3bc8a
    license: 이용허락범위 제한 없음
    fetched: 2026-09-05
---

# 삼국유사

고려 충렬왕 대에 승려 일연(一然, 1206~1289)이 엮은 사찬(私撰) 사서. 5권 9편 — 왕력(王曆)·기이(紀異) 상·하·
흥법(興法)·탑상(塔像)·의해(義解)·신주(神呪)·감통(感通)·피은(避隱)·효선(孝善). 삼국사기가 다루지 않은
건국 신화·불교·설화를 담아, 고조선(단군)부터 후삼국까지를 다룬다.

재료는 **국사편찬위원회가 공공데이터포털에 개방한 벌크 XML**(`15053634`, 2022-11-03 판)이다.
국편 사이트는 `robots.txt`로 수집을 막고 있어 긁지 않는다(`docs/research/bulk-xml-findings.md`).

## 연도를 이렇게 잡은 이유

- **composedYear 1281 (추정)**: 편찬 연대는 사료에 적혀 있지 않다. 학계는 1281~1283년(충렬왕 7~9) 무렵으로 본다.
  시간선의 점은 1281에 찍되, 확정 연도가 아니다.
- **coversFrom -2333 (환산)**: 기이편 고조선(왕검조선) 조는 단군의 건국을 "與髙(堯)同時"·"唐髙卽位五十年庚寅"(요 임금 즉위 50년)으로
  적을 뿐 서기 연도를 주지 않는다. 기원전 2333은 이 기년을 서기로 환산해 온 관행(『동국통감』 등)이며,
  시간선 막대의 왼쪽 끝으로만 쓴다. 사료 자체의 주장이 아니다.
- **coversTo 936**: 기이편 후백제 견훤 조가 936년 후백제 멸망으로 끝난다. 탑상·의해 편 등에는 편찬 당시(13세기)의
  고려 사적도 곳곳에 실려 있으나, 막대는 삼국·후삼국까지로 두고 그 뒤는 여기 기록으로 남긴다.

## 담고 있는 것

국편 XML 의 계층은 권(level1) › 편(level2) › 조목(level3) › 기사(level4)다. chunk 는 본문을 가진 가장 아래 요소 —
왕력은 조목(표) 단위, 나머지 편은 기사 단위다. 아래 수치는 `scripts/fill_card_counts.py --source samgukyusa` 가 chunks.jsonl 에서 센다.

<!-- counts:start -->
| 부·편 | chunk 수 |
|---|---:|
| 紀異第一 | 119 |
| 紀異第二 | 106 |
| 塔像第四 | 97 |
| 義解第五 | 66 |
| 感通第七 | 30 |
| 興法第三 | 28 |
| 避隐第八 | 28 |
| 王曆 | 15 |
| 神呪第六 | 15 |
| 孝善第九 | 13 |
| **합** | **517** |

chunk 가 놓인 층: level3 15 · level4 502. 연대(dateOccured) 붙은 chunk 196, 본문이 빈 chunk 1, 본문 글자 수 100,116.
주석 1,903(교감주 1,103 · 원주 799 · 각주 1), 색인어 5,690(이름 3,611 · 지명 1,113 · 국명 708 · 서명 253 · 관서 5).
<!-- counts:end -->

추출: `python3 services/ingestion/extract_nikh_xml.py --source samgukyusa` → `data/sources/samgukyusa/{chunks,annotations,index-terms}.jsonl`.
chunk id 는 `chunk_samgukyusa_{levelId}` (예 `chunk_samgukyusa_sy_001_0020_0020_0010` = 권1 기이 고조선 조 첫 기사 "단군왕검이 아사달에 도읍하다"),
permalink 는 `https://db.history.go.kr/id/{levelId}`.

## 조심할 것

- **왕력은 표다**(XML `table`). 추출기가 행마다 줄바꿈으로 펴 놓았다 — 셀 경계는 공백뿐이라 열 구조가 필요하면 원본 XML 로 돌아가야 한다.
- **檀君 은 이 사료에서 壇君(土 변)으로 적힌다.** 국편 교감주는 『제왕운기』·『세종실록』 지리지 인용 『단군고기』에는 檀이라고 적어 두었다.
  이름 검색 때 두 표기를 모두 봐야 한다. 삼국사기·고려사와 표기가 다른 이름이 더 있을 것이다(王儉/王倹 등).
- 연대(`dateOccured`)는 기이편 등 일부 기사에만 있다. 나머지 조목의 연대는 본문의 간지·중국 연호로만 있다 — 연력 변환은 Claim 층의 일이다.
- 국편 XML 의 원주(原註)는 본문에서 떼어 annotations 로 뺐다(삼국사기와 같은 규칙). 기사 본문 전체가 원주인 경우 text 가 비어 있을 수 있다.
