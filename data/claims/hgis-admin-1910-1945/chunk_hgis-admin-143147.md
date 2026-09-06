---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-143147"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-143147-boundary",
    "subject": "place-hgis-admin-143147",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-143147"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-143147",
    "quote": "{\n  \"alias\": \"沙間面\",\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19131231\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);慶尙南道令第2號(1914-03-01)\",\n  \"fid\": 2355,\n  \"fullname\": \"경상남도/함양군/사전면\",\n  \"fullname_c\": \"慶尙南道/咸陽郡/沙田面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 143147,\n  \"key\": \"3/90/7908\",\n  \"lv\": 3,\n  \"name\": \"사전면\",\n  \"name_cn\": \"沙田面\",\n  \"reference\": \"사전면은 민적통계표의 沙間面과 같은 면으로 보이며 1912지방행정구역명칭일람에만 확인됨. 1914년 이전에 폐합된 것으로 추정되는데 편의상 폐지 일자를 13년말로 설정함\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"3/90\",\n  \"work_date\": \"20220907\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1910,
    "validTo": 1913,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
