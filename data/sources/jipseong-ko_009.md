---
type: "Source"
id: "src-jipseong-ko_009"
label: "鹽鐵論"
labelHanja: "鹽鐵論"
sourceKind: "사료집성 발췌"
sourceGroup: "한국고대사료집성"
composedYear: null
coversFrom: null
coversTo: null
originalLanguage: "hanmun"
sourceLevelId: "ko_009"
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

# 鹽鐵論

국편 한국고대사료집성 중국편에 실린 『鹽鐵論』의 한국사 관련 발췌다.
사서 전체 원문을 수록한 것으로 표시하지 않는다. 국편 사서 id `ko_009`를 Source 이름에 쓴다.
같은 한글 이름을 가진 다른 사서도 id가 달라 합쳐지지 않는다.

## 연도 근거와 한계

편찬 시점은 XML의 `source/dateIssued`에서 단일 연도나 정확한 날짜를 옮긴 값이다. 원표기: `빈값`.
역사적 편찬 연도를 별도 문헌으로 확정한 값은 아니다. 빈값·세기·추정·초간 연도·저자 생몰년이면 점을 찍지 않는다.
현대 자료집의 간행 연도 2006을 고대 사서의 편찬 시점으로 쓰지 않는다.
수록 기간은 이 발췌에서 XML `dateOccured`에 정확한 연도가 붙은 조각들의 최솟값·최댓값이다.
현재 범위: None~None. 날짜가 전혀 없으면 막대도 미상이다.
이 범위는 사서 전체의 범위나 인물의 생몰년이 아니다. 저자 원표기 `환관(桓寬)`도 XML의 서지 정보로만 보존한다.
표제는 `mainTitle`을 쓴다. 설명 요소의 name 속성에는 다른 책 이름을 복사한 흔적이 있어 표제로 쓰지 않는다.

## 국편 서지 설명

『鹽鐵論』은 前漢 宣帝代에 桓寬이 편찬한 것으로 12卷 60章으로 되어 있다. 기원전 81년 전한의 조정에서 열렸던 회의의 토론 내용을 再現하는 형태로 정리한 독특한 형식으로 엮었다. 武帝代부터 비롯한 소금·철·술 등의 專賣·均輸·平準 등 일련의 財政政策을 무제가 죽은 뒤에도 존속시킬 것인가의 여부를 전국에서 추천을 받고 참석한 사람들 간에 논의한 내용들을 수록한 것이다. 참석자 중 五經敎授인 賢良·文學 약 60명은 儒家思想을 근거로 이 제도의 폐지를 주장하고, 丞相 車天秋 및 御史大夫 桑弘羊과 그 부하 관리들은 法家思想을 내세워 제도의 존속을 주장하여 이들 사이에 격론이 벌어졌다. 이 책은 鹽鐵專賣 등의 존속 여부에 관한 것만 아니라, 당시의 정치·사회·경제·사상 등에 관해서도 논급되어 있는 기본적인 史科이다. 桓寬은 前漢 중기 때의 사람으로 『公羊春秋』를 익혀 관리에 등용되어 郡太守升이라는 지방관을 지냈다. 이 자료집에서는 上海 中華書局에서 張氏 考證本校刊에 바탕한 『四部備要』本에 의거하여, 한국사와 직·간접적으로 관련이 있는 부분을 발췌하여 수록하였다.

## 재현

`services/ingestion/extract_jipseong.py`와 `docs/research/jipseong-ingestion.md`를 따른다.
벌크 설명과 실제 XML의 사서 수 차이도 그 문서에 남겼다. 서지 머리말 원문은 추출 보고서 `frontXml`로 보존한다.


## 담고 있는 것

<!-- counts:start -->
| 부·편 | chunk 수 |
|---|---:|
| 鹽鐵論 | 22 |
| **합** | **22** |

chunk 가 놓인 층: level3 22. 연대(dateOccured) 붙은 chunk 0, 본문이 빈 chunk 0, 본문 글자 수 4,404.
주석 22(원주 21 · 각주 1), 색인어 401(국명 175 · 이름 137 · 지명 62 · 서명 27).
<!-- counts:end -->

[공공데이터포털](https://www.data.go.kr/data/15053631/fileData.do)의 이용허락범위 제한 없음 표시를 2026-09-06 확인했다.
국편 웹 원문을 수집하지 않고 벌크 XML을 사용했다. 위 수치는 `scripts/fill_card_counts.py`와 같은 코드로 센다.
