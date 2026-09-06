---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-143116"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-143116-boundary",
    "subject": "place-hgis-admin-143116",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-143116"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-143116",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19391001\",\n  \"begin_sour\": \"朝鮮總督府令第168號(1939-09-30)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 2148,\n  \"fullname\": \"경상남도/진주부\",\n  \"fullname_c\": \"慶尙南道/晉州府\",\n  \"geom_ref\": \"기호\",\n  \"id\": 143116,\n  \"key\": \"3/597\",\n  \"lv\": 2,\n  \"name\": \"진주부\",\n  \"name_cn\": \"晉州府\",\n  \"reference\": null,\n  \"trust\": 3,\n  \"type\": \"府\",\n  \"up_key\": \"3\",\n  \"work_date\": \"20220907\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
