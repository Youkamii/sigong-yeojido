---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-46237"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-46237-boundary",
    "subject": "place-hgis-admin-46237",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-46237"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-46237",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19111006\",\n  \"end_source\": \"朝鮮總督府京畿道令第6號(1911-10-04)\",\n  \"fid\": 1309,\n  \"fullname\": \"경기도/인천부/영종면\",\n  \"fullname_c\": \"京畿道/仁川府/永宗面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 46237,\n  \"key\": \"2/40/581\",\n  \"lv\": 3,\n  \"name\": \"영종면\",\n  \"name_cn\": \"永宗面\",\n  \"reference\": \"1911년 10월 7일 영종면이 용유면과 영종면으로 분할\",\n  \"trust\": 4,\n  \"type\": \"面\",\n  \"up_key\": \"2/40\",\n  \"work_date\": \"20210820\",\n  \"worker\": \"2021국편GIS담당\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1910,
    "validTo": 1911,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
