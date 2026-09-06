---
type: "Source"
id: "src-jipseong-ko_068"
label: "林間錄"
labelHanja: "林間錄"
sourceKind: "사료집성 발췌"
sourceGroup: "한국고대사료집성"
composedYear: 1107
coversFrom: null
coversTo: null
originalLanguage: "hanmun"
sourceLevelId: "ko_068"
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

# 林間錄

국편 한국고대사료집성 중국편에 실린 『林間錄』의 한국사 관련 발췌다.
사서 전체 원문을 수록한 것으로 표시하지 않는다. 국편 사서 id `ko_068`를 Source 이름에 쓴다.
같은 한글 이름을 가진 다른 사서도 id가 달라 합쳐지지 않는다.

## 연도 근거와 한계

편찬 시점은 XML의 `source/dateIssued`에서 단일 연도나 정확한 날짜를 옮긴 값이다. 원표기: `1107년`.
역사적 편찬 연도를 별도 문헌으로 확정한 값은 아니다. 빈값·세기·추정·초간 연도·저자 생몰년이면 점을 찍지 않는다.
현대 자료집의 간행 연도 2006을 고대 사서의 편찬 시점으로 쓰지 않는다.
수록 기간은 이 발췌에서 XML `dateOccured`에 정확한 연도가 붙은 조각들의 최솟값·최댓값이다.
현재 범위: None~None. 날짜가 전혀 없으면 막대도 미상이다.
이 범위는 사서 전체의 범위나 인물의 생몰년이 아니다. 저자 원표기 `각범혜홍(覺範慧洪)`도 XML의 서지 정보로만 보존한다.
표제는 `mainTitle`을 쓴다. 설명 요소의 name 속성에는 다른 책 이름을 복사한 흔적이 있어 표제로 쓰지 않는다.

## 국편 서지 설명

『林間錄』은 송나라 때의 禪宗 승려인 覚範慧洪(1071-1128)이 1107년에 저술한 책으로 불교와 관련된 여러 이야기들을 수록한 일화집이다. 전체 2卷이며, 책의 제목은 문장을 즐기는 林間의 선비들과 주고받은 이야기라는 뜻으로 수록된 내용은 옛 尊宿들의 高行, 叢林의 遺訓, 여러 부처와 보살들의 微旨, 어진 선비들의 逸話 등이다. 한국의 승려들과 관련하여서는 元曉의 傳記가 수록되어 있고, 北宋代 有誠法師에 대한 이야기 중에 大覺國師 義天과 관련되는 내용이 나온다. 또한 『金剛三昧經』에 관한 서술 중에도 원효에 대하여 언급하고 있다.

## 재현

`services/ingestion/extract_jipseong.py`와 `docs/research/jipseong-ingestion.md`를 따른다.
벌크 설명과 실제 XML의 사서 수 차이도 그 문서에 남겼다. 서지 머리말 원문은 추출 보고서 `frontXml`로 보존한다.


## 담고 있는 것

<!-- counts:start -->
| 부·편 | chunk 수 |
|---|---:|
| 林間錄 | 3 |
| **합** | **3** |

chunk 가 놓인 층: level3 3. 연대(dateOccured) 붙은 chunk 0, 본문이 빈 chunk 0, 본문 글자 수 632.
주석 0(), 색인어 28(이름 11 · 지명 8 · 서명 5 · 국명 3 · 연호 1).
<!-- counts:end -->

[공공데이터포털](https://www.data.go.kr/data/15053631/fileData.do)의 이용허락범위 제한 없음 표시를 2026-09-06 확인했다.
국편 웹 원문을 수집하지 않고 벌크 XML을 사용했다. 위 수치는 `scripts/fill_card_counts.py`와 같은 코드로 센다.
