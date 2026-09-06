---
type: "Source"
id: "src-jipseong-ko_012"
label: "易林"
labelHanja: "易林"
sourceKind: "사료집성 발췌"
sourceGroup: "한국고대사료집성"
composedYear: null
coversFrom: null
coversTo: null
originalLanguage: "hanmun"
sourceLevelId: "ko_012"
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

# 易林

국편 한국고대사료집성 중국편에 실린 『易林』의 한국사 관련 발췌다.
사서 전체 원문을 수록한 것으로 표시하지 않는다. 국편 사서 id `ko_012`를 Source 이름에 쓴다.
같은 한글 이름을 가진 다른 사서도 id가 달라 합쳐지지 않는다.

## 연도 근거와 한계

편찬 시점은 XML의 `source/dateIssued`에서 단일 연도나 정확한 날짜를 옮긴 값이다. 원표기: `빈값`.
역사적 편찬 연도를 별도 문헌으로 확정한 값은 아니다. 빈값·세기·추정·초간 연도·저자 생몰년이면 점을 찍지 않는다.
현대 자료집의 간행 연도 2006을 고대 사서의 편찬 시점으로 쓰지 않는다.
수록 기간은 이 발췌에서 XML `dateOccured`에 정확한 연도가 붙은 조각들의 최솟값·최댓값이다.
현재 범위: None~None. 날짜가 전혀 없으면 막대도 미상이다.
이 범위는 사서 전체의 범위나 인물의 생몰년이 아니다. 저자 원표기 `초연수(焦延壽)`도 XML의 서지 정보로만 보존한다.
표제는 `mainTitle`을 쓴다. 설명 요소의 name 속성에는 다른 책 이름을 복사한 흔적이 있어 표제로 쓰지 않는다.

## 국편 서지 설명

『易林』은 前漢의 焦延壽가 撰한 것으로 相傳된다. 隋·唐·宋志에는 모두 16卷으로 되어 있다. 焦延壽는 字가 贛으로 梁人이다. 昭帝時 郡吏의 천거로 小黃令을 지냈다. 그는 易學을 연구하여 그 연구 성과를 京房에 전하였기 때문에 『漢書』에는 房傳에 수록되어 있다. 『易林』은 占辭로 되어 있는데, 焦延壽는 8卦에서 64괘가 되는 원리를 응용하여 64괘의 매 괘를 차례로 다시 64괘와 배합해서 4,096의 변괘를 만들어내고, 그 4,096의 변괘 하나하나에 繇辭를 붙여 吉凶禍福을 표시하였다. 『易林』은 唐·宋이래 著錄은 모두 焦延壽의 작이라고 하였으나, 明代 鄭曉의 『古言』, 淸代 朱彝奠의 『經義考』, 顧炎武의 『日知錄』에는 焦延壽가 昭·宣帝時人인데, 昭·宣帝 이후의 사실을 많이 인용한 이유로서 後漢 後人이 托名하여 所作한 것으로 보았고, 淸代 沈炳이 찬한 『權齋老人筆記』에는 後漢 崔篆의 작이라고 하였다. 明 萬曆 20년의 『廣漢魏叢書』刻本, 淸 乾隆 56년 金溪王의 『增訂漢魏叢書』刻本, 宣統 3년 上海 大通書局 石印의 『增訂漢魏叢書』本이 있다. 이 자료집에서는 上海 中華書局에서 士禮居校本校刊에 바탕한 『四部備要』本에 의거하여, 한국사와 직·간접적으로 관련이 있는 부분을 발췌하여 수록하였다.

## 재현

`services/ingestion/extract_jipseong.py`와 `docs/research/jipseong-ingestion.md`를 따른다.
벌크 설명과 실제 XML의 사서 수 차이도 그 문서에 남겼다. 서지 머리말 원문은 추출 보고서 `frontXml`로 보존한다.


## 담고 있는 것

<!-- counts:start -->
| 부·편 | chunk 수 |
|---|---:|
| 易林 | 15 |
| **합** | **15** |

chunk 가 놓인 층: level3 15. 연대(dateOccured) 붙은 chunk 0, 본문이 빈 chunk 0, 본문 글자 수 540.
주석 14(원주 14), 색인어 109(이름 69 · 국명 21 · 서명 11 · 지명 8).
<!-- counts:end -->

[공공데이터포털](https://www.data.go.kr/data/15053631/fileData.do)의 이용허락범위 제한 없음 표시를 2026-09-06 확인했다.
국편 웹 원문을 수집하지 않고 벌크 XML을 사용했다. 위 수치는 `scripts/fill_card_counts.py`와 같은 코드로 센다.
