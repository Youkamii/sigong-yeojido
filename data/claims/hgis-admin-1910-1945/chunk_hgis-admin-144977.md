---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-144977"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-144977-boundary",
    "subject": "place-hgis-admin-144977",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-144977"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-144977",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19360401\",\n  \"begin_sour\": \"朝鮮總督府令第8號(1936-02-14)\",\n  \"end\": \"19370726\",\n  \"end_source\": \"慶尙南道告示第111號(1937-07-27)\",\n  \"fid\": 1778,\n  \"fullname\": \"경상남도/부산부\",\n  \"fullname_c\": \"慶尙南道/釜山府\",\n  \"geom_ref\": \"기호\",\n  \"id\": 144977,\n  \"key\": \"3/591\",\n  \"lv\": 2,\n  \"name\": \"부산부\",\n  \"name_cn\": \"釜山府\",\n  \"reference\": null,\n  \"trust\": 1,\n  \"type\": \"府\",\n  \"up_key\": \"3\",\n  \"work_date\": \"20220907\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1936,
    "validTo": 1937,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
