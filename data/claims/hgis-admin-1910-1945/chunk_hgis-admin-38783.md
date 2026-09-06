---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-38783"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-38783-boundary",
    "subject": "place-hgis-admin-38783",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-38783"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-38783",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19411001\",\n  \"begin_sour\": \"朝鮮總督府令第253號(1941-10-01)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 5697,\n  \"fullname\": \"충청남도/홍성군/홍성읍\",\n  \"fullname_c\": \"忠淸南道/洪城郡/洪城邑\",\n  \"geom_ref\": \"기호\",\n  \"id\": 38783,\n  \"key\": \"7/185/1856\",\n  \"lv\": 3,\n  \"name\": \"홍성읍\",\n  \"name_cn\": \"洪城邑\",\n  \"reference\": \"19411001에 洪城郡 洪州面을 洪城邑으로 승격함\",\n  \"trust\": 1,\n  \"type\": \"邑\",\n  \"up_key\": \"7/185\",\n  \"work_date\": \"20210830\",\n  \"worker\": \"2021국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1941,
    "validTo": 1945,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
