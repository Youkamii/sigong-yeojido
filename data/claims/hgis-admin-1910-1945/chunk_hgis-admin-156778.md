---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-156778"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-156778-boundary",
    "subject": "place-hgis-admin-156778",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-156778"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-156778",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19171001\",\n  \"begin_sour\": \"釜山日報(1917-10-08);포항시사 제1권(2010, 504쪽)\",\n  \"end\": \"19380930\",\n  \"end_source\": \"朝鮮總督府令第197號(1938-09-27);慶尙北道令第36號(1938-09-27)\",\n  \"fid\": 3000,\n  \"fullname\": \"경상북도/영일군/형산면\",\n  \"fullname_c\": \"慶尙北道/迎日郡/兄山面\",\n  \"geom_ref\": \"추정\",\n  \"id\": 156778,\n  \"key\": \"4/125/8358\",\n  \"lv\": 3,\n  \"name\": \"형산면\",\n  \"name_cn\": \"兄山面\",\n  \"reference\": \"17년 10월 1일 형산면과 포항면 분리;38년 10월 1일 형산면 포항읍으로 편입\",\n  \"trust\": 4,\n  \"type\": \"面\",\n  \"up_key\": \"4/125\",\n  \"work_date\": \"20220926\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1917,
    "validTo": 1938,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
