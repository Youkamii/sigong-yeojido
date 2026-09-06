---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-47086"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-47086-boundary",
    "subject": "place-hgis-admin-47086",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-47086"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-47086",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19190515\",\n  \"begin_sour\": \"朝鮮總督府令第88號(1919-05-15);朝鮮總督府江原道令第4號(1919-05-15)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 189,\n  \"fullname\": \"강원도/양양군/죽왕면\",\n  \"fullname_c\": \"江原道/襄陽郡/竹旺面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 47086,\n  \"key\": \"1/71/4189\",\n  \"lv\": 3,\n  \"name\": \"죽왕면\",\n  \"name_cn\": \"竹旺面\",\n  \"reference\": null,\n  \"trust\": 3,\n  \"type\": \"面\",\n  \"up_key\": \"1/71\",\n  \"work_date\": \"20210830\",\n  \"worker\": \"2021국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1919,
    "validTo": 1945,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
