---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-33347"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-33347-boundary",
    "subject": "place-hgis-admin-33347",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-33347"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-33347",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);朝鮮總督府忠淸南道令第1號(1914-01-12);朝鮮總督府忠淸南道令第3號(1914-03-16);朝鮮總督府忠淸南道告示第39號(1914-06-10);正誤(1914-06-23,忠淸南道告示第39號)\",\n  \"fid\": 5553,\n  \"fullname\": \"충청남도/정산군/관면\",\n  \"fullname_c\": \"忠淸南道/定山郡/冠面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 33347,\n  \"key\": \"7/421/2701\",\n  \"lv\": 3,\n  \"name\": \"관면\",\n  \"name_cn\": \"冠面\",\n  \"reference\": \"14년 행정구역 개편 당시 정산군은 홍주군 일부, 부여군 일부와 함께 청양군으로 통합되었다(부령111호). 1월 12일  청양 편입 지역 중 관할 미정 지역의 관할 구역 확정이 있은 후(도령1호) 4월 1��\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"7/421\",\n  \"work_date\": \"20210830\",\n  \"worker\": \"2021국편GIS사업팀\"\n}",
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
