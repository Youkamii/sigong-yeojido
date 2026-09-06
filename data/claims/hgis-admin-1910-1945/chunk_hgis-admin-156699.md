---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-156699"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-156699-boundary",
    "subject": "place-hgis-admin-156699",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-156699"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-156699",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19170401\",\n  \"begin_sour\": \"朝鮮總督府令第18號(1917-0310);朝鮮總督府江原道令第4號(1917-03-20)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 277,\n  \"fullname\": \"강원도/이천군/낙양면\",\n  \"fullname_c\": \"江原道/伊川郡/樂壤面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 156699,\n  \"key\": \"1/435/4225\",\n  \"lv\": 3,\n  \"name\": \"낙양면\",\n  \"name_cn\": \"樂壤面\",\n  \"reference\": \"황해 신계 촌면 지석리 이천 낙양 편입. 편입 동리가 적시된 고시는 없으나 위치 상 지하리로 추정\",\n  \"trust\": 3,\n  \"type\": \"面\",\n  \"up_key\": \"1/435\",\n  \"work_date\": \"20220913\",\n  \"worker\": \"2022국편GIS담당\"\n}",
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
