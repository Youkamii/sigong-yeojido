---
type: "Source"
id: "src-jipseong-ko_082"
label: "中華傳心地禪門師資承襲圖"
labelHanja: "中華傳心地禪門師資承襲圖"
sourceKind: "사료집성 발췌"
sourceGroup: "한국고대사료집성"
composedYear: null
coversFrom: null
coversTo: null
originalLanguage: "hanmun"
sourceLevelId: "ko_082"
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

# 中華傳心地禪門師資承襲圖

국편 한국고대사료집성 중국편에 실린 『中華傳心地禪門師資承襲圖』의 한국사 관련 발췌다.
사서 전체 원문을 수록한 것으로 표시하지 않는다. 국편 사서 id `ko_082`를 Source 이름에 쓴다.
같은 한글 이름을 가진 다른 사서도 id가 달라 합쳐지지 않는다.

## 연도 근거와 한계

편찬 시점은 XML의 `source/dateIssued`에서 단일 연도나 정확한 날짜를 옮긴 값이다. 원표기: `(규봉종밀 780년~841년)`.
역사적 편찬 연도를 별도 문헌으로 확정한 값은 아니다. 빈값·세기·추정·초간 연도·저자 생몰년이면 점을 찍지 않는다.
현대 자료집의 간행 연도 2006을 고대 사서의 편찬 시점으로 쓰지 않는다.
수록 기간은 이 발췌에서 XML `dateOccured`에 정확한 연도가 붙은 조각들의 최솟값·최댓값이다.
현재 범위: None~None. 날짜가 전혀 없으면 막대도 미상이다.
이 범위는 사서 전체의 범위나 인물의 생몰년이 아니다. 저자 원표기 `규봉종밀(圭峰宗密)`도 XML의 서지 정보로만 보존한다.
표제는 `mainTitle`을 쓴다. 설명 요소의 name 속성에는 다른 책 이름을 복사한 흔적이 있어 표제로 쓰지 않는다.

## 국편 서지 설명

『中華心地禪門師資承襲圖』는 華厳宗의 제5조로 일컬어지는 圭峰宗密(780-841)의 저술로 그가 裴休(797-870)의 질문에 답한 내용을 정리하였기 때문에 『裴休拾遺問』이라고도 불린다. 1권의 분량으로 唐代에 발전하였던 牛頭宗, 北宗, 南宗, 荷沢宗, 洪州宗 등의 禅宗 분파들에 대하여 각각의 師資相承과 가르침의 내용에 대하여 설명하는 내용이다. 종밀 자신이 계승한 荷沢宗을 가장 뛰어난 정통적 흐름으로 인정하면서, 荷沢宗을 근본으로 하여 교종과 선종을 통합할 것을 주장하고 있다. 아울러 수행의 방법에 대하여는 頓悟漸修의 修證論을 주장하고 있다. 한국 출신의 승려와 관련하여서는 홍주종의 중심 인물인 馬祖道一(709-88)이 처음에 신라 출신의 승려인 金和尙 즉 淨衆寺 無相에게 수학하였음을 이야기하고 있다.

## 재현

`services/ingestion/extract_jipseong.py`와 `docs/research/jipseong-ingestion.md`를 따른다.
벌크 설명과 실제 XML의 사서 수 차이도 그 문서에 남겼다. 서지 머리말 원문은 추출 보고서 `frontXml`로 보존한다.


## 담고 있는 것

<!-- counts:start -->
| 부·편 | chunk 수 |
|---|---:|
| 中華傳心地禪門師資承襲圖 | 1 |
| **합** | **1** |

chunk 가 놓인 층: level3 1. 연대(dateOccured) 붙은 chunk 0, 본문이 빈 chunk 0, 본문 글자 수 66.
주석 1(원주 1), 색인어 11(이름 8 · 지명 2 · 서명 1).
<!-- counts:end -->

[공공데이터포털](https://www.data.go.kr/data/15053631/fileData.do)의 이용허락범위 제한 없음 표시를 2026-09-06 확인했다.
국편 웹 원문을 수집하지 않고 벌크 XML을 사용했다. 위 수치는 `scripts/fill_card_counts.py`와 같은 코드로 센다.
