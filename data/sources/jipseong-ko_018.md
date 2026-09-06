---
type: "Source"
id: "src-jipseong-ko_018"
label: "尙書大傳"
labelHanja: "尙書大傳"
sourceKind: "사료집성 발췌"
sourceGroup: "한국고대사료집성"
composedYear: null
coversFrom: null
coversTo: null
originalLanguage: "hanmun"
sourceLevelId: "ko_018"
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

# 尙書大傳

국편 한국고대사료집성 중국편에 실린 『尙書大傳』의 한국사 관련 발췌다.
사서 전체 원문을 수록한 것으로 표시하지 않는다. 국편 사서 id `ko_018`를 Source 이름에 쓴다.
같은 한글 이름을 가진 다른 사서도 id가 달라 합쳐지지 않는다.

## 연도 근거와 한계

편찬 시점은 XML의 `source/dateIssued`에서 단일 연도나 정확한 날짜를 옮긴 값이다. 원표기: `빈값`.
역사적 편찬 연도를 별도 문헌으로 확정한 값은 아니다. 빈값·세기·추정·초간 연도·저자 생몰년이면 점을 찍지 않는다.
현대 자료집의 간행 연도 2006을 고대 사서의 편찬 시점으로 쓰지 않는다.
수록 기간은 이 발췌에서 XML `dateOccured`에 정확한 연도가 붙은 조각들의 최솟값·최댓값이다.
현재 범위: None~None. 날짜가 전혀 없으면 막대도 미상이다.
이 범위는 사서 전체의 범위나 인물의 생몰년이 아니다. 저자 원표기 `복생(伏生)`도 XML의 서지 정보로만 보존한다.
표제는 `mainTitle`을 쓴다. 설명 요소의 name 속성에는 다른 책 이름을 복사한 흔적이 있어 표제로 쓰지 않는다.

## 국편 서지 설명

『尙書大傳』은 前漢의 伏生(一作 胜)이 撰한 것으로 3卷으로 되어 있다. 『漢書』 藝文志, 『隋書』 經籍志, 『新唐書』 藝文志 등에 수록되어 있다. 伏生은 同郡에 살던 張生으로부터 학문을 배우고, 張生은 千乘에 사는 歐陽生으로부터 배웠다고 한다. 『大傳』은 張生과 歐陽生의 門徒들이 所聞을 雜記하여 만든 것으라고 하며, 宋代에는 이미 完本이 없었다. 葉夢得은 首尾가 맞지 않고, 말도 고상하지 못하다고 評하였다. 劉向의 『五行傳』과 夏侯氏의 災異說이 많이 들어 있고, 孔子의 本意와는 거리가 멀다. 今本은 『洪範五行傳』이 首尾가 完備된 것을 제외하고는 나머지는 各卷 佚文만이 남아 있다. 淸代의 陳壽褀가 3卷으로 편집하였으며, 鄭玄의 注가 있고 「序錄」과 「辨譌」1篇씩이 첨부되었다. 『皇淸經解續編』에 수록되어 있고, 별도로 『叢書集成初編』本이 있다. 이 자료집에서는 『欽定四庫全書』本에 의거, 한국사와 직·간접적으로 관련이 부분을 발췌하여 수록하였다.

## 재현

`services/ingestion/extract_jipseong.py`와 `docs/research/jipseong-ingestion.md`를 따른다.
벌크 설명과 실제 XML의 사서 수 차이도 그 문서에 남겼다. 서지 머리말 원문은 추출 보고서 `frontXml`로 보존한다.


## 담고 있는 것

<!-- counts:start -->
| 부·편 | chunk 수 |
|---|---:|
| 尙書大傳 | 3 |
| **합** | **3** |

chunk 가 놓인 층: level3 3. 연대(dateOccured) 붙은 chunk 0, 본문이 빈 chunk 0, 본문 글자 수 143.
주석 0(), 색인어 15(국명 7 · 이름 6 · 지명 1 · 서명 1).
<!-- counts:end -->

[공공데이터포털](https://www.data.go.kr/data/15053631/fileData.do)의 이용허락범위 제한 없음 표시를 2026-09-06 확인했다.
국편 웹 원문을 수집하지 않고 벌크 XML을 사용했다. 위 수치는 `scripts/fill_card_counts.py`와 같은 코드로 센다.
