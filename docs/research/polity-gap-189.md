# 1911–1947년 국가 영역 참고 도형 (#189)

출처는 [국사편찬위원회 HGIS 1910~1945 행정구역](https://hgis.history.go.kr/pro_g1/dataset.do)이다.
기존 Source `src-hgis-admin-1910-1945`와 저장된 `data/maps/hgis-provinces-1910-1945.geojson.gz`를 재사용한다.
새 Source나 주장은 만들지 않는다. 1940년에 유효한 13개 도를 feature id 순으로 정렬하고, 기존 `claim-hgis-admin-<id>-boundary`와 `chunk_hgis-admin-<id>`를 근거로 연결한다.

`scripts/build_polity_gap_1911_1947.py`는 입력 도형을 `make_valid`로 보정한 뒤 합친다.
`buffer(0.0005)`와 `buffer(-0.0005)`로 경계 이음새를 닫고, `simplify(0.002, preserve_topology=True)`로 표시용 경계를 단순화한다.
내부 구멍과 면적 1e-5 제곱도 미만 조각을 제거한다. 단순화가 끝난 뒤 위도 38.0도 이남·이북 반평면과 교차시켜 군정 참고 도형을 만든다. 따라서 분할 경계의 위도는 정확히 38.0이다.

연 단위 화면에서 1945년은 8월 광복 이후를 기준으로 한다.
일제강점기 조선은 1911–1944년, 미군정·소련군정 참고 도형은 1945–1947년에 표시하며 양 끝 연도를 포함한다.
1910년과 1948년의 기존 Cliopatria 도형은 유지한다. 1260–1362년은 계속 자료 공백이다.

결과는 `data/maps/polity-gap-1911-1947.geojson.gz`에 저장한다.
FeatureCollection의 `generated`에 방법·기준연도·입력 id 13개를 한 번만 기록한다.
`sourceFileSha256`은 압축을 풀기 전 입력 gz 파일 바이트의 SHA256이다.
각 feature의 `derivedFrom`과 `derivedLabels`는 같은 순서이며, 대표 주장·청크는 정렬 첫 항목을 가리킨다. 2D 패널에서 13개 도의 근거를 각각 열 수 있다.

이 도형은 실제 국경·통치 범위의 복원이 아니다. 1940년 행정경계를 다른 해에도 재사용하며, 원 자료의 표시용 단순화에 추가 단순화와 구멍·작은 조각 제거가 적용된다.
38도선 분할은 위도에 따른 참고 구분으로 당시 현장의 통치·점령 범위를 확인한 결과가 아니다.

공공누리 표기 확인 필요: HGIS 제공 자료의 공공누리 유형과 출처 표시 문구는 해당 자료 페이지에서 별도로 확인해야 한다. 이 문서는 이용허락 확인을 완료했다는 뜻이 아니다.

재생성에는 Shapely 2가 설치된 Python을 사용한다. 저장소 루트에서 실행한다.

```sh
python scripts/build_polity_gap_1911_1947.py
python -O scripts/build_polity_gap_1911_1947.py
gzip -l data/maps/polity-gap-1911-1947.geojson.gz
```

두 실행이 출력한 SHA256이 같은지 확인한다. gzip에는 고정 시각(`mtime=0`)을 사용한다.
