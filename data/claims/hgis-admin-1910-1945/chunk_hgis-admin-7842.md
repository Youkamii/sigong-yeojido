---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-7842"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-7842-boundary",
    "subject": "place-hgis-admin-7842",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-7842"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-7842",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);朝鮮總督府京畿道令第3號(1914-03-13);朝鮮總督府京畿道告示第58號(1915-10-28);朝鮮總督府令第113號(1915-11-11)\",\n  \"fid\": 1475,\n  \"fullname\": \"경기도/포천군/외북면\",\n  \"fullname_c\": \"京畿道/抱川郡/外北面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 7842,\n  \"key\": \"2/48/707\",\n  \"lv\": 3,\n  \"name\": \"외북면\",\n  \"name_cn\": \"外北面\",\n  \"reference\": \"14년 행정구역 개편 당시 포천군은, 14년 3월 1일 기존 포천과 영평을 합하여 포천으로 설정된 후(부령111호) 4월 1일 신규 포천군의 면의 구획과 명칭이 정비되었다(도령3호). 이후 15년 10월 28일 ��\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"2/48\",\n  \"work_date\": \"20201231\",\n  \"worker\": \"2020국편GIS사업팀\"\n}",
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
