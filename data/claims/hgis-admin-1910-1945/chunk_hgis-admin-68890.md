---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-68890"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-68890-boundary",
    "subject": "place-hgis-admin-68890",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-68890"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-68890",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19391001\",\n  \"begin_sour\": \"朝鮮總督府令第169號(1939-09-30)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 8933,\n  \"fullname\": \"황해도/황주군/황주읍\",\n  \"fullname_c\": \"黃海道/黃州郡/黃州邑\",\n  \"geom_ref\": \"기호\",\n  \"id\": 68890,\n  \"key\": \"14/457/4928\",\n  \"lv\": 3,\n  \"name\": \"황주읍\",\n  \"name_cn\": \"黃州邑\",\n  \"reference\": null,\n  \"trust\": 1,\n  \"type\": \"邑\",\n  \"up_key\": \"14/457\",\n  \"work_date\": \"20211007\",\n  \"worker\": \"2021국편GIS담당\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1939,
    "validTo": 1945,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
