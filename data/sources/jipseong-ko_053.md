---
type: "Source"
id: "src-jipseong-ko_053"
label: "大唐西域求法高僧傳"
labelHanja: "大唐西域求法高僧傳"
sourceKind: "사료집성 발췌"
sourceGroup: "한국고대사료집성"
composedYear: 691
coversFrom: null
coversTo: null
originalLanguage: "hanmun"
sourceLevelId: "ko_053"
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

# 大唐西域求法高僧傳

국편 한국고대사료집성 중국편에 실린 『大唐西域求法高僧傳』의 한국사 관련 발췌다.
사서 전체 원문을 수록한 것으로 표시하지 않는다. 국편 사서 id `ko_053`를 Source 이름에 쓴다.
같은 한글 이름을 가진 다른 사서도 id가 달라 합쳐지지 않는다.

## 연도 근거와 한계

편찬 시점은 XML의 `source/dateIssued`에서 단일 연도나 정확한 날짜를 옮긴 값이다. 원표기: `691년`.
역사적 편찬 연도를 별도 문헌으로 확정한 값은 아니다. 빈값·세기·추정·초간 연도·저자 생몰년이면 점을 찍지 않는다.
현대 자료집의 간행 연도 2006을 고대 사서의 편찬 시점으로 쓰지 않는다.
수록 기간은 이 발췌에서 XML `dateOccured`에 정확한 연도가 붙은 조각들의 최솟값·최댓값이다.
현재 범위: None~None. 날짜가 전혀 없으면 막대도 미상이다.
이 범위는 사서 전체의 범위나 인물의 생몰년이 아니다. 저자 원표기 `의정(義浄)`도 XML의 서지 정보로만 보존한다.
표제는 `mainTitle`을 쓴다. 설명 요소의 name 속성에는 다른 책 이름을 복사한 흔적이 있어 표제로 쓰지 않는다.

## 국편 서지 설명

『大唐西域求法高僧傳』은 唐나라 때의 승려 義浄(635-713)이 찬술한 西域에 求法하였던 승려들의 전기집이다. 의정이 인도에 유학하였다가 돌아오는 길에 室利佛逝(Srivijaya)에 머물면서 永昌 원년(689)에서 天授 2년(691)에 걸쳐 자신의 구법 여행기인 『南海寄帰内法傳』과 함께 찬술하였다. 2권으로 구성되어 있으며, 唐나라 太宗 貞観년간(627-649)에서부터 저술 당시까지 서역에 求法하였던 승려 60인의 행적을 기록하고 있다. 당시 인도 불교계의 동향과 중국과 인도의 불교교류 상황 그리고 당시 중국과 인도의 교통로 등에 관한 구체적인 정보를 전해주는 귀중한 자료이다. 특히 이 책에는 阿離耶跋摩, 慧業, 求本, 玄太, 玄恪, 慧輪, 失名 2人(以上 巻上)과 玄遊(巻下) 등 8명의 신라 출신의 구법승들의 행적도 기록되어 있어 당시 신라 출신 승려들의 서역 구법활동의 구체적인 모습을 전하고 있다. 이들 대부분은 인도로 가는 길에 혹은 인도에서 입적하였고, 玄太만이 구법여행을 마치고 중국으로 돌아왔지만 이후의 행적은 알려져 있지 않다. 이 책에는 또한 인도 사람들이 新羅를 ‘矩矩矺䃜說羅’라고 불렀으며 그 뜻은 ‘닭을 숭상하는 것[鷄貴]’이라는 내용을 이야기하고 있다. ‘19세기말에 E. Chavannes에 의해 프랑스어로 번역되었으며(1894年), 일본어 譯註(伊藤丈 著, 大東出版社, 1993年)도 있다.

## 재현

`services/ingestion/extract_jipseong.py`와 `docs/research/jipseong-ingestion.md`를 따른다.
벌크 설명과 실제 XML의 사서 수 차이도 그 문서에 남겼다. 서지 머리말 원문은 추출 보고서 `frontXml`로 보존한다.


## 담고 있는 것

<!-- counts:start -->
| 부·편 | chunk 수 |
|---|---:|
| 大唐西域求法高僧傳 | 8 |
| **합** | **8** |

chunk 가 놓인 층: level3 8. 연대(dateOccured) 붙은 chunk 0, 본문이 빈 chunk 0, 본문 글자 수 760.
주석 4(원주 4), 색인어 85(국명 30 · 이름 26 · 지명 23 · 연호 4 · 서명 2).
<!-- counts:end -->

[공공데이터포털](https://www.data.go.kr/data/15053631/fileData.do)의 이용허락범위 제한 없음 표시를 2026-09-06 확인했다.
국편 웹 원문을 수집하지 않고 벌크 XML을 사용했다. 위 수치는 `scripts/fill_card_counts.py`와 같은 코드로 센다.
