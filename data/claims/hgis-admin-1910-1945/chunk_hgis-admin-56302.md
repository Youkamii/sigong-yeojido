---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-56302"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-56302-boundary",
    "subject": "place-hgis-admin-56302",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-56302"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-56302",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府黃海道告示第24號(1913-10-29);朝鮮總督府令第111號(1913-12-29);朝鮮總督府黃海道令第2號(1914-03-23);朝鮮總督府黃海道告示第23號(1916-06-17)\",\n  \"fid\": 8241,\n  \"fullname\": \"황해도/배천군\",\n  \"fullname_c\": \"黃海道/白川郡\",\n  \"geom_ref\": \"추정\",\n  \"id\": 56302,\n  \"key\": \"14/441\",\n  \"lv\": 2,\n  \"name\": \"배천군\",\n  \"name_cn\": \"白川郡\",\n  \"reference\": \"배천군은 13년 10월 29일(고시 24호) 군내 동리 전체 통폐합 후 14년 대개편으로 연백군으로 통합되면서 16년 7월 1일 다시 동리 전체 변경이 있었다. 대개편 직전 즉 14년 2월 28일 기준 동리는 13년 �\",\n  \"trust\": 2,\n  \"type\": \"郡\",\n  \"up_key\": \"14\",\n  \"work_date\": \"20210830\",\n  \"worker\": \"2021국편GIS사업팀\"\n}",
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
