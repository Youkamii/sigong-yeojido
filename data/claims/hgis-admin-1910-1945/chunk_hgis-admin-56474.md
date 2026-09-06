---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-56474"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-56474-boundary",
    "subject": "place-hgis-admin-56474",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-56474"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-56474",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);朝鮮總督府令第113號(1914-07-13);朝鮮總督府令第87號(1915-08-18)\",\n  \"fid\": 8204,\n  \"fullname\": \"황해도/금천군\",\n  \"fullname_c\": \"黃海道/金川郡\",\n  \"geom_ref\": \"추정\",\n  \"id\": 56474,\n  \"key\": \"14/60\",\n  \"lv\": 2,\n  \"name\": \"금천군\",\n  \"name_cn\": \"金川郡\",\n  \"reference\": null,\n  \"trust\": 2,\n  \"type\": \"郡\",\n  \"up_key\": \"14\",\n  \"work_date\": \"20210830\",\n  \"worker\": \"2021국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1910,
    "validTo": 1914,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
