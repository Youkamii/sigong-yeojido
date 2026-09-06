# 군·부 등 경계와 행정 단계 선택 (#72)

이미 받은 국사편찬위원회 GeoPackage의 `lv=2` 레코드 726개를 추가했다.
원 호칭은 郡 652개·府 68개·島 1개·部 5개다. 기존 도 경계 32개와 별도 파일에 두며,
화면에서 단계를 바꿔 같은 연도·사료·AI 필터로 조회한다. 경계 목록에서 이름을 찾을 수 있다.

1914년과 기간이 겹치는 군·부 등 기록은 560개다. 같은 해의 변경 전·후 기록을 함께
포함하므로 동시에 존속한 행정구역 560개라는 뜻은 아니다. 원 `begin`·`end`, 상위 코드,
근거·신뢰도 코드를 상세와 원 레코드에서 확인한다. 신뢰도 코드의 공식 뜻은 미확인이다.

원 좌표 5,815,534개를 표시용 180,827개로 단순화했다. 좌표계는 파일의 EPSG:4326,
Shapely 2.1.2의 `simplify(0.002, preserve_topology=True)`를 사용한다.
원 도형 4개에는 자기 교차가 있다. 상세에 이 상태를 표시하고 원 좌표 해시를 보존했다.
별도 도형 복구는 하지 않았으며 표시용 결과의 유효성 오류는 0개다.

- [변환과 원본 해시](hgis-districts-72.json)
- [726개 레코드·원 좌표 전수 대조와 반복 실행](hgis-districts-72-audit.json)
- [실제 화면·API 검사](hgis-districts-72-local.json): 단계 전환, 필터, 연도 겹침, 2D 선,
  이름 검색, 원 레코드, 3D ID, 남은 선택 대상, 480px 조작 9개 통과
- [Claude Opus 5 Max 조사](../../data/research/hgis-districts-72/result.json)와 [실제 호출](../../data/research/hgis-districts-72/run.json)

조사에서 확인한 HGIS의 robots 제한에 따라 새 스크래핑은 하지 않는다. 조사의 개요 요청
한 건이 robots 확인과 겹쳐 실행된 기록은 초안에 남아 있으며 채택 근거에서 제외했다.
이번 변환은 이전에 받은 벌크 파일만 사용한다. 별도 JoseonDB의 필드 뜻을 이 파일에
옮겨 붙이지 않았다. 조사자가 제안한 특정 날짜 필터는 기존 연도 겹침 규칙과 달라 채택하지 않았다.

```bash
python scripts/import_hgis_boundaries.py --level 2 --generated-at 2026-09-07 \
  --zip /path/to/data_set_03_01.zip --research /path/to/hgis-district-records-72 \
  --out docs/research/hgis-districts-72.json
python -m unittest discover -s tests
.venv-build/bin/python scripts/verify_historical_districts.py \
  --base http://127.0.0.1:8870 --out /tmp/sigong-districts-production
```

고대 국경·읍면 8,176개·역로·사건 지형은 #57에 남아 있다. 사람의 역사 해석 검토는 아직 없다.
