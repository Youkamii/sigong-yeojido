---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-156729"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-156729-boundary",
    "subject": "place-hgis-admin-156729",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-156729"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-156729",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19121231\",\n  \"end_source\": \"朝鮮總督府令第39號(1912-12-06);慶尙北道令第3號(1912-12-12)\",\n  \"fid\": 2859,\n  \"fullname\": \"경상북도/순흥군/단산면\",\n  \"fullname_c\": \"慶尙北道/順興郡/丹山面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 156729,\n  \"key\": \"4/610/8249\",\n  \"lv\": 3,\n  \"name\": \"단산면\",\n  \"name_cn\": \"丹山面\",\n  \"reference\": \"13년 1월 1일 榮川郡 北面의 지곡동을 단산면에 편입\",\n  \"trust\": 4,\n  \"type\": \"面\",\n  \"up_key\": \"4/610\",\n  \"work_date\": \"20220926\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1910,
    "validTo": 1912,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
