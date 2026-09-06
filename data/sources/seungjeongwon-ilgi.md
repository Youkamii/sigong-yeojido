---
type: "Source"
id: "src-seungjeongwon-ilgi"
label: "승정원일기"
compiler: "승정원 및 승선원·궁내부·비서감·비서원·규장각"
sourceKind: "관청일기"
sourceGroup: "관청 일기·등록"
composedYear: null
coversFrom: 1623
coversTo: 1910
originalLanguage: "hanmun"
defaultLens: false
license: "open"
licenseDetail: "공공데이터포털 이용허락범위 제한 없음 (국편 벌크 XML)"
licenseVerifiedAt: "2026-09-06"
licenseVerifiedVia: "https://www.data.go.kr/data/15064218/fileData.do"
status: "draft"
verified: null
generated:
  by: codex
  at: 2026-09-06
sources:
  - id: datago-15064218
    resource: https://www.data.go.kr/data/15064218/fileData.do
    provider: 국사편찬위원회
    file: 15064218.zip sha256 12c35fbaa2197ee9f1c6f9d25b9002c1d2fce89651a72d489739fde893813106
    license: 이용허락범위 제한 없음
---

# 승정원일기

기록·편찬 기관: 승정원 및 승선원·궁내부·비서감·비서원·규장각.

국왕 비서기관이 날마다 이어 쓴 기록이다. 현존본의 시작과 끝은 저작물 전체의 편찬 연도가 아니므로 단일 편찬 연도를 두지 않는다.

화재·전란으로 원본 일부가 소실되고 뒤에 개수되었다. 현존 기록 전체가 당일 작성 원본으로 남았다는 뜻은 아니다. 1894년 이후에는 관청과 일기 표제가 여러 차례 바뀌었다.

벌크는 한문 탈초 원문을 담고 있다. 기사와 좌목, 본문이 빈 날짜 구획도 보존한다. 각 기사의 recordType과 원본·탈초본 책/면수는 별도 필드에 남긴다.

기사에 자체 날짜가 없으면 XML의 상위 일자가 제공한 서기 값을 읽고 dateInheritedFrom에 그 id를 남긴다. 간지·재위연도·중국연호 등 다른 날짜 표기도 dateForms와 dateContext에 보존한다.

## 실제 수록량

<!-- counts:start -->
| 항목 | 수 |
|---|---:|
| 전체 조각 | 2,001,115 |
| 기사·좌목 등 말단 본문 | 1,897,041 |
| 상위 절 본문 | 104,074 |
| 날짜 raw 있음 | 2,001,115 |
| 상위 날짜 연결 | 1,897,041 |
| 빈 본문 | 104,802 |
| 본문 글자 | 306,170,668 |
| 주석 | 147,061 |
| 색인어 | 9,809,671 |
<!-- counts:end -->

XML 날짜에서 읽은 연도 범위는 1623~1910이다.
이 범위 안에서 날짜가 있는 조각이 한 건도 없는 연도: 1624, 1695.
연도에 기록이 있다는 사실은 해당 연도의 모든 날·사건을 담았다는 뜻이 아니다.
원문 결락, 미상 날짜, 현대 입력의 범위를 구별하며 빈 곳을 추측해서 채우지 않는다.

## 출처·재현

- [한국학중앙연구원 승정원일기 해설](https://encykorea.aks.ac.kr/Article/E0032244)
- [국가유산포털 현존 기록 지정 정보](http://www.heritage.go.kr/heri/cul/culSelectDetail.do?ccbaCpno=1111103030000)
- [UNESCO 기록 복원·등재 설명](https://www.unesco.org/en/memory-world/seungjeongwon-ilgi-diaries-royal-secretariat)
- [한국학중앙연구원 기사 인용 링크 형식](https://dh.aks.ac.kr/hanyang2/wiki/index.php/인용전거)
- [공공데이터포털 벌크 XML](https://www.data.go.kr/data/15064218/fileData.do)

원문 웹페이지를 수집한 자료가 아니다. ZIP과 생성 JSONL은 c2의 Git 밖에 두고,
추출 명령·파일별 SHA256·독립 XML 수 대조는 `docs/research/seungjeongwon-ilgi-ingestion.md`에 기록한다.
라이선스 확인은 이 데이터셋 배포본에 관한 것으로 다른 웹 서비스 전체에 적용하지 않는다.
