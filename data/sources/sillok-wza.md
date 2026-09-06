---
type: "Source"
id: "src-sillok-wza"
label: "고종실록"
compiler: "이왕직 실록편찬위원회"
sourceKind: "실록"
sourceGroup: "고종·순종실록"
composedYear: 1935
coversFrom: 1863
coversTo: 1907
originalLanguage: "hanmun"
defaultLens: false
license: "open"
licenseDetail: "공공데이터포털 이용허락범위 제한 없음 (국편 벌크 XML)"
licenseVerifiedAt: "2026-09-06"
licenseVerifiedVia: "https://www.data.go.kr/data/15053646/fileData.do"
status: "draft"
verified: null
generated:
  by: codex
  at: 2026-09-06
sources:
  - id: datago-15053646
    resource: https://www.data.go.kr/data/15053646/fileData.do
    provider: 국사편찬위원회
    file: 15053646.zip sha256 19a043d9d82c5b53307e84d329a7cfc8544708a4cb3f794a868448a2e5202b0b
    license: 이용허락범위 제한 없음
---

# 고종실록

기록·편찬 기관: 이왕직 실록편찬위원회.

이왕직이 일제강점기인 1927~1935년에 편찬한 실록이다. 태조~철종실록과 편찬 배경이 달라 별도 묶음으로 표시한다.

XML의 wza 계열을 한 Source로 둔다. 첫 기사는 고종 즉위년인 1863년 12월 8일로 기록되어 있다. 원문의 역사 연도 표기를 유지하며 양력 환산 연도로 바꾸지 않는다.

연·월의 본문 구획도 남기고 간지·재위연도 등 병기된 날짜는 dateForms와 dateContext에 보존한다. L 접미사만으로 음양력을 판정하지 않는다.

## 실제 수록량

<!-- counts:start -->
| 항목 | 수 |
|---|---:|
| 전체 조각 | 28,520 |
| 기사·좌목 등 말단 본문 | 27,940 |
| 상위 절 본문 | 580 |
| 날짜 raw 있음 | 28,519 |
| 상위 날짜 연결 | 535 |
| 빈 본문 | 0 |
| 본문 글자 | 3,610,359 |
| 주석 | 2,712 |
| 색인어 | 104,906 |
<!-- counts:end -->

XML 날짜에서 읽은 연도 범위는 1863~1907이다.
이 범위 안에서 날짜가 있는 조각이 한 건도 없는 연도: 없음.
연도에 기록이 있다는 사실은 해당 연도의 모든 날·사건을 담았다는 뜻이 아니다.
원문 결락, 미상 날짜, 현대 입력의 범위를 구별하며 빈 곳을 추측해서 채우지 않는다.

## 출처·재현

- [한국학중앙연구원 고종실록 해설](https://encykorea.aks.ac.kr/Article/E0003942)
- [고종실록 편찬 배경·과정 연구](https://www.kci.go.kr/kciportal/ci/sereArticleSearch/ciSereArtiView.kci?sereArticleSearchBean.artiId=ART002830190)
- [공공데이터포털 벌크 XML](https://www.data.go.kr/data/15053646/fileData.do)

원문 웹페이지를 수집한 자료가 아니다. ZIP과 생성 JSONL은 c2의 Git 밖에 두고,
추출 명령·파일별 SHA256·독립 XML 수 대조는 `docs/research/gosunjong-sillok-ingestion.md`에 기록한다.
라이선스 확인은 이 데이터셋 배포본에 관한 것으로 다른 웹 서비스 전체에 적용하지 않는다.
