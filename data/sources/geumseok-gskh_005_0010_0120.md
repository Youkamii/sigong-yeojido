---
type: "Source"
id: "src-geumseok-gskh_005_0010_0120"
label: "김인문 묘비"
labelHanja: "金仁問 墓碑"
sourceKind: "금석문"
sourceGroup: "금석문 · 통일신라"
composedYear: 695
coversFrom: 695
coversTo: 695
originalLanguage: "mixed"
sourceLevelId: "gskh_005_0010_0120"
defaultLens: false
license: "open"
licenseDetail: "공공데이터포털 이용허락범위 제한 없음 (국편 벌크 XML)"
licenseVerifiedAt: "2026-09-06"
licenseVerifiedVia: "https://www.data.go.kr/data/15053630/fileData.do"
status: "draft"
verified: null
generated:
  by: codex
  at: 2026-09-06
sources:
  - id: datago-15053630
    resource: https://www.data.go.kr/data/15053630/fileData.do
    provider: 국사편찬위원회
    file: 15053630.zip sha256 8cb029349c177ecfb22e6968c302307bed0fb01845a2b22dc21a775c9d1e1f71
    license: 이용허락범위 제한 없음
---

# 김인문 묘비

국편 한국고대금석문 벌크의 `gskh_005_0010_0120`. 경로: 통일신라 › 비문 › 김인문 묘비.
금석문 하나를 Source로 두고 판독문·해석문·개관·참고문헌을 별도 조각으로 보존한다.
각 절의 종류는 XML `biblioData.type`에서, 판독자 표기는 XML 저자 이름에서 가져온다.
절 제목이 다르다는 이유만으로 사람 이름이나 판독문이라고 추정하지 않는다.

## 연도와 출처

XML 날짜: `0695-99-99` — 695년(효소왕 4년) 이후.
정확한 연도가 있으면 제작 연도와 수록 시점에 같은 값을 쓴다. `05##` 같은 세기 표기는 범위만 쓰고 점은 찍지 않는다.
9999·빈값·해석하지 못한 표기는 미상으로 남긴다. 판독문에만 금석문의 날짜를 상속한다.
현대 해제·해석·참고문헌을 그 해에 쓰인 기사로 연력에 넣지 않는다.

출토·소재지 원표기: 경상북도 경주시 일정로 186 (인왕동, 국립경주박물관). 소장처: 경상북도 경주시 서악서원의 누문(樓門) 아래.
크기: 현존 길이 63.0㎝, 너비 94.5㎝，두께 18.4㎝.. 서체: 행서체.
[국편 항목](https://db.history.go.kr/id/gskh_005_0010_0120)의 id를 연결 정보로 보존했다.

주석은 본문에서 분리하고 `newChar`는 〓와 코드로 남긴다. 줄바꿈이 들어간 색인어는 이름 안의 줄바꿈만 제거한다.
추출·두 번 실행 대조·기사 수·빈 조각의 사유는 `docs/research/geumseokmun-ingestion.md`에 기록한다.


## 담고 있는 것

<!-- counts:start -->
| 부·편 | chunk 수 |
|---|---:|
| 통일신라 | 4 |
| **합** | **4** |

chunk 가 놓인 층: level4 4. 연대(dateOccured) 붙은 chunk 1, 본문이 빈 chunk 0, 본문 글자 수 5,067.
주석 102(각주 102), 색인어 0().
<!-- counts:end -->

[공공데이터포털](https://www.data.go.kr/data/15053630/fileData.do)의 이용허락범위 제한 없음 표시를 2026-09-06 확인했다.
국편 웹 원문을 수집하지 않고 벌크 XML을 사용했다. 위 수치는 `scripts/fill_card_counts.py`와 같은 코드로 센다.
