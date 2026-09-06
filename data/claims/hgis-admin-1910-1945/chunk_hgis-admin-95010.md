---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-95010"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-95010-boundary",
    "subject": "place-hgis-admin-95010",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-95010"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-95010",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19310401\",\n  \"begin_sour\": \"朝鮮總督府令第103號(1930-12-29)\",\n  \"end\": \"19311031\",\n  \"end_source\": \"朝鮮總督府令第132號(1931-10-20)\",\n  \"fid\": 4776,\n  \"fullname\": \"전라북도/익산군/익산읍\",\n  \"fullname_c\": \"全羅北道/益山郡/益山邑\",\n  \"geom_ref\": \"기호\",\n  \"id\": 95010,\n  \"key\": \"6/174/6293\",\n  \"lv\": 3,\n  \"name\": \"익산읍\",\n  \"name_cn\": \"益山邑\",\n  \"reference\": \"19310401에 益山面을 益山邑으로 승격함. 19311101에 益山邑을 裡里邑으로 개칭함\",\n  \"trust\": 1,\n  \"type\": \"邑\",\n  \"up_key\": \"6/174\",\n  \"work_date\": \"20220726\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1931,
    "validTo": 1931,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
