---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-95131"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-95131-boundary",
    "subject": "place-hgis-admin-95131",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-95131"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-95131",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19350301\",\n  \"begin_sour\": \"全羅北道令第1號(1935-01-30)\",\n  \"end\": \"19401031\",\n  \"end_source\": \"朝鮮總督府令第221號(1940-10-23)\",\n  \"fid\": 4936,\n  \"fullname\": \"전라북도/정읍군/신태인면\",\n  \"fullname_c\": \"全羅北道/井邑郡/新泰仁面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 95131,\n  \"key\": \"6/170/6372\",\n  \"lv\": 3,\n  \"name\": \"신태인면\",\n  \"name_cn\": \"新泰仁面\",\n  \"reference\": \"19350301에 龍北面에서 新泰仁面으로 개칭함. 19401101에 新泰仁面에서 新泰仁邑으로 승격함\",\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"6/170\",\n  \"work_date\": \"20220726\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
