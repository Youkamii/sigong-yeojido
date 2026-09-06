---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-68886"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-68886-boundary",
    "subject": "place-hgis-admin-68886",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-68886"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-68886",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19390401\",\n  \"begin_sour\": \"朝鮮總督府令第39號(1939-03-30)\",\n  \"end\": \"19420331\",\n  \"end_source\": \"朝鮮總督府令第104號(1942-03-31)\",\n  \"fid\": 8895,\n  \"fullname\": \"황해도/황주군/겸이포읍\",\n  \"fullname_c\": \"黃海道/黃州郡/兼二浦邑\",\n  \"geom_ref\": \"기호\",\n  \"id\": 68886,\n  \"key\": \"14/457/4868\",\n  \"lv\": 3,\n  \"name\": \"겸이포읍\",\n  \"name_cn\": \"兼二浦邑\",\n  \"reference\": \"황주군 구성면 죽대리 일부가 황주군 겸이포읍으로 편입되지만 겸이포읍의 편성 내용은 부재\",\n  \"trust\": 4,\n  \"type\": \"邑\",\n  \"up_key\": \"14/457\",\n  \"work_date\": \"20210830\",\n  \"worker\": \"2021국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1939,
    "validTo": 1942,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
