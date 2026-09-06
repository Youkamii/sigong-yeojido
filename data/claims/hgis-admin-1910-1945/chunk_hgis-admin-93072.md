---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-93072"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-93072-boundary",
    "subject": "place-hgis-admin-93072",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-93072"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-93072",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19450401\",\n  \"begin_sour\": \"朝鮮總督府令第40號(1945-03-31)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 6659,\n  \"fullname\": \"평안남도/진남포부\",\n  \"fullname_c\": \"平安南道/鎭南浦府\",\n  \"geom_ref\": \"기호\",\n  \"id\": 93072,\n  \"key\": \"9/517\",\n  \"lv\": 2,\n  \"name\": \"진남포부\",\n  \"name_cn\": \"鎭南浦府\",\n  \"reference\": null,\n  \"trust\": 4,\n  \"type\": \"府\",\n  \"up_key\": \"9\",\n  \"work_date\": \"20220627\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1945,
    "validTo": 1945,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
