---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-46239"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-46239-boundary",
    "subject": "place-hgis-admin-46239",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-46239"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-46239",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19280815\",\n  \"begin_sour\": \"朝鮮總督府令第58號(1928-08-11);朝鮮總督府京畿道令第11號(1928-08-11);朝鮮總督府京畿道吿示第88號(1928-08-11)\",\n  \"end\": \"19300930\",\n  \"end_source\": \"朝鮮總督府令第68號(1930-09-11)\",\n  \"fid\": 627,\n  \"fullname\": \"경기도/개성군\",\n  \"fullname_c\": \"京畿道/開城郡\",\n  \"geom_ref\": \"추정\",\n  \"id\": 46239,\n  \"key\": \"2/8\",\n  \"lv\": 2,\n  \"name\": \"개성군\",\n  \"name_cn\": \"開城郡\",\n  \"reference\": \"28년 장단 진남면 동장리와 개성 중면 창내리 영역 조정;30년 개성 송도면을 개성부로 설치, 기존 개성군은 개풍군으로 변경\",\n  \"trust\": 4,\n  \"type\": \"郡\",\n  \"up_key\": \"2\",\n  \"work_date\": \"20201231\",\n  \"worker\": \"2020국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1928,
    "validTo": 1930,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
