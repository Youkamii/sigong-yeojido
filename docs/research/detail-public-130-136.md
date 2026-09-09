# 시대별 장면·영역·전승 공개 검증 (#130–136)

실제 연결을 확인한 실행 JSON이다. 여러 기능 반영 시점의 결과이며 하나의 SHA·호스트에서 전체를 동시에 검사한 결과로 합산하지 않는다.

| 기능 | 공개 검사 | 환경 |
|---|---|---|
| 시대별 풍경 #130 | [13 PASS](period-scenery-public-130.json) | c2, outage 이전 |
| 활동별 장면 #131 | [12 PASS](activity-scenes-public-131.json) | c2, outage 이전 |
| 장소 참조점 #132 | [20 PASS](place-references-public-132.json) | c2, outage 이전 |
| 국가 영역 #133 | [17 PASS](territories-public-133.json) | c2, outage 이전 |
| 수도·핵심 이름 #134 | [10 PASS](capital-labels-public-134.json) | 실제 저장소·RDF를 연결한 Windows 임시 공개판 |
| 지역 사건 #135 | [16 PASS](local-scenes-public-135.json) | c2, `4011a983` 자료 반영 후 |
| 성곽 배경 #135 | [12 PASS](historical-sites-public-135.json) | 임시 공개판, `db0a97e5` 코드 |
| 전승 #136 | [15 PASS](traditions-public-136.json) | 임시 공개판, `82f69433` 코드 |

RDF 315,183트리플을 실제 Fuseki에 적재한 [SPARQL 집계](narratives-rdf-136.json)는 전승 9개·무대 연결 9개·등장인물 연결 11개를 확인한다.
전승에 실제 사건의 장소·시기·현장 참여 술어를 붙인 건수는 0개다. 전체 Claim 12,769개·Source 카드 1,841개다.
백엔드 `tests.test_build_ttl`, `tests.test_chronicle_query` 30개가 통과했고 전체 빌드와 TTL 검증에서 오류가 없었다.
성곽 배경 추가는 프런트엔드 표시이며 RDF의 존속 기간·사건 집계를 변경하지 않았다.

[실제 공개 성능 측정](interaction-public-136.json)은 RTX3060, 1920×1080, medium, 실제 그리기 버퍼 1580×742 조건이다.
초기 준비 15.328초, 연도 드래그 1,375.1ms, 입력 처리 최대 1.9ms다. 연도 확정 중 최대 프레임 272.8ms가 있었다.
지도 이동 161.7fps(p95 6.2ms, 최대 84.8ms, 50ms 초과 1개), 전체 보기 143.1fps(p95 12.2ms, 최대 18.1ms)다.
이전 측정과 호스트·표본이 달라 엄밀한 성능 전후 비교로 쓰지 않는다. 저사양 실기기는 NOT_RUN이다.
GitHub Actions workflow 0개를 확인했다. CI NOT_RUN이며 공개 브라우저 검사를 CI로 부르지 않는다.

검사 브라우저와 서버·터널은 창 없이 실행했다. c2의 현재 복구 상태는 [#137 기록](runtime-recovery-137.md)을 따른다.

초기 병렬 파일 요청의 연결 끊김은 #138 `e5b88453`에서 수정했다. [64개 실제 HTTP 요청 전후 비교](http-burst-138.md)와 [수정 후 공개 시작·전승 15개 검사](startup-public-138.json)를 따로 실행했다. 기존 GPU 프레임 성능표를 이 서버 변경 후 재측정한 것으로 읽지 않는다.
