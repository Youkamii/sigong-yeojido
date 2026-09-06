---
type: "Source"
id: "src-jipseong-ko_011"
label: "淮南子"
labelHanja: "淮南子"
sourceKind: "사료집성 발췌"
sourceGroup: "한국고대사료집성"
composedYear: null
coversFrom: null
coversTo: null
originalLanguage: "hanmun"
sourceLevelId: "ko_011"
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

# 淮南子

국편 한국고대사료집성 중국편에 실린 『淮南子』의 한국사 관련 발췌다.
사서 전체 원문을 수록한 것으로 표시하지 않는다. 국편 사서 id `ko_011`를 Source 이름에 쓴다.
같은 한글 이름을 가진 다른 사서도 id가 달라 합쳐지지 않는다.

## 연도 근거와 한계

편찬 시점은 XML의 `source/dateIssued`에서 단일 연도나 정확한 날짜를 옮긴 값이다. 원표기: `빈값`.
역사적 편찬 연도를 별도 문헌으로 확정한 값은 아니다. 빈값·세기·추정·초간 연도·저자 생몰년이면 점을 찍지 않는다.
현대 자료집의 간행 연도 2006을 고대 사서의 편찬 시점으로 쓰지 않는다.
수록 기간은 이 발췌에서 XML `dateOccured`에 정확한 연도가 붙은 조각들의 최솟값·최댓값이다.
현재 범위: None~None. 날짜가 전혀 없으면 막대도 미상이다.
이 범위는 사서 전체의 범위나 인물의 생몰년이 아니다. 저자 원표기 `유안(劉安)`도 XML의 서지 정보로만 보존한다.
표제는 `mainTitle`을 쓴다. 설명 요소의 name 속성에는 다른 책 이름을 복사한 흔적이 있어 표제로 쓰지 않는다.

## 국편 서지 설명

『淮南子』는 일명 『淮南鴻烈』으로도 불리며 雜家의 저작이다. 前漢의 劉安(기원전 179~기원전 122)이 편찬하였으며 21卷으로 이루어져 있다. 劉安은 漢高祖 劉邦의 손자로 淮南王에 봉해졌다. 그는 百家의 학문을 종합적으로 정리하는 사업을 스스로 떠맡았다. 그는 景帝 때 자신의 門客인 蘇飛·李尙·田由·雷被·毛被·伍被·晉昌 등과 함께 先秦 諸子의 학설을 다양하게 수집하여 이 책을 편찬하였다. 그것은 陰陽五行과 道家의 天道自然의 학설을 중심으로 儒·法·刑名을 융합하였다. 이 책에 모아 높은 思想資料는 상당히 방대하고 잡다하며 先秦時期의 原始資料도 많이 보존되어 있다. 그러나 역시 어느 정도 정리과정을 거쳤기 때문에 편찬자의 宇宙觀과 歷史觀 및 政治思想이 상당히 반영되어 있다. 「天文篇」은 자연과학분야의 중요문헌이다. 이 篇에는 故事들이 많이 인용되어 있어 歷史的 事實의 考證에 보탬이 되고 있다. 이 책은 처음에 後漢의 高誘와 許愼 두 사람의 註釋이 있었으나 宋代에 이르러 뒤섞여버렸다. 또 원래는 內篇과 外篇이 있었으나 지금은 內篇만 남아있다. 현재 남아 있는 板本은 北宋代의 刻本이 가장 이른 시기의 것이며, 『諸子集成初篇』에 수록된 板本이 우수하다. 역대의 註釋書가 많으나 劉文典의 『淮南鴻烈集解』가 가장 우수하며 劉立家의 『淮南集證』도 참고할만하다. 이 자료집에서는 上海 中華書局에서 武進 莊氏本校刊에 바탕한 『四部備要』本에 의거하여, 한국사와 직·간접적으로 관련이 있는 부분을 발췌하여 수록하였다.

## 재현

`services/ingestion/extract_jipseong.py`와 `docs/research/jipseong-ingestion.md`를 따른다.
벌크 설명과 실제 XML의 사서 수 차이도 그 문서에 남겼다. 서지 머리말 원문은 추출 보고서 `frontXml`로 보존한다.


## 담고 있는 것

<!-- counts:start -->
| 부·편 | chunk 수 |
|---|---:|
| 淮南子 | 14 |
| **합** | **14** |

chunk 가 놓인 층: level3 14. 연대(dateOccured) 붙은 chunk 0, 본문이 빈 chunk 0, 본문 글자 수 581.
주석 12(원주 12), 색인어 96(이름 51 · 지명 20 · 국명 20 · 서명 5).
<!-- counts:end -->

[공공데이터포털](https://www.data.go.kr/data/15053631/fileData.do)의 이용허락범위 제한 없음 표시를 2026-09-06 확인했다.
국편 웹 원문을 수집하지 않고 벌크 XML을 사용했다. 위 수치는 `scripts/fill_card_counts.py`와 같은 코드로 센다.
