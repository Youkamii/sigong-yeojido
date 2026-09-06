---
type: "Source"
id: "src-jipseong-ko_003"
label: "竹書紀年"
labelHanja: "竹書紀年"
sourceKind: "사료집성 발췌"
sourceGroup: "한국고대사료집성"
composedYear: null
coversFrom: null
coversTo: null
originalLanguage: "hanmun"
sourceLevelId: "ko_003"
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

# 竹書紀年

국편 한국고대사료집성 중국편에 실린 『竹書紀年』의 한국사 관련 발췌다.
사서 전체 원문을 수록한 것으로 표시하지 않는다. 국편 사서 id `ko_003`를 Source 이름에 쓴다.
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

『竹書紀年』은 『古文紀年』, 『汲塚紀年』이라고도 부르는 編年體 史書이다. 대략 戰國時代 魏의 史官의 손에 쓰여진 것으로 보고 있다. 晉의 太康年間에 전국시대의 魏襄王墓에서 출토된 竹簡 漆書를 經荀勛 등이 20篇으로 정리하였다. 또 별도로 『竹書異同』1篇을 만들었다. 夏 禹부터 魏 襄王 20년까지의 記事를 담고 있다. 記錄中 商 中宗이 祖乙이라는 점과 齊 桓午 18년의 기사는 甲骨·金文과 相合하나, 舜이 堯를 추방하고, 啓가 益을 살해하고, 太甲이 伊尹을 살해하고, 文丁이 季曆을 살해하고, 共和伯이 왕위를 요구했다는 기사는 전통적인 이야기와는 다르기 때문에 전통시대에는 이 책을 貶下하여 南宋이후 望佚되었다. 明 嘉靖年間에는 『今本竹書紀年』이라는 책이 홀연히 출현하였는데, 淸人들의 고증으로 范欽의 僞作으로 밝혀졌다. 別作으로 輯本 10 種이 相繼되었는데, 그중에서 朱右曾의 『汲塚紀年存眞』(古本)이 가장 우수하고, 近人의 王國維가 朱書를 바탕으로 『古本竹書紀年輯校』와 『今本竹書紀年疏正』을 저술하고, 今人으로는 范祥이 王書를 바탕으로 『古本竹書紀年輯証』을 저술하였다. 이 자료집에서는 上海 中華書局에서 平津館本校刊에 바탕한 『四部備要』本에 의거하여 한국사와 직·간접적으로 관련이 있는 부분을 발췌하여 수록하였다.

## 재현

`services/ingestion/extract_jipseong.py`와 `docs/research/jipseong-ingestion.md`를 따른다.
벌크 설명과 실제 XML의 사서 수 차이도 그 문서에 남겼다. 서지 머리말 원문은 추출 보고서 `frontXml`로 보존한다.


## 담고 있는 것

<!-- counts:start -->
| 부·편 | chunk 수 |
|---|---:|
| 竹書紀年 | 14 |
| **합** | **14** |

chunk 가 놓인 층: level3 14. 연대(dateOccured) 붙은 chunk 0, 본문이 빈 chunk 0, 본문 글자 수 245.
주석 8(원주 8), 색인어 46(국명 22 · 서명 19 · 이름 4 · 지명 1).
<!-- counts:end -->

[공공데이터포털](https://www.data.go.kr/data/15053631/fileData.do)의 이용허락범위 제한 없음 표시를 2026-09-06 확인했다.
국편 웹 원문을 수집하지 않고 벌크 XML을 사용했다. 위 수치는 `scripts/fill_card_counts.py`와 같은 코드로 센다.
