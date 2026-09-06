---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-119321"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-119321-boundary",
    "subject": "place-hgis-admin-119321",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-119321"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-119321",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19170930\",\n  \"begin_sour\": \"朝鮮總督府令第71號(1917-09-28)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 4008,\n  \"fullname\": \"전라남도/완도군/군외면\",\n  \"fullname_c\": \"全羅南道/莞島郡/郡外面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 119321,\n  \"key\": \"5/149/1531\",\n  \"lv\": 3,\n  \"name\": \"군외면\",\n  \"name_cn\": \"郡外面\",\n  \"reference\": null,\n  \"trust\": 3,\n  \"type\": \"面\",\n  \"up_key\": \"5/149\",\n  \"work_date\": \"20220728\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1917,
    "validTo": 1945,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
