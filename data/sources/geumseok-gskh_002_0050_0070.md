---
type: "Source"
id: "src-geumseok-gskh_002_0050_0070"
label: "칠지도 명문"
labelHanja: "七支刀 銘文"
sourceKind: "금석문"
sourceGroup: "금석문 · 백제"
composedYear: 369
coversFrom: 369
coversTo: 369
originalLanguage: "mixed"
sourceLevelId: "gskh_002_0050_0070"
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

# 칠지도 명문

국편 한국고대금석문 벌크의 `gskh_002_0050_0070`. 경로: 백제 › 금속기명 › 칠지도 명문.
금석문 하나를 Source로 두고 판독문·해석문·개관·참고문헌을 별도 조각으로 보존한다.
각 절의 종류는 XML `biblioData.type`에서, 판독자 표기는 XML 저자 이름에서 가져온다.
절 제목이 다르다는 이유만으로 사람 이름이나 판독문이라고 추정하지 않는다.

## 연도와 출처

XML 날짜: `0369-99-99` — 近肖古王 二四年(三六九) 推定.
정확한 연도가 있으면 제작 연도와 수록 시점에 같은 값을 쓴다. `05##` 같은 세기 표기는 범위만 쓰고 점은 찍지 않는다.
9999·빈값·해석하지 못한 표기는 미상으로 남긴다. 판독문에만 금석문의 날짜를 상속한다.
현대 해제·해석·참고문헌을 그 해에 쓰인 기사로 연력에 넣지 않는다.

출토·소재지 원표기: 日本 石上神宮. 소장처: 없음.
크기: 長74.9cm、身長65.5cm、莖長9.4cm. 서체: 隷書.
[국편 항목](https://db.history.go.kr/id/gskh_002_0050_0070)의 id를 연결 정보로 보존했다.

주석은 본문에서 분리하고 `newChar`는 〓와 코드로 남긴다. 줄바꿈이 들어간 색인어는 이름 안의 줄바꿈만 제거한다.
추출·두 번 실행 대조·기사 수·빈 조각의 사유는 `docs/research/geumseokmun-ingestion.md`에 기록한다.


## 담고 있는 것

<!-- counts:start -->
| 부·편 | chunk 수 |
|---|---:|
| 백제 | 22 |
| **합** | **22** |

chunk 가 놓인 층: level4 22. 연대(dateOccured) 붙은 chunk 19, 본문이 빈 chunk 0, 본문 글자 수 12,364.
주석 33(각주 33), 색인어 0().
<!-- counts:end -->

[공공데이터포털](https://www.data.go.kr/data/15053630/fileData.do)의 이용허락범위 제한 없음 표시를 2026-09-06 확인했다.
국편 웹 원문을 수집하지 않고 벌크 XML을 사용했다. 위 수치는 `scripts/fill_card_counts.py`와 같은 코드로 센다.
