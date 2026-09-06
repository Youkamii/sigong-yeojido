# 대관령옛길의 현재 안내 트랙과 별도 역사 설명 (#88)

공식 국가숲길 ZIP의 대관령옛길 코스(0000000008) **932개 좌표**를 그대로 수록했다.
주 렌즈에서 **대관령옛길 · 현재 안내**를 고르면 제공 자료의 기준연도인 2023년으로 이동한다.
현재 코스의 원 레코드와 국가유산청의 역사 설명을 각각 열 수 있다.

- Source 2개·chunk 2개·Claim 2개·Place 2개다. 하나는 현재 코스 기록이고, 하나는 별도 기관 설명이다.
- 두 Source를 함께 켜야 선과 설명을 나란히 표시한다. 두 장소의 동일성 Claim은 만들지 않았다.
- 단일 열린 선의 순서와 932개 좌표를 유지했다. 새 연결·외삽·단순화는 0개다.
- 현재 트랙의 기준일은 2023-08-25다. 원 GPX의 2022년 시각도 보존했다. 고도 0과 같은 시각이 반복돼 실측 고도·소요시간·속도로 계산하지 않는다.
- 고려·조선 교통로였다는 기관 설명은 짧은 인용으로 별도 Source에 둔다. 현재 선이 지정구역이나 과거 노면과 같다는 근거는 미확인이다. 과거 특정 연도에 유효한 역사 역로는 여전히 0개다.

[조사와 실제 원 파일](historical-routes-57.md), [원 ZIP·범례 대조](preserved-route-file-57.json),
[추출 결과](preserved-route-import-88.json)를 보존했다. Claude Opus 5 / max의 최종 대조는
현재 참고 자료 수록 가능·역사 노선 수록 불가로 판정했다. 개발·통합은 Codex가 담당했다.

[두 빈 디렉터리의 10개 출력 파일](preserved-route-repeat-88.json)은 서로, 그리고 저장소 파일과 바이트가 같다.
[실제 개발 뷰어의 9개 검사](preserved-route-local-88.json)는 원 GPX의 모든 좌표·RDF 주장·분리된 엔티티·
2D 선 클릭·두 출처 열람·3D의 1,862개 선 꼭짓점·사료/연도/AI 필터·다른 지도 종류 전환·480px 화면을 확인했다.
브라우저 오류는 0이다. 응답을 인공 자료로 바꾸지 않았다.

처음 선 클릭 검사는 진입 화면이 사라지기 전에 실행돼 실패했다. [당시 맞은 요소 H1과 화면 상태](preserved-route-initial-88.json)를 남겼다.
검사는 실제 진입 화면이 숨겨진 뒤 클릭하도록 수정했다. 제품의 대기 시간이나 판정 조건을 완화하지 않았다.

전체 검증은 Claim 9,418개·기존 digest 변경 0·신규 2·실패 0이며 JavaScript 14개가 통과했다.
[전체 TTL 검사](goal-build-check.json)는 245,018트리플 반복 빌드·독립 재파싱·인용·참조·digest 실패 0이다.

```sh
python scripts/import_preserved_route.py --description /path/to/khs-daegwallyeong-description.html --research /path/to/completed-opus-review --out /tmp/preserved-route-import.json
python scripts/verify_preserved_route.py --base http://127.0.0.1:8870 --out /tmp/preserved-route-check
```

추출은 공개 설명의 기록된 원 응답 해시와 완료된 조사 결과를 확인한다. 설명 HTML 전체는 Git으로 재배포하지 않는다.
기준 판본이 바뀌면 그 새 파일을 검토해야 하며 기존 해시에 맞는 것처럼 수록하지 않는다.
실제 c2 배포와 운영 주소 수용은 후속 실행 기록을 따른다.
