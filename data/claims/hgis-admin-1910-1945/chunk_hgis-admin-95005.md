---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-95005"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-95005-boundary",
    "subject": "place-hgis-admin-95005",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-95005"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-95005",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19360401\",\n  \"begin_sour\": \"朝鮮總督府令第19號(1936-03-27);全羅北道令第5號(1936-04-01)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 4766,\n  \"fullname\": \"전라북도/익산군/오산면\",\n  \"fullname_c\": \"全羅北道/益山郡/五山面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 95005,\n  \"key\": \"6/174/1750\",\n  \"lv\": 3,\n  \"name\": \"오산면\",\n  \"name_cn\": \"五山面\",\n  \"reference\": \"19360401에 臨陂面 永昌里 일부를 益山郡 五山面 永萬里로 편입함\",\n  \"trust\": 4,\n  \"type\": \"面\",\n  \"up_key\": \"6/174\",\n  \"work_date\": \"20220726\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1936,
    "validTo": 1945,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
