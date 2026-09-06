---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-156735"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-156735-boundary",
    "subject": "place-hgis-admin-156735",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-156735"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-156735",
    "quote": "{\n  \"alias\": \"町長面\",\n  \"begin\": \"19340401\",\n  \"begin_sour\": \"慶尙北道令第83號(1933-10-06)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 2992,\n  \"fullname\": \"경상북도/영일군/죽장면\",\n  \"fullname_c\": \"慶尙北道/迎日郡/竹長面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 156735,\n  \"key\": \"4/125/1285\",\n  \"lv\": 3,\n  \"name\": \"죽장면\",\n  \"name_cn\": \"竹長面\",\n  \"reference\": \"慶尙北道令第83號(1933-10-06)에는 町長面으로 기록되어 있는데 이는 alias 처리.\",\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"4/125\",\n  \"work_date\": \"20220926\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1934,
    "validTo": 1945,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
