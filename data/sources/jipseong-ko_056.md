---
type: "Source"
id: "src-jipseong-ko_056"
label: "弘贊法華傳"
labelHanja: "弘贊法華傳"
sourceKind: "사료집성 발췌"
sourceGroup: "한국고대사료집성"
composedYear: null
coversFrom: null
coversTo: null
originalLanguage: "hanmun"
sourceLevelId: "ko_056"
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

# 弘贊法華傳

국편 한국고대사료집성 중국편에 실린 『弘贊法華傳』의 한국사 관련 발췌다.
사서 전체 원문을 수록한 것으로 표시하지 않는다. 국편 사서 id `ko_056`를 Source 이름에 쓴다.
같은 한글 이름을 가진 다른 사서도 id가 달라 합쳐지지 않는다.

## 연도 근거와 한계

편찬 시점은 XML의 `source/dateIssued`에서 단일 연도나 정확한 날짜를 옮긴 값이다. 원표기: `당대(唐代) 706년 이후`.
역사적 편찬 연도를 별도 문헌으로 확정한 값은 아니다. 빈값·세기·추정·초간 연도·저자 생몰년이면 점을 찍지 않는다.
현대 자료집의 간행 연도 2006을 고대 사서의 편찬 시점으로 쓰지 않는다.
수록 기간은 이 발췌에서 XML `dateOccured`에 정확한 연도가 붙은 조각들의 최솟값·최댓값이다.
현재 범위: None~None. 날짜가 전혀 없으면 막대도 미상이다.
이 범위는 사서 전체의 범위나 인물의 생몰년이 아니다. 저자 원표기 `혜상(恵詳)`도 XML의 서지 정보로만 보존한다.
표제는 `mainTitle`을 쓴다. 설명 요소의 name 속성에는 다른 책 이름을 복사한 흔적이 있어 표제로 쓰지 않는다.

## 국편 서지 설명

『弘贊法華傳』은 唐나라 때의 승려 恵詳이 찬술한 것으로 『法華傳』으로 약칭되기도 한다. 중국의 東晋 때부터 唐나라 중기까지의 『法華經』의 유통에 관한 여러 이야기들을 모아놓은 책이다. 찬술시기 및 찬술자 恵詳의 전기는 명확하지 않지만 본문 내용 중에 神竜 2年(706)의 기사가 있는 것으로 보아 그 이후에 찬술된 것으로 생각된다. 전체 10권으로 이루어져 있으며, ①圖像(巻1), ②翻訳(巻2), ③講解(巻3), ④修観(巻4), ⑤遺身(巻5), ⑥誦持(巻6-8), ⑦転読(巻9), ⑧書写(巻10) 등의 8科로 구성되어 있다. 『高僧傳』 및 『続高僧傳』의 내용과 공통되는 것이 많지만 한편으로 다른 곳에는 보이지 않고 이 책에만 나오는 내용도 있어서 귀중한 가치를 갖는다. 한국과 관련된 기록으로는 新羅의 縁光(巻3,　講解), 百済의 慧顕(巻8,　誦持), 新羅 金果毅의 아들 이야기(巻9,　転読) 등이 있으며, 그 밖에 권10의 書写篇에는 고구려의 지명이 거명되고 있다. 현재 전하는 가장 오래된 寫本은 1120년 일본에서 필사된 것인데, 여기에는 1115년 高麗에서 간행하였다는 刊記가 필사되어 있다.

## 재현

`services/ingestion/extract_jipseong.py`와 `docs/research/jipseong-ingestion.md`를 따른다.
벌크 설명과 실제 XML의 사서 수 차이도 그 문서에 남겼다. 서지 머리말 원문은 추출 보고서 `frontXml`로 보존한다.


## 담고 있는 것

<!-- counts:start -->
| 부·편 | chunk 수 |
|---|---:|
| 弘贊法華傳 | 8 |
| **합** | **8** |

chunk 가 놓인 층: level3 8. 연대(dateOccured) 붙은 chunk 0, 본문이 빈 chunk 0, 본문 글자 수 2,250.
주석 0(), 색인어 108(이름 36 · 국명 26 · 서명 19 · 지명 18 · 연호 9).
<!-- counts:end -->

[공공데이터포털](https://www.data.go.kr/data/15053631/fileData.do)의 이용허락범위 제한 없음 표시를 2026-09-06 확인했다.
국편 웹 원문을 수집하지 않고 벌크 XML을 사용했다. 위 수치는 `scripts/fill_card_counts.py`와 같은 코드로 센다.
