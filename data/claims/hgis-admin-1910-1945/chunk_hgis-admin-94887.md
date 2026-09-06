---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-94887"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-94887-boundary",
    "subject": "place-hgis-admin-94887",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-94887"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-94887",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19431001\",\n  \"begin_sour\": \"朝鮮總督府令第297號(1943-09-29)\",\n  \"end\": \"19450503\",\n  \"end_source\": \"朝鮮總督府令第99號(1945-05-04)\",\n  \"fid\": 4598,\n  \"fullname\": \"전라북도/부안군/부안읍\",\n  \"fullname_c\": \"全羅北道/扶安郡/扶安邑\",\n  \"geom_ref\": \"기호\",\n  \"id\": 94887,\n  \"key\": \"6/179/1798\",\n  \"lv\": 3,\n  \"name\": \"부안읍\",\n  \"name_cn\": \"扶安邑\",\n  \"reference\": \"19431001에 扶寧面에 扶安邑으로 승격함. 19450504에 扶安邑과 白山面이 일부 영역을 주고받음\",\n  \"trust\": 1,\n  \"type\": \"邑\",\n  \"up_key\": \"6/179\",\n  \"work_date\": \"20220726\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1943,
    "validTo": 1945,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
