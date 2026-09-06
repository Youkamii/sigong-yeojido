---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-64900"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-64900-boundary",
    "subject": "place-hgis-admin-64900",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-64900"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-64900",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19190401\",\n  \"begin_sour\": \"朝鮮總督府黃海道令第4號(1919-03-29)\",\n  \"end\": \"19310331\",\n  \"end_source\": \"朝鮮總督府令第103號(1930-12-29)\",\n  \"fid\": 8893,\n  \"fullname\": \"황해도/황주군/겸이포면\",\n  \"fullname_c\": \"黃海道/黃州郡/兼二浦面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 64900,\n  \"key\": \"14/457/4867\",\n  \"lv\": 3,\n  \"name\": \"겸이포면\",\n  \"name_cn\": \"兼二浦面\",\n  \"reference\": null,\n  \"trust\": 4,\n  \"type\": \"面\",\n  \"up_key\": \"14/457\",\n  \"work_date\": \"20210830\",\n  \"worker\": \"2021국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1919,
    "validTo": 1931,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
