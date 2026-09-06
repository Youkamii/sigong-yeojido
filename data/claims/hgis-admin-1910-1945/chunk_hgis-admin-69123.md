---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-69123"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-69123-boundary",
    "subject": "place-hgis-admin-69123",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-69123"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-69123",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第111號(1913-12-29);咸鏡南道令第2號(1914-01-23);咸鏡南道令第4號(1914-03-05);咸鏡南道告示第23號(1916-05-13)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 7525,\n  \"fullname\": \"함경남도/북청군/하거서면\",\n  \"fullname_c\": \"咸鏡南道/北靑郡/下車書面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 69123,\n  \"key\": \"12/467/5037\",\n  \"lv\": 3,\n  \"name\": \"하거서면\",\n  \"name_cn\": \"下車書面\",\n  \"reference\": \"14년 3월 1일 기존 북청군의 평포면은 홍원군으로, 안산면은 풍산군으로 변경되고 나머지 북청 지역 전체와 홍원군 용원면 일부 동리가 북청군으로 통합되었다(부령111호). 4월 1일 홍원군에서 ��\",\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"12/467\",\n  \"work_date\": \"20220627\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1914,
    "validTo": 1945,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
