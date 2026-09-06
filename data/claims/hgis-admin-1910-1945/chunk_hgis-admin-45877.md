---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-45877"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-45877-boundary",
    "subject": "place-hgis-admin-45877",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-45877"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-45877",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19310401\",\n  \"begin_sour\": \"朝鮮總督府京畿道令第7號(1931-04-01)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 1228,\n  \"fullname\": \"경기도/용인군/구성면\",\n  \"fullname_c\": \"京畿道/龍仁郡/駒城面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 45877,\n  \"key\": \"2/21/783\",\n  \"lv\": 3,\n  \"name\": \"구성면\",\n  \"name_cn\": \"駒城面\",\n  \"reference\": \"읍삼면이 구성면으로 개칭\",\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"2/21\",\n  \"work_date\": \"20210820\",\n  \"worker\": \"2021국편GIS담당\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1931,
    "validTo": 1945,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
