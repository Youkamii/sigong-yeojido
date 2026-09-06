---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-156748"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-156748-boundary",
    "subject": "place-hgis-admin-156748",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-156748"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-156748",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19111106\",\n  \"end_source\": \"慶尙北道令第9號(1911-11-07);慶尙北道告示第33號(1911-11-07)\",\n  \"fid\": 3251,\n  \"fullname\": \"경상북도/청도군/각북면\",\n  \"fullname_c\": \"慶尙北道/淸道郡/角北面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 156748,\n  \"key\": \"4/117/1207\",\n  \"lv\": 3,\n  \"name\": \"각북면\",\n  \"name_cn\": \"角北面\",\n  \"reference\": \"11년 11월 7일 상북면 美大洞을 각북면 명대동으로 편입\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"4/117\",\n  \"work_date\": \"20220926\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
