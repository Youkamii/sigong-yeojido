---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-69425"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-69425-boundary",
    "subject": "place-hgis-admin-69425",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-69425"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-69425",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19311101\",\n  \"begin_sour\": \"朝鮮總督府令第132號(1931-10-20)\",\n  \"end\": \"19370331\",\n  \"end_source\": \"朝鮮總督府令第24號(1937-03-29)\",\n  \"fid\": 7753,\n  \"fullname\": \"함경남도/함주군/흥남읍\",\n  \"fullname_c\": \"咸鏡南道/咸州郡/興南邑\",\n  \"geom_ref\": \"취락\",\n  \"id\": 69425,\n  \"key\": \"12/476/5201\",\n  \"lv\": 3,\n  \"name\": \"흥남읍\",\n  \"name_cn\": \"興南邑\",\n  \"reference\": null,\n  \"trust\": 1,\n  \"type\": \"邑\",\n  \"up_key\": \"12/476\",\n  \"work_date\": \"20220627\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1931,
    "validTo": 1937,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
