---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-104097"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-104097-boundary",
    "subject": "place-hgis-admin-104097",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-104097"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-104097",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19310401\",\n  \"begin_sour\": \"朝鮮總督府令第103號(1930-12-29)\",\n  \"end\": \"19350930\",\n  \"end_source\": \"朝鮮總督府令第112號(1935-09-28);全羅北道令第34號(1935-10-01)\",\n  \"fid\": 4905,\n  \"fullname\": \"전라북도/전주군/전주읍\",\n  \"fullname_c\": \"全羅北道/全州郡/全州邑\",\n  \"geom_ref\": \"기호\",\n  \"id\": 104097,\n  \"key\": \"6/536/6356\",\n  \"lv\": 3,\n  \"name\": \"전주읍\",\n  \"name_cn\": \"全州邑\",\n  \"reference\": \"19310401에 全州面을 全州邑으로 승격함. 19351001에 全州邑을 全州府로 독립 승격함\",\n  \"trust\": 1,\n  \"type\": \"邑\",\n  \"up_key\": \"6/536\",\n  \"work_date\": \"20220726\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1931,
    "validTo": 1935,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
