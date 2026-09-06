---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-22621"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-22621-boundary",
    "subject": "place-hgis-admin-22621",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-22621"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-22621",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19351001\",\n  \"begin_sour\": \"朝鮮總督府令第112號(09-28)\",\n  \"end\": \"19401031\",\n  \"end_source\": \"朝鮮總督府令第220號(1940-11-01)\",\n  \"fid\": 5194,\n  \"fullname\": \"충청남도/대전부\",\n  \"fullname_c\": \"忠淸南道/大田府\",\n  \"geom_ref\": \"기호\",\n  \"id\": 22621,\n  \"key\": \"7/404\",\n  \"lv\": 2,\n  \"name\": \"대전부\",\n  \"name_cn\": \"大田府\",\n  \"reference\": \"35년 10월 1일 대전읍이 대전부로 변경;40년 11월 1일 대전부역 확장\",\n  \"trust\": 3,\n  \"type\": \"府\",\n  \"up_key\": \"7\",\n  \"work_date\": \"20210830\",\n  \"worker\": \"2021국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1935,
    "validTo": 1940,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
