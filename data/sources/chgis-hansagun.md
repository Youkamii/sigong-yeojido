---
type: "Source"
id: "src-chgis-hansagun"
label: "CHGIS · 한사군 재구성 지점 4개"
sourceKind: "현대 학술 역사 GIS"
sourceGroup: "현대 위치 연구"
compiler: "Harvard University and Fudan University"
composedYear: null
coversFrom: null
coversTo: null
defaultLens: false
resource: "https://chgis.hudci.org/tgaz/"
license: "CC-BY-NC-4.0"
licenseDetail: "각 원 JSON의 license 필드: CC BY-NC 4.0. 아래 자료에 적용되는 원 조건을 유지한다."
edition: "2026-09-07 원 JSON 대조"
status: "draft"
verified: null
originalLanguage: "zh"
---

China Historical GIS, Harvard University and Fudan University. [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/).

레코드 hvd_112638·112640·112641·112642의 필드를 발췌해 JSON으로 옮겼다. 학술 GIS의 재구성 점이며 고고 유적의 실측점으로 표시하지 않는다. 서로 다른 시기의 현도군 기록은 별도로 유지한다. 임둔·현도·낙랑의 원 present_location과 국가 코드가 함께 남아 있다. 최초 적재 때 기간 코드 0/3과 음수 연도 체계를 확인하지 못해 연도 필터에서는 기간 미상으로 보이며 상세에 원 기간을 적었다. 진번은 이번에 확보한 레코드가 없다. 수록 자료를 다른 사료의 같은 군·유적과 자동 병합하지 않는다.

2026-09-07 추가 확인: 공개 TGAZ 초기 적재 SQL에서 코드 3은 왕의 칭호나 연호를 따른다는 설명이 있다. 코드 0은 설명 문자열이 비어 있고, 예전 할당 값이 비었던 경우는 8로 따로 적혀 있다. 운영 코드표와의 일치·음수 연도 체계·종료연도 0의 뜻은 미확인이므로 원 기간과 필터를 유지한다. [확인한 파일·커밋·한계](https://github.com/Youkamii/sigong-yeojido/blob/main/docs/research/chgis-date-codes-49.md).
