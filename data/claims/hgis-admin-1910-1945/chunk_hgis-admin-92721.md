---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-92721"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-92721-boundary",
    "subject": "place-hgis-admin-92721",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-92721"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-92721",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19290401\",\n  \"begin_sour\": \"平安南道令第7號(1929-03-25)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 6191,\n  \"fullname\": \"평안남도/개천군/조양면\",\n  \"fullname_c\": \"平安南道/价川郡/朝陽面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 92721,\n  \"key\": \"9/500/5554\",\n  \"lv\": 3,\n  \"name\": \"조양면\",\n  \"name_cn\": \"朝陽面\",\n  \"reference\": \"19290401에 价川郡 价川面이 价川郡 朝陽面 소속으로 변경되고, 价川郡 外西面이 价川郡 价川面으로 개칭함\",\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"9/500\",\n  \"work_date\": \"20220627\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1929,
    "validTo": 1945,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
