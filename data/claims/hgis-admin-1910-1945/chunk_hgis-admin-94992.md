---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-94992"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-94992-boundary",
    "subject": "place-hgis-admin-94992",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-94992"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-94992",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19311101\",\n  \"begin_sour\": \"朝鮮總督府令第132號(1931-10-20)\",\n  \"end\": \"19411228\",\n  \"end_source\": \"朝鮮總督府令第341號(1941-12-29)\",\n  \"fid\": 4773,\n  \"fullname\": \"전라북도/익산군/이리읍\",\n  \"fullname_c\": \"全羅北道/益山郡/裡里邑\",\n  \"geom_ref\": \"기호\",\n  \"id\": 94992,\n  \"key\": \"6/174/6286\",\n  \"lv\": 3,\n  \"name\": \"이리읍\",\n  \"name_cn\": \"裡里邑\",\n  \"reference\": \"19311101에 益山邑을 裡里邑으로 개칭함. 19141229에 北一面 慕仁里와 裡里邑 古縣里가 일부 영역을 주고받음\",\n  \"trust\": 1,\n  \"type\": \"邑\",\n  \"up_key\": \"6/174\",\n  \"work_date\": \"20220726\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1931,
    "validTo": 1941,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
