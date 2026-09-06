---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-95324"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-95324-boundary",
    "subject": "place-hgis-admin-95324",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-95324"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-95324",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19351001\",\n  \"begin_sour\": \"朝鮮總督府令第112號(1935-09-28);全羅北道令第34號(1935-10-01)\",\n  \"end\": \"19401031\",\n  \"end_source\": \"朝鮮總督府令第220號(1940-10-23)\",\n  \"fid\": 4698,\n  \"fullname\": \"전라북도/완주군\",\n  \"fullname_c\": \"全羅北道/完州郡\",\n  \"geom_ref\": \"기호\",\n  \"id\": 95324,\n  \"key\": \"6/176\",\n  \"lv\": 2,\n  \"name\": \"완주군\",\n  \"name_cn\": \"完州郡\",\n  \"reference\": \"19350301에 면단위 전면 통폐합이 이루어짐. 19351001에 全州郡 중 全州邑을 全州府로 독립 승격하고, 나머지를 完州郡으로 개편함. 19401101에 雨田面과 伊東面, 助村面 일부 동리를 全州府로 편입함\",\n  \"trust\": 1,\n  \"type\": \"郡\",\n  \"up_key\": \"6\",\n  \"work_date\": \"20220726\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
