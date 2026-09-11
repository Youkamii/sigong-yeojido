# 주요 강의 시각 표현 (#144)

한강·남한강·북한강·소양강·임진강·금강·낙동강·영산강·섬진강·압록강·두만강·대동강·청천강을 표시한다. 지도 표시 → 물길에서 켜고 끄거나 강을 골라 이동한다.

좌표는 OpenStreetMap의 `waterway=river` 본류에서 가져왔다. 현재 물길을 고정 지리 배경으로 쓰며, 특정 시대의 유로·강폭을 복원한 자료가 아니다. 표시 강폭은 지도에서 알아볼 수 있게 조정했다. 실제 역사 장면과 인물의 좌표·기간은 이 작업에서 바꾸지 않았다.

원본은 `data/geo/korea-rivers-osm.json.gz`, 출처 시각·해시는 `river-paths.js`의 `RIVER_SOURCE`에 있다. 좌표와 파생 물길 면 데이터는 © OpenStreetMap contributors, [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/). 지도에 [출처 링크](https://www.openstreetmap.org/copyright)를 표시한다.

재생성(기존 지도 빌더와 같은 Shapely 사용):

```text
python scripts/build_river_display.py data/geo/korea-rivers-osm.json.gz
python scripts/build_river_mesh.py
```

꺾이는 부분과 합류부는 빌드 시 면으로 합치고, 물과 강둑의 영역을 나눈다. 실행 중 선을 매 프레임 다시 계산하지 않는다. 물·강둑 각 한 번, 합계 2 draw calls이며 그림자 생성·반사 렌더링을 추가하지 않는다. 겹치는 익명 나무와 마을 배치는 제외한다.

물길 모듈·표시용 좌표·빌더는 Codex 소유 범위다. `chronicle-world.js`는 연결, `chronicle-assets.js`와 `chronicle-scenery.js`는 강 위의 익명 풍경 배치 제외만 수정했다. 역사 사료·인물·기간·API·서버 변경과 독립적으로 합칠 수 있다.

[통합 화면과 성능 측정](visual-map-145.md). 관련 코드와 증거는 `codex/visual-rivers-peninsula` 브랜치에 둔다.
