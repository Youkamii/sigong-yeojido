---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-69281"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-69281-boundary",
    "subject": "place-hgis-admin-69281",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-69281"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-69281",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);咸鏡南道令第3號(1914-02-14);咸鏡南道令第4號(1914-03-05);咸鏡南道告示第9號(1914-03-14);咸鏡南道告示第30號(1916-06-07)\",\n  \"fid\": 7704,\n  \"fullname\": \"함경남도/정평군/세류면\",\n  \"fullname_c\": \"咸鏡南道/定平郡/細柳面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 69281,\n  \"key\": \"12/474/5163\",\n  \"lv\": 3,\n  \"name\": \"세류면\",\n  \"name_cn\": \"細柳面\",\n  \"reference\": \"14년 3월 1일 기존 정평군 성락면의 일부 동리가 함흥군으로 편입되고 나머지 지역은 정평군으로 설정되었다(부령111호). 4월 1일 성락면과 중주이면의 구획이 조정되는 등 정평군 내 면의 구획,\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"12/474\",\n  \"work_date\": \"20220627\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
