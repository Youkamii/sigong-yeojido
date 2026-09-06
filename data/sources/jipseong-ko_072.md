---
type: "Source"
id: "src-jipseong-ko_072"
label: "指月錄"
labelHanja: "指月錄"
sourceKind: "사료집성 발췌"
sourceGroup: "한국고대사료집성"
composedYear: 1601
coversFrom: null
coversTo: null
originalLanguage: "hanmun"
sourceLevelId: "ko_072"
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

# 指月錄

국편 한국고대사료집성 중국편에 실린 『指月錄』의 한국사 관련 발췌다.
사서 전체 원문을 수록한 것으로 표시하지 않는다. 국편 사서 id `ko_072`를 Source 이름에 쓴다.
같은 한글 이름을 가진 다른 사서도 id가 달라 합쳐지지 않는다.

## 연도 근거와 한계

편찬 시점은 XML의 `source/dateIssued`에서 단일 연도나 정확한 날짜를 옮긴 값이다. 원표기: `1601년`.
역사적 편찬 연도를 별도 문헌으로 확정한 값은 아니다. 빈값·세기·추정·초간 연도·저자 생몰년이면 점을 찍지 않는다.
현대 자료집의 간행 연도 2006을 고대 사서의 편찬 시점으로 쓰지 않는다.
수록 기간은 이 발췌에서 XML `dateOccured`에 정확한 연도가 붙은 조각들의 최솟값·최댓값이다.
현재 범위: None~None. 날짜가 전혀 없으면 막대도 미상이다.
이 범위는 사서 전체의 범위나 인물의 생몰년이 아니다. 저자 원표기 `구여직(瞿汝稷)`도 XML의 서지 정보로만 보존한다.
표제는 `mainTitle`을 쓴다. 설명 요소의 name 속성에는 다른 책 이름을 복사한 흔적이 있어 표제로 쓰지 않는다.

## 국편 서지 설명

『指月錄』은 『水月齋指月錄』이라고도 하며 明나라 때의 瞿汝稷이 찬술한 禪宗 승려들의 전기집이다. 萬暦 29년(1601)에 편찬되었고, 곧바로 간행작업을 시작하여 다음 해에 간행이 완료되었다. 모두 32권으로 구성되어 있으며, 過去 7佛에서 시작하여 應化의 聖賢, 西天 28祖, 東土 6祖, 6祖下 16世에 이르는 총 650명에 달하는 禅匠들의 행적 및 이들이 깨달음을 얻게된 機縁과 관련되는 語句들을 모아 수록하였다. 마지막 2권은 南宋代의 선승으로 看話禪을 완성시킨 大慧宗杲의 語要로 구성되어 있다. 제목은 선종에서 깨달음 자체를 달[月], 경전의 가르침을 달을 가리키는 손가락[指]으로 이야기하는 것에서 비롯된 것으로 경전보다 깨달음 자체를 중시한다는 의미를 가지고 있다. 淸나라 때에는 유학자 聶先이 이 책에 수록되지 못한 南宋 隆興 2年(1164)부터 淸 康熙 18年(1679)까지 활약한 선승들의 전기를 모은 『續指月錄』20권을 편찬하기도 하였다. 한국과 관련되는 내용으로는 高麗観音 즉 고구려의 관음보살상과 관련되는 이야기와 元暁의 전기가 巻7에 실려있고, 卷11에는 新羅大茅和尚의 일화가 수록되어 있다.

## 재현

`services/ingestion/extract_jipseong.py`와 `docs/research/jipseong-ingestion.md`를 따른다.
벌크 설명과 실제 XML의 사서 수 차이도 그 문서에 남겼다. 서지 머리말 원문은 추출 보고서 `frontXml`로 보존한다.


## 담고 있는 것

<!-- counts:start -->
| 부·편 | chunk 수 |
|---|---:|
| 指月錄 | 3 |
| **합** | **3** |

chunk 가 놓인 층: level3 3. 연대(dateOccured) 붙은 chunk 0, 본문이 빈 chunk 0, 본문 글자 수 552.
주석 0(), 색인어 31(이름 17 · 국명 6 · 지명 5 · 서명 2 · 연호 1).
<!-- counts:end -->

[공공데이터포털](https://www.data.go.kr/data/15053631/fileData.do)의 이용허락범위 제한 없음 표시를 2026-09-06 확인했다.
국편 웹 원문을 수집하지 않고 벌크 XML을 사용했다. 위 수치는 `scripts/fill_card_counts.py`와 같은 코드로 센다.
