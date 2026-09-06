---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-69673"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-69673-boundary",
    "subject": "place-hgis-admin-69673",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-69673"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-69673",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19301001\",\n  \"begin_sour\": \"朝鮮總督府令第68號(1930-09-11)\",\n  \"end\": \"19370331\",\n  \"end_source\": \"朝鮮總督府令第24號(1937-03-29);朝鮮總督府令第25號(1937-03-29);朝鮮總督府咸鏡南道令第6號(1937-03-31);朝鮮總督府咸鏡南道告示第46號(1937-03-31)\",\n  \"fid\": 7723,\n  \"fullname\": \"함경남도/함주군\",\n  \"fullname_c\": \"咸鏡南道/咸州郡\",\n  \"geom_ref\": \"기호\",\n  \"id\": 69673,\n  \"key\": \"12/476\",\n  \"lv\": 2,\n  \"name\": \"함주군\",\n  \"name_cn\": \"咸州郡\",\n  \"reference\": null,\n  \"trust\": 1,\n  \"type\": \"郡\",\n  \"up_key\": \"12\",\n  \"work_date\": \"20220627\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1930,
    "validTo": 1937,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
