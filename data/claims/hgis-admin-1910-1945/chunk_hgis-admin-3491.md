---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-3491"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-3491-boundary",
    "subject": "place-hgis-admin-3491",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-3491"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-3491",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19100930\",\n  \"end_source\": \"朝鮮總督府令第7號(1910-10-01);朝鮮總督府京畿道令第3號(1911-04-01)\",\n  \"fid\": 7364,\n  \"fullname\": \"한성부/남부\",\n  \"fullname_c\": \"漢城府/南部\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 3491,\n  \"key\": \"11/55\",\n  \"lv\": 2,\n  \"name\": \"남부\",\n  \"name_cn\": \"南部\",\n  \"reference\": \"1910-10-01 한성부를 경성부로 개칭 후 부와 면의 설정은 1911-04-01. 편의상 한성부 및 部의 마지막을 1910-09-30으로 설정\",\n  \"trust\": 2,\n  \"type\": \"部\",\n  \"up_key\": \"11\",\n  \"work_date\": \"20201231\",\n  \"worker\": \"2020국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1910,
    "validTo": 1910,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
