---
type: "Source"
id: "src-jipseong-ko_076"
label: "華嚴經傳記"
labelHanja: "華嚴經傳記"
sourceKind: "사료집성 발췌"
sourceGroup: "한국고대사료집성"
composedYear: 690
coversFrom: null
coversTo: null
originalLanguage: "hanmun"
sourceLevelId: "ko_076"
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

# 華嚴經傳記

국편 한국고대사료집성 중국편에 실린 『華嚴經傳記』의 한국사 관련 발췌다.
사서 전체 원문을 수록한 것으로 표시하지 않는다. 국편 사서 id `ko_076`를 Source 이름에 쓴다.
같은 한글 이름을 가진 다른 사서도 id가 달라 합쳐지지 않는다.

## 연도 근거와 한계

편찬 시점은 XML의 `source/dateIssued`에서 단일 연도나 정확한 날짜를 옮긴 값이다. 원표기: `690년`.
역사적 편찬 연도를 별도 문헌으로 확정한 값은 아니다. 빈값·세기·추정·초간 연도·저자 생몰년이면 점을 찍지 않는다.
현대 자료집의 간행 연도 2006을 고대 사서의 편찬 시점으로 쓰지 않는다.
수록 기간은 이 발췌에서 XML `dateOccured`에 정확한 연도가 붙은 조각들의 최솟값·최댓값이다.
현재 범위: None~None. 날짜가 전혀 없으면 막대도 미상이다.
이 범위는 사서 전체의 범위나 인물의 생몰년이 아니다. 저자 원표기 `법장(法蔵)`도 XML의 서지 정보로만 보존한다.
표제는 `mainTitle`을 쓴다. 설명 요소의 name 속성에는 다른 책 이름을 복사한 흔적이 있어 표제로 쓰지 않는다.

## 국편 서지 설명

『華嚴經傳記』는 唐나라 때 華嚴宗의 대표적 이론가인 法蔵(645-712)이 嗣聖７년(690)에 편찬한 저술로 『華嚴經纂靈記』,『華嚴傳記』,『華嚴傳』 등으로도 불린다. 『華厳經』과 관련되는 여러 인물들의 事蹟을 部類·隠顕·傳訳·支流·論釈·講解·諷誦·転読·書写·雑録 등의 10門으로 구분하여 편집하였다. 모두 5권으로 구성되어 있으며, 일부 내용에는 법장 이후 시기의 사적도 언급되고 있어 그의 사후에 門人인 慧苑과 惠英 등이 증보하여 편집한 것으로 생각된다. 『高僧傳』과 『続高僧傳』에 나오는 승려의 전기에서 뽑은 자료가 많으며 『화엄경』에 대한 신앙과 그 감응의 사례를 주로 언급하고 있다. 한국 출신의 승려에 대한 전기는 따로 없으며, 다만 卷3의 「唐越州静林寺釈法敏」의 항목에 法敏이 수학과정에서 고구려 출신의 実公의 講義를 들었다는 내용이 보이고 있다.

## 재현

`services/ingestion/extract_jipseong.py`와 `docs/research/jipseong-ingestion.md`를 따른다.
벌크 설명과 실제 XML의 사서 수 차이도 그 문서에 남겼다. 서지 머리말 원문은 추출 보고서 `frontXml`로 보존한다.


## 담고 있는 것

<!-- counts:start -->
| 부·편 | chunk 수 |
|---|---:|
| 華嚴經傳記 | 1 |
| **합** | **1** |

chunk 가 놓인 층: level3 1. 연대(dateOccured) 붙은 chunk 0, 본문이 빈 chunk 0, 본문 글자 수 116.
주석 0(), 색인어 18(서명 5 · 지명 5 · 이름 5 · 국명 2 · 연호 1).
<!-- counts:end -->

[공공데이터포털](https://www.data.go.kr/data/15053631/fileData.do)의 이용허락범위 제한 없음 표시를 2026-09-06 확인했다.
국편 웹 원문을 수집하지 않고 벌크 XML을 사용했다. 위 수치는 `scripts/fill_card_counts.py`와 같은 코드로 센다.
