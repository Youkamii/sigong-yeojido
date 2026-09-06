---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-92770"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-92770-boundary",
    "subject": "place-hgis-admin-92770",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-92770"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-92770",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19171001\",\n  \"begin_sour\": \"平安南道令第3號(1917-08-21)\",\n  \"end\": \"19350228\",\n  \"end_source\": \"朝鮮總督府令第6號(1935-01-26);平安南道令第2號(1935-02-07)\",\n  \"fid\": 6243,\n  \"fullname\": \"평안남도/덕천군/덕천면\",\n  \"fullname_c\": \"平安南道/德川郡/德川面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 92770,\n  \"key\": \"9/503/5599\",\n  \"lv\": 3,\n  \"name\": \"덕천면\",\n  \"name_cn\": \"德川面\",\n  \"reference\": null,\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"9/503\",\n  \"work_date\": \"20220627\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1917,
    "validTo": 1935,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
