---
type: "Source"
id: "src-jipseong-ko_062"
label: "傳法正宗記"
labelHanja: "傳法正宗記"
sourceKind: "사료집성 발췌"
sourceGroup: "한국고대사료집성"
composedYear: 1061
coversFrom: null
coversTo: null
originalLanguage: "hanmun"
sourceLevelId: "ko_062"
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

# 傳法正宗記

국편 한국고대사료집성 중국편에 실린 『傳法正宗記』의 한국사 관련 발췌다.
사서 전체 원문을 수록한 것으로 표시하지 않는다. 국편 사서 id `ko_062`를 Source 이름에 쓴다.
같은 한글 이름을 가진 다른 사서도 id가 달라 합쳐지지 않는다.

## 연도 근거와 한계

편찬 시점은 XML의 `source/dateIssued`에서 단일 연도나 정확한 날짜를 옮긴 값이다. 원표기: `1061년`.
역사적 편찬 연도를 별도 문헌으로 확정한 값은 아니다. 빈값·세기·추정·초간 연도·저자 생몰년이면 점을 찍지 않는다.
현대 자료집의 간행 연도 2006을 고대 사서의 편찬 시점으로 쓰지 않는다.
수록 기간은 이 발췌에서 XML `dateOccured`에 정확한 연도가 붙은 조각들의 최솟값·최댓값이다.
현재 범위: None~None. 날짜가 전혀 없으면 막대도 미상이다.
이 범위는 사서 전체의 범위나 인물의 생몰년이 아니다. 저자 원표기 `불일계숭(佛日契崇)`도 XML의 서지 정보로만 보존한다.
표제는 `mainTitle`을 쓴다. 설명 요소의 name 속성에는 다른 책 이름을 복사한 흔적이 있어 표제로 쓰지 않는다.

## 국편 서지 설명

『傳法正宗記』는 宋나라 때 선종의 일파인 雲門宗 승려 佛日契崇(1007-1072)이 찬술한 선종의 역사서이다. 9권으로 이루어져 있으며, 嘉祐6年(1061)에 완성되어 다음 해에 황제로부터 대장경에 편입되는 것을 허락받았다. 제목이 제시하는 것처럼 過去 7佛에서 西天 28祖를 거쳐, 東土 6祖에 이르는 禅宗의 정통적 法系를 서술하고 있다. 법계의 계승을 밝히는 데 목적이 있기 때문에 개별 승려들에 대한 전기는 수록되어 있지 않다. 조금 앞서 편찬되었던 『景德傳燈録』(1004년)과 『天聖広燈錄』(1036년) 등에서 제시한 법계설에 기초하고 있으며, 선종의 계보에 대하여 이들과는 다른 내용을 수록하고 있는 이전의 문헌들에 대하여 비판하고 있다. 특히 당시 선종 내부에서 일반적으로 받아들여지고 있던 선의 계보와는 다른 내용이 담겨있는 『付法蔵因縁傳』,『続高僧傳』,『宋高僧傳』 등이 주로 비판되고 있는데, 이를 위하여 비교적 이른 시기의 자료인 『出三蔵記集』,『寶林傳』,『続法記』 등이 주요하게 이용되고 있다. 契崇은 이 책과 함께 『傳法正宗論』을 지어 선종 계보의 정통성을 선양하는데 많은 노력을 하였다. 이 책에는 한국 출신의 선종 승려들이 다수 등장하고 있지만 『景德傳燈録』에 나오는 인물들의 범위를 넘지 않고 있다.

## 재현

`services/ingestion/extract_jipseong.py`와 `docs/research/jipseong-ingestion.md`를 따른다.
벌크 설명과 실제 XML의 사서 수 차이도 그 문서에 남겼다. 서지 머리말 원문은 추출 보고서 `frontXml`로 보존한다.


## 담고 있는 것

<!-- counts:start -->
| 부·편 | chunk 수 |
|---|---:|
| 傳法正宗記 | 27 |
| **합** | **27** |

chunk 가 놓인 층: level3 27. 연대(dateOccured) 붙은 chunk 0, 본문이 빈 chunk 0, 본문 글자 수 1,666.
주석 2(원주 2), 색인어 208(이름 110 · 지명 61 · 국명 36 · 연호 1).
<!-- counts:end -->

[공공데이터포털](https://www.data.go.kr/data/15053631/fileData.do)의 이용허락범위 제한 없음 표시를 2026-09-06 확인했다.
국편 웹 원문을 수집하지 않고 벌크 XML을 사용했다. 위 수치는 `scripts/fill_card_counts.py`와 같은 코드로 센다.
