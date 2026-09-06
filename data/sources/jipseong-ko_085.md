---
type: "Source"
id: "src-jipseong-ko_085"
label: "出三藏記集"
labelHanja: "出三藏記集"
sourceKind: "사료집성 발췌"
sourceGroup: "한국고대사료집성"
composedYear: null
coversFrom: null
coversTo: null
originalLanguage: "hanmun"
sourceLevelId: "ko_085"
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

# 出三藏記集

국편 한국고대사료집성 중국편에 실린 『出三藏記集』의 한국사 관련 발췌다.
사서 전체 원문을 수록한 것으로 표시하지 않는다. 국편 사서 id `ko_085`를 Source 이름에 쓴다.
같은 한글 이름을 가진 다른 사서도 id가 달라 합쳐지지 않는다.

## 연도 근거와 한계

편찬 시점은 XML의 `source/dateIssued`에서 단일 연도나 정확한 날짜를 옮긴 값이다. 원표기: `(승우 445~518)`.
역사적 편찬 연도를 별도 문헌으로 확정한 값은 아니다. 빈값·세기·추정·초간 연도·저자 생몰년이면 점을 찍지 않는다.
현대 자료집의 간행 연도 2006을 고대 사서의 편찬 시점으로 쓰지 않는다.
수록 기간은 이 발췌에서 XML `dateOccured`에 정확한 연도가 붙은 조각들의 최솟값·최댓값이다.
현재 범위: None~None. 날짜가 전혀 없으면 막대도 미상이다.
이 범위는 사서 전체의 범위나 인물의 생몰년이 아니다. 저자 원표기 `승우(僧祐)`도 XML의 서지 정보로만 보존한다.
표제는 `mainTitle`을 쓴다. 설명 요소의 name 속성에는 다른 책 이름을 복사한 흔적이 있어 표제로 쓰지 않는다.

## 국편 서지 설명

『出三藏記集』은 梁나라 때의 승려 僧祐(445-518)가 편찬한 현존 最古의 佛經 목록이다. 그 이전에 있었던 道安(312-385)의『綜理衆經目録』을 기본적인 자료로 하면서 새로운 자료들을 참조하여 後漢에서 梁代까지의 번역된 경전들을 종합적으로 정리하였다. 전체 15권으로 구성되어 있는데, 불교 三藏의 성립에 대하여 이야기한 ‘緣起’(卷1), 경전의 목록을 모은 ‘名錄’(卷2-5), 110종의 경전 序文과 後記를 모은 ‘經序’(卷6-11), 宋의 明帝가 편찬하게 한 『法論』 등 10종의 책의 서문과 목록을 수록한 ‘雜錄’(卷12), 32명의 譯經家들의 전기를 수록한 ‘列傳’(卷13-15) 등으로 구성되어 있다. 경전의 목록을 작성하면서 異訳·失訳·疑經 등을 구분하는 등 세심한 주의를 하고 있지만, 아직 大乘과 小乘 경전의 구분은 하지 않고 있다. 남쪽에서 편찬되었기 때문에 南朝에서 번역된 경전은 자세히 정리하였다. 北朝에서 번역된 경전은 상대적으로 소략한 편이지만 고대의 역경에 대하여 가장 신뢰할 수 있는 자료이다. 이 책의 卷12에 수록되어 있는 「宋明帝敕中書侍郎陸澄撰法論目錄」 중에 支道林이 찬술한 「與高句麗道人書」라는 글이 보이는데, 당시에 이미 高句麗에 불교가 소개되었음을 보여주는 중요한 자료이다. 다만 이 글은 현존하지 않아 그 내용을 알 수 없다.

## 재현

`services/ingestion/extract_jipseong.py`와 `docs/research/jipseong-ingestion.md`를 따른다.
벌크 설명과 실제 XML의 사서 수 차이도 그 문서에 남겼다. 서지 머리말 원문은 추출 보고서 `frontXml`로 보존한다.


## 담고 있는 것

<!-- counts:start -->
| 부·편 | chunk 수 |
|---|---:|
| 出三藏記集 | 1 |
| **합** | **1** |

chunk 가 놓인 층: level3 1. 연대(dateOccured) 붙은 chunk 0, 본문이 빈 chunk 0, 본문 글자 수 21.
주석 1(원주 1), 색인어 3(서명 1 · 국명 1 · 이름 1).
<!-- counts:end -->

[공공데이터포털](https://www.data.go.kr/data/15053631/fileData.do)의 이용허락범위 제한 없음 표시를 2026-09-06 확인했다.
국편 웹 원문을 수집하지 않고 벌크 XML을 사용했다. 위 수치는 `scripts/fill_card_counts.py`와 같은 코드로 센다.
