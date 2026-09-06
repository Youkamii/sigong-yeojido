---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-136393"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-136393-boundary",
    "subject": "place-hgis-admin-136393",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-136393"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-136393",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19400401\",\n  \"begin_sour\": \"朝鮮總督府令第40號(1940-03-28)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 6894,\n  \"fullname\": \"평안북도/벽동군/송서면\",\n  \"fullname_c\": \"平安北道/碧潼郡/松西面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 136393,\n  \"key\": \"10/566/7144\",\n  \"lv\": 3,\n  \"name\": \"송서면\",\n  \"name_cn\": \"松西面\",\n  \"reference\": \"鮮總督府令第40號(1940-03-28)에 따라 昌城郡 昌州面의 連壽洞, 昌坪洞, 西城洞, 新洞가 碧潼郡에 편입됨, 지도상의 위치로 보아 松西面에 편입된 것으로 추정함\",\n  \"trust\": 4,\n  \"type\": \"面\",\n  \"up_key\": \"10/566\",\n  \"work_date\": \"20220802\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
