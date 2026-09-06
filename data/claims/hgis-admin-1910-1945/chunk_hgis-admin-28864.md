---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-28864"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-28864-boundary",
    "subject": "place-hgis-admin-28864",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-28864"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-28864",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);朝鮮總督府忠淸南道令第3號(1914-03-16);朝鮮總督府忠淸南道告示第36號(1914-05-28);正誤(1914-06-19,忠淸南道告示第36號)\",\n  \"fid\": 5350,\n  \"fullname\": \"충청남도/서천군/개곡면\",\n  \"fullname_c\": \"忠淸南道/舒川郡/開谷面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 28864,\n  \"key\": \"7/192/2609\",\n  \"lv\": 3,\n  \"name\": \"개곡면\",\n  \"name_cn\": \"開谷面\",\n  \"reference\": \"14년 행정구역 개편 당시 비인, 한산, 서천군이 서천군으로 통합되었다(부령111호). 4월 1일 새 서천군 내 면의 구획, 명칭이 정해지고(도령3호) 5월 28일 동리 전체가 정비되었는데 이때 보령, 부��\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"7/192\",\n  \"work_date\": \"20210830\",\n  \"worker\": \"2021국편GIS사업팀\"\n}",
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
