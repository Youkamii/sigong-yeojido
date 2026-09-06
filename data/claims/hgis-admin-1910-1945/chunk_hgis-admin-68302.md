---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-68302"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-68302-boundary",
    "subject": "place-hgis-admin-68302",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-68302"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-68302",
    "quote": "{\n  \"alias\": \"江北面;北一面\",\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府黃海道令第2號(1914-03-23);正誤(1914-04-04, 3月24日朝鮮總督府黃海道令第2號 正誤);朝鮮總督府黃海道告示第11號(1914-03-30);正誤(1914-04-08, 3月24日朝鮮總督府黃海道令第2號 正誤);正誤(1914-04\",\n  \"fid\": 8220,\n  \"fullname\": \"황해도/금천군/북면\",\n  \"fullname_c\": \"黃海道/金川郡/北面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 68302,\n  \"key\": \"14/60/4368\",\n  \"lv\": 3,\n  \"name\": \"북면\",\n  \"name_cn\": \"北面\",\n  \"reference\": \"1910자료는 江北面으로 되어 있으나 1912자료의 北一面, 1914자료의 北面과 동일한 것으로 판단하고 1914 기준으로 면 명칭 변경\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"14/60\",\n  \"work_date\": \"20210830\",\n  \"worker\": \"2021국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1910,
    "validTo": 1914,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
