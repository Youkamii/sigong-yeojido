---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-20507"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-20507-boundary",
    "subject": "place-hgis-admin-20507",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-20507"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-20507",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19421001\",\n  \"begin_sour\": \"朝鮮總督府令第243號(1942-10-01)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 5325,\n  \"fullname\": \"충청남도/서산군/서산읍\",\n  \"fullname_c\": \"忠淸南道/瑞山郡/瑞山邑\",\n  \"geom_ref\": \"기호\",\n  \"id\": 20507,\n  \"key\": \"7/193/1945\",\n  \"lv\": 3,\n  \"name\": \"서산읍\",\n  \"name_cn\": \"瑞山邑\",\n  \"reference\": null,\n  \"trust\": 1,\n  \"type\": \"邑\",\n  \"up_key\": \"7/193\",\n  \"work_date\": \"20210830\",\n  \"worker\": \"2021국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1942,
    "validTo": 1945,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
