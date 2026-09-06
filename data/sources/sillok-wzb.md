---
type: "Source"
id: "src-sillok-wzb"
label: "순종실록"
compiler: "이왕직 실록편찬위원회"
sourceKind: "실록"
sourceGroup: "고종·순종실록"
composedYear: 1935
coversFrom: 1907
coversTo: 1910
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

# 순종실록

기록·편찬 기관: 이왕직 실록편찬위원회.

고종실록과 같은 1927~1935년 편찬 사업의 산물이다. 순종 재위 기간의 본문인 wzb 계열만 이 Source에 넣는다.

퇴위 이후를 다루는 wzc 계열 부록은 별도 Source다. 부록을 본문과 합쳐 재위 기간을 늘리지 않는다.

## 실제 수록량

<!-- counts:start -->
| 항목 | 수 |
|---|---:|
| 전체 조각 | 1,430 |
| 기사·좌목 등 말단 본문 | 1,388 |
| 상위 절 본문 | 42 |
| 날짜 raw 있음 | 1,428 |
| 상위 날짜 연결 | 38 |
| 빈 본문 | 0 |
| 본문 글자 | 142,127 |
| 주석 | 198 |
| 색인어 | 7,249 |
<!-- counts:end -->

XML 날짜에서 읽은 연도 범위는 1907~1910이다.
이 범위 안에서 날짜가 있는 조각이 한 건도 없는 연도: 없음.
연도에 기록이 있다는 사실은 해당 연도의 모든 날·사건을 담았다는 뜻이 아니다.
원문 결락, 미상 날짜, 현대 입력의 범위를 구별하며 빈 곳을 추측해서 채우지 않는다.

## 출처·재현

- [한국학중앙연구원 순종실록 해설](https://encykorea.aks.ac.kr/Article/E0031948)
- [공공데이터포털 벌크 XML](https://www.data.go.kr/data/15053646/fileData.do)

원문 웹페이지를 수집한 자료가 아니다. ZIP과 생성 JSONL은 c2의 Git 밖에 두고,
추출 명령·파일별 SHA256·독립 XML 수 대조는 `docs/research/gosunjong-sillok-ingestion.md`에 기록한다.
라이선스 확인은 이 데이터셋 배포본에 관한 것으로 다른 웹 서비스 전체에 적용하지 않는다.
