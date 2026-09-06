---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-45847"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-45847-boundary",
    "subject": "place-hgis-admin-45847",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-45847"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-45847",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19340401\",\n  \"begin_sour\": \"朝鮮總督府京畿道令第4號(1934-03-10)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 1207,\n  \"fullname\": \"경기도/연천군/삭녕면\",\n  \"fullname_c\": \"京畿道/漣川郡/朔寧面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 45847,\n  \"key\": \"2/20/4033\",\n  \"lv\": 3,\n  \"name\": \"삭녕면\",\n  \"name_cn\": \"朔寧面\",\n  \"reference\": \"북면, 동면이 삭녕면으로 병합\",\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"2/20\",\n  \"work_date\": \"20210820\",\n  \"worker\": \"2021국편GIS담당\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1934,
    "validTo": 1945,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
