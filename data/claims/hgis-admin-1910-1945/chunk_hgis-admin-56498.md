---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-56498"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-56498-boundary",
    "subject": "place-hgis-admin-56498",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-56498"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-56498",
    "quote": "{\n  \"alias\": \"楚臥坊\",\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19111231\",\n  \"end_source\": \"地方行政區域名稱一覽(1912)\",\n  \"fid\": 8335,\n  \"fullname\": \"황해도/봉산군/초구방\",\n  \"fullname_c\": \"黃海道/鳳山郡/楚邱坊\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 56498,\n  \"key\": \"14/442/4434\",\n  \"lv\": 3,\n  \"name\": \"초구방\",\n  \"name_cn\": \"楚邱坊\",\n  \"reference\": \"1910자료에는 坊으로 나오고, 1912 자료부터는 面으로 나오기 때문에 별도 레코드 부여\",\n  \"trust\": 2,\n  \"type\": \"坊\",\n  \"up_key\": \"14/442\",\n  \"work_date\": \"20210830\",\n  \"worker\": \"2021국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1910,
    "validTo": 1911,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
