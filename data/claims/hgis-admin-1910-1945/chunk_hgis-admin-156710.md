---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-156710"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-156710-boundary",
    "subject": "place-hgis-admin-156710",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-156710"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-156710",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19111106\",\n  \"end_source\": \"慶尙北道令第9號(1911-11-07);慶尙北道告示第33號(1911-11-07)\",\n  \"fid\": 3257,\n  \"fullname\": \"경상북도/청도군/내서면\",\n  \"fullname_c\": \"慶尙北道/淸道郡/內西面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 156710,\n  \"key\": \"4/117/8434\",\n  \"lv\": 3,\n  \"name\": \"내서면\",\n  \"name_cn\": \"內西面\",\n  \"reference\": \"내서면 耳谷洞을 초동면에 편입;초동면 麻谷洞 및 坪里洞을 내서면에 편입\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"4/117\",\n  \"work_date\": \"20220926\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
