# 비변사등록 벌크 적재 (#39)

2026-09-06. [공공데이터포털 15053636](https://www.data.go.kr/data/15053636/fileData.do)의
국사편찬위원회 XML 배포본이다. 무료·이용허락범위 제한 없음을 데이터셋별로 확인했다.
파일명은 20221103 스냅샷, 포털 수정일은 2025-06-02다. 웹 본문을 수집한 자료가 아니다.

## 추출·검증

| 항목 | 확인값 |
|---|---:|
| ZIP | 32,815,946 bytes |
| XML | 273개 |
| Source | 1개 |
| 전체 조각 | 93,801개 |
| 기사·좌목 | 93,528개 |
| 책별 서지·해제 | 273개 |
| 날짜 raw 있음 | 93,522개 |
| 본문 글자 | 21,816,615자 |
| 주석 | 31,675개 |
| 색인어 | 998개 |
| JSONL 세 파일 합 | 148,008,398 bytes |

두 번 추출한 JSONL·사료 카드의 바이트가 같다. 별도 검증기가 XML을 처음부터 순회하며
모든 ID·층·종류·날짜를 JSONL과 순서대로 대조했다. 누락·추가·날짜 불일치는 0이고
모든 ZIP 항목을 읽어 CRC 검사를 통과했다. 추출기 최대 RSS는 53,876 KiB, 1차 추출 49.15초였다.
환경과 부하가 달라지면 시간은 달라진다.

책 앞의 소개·범례를 기사로 취급하지 않는다. `source-metadata` 조각의 `frontMatterXml`에
제목·소장·현대 출판·수록 범위와 원래 해제를 보존하고, 해제·범례 본문도 읽을 수 있게 추출한다.
현대 간행일 1959년을 역사 사건의 날짜로 상속하지 않는다. 272개 빈 본문은 소개 글이 없는 책의
서지 조각이며, 해당 조각에도 원래 front XML이 남는다.

원주·도말·교감주·간주·탈초자주는 별도로 보존한다. 미지원 글자 875개는 기존 추출기 규칙대로
`〓`와 원본 코드로 남긴다. 판독을 임의로 보충하지 않았다.

## 서지 설명과 실제 날짜

서지 조사는 Claude Opus 5 / Max effort가 맡았다. 실제 호출 모델도 `claude-opus-5`로 확인했다.
자료: [한국학중앙연구원 비변사등록 해설](https://encykorea.aks.ac.kr/Article/E0025149).
호출 기록은 로컬 `%TEMP%/sigong-next-opus5/corpus-cards/`, 세션 `9f7d395b-ec89-43d8-965f-3c0dccdcbfe3`에 있다.

일반 해설은 현존 범위를 1617~1892로 잡지만 첫 책에는 1616년 기사 3건도 있다.
`bb_001_002_01_0010`, `bb_001_004_01_0010`, `bb_001_006_01_0010`에서
locator의 광해군 8년, 丙辰 날짜 라벨, raw의 1616이 대응한다.
따라서 이 Source가 **실제로 다루는 기간**은 1616~1892로 표시한다.
그 범위 안에서 날짜가 있는 조각이 없는 연도는 53개다. 날짜 집계로 결락된 물리적 책 수를 판단하지 않는다.

비변사 폐지 이후 의정부가 이어 쓴 부분도 같은 계열에 들어 있다.
연속 작성 기록이므로 `composedYear`는 null이다. 현대 영인본 간행일과 원래 기록의 작성 시점을 구별한다.

## 재현

ZIP: c2 `/home/lia-c2/work/corpus-next-round/data/bulk/15053636.zip`.
원본과 생성 JSONL은 Git 밖에 둔다. 카드·코드·다음 검증 기록은 Git에 둔다.

- [추출 수치·파일별 SHA256](bibyeonsa-extraction.json)
- [독립 XML·연도 집계](bibyeonsa-audit.json)
- [두 번 추출한 결과 대조](bibyeonsa-reproducibility.json)

```bash
python3 scripts/fetch_datago_bulk.py --dataset 15053636
python3 services/ingestion/extract_nikh_xml.py --source bibyeonsa-deungnok --bulk /path/15053636.zip --out /work/first/data/sources --report /work/bibyeonsa-first.json
python3 scripts/verify_nikh_counts.py --source bibyeonsa-deungnok --bulk /path/15053636.zip --sources-dir /work/first/data/sources --out /work/bibyeonsa-audit.json
python3 scripts/build_later_cards.py --dataset 15053636 --sources-dir /work/first/data/sources --report /work/bibyeonsa-first.json --audit /work/bibyeonsa-audit.json
```

다른 출력 폴더에 한 번 더 실행해 파일 해시를 대조한다. 운영 반영 전 `verify_later_corpus.py`로
실제 카드·사료 토글·연도별 원문 응답을 확인한다. 새 사료를 적재했다고 자동으로 Claim을 만들지는 않는다.
