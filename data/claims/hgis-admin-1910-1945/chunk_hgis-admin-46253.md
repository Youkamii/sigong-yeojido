---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-46253"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-46253-boundary",
    "subject": "place-hgis-admin-46253",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-46253"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-46253",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19380401\",\n  \"begin_sour\": \"朝鮮總督府令第36號(1938-03-30);朝鮮總督府京畿道令第8號(1938-03-30)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 1321,\n  \"fullname\": \"경기도/장단군\",\n  \"fullname_c\": \"京畿道/長湍郡\",\n  \"geom_ref\": \"기호\",\n  \"id\": 46253,\n  \"key\": \"2/41\",\n  \"lv\": 2,\n  \"name\": \"장단군\",\n  \"name_cn\": \"長湍郡\",\n  \"reference\": \"38년 4월 1일 진서 대원리가 개풍군으로 편입\",\n  \"trust\": 4,\n  \"type\": \"郡\",\n  \"up_key\": \"2\",\n  \"work_date\": \"20210820\",\n  \"worker\": \"2021국편GIS담당\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1938,
    "validTo": 1945,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
