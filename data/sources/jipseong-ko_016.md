---
type: "Source"
id: "src-jipseong-ko_016"
label: "論衡"
labelHanja: "論衡"
sourceKind: "사료집성 발췌"
sourceGroup: "한국고대사료집성"
composedYear: null
coversFrom: null
coversTo: null
originalLanguage: "hanmun"
sourceLevelId: "ko_016"
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

# 論衡

국편 한국고대사료집성 중국편에 실린 『論衡』의 한국사 관련 발췌다.
사서 전체 원문을 수록한 것으로 표시하지 않는다. 국편 사서 id `ko_016`를 Source 이름에 쓴다.
같은 한글 이름을 가진 다른 사서도 id가 달라 합쳐지지 않는다.

## 연도 근거와 한계

편찬 시점은 XML의 `source/dateIssued`에서 단일 연도나 정확한 날짜를 옮긴 값이다. 원표기: `빈값`.
역사적 편찬 연도를 별도 문헌으로 확정한 값은 아니다. 빈값·세기·추정·초간 연도·저자 생몰년이면 점을 찍지 않는다.
현대 자료집의 간행 연도 2006을 고대 사서의 편찬 시점으로 쓰지 않는다.
수록 기간은 이 발췌에서 XML `dateOccured`에 정확한 연도가 붙은 조각들의 최솟값·최댓값이다.
현재 범위: None~None. 날짜가 전혀 없으면 막대도 미상이다.
이 범위는 사서 전체의 범위나 인물의 생몰년이 아니다. 저자 원표기 `왕충(王充)`도 XML의 서지 정보로만 보존한다.
표제는 `mainTitle`을 쓴다. 설명 요소의 name 속성에는 다른 책 이름을 복사한 흔적이 있어 표제로 쓰지 않는다.

## 국편 서지 설명

『論衡』은 後漢의 王充(27~約 97)의 撰으로, 30卷 85篇으로 되어 있으며, 이중에서 「招致篇」은 亡失되었다. 王充은 字가 仲任이고 會稽 上虞人이다. 出身이 低微하였고, 洛陽 太學에서 少游하였으며, 일찍이 班彪에서 師事하였다. 衆流百家에 博通하고, 郡功曹와 揚州 治中의 職을 역임하였으나, 곧 罷職되고 저술에 전념하여 30년 만에 『論衡』을 撰成하였다. 人性論上으로는 性에는 善과 惡이 있다고 하고, 人性을 上中下 3等으로 분류하고, 命定論을 주장하였다. 또 讖緯迷信思想을 주장하였다. 學派關係上으로는 崇古非今을 반대하고, 漢高于周的 發展進化思想을 주장하였다. 學派關係上으로는 孔, 孟, 荀, 墨, 名, 法, 道, 陰陽, 道敎, 迷信思想을 비판하고, 天道自然無爲的 唯物主義 自然觀을 강조하였다. 明 嘉靖中 吳郡 蘇氏의 通津草堂刻本과 『四部備要』本, 劉盼遂의 『論衡集解』, 1957년 古籍出版社印本, 1959년 中華書局印本이 있다. 이 자료집에서는 上海 中華書局에서 明刻本校刊에 바탕한 『四部備要』本에 의거, 한국사와 직·간접적으로 관련이 있는 부분을 발췌하여 수록하였다.

## 재현

`services/ingestion/extract_jipseong.py`와 `docs/research/jipseong-ingestion.md`를 따른다.
벌크 설명과 실제 XML의 사서 수 차이도 그 문서에 남겼다. 서지 머리말 원문은 추출 보고서 `frontXml`로 보존한다.


## 담고 있는 것

<!-- counts:start -->
| 부·편 | chunk 수 |
|---|---:|
| 論衡 | 7 |
| **합** | **7** |

chunk 가 놓인 층: level3 7. 연대(dateOccured) 붙은 chunk 0, 본문이 빈 chunk 0, 본문 글자 수 856.
주석 0(), 색인어 78(이름 44 · 국명 22 · 지명 9 · 서명 3).
<!-- counts:end -->

[공공데이터포털](https://www.data.go.kr/data/15053631/fileData.do)의 이용허락범위 제한 없음 표시를 2026-09-06 확인했다.
국편 웹 원문을 수집하지 않고 벌크 XML을 사용했다. 위 수치는 `scripts/fill_card_counts.py`와 같은 코드로 센다.
