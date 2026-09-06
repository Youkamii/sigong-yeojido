---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-69671"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-69671-boundary",
    "subject": "place-hgis-admin-69671",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-69671"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-69671",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第111號(1913-12-29);咸鏡南道令第3號(1914-02-14);咸鏡南道令第4號(1914-03-05);咸鏡南道告示第9號(1914-03-14);咸鏡南道告示第30號(1916-06-07)\",\n  \"end\": \"19410331\",\n  \"end_source\": \"朝鮮總督府令第84號(1941-03-26)\",\n  \"fid\": 7684,\n  \"fullname\": \"함경남도/정평군\",\n  \"fullname_c\": \"咸鏡南道/定平郡\",\n  \"geom_ref\": \"기호\",\n  \"id\": 69671,\n  \"key\": \"12/474\",\n  \"lv\": 2,\n  \"name\": \"정평군\",\n  \"name_cn\": \"定平郡\",\n  \"reference\": \"14년 3월 1일 기존 정평군 성락면의 일부 동리가 함흥군으로 편입되고 나머지 지역은 정평군으로 설정되었다(부령111호). 4월 1일 성락면과 중주이면의 구획이 조정되는 등 정평군 내 면의 구획,\",\n  \"trust\": 1,\n  \"type\": \"郡\",\n  \"up_key\": \"12\",\n  \"work_date\": \"20220627\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1914,
    "validTo": 1941,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
