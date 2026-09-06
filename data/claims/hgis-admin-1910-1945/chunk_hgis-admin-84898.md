---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-84898"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-84898-boundary",
    "subject": "place-hgis-admin-84898",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-84898"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-84898",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19340401\",\n  \"begin_sour\": \"朝鮮總督府令第27號(1934-03-28);咸鏡北道吿示第38號(1934-03-31)\",\n  \"end\": \"19400331\",\n  \"end_source\": \"朝鮮總督府令第40號(1940-03-28);朝鮮總督府令第41號(1940-03-28);咸鏡北道告示第43號(1940-03-30)\",\n  \"fid\": 7886,\n  \"fullname\": \"함경북도/경성군/용성면\",\n  \"fullname_c\": \"咸鏡北道/鏡城郡/龍城面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 84898,\n  \"key\": \"13/485/5328\",\n  \"lv\": 3,\n  \"name\": \"용성면\",\n  \"name_cn\": \"龍城面\",\n  \"reference\": null,\n  \"trust\": 4,\n  \"type\": \"面\",\n  \"up_key\": \"13/485\",\n  \"work_date\": \"20220627\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1934,
    "validTo": 1940,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
