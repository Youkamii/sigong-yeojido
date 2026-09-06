---
type: "Source"
id: "src-jipseong-ko_064"
label: "釋門自鏡錄"
labelHanja: "釋門自鏡錄"
sourceKind: "사료집성 발췌"
sourceGroup: "한국고대사료집성"
composedYear: null
coversFrom: null
coversTo: null
originalLanguage: "hanmun"
sourceLevelId: "ko_064"
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

# 釋門自鏡錄

국편 한국고대사료집성 중국편에 실린 『釋門自鏡錄』의 한국사 관련 발췌다.
사서 전체 원문을 수록한 것으로 표시하지 않는다. 국편 사서 id `ko_064`를 Source 이름에 쓴다.
같은 한글 이름을 가진 다른 사서도 id가 달라 합쳐지지 않는다.

## 연도 근거와 한계

편찬 시점은 XML의 `source/dateIssued`에서 단일 연도나 정확한 날짜를 옮긴 값이다. 원표기: `당대(唐代)`.
역사적 편찬 연도를 별도 문헌으로 확정한 값은 아니다. 빈값·세기·추정·초간 연도·저자 생몰년이면 점을 찍지 않는다.
현대 자료집의 간행 연도 2006을 고대 사서의 편찬 시점으로 쓰지 않는다.
수록 기간은 이 발췌에서 XML `dateOccured`에 정확한 연도가 붙은 조각들의 최솟값·최댓값이다.
현재 범위: None~None. 날짜가 전혀 없으면 막대도 미상이다.
이 범위는 사서 전체의 범위나 인물의 생몰년이 아니다. 저자 원표기 `회신(懷信)`도 XML의 서지 정보로만 보존한다.
표제는 `mainTitle`을 쓴다. 설명 요소의 name 속성에는 다른 책 이름을 복사한 흔적이 있어 표제로 쓰지 않는다.

## 국편 서지 설명

『釋門自鏡錄』은 唐나라 때의 懷信이 남북조시대에서 唐나라 때까지의 因果報應과 관련되는 설화들을 모아 편찬한 설화집이다. 2권으로 이루어져 있으며, ①業繫長遠錄, ②勃逆闡提錄, ③輕毁敎法錄, ④妬賢嫉化錄, ⑤忿恚貪鄙錄. ⑥俗學無裨錄, ⑦懈慢不勤錄, ⑧害物傷慈錄, ⑨飮噉非法錄, ⑩慳損僧物錄 등 10科로 나누어 모두 73편의 이야기가 수록되어 있다. 당시 불교신앙의 구체적인 모습을 알 수 있는 귀중한 자료이며, 특히 三界敎와 관련된 일부 내용은 다른 곳에는 보이지 않는 특별한 자료이다. 현재 전해지는 책은 18세기의 일본 승려 玄智가 필사한 책을 저본으로 하고 있는데, 여기에는 玄智가 다른 문헌에서 발췌한 비슷한 성격의 이야기들이 부록으로 실려 있다. 한국의 승려와 관련된 이야기로는 第5科 忿恚貪鄙録에 新羅国 大興輪寺의 승려 道安이 음식 때문에 화를 내다 뱀으로 변하였다는 이야기가 실려있고, 第7科 懈慢不勤録에는 新羅의 한 禅師가 사후에 고기를 맺는 나무로 환생하여 생전에 자신에게 잘 대해준 施主에게 보답하였다는 이야기가 수록되어 있다. 한편 부록에는 『宋高僧傳』에 실려 있는 신라의 승려 順璟이 『華嚴經』의 내용을 비방하여 산채로 지옥에 떨어졌다는 이야기가 수록되어 있다.

## 재현

`services/ingestion/extract_jipseong.py`와 `docs/research/jipseong-ingestion.md`를 따른다.
벌크 설명과 실제 XML의 사서 수 차이도 그 문서에 남겼다. 서지 머리말 원문은 추출 보고서 `frontXml`로 보존한다.


## 담고 있는 것

<!-- counts:start -->
| 부·편 | chunk 수 |
|---|---:|
| 釋門自鏡錄 | 3 |
| **합** | **3** |

chunk 가 놓인 층: level3 3. 연대(dateOccured) 붙은 chunk 0, 본문이 빈 chunk 0, 본문 글자 수 1,053.
주석 3(원주 3), 색인어 30(이름 13 · 국명 11 · 지명 3 · 서명 2 · 연호 1).
<!-- counts:end -->

[공공데이터포털](https://www.data.go.kr/data/15053631/fileData.do)의 이용허락범위 제한 없음 표시를 2026-09-06 확인했다.
국편 웹 원문을 수집하지 않고 벌크 XML을 사용했다. 위 수치는 `scripts/fill_card_counts.py`와 같은 코드로 센다.
