# 역사 행정 경계 연결 (#57)

국사편찬위원회 개방데이터셋의 1910~1945년 도 단위 시기별 레코드 32개를 수록했다.
북한 지역을 포함한 자료 전체의 해당 레벨이다. 국경선이나 고대 강역으로 바꾸지 않았다.
지도와 3D에서 같은 사료·연도·AI 필터와 주 렌즈 진하기를 적용한다. 경계를 누르거나 경계 목록에서
선택하면 기관의 시기·근거·추정 표기와 원 레코드를 볼 수 있다.

원 ZIP 232,554,475 bytes, SHA256 `368bae9d3dec5dab929258a52ba7aa6dbd66c10e6cd7aba694a5199a46176af0`.
GeoPackage SHA256 `2e2fab2d5acf4a7b0264a3d02a87c71124633538e384cec6e3e929c5e2dd898c`.
HTML 다운로드 양식은 `/pro_g1/fileDownload.do`에 `fileName=data_set_03_01.zip`과 원 파일명을 POST한다.
자료·이용조건 조사는 Claude Opus 5 / Max, 실제 파일 다운로드·변환·제품 연결은 Codex가 수행했다.
조사 호출은 완료됐고, 작업 폴더 밖 목록 조회 1회가 거절된 사실도 run.json에 남겼다.

기관 개요의 EPSG:5179와 달리 실제 GeoPackage의 레이어 및 모든 도형 헤더는 EPSG:4326이다.
실물 값을 사용했다. 원 도형 32개는 모두 유효했고, 표시용으로 Shapely 2.1.2의 0.002도 허용값을 사용했다.
원 좌표 4,536,177개를 표시 좌표 96,782개로 줄였다. 각 도형을 따로 단순화하므로 공유 경계를
위상적으로 한 번에 처리한 결과는 아니다. 화면에는 외곽선만 그린다.
방법: [Shapely 문서](https://shapely.readthedocs.io/en/stable/reference/shapely.simplify.html),
[GeoPackage 형식](https://www.geopackage.org/spec/#gpb_format).

원 `begin/end`의 일 단위 값을 보존하고 현재 연도와 겹치는 모든 레코드를 표시한다.
1914년처럼 변경이 있는 해는 여러 경계가 함께 나온다. `trust`, `geom_ref`, 잘린 `reference` 문구도
그대로 남겼다. 코드 뜻이나 잘린 글자를 추측해 고치지 않았다.

재현: Shapely 2.1.2를 설치한 수집 환경에서
`python scripts/import_hgis_boundaries.py --zip PATH --research OPUS_FOLDER --out REPORT.json`.
운영 서버에는 Shapely를 설치할 필요가 없다. [적재 수치](hgis-boundaries-57.json),
[실제 API·2D·3D·480px 검증](historical-map-57-local.json).
Claim 209개의 인용·참조·digest, TTL 23,426 triples 검사가 실패·경고 없이 통과했다.

**남은 범위:** 고대·중세 국경, 군현의 하위 레벨, 전근대 역로와 사건별 공간 자료는 아직 수록하지 않았다.
CHGIS 벌크 자료와 재배포가 제한된 조선 행정구역 DB는 이 지도 데이터에 포함하지 않았다.
