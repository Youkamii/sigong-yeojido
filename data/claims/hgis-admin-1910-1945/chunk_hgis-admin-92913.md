---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-92913"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-92913-boundary",
    "subject": "place-hgis-admin-92913",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-92913"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-92913",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19290401\",\n  \"begin_sour\": \"平安南道令第7號(1929-03-25)\",\n  \"end\": \"19410930\",\n  \"end_source\": \"朝鮮總督府令第253號(1941-09-29)\",\n  \"fid\": 6496,\n  \"fullname\": \"평안남도/양덕군/양덕면\",\n  \"fullname_c\": \"平安南道/陽德郡/陽德面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 92913,\n  \"key\": \"9/513/5833\",\n  \"lv\": 3,\n  \"name\": \"양덕면\",\n  \"name_cn\": \"陽德面\",\n  \"reference\": null,\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"9/513\",\n  \"work_date\": \"20220627\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1929,
    "validTo": 1941,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
