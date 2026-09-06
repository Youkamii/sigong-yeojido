---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-137098"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-137098-boundary",
    "subject": "place-hgis-admin-137098",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-137098"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-137098",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19310319\",\n  \"begin_sour\": \"平安北道令第17號(1931-03-19)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 7318,\n  \"fullname\": \"평안북도/태천군/서성면\",\n  \"fullname_c\": \"平安北道/泰川郡/西城面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 137098,\n  \"key\": \"10/579/7361\",\n  \"lv\": 3,\n  \"name\": \"서성면\",\n  \"name_cn\": \"西城面\",\n  \"reference\": \"시행일자가 없어 작성일자인 19310319를 변동 기점으로 간주\",\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"10/579\",\n  \"work_date\": \"20220802\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1931,
    "validTo": 1945,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
