---
type: "Source"
id: "src-jipseong-ko_063"
label: "兩部大法相承師資付法記"
labelHanja: "兩部大法相承師資付法記"
sourceKind: "사료집성 발췌"
sourceGroup: "한국고대사료집성"
composedYear: 834
coversFrom: null
coversTo: null
originalLanguage: "hanmun"
sourceLevelId: "ko_063"
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

# 兩部大法相承師資付法記

국편 한국고대사료집성 중국편에 실린 『兩部大法相承師資付法記』의 한국사 관련 발췌다.
사서 전체 원문을 수록한 것으로 표시하지 않는다. 국편 사서 id `ko_063`를 Source 이름에 쓴다.
같은 한글 이름을 가진 다른 사서도 id가 달라 합쳐지지 않는다.

## 연도 근거와 한계

편찬 시점은 XML의 `source/dateIssued`에서 단일 연도나 정확한 날짜를 옮긴 값이다. 원표기: `834년`.
역사적 편찬 연도를 별도 문헌으로 확정한 값은 아니다. 빈값·세기·추정·초간 연도·저자 생몰년이면 점을 찍지 않는다.
현대 자료집의 간행 연도 2006을 고대 사서의 편찬 시점으로 쓰지 않는다.
수록 기간은 이 발췌에서 XML `dateOccured`에 정확한 연도가 붙은 조각들의 최솟값·최댓값이다.
현재 범위: None~None. 날짜가 전혀 없으면 막대도 미상이다.
이 범위는 사서 전체의 범위나 인물의 생몰년이 아니다. 저자 원표기 `해운(海雲)`도 XML의 서지 정보로만 보존한다.
표제는 `mainTitle`을 쓴다. 설명 요소의 name 속성에는 다른 책 이름을 복사한 흔적이 있어 표제로 쓰지 않는다.

## 국편 서지 설명

『兩部大法相承師資付法記』는 唐나라 때의 密敎 승려 海雲이 太和 8年(834)에 밀교의 師資相承에 대하여 기록한 책이다. 金剛界와 胎蔵界의 밀교의 두 가지 전통[兩部]이 인도로부터 중국에 전래된 과정을 자세히 기록하고 있는데 특히 不空(705-774) 문하의 흐름을 자세히 기록하고 있다. 2권으로 구성되어 있으며, 上卷과 下卷에서 각기 金剛界 大敎王經(=『金剛頂經』)과 胎藏界 大毘盧遮那成佛神變加持經(=『大日經』)의 가르침이 계승되는 계보를 정리하고 있다. 신라 출신 승려들에 대하여도 기록되어 있는데, 上卷에는 恵日과 均亮을 비롯하여 다수의 신라 승려들이 금강계의 가르침을 수학하였음을 이야기하고 있고, 下卷에는 『大日經』을 전래한 善無畏(637-735)의 법을 계승한 玄超를 비롯하여 恵日, 悟真 등이 태장계의 흐름을 이었다고 기록하고 있다.

## 재현

`services/ingestion/extract_jipseong.py`와 `docs/research/jipseong-ingestion.md`를 따른다.
벌크 설명과 실제 XML의 사서 수 차이도 그 문서에 남겼다. 서지 머리말 원문은 추출 보고서 `frontXml`로 보존한다.


## 담고 있는 것

<!-- counts:start -->
| 부·편 | chunk 수 |
|---|---:|
| 兩部大法相承師資付法記 | 3 |
| **합** | **3** |

chunk 가 놓인 층: level3 3. 연대(dateOccured) 붙은 chunk 0, 본문이 빈 chunk 0, 본문 글자 수 427.
주석 4(원주 4), 색인어 60(이름 34 · 지명 16 · 국명 8 · 서명 2).
<!-- counts:end -->

[공공데이터포털](https://www.data.go.kr/data/15053631/fileData.do)의 이용허락범위 제한 없음 표시를 2026-09-06 확인했다.
국편 웹 원문을 수집하지 않고 벌크 XML을 사용했다. 위 수치는 `scripts/fill_card_counts.py`와 같은 코드로 센다.
