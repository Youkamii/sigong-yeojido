---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-46532"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-46532-boundary",
    "subject": "place-hgis-admin-46532",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-provinces-1910-1945.geojson#hgis-admin-46532"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-46532",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19100930\",\n  \"end_source\": \"朝鮮總督府令第7號(1910-10-01);朝鮮總督府京畿道令第3號(1911-04-01)\",\n  \"fid\": 560,\n  \"fullname\": \"경기도\",\n  \"fullname_c\": \"京畿道\",\n  \"geom_ref\": \"추정\",\n  \"id\": 46532,\n  \"key\": \"2\",\n  \"lv\": 1,\n  \"name\": \"경기도\",\n  \"name_cn\": \"京畿道\",\n  \"reference\": \"1910년 10월 1일 한성부가 경기도 경성부로 변경\",\n  \"trust\": 2,\n  \"type\": \"道\",\n  \"up_key\": null,\n  \"work_date\": \"20210820\",\n  \"worker\": \"2021국편GIS담당\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1910,
    "validTo": 1910,
    "generatedBy": "codex",
    "generatedAt": "2026-09-06",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
