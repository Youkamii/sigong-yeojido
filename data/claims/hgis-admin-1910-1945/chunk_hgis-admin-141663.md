---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-141663"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-141663-boundary",
    "subject": "place-hgis-admin-141663",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-141663"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-141663",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19440510\",\n  \"begin_sour\": \"朝鮮總督府令第198號(1944-05-10);朝鮮總督府令第199號(1944-05-10)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 7151,\n  \"fullname\": \"평안북도/자성군/삼풍면\",\n  \"fullname_c\": \"平安北道/慈城郡/三豊面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 141663,\n  \"key\": \"10/574/7263\",\n  \"lv\": 3,\n  \"name\": \"삼풍면\",\n  \"name_cn\": \"三豊面\",\n  \"reference\": \"44년 5월 10일 자성 삼풍면 운봉동을 강계 만포읍으로 편입\",\n  \"trust\": 4,\n  \"type\": \"面\",\n  \"up_key\": \"10/574\",\n  \"work_date\": \"20220802\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1944,
    "validTo": 1945,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
