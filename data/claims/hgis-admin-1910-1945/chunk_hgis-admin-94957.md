---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-94957"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-94957-boundary",
    "subject": "place-hgis-admin-94957",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-94957"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-94957",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19100930\",\n  \"end_source\": \"朝鮮總督府令第7號(1910-10-01)\",\n  \"fid\": 4697,\n  \"fullname\": \"전라북도/옥구부/풍면\",\n  \"fullname_c\": \"全羅北道/沃溝府/風面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 94957,\n  \"key\": \"6/534/6264\",\n  \"lv\": 3,\n  \"name\": \"풍면\",\n  \"name_cn\": \"風面\",\n  \"reference\": \"19101001에 沃溝府에서 群山府로 개칭함\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"6/534\",\n  \"work_date\": \"20220726\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1910,
    "validTo": 1910,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
