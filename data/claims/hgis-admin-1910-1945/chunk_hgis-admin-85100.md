---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-85100"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-85100-boundary",
    "subject": "place-hgis-admin-85100",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-85100"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-85100",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19361001\",\n  \"begin_sour\": \"朝鮮總督府令第93號(1936-09-26);朝鮮總督府令第94號(1936-09-26);咸鏡北道吿示第126號(1936-09-29)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 7918,\n  \"fullname\": \"함경북도/경흥군\",\n  \"fullname_c\": \"咸鏡北道/慶興郡\",\n  \"geom_ref\": \"기호\",\n  \"id\": 85100,\n  \"key\": \"13/483\",\n  \"lv\": 2,\n  \"name\": \"경흥군\",\n  \"name_cn\": \"慶興郡\",\n  \"reference\": null,\n  \"trust\": 4,\n  \"type\": \"郡\",\n  \"up_key\": \"13\",\n  \"work_date\": \"20220627\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
