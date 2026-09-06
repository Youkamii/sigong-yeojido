---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-156701"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-156701-boundary",
    "subject": "place-hgis-admin-156701",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-provinces-1910-1945.geojson#hgis-admin-156701"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-156701",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19170401\",\n  \"begin_sour\": \"朝鮮總督府令第18號(1917-03-10);朝鮮總督府江原道令第4號(1917-03-20)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"朝鮮總督府令第18號(1917-03-10);朝鮮總督府江原道令第4號(1917-03-20)\",\n  \"fid\": 3,\n  \"fullname\": \"강원도\",\n  \"fullname_c\": \"江原道\",\n  \"geom_ref\": \"기호\",\n  \"id\": 156701,\n  \"key\": \"1\",\n  \"lv\": 1,\n  \"name\": \"강원도\",\n  \"name_cn\": \"江原道\",\n  \"reference\": \"17년 4월 1일 황해 신계 촌면 지석리 이천 낙양 편입. 편입 동리가 적시된 고시는 없으나 위치 상 지하리로 추정\",\n  \"trust\": 3,\n  \"type\": \"道\",\n  \"up_key\": null,\n  \"work_date\": \"20220913\",\n  \"worker\": \"2022국편GIS담당\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1917,
    "validTo": 1945,
    "generatedBy": "codex",
    "generatedAt": "2026-09-06",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
