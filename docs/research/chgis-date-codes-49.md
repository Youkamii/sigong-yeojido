# CHGIS/TGAZ 기간 코드의 확인 범위 (#49)

2026-09-07. Claude Opus 5 / Max가 찾은 공식 개발 저장소의 파일을 Codex가 커밋 `a43c8580be52c53ff5750cb74e42cc92ffd853e7`에 고정해 원문과 대조했다. [파일별 URL·SHA256](chgis-date-codes-49.json)을 남겼다.

| 코드 | 공개 초기 적재 SQL의 실제 값 |
|---|---|
| 3 | 왕의 칭호나 연호에 따라 연도를 정한다는 설명이 있음 |
| 0 | 설명 문자열이 비어 있음. 미상·미입력·규칙 없음 중 어느 뜻인지 결정할 수 없음 |
| 8 | CHGIS 3/5에서 할당 값이 비어 있던 경우라는 별도 설명이 있음 |

근거는 [tgw-lookup-ddl.sql](https://github.com/cga-harvard/tgaz/blob/a43c8580be52c53ff5750cb74e42cc92ffd853e7/tgw/tgw-lookup-ddl.sql)의 41·46·48행이다. 코드 0을 값 누락이라고 추정하지 않는다. 이 파일은 초기 적재 SQL이므로 운영 서비스의 코드 테이블도 현재 같다고 확인한 것은 아니다.

[tgw-entity-ddl.sql](https://github.com/cga-harvard/tgaz/blob/a43c8580be52c53ff5750cb74e42cc92ffd853e7/tgw/tgw-entity-ddl.sql)은 연도를 정수, 기간 규칙을 별도 코드로 저장한다. [검색 코드](https://github.com/cga-harvard/tgaz/blob/a43c8580be52c53ff5750cb74e42cc92ffd853e7/tgw/webservice/api/search.php)는 조회 연도를 시작·종료 값과 수치 비교한다. 이 구현만으로 음수의 기원전 환산 방식이나 종료연도 0의 역사적 뜻을 확정하지 않는다. 조회 예시 파일에도 해당 정의는 없었다.

현재 수록한 4개 CHGIS 지점은 기존 좌표와 원 기간을 유지한다. 이 코드 확인으로 진번군의 좌표가 생기거나, CHGIS의 군 단위 점이 발굴 유적의 실측점이 되는 것은 아니다. Q6는 여전히 부분 상태다. 코드 3 설명의 확인과 음수·0 연도의 미확인을 구별한다.
