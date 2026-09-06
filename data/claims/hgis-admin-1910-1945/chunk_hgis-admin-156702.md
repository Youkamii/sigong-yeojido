---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-156702"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-156702-boundary",
    "subject": "place-hgis-admin-156702",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-156702"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-156702",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19170401\",\n  \"begin_sour\": \"朝鮮總督府令第18號(1917-03-10);朝鮮總督府江原道令第4號(1917-03-20)\",\n  \"end\": \"19380630\",\n  \"end_source\": \"朝鮮總督府令第115號(1938-06-01)\",\n  \"fid\": 8464,\n  \"fullname\": \"황해도/신계군\",\n  \"fullname_c\": \"黃海道/新溪郡\",\n  \"geom_ref\": \"기호\",\n  \"id\": 156702,\n  \"key\": \"14/447\",\n  \"lv\": 2,\n  \"name\": \"신계군\",\n  \"name_cn\": \"新溪郡\",\n  \"reference\": \"17년 4월 1일 황해 신계 촌면 지석리 이천 낙양 편입\",\n  \"trust\": 4,\n  \"type\": \"郡\",\n  \"up_key\": \"14\",\n  \"work_date\": \"20220913\",\n  \"worker\": \"2022국편GIS담당\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1917,
    "validTo": 1938,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
