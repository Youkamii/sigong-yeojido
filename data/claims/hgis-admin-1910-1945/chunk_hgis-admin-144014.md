---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-144014"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-144014-boundary",
    "subject": "place-hgis-admin-144014",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-144014"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-144014",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19180401\",\n  \"begin_sour\": \"朝鮮總督府及所屬官署職員錄 1919년판(한국사데이터베이스,jw_1919_1682_0140) 참고\",\n  \"end\": \"19370630\",\n  \"end_source\": \"朝鮮總督府令第80號(1937-06-28)\",\n  \"fid\": 1516,\n  \"fullname\": \"경상남도/거창군/거창면\",\n  \"fullname_c\": \"慶尙南道/居昌郡/居昌面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 144014,\n  \"key\": \"3/112/7398\",\n  \"lv\": 3,\n  \"name\": \"거창면\",\n  \"name_cn\": \"居昌面\",\n  \"reference\": \"읍내면의 거창면 변경 관련 관보 부재. 19년도 직원록에 거창면장이라 표기되므로 18년 특정 시점으로 추정됨. 편의상 18년 4월 1일로 취급.\",\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"3/112\",\n  \"work_date\": \"20220907\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1918,
    "validTo": 1937,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
