---
type: "Source"
id: "src-jipseong-ko_077"
label: "大方廣佛華嚴經感應傳"
labelHanja: "大方廣佛華嚴經感應傳"
sourceKind: "사료집성 발췌"
sourceGroup: "한국고대사료집성"
composedYear: 783
coversFrom: null
coversTo: null
originalLanguage: "hanmun"
sourceLevelId: "ko_077"
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

# 大方廣佛華嚴經感應傳

국편 한국고대사료집성 중국편에 실린 『大方廣佛華嚴經感應傳』의 한국사 관련 발췌다.
사서 전체 원문을 수록한 것으로 표시하지 않는다. 국편 사서 id `ko_077`를 Source 이름에 쓴다.
같은 한글 이름을 가진 다른 사서도 id가 달라 합쳐지지 않는다.

## 연도 근거와 한계

편찬 시점은 XML의 `source/dateIssued`에서 단일 연도나 정확한 날짜를 옮긴 값이다. 원표기: `783년`.
역사적 편찬 연도를 별도 문헌으로 확정한 값은 아니다. 빈값·세기·추정·초간 연도·저자 생몰년이면 점을 찍지 않는다.
현대 자료집의 간행 연도 2006을 고대 사서의 편찬 시점으로 쓰지 않는다.
수록 기간은 이 발췌에서 XML `dateOccured`에 정확한 연도가 붙은 조각들의 최솟값·최댓값이다.
현재 범위: None~None. 날짜가 전혀 없으면 막대도 미상이다.
이 범위는 사서 전체의 범위나 인물의 생몰년이 아니다. 저자 원표기 `호유정(胡幽貞)`도 XML의 서지 정보로만 보존한다.
표제는 `mainTitle`을 쓴다. 설명 요소의 name 속성에는 다른 책 이름을 복사한 흔적이 있어 표제로 쓰지 않는다.

## 국편 서지 설명

『大方廣佛華嚴經感應傳』은 唐나라 때의 『華嚴經』과 관련되는 感應 전설들을 모은 것으로, 『華嚴經感應傳』으로도 불린다. 본래 8세기초에 華嚴宗 승려 惠英이 2卷으로 편찬한 것을 建中末年(783)에 四明山의 居士 胡幽貞이 1巻으로 재편집하였다. 『화엄경』의 감응과 관계되는 저술은 후대에도 편찬되었는데, 明나라 때 袾宏이 편찬한 『華嚴經感應略記』, 淸나라 때 弘璧과 周克復이 각기 편찬한 『華嚴感應緣起傳』과 『華嚴經持驗記』 등이 있다. 한국 출신의 승려와 관련하여서는 인도 승려 日照가 중국에 와서 『華厳經』과 『密厳經』을 번역할 때에 圓測이 번역에 참여한 사실이 수록되어 있다.

## 재현

`services/ingestion/extract_jipseong.py`와 `docs/research/jipseong-ingestion.md`를 따른다.
벌크 설명과 실제 XML의 사서 수 차이도 그 문서에 남겼다. 서지 머리말 원문은 추출 보고서 `frontXml`로 보존한다.


## 담고 있는 것

<!-- counts:start -->
| 부·편 | chunk 수 |
|---|---:|
| 大方廣佛華嚴經感應傳 | 1 |
| **합** | **1** |

chunk 가 놓인 층: level3 1. 연대(dateOccured) 붙은 chunk 0, 본문이 빈 chunk 0, 본문 글자 수 111.
주석 0(), 색인어 15(이름 9 · 서명 3 · 연호 1 · 국명 1 · 지명 1).
<!-- counts:end -->

[공공데이터포털](https://www.data.go.kr/data/15053631/fileData.do)의 이용허락범위 제한 없음 표시를 2026-09-06 확인했다.
국편 웹 원문을 수집하지 않고 벌크 XML을 사용했다. 위 수치는 `scripts/fill_card_counts.py`와 같은 코드로 센다.
