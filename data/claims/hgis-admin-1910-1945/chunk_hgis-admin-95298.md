---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-95298"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-95298-boundary",
    "subject": "place-hgis-admin-95298",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-95298"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-95298",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19321001\",\n  \"begin_sour\": \"朝鮮總督府令第92號(1932-09-24);全羅北道告示第180號(1932-09-29)\",\n  \"end\": \"19401031\",\n  \"end_source\": \"朝鮮總督府令第220號(1940-10-23)\",\n  \"fid\": 4386,\n  \"fullname\": \"전라북도/군산부\",\n  \"fullname_c\": \"全羅北道/群山府\",\n  \"geom_ref\": \"기호\",\n  \"id\": 95298,\n  \"key\": \"6/523\",\n  \"lv\": 2,\n  \"name\": \"군산부\",\n  \"name_cn\": \"群山府\",\n  \"reference\": \"19321001에 群山府 내 동리 구역을 대개편함. 19401101에 沃溝郡 米面과 開井面 일부 동리를 편입함\",\n  \"trust\": 4,\n  \"type\": \"府\",\n  \"up_key\": \"6\",\n  \"work_date\": \"20220726\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1932,
    "validTo": 1940,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
