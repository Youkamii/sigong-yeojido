---
type: "Source"
id: "src-jipseong-ko_084"
label: "大唐靑龍寺三朝供奉大德行狀"
labelHanja: "大唐靑龍寺三朝供奉大德行狀"
sourceKind: "사료집성 발췌"
sourceGroup: "한국고대사료집성"
composedYear: 826
coversFrom: null
coversTo: null
originalLanguage: "hanmun"
sourceLevelId: "ko_084"
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

# 大唐靑龍寺三朝供奉大德行狀

국편 한국고대사료집성 중국편에 실린 『大唐靑龍寺三朝供奉大德行狀』의 한국사 관련 발췌다.
사서 전체 원문을 수록한 것으로 표시하지 않는다. 국편 사서 id `ko_084`를 Source 이름에 쓴다.
같은 한글 이름을 가진 다른 사서도 id가 달라 합쳐지지 않는다.

## 연도 근거와 한계

편찬 시점은 XML의 `source/dateIssued`에서 단일 연도나 정확한 날짜를 옮긴 값이다. 원표기: `826년`.
역사적 편찬 연도를 별도 문헌으로 확정한 값은 아니다. 빈값·세기·추정·초간 연도·저자 생몰년이면 점을 찍지 않는다.
현대 자료집의 간행 연도 2006을 고대 사서의 편찬 시점으로 쓰지 않는다.
수록 기간은 이 발췌에서 XML `dateOccured`에 정확한 연도가 붙은 조각들의 최솟값·최댓값이다.
현재 범위: None~None. 날짜가 전혀 없으면 막대도 미상이다.
이 범위는 사서 전체의 범위나 인물의 생몰년이 아니다. 저자 원표기 `미상`도 XML의 서지 정보로만 보존한다.
표제는 `mainTitle`을 쓴다. 설명 요소의 name 속성에는 다른 책 이름을 복사한 흔적이 있어 표제로 쓰지 않는다.

## 국편 서지 설명

『大唐靑龍寺三朝供奉大德行狀』은 唐나라 대의 밀교 승려인 恵果和尚의 行状이다. 본문 내용으로 寶暦 2年(826)에 찬술되었음을 알 수 있지만 찬술자는 알려져 있지 않다. 혜과화상은 중국에 전해진 밀교의 두 가지 흐름인 金剛界와 胎藏界를 모두 수학하여 종합한 인물로서 그의 문하에는 신라 출신의 승려들도 적지 않았던 것으로 알려지고 있다. 실제로 이 행장에는 建中 2년(781)에 新羅의 恵日이 찾아와 胎蔵界와 金剛界의 蘇悉地法과 諸尊瑜伽三十本을 배웠고, 悟真은 胎蔵毘盧遮那와 諸尊持念教法을 배웠다고 기록하고 있다. 신라 승려들의 밀교 연구 상황을 알려주는 중요한 자료이다. 한편 일본 眞言宗의 창시자인 쿠카이(空海) 역시 혜과화상에게서 밀교를 수학하였다.

## 재현

`services/ingestion/extract_jipseong.py`와 `docs/research/jipseong-ingestion.md`를 따른다.
벌크 설명과 실제 XML의 사서 수 차이도 그 문서에 남겼다. 서지 머리말 원문은 추출 보고서 `frontXml`로 보존한다.


## 담고 있는 것

<!-- counts:start -->
| 부·편 | chunk 수 |
|---|---:|
| 大唐靑龍寺三朝供奉大德行狀 | 1 |
| **합** | **1** |

chunk 가 놓인 층: level3 1. 연대(dateOccured) 붙은 chunk 0, 본문이 빈 chunk 0, 본문 글자 수 210.
주석 0(), 색인어 17(국명 6 · 서명 4 · 이름 4 · 연호 2 · 지명 1).
<!-- counts:end -->

[공공데이터포털](https://www.data.go.kr/data/15053631/fileData.do)의 이용허락범위 제한 없음 표시를 2026-09-06 확인했다.
국편 웹 원문을 수집하지 않고 벌크 XML을 사용했다. 위 수치는 `scripts/fill_card_counts.py`와 같은 코드로 센다.
