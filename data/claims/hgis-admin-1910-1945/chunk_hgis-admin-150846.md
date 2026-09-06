---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-150846"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-150846-boundary",
    "subject": "place-hgis-admin-150846",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-150846"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-150846",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19380701\",\n  \"begin_sour\": \"慶尙南道令第14號(1938-06-01)\",\n  \"end\": \"19390930\",\n  \"end_source\": \"朝鮮總督府令第168號(1939-09-30)\",\n  \"fid\": 2098,\n  \"fullname\": \"경상남도/진주군/명석면\",\n  \"fullname_c\": \"慶尙南道/晉州郡/鳴石面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 150846,\n  \"key\": \"3/596/7753\",\n  \"lv\": 3,\n  \"name\": \"명석면\",\n  \"name_cn\": \"鳴石面\",\n  \"reference\": null,\n  \"trust\": 3,\n  \"type\": \"面\",\n  \"up_key\": \"3/596\",\n  \"work_date\": \"20220907\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1938,
    "validTo": 1939,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
