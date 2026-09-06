---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-45430"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-45430-boundary",
    "subject": "place-hgis-admin-45430",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-45430"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-45430",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19430610\",\n  \"begin_sour\": \"朝鮮總督府令第163號(1943-06-09)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 704,\n  \"fullname\": \"경기도/경성부/중구\",\n  \"fullname_c\": \"京畿道/京城府/中區\",\n  \"geom_ref\": \"추정\",\n  \"id\": 45430,\n  \"key\": \"2/10/4021\",\n  \"lv\": 3,\n  \"name\": \"중구\",\n  \"name_cn\": \"中區\",\n  \"reference\": null,\n  \"trust\": 3,\n  \"type\": \"區\",\n  \"up_key\": \"2/10\",\n  \"work_date\": \"20210820\",\n  \"worker\": \"2021국편GIS담당\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1943,
    "validTo": 1945,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
