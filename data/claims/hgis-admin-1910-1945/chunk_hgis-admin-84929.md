---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-84929"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-84929-boundary",
    "subject": "place-hgis-admin-84929",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-84929"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-84929",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19340401\",\n  \"begin_sour\": \"朝鮮總督府令第26號(1934-03-27)\",\n  \"end\": \"19360930\",\n  \"end_source\": \"朝鮮總督府令第93號(1936-09-26);朝鮮總督府令第94號(1936-09-26);咸鏡北道吿示第126號(1936-09-29)\",\n  \"fid\": 7921,\n  \"fullname\": \"함경북도/경흥군/나진읍\",\n  \"fullname_c\": \"咸鏡北道/慶興郡/羅津邑\",\n  \"geom_ref\": \"기호\",\n  \"id\": 84929,\n  \"key\": \"13/483/5298\",\n  \"lv\": 3,\n  \"name\": \"나진읍\",\n  \"name_cn\": \"羅津邑\",\n  \"reference\": null,\n  \"trust\": 1,\n  \"type\": \"邑\",\n  \"up_key\": \"13/483\",\n  \"work_date\": \"20220627\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1934,
    "validTo": 1936,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
