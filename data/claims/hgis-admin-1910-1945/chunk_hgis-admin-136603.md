---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-136603"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-136603-boundary",
    "subject": "place-hgis-admin-136603",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-136603"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-136603",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19310401\",\n  \"begin_sour\": \"朝鮮總督府令第103號(1930-12-29)\",\n  \"end\": \"19350228\",\n  \"end_source\": \"朝鮮總督府令第7號(1935-01-26)\",\n  \"fid\": 6772,\n  \"fullname\": \"평안북도/강계군/강계읍\",\n  \"fullname_c\": \"平安北道/江界郡/江界邑\",\n  \"geom_ref\": \"기호\",\n  \"id\": 136603,\n  \"key\": \"10/559/7002\",\n  \"lv\": 3,\n  \"name\": \"강계읍\",\n  \"name_cn\": \"江界邑\",\n  \"reference\": null,\n  \"trust\": 1,\n  \"type\": \"邑\",\n  \"up_key\": \"10/559\",\n  \"work_date\": \"20220802\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1931,
    "validTo": 1935,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
