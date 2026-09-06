---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-140520"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-140520-boundary",
    "subject": "place-hgis-admin-140520",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-140520"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-140520",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19410401\",\n  \"begin_sour\": \"朝鮮總督府令第84號(1941-03-26)\",\n  \"end\": \"19430930\",\n  \"end_source\": \"朝鮮總督府令第296號(1943-09-29);平安北道令第23號(1943-09-29)\",\n  \"fid\": 7014,\n  \"fullname\": \"평안북도/용천군/양광면\",\n  \"fullname_c\": \"平安北道/龍川郡/楊光面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 140520,\n  \"key\": \"10/563/7086\",\n  \"lv\": 3,\n  \"name\": \"양광면\",\n  \"name_cn\": \"楊光面\",\n  \"reference\": null,\n  \"trust\": 4,\n  \"type\": \"面\",\n  \"up_key\": \"10/563\",\n  \"work_date\": \"20220802\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1941,
    "validTo": 1943,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
