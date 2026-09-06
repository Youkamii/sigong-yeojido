---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-157465"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-157465-boundary",
    "subject": "place-hgis-admin-157465",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-157465"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-157465",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19170401\",\n  \"begin_sour\": \"朝鮮總督府令第9號(1917-02-15)\",\n  \"end\": \"19380930\",\n  \"end_source\": \"朝鮮總督府令第196號(1938-09-27);慶尙北道令第36號(1938-09-27)\",\n  \"fid\": 2588,\n  \"fullname\": \"경상북도/달성군/수성면\",\n  \"fullname_c\": \"慶尙北道/達城郡/壽城面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 157465,\n  \"key\": \"4/136/8056\",\n  \"lv\": 3,\n  \"name\": \"수성면\",\n  \"name_cn\": \"壽城面\",\n  \"reference\": null,\n  \"trust\": 4,\n  \"type\": \"面\",\n  \"up_key\": \"4/136\",\n  \"work_date\": \"20220926\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1917,
    "validTo": 1938,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
