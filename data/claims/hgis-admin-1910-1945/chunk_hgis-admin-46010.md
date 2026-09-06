---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-46010"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-46010-boundary",
    "subject": "place-hgis-admin-46010",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-46010"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-46010",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19310401\",\n  \"begin_sour\": \"朝鮮總督府令第103號(1930-12-29)\",\n  \"end\": \"19360930\",\n  \"end_source\": \"朝鮮總督府令第94號(1936-09-26);朝鮮總督府京畿道令第16號(1936-09-26);朝鮮總督府京畿道吿示第146號(1936-09-30)\",\n  \"fid\": 923,\n  \"fullname\": \"경기도/수원군/수원읍\",\n  \"fullname_c\": \"京畿道/水原郡/水原邑\",\n  \"geom_ref\": \"기호\",\n  \"id\": 46010,\n  \"key\": \"2/27/4037\",\n  \"lv\": 3,\n  \"name\": \"수원읍\",\n  \"name_cn\": \"水原邑\",\n  \"reference\": \"36년 10월 1일 수원읍 확장 및 의왕면, 일형면, 태장면, 안룡면 구역 변경\",\n  \"trust\": 1,\n  \"type\": \"邑\",\n  \"up_key\": \"2/27\",\n  \"work_date\": \"20210820\",\n  \"worker\": \"2021국편GIS담당\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1931,
    "validTo": 1936,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
