---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-33203"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-33203-boundary",
    "subject": "place-hgis-admin-33203",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-33203"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-33203",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);朝鮮總督府忠淸南道令第3號(1914-03-16);朝鮮總督府忠淸南道告示第43號(1914-06-16)\",\n  \"fid\": 5549,\n  \"fullname\": \"충청남도/전의군/동면\",\n  \"fullname_c\": \"忠淸南道/全義郡/東面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 33203,\n  \"key\": \"7/420/2698\",\n  \"lv\": 3,\n  \"name\": \"동면\",\n  \"name_cn\": \"東面\",\n  \"reference\": \"14년 행정구역 개편 당시 전의군은 공주군 일부와 함께 연기군으로 통합되었다(부령111호). 4월 1일 새 연기군 내 면의 구획, 명칭이 정리되었고(도령3호) 6월 16일 연기군(구 전의군 포함) 동리 전\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"7/420\",\n  \"work_date\": \"20210830\",\n  \"worker\": \"2021국편GIS사업팀\"\n}",
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
