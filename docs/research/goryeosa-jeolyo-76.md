# 고려사절요 공개 XML 전량 추출 (#76)

[공공데이터포털 15115521](https://www.data.go.kr/data/15115521/fileData.do)의 국사편찬위원회 배포본을 사용했다.
2026-09-07 이용조건은 공공누리 제1유형(출처표시)이다. ZIP 2,341,708바이트 안에 XML 36개가 있다.
본문 35권과 서문 파일이며 DTD와 비XML 파일은 본문으로 세지 않았다.

본문 단위 11,226개, 주석 514개, 색인어 53,260개를 추출했다. 빈 본문과 누락·중복 ID는 0개다.
일자 정보가 있는 본문 11,190개의 연도 범위는 918~1392다. 상위 항목의 날짜와 L 접미사도 보존한다.
미지원 글자 20개는 기존 추출기 방식대로 자리표시와 원 코드에 남긴다. 번역본은 추가하지 않았다.

공용 추출기를 두 번 실행한 JSONL 3개의 크기와 SHA256이 일치한다.
원 XML에서 별도로 센 본문 ID·기사/절 구분과 추출 결과도 전량 일치한다.
[다운로드·파일 해시·수치](goryeosa-jeolyo-76.json)에 기록했다. 실제 c2 검색·카드는 다음 배포 검사에 포함한다.

Claude Opus 5 / Max의 자료 조사 결과를 사용했다. 조사 호출은 세션 한도로 끝났으며,
저장된 목록을 바탕으로 Codex가 공개 ZIP 다운로드·내용·이용조건을 직접 확인하고 추출했다.
국편 웹 본문은 수집하지 않았다. [원 호출 기록](../../data/research/goryeosa-jeolyo-76/run.json).

```sh
python scripts/fetch_datago_bulk.py --dataset 15115521
python services/ingestion/import_public_nikh.py --source goryeosa-jeolyo --bulk data/bulk/15115521.zip --download-meta data/bulk/15115521.meta.json --out data/sources --report docs/research/goryeosa-jeolyo-76.json
```

본문 JSONL은 Git에 포함한다. 새 클론에서도 이 사료를 검색할 수 있다.
