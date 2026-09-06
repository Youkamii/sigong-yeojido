---
type: "Source"
id: "src-jipseong-ko_014"
label: "潛夫論"
labelHanja: "潛夫論"
sourceKind: "사료집성 발췌"
sourceGroup: "한국고대사료집성"
composedYear: null
coversFrom: null
coversTo: null
originalLanguage: "hanmun"
sourceLevelId: "ko_014"
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

# 潛夫論

국편 한국고대사료집성 중국편에 실린 『潛夫論』의 한국사 관련 발췌다.
사서 전체 원문을 수록한 것으로 표시하지 않는다. 국편 사서 id `ko_014`를 Source 이름에 쓴다.
같은 한글 이름을 가진 다른 사서도 id가 달라 합쳐지지 않는다.

## 연도 근거와 한계

편찬 시점은 XML의 `source/dateIssued`에서 단일 연도나 정확한 날짜를 옮긴 값이다. 원표기: `빈값`.
역사적 편찬 연도를 별도 문헌으로 확정한 값은 아니다. 빈값·세기·추정·초간 연도·저자 생몰년이면 점을 찍지 않는다.
현대 자료집의 간행 연도 2006을 고대 사서의 편찬 시점으로 쓰지 않는다.
수록 기간은 이 발췌에서 XML `dateOccured`에 정확한 연도가 붙은 조각들의 최솟값·최댓값이다.
현재 범위: None~None. 날짜가 전혀 없으면 막대도 미상이다.
이 범위는 사서 전체의 범위나 인물의 생몰년이 아니다. 저자 원표기 `왕부(王符)`도 XML의 서지 정보로만 보존한다.
표제는 `mainTitle`을 쓴다. 설명 요소의 name 속성에는 다른 책 이름을 복사한 흔적이 있어 표제로 쓰지 않는다.

## 국편 서지 설명

『潛夫論』은 後漢代 王符(約 85~163)의 作으로 10卷 35篇으로 되어 있다. 별도로 敍錄 1篇이 있다. 王符는 字가 節信이고 자칭 潛夫라고 하였다. 어려서부터 학문을 좋아하고 志操가 있었으나, 세상과는 不合하여 평생 隱居生活을 하였다. 著書로서 當世의 得失을 譏笑하였다. 政治上으로는 先秦의 民本思想을 계승하여, 나라에서 백성이 基本임을 주장하고, 商工業을 억제하고 農業을 장려하여 富國富民을 이루어야 한다고 하였다. 즉, 그는 後漢의 후기적 社會·政治에 대해 예리한 비판을 하였다. 宗敎上으로는 迷信에 대하여 비판적인 태도를 취하였다. 『隋書』 經籍志와 『舊唐書』經籍志에 36篇이 著錄되었다. 無注本으로는 明 萬歷中에 新安 程氏刻의 『漢魏叢書』本, 『四部叢刊』本이 있고, 淸代 汪繼培가 校注한 『潛夫論』과 1979년에 나온 北京 中華書局印本이 있다. 이 자료집에서는 上海 中華書局에서 湖海樓 陳氏本校刊에 바탕한 『四部備要』本에 의거하여, 한국사와 직·간접적으로 관련이 있는 부분을 발췌하여 수록하였다.

## 재현

`services/ingestion/extract_jipseong.py`와 `docs/research/jipseong-ingestion.md`를 따른다.
벌크 설명과 실제 XML의 사서 수 차이도 그 문서에 남겼다. 서지 머리말 원문은 추출 보고서 `frontXml`로 보존한다.


## 담고 있는 것

<!-- counts:start -->
| 부·편 | chunk 수 |
|---|---:|
| 潛夫論 | 7 |
| **합** | **7** |

chunk 가 놓인 층: level3 7. 연대(dateOccured) 붙은 chunk 0, 본문이 빈 chunk 0, 본문 글자 수 398.
주석 18(원주 18), 색인어 157(이름 63 · 서명 53 · 국명 31 · 지명 8 · 연호 2).
<!-- counts:end -->

[공공데이터포털](https://www.data.go.kr/data/15053631/fileData.do)의 이용허락범위 제한 없음 표시를 2026-09-06 확인했다.
국편 웹 원문을 수집하지 않고 벌크 XML을 사용했다. 위 수치는 `scripts/fill_card_counts.py`와 같은 코드로 센다.
