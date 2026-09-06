---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-68672"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-68672-boundary",
    "subject": "place-hgis-admin-68672",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-68672"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-68672",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19380701\",\n  \"begin_sour\": \"朝鮮總督府令第115號(1938-06-01);朝鮮總督府黃海道令第14號(1938-06-04)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 8461,\n  \"fullname\": \"황해도/수안군/천곡면\",\n  \"fullname_c\": \"黃海道/遂安郡/泉谷面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 68672,\n  \"key\": \"14/445/4526\",\n  \"lv\": 3,\n  \"name\": \"천곡면\",\n  \"name_cn\": \"泉谷面\",\n  \"reference\": null,\n  \"trust\": 4,\n  \"type\": \"面\",\n  \"up_key\": \"14/445\",\n  \"work_date\": \"20210830\",\n  \"worker\": \"2021국편GIS사업팀\"\n}",
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
