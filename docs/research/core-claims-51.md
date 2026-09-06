# 고대·고려사 주장 뼈대 (#51)

현재 전체 자료는 Claim 260개이며 실제 주장이 있는 Source는 47개, 원문만 적재한 Source는 949개다.
[운영 RDF의 사료별 분포](claim-coverage-current.json)는 `scripts/report_claim_coverage.py`로 생성했다.
아래는 고대·고려사 54개를 처음 반영한 단계의 기록이다. 이후 실록 12개·신라 인물 7개와
근현대·시간·위치·역사 경계 주장이 추가됐다. 현재 운영·남은 범위는 [전체 작업표](../TASKS.md)를 따른다.

고조선·삼한·삼국·통일신라·발해·고려는 기존 사료의 소수 대표 서술, 조선은 태조·세종·선조·고종
각 3개, 근현대는 1910·1919·1948·1953·1991·2018년 문서·연설 및 2019년 북한 보고서 발췌가 중심이다.
개별 왕대·생몰·행정구역·주요 사건의 연결과 각 사료의 원문 대비 주장 추출량은 아직 고르지 않다.
HGIS 경계 32개와 현대 좌표 레코드를 인물·사건 뼈대의 완전성으로 계산하지 않는다.

## 첫 반영 단계: 고대·고려 54개

Claude Opus 5 / Max effort로 끝난 조사 두 건의 주장 초안 55개 중 54개를 반영했다.
삼국사기·삼국유사 34개, 고려사 20개를 더해 전체 140개다. 모두 `origin: ai`, `status: draft`이며 사람의 검토 완료를 뜻하지 않는다.

원문 JSONL은 바꾸지 않았다. 비류 건국 이설 1개는 인용이 본문이 아닌 원주에 있어 이번 반영에서 제외했다.
주석 인용 경로를 갖추기 전까지 그 주장을 본문 인용으로 옮기지 않는다.
날짜 원표기 네 곳은 실제 인용에 연속해서 있는 문자열로 맞췄다. 연구 초안의 환산 연도는 메모에만 남기고 TimeSpan의 확정 연도로 넣지 않았다.

이 자료는 고조선·삼한·삼국·통일신라·발해·고려 초기부터 말기까지의 작은 뼈대다.
조선·근현대 주장과 사건별 시간 연결은 남아 있다. 추가 검토 호출 한 건은 세션 한도로 끝나 결과에 포함하지 않았다.

조사 입력과 실제 모델·완료 기록은 `data/research/core-claims-51/`에 있다.
`scripts/import_core_claims.py`는 원문 인용을 대조하고, 엔티티·시간 객체 형식을 맞추며, 제외 항목을 보고한다.
기존 파일과 다른 내용을 덮어쓰지 않으며 같은 입력의 재실행을 확인했다.

```sh
python scripts/import_core_claims.py --research data/research/core-claims-51 --write --out docs/research/core-claims-51.json
python services/validate.py --write-digests
python services/build_ttl.py
```

[검증 기록](core-claims-51-validation.json): 파싱·인용·참조·역사 규칙 실패 0, 경고 0, digest 140/140.
로컬 전체 빌드는 21,432 triples, Claim 140, Conflict 4다. 이 단계의 운영 반영은 아직 하지 않았다.
