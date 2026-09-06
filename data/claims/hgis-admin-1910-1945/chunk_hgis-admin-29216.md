---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-29216"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-29216-boundary",
    "subject": "place-hgis-admin-29216",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-29216"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-29216",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19310601\",\n  \"begin_sour\": \"朝鮮總督府忠淸南道令第10號(1931-06-01)\",\n  \"end\": \"19380930\",\n  \"end_source\": \"朝鮮總督府令第197號(1938-10-01);朝鮮總督府忠淸南道令第29號(1938-10-01)\",\n  \"fid\": 5366,\n  \"fullname\": \"충청남도/서천군/서남면\",\n  \"fullname_c\": \"忠淸南道/舒川郡/西南面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 29216,\n  \"key\": \"7/192/2618\",\n  \"lv\": 3,\n  \"name\": \"서남면\",\n  \"name_cn\": \"西南面\",\n  \"reference\": null,\n  \"trust\": 3,\n  \"type\": \"面\",\n  \"up_key\": \"7/192\",\n  \"work_date\": \"20210830\",\n  \"worker\": \"2021국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1931,
    "validTo": 1938,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
