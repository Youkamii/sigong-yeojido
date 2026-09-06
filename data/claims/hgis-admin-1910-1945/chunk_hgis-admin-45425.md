---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-45425"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-45425-boundary",
    "subject": "place-hgis-admin-45425",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-45425"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-45425",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19360401\",\n  \"begin_sour\": \"朝鮮總督府令第8號(1936-02-14);朝鮮總督府京畿道令第1號(1936-02-21)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 810,\n  \"fullname\": \"경기도/김포군/양동면\",\n  \"fullname_c\": \"京畿道/金浦郡/陽東面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 45425,\n  \"key\": \"2/17/157\",\n  \"lv\": 3,\n  \"name\": \"양동면\",\n  \"name_cn\": \"陽東面\",\n  \"reference\": \"1936년 경성부역 확장으로 기존 양동면 양화리, 염창리, 목동 일부 경성부 편입, 기존 영등포읍 양평리 일부, 시흥군 북면 도림리 일부 김포 양동면으로 편입\",\n  \"trust\": 4,\n  \"type\": \"面\",\n  \"up_key\": \"2/17\",\n  \"work_date\": \"20210820\",\n  \"worker\": \"2021국편GIS담당\"\n}",
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
