---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-69030"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-69030-boundary",
    "subject": "place-hgis-admin-69030",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-69030"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-69030",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19370801\",\n  \"begin_sour\": \"朝鮮總督府咸鏡南道令第19號(1937-07-15)\",\n  \"end\": \"19430930\",\n  \"end_source\": \"朝鮮總督府令第297號(1943-09-29)\",\n  \"fid\": 7398,\n  \"fullname\": \"함경남도/고원군/고원면\",\n  \"fullname_c\": \"咸鏡南道/高原郡/高原面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 69030,\n  \"key\": \"12/461/4944\",\n  \"lv\": 3,\n  \"name\": \"고원면\",\n  \"name_cn\": \"高原面\",\n  \"reference\": null,\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"12/461\",\n  \"work_date\": \"20220627\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1937,
    "validTo": 1943,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
