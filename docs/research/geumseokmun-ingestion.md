# 한국고대금석문 적재 — #16

2026-09-06. [공공데이터포털 15053630](https://www.data.go.kr/data/15053630/fileData.do)의 벌크 XML.
확인일에 이용허락범위 제한 없음으로 표시됐다. 웹 원문을 수집하지 않았다.
c2 `~/work/corpus-godae-geumseokmun/data/bulk/15053630.zip`을 다시 다운로드하지 않고 사용했다.

- ZIP 2,290,907 bytes, SHA256 `8cb029349c177ecfb22e6968c302307bed0fb01845a2b22dc21a775c9d1e1f71`.
- XML 10개, 금석문 Source 823개, 본문 조각 3,195개. XML의 본문 개수와 일치, 중복 id·빈 본문·미확인 태그 0.
- 판독문 1,338, 개관 801, 해석문 246, 참고문헌 810. 종류는 제목 추정이 아닌 XML `biblioData.type`을 사용한다.
- 주석 10,505, 색인어 6,842. 본문과 주석을 분리하고 소제목·강조·위첨자·표·설명 태그의 글자를 보존한다.
- Source 카드와 JSONL 3,292개, 합계 16,793,083 bytes. 두 번 실행한 카드·JSONL 전부 바이트가 같았다.
- [전체 메타데이터와 파일별 SHA256](geumseokmun-extraction.json). 금석문 머리말 XML은 `frontXml`로 함께 보존했다.

계층은 국가·종류·묶음 아래 금석문이다. 판독·해석 등의 본문 조각을 직접 거느린 요소를 Source 하나로 보고
`src-geumseok-<국편 금석문 id>`로 나눈다. 한 금석문 안의 판독자별 조각도 서로 합치지 않는다.
판독자 이름은 XML 저자 필드에서만 가져온다. 서명·제목만 있는 경우 사람 이름을 추정하지 않는다.

제작 시점은 금석문의 `dateOccured`에서 가져온다. 단일 연도는 점과 범위에, `05##` 같은 세기 표기는 500~599 범위에만 둔다.
9999·빈값·해석하지 못한 값은 미상으로 남긴다. 원표기는 각 카드와 보고서에 있다.
판독문만 이 날짜를 상속한다. 현대 해제·번역·참고문헌을 고대의 연도별 사건에 넣지 않는다.

## 기존 광개토왕릉비와 대조

기존 `src-gwanggaeto`는 위키문헌 판독 42개 조각, 새 `src-geumseok-gskh_001_0010_0010`은
국편 17개 절(판독문 14개)이다. 공통 문자열을 공백 제거 후 대조했다.

| 표기 | 위키문헌 판독 | 국편 판독문 14개 중 |
|---|---|---:|
| 惟昔始祖 | 있음 | 14 |
| 鄒牟王 | 있음 | 14 |
| 辛卯年 | 있음 | 10 |

이 표는 같은 글자열이 있는지 센 결과다. 어느 판독이 옳은지 판정하거나 판본을 하나로 합친 결과가 아니다.
기존 85개 Claim의 인용 대상·digest를 바꾸지 않았고 새 사료 카드에서 기존 Source를 연결해 설명했다.
시험 API에서 새 국편 판본의 鄒牟 검색은 16개 절을 반환했다(120ms, 1회 관측).

## 재현

Python 3.11 이상, 표준 라이브러리만 사용한다. 판본별 어댑터도 공용 `extract_nikh_xml.extract_article`을 사용한다.

```sh
# ZIP이 없을 때만:
python3 scripts/fetch_datago_bulk.py --dataset 15053630
python3 services/ingestion/extract_geumseokmun.py --bulk data/bulk/15053630.zip --out /tmp/geumseok-one/sources --report /tmp/geumseok-one.json
python3 services/ingestion/extract_geumseokmun.py --bulk data/bulk/15053630.zip --out /tmp/geumseok-two/sources --report /tmp/geumseok-two.json
cmp /tmp/geumseok-one.json /tmp/geumseok-two.json
```

검증한 `sources/geumseok-*` 폴더·카드를 `data/sources/`에 반영한다. 생성 JSONL은 모두 45 MB보다 작아 저장소에 포함한다.
개별 카드 수치는 `scripts/fill_card_counts.py --source geumseok-gskh_001_0010_0010`로 다시 채울 수 있다.
화면에서는 국가별 `금석문 · <국가>` 묶음을 펼쳐 개별 사료를 선택한다.
