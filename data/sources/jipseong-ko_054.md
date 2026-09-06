---
type: "Source"
id: "src-jipseong-ko_054"
label: "新修科分六學僧傳"
labelHanja: "新修科分六學僧傳"
sourceKind: "사료집성 발췌"
sourceGroup: "한국고대사료집성"
composedYear: 1366
coversFrom: null
coversTo: null
originalLanguage: "hanmun"
sourceLevelId: "ko_054"
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

# 新修科分六學僧傳

국편 한국고대사료집성 중국편에 실린 『新修科分六學僧傳』의 한국사 관련 발췌다.
사서 전체 원문을 수록한 것으로 표시하지 않는다. 국편 사서 id `ko_054`를 Source 이름에 쓴다.
같은 한글 이름을 가진 다른 사서도 id가 달라 합쳐지지 않는다.

## 연도 근거와 한계

편찬 시점은 XML의 `source/dateIssued`에서 단일 연도나 정확한 날짜를 옮긴 값이다. 원표기: `1366년`.
역사적 편찬 연도를 별도 문헌으로 확정한 값은 아니다. 빈값·세기·추정·초간 연도·저자 생몰년이면 점을 찍지 않는다.
현대 자료집의 간행 연도 2006을 고대 사서의 편찬 시점으로 쓰지 않는다.
수록 기간은 이 발췌에서 XML `dateOccured`에 정확한 연도가 붙은 조각들의 최솟값·최댓값이다.
현재 범위: None~None. 날짜가 전혀 없으면 막대도 미상이다.
이 범위는 사서 전체의 범위나 인물의 생몰년이 아니다. 저자 원표기 `담악(曇噩)`도 XML의 서지 정보로만 보존한다.
표제는 `mainTitle`을 쓴다. 설명 요소의 name 속성에는 다른 책 이름을 복사한 흔적이 있어 표제로 쓰지 않는다.

## 국편 서지 설명

『新修科分六學僧傳』은 元나라의 승려 曇噩이 至正 26년(1366)에 찬술한 高僧들의 전기집이다. 전체 30巻으로 이루어져 있으며 後漢 明帝의 永平 10年(67)에서 宋代에 이르는 1천 2백 73인의 高僧들의 전기를 수록하고 있다. 이전의 고승전들을 참조한 것으로서 『高僧傳』『続高僧傳』『宋高僧傳』 등과 중복되는 내용이 많지만, 수록하고 있는 승려들의 수가 고승전류 중에서 가장 많고 승려들의 분류법도 특이하다. 종래의 고승전들이 모두 10科의 분류법을 취한 것과 달리 이 책은 승려들을 활동 내용에 따라 6学(慧·施·戒·忍辱·精進·定)으로 나누고 이를 다시 각각 12科(訳經·傳宗·遺身·利物·弘法·護教·摂念·特志·義解·感通·證悟·神化)로 분류하고 있다. 한국 출신의 고승으로는 모두 16인이 수록되어 있다. 慧学　傳宗科에 玄光·沙門波若(卷3), 慈蔵·圓勝·義湘(卷4), 地蔵(巻6), 霊照(巻8) 등의 전기가 실려 있고, 忍辱学　持志科에　道育(巻20), 精進学　義解科에 圓測(巻23), 精進学　感通科에 圓光(巻25), 定学　證悟科에 慧顕, 元暁, 真表, 無漏, 元表(巻28), 定学　禅化科에 無相(巻30)의 전기가 수록되어 있다.

## 재현

`services/ingestion/extract_jipseong.py`와 `docs/research/jipseong-ingestion.md`를 따른다.
벌크 설명과 실제 XML의 사서 수 차이도 그 문서에 남겼다. 서지 머리말 원문은 추출 보고서 `frontXml`로 보존한다.


## 담고 있는 것

<!-- counts:start -->
| 부·편 | chunk 수 |
|---|---:|
| 新修科分六學僧傳 | 15 |
| **합** | **15** |

chunk 가 놓인 층: level3 15. 연대(dateOccured) 붙은 chunk 0, 본문이 빈 chunk 0, 본문 글자 수 7,222.
주석 0(), 색인어 341(이름 166 · 지명 82 · 국명 52 · 연호 24 · 서명 17).
<!-- counts:end -->

[공공데이터포털](https://www.data.go.kr/data/15053631/fileData.do)의 이용허락범위 제한 없음 표시를 2026-09-06 확인했다.
국편 웹 원문을 수집하지 않고 벌크 XML을 사용했다. 위 수치는 `scripts/fill_card_counts.py`와 같은 코드로 센다.
