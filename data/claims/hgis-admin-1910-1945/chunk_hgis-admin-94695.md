---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-94695"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-94695-boundary",
    "subject": "place-hgis-admin-94695",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-94695"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-94695",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19401101\",\n  \"begin_sour\": \"朝鮮總督府令第221號(1940-10-23)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 4415,\n  \"fullname\": \"전라북도/금산군/금산읍\",\n  \"fullname_c\": \"全羅北道/錦山郡/錦山邑\",\n  \"geom_ref\": \"기호\",\n  \"id\": 94695,\n  \"key\": \"6/524/6040\",\n  \"lv\": 3,\n  \"name\": \"금산읍\",\n  \"name_cn\": \"錦山邑\",\n  \"reference\": \"19401101에 錦山面에서 錦山邑으로 승격함\",\n  \"trust\": 1,\n  \"type\": \"邑\",\n  \"up_key\": \"6/524\",\n  \"work_date\": \"20220726\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1940,
    "validTo": 1945,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
