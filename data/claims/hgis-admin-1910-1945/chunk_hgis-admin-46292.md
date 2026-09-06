---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-46292"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-46292-boundary",
    "subject": "place-hgis-admin-46292",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-46292"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-46292",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19381001\",\n  \"begin_sour\": \"朝鮮總督府令第196號(1938-09-27)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 1446,\n  \"fullname\": \"경기도/평택군\",\n  \"fullname_c\": \"京畿道/平澤郡\",\n  \"geom_ref\": \"기호\",\n  \"id\": 46292,\n  \"key\": \"2/79\",\n  \"lv\": 2,\n  \"name\": \"평택군\",\n  \"name_cn\": \"平澤郡\",\n  \"reference\": \"38년 10월 1일 진위군이 평택군으로 개칭\",\n  \"trust\": 1,\n  \"type\": \"郡\",\n  \"up_key\": \"2\",\n  \"work_date\": \"20210820\",\n  \"worker\": \"2021국편GIS담당\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1938,
    "validTo": 1945,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
