---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-68864"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-68864-boundary",
    "subject": "place-hgis-admin-68864",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-68864"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-68864",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19381001\",\n  \"begin_sour\": \"朝鮮總督府令第196號(1938-09-27)\",\n  \"end\": \"19430930\",\n  \"end_source\": \"朝鮮總督府令第296號(1943-09-29)\",\n  \"fid\": 8888,\n  \"fullname\": \"황해도/해주부\",\n  \"fullname_c\": \"黃海道/海州府\",\n  \"geom_ref\": \"기호\",\n  \"id\": 68864,\n  \"key\": \"14/459\",\n  \"lv\": 2,\n  \"name\": \"해주부\",\n  \"name_cn\": \"海州府\",\n  \"reference\": null,\n  \"trust\": 2,\n  \"type\": \"府\",\n  \"up_key\": \"14\",\n  \"work_date\": \"20210830\",\n  \"worker\": \"2021국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1938,
    "validTo": 1943,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
