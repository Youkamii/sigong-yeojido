---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-46266"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-46266-boundary",
    "subject": "place-hgis-admin-46266",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-46266"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-46266",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19340401\",\n  \"begin_sour\": \"朝鮮總督府京畿道令第4號(1934-03-10)\",\n  \"end\": \"19380930\",\n  \"end_source\": \"朝鮮總督府令第196號(1938-09-27)\",\n  \"fid\": 1401,\n  \"fullname\": \"경기도/진위군/팽성면\",\n  \"fullname_c\": \"京畿道/振威郡/彭城面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 46266,\n  \"key\": \"2/45/4047\",\n  \"lv\": 3,\n  \"name\": \"팽성면\",\n  \"name_cn\": \"彭城面\",\n  \"reference\": \"34년 4월 1일 부용면, 서면 병합하여 팽성면 신설\",\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"2/45\",\n  \"work_date\": \"20210820\",\n  \"worker\": \"2021국편GIS담당\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1934,
    "validTo": 1938,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
