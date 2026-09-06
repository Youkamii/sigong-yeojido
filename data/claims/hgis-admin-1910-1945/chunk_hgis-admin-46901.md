---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-46901"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-46901-boundary",
    "subject": "place-hgis-admin-46901",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-46901"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-46901",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19391001\",\n  \"begin_sour\": \"朝鮮總督府令第169號(1939-10-01)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 406,\n  \"fullname\": \"강원도/춘천군/춘천읍\",\n  \"fullname_c\": \"江原道/春川郡/春川邑\",\n  \"geom_ref\": \"기호\",\n  \"id\": 46901,\n  \"key\": \"1/3/4276\",\n  \"lv\": 3,\n  \"name\": \"춘천읍\",\n  \"name_cn\": \"春川邑\",\n  \"reference\": null,\n  \"trust\": 3,\n  \"type\": \"邑\",\n  \"up_key\": \"1/3\",\n  \"work_date\": \"20210830\",\n  \"worker\": \"2021국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1939,
    "validTo": 1945,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
