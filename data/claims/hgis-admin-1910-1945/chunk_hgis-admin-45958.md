---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-45958"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-45958-boundary",
    "subject": "place-hgis-admin-45958",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-45958"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-45958",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19361001\",\n  \"begin_sour\": \"朝鮮總督府令第93號(1936-09-26);朝鮮總督府京畿道吿示第146號(1936-09-30)\",\n  \"end\": \"19400331\",\n  \"end_source\": \"朝鮮總督府令第40號(1940-03-28)\",\n  \"fid\": 1299,\n  \"fullname\": \"경기도/인천부\",\n  \"fullname_c\": \"京畿道/仁川府\",\n  \"geom_ref\": \"기호\",\n  \"id\": 45958,\n  \"key\": \"2/40\",\n  \"lv\": 2,\n  \"name\": \"인천부\",\n  \"name_cn\": \"仁川府\",\n  \"reference\": \"40년 4월 1일 부천군 문학면, 남동면, 부내면, 서곶면 편입\",\n  \"trust\": 4,\n  \"type\": \"府\",\n  \"up_key\": \"2\",\n  \"work_date\": \"20210820\",\n  \"worker\": \"2021국편GIS담당\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1936,
    "validTo": 1940,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
