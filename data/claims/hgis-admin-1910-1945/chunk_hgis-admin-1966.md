---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-1966"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-1966-boundary",
    "subject": "place-hgis-admin-1966",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-1966"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-1966",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);京畿道令第3號(1914-03-13);京畿道告示第3號(1915-01-22)\",\n  \"fid\": 1295,\n  \"fullname\": \"경기도/이천군/호면\",\n  \"fullname_c\": \"京畿道/利川郡/戶面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 1966,\n  \"key\": \"2/22/275\",\n  \"lv\": 3,\n  \"name\": \"호면\",\n  \"name_cn\": \"戶面\",\n  \"reference\": \"1914년 3월 1일 기존 이천군 전체와 음죽군 중 충북 음성으로 편입된 동리들 일부(동면 노평리, 하율면 총곡리, 상율면 팔성리, 석교촌 각 일부)를 제외한 전체 지역과 충북 음성 법왕면 석원리 ��\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"2/22\",\n  \"work_date\": \"20201231\",\n  \"worker\": \"2020국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1910,
    "validTo": 1914,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
