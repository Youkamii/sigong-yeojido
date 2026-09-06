---
type: "Source"
id: "src-jipseong-ko_015"
label: "說文解字"
labelHanja: "說文解字"
sourceKind: "사료집성 발췌"
sourceGroup: "한국고대사료집성"
composedYear: 121
coversFrom: null
coversTo: null
originalLanguage: "hanmun"
sourceLevelId: "ko_015"
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

# 說文解字

국편 한국고대사료집성 중국편에 실린 『說文解字』의 한국사 관련 발췌다.
사서 전체 원문을 수록한 것으로 표시하지 않는다. 국편 사서 id `ko_015`를 Source 이름에 쓴다.
같은 한글 이름을 가진 다른 사서도 id가 달라 합쳐지지 않는다.

## 연도 근거와 한계

편찬 시점은 XML의 `source/dateIssued`에서 단일 연도나 정확한 날짜를 옮긴 값이다. 원표기: `121년`.
역사적 편찬 연도를 별도 문헌으로 확정한 값은 아니다. 빈값·세기·추정·초간 연도·저자 생몰년이면 점을 찍지 않는다.
현대 자료집의 간행 연도 2006을 고대 사서의 편찬 시점으로 쓰지 않는다.
수록 기간은 이 발췌에서 XML `dateOccured`에 정확한 연도가 붙은 조각들의 최솟값·최댓값이다.
현재 범위: None~None. 날짜가 전혀 없으면 막대도 미상이다.
이 범위는 사서 전체의 범위나 인물의 생몰년이 아니다. 저자 원표기 `허신(許愼)`도 XML의 서지 정보로만 보존한다.
표제는 `mainTitle`을 쓴다. 설명 요소의 name 속성에는 다른 책 이름을 복사한 흔적이 있어 표제로 쓰지 않는다.

## 국편 서지 설명

『說文解字』는 『說文』으로 稱하기도 하며 字書이다. 後漢의 許愼(約 58~147)이 편찬하였다. 총 15卷이며 현존 판본은 매 권이 上·下로 나누어져서 총 30卷이다. 許愼의 字는 叔重이며 汝南 召陵(지금의 河南省 郾城)人이다. 郡愼이 처음 창안한 것은 아니지만 許愼을 통하여 체계화되었다. 이 책은 후세에 커다란 영향을 미쳤으며 그것을 연구한 책들이 끊임없이 출현하여 許學 혹은 說文學을 형성하였다. 淸代 한 왕조만 하더라도 『說文解字』관련 著作이 근 200種에 달할 정도였다. 이 책은 지금까지 古代漢語, 특히 甲骨文과 金文을 해독하고 연구하는데 중요한 수단이 되고 있다. 현존하는 모든 판본은 北宋初 徐鉉의 校注本에서 나왔으며, 가장 오래된 것은 毛氏 汲古閣本이다. 1963년에 나온 中華書局 影印本이 가장 널리 보급되어 있다. 이 자료집에서는 上海 中華書局에서 大興 朱氏依宋重刻本影印에 바탕한 『四部備要』本에 의거하여, 한국사와 직·간접적으로 관련이 있는 부분을 발췌하여 수록하였다.

## 재현

`services/ingestion/extract_jipseong.py`와 `docs/research/jipseong-ingestion.md`를 따른다.
벌크 설명과 실제 XML의 사서 수 차이도 그 문서에 남겼다. 서지 머리말 원문은 추출 보고서 `frontXml`로 보존한다.


## 담고 있는 것

<!-- counts:start -->
| 부·편 | chunk 수 |
|---|---:|
| 說文解字 | 20 |
| **합** | **20** |

chunk 가 놓인 층: level3 20. 연대(dateOccured) 붙은 chunk 0, 본문이 빈 chunk 0, 본문 글자 수 708.
주석 0(), 색인어 40(지명 20 · 국명 15 · 이름 3 · 서명 1 · 연호 1).
<!-- counts:end -->

[공공데이터포털](https://www.data.go.kr/data/15053631/fileData.do)의 이용허락범위 제한 없음 표시를 2026-09-06 확인했다.
국편 웹 원문을 수집하지 않고 벌크 XML을 사용했다. 위 수치는 `scripts/fill_card_counts.py`와 같은 코드로 센다.
