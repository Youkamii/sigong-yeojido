---
type: "Source"
id: "src-jipseong-ko_006"
label: "荀子"
labelHanja: "荀子"
sourceKind: "사료집성 발췌"
sourceGroup: "한국고대사료집성"
composedYear: null
coversFrom: null
coversTo: null
originalLanguage: "hanmun"
sourceLevelId: "ko_006"
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

# 荀子

국편 한국고대사료집성 중국편에 실린 『荀子』의 한국사 관련 발췌다.
사서 전체 원문을 수록한 것으로 표시하지 않는다. 국편 사서 id `ko_006`를 Source 이름에 쓴다.
같은 한글 이름을 가진 다른 사서도 id가 달라 합쳐지지 않는다.

## 연도 근거와 한계

편찬 시점은 XML의 `source/dateIssued`에서 단일 연도나 정확한 날짜를 옮긴 값이다. 원표기: `빈값`.
역사적 편찬 연도를 별도 문헌으로 확정한 값은 아니다. 빈값·세기·추정·초간 연도·저자 생몰년이면 점을 찍지 않는다.
현대 자료집의 간행 연도 2006을 고대 사서의 편찬 시점으로 쓰지 않는다.
수록 기간은 이 발췌에서 XML `dateOccured`에 정확한 연도가 붙은 조각들의 최솟값·최댓값이다.
현재 범위: None~None. 날짜가 전혀 없으면 막대도 미상이다.
이 범위는 사서 전체의 범위나 인물의 생몰년이 아니다. 저자 원표기 `순황(荀況)`도 XML의 서지 정보로만 보존한다.
표제는 `mainTitle`을 쓴다. 설명 요소의 name 속성에는 다른 책 이름을 복사한 흔적이 있어 표제로 쓰지 않는다.

## 국편 서지 설명

『荀子』는 戰國時代 趙나라 사람 荀況(기원전 313~기원전 238)이 지은 철학 저서로 총 32卷이다. 荀況은 荀卿으로도 부르는데, 漢代에 宣帝를 避諱하여 孫卿으로 改稱하였다. 50세에 비로서 齊에 유학하여 세 번이나 稷下祭酒를 지냈다. 참소를 당하여 齊를 떠나 楚로 달아나자 楚의 春申君은 그를 蘭陵令에 임명하였다. 뒤에 蘭陵에 거주하면서 「終老」를 지었다. 그의 학설은 儒學에 근원을 두고 있으나 老子·宋鈃·尹文 등 학파의 自然天道觀的 사상을 흡수하였으며 동시에 孔子와 墨子의 사상 중에서 人事를 중시하는 관점을 받아들었다. 天道觀에서는 天을 스스로의 법칙을 가지고 있는 自然界로 해석하였고 사람의 의지에 따라 변화되는 것으로 보지 않았다. 인식론에서는 世暮可知論을 제기하여 사물의 이치는 파악 할 수 있는 것임을 강조하였다. 人性論에서는 性惡說을 주장하였으며 禮의 교화기능을 강조하였다. 당시 분화하던 儒學의 분파 중에서 혁신세력을 대표하였다. 唐代 楊倞의 註釋本이 가장 광범위하게 유포되었으며 淸 乾隆 51년(1786)에 盧文弨와 謝墉이 교감한 嘉善 謝氏 安雅堂刻本이 가장 우수하다. 淸代의 註釋으로는 王先謙의 『荀子集解』가 가장 뛰어나다. 이 자료집에서는 上海 中華書局에서 嘉善 謝氏本校刊에 바탕한 『四部備要』本에 의거하여, 한국사와 직·간접적으로 관련이 있는 부분을 발췌하여 수록하였다.

## 재현

`services/ingestion/extract_jipseong.py`와 `docs/research/jipseong-ingestion.md`를 따른다.
벌크 설명과 실제 XML의 사서 수 차이도 그 문서에 남겼다. 서지 머리말 원문은 추출 보고서 `frontXml`로 보존한다.


## 담고 있는 것

<!-- counts:start -->
| 부·편 | chunk 수 |
|---|---:|
| 荀子 | 11 |
| **합** | **11** |

chunk 가 놓인 층: level3 11. 연대(dateOccured) 붙은 chunk 0, 본문이 빈 chunk 0, 본문 글자 수 585.
주석 19(원주 18 · 번역주 1), 색인어 167(이름 84 · 국명 45 · 지명 29 · 서명 9).
<!-- counts:end -->

[공공데이터포털](https://www.data.go.kr/data/15053631/fileData.do)의 이용허락범위 제한 없음 표시를 2026-09-06 확인했다.
국편 웹 원문을 수집하지 않고 벌크 XML을 사용했다. 위 수치는 `scripts/fill_card_counts.py`와 같은 코드로 센다.
