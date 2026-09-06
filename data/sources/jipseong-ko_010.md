---
type: "Source"
id: "src-jipseong-ko_010"
label: "揚子法言"
labelHanja: "揚子法言"
sourceKind: "사료집성 발췌"
sourceGroup: "한국고대사료집성"
composedYear: null
coversFrom: null
coversTo: null
originalLanguage: "hanmun"
sourceLevelId: "ko_010"
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

# 揚子法言

국편 한국고대사료집성 중국편에 실린 『揚子法言』의 한국사 관련 발췌다.
사서 전체 원문을 수록한 것으로 표시하지 않는다. 국편 사서 id `ko_010`를 Source 이름에 쓴다.
같은 한글 이름을 가진 다른 사서도 id가 달라 합쳐지지 않는다.

## 연도 근거와 한계

편찬 시점은 XML의 `source/dateIssued`에서 단일 연도나 정확한 날짜를 옮긴 값이다. 원표기: `빈값`.
역사적 편찬 연도를 별도 문헌으로 확정한 값은 아니다. 빈값·세기·추정·초간 연도·저자 생몰년이면 점을 찍지 않는다.
현대 자료집의 간행 연도 2006을 고대 사서의 편찬 시점으로 쓰지 않는다.
수록 기간은 이 발췌에서 XML `dateOccured`에 정확한 연도가 붙은 조각들의 최솟값·최댓값이다.
현재 범위: None~None. 날짜가 전혀 없으면 막대도 미상이다.
이 범위는 사서 전체의 범위나 인물의 생몰년이 아니다. 저자 원표기 `양웅(揚雄)`도 XML의 서지 정보로만 보존한다.
표제는 `mainTitle`을 쓴다. 설명 요소의 name 속성에는 다른 책 이름을 복사한 흔적이 있어 표제로 쓰지 않는다.

## 국편 서지 설명

『揚子法言』은 漢代 揚雄이 편찬하였는데 10卷으로 되어 있다. 揚雄은 『太玄』이라는 별도의 著錄이 있다. 『揚子法言』은 「學行」, 「吾子」, 「修身」, 「問道」, 「問神」, 「問明」, 「寡見」, 「五百」, 「先知」, 「重黎」, 「淵騫」, 「君子」, 「孝至」등 13篇으로 되어 있다. 聖人을 존중하고 王道를 논하였으며, 儒家의 傳統思想을 선전한 책이다. 揚雄은 天地交, 萬物生과 有生必有死, 有始必有終이 自然의 道라고 주장하였다. 또 學以治之, 思以精之를 제창하였다. 『揚子法言』은 宋刻大字本, 民國 25년에 寧武 南氏가 印行한 『劉申叔遺書』本, 1958년 中華書局重印의 『諸子集成』本이 있다. 이 자료집에서는 上海 中華書局에서 江都 秦氏本校刊에 바탕한 『四部備要』本에 의거하여, 한국사와 직·간접적으로 관련이 있는 부분을 발췌하여 수록하였다.

## 재현

`services/ingestion/extract_jipseong.py`와 `docs/research/jipseong-ingestion.md`를 따른다.
벌크 설명과 실제 XML의 사서 수 차이도 그 문서에 남겼다. 서지 머리말 원문은 추출 보고서 `frontXml`로 보존한다.


## 담고 있는 것

<!-- counts:start -->
| 부·편 | chunk 수 |
|---|---:|
| 揚子法言 | 7 |
| **합** | **7** |

chunk 가 놓인 층: level3 7. 연대(dateOccured) 붙은 chunk 0, 본문이 빈 chunk 0, 본문 글자 수 478.
주석 6(원주 6), 색인어 35(이름 17 · 국명 11 · 서명 4 · 지명 3).
<!-- counts:end -->

[공공데이터포털](https://www.data.go.kr/data/15053631/fileData.do)의 이용허락범위 제한 없음 표시를 2026-09-06 확인했다.
국편 웹 원문을 수집하지 않고 벌크 XML을 사용했다. 위 수치는 `scripts/fill_card_counts.py`와 같은 코드로 센다.
