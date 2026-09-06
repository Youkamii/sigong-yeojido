---
type: "Source"
id: "src-jipseong-ko_087"
label: "二諦義"
labelHanja: "二諦義"
sourceKind: "사료집성 발췌"
sourceGroup: "한국고대사료집성"
composedYear: null
coversFrom: null
coversTo: null
originalLanguage: "hanmun"
sourceLevelId: "ko_087"
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

# 二諦義

국편 한국고대사료집성 중국편에 실린 『二諦義』의 한국사 관련 발췌다.
사서 전체 원문을 수록한 것으로 표시하지 않는다. 국편 사서 id `ko_087`를 Source 이름에 쓴다.
같은 한글 이름을 가진 다른 사서도 id가 달라 합쳐지지 않는다.

## 연도 근거와 한계

편찬 시점은 XML의 `source/dateIssued`에서 단일 연도나 정확한 날짜를 옮긴 값이다. 원표기: `(길장 549~623)`.
역사적 편찬 연도를 별도 문헌으로 확정한 값은 아니다. 빈값·세기·추정·초간 연도·저자 생몰년이면 점을 찍지 않는다.
현대 자료집의 간행 연도 2006을 고대 사서의 편찬 시점으로 쓰지 않는다.
수록 기간은 이 발췌에서 XML `dateOccured`에 정확한 연도가 붙은 조각들의 최솟값·최댓값이다.
현재 범위: None~None. 날짜가 전혀 없으면 막대도 미상이다.
이 범위는 사서 전체의 범위나 인물의 생몰년이 아니다. 저자 원표기 `길장(吉蔵)`도 XML의 서지 정보로만 보존한다.
표제는 `mainTitle`을 쓴다. 설명 요소의 name 속성에는 다른 책 이름을 복사한 흔적이 있어 표제로 쓰지 않는다.

## 국편 서지 설명

『二諦義』는 『二諦章』이라고도 하며 三論宗의 대표적 이론가인 吉蔵(549-623)이 三論敎學의 중요한 개념 중 하나인 二諦의 의미에 대하여 설명한 저술이다. 전체 3권이며, 大意·釋名·相卽義·物體·絶名·攝法·同異 등 7科로 구성되어 있다. 二諦는 궁극적 진리인 眞諦와 세속적 진리인 俗諦를 가리키는 것으로서 대승경전이 소개된 초기부터 이 둘의 차이에 대하여 많은 논의가 이루어졌다. 길장은 종래의 논의들이 二諦 특히 眞諦를 실체시하는 것을 비판하고 가르침일 뿐이라고 하였다. 이 책에의 내용에는 자신의 스승인 山中法師의 스승이 遼東人이라고 이야기하고 있는데, 그는 곧 고구려 출신의 僧朗으로 중국 삼론학의 기반을 닦은 인물이다. 삼론종의 기본적 입장과 승랑의 사상 내용을 알 수 있는 자료이다.

## 재현

`services/ingestion/extract_jipseong.py`와 `docs/research/jipseong-ingestion.md`를 따른다.
벌크 설명과 실제 XML의 사서 수 차이도 그 문서에 남겼다. 서지 머리말 원문은 추출 보고서 `frontXml`로 보존한다.


## 담고 있는 것

<!-- counts:start -->
| 부·편 | chunk 수 |
|---|---:|
| 二諦義 | 1 |
| **합** | **1** |

chunk 가 놓인 층: level3 1. 연대(dateOccured) 붙은 chunk 0, 본문이 빈 chunk 0, 본문 글자 수 303.
주석 0(), 색인어 19(이름 11 · 서명 4 · 지명 4).
<!-- counts:end -->

[공공데이터포털](https://www.data.go.kr/data/15053631/fileData.do)의 이용허락범위 제한 없음 표시를 2026-09-06 확인했다.
국편 웹 원문을 수집하지 않고 벌크 XML을 사용했다. 위 수치는 `scripts/fill_card_counts.py`와 같은 코드로 센다.
