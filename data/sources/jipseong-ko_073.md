---
type: "Source"
id: "src-jipseong-ko_073"
label: "高僧摘要"
labelHanja: "高僧摘要"
sourceKind: "사료집성 발췌"
sourceGroup: "한국고대사료집성"
composedYear: 1654
coversFrom: null
coversTo: null
originalLanguage: "hanmun"
sourceLevelId: "ko_073"
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

# 高僧摘要

국편 한국고대사료집성 중국편에 실린 『高僧摘要』의 한국사 관련 발췌다.
사서 전체 원문을 수록한 것으로 표시하지 않는다. 국편 사서 id `ko_073`를 Source 이름에 쓴다.
같은 한글 이름을 가진 다른 사서도 id가 달라 합쳐지지 않는다.

## 연도 근거와 한계

편찬 시점은 XML의 `source/dateIssued`에서 단일 연도나 정확한 날짜를 옮긴 값이다. 원표기: `1654년`.
역사적 편찬 연도를 별도 문헌으로 확정한 값은 아니다. 빈값·세기·추정·초간 연도·저자 생몰년이면 점을 찍지 않는다.
현대 자료집의 간행 연도 2006을 고대 사서의 편찬 시점으로 쓰지 않는다.
수록 기간은 이 발췌에서 XML `dateOccured`에 정확한 연도가 붙은 조각들의 최솟값·최댓값이다.
현재 범위: None~None. 날짜가 전혀 없으면 막대도 미상이다.
이 범위는 사서 전체의 범위나 인물의 생몰년이 아니다. 저자 원표기 `서창치(徐昌治)`도 XML의 서지 정보로만 보존한다.
표제는 `mainTitle`을 쓴다. 설명 요소의 name 속성에는 다른 책 이름을 복사한 흔적이 있어 표제로 쓰지 않는다.

## 국편 서지 설명

『高僧摘要』는 清나라 때의 徐昌治가 편찬한 고승들의 전기집으로 順治 11年(1654)에 간행되었다. 모두 4卷으로 이루어져 있으며, 중국에 불교가 전래된 後漢代부터 淸나라 초기까지의 高僧들 173인의 전기를 수록하고 있다. 다른 고승전들이 승려들의 활동 내용에 따라 譯經, 義解 등으로 구분하고 있는 것과 달리 道·法·品·化로 나누어 각각의 덕이 높은 승려들을 40여 명씩 골라서 그와 관련된 機緣을 수록하고 있다. 한국 출신의 승려들로는 真表(巻2), 圓光·慈蔵(巻3), 義湘·元暁(巻4) 등 5人의 전기가 수록되어 있다.

## 재현

`services/ingestion/extract_jipseong.py`와 `docs/research/jipseong-ingestion.md`를 따른다.
벌크 설명과 실제 XML의 사서 수 차이도 그 문서에 남겼다. 서지 머리말 원문은 추출 보고서 `frontXml`로 보존한다.


## 담고 있는 것

<!-- counts:start -->
| 부·편 | chunk 수 |
|---|---:|
| 高僧摘要 | 5 |
| **합** | **5** |

chunk 가 놓인 층: level3 5. 연대(dateOccured) 붙은 chunk 0, 본문이 빈 chunk 0, 본문 글자 수 4,600.
주석 1(원주 1), 색인어 143(이름 77 · 지명 24 · 국명 22 · 서명 14 · 연호 6).
<!-- counts:end -->

[공공데이터포털](https://www.data.go.kr/data/15053631/fileData.do)의 이용허락범위 제한 없음 표시를 2026-09-06 확인했다.
국편 웹 원문을 수집하지 않고 벌크 XML을 사용했다. 위 수치는 `scripts/fill_card_counts.py`와 같은 코드로 센다.
