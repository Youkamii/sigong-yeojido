# 고종·순종실록과 부록 적재 (#40)

2026-09-06. [공공데이터포털 15053646](https://www.data.go.kr/data/15053646/fileData.do)의
국사편찬위원회 원문 XML 배포본이다. 무료·이용허락범위 제한 없음을 개별 확인했다.
20221103 스냅샷이며 포털 수정일은 2025-06-02다. 원문 웹페이지를 수집하지 않았다.

## 판본별 분리

| Source | XML 계열 | 실제 날짜 범위 | 조각 | 기사 | 상위 절 |
|---|---|---|---:|---:|---:|
| 고종실록 | wza | 1863~1907 | 28,520 | 27,940 | 580 |
| 순종실록 | wzb | 1907~1910 | 1,430 | 1,388 | 42 |
| 순종실록 부록 | wzc | 1910~1928 | 3,683 | 3,472 | 211 |
| 합계 | | | 33,633 | 32,800 | 833 |

세 Source는 이왕직이 1927~1935년에 편찬한 계열이다. 편찬 배경이 다른 태조~철종 30개 Source와
별도 묶음으로 표시한다. 태조~철종 적재본을 덮어쓰거나 합치지 않는다.

고종실록의 첫 날짜 raw는 즉위년의 `1863-12-08L0`다. 양력 환산 때문에 1864로 바꾸지 않는다.
순종실록 부록에는 순종 승하 뒤인 1928년 5월 3일·7월 6일 기사도 있다.
해설의 1910~1926 설명을 그대로 복사하지 않고 XML의 실제 수록 범위인 1910~1928로 표시했다.
부록에서 1927년 raw 날짜가 있는 조각은 없으며 그 빈 해를 채우지 않았다.

서지 조사는 Claude Opus 5 / Max effort가 수행했고 실제 모델명을 확인했다.
근거는 [한국학중앙연구원 고종실록](https://encykorea.aks.ac.kr/Article/E0003942),
[순종실록·부록](https://encykorea.aks.ac.kr/Article/E0031948),
[고종실록 편찬 과정 연구](https://www.kci.go.kr/kciportal/ci/sereArticleSearch/ciSereArtiView.kci?sereArticleSearchBean.artiId=ART002830190)다.
조사 호출 기록: `%TEMP%/sigong-next-opus5/corpus-cards/`, 세션 `9f7d395b-ec89-43d8-965f-3c0dccdcbfe3`.

## 검증·보존

ZIP 9,529,943 bytes, XML 70개. 원문은 3,921,905자, 주석 3,492개, 색인어 121,037개다.
빈 본문은 없으며 날짜가 있는 조각은 33,630개다. 자체 날짜가 없는 월 구획 등 766개는 상위 연도와
연결하고 `dateInheritedFrom`을 남겼다. 날짜가 있는 날의 서기·간지·연호 병기는 `dateContext`에 보존한다.
날짜의 L 접미사로 역법을 단정하지 않는다.

두 번 추출한 JSONL 9개와 카드 3개의 바이트가 같다. 별도 XML 순회로 전체 ID·층·종류·날짜를
대조해 누락·추가·날짜 불일치가 0임을 확인했다. 모든 ZIP 항목을 읽어 CRC 검사를 통과했다.
판본·책·면수는 `editionReferences`, 교정은 `proofreadings`, 미지원 글자 229개는 `〓`와 원래 코드로 남긴다.
이 자료에서 자동 Claim을 만들거나 판독을 교정하지 않았다.

- [추출 수치·파일별 해시](gosunjong-extraction.json)
- [독립 XML·연도 대조](gosunjong-audit.json)
- [두 번 추출한 결과 대조](gosunjong-reproducibility.json)

## 재현

원본은 c2 `/home/lia-c2/work/corpus-next-round/data/bulk/15053646.zip`에 있다.
생성 JSONL은 다른 실록과 같이 Git 밖에 두고 코드·카드·해시를 Git에 둔다.

```bash
python3 scripts/fetch_datago_bulk.py --dataset 15053646
python3 services/ingestion/extract_nikh_xml.py --source gosunjong-sillok --bulk /path/15053646.zip --out /work/first/data/sources --report /work/gosunjong-first.json
python3 scripts/verify_nikh_counts.py --source gosunjong-sillok --bulk /path/15053646.zip --sources-dir /work/first/data/sources --out /work/gosunjong-audit.json
python3 scripts/build_later_cards.py --dataset 15053646 --sources-dir /work/first/data/sources --report /work/gosunjong-first.json --audit /work/gosunjong-audit.json
```

다른 출력 폴더에서 다시 생성해 JSONL과 카드의 SHA256을 대조한다.
운영 반영 전 `verify_later_corpus.py`로 세 카드·사료 선택·처음과 마지막 연도의 원문 응답을 확인한다.
