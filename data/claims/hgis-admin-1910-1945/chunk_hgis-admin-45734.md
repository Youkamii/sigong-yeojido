---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-45734"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-45734-boundary",
    "subject": "place-hgis-admin-45734",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-45734"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-45734",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19380401\",\n  \"begin_sour\": \"朝鮮總督府令第36號(1938-03-30);朝鮮總督府京畿道令第8號(1938-03-30)\",\n  \"end\": \"19410930\",\n  \"end_source\": \"朝鮮總督府京畿道令第26號(1941-09-29)\",\n  \"fid\": 677,\n  \"fullname\": \"경기도/개풍군/중서면\",\n  \"fullname_c\": \"京畿道/開豊郡/中西面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 45734,\n  \"key\": \"2/401/4016\",\n  \"lv\": 3,\n  \"name\": \"중서면\",\n  \"name_cn\": \"中西面\",\n  \"reference\": \"토성면으로 개칭\",\n  \"trust\": 4,\n  \"type\": \"面\",\n  \"up_key\": \"2/401\",\n  \"work_date\": \"20210820\",\n  \"worker\": \"2021국편GIS담당\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1938,
    "validTo": 1941,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
