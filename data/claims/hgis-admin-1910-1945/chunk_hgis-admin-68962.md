---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-68962"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-68962-boundary",
    "subject": "place-hgis-admin-68962",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-68962"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-68962",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19120731\",\n  \"end_source\": \"朝鮮總督府令第130號(1912-07-17);朝鮮總督府京畿道告示第32號(1912-07-31)\",\n  \"fid\": 867,\n  \"fullname\": \"경기도/부평군\",\n  \"fullname_c\": \"京畿道/富平郡\",\n  \"geom_ref\": \"추정\",\n  \"id\": 68962,\n  \"key\": \"2/25\",\n  \"lv\": 2,\n  \"name\": \"부평군\",\n  \"name_cn\": \"富平郡\",\n  \"reference\": \"1912년 8월 1일 장군소면 신정리로 통합되어 있던 前천신리 및 신기리의 後坪은 부평 수탄면 개봉리로 편입\",\n  \"trust\": 2,\n  \"type\": \"郡\",\n  \"up_key\": \"2\",\n  \"work_date\": \"20220223\",\n  \"worker\": \"2020국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1910,
    "validTo": 1912,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
