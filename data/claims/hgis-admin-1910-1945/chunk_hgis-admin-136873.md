---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-136873"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-136873-boundary",
    "subject": "place-hgis-admin-136873",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-136873"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-136873",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19440510\",\n  \"begin_sour\": \"朝鮮總督府令第198號(1944-05-10);朝鮮總督府令第199號(1944-05-10)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 7096,\n  \"fullname\": \"평안북도/의주군\",\n  \"fullname_c\": \"平安北道/義州郡\",\n  \"geom_ref\": \"기호\",\n  \"id\": 136873,\n  \"key\": \"10/572\",\n  \"lv\": 2,\n  \"name\": \"의주군\",\n  \"name_cn\": \"義州郡\",\n  \"reference\": \"44년 5월 10일 삭주 구곡면 수풍동, 신풍동 의주 광평면 청수동으로 삭주군 청수읍 신설\",\n  \"trust\": 4,\n  \"type\": \"郡\",\n  \"up_key\": \"10\",\n  \"work_date\": \"20220802\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1944,
    "validTo": 1945,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
