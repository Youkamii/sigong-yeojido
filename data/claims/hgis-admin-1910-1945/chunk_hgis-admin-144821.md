---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-144821"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-144821-boundary",
    "subject": "place-hgis-admin-144821",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-144821"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-144821",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19330101\",\n  \"begin_sour\": \"慶尙南道令第17號(1932-10-31)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 2292,\n  \"fullname\": \"경상남도/하동군/진교면\",\n  \"fullname_c\": \"慶尙南道/河東郡/辰橋面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 144821,\n  \"key\": \"3/92/1002\",\n  \"lv\": 3,\n  \"name\": \"진교면\",\n  \"name_cn\": \"辰橋面\",\n  \"reference\": null,\n  \"trust\": 3,\n  \"type\": \"面\",\n  \"up_key\": \"3/92\",\n  \"work_date\": \"20220907\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1933,
    "validTo": 1945,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
