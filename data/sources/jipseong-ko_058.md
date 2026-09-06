---
type: "Source"
id: "src-jipseong-ko_058"
label: "觀世音應驗記"
labelHanja: "觀世音應驗記"
sourceKind: "사료집성 발췌"
sourceGroup: "한국고대사료집성"
composedYear: null
coversFrom: null
coversTo: null
originalLanguage: "hanmun"
sourceLevelId: "ko_058"
defaultLens: false
license: "open"
licenseDetail: "공공데이터포털 이용허락범위 제한 없음 (국편 벌크 XML)"
licenseVerifiedAt: "2026-09-06"
licenseVerifiedVia: "https://www.data.go.kr/data/15053631/fileData.do"
status: "draft"
verified: null
generated:
  by: codex
  at: 2026-09-06
sources:
  - id: datago-15053631
    resource: https://www.data.go.kr/data/15053631/fileData.do
    provider: 국사편찬위원회
    file: 15053631.zip sha256 437dda1e95c7c9b6cc488819a0ecf10046def7f9ef324e81a08bb3d28198d4d0
    license: 이용허락범위 제한 없음
---

# 觀世音應驗記

국편 한국고대사료집성 중국편에 실린 『觀世音應驗記』의 한국사 관련 발췌다.
사서 전체 원문을 수록한 것으로 표시하지 않는다. 국편 사서 id `ko_058`를 Source 이름에 쓴다.
같은 한글 이름을 가진 다른 사서도 id가 달라 합쳐지지 않는다.

## 연도 근거와 한계

편찬 시점은 XML의 `source/dateIssued`에서 단일 연도나 정확한 날짜를 옮긴 값이다. 원표기: `빈값`.
역사적 편찬 연도를 별도 문헌으로 확정한 값은 아니다. 빈값·세기·추정·초간 연도·저자 생몰년이면 점을 찍지 않는다.
현대 자료집의 간행 연도 2006을 고대 사서의 편찬 시점으로 쓰지 않는다.
수록 기간은 이 발췌에서 XML `dateOccured`에 정확한 연도가 붙은 조각들의 최솟값·최댓값이다.
현재 범위: None~None. 날짜가 전혀 없으면 막대도 미상이다.
이 범위는 사서 전체의 범위나 인물의 생몰년이 아니다. 저자 원표기 `부량(傅亮)`도 XML의 서지 정보로만 보존한다.
표제는 `mainTitle`을 쓴다. 설명 요소의 name 속성에는 다른 책 이름을 복사한 흔적이 있어 표제로 쓰지 않는다.

## 국편 서지 설명

『觀世音應驗記』는 중국 六朝時代의 観音菩薩의 應験譚을 모아놓은 책으로 南朝의 宋나라 때의 傅亮(374-426)과 張演(５世紀前半)이 편찬한 『光世音應驗記』와 『続光世音應驗記』, 그리고 斉나라 때의 陸杲(459-532)가 편찬한 『繋觀世音應驗記』 등 3편의 관음보살 응험기들로 구성되어 있다. 이 책은 일찍이 逸失되었다가 1970년 일본 京都의 青蓮院에 보관되어 있던 가마쿠라[鎌倉]시대의 필사본이 발견되면서 알려지게 되었다. 西晋 말기부터 斉나라까지의 六朝時代의 観音信仰의 실태를 생생하게 전해주는 귀중한 자료이다. 특히 陸杲가 편찬한 『繋觀世音應驗記』의 말미에는 백제의 沙門発正과 百済 武広王과 관련되는 観音菩薩의 應驗譚 2편이 기록되어 있는데, 연대상으로 볼 때 『繋觀世音應驗記』의 본래 내용은 아니고 후대에 첨가된 것이다. 아마도 이 책이 한국에 전해져 유통되는 가운데 백제와 관련된 응험담이 추가된 것이 아닌가 생각된다. 마키타 료타이(牧田諦亮)가 편찬한 翻刻 및 譯註(『六朝古逸観世音應験記の研究』, 平楽寺書店, 1970年)에 수록되어 있고, 중국에서도 『観世音應験記三種訳注』(董志翹 著, 江蘇古籍出版社, 2002年)가 간행되었다.

## 재현

`services/ingestion/extract_jipseong.py`와 `docs/research/jipseong-ingestion.md`를 따른다.
벌크 설명과 실제 XML의 사서 수 차이도 그 문서에 남겼다. 서지 머리말 원문은 추출 보고서 `frontXml`로 보존한다.


## 담고 있는 것

<!-- counts:start -->
| 부·편 | chunk 수 |
|---|---:|
| 觀世音應驗記 | 2 |
| **합** | **2** |

chunk 가 놓인 층: level3 2. 연대(dateOccured) 붙은 chunk 0, 본문이 빈 chunk 0, 본문 글자 수 1,201.
주석 0(), 색인어 29(이름 11 · 서명 10 · 국명 4 · 연호 2 · 지명 2).
<!-- counts:end -->

[공공데이터포털](https://www.data.go.kr/data/15053631/fileData.do)의 이용허락범위 제한 없음 표시를 2026-09-06 확인했다.
국편 웹 원문을 수집하지 않고 벌크 XML을 사용했다. 위 수치는 `scripts/fill_card_counts.py`와 같은 코드로 센다.
