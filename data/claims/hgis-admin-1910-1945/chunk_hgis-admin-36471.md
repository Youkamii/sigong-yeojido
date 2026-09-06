---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-36471"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-36471-boundary",
    "subject": "place-hgis-admin-36471",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-36471"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-36471",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19401101\",\n  \"begin_sour\": \"朝鮮總督府令第220號(1940-11-01)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 5160,\n  \"fullname\": \"충청남도/대덕군\",\n  \"fullname_c\": \"忠淸南道/大德郡\",\n  \"geom_ref\": \"추정\",\n  \"id\": 36471,\n  \"key\": \"7/197\",\n  \"lv\": 2,\n  \"name\": \"대덕군\",\n  \"name_cn\": \"大德郡\",\n  \"reference\": \"40년 11월 1일 대전부역 확장\",\n  \"trust\": 4,\n  \"type\": \"郡\",\n  \"up_key\": \"7\",\n  \"work_date\": \"20210830\",\n  \"worker\": \"2021국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1940,
    "validTo": 1945,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
