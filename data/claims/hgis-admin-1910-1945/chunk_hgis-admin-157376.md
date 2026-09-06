---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-157376"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-157376-boundary",
    "subject": "place-hgis-admin-157376",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-157376"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-157376",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19150501\",\n  \"begin_sour\": \"朝鮮總督府令第44號(1915-05-01)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 3138,\n  \"fullname\": \"경상북도/울릉도\",\n  \"fullname_c\": \"慶尙北道/鬱陵島\",\n  \"geom_ref\": \"기호\",\n  \"id\": 157376,\n  \"key\": \"4/615\",\n  \"lv\": 2,\n  \"name\": \"울릉도\",\n  \"name_cn\": \"鬱陵島\",\n  \"reference\": null,\n  \"trust\": 1,\n  \"type\": \"島\",\n  \"up_key\": \"4\",\n  \"work_date\": \"20220926\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1915,
    "validTo": 1945,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
