---
type: "Source"
id: "src-jipseong-ko_004"
label: "逸周書"
labelHanja: "逸周書"
sourceKind: "사료집성 발췌"
sourceGroup: "한국고대사료집성"
composedYear: null
coversFrom: null
coversTo: null
originalLanguage: "hanmun"
sourceLevelId: "ko_004"
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

# 逸周書

국편 한국고대사료집성 중국편에 실린 『逸周書』의 한국사 관련 발췌다.
사서 전체 원문을 수록한 것으로 표시하지 않는다. 국편 사서 id `ko_004`를 Source 이름에 쓴다.
같은 한글 이름을 가진 다른 사서도 id가 달라 합쳐지지 않는다.

## 연도 근거와 한계

편찬 시점은 XML의 `source/dateIssued`에서 단일 연도나 정확한 날짜를 옮긴 값이다. 원표기: `빈값`.
역사적 편찬 연도를 별도 문헌으로 확정한 값은 아니다. 빈값·세기·추정·초간 연도·저자 생몰년이면 점을 찍지 않는다.
현대 자료집의 간행 연도 2006을 고대 사서의 편찬 시점으로 쓰지 않는다.
수록 기간은 이 발췌에서 XML `dateOccured`에 정확한 연도가 붙은 조각들의 최솟값·최댓값이다.
현재 범위: None~None. 날짜가 전혀 없으면 막대도 미상이다.
이 범위는 사서 전체의 범위나 인물의 생몰년이 아니다. 저자 원표기 `미상`도 XML의 서지 정보로만 보존한다.
표제는 `mainTitle`을 쓴다. 설명 요소의 name 속성에는 다른 책 이름을 복사한 흔적이 있어 표제로 쓰지 않는다.

## 국편 서지 설명

『逸周書』는 原稱은 『周書』혹은 『周史記』이다. 『尙書』의 所逸故名이라고 인식되어 오고 있으며, 唐이래 『汲塚周書』라고 誤稱되고 있다. 述作年代는 이른 것은 『左傳』보다 앞서고, 늦은 것은 漢·晉代에 이른다. 그 중 많은 것은 戰國間의 擬作이다. 본래 71篇으로 晉代에 孔晁가 注하였는데, 宋代에는 겨우 42篇만 남고, 지금은 10卷으로 60篇만 實存한다. 위로는 西周의 文王·武王으로부터 아래로는 春秋末의 靈王·景王에까지 이른다. 「世俘」, 「克殷」, 「商哲」 은 周初에 이르고, 「慶邑」, 「皇門」, 「祭公」, 「芮良夫」, 「作雒」 은 기본적으로 周代文獻에 속한다. 甲骨·金文과 相合하는 것이 있으며, 『尙書』·『史記』와 비교하여 상세한 것이 있어 사료적 가치가 매우 높다. 戰國時代에 가까운 것은 「度訓」 등 30여 篇이 있다. 『逸周書』는 脫字가 많고 難讀되는 곳이 많다. 『四部叢書』本과 『國學基本叢書』本이 通行되고 있는데, 校注本으로는 淸代 陳逢衡의 『逸周書補』, 孫詒讓의 『周書斠補』, 劉師培의 『周書補正』이 있다. 이 자료집에서는 上海 中華書局에서 抱經堂本校刊에 바탕한 『四部備要』本에 의거하여, 한국사와 직·간접적으로 관련이 있는 부분을 발췌하여 수록하였다.

## 재현

`services/ingestion/extract_jipseong.py`와 `docs/research/jipseong-ingestion.md`를 따른다.
벌크 설명과 실제 XML의 사서 수 차이도 그 문서에 남겼다. 서지 머리말 원문은 추출 보고서 `frontXml`로 보존한다.


## 담고 있는 것

<!-- counts:start -->
| 부·편 | chunk 수 |
|---|---:|
| 逸周書 | 6 |
| **합** | **6** |

chunk 가 놓인 층: level3 6. 연대(dateOccured) 붙은 chunk 0, 본문이 빈 chunk 0, 본문 글자 수 1,143.
주석 37(원주 34 · 번역주 3), 색인어 127(국명 82 · 이름 28 · 지명 14 · 서명 3).
<!-- counts:end -->

[공공데이터포털](https://www.data.go.kr/data/15053631/fileData.do)의 이용허락범위 제한 없음 표시를 2026-09-06 확인했다.
국편 웹 원문을 수집하지 않고 벌크 XML을 사용했다. 위 수치는 `scripts/fill_card_counts.py`와 같은 코드로 센다.
