---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-56227"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-56227-boundary",
    "subject": "place-hgis-admin-56227",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-56227"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-56227",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19370401\",\n  \"begin_sour\": \"朝鮮總督府令第24號(1937-03-29);朝鮮總督府忠淸北道告示第19號(1937-04-01)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 6038,\n  \"fullname\": \"충청북도/청주군/청주읍\",\n  \"fullname_c\": \"忠淸北道/淸州郡/淸州邑\",\n  \"geom_ref\": \"기호\",\n  \"id\": 56227,\n  \"key\": \"8/239/2321\",\n  \"lv\": 3,\n  \"name\": \"청주읍\",\n  \"name_cn\": \"淸州邑\",\n  \"reference\": null,\n  \"trust\": 4,\n  \"type\": \"邑\",\n  \"up_key\": \"8/239\",\n  \"work_date\": \"20210924\",\n  \"worker\": \"2021국편GIS담당\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1937,
    "validTo": 1945,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
