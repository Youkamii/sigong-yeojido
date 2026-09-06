---
type: "Source"
id: "src-jipseong-ko_008"
label: "呂氏春秋"
labelHanja: "呂氏春秋"
sourceKind: "사료집성 발췌"
sourceGroup: "한국고대사료집성"
composedYear: null
coversFrom: null
coversTo: null
originalLanguage: "hanmun"
sourceLevelId: "ko_008"
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

# 呂氏春秋

국편 한국고대사료집성 중국편에 실린 『呂氏春秋』의 한국사 관련 발췌다.
사서 전체 원문을 수록한 것으로 표시하지 않는다. 국편 사서 id `ko_008`를 Source 이름에 쓴다.
같은 한글 이름을 가진 다른 사서도 id가 달라 합쳐지지 않는다.

## 연도 근거와 한계

편찬 시점은 XML의 `source/dateIssued`에서 단일 연도나 정확한 날짜를 옮긴 값이다. 원표기: `빈값`.
역사적 편찬 연도를 별도 문헌으로 확정한 값은 아니다. 빈값·세기·추정·초간 연도·저자 생몰년이면 점을 찍지 않는다.
현대 자료집의 간행 연도 2006을 고대 사서의 편찬 시점으로 쓰지 않는다.
수록 기간은 이 발췌에서 XML `dateOccured`에 정확한 연도가 붙은 조각들의 최솟값·최댓값이다.
현재 범위: None~None. 날짜가 전혀 없으면 막대도 미상이다.
이 범위는 사서 전체의 범위나 인물의 생몰년이 아니다. 저자 원표기 `여불위(呂不韋)`도 XML의 서지 정보로만 보존한다.
표제는 `mainTitle`을 쓴다. 설명 요소의 name 속성에는 다른 책 이름을 복사한 흔적이 있어 표제로 쓰지 않는다.

## 국편 서지 설명

『呂氏春秋』는 雜家의 著作이며 일명 『呂覽』이라고도 한다. 총 26卷이다. 呂氏는 呂不韋(?~기원전 235)를 가리킨다. 呂不韋는 衛國 濮陽人으로 원래 陽翟의 大商人이었다. 秦公子 子楚가 莊襄王으로 즉위하는 것을 도와주어 相이 되었고 文信侯에 봉해졌다. 秦始皇이 즉위한 뒤에 仲父로 존숭되었으며 정사를 專斷하였다. 秦始皇이 親政을 한 뒤에는 죄를 얻어 相의 자리에서 물러나 四川으로 추방되어 가는 도중 자살하였다. 그는 門客들에게 각자 들은 바를 저술하도록 하고, 그것을 집대성하여 『呂氏春秋』를 만들었다. 이 책은 雜家의 대표적인 저작으로 12紀, 8覽, 6論으로 구성되어 있다. 그 가운데 「大樂」, 「適音」등의 편은 儒家思想을 반영하고, 「貴生」, 「審分」등의 편은 道家思想을 반영하고, 「當染」, 「高義」등의 편은 墨家思想을 반영하고, 「振亂」, 「禁塞」, 「決勝」, 「愛士」등의 편은 兵家思想을 반영하고,「勸學」, 「尊師」등의 편은 敎育思想을 반영한다. 또한 이 책에는 많은 先秦時期의 故事와 古代史料들이 수록되어 있다. 漢代에 高誘가 가장 처음 注를 달았으며, 이는 『諸子集成』과 『四部叢刊』에 수록되어 있다. 현대 註釋本으로는 陳奇猷의 『呂氏春秋校釋』(1984년, 學林出版社)가 가장 우수하다. 이 자료집에서는 上海 中華書局에서 畢氏 靈巖山館校本校刊에 바탕한 『四部備要』本에 의거하여, 한국사와 직·간접적으로 관련이 있는 부분을 발췌하여 수록하였다.

## 재현

`services/ingestion/extract_jipseong.py`와 `docs/research/jipseong-ingestion.md`를 따른다.
벌크 설명과 실제 XML의 사서 수 차이도 그 문서에 남겼다. 서지 머리말 원문은 추출 보고서 `frontXml`로 보존한다.


## 담고 있는 것

<!-- counts:start -->
| 부·편 | chunk 수 |
|---|---:|
| 呂氏春秋 | 10 |
| **합** | **10** |

chunk 가 놓인 층: level3 10. 연대(dateOccured) 붙은 chunk 0, 본문이 빈 chunk 0, 본문 글자 수 587.
주석 38(원주 36 · 번역주 2), 색인어 139(이름 84 · 지명 27 · 국명 26 · 서명 2).
<!-- counts:end -->

[공공데이터포털](https://www.data.go.kr/data/15053631/fileData.do)의 이용허락범위 제한 없음 표시를 2026-09-06 확인했다.
국편 웹 원문을 수집하지 않고 벌크 XML을 사용했다. 위 수치는 `scripts/fill_card_counts.py`와 같은 코드로 센다.
