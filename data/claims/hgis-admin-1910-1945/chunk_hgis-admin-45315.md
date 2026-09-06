---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-45315"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-45315-boundary",
    "subject": "place-hgis-admin-45315",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-45315"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-45315",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19360401\",\n  \"begin_sour\": \"朝鮮總督府令第8號(1936-02-14);朝鮮總督府京畿道吿示第32號(1936-03-23)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 709,\n  \"fullname\": \"경기도/고양군\",\n  \"fullname_c\": \"京畿道/高陽郡\",\n  \"geom_ref\": \"추정\",\n  \"id\": 45315,\n  \"key\": \"2/11\",\n  \"lv\": 2,\n  \"name\": \"고양군\",\n  \"name_cn\": \"高陽郡\",\n  \"reference\": \"1936년 4월 1일 경성부역 확장으로 고양군 개편\",\n  \"trust\": 4,\n  \"type\": \"郡\",\n  \"up_key\": \"2\",\n  \"work_date\": \"20210820\",\n  \"worker\": \"2021국편GIS담당\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1936,
    "validTo": 1945,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
