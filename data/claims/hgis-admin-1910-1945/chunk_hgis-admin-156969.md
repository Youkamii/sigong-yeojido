---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-156969"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-156969-boundary",
    "subject": "place-hgis-admin-156969",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-156969"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-156969",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第111號(1913-12-29)\",\n  \"end\": \"19170331\",\n  \"end_source\": \"朝鮮總督府令第9號(1917-02-15)\",\n  \"fid\": 2627,\n  \"fullname\": \"경상북도/대구부\",\n  \"fullname_c\": \"慶尙北道/大邱府\",\n  \"geom_ref\": \"기호\",\n  \"id\": 156969,\n  \"key\": \"4/606\",\n  \"lv\": 2,\n  \"name\": \"대구부\",\n  \"name_cn\": \"大邱府\",\n  \"reference\": \"14년 3월 1일 기존 대구부 대구면 대부분이 되었는데 신천동과 신암동은 달성군으로, 남산동과 신동은 일부가 달성군으로 편입되었다(부령111호). 참고로 대구면은 11년 11월 14일 동상면과 서상��\",\n  \"trust\": 3,\n  \"type\": \"府\",\n  \"up_key\": \"4\",\n  \"work_date\": \"20220926\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1914,
    "validTo": 1917,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
