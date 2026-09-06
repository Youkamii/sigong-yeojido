---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-157639"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-157639-boundary",
    "subject": "place-hgis-admin-157639",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-157639"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-157639",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);慶尙南道令第2號(1914-03-16);慶尙北道告示第82號(1914-08-05)\",\n  \"fid\": 3363,\n  \"fullname\": \"경상북도/현풍군\",\n  \"fullname_c\": \"慶尙北道/玄風郡\",\n  \"geom_ref\": \"추정\",\n  \"id\": 157639,\n  \"key\": \"4/626\",\n  \"lv\": 2,\n  \"name\": \"현풍군\",\n  \"name_cn\": \"玄風郡\",\n  \"reference\": \"14년 3월 1일 현풍군은 달성군으로 통합되었다(부령111호). 그 이전 12년 12월 1일 창녕 합산 이방동 일부(飛地)가 경북 현풍 구지 유산동으로 편입되었다(부령29호). 14년 4월 1일 새 달성군 내 면의\",\n  \"trust\": 2,\n  \"type\": \"郡\",\n  \"up_key\": \"4\",\n  \"work_date\": \"20220926\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
