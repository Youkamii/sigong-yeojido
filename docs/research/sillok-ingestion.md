# 조선왕조실록 벌크 적재 — #15

2026-09-06. 공공데이터포털 [실록원문 15053647](https://www.data.go.kr/data/15053647/fileData.do)의 2022-11-03 ZIP을 사용했다.
이용허락범위는 확인일에 **제한 없음**으로 표시됐다. 국편 웹 원문을 수집하지 않았다.
기존 c2 `~/work/corpus-joseon-sillok/data/bulk/15053647.zip`을 재사용했다.

- ZIP: 143,263,188 bytes, SHA256 `9d3b908e14853d1540d8286dc7e397b5d5f3eb472ffffee137dcbd2efa2b740c`.
- XML 673개. 22개 총서 파일은 level1을 포함하고 연차 파일은 level2에서 시작한다. 파일 루트부터 순회한다.
- 실록·판본 30개, 본문 389,483개 = 기사 381,672 + 하위 항목을 가진 절 7,811. 빈 본문 0개.
- XML에 dateOccured가 붙은 조각 380,785개. 주석 68,209개, 색인어 2,040,834개, 미지원 글자 〓 1,872개.
- 생성 JSONL 90개, 합계 840,174,964 bytes. 가장 큰 파일은 중종실록 chunks.jsonl 69,474,576 bytes.

각 실록은 `src-sillok-<국편 prefix>`로 나눈다. `woa/wob` 광해군일기 중초본·정초본, `wna/wnb` 선조실록·수정실록,
`wra/wrb` 현종실록·개수실록, `wsa/wsb` 숙종실록·보궐정오, `wta/wtb` 경종실록·수정실록을 합치지 않는다.
제목·수록 기간·편찬 시점은 [국가기록원 일람표](https://theme.archives.go.kr/next/sillok/sub2_2.do)를 근거로
`services/ingestion/sillok-catalog.json`에 기록했다. 광해군일기 정초본의 1653도 그 표의 값이다.
숙종실록보궐정오는 같은 표의 숙종실록 부록이므로 1728을 따른다. 총서·부록을 포함한 모든 사건의 연대가 수록 기간과 같다는 뜻은 아니다.

`date.raw`의 L 접미사는 해석하지 않고 보존한다. 한 조각 안의 사론·인용문은 글자를 유지한다.
광해군 중초본의 `proofreading`도 글자를 지우지 않고 원문 위치·산삭 등 유형을 `proofreadings`에 남긴다.
이 부분을 확정 판독으로 취급하면 안 된다. 교정 구간의 `text`는 본문과 같은 주석 분리 규칙을 쓴다.
판본명·책·면수는 `editionReferences`로 보존한다. 주석은 본문에서 분리한다.

## 재현

ZIP과 실록 JSONL 전체는 Git 밖에 둔다. 45 MB를 넘는 파일 5개를 포함하여 전체 약 801 MiB이며,
저장소에는 30개 카드·추출기·규칙표·검증 명령·[전체 SHA256](sillok-extraction.json)을 넣는다.
새 클론에서는 카드는 보이지만 원문 수는 0이다. 아래 명령으로 실데이터를 생성해야 검색·연력이 채워진다.

```sh
# ZIP은 기존 파일을 재사용한다. 없으면 다음 명령으로 한 번 받는다.
python3 scripts/fetch_datago_bulk.py --dataset 15053647
python3 services/ingestion/extract_nikh_xml.py --source joseon-sillok --bulk /path/to/15053647.zip --out /tmp/sillok-one/sources --report /tmp/sillok-one.json
python3 services/ingestion/extract_nikh_xml.py --source joseon-sillok --bulk /path/to/15053647.zip --out /tmp/sillok-two/sources --report /tmp/sillok-two.json
cmp /tmp/sillok-one.json /tmp/sillok-two.json
python3 scripts/verify_sillok_counts.py --bulk /path/to/15053647.zip --sources-dir /tmp/sillok-one/sources
python3 scripts/build_sillok_cards.py --sources-dir /tmp/sillok-one/sources --report /tmp/sillok-one.json
```

검증한 `sillok-*` 폴더를 `data/sources/` 아래로 복사한다. 운영 반영 전 감시 빌드와 뷰어를 해당 프로세스만 잠시 멈춰
부분 복사본을 읽지 않게 한다. 복사 완료 뒤 `services/validate.py`, `services/build_ttl.py`, 화면 하네스를 실행하고 감시를 다시 켠다.
개별 카드 수치만 갱신할 때는 `python3 scripts/fill_card_counts.py --source sillok-waa`처럼 실행한다.

## 확인한 것

- 수정된 추출기를 두 번 실행한 전체 출력 90개의 크기·SHA256이 모두 같다. 두 실행의 최대 메모리는 약 140 MiB, 약 3~4분씩.
- 추출기를 import하지 않는 `verify_sillok_counts.py`가 XML id와 JSONL id를 하나씩 대조했다. 누락·중복 0, 층·절/기사 구분 일치.
- 같은 공용 추출기로 삼국사기·삼국유사·고려사를 다시 추출하여 기존 9개 JSONL과 바이트 일치를 확인했다.
- 원문·주석·색인 전체를 메모리에 쌓지 않는 뷰어 변경은 #30. 전체 426,486개를 다룰 때 RSS 약 570 MiB.
- c2 시험 API: sources 19ms, 태조실록 1392년 188개 기록 조회 6ms, 태조실록 漢城 검색 16개·56ms,
  전체 平壤 검색 2,614개·511ms. 첫 색인 생성 뒤 1회 관측값이다.
- 실록을 포함한 TTL 빌드 16.8초, 최대 RSS 약 692 MiB. 기존 `place-gungnae` 엔티티 껍데기 누락 경고 1건은 남아 있다.
- 종류별 묶기·접기와 그룹/개별 선택은 #31에서 화면으로 검사한다. 판톨로지 이식 코어는 수정하지 않는다.
