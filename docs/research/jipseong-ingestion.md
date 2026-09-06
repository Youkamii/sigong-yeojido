# 한국고대사료집성 적재 — #17

2026-09-06. [공공데이터포털 15053631](https://www.data.go.kr/data/15053631/fileData.do)의 2022-11-03 벌크 XML.
확인일에 이용허락범위 제한 없음으로 표시됐다. c2 `~/work/corpus-godae-saryo-jipseong/data/bulk/15053631.zip`을 재사용했다.

- ZIP 4,421,095 bytes, SHA256 `437dda1e95c7c9b6cc488819a0ecf10046def7f9ef324e81a08bb3d28198d4d0`.
- XML 92개, Source 92개, 본문 조각 8,689개. 본문을 가진 level 요소 수와 일치한다.
- 주석 8,924, 색인어 187,760. 날짜가 붙은 조각 3,439개. 빈 본문·중복 id·미확인 태그 0.
- 두 번 실행한 JSONL·사료 카드가 모두 바이트 단위로 일치한다. JSONL 합계 38,914,243 bytes, 모두 개별 45 MB 미만.
- [메타데이터·파일별 크기·SHA256](jipseong-extraction.json). `sources`에 서지 머리말 XML과 국편 설명을 보존했다.

원 사서의 level1 id를 따라 `src-jipseong-ko_001`~`src-jipseong-ko_092`로 나눴다.
국편이 발췌한 부분이며 각 사서 전체 원문을 확보한 것은 아니다. 기존 에이전트의 부분 산출물은 보존했고
현재 공용 본문 추출기로 전체 ZIP을 다시 읽었다.

포털 설명에는 95종이라 적혀 있지만 내려받은 ZIP에는 **92개 XML·level1**이 있다. 자료집 전체와 벌크의 차이를 감추지 않고
현재 확보한 것은 92개로 표시한다. 없는 3종의 원문·이름을 만들어 넣지 않았다.

## 서지 정보 처리

- 표제는 `biblioData/title/mainTitle`을 사용한다. `biblioExplanation.name`에는 잠부론·설문해자·산해경이
  모두 일주서로 기재된 곳이 있어 표시 이름으로 쓰지 않는다. 그 속성도 원본 메타데이터에는 보존한다.
- 편찬 시점은 XML `source/dateIssued` 중 단일 숫자 연도·연도+년·B.C. 연도·정확한 날짜만 옮긴다. **50개**에 점이 있다.
  이 값은 국편 서지 필드의 전사이며 역사적 완성 연도를 별도 문헌으로 검증한 값은 아니다.
- 세기·년경·연도 범위·초간 연도·저자 생몰년·미상·빈값 **42개**는 편찬 점을 찍지 않는다. 원표기와 이유를 카드에 적었다.
  예: `3세기말`, `1340년 초간`, `(승우 445~518)`은 정확한 편찬 연도가 아니다.
- 수록 기간은 날짜가 붙은 발췌 기사들의 최소·최대 연도다. **27개** 사서에서 범위를 얻었다.
  날짜가 없는 부분까지 그 기간의 기록이라고 주장하지 않는다. 현대 자료집 간행 연도 2006도 고대 사서의 편찬 시점으로 쓰지 않는다.
- 천지서상지 `pDate` 한 곳의 `0665-08-99L0`은 본문 글자가 아니라 날짜 표기다. `paragraphDates`에 따로 보존한다.
  L 접미사는 해석하지 않는다. 서지 설명·표·소제목·주석·색인어는 보존한다.

시험 API에서 三國志(`src-jipseong-ko_022`)의 高句麗 검색은 6개 조각을 반환했다(113ms, 1회 관측).
개별 사료는 시간축·왼쪽 목록의 한국고대사료집성 묶음에서 펼친다. 범위나 편찬 연도를 모르는 부분은 화면에도 미상으로 남는다.

## 재현

Python 3.11 이상. 사서 분할·서지 처리는 어댑터에, 본문·주석·색인 처리는 공용 `extract_nikh_xml.extract_article`에 있다.

```sh
# ZIP이 없을 때만:
python3 scripts/fetch_datago_bulk.py --dataset 15053631
python3 services/ingestion/extract_jipseong.py --bulk data/bulk/15053631.zip --out /tmp/jipseong-one/sources --report /tmp/jipseong-one.json
python3 services/ingestion/extract_jipseong.py --bulk data/bulk/15053631.zip --out /tmp/jipseong-two/sources --report /tmp/jipseong-two.json
cmp /tmp/jipseong-one.json /tmp/jipseong-two.json
```

검증한 `sources/jipseong-*` 폴더와 카드를 `data/sources/`에 반영한다.
개별 카드 수치는 `scripts/fill_card_counts.py --source jipseong-ko_022`로 다시 채운다.
