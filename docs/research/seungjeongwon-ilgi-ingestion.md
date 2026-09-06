# 승정원일기 벌크 적재 (#38)

2026-09-06. [공공데이터포털 15064218](https://www.data.go.kr/data/15064218/fileData.do)의
국사편찬위원회 원문 XML 배포본이다. 무료·이용허락범위 제한 없음을 데이터셋별로 확인했다.
파일명은 20221103 스냅샷, 포털 수정일은 2025-06-02다. 제한된 국편 웹 본문을 수집하지 않았다.

## 실제 수록량

| 항목 | 확인값 |
|---|---:|
| ZIP | 438,822,315 bytes |
| XML | 297개 |
| Source | 1개 |
| 전체 조각 | 2,001,115개 |
| 기사·좌목·요목 | 1,897,041개 |
| 상위 일자 구획 | 104,074개 |
| 본문이 빈 조각 | 104,802개 |
| 본문 글자 | 306,170,668자 |
| 주석 | 147,061개 |
| 색인어 | 9,809,671개 |
| 원문 JSONL | 3,680,219,071 bytes |

원문·주석·색인어와 편집 표시를 합친 JSONL은 약 4.37 GiB다. 파일별 크기·SHA256은
[두 번 추출한 결과 대조](seungjeongwon-reproducibility.json)에 있다. Git에는 카드·코드·검증 기록을 두고,
ZIP과 생성 JSONL은 c2의 Git 밖에 둔다. 다운로드도 1 MiB씩 기록하며 아카이브 전체를 메모리에 쌓지 않는다.

독립 검증기가 XML을 순회하며 전체 ID·층·종류·날짜와 상속 관계를 JSONL에 대조했다.
누락·추가·날짜 불일치는 0이며 모든 ZIP 항목의 CRC 검사를 통과했다.
두 번 추출한 JSONL 4개와 사료 카드의 바이트가 같다.
추출은 각각 15분 46초·15분 53초, 최대 RSS 519,376·533,764 KiB였다.
독립 대조는 3분 34초·207,168 KiB였다. 수치는 해당 c2 실행의 관측값이다.

## 날짜·판본 정보

병기된 날짜의 첫 값은 간지이고 서기는 뒤에 있다. 모든 형식을 `dateForms`에 보존하고
XML이 제공한 `type=서기` 값을 연력에 사용한다. 자체 날짜가 없는 기사·좌목·요목에는
상위 날짜 원표기와 `dateInheritedFrom`을 남긴다. 임의의 음양력 환산은 하지 않는다.
원본·탈초본 책/면수는 `editionReferences`, 기사·좌목 등의 구별은 `recordType`으로 남긴다.

날짜가 있는 조각은 전부 1623~1910 안에 있다. 그 범위에서 **1624·1695년은 날짜가 있는 조각이 없다**.
실제 날짜 집계와 소실·개수의 서지 설명은 서로 다른 정보이므로 빈 연도를 추측해 채우지 않는다.
연속 작성 기록이므로 `composedYear`는 null이다. 개수 완료 연도를 전체 저작의 편찬 연도로 쓰지 않는다.

공용 추출기의 `unknownTags`에는 `name` 4,580개와 `missing` 105,319개가 남는다.
실제 XML에서 각각 개수자·찬자 표시와 결락 표시임을 확인했다. 기본 본문 추출은 이 태그 안의 글자를
보존한다. 태그 속성·원래 XML·주석 내부 여부는 `editorial-marks.jsonl`에 따로 저장한다.
이 파일은 본문 렌더링에서 제외되는 하위 요소도 읽으므로 `name` 4,623개(개수자 1,232·찬자 3,391)를 보존한다.
결락 표시는 105,319개이고 빈 문자열인 표시는 없다. `ordinal`은 XML 표시의 순서이지 본문 글자 offset이 아니다.
미지원 글자 34,670개는 `〓`와 국편 코드로 남긴다.

서지 조사: Claude Opus 5 / Max effort, 실제 응답 모델 `claude-opus-5` 확인.
근거는 [한국학중앙연구원 해설](https://encykorea.aks.ac.kr/Article/E0032244),
[국가유산포털](http://www.heritage.go.kr/heri/cul/culSelectDetail.do?ccbaCpno=1111103030000),
[UNESCO 기록 복원 설명](https://www.unesco.org/en/memory-world/seungjeongwon-ilgi-diaries-royal-secretariat)이다.
호출 기록은 로컬 `%TEMP%/sigong-next-opus5/corpus-cards/`, 세션 `9f7d395b-ec89-43d8-965f-3c0dccdcbfe3`에 있다.

## 재현

원본: c2 `/home/lia-c2/work/corpus-next-round/data/bulk/15064218.zip`.
확인된 추출본: 같은 작업 폴더의 `first/data/sources/seungjeongwon-ilgi/`, `second/data/sources/seungjeongwon-ilgi/`.

```bash
python3 scripts/fetch_datago_bulk.py --dataset 15064218
python3 services/ingestion/extract_nikh_xml.py --source seungjeongwon-ilgi --bulk /path/15064218.zip --out /work/first/data/sources --report /work/seungjeongwon-first.json
python3 scripts/extract_journal_marks.py --bulk /path/15064218.zip --out /work/first/data/sources/seungjeongwon-ilgi/editorial-marks.jsonl --report /work/editorial.json
python3 scripts/verify_nikh_counts.py --source seungjeongwon-ilgi --bulk /path/15064218.zip --sources-dir /work/first/data/sources --out /work/seungjeongwon-audit.json
python3 scripts/build_later_cards.py --dataset 15064218 --sources-dir /work/first/data/sources --report /work/seungjeongwon-first.json --audit /work/seungjeongwon-audit.json
```

새 폴더에 다시 추출해 네 JSONL과 카드의 SHA256을 대조한다.
[추출 수치](seungjeongwon-extraction.json), [독립 XML·연도 대조](seungjeongwon-audit.json),
[편집 표시 집계](seungjeongwon-editorial.json)에 원자료와 관측 결과를 기록했다.
운영 반영 전 `verify_later_corpus.py`로 카드·사료 선택·연력 원문 응답을 확인한다.
벌크를 적재했다고 새 Claim을 자동으로 만들지는 않는다.
