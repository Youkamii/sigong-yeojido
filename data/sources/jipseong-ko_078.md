---
type: "Source"
id: "src-jipseong-ko_078"
label: "三寶感應要略錄"
labelHanja: "三寶感應要略錄"
sourceKind: "사료집성 발췌"
sourceGroup: "한국고대사료집성"
composedYear: null
coversFrom: null
coversTo: null
originalLanguage: "hanmun"
sourceLevelId: "ko_078"
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

# 三寶感應要略錄

국편 한국고대사료집성 중국편에 실린 『三寶感應要略錄』의 한국사 관련 발췌다.
사서 전체 원문을 수록한 것으로 표시하지 않는다. 국편 사서 id `ko_078`를 Source 이름에 쓴다.
같은 한글 이름을 가진 다른 사서도 id가 달라 합쳐지지 않는다.

## 연도 근거와 한계

편찬 시점은 XML의 `source/dateIssued`에서 단일 연도나 정확한 날짜를 옮긴 값이다. 원표기: `송대(宋代)`.
역사적 편찬 연도를 별도 문헌으로 확정한 값은 아니다. 빈값·세기·추정·초간 연도·저자 생몰년이면 점을 찍지 않는다.
현대 자료집의 간행 연도 2006을 고대 사서의 편찬 시점으로 쓰지 않는다.
수록 기간은 이 발췌에서 XML `dateOccured`에 정확한 연도가 붙은 조각들의 최솟값·최댓값이다.
현재 범위: None~None. 날짜가 전혀 없으면 막대도 미상이다.
이 범위는 사서 전체의 범위나 인물의 생몰년이 아니다. 저자 원표기 `비탁(非濁)`도 XML의 서지 정보로만 보존한다.
표제는 `mainTitle`을 쓴다. 설명 요소의 name 속성에는 다른 책 이름을 복사한 흔적이 있어 표제로 쓰지 않는다.

## 국편 서지 설명

　『三寶感應要略錄』은 宋나라 때의 승려 非濁이 여러 문헌들로부터 佛·法·僧의 三寶와 관련된 감응의 이야기들을 모아 편집한 책이다. 3권으로 구성되어 있으며, ‘佛寶聚’라는 이름의 上卷에는 佛像에 대한 감응담 50편, ‘法寶聚’라고 이름한 中卷에는 경전의 감응담 72편, ‘僧寶聚’라고 이름한 下卷에는 菩薩들이 감응하여 나타난 사례 42편이 수록되어 있다. 한국과 관련되는 내용으로는 新羅의 승려 僧兪가 처음에 阿含經을 소승이라고 하여 무시하였다가 꿈에 정토의 입구에서 無量天童子를 만나 가르침을 들은 후 이를 존중하여 정토에 왕생하였다는 이야기가 中卷에 나오고 있다. 신라시대의 정토신앙과 아함경에 대한 인식을 알게 하는 중요한 자료이다.

## 재현

`services/ingestion/extract_jipseong.py`와 `docs/research/jipseong-ingestion.md`를 따른다.
벌크 설명과 실제 XML의 사서 수 차이도 그 문서에 남겼다. 서지 머리말 원문은 추출 보고서 `frontXml`로 보존한다.


## 담고 있는 것

<!-- counts:start -->
| 부·편 | chunk 수 |
|---|---:|
| 三寶感應要略錄 | 1 |
| **합** | **1** |

chunk 가 놓인 층: level3 1. 연대(dateOccured) 붙은 chunk 0, 본문이 빈 chunk 0, 본문 글자 수 229.
주석 0(), 색인어 12(서명 5 · 이름 4 · 국명 3).
<!-- counts:end -->

[공공데이터포털](https://www.data.go.kr/data/15053631/fileData.do)의 이용허락범위 제한 없음 표시를 2026-09-06 확인했다.
국편 웹 원문을 수집하지 않고 벌크 XML을 사용했다. 위 수치는 `scripts/fill_card_counts.py`와 같은 코드로 센다.
