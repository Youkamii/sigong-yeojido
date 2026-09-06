---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-45897"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-45897-boundary",
    "subject": "place-hgis-admin-45897",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-45897"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-45897",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19310401\",\n  \"begin_sour\": \"朝鮮總督府京畿道令第7號(1931-04-01)\",\n  \"end\": \"19380930\",\n  \"end_source\": \"朝鮮總督府令第197號(1938-09-27)\",\n  \"fid\": 1289,\n  \"fullname\": \"경기도/이천군/이천면\",\n  \"fullname_c\": \"京畿道/利川郡/利川面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 45897,\n  \"key\": \"2/22/4034\",\n  \"lv\": 3,\n  \"name\": \"이천면\",\n  \"name_cn\": \"利川面\",\n  \"reference\": \"38년 10월 1일 이천면이 이천읍으로 변경\",\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"2/22\",\n  \"work_date\": \"20210820\",\n  \"worker\": \"2021국편GIS담당\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1931,
    "validTo": 1938,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
