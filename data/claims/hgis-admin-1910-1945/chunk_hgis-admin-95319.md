---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-95319"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-95319-boundary",
    "subject": "place-hgis-admin-95319",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-95319"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-95319",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19350301\",\n  \"begin_sour\": \"朝鮮總督府令第6號(1935-01-26);朝鮮總督府令第7號(1935-01-26);全羅北道令第1號(1935-01-30)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 4621,\n  \"fullname\": \"전라북도/순창군\",\n  \"fullname_c\": \"全羅北道/淳昌郡\",\n  \"geom_ref\": \"기호\",\n  \"id\": 95319,\n  \"key\": \"6/178\",\n  \"lv\": 2,\n  \"name\": \"순창군\",\n  \"name_cn\": \"淳昌郡\",\n  \"reference\": \"19350301에 면단위 전면 대개편이 이루어짐\",\n  \"trust\": 3,\n  \"type\": \"郡\",\n  \"up_key\": \"6\",\n  \"work_date\": \"20220726\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1935,
    "validTo": 1945,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
