---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-113862"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-113862-boundary",
    "subject": "place-hgis-admin-113862",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-113862"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-113862",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19311101\",\n  \"begin_sour\": \"朝鮮總督府令第132號(1931-10-20)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 3608,\n  \"fullname\": \"전라남도/나주군/나주읍\",\n  \"fullname_c\": \"全羅南道/羅州郡/羅州邑\",\n  \"geom_ref\": \"기호\",\n  \"id\": 113862,\n  \"key\": \"5/161/1631\",\n  \"lv\": 3,\n  \"name\": \"나주읍\",\n  \"name_cn\": \"羅州邑\",\n  \"reference\": null,\n  \"trust\": 1,\n  \"type\": \"邑\",\n  \"up_key\": \"5/161\",\n  \"work_date\": \"20220728\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1931,
    "validTo": 1945,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
