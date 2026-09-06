---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-69324"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-69324-boundary",
    "subject": "place-hgis-admin-69324",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-69324"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-69324",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19390401\",\n  \"begin_sour\": \"朝鮮總督府令第39號(1939-03-30)\",\n  \"end\": \"19410331\",\n  \"end_source\": \"朝鮮總督府令第84號(1941-03-26);朝鮮總督府令第85號(1941-03-26);朝鮮總督府咸鏡南道令第3號(1941-05-23)\",\n  \"fid\": 7755,\n  \"fullname\": \"함경남도/함주군/흥남읍\",\n  \"fullname_c\": \"咸鏡南道/咸州郡/興南邑\",\n  \"geom_ref\": \"취락\",\n  \"id\": 69324,\n  \"key\": \"12/476/5201\",\n  \"lv\": 3,\n  \"name\": \"흥남읍\",\n  \"name_cn\": \"興南邑\",\n  \"reference\": null,\n  \"trust\": 4,\n  \"type\": \"邑\",\n  \"up_key\": \"12/476\",\n  \"work_date\": \"20220627\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1939,
    "validTo": 1941,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
