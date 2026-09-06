---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-69067"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-69067-boundary",
    "subject": "place-hgis-admin-69067",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-69067"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-69067",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19331001\",\n  \"begin_sour\": \"朝鮮總督府令第108號(1933-10-01);朝鮮總督府咸鏡南道告示第99號(1933-10-01)\",\n  \"end\": \"19420331\",\n  \"end_source\": \"朝鮮總督府令第83號(1942-03-30)\",\n  \"fid\": 7440,\n  \"fullname\": \"함경남도/덕원군/적전면\",\n  \"fullname_c\": \"咸鏡南道/德源郡/赤田面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 69067,\n  \"key\": \"12/463/4970\",\n  \"lv\": 3,\n  \"name\": \"적전면\",\n  \"name_cn\": \"赤田面\",\n  \"reference\": null,\n  \"trust\": 4,\n  \"type\": \"面\",\n  \"up_key\": \"12/463\",\n  \"work_date\": \"20220627\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
