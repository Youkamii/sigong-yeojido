---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-56460"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-56460-boundary",
    "subject": "place-hgis-admin-56460",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-provinces-1910-1945.geojson#hgis-admin-56460"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-56460",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);朝鮮總督府令第113號(1914-07-13);朝鮮總督府令第87號(1915-08-18)\",\n  \"fid\": 8173,\n  \"fullname\": \"황해도\",\n  \"fullname_c\": \"黃海道\",\n  \"geom_ref\": \"추정\",\n  \"id\": 56460,\n  \"key\": \"14\",\n  \"lv\": 1,\n  \"name\": \"황해도\",\n  \"name_cn\": \"黃海道\",\n  \"reference\": \"전국 도와 부군의 명칭, 관할구역을 정한 부령 111호(1913-12-29)가 14년 3월 1일 시행되면서 황해도와 관할 부군의 명칭, 구역이 새로이 정해졌다.  14년 4월 1일 황해도 내  각 면의 명칭, 구역이 정��\",\n  \"trust\": 2,\n  \"type\": \"道\",\n  \"up_key\": null,\n  \"work_date\": \"20210830\",\n  \"worker\": \"2021국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1910,
    "validTo": 1914,
    "generatedBy": "codex",
    "generatedAt": "2026-09-06",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
