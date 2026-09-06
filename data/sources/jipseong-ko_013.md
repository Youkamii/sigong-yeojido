---
type: "Source"
id: "src-jipseong-ko_013"
label: "風俗通義"
labelHanja: "風俗通義"
sourceKind: "사료집성 발췌"
sourceGroup: "한국고대사료집성"
composedYear: null
coversFrom: null
coversTo: null
originalLanguage: "hanmun"
sourceLevelId: "ko_013"
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

# 風俗通義

국편 한국고대사료집성 중국편에 실린 『風俗通義』의 한국사 관련 발췌다.
사서 전체 원문을 수록한 것으로 표시하지 않는다. 국편 사서 id `ko_013`를 Source 이름에 쓴다.
같은 한글 이름을 가진 다른 사서도 id가 달라 합쳐지지 않는다.

## 연도 근거와 한계

편찬 시점은 XML의 `source/dateIssued`에서 단일 연도나 정확한 날짜를 옮긴 값이다. 원표기: `빈값`.
역사적 편찬 연도를 별도 문헌으로 확정한 값은 아니다. 빈값·세기·추정·초간 연도·저자 생몰년이면 점을 찍지 않는다.
현대 자료집의 간행 연도 2006을 고대 사서의 편찬 시점으로 쓰지 않는다.
수록 기간은 이 발췌에서 XML `dateOccured`에 정확한 연도가 붙은 조각들의 최솟값·최댓값이다.
현재 범위: None~None. 날짜가 전혀 없으면 막대도 미상이다.
이 범위는 사서 전체의 범위나 인물의 생몰년이 아니다. 저자 원표기 `응소(應劭)`도 XML의 서지 정보로만 보존한다.
표제는 `mainTitle`을 쓴다. 설명 요소의 name 속성에는 다른 책 이름을 복사한 흔적이 있어 표제로 쓰지 않는다.

## 국편 서지 설명

『風俗通義』는 『風俗通』이라고도 부르는데, 後漢의 應劭가 撰하였다. 應劭는 字가 仲遠으로 汝南 南頓人이다. 獻帝時 太山太守를 지내고 후에 袁紹를 섬겨 軍謀校尉가 되었따. 原書는 32卷인데 현재는 10卷만 전해지고 있다. 北宋의 蘇頌이 정리하였으며, 「皇覇」, 「正失」, 「愆禮」, 「過譽」, 「十反」, 「聲音」, 「窮通」, 「祀典」, 「神經」, 「山澤」 十目 등 137條를 포괄하고 있다. 原始 儒家理論을 담고 있으며, 古代歷史, 風俗禮儀, 時人流品, 音律器樂, 山河藪澤, 怪異傳聞 등을 論考하였다. 각 叢書本은 많으며, 『四部叢刊』 影元大德本이 較佳하며, 『四部備要』本, 『叢書集成』本이 通行되고 있다. 注本으로는 1980년 天津 人民出版社版 吳樹平의 『風俗通義校釋』, 1981년 中華書局版 王利器의 『風俗通義校注』가 있다. 이 자료집에서는 上海 中華書局에서 漢魏叢書本校刊에 바탕한 『四部備要』本에 의거하여, 한국사와 직·간접적으로 관련이 있는 부분을 발췌하여 수록하였다.

## 재현

`services/ingestion/extract_jipseong.py`와 `docs/research/jipseong-ingestion.md`를 따른다.
벌크 설명과 실제 XML의 사서 수 차이도 그 문서에 남겼다. 서지 머리말 원문은 추출 보고서 `frontXml`로 보존한다.


## 담고 있는 것

<!-- counts:start -->
| 부·편 | chunk 수 |
|---|---:|
| 風俗通義 | 2 |
| **합** | **2** |

chunk 가 놓인 층: level3 2. 연대(dateOccured) 붙은 chunk 0, 본문이 빈 chunk 0, 본문 글자 수 372.
주석 0(), 색인어 32(이름 15 · 국명 7 · 서명 6 · 지명 4).
<!-- counts:end -->

[공공데이터포털](https://www.data.go.kr/data/15053631/fileData.do)의 이용허락범위 제한 없음 표시를 2026-09-06 확인했다.
국편 웹 원문을 수집하지 않고 벌크 XML을 사용했다. 위 수치는 `scripts/fill_card_counts.py`와 같은 코드로 센다.
