---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-95174"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-95174-boundary",
    "subject": "place-hgis-admin-95174",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-95174"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-95174",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19111231\",\n  \"end_source\": \"地方行政區域名稱一覽(1912)\",\n  \"fid\": 4988,\n  \"fullname\": \"전라북도/진안군/하도면\",\n  \"fullname_c\": \"全羅北道/鎭安郡/下道面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 95174,\n  \"key\": \"6/169/6397\",\n  \"lv\": 3,\n  \"name\": \"하도면\",\n  \"name_cn\": \"下道面\",\n  \"reference\": \"진안군 하도면은 민적통계표에서만 확인됨\",\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"6/169\",\n  \"work_date\": \"20220726\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1910,
    "validTo": 1911,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
