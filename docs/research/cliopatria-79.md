# Cliopatria 한국사 경계 94개 (#79)

2026-09-07. [Cliopatria v0.1.3](https://zenodo.org/records/14714684)의 한국사 관련 정치집단 17개 이름에 해당하는 레코드 94개를 별도 렌즈로 연결했다. 제공처는 Ed Chalstrey·James Bennett·Seshat Global History Databank이며 [CC BY 4.0](https://github.com/Seshat-Global-History-Databank/cliopatria/blob/v0.1.3/LICENSE.md)을 적용한다.

원 ZIP의 15,690개 도형에서 고조선·진·삼한·고구려·백제·신라·통일신라·발해·후백제·태봉·고려·조선·대한제국·북한·대한민국을 선택했다. 첫 후보 목록 86개에서 빠진 삼한 7개와 태봉 1개를 원 이름 필터에 포함했다. 실제 원 필드·레코드 순번·원 도형 SHA256은 [추출 기록](cliopatria-79.json)에 있다.

## 범위와 보존

- 원 좌표 선언은 `urn:ogc:def:crs:OGC:1.3:CRS84`이며 WGS84 경도·위도 순서다. 표시 도형만 0.002도로 단순화했다. 원 7,648개 꼭짓점에서 표시 7,590개로 줄었고 원본·표시본의 도형 유효성 오류는 모두 0이다.
- `FromYear`·`ToYear`는 이 자료가 도형에 붙인 적용 기간으로 양 끝을 포함한다. 음수는 제공처의 기원전 표기다. 다른 사료의 건국·멸망 시점을 바꾸지 않는다. 500년에는 원 자료대로 Byeonhan·Goguryeo·Baekje·Silla 네 레코드가 나온다. Byeonhan의 적용 기간은 -91~533이다.
- 각 레코드는 별도 Place·`hasBoundaryRecord` Claim·원 필드 chunk를 갖는다. 기존 국가·지명과 자동 병합하지 않는다. 원 위키백과·Seshat 필드는 참고 링크이며 개별 고지도 대조를 대신하지 않는다.
- 연구자가 검토한 확정 국경으로 표시하지 않는다. 한반도 3D 범위 밖 부분은 생략되고 2D 전체 경계와 근거는 남는다. 시대별 역로·사건 지형은 이 자료에 포함되지 않는다.

조사 단서는 Claude Opus 5 / Max 세션 `9325d200-c8c8-4f41-a3cb-5ab5e0300440`에서 얻었다. 이 호출은 구독 한도로 실패했고 완료된 조사 결과 파일도 없다. 원 실행 기록의 실패 상태를 보존했다. Codex가 공개 ZIP·라이선스·원 좌표 선언을 직접 확인하고 변환했다.

## 검증

`scripts/import_cliopatria.py`를 두 번 실행해 출력이 같은 것을 확인했다. 전체 Claim 9,401개의 인용·digest 검사와 TTL 빌드 244,458 트리플, Python 106개·JavaScript 13개 검사가 통과했다. 전체 검사 수에는 이 기능 외의 추가 자료와 지리 규칙도 포함된다.

[로컬 실행 기록](cliopatria-79-local.json)은 실제 서버와 c2의 헤드리스 Chromium을 SSH 역방향 연결로 검사했다. 국가 경계 94개·이름 17개·500년 4개, 기간 끝과 기원전 값, 사료 전체 해제·AI 제외, 원 필드와 도형 해시, Canvas 선 그리기·Three.js 실제 도형, 도 26개/군 등 560개와의 전환, 480px 근거 패널을 확인했다. 화면 오류는 0이다. 지도와 모바일 캡처도 직접 열어 확인했다. 운영 c2 배포 확인은 별도 기록한다.

```powershell
$env:PYTHONPATH="$env:TEMP/sigong-geo-lib"
python -X utf8 scripts/import_cliopatria.py --zip "$env:TEMP/sigong-clio-57/cliopatria.geojson.zip" --research "$env:TEMP/sigong-goal-opus5/korean-routes-borders-57" --out docs/research/cliopatria-79.json
```

원 ZIP SHA256: `a6417c73f16049ff7a21c75dce52dde641b659255e22ed30294b47a35b664123`.
표시 gzip SHA256: `d2446d9194b0d4d022d25879a5522a392bc1670ba3350b7cbd113c13b037792c` (27,362 bytes).
