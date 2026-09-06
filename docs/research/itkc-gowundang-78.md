# 고전번역원 공개 XML: 고운당필기 (#78)

[공공데이터포털 15022432](https://www.data.go.kr/data/15022432/fileData.do)는 이름이 고전원문이지만
실제 ZIP 208,913바이트에는 **고운당필기 6권과 서지 XML**만 있다. 경국대전·일성록·신증동국여지승람은 없다.
2026-09-07 이용허락범위 제한 없음 표시와 ZIP을 확인했다.

본문 254편, 현대 범례 1개를 수록했다. 범례에는 전체 295편 중 41편을 확인하지 못했다고 적혀 있다.
원문간행년 1780, 현대 교감표점본 간행년 2020, XML 자료생성일 2021-11-30은 서로 구분한다.
번역 연결 ID 254개는 보존했지만 번역문은 이 ZIP에 없다.

기존 본문 렌더러를 재사용한다. 원주 207개와 교감주 196개를 분리하고, 교감주가 감싼 본문 글자는 보존한다.
고유명사 5,817개와 페이지 표지도 남겼다. 미지원 글자 3개의 KC 코드와 자리표시를 유지한다.

두 번 추출한 JSONL의 바이트·SHA256이 일치한다. 별도의 검증기가 원 XML과 255개 조각의 ID·글자를
전량 대조했고 누락·중복·문자 차이 0개였다. 비교에서는 ASCII 배치 공백만 제외했다.
주석 분리와 누락 참조에 대한 검사 2개도 통과했다.
[추출·서지·해시](itkc-gowundang-78.json), [독립 문자 대조](itkc-gowundang-78-audit.json).

자료 조사는 Claude Opus 5 / Max가 세션 한도 전에 저장한 결과를 사용했다.
공개 ZIP 다운로드·검증·추출은 Codex가 수행했다. 본문 JSONL과 재현 코드를 Git에 포함한다.
실제 운영 검색·카드 확인은 다음 배포 검사에 포함한다.

```sh
python scripts/fetch_datago_bulk.py --dataset 15022432
python services/ingestion/extract_itkc_public.py --bulk data/bulk/15022432.zip --download-meta data/bulk/15022432.meta.json --out data/sources --report docs/research/itkc-gowundang-78.json
python scripts/verify_itkc_public.py --bulk data/bulk/15022432.zip --chunks data/sources/itkc-gowundang-pilgi/chunks.jsonl --out docs/research/itkc-gowundang-78-audit.json
```
