# 역로 선을 표시하는 경로와 현재 검증 범위 (#86, #57)

2D와 3D가 같은 `featureLines`를 사용해 Polygon/MultiPolygon의 테두리와
LineString/MultiLineString의 선을 읽는다. 각 선의 첫 점에서 새로 시작하며
열린 선을 닫거나 서로 떨어진 선 사이에 새 구간을 만들지 않는다.

지도 종류 5는 `data/maps/historical-routes.geojson.gz`를 읽는다. 파일이 없으면 빈 목록을 반환한다.
연도·사료·AI 필터는 기존 경계·사건 장소와 같은 서버 함수를 사용한다.
새 데이터는 기존과 같이 `id`, `geometry`, `fromSource`, `citesChunk`, `origin`,
`validFrom`·`validTo`를 가지며, `kind: historical-route`와 `label`, `begin`·`end`,
`basis`·`periodNote`로 제공자의 기준 시기와 재구성 설명을 표시한다.
선택하면 원 레코드·사료 카드·역로 목록으로 이동할 수 있다.

검증은 다음 범위다.

- Python 전체 **111개**·JavaScript **13개** 통과. 새 서버 검사는 빈 파일, 떨어진 두 선의
  좌표 보존, 기간 양 끝·기간 밖, 필요한 두 Source·AI 필터와 다른 지도 종류의 보존을 확인한다.
- [브라우저 인공 사례 7개 검사](route-rendering-86-synthetic.json) 통과. 실제 Canvas에 그린
  열린 선의 대각선과 두 선 사이의 빈 구간이 클릭 대상으로 생기지 않는다. 실제 선 클릭으로
  근거·원 레코드를 열고, 3D의 선분 꼭짓점 수가 각각 4개임을 확인했다. 날짜·사료·AI를 끄면
  도형이 사라지며 [480px 화면](route-rendering-86-synthetic-mobile.png)에서도 근거를 열 수 있다.
- 첫 클릭 시험은 기존 소부리 지명 표식에 겹쳤다. [실제 선택 기록](route-rendering-86-overlap.json)을
  보존하고, 인공 시험선을 실제 지명 표식과 떨어진 바다 쪽으로 옮겼다. 기존 표식의 클릭 우선순위는 유지했다.
- 선을 읽는 함수를 공유하는 기존 Cliopatria 경계도 [실제 자료로 9개 검사](route-polygons-regression-86.json)를
  다시 통과했다. 94개 원 기록·500년 4개 경계·2D/3D·근거·행정 단계 전환·480px를 확인했다.

인공 Source·선·원문 응답은 검사 브라우저에만 주입했고 운영 데이터에 쓰지 않았다.
현재 공개 조건과 직접 근거를 확인한 한국사 역로 선은 **0개**다. 실제 역사 자료의
운영 수용은 **NOT_RUN**이며 #86과 상위 #57은 열린 상태를 유지한다.
Claude Opus 5 / Max의 원 선 자료 조사는 별도로 진행한다.

[운영 배포](route-deployed-86.json) 후 [실제 외부 주소](route-empty-production-86.json)에서도
역로 API 200·빈 목록 안내·3D 선 0개를 확인했다. Source는 1,072개 그대로이고
인공 Source가 저장되지 않았으며 콘솔 오류도 없다. 빈 데이터 처리를 검증한 결과다.
