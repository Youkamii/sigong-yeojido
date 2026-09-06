---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-56449"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-56449-boundary",
    "subject": "place-hgis-admin-56449",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-56449"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-56449",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19300101\",\n  \"begin_sour\": \"朝鮮總督府令第97號(1929-11-13);朝鮮總督府黃海道令第20號(1929-11-20);朝鮮總督府黃海道吿示第91號(1929-11-20)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 8319,\n  \"fullname\": \"황해도/봉산군/서종면\",\n  \"fullname_c\": \"黃海道/鳳山郡/西鍾面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 56449,\n  \"key\": \"14/442/4423\",\n  \"lv\": 3,\n  \"name\": \"서종면\",\n  \"name_cn\": \"西鍾面\",\n  \"reference\": null,\n  \"trust\": 4,\n  \"type\": \"面\",\n  \"up_key\": \"14/442\",\n  \"work_date\": \"20210830\",\n  \"worker\": \"2021국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1930,
    "validTo": 1945,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
