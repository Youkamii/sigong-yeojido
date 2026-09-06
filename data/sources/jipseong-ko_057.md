---
type: "Source"
id: "src-jipseong-ko_057"
label: "法華傳記"
labelHanja: "法華傳記"
sourceKind: "사료집성 발췌"
sourceGroup: "한국고대사료집성"
composedYear: null
coversFrom: null
coversTo: null
originalLanguage: "hanmun"
sourceLevelId: "ko_057"
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

# 法華傳記

국편 한국고대사료집성 중국편에 실린 『法華傳記』의 한국사 관련 발췌다.
사서 전체 원문을 수록한 것으로 표시하지 않는다. 국편 사서 id `ko_057`를 Source 이름에 쓴다.
같은 한글 이름을 가진 다른 사서도 id가 달라 합쳐지지 않는다.

## 연도 근거와 한계

편찬 시점은 XML의 `source/dateIssued`에서 단일 연도나 정확한 날짜를 옮긴 값이다. 원표기: `당대(唐代) 754년 이후`.
역사적 편찬 연도를 별도 문헌으로 확정한 값은 아니다. 빈값·세기·추정·초간 연도·저자 생몰년이면 점을 찍지 않는다.
현대 자료집의 간행 연도 2006을 고대 사서의 편찬 시점으로 쓰지 않는다.
수록 기간은 이 발췌에서 XML `dateOccured`에 정확한 연도가 붙은 조각들의 최솟값·최댓값이다.
현재 범위: None~None. 날짜가 전혀 없으면 막대도 미상이다.
이 범위는 사서 전체의 범위나 인물의 생몰년이 아니다. 저자 원표기 `승상(僧詳)`도 XML의 서지 정보로만 보존한다.
표제는 `mainTitle`을 쓴다. 설명 요소의 name 속성에는 다른 책 이름을 복사한 흔적이 있어 표제로 쓰지 않는다.

## 국편 서지 설명

『法華傳記』는 唐나라 때의 승려 僧詳이 찬술한 것으로 『法華經』의 유래, 漢譯, 영험담 등에 관한 事蹟들을 모아 정리한 책이다. 모두 10巻으로 이루어져 있으며 ①部類増減, ②隠顕時異, ③傳訳年代, ④支派別行, ⑤論釈不同, ⑥諸師序集(이상, 巻1), ⑦講解感應(巻2-3), ⑧諷誦勝利(巻3-6), ⑨転読滅罪(巻7), ⑩書写救苦(巻7-8), ⑪聴聞利益(巻9), ⑫依正利益(巻10) 등의 12科로 구성되어 있다. 책의 찬술시기와 편찬자 僧詳의 전기 등은 명확하지 않지만 본문의 내용으로 보아 天寶 13年(754) 이후에 완성된 것으로 생각된다. 한국과 관련된 내용으로는 新羅 縁光(卷3, 諷誦勝利)과 百済 慧顕(卷4, 諷誦勝利), 發正(巻6,　諷誦勝利) 등의 전기가 수록되어 있다. 일본의 『大正大藏經』제51책에 수록되어 있다. 이 책 이후 『법화경』과 관련된 영험담을 모아놓은 책은 여러 차례 편찬되었는데, 宋나라 때 宗曉가 편찬한 『法華經顯應錄』, 淸나라 때 周克復가 편찬한 『法華經持驗記』 등이 대표적이다. 한국에서는 고려시대에 了因이 『法華靈驗傳』을 편찬하였다.

## 재현

`services/ingestion/extract_jipseong.py`와 `docs/research/jipseong-ingestion.md`를 따른다.
벌크 설명과 실제 XML의 사서 수 차이도 그 문서에 남겼다. 서지 머리말 원문은 추출 보고서 `frontXml`로 보존한다.


## 담고 있는 것

<!-- counts:start -->
| 부·편 | chunk 수 |
|---|---:|
| 法華傳記 | 3 |
| **합** | **3** |

chunk 가 놓인 층: level3 3. 연대(dateOccured) 붙은 chunk 0, 본문이 빈 chunk 0, 본문 글자 수 1,077.
주석 0(), 색인어 37(이름 14 · 서명 9 · 국명 7 · 지명 5 · 연호 2).
<!-- counts:end -->

[공공데이터포털](https://www.data.go.kr/data/15053631/fileData.do)의 이용허락범위 제한 없음 표시를 2026-09-06 확인했다.
국편 웹 원문을 수집하지 않고 벌크 XML을 사용했다. 위 수치는 `scripts/fill_card_counts.py`와 같은 코드로 센다.
