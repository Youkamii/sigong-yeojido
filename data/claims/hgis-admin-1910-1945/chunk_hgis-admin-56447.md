---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-56447"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-56447-boundary",
    "subject": "place-hgis-admin-56447",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-56447"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-56447",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19300101\",\n  \"begin_sour\": \"朝鮮總督府令第97號(1929-11-13);朝鮮總督府黃海道令第20號(1929-11-20);朝鮮總督府黃海道吿示第91號(1929-11-20)\",\n  \"end\": \"19380630\",\n  \"end_source\": \"朝鮮總督府令第115號(1938-06-01)\",\n  \"fid\": 8285,\n  \"fullname\": \"황해도/봉산군\",\n  \"fullname_c\": \"黃海道/鳳山郡\",\n  \"geom_ref\": \"추정\",\n  \"id\": 56447,\n  \"key\": \"14/442\",\n  \"lv\": 2,\n  \"name\": \"봉산군\",\n  \"name_cn\": \"鳳山郡\",\n  \"reference\": null,\n  \"trust\": 4,\n  \"type\": \"郡\",\n  \"up_key\": \"14\",\n  \"work_date\": \"20210830\",\n  \"worker\": \"2021국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1930,
    "validTo": 1938,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
