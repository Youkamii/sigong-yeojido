---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-166122"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-166122-boundary",
    "subject": "place-hgis-admin-166122",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-166122"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-166122",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19171001\",\n  \"begin_sour\": \"釜山日報(1917-10-08);포항시사 제1권(2010, 504쪽)\",\n  \"end\": \"19310331\",\n  \"end_source\": \"朝鮮總督府令第103號(1930-12-29)\",\n  \"fid\": 2997,\n  \"fullname\": \"경상북도/영일군/포항면\",\n  \"fullname_c\": \"慶尙北道/迎日郡/浦項面\",\n  \"geom_ref\": \"추정\",\n  \"id\": 166122,\n  \"key\": \"4/125/8356\",\n  \"lv\": 3,\n  \"name\": \"포항면\",\n  \"name_cn\": \"浦項面\",\n  \"reference\": null,\n  \"trust\": 3,\n  \"type\": \"面\",\n  \"up_key\": \"4/125\",\n  \"work_date\": \"20220926\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1917,
    "validTo": 1931,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
