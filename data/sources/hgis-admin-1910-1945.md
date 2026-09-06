---
type: "Source"
id: "src-hgis-admin-1910-1945"
label: "역사지리정보DB · 1910~1945년 도·군·부 등 경계"
sourceKind: "현대 기관 구축 역사 GIS"
sourceGroup: "역사 공간 자료"
composedYear: null
coversFrom: 1910
coversTo: 1945
defaultLens: false
resource: "https://hgis.history.go.kr/pro_g1/dataset.do"
license: "open-data-catalog-unrestricted"
licenseDetail: "공공데이터포털 15080854의 이용허락범위: 제한 없음. 공공누리 유형 번호 미확인."
edition: "개방데이터셋 2025.04.24 표시 · 2026-09-06 다운로드"
status: "draft"
verified: null
originalLanguage: "ko"
narrativeVoice: "modern-institutional-reconstruction"
generated_by: "codex"
---

# 1910~1945년 도·군·부 등 경계

국사편찬위원회 역사지리정보DB의 도 단위 32개, 군·부 등 단위 726개 시기별 레코드다. 고대 강역이 아니다.
선택한 해와 기간이 겹치는 모든 경계를 표시하므로 같은 해에 바뀐 경계가 함께 보일 수 있다.
경계 변경일·기관이 적은 근거·추정 및 신뢰도 코드·잘린 텍스트를 원문 레코드에서 확인할 수 있다.

[제공처](https://hgis.history.go.kr/pro_g1/dataset.do) · [공공데이터포털 이용조건](https://www.data.go.kr/data/15080854/fileData.do)

기관 개요의 EPSG:5179와 달리 실제 받은 GeoPackage는 EPSG:4326이다. 파일 내부 좌표계를 사용했다.
표시용 도형은 Shapely 2.1.2로 0.002도 허용값에서 단순화했다. 현대 측량 경계나 법적 경계로 확정한 자료가 아니다.
개별 도형의 유효성 상태와 다운로드·원 좌표 해시는 적재 보고서에 남겼다. 수록한 점은 없다.
군·부 등 레코드의 원 호칭에는 郡·府·島·部가 있으며 원값을 그대로 표시한다.
원 도형에 자기 교차가 있는 경우에는 상세 패널에 표시한다. 원 좌표 해시와 표시용 단순화 결과를 함께 보존한다.

조사 Claude Opus 5 / Max, 파일 대조·좌표 변환과 연결 Codex. 사람의 해석 검토는 아직 없다.
