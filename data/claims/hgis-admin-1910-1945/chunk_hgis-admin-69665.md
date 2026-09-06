---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-69665"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-69665-boundary",
    "subject": "place-hgis-admin-69665",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-69665"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-69665",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19331001\",\n  \"begin_sour\": \"朝鮮總督府咸鏡南道告示第99號(1933-10-01)\",\n  \"end\": \"19420331\",\n  \"end_source\": \"朝鮮總督府令第83號(1942-03-30)\",\n  \"fid\": 7640,\n  \"fullname\": \"함경남도/원산부\",\n  \"fullname_c\": \"咸鏡南道/元山府\",\n  \"geom_ref\": \"기호\",\n  \"id\": 69665,\n  \"key\": \"12/472\",\n  \"lv\": 2,\n  \"name\": \"원산부\",\n  \"name_cn\": \"元山府\",\n  \"reference\": \"원산부로 덕원군 일부 편입\",\n  \"trust\": 4,\n  \"type\": \"府\",\n  \"up_key\": \"12\",\n  \"work_date\": \"20220627\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1933,
    "validTo": 1942,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
