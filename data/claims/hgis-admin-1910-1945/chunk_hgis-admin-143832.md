---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-143832"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-143832-boundary",
    "subject": "place-hgis-admin-143832",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-143832"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-143832",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19120331\",\n  \"end_source\": \"朝鮮總督府令第35號(1912-03-22)\",\n  \"fid\": 1911,\n  \"fullname\": \"경상남도/양산군/외남면\",\n  \"fullname_c\": \"慶尙南道/梁山郡/外南面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 143832,\n  \"key\": \"3/103/7523\",\n  \"lv\": 3,\n  \"name\": \"외남면\",\n  \"name_cn\": \"外南面\",\n  \"reference\": \"12년 4월 1일 양산군 외남면을 울산군으로 이속\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"3/103\",\n  \"work_date\": \"20220907\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1910,
    "validTo": 1912,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
