---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-81067"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-81067-boundary",
    "subject": "place-hgis-admin-81067",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-81067"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-81067",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19400401\",\n  \"begin_sour\": \"朝鮮總督府令第40號(1940-03-28);朝鮮總督府令第41號(1940-03-28);咸鏡北道告示第43號(1940-03-30)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 7874,\n  \"fullname\": \"함경북도/경성군/경성면\",\n  \"fullname_c\": \"咸鏡北道/鏡城郡/鏡城面\",\n  \"geom_ref\": \"취락\",\n  \"id\": 81067,\n  \"key\": \"13/485/5324\",\n  \"lv\": 3,\n  \"name\": \"경성면\",\n  \"name_cn\": \"鏡城面\",\n  \"reference\": null,\n  \"trust\": 4,\n  \"type\": \"面\",\n  \"up_key\": \"13/485\",\n  \"work_date\": \"20220627\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1940,
    "validTo": 1945,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
