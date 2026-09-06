---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-7689"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-7689-boundary",
    "subject": "place-hgis-admin-7689",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-7689"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-7689",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19160501\",\n  \"begin_sour\": \"朝鮮總督府京畿道令第4號(1916-04-24)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 982,\n  \"fullname\": \"경기도/시흥군/신동면\",\n  \"fullname_c\": \"京畿道/始興郡/新東面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 7689,\n  \"key\": \"2/28/393\",\n  \"lv\": 3,\n  \"name\": \"신동면\",\n  \"name_cn\": \"新東面\",\n  \"reference\": \"1916년 5월 1일 신북면 폐지되면서 사당리 신동면으로 편입\",\n  \"trust\": 3,\n  \"type\": \"面\",\n  \"up_key\": \"2/28\",\n  \"work_date\": \"20201231\",\n  \"worker\": \"2020국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1916,
    "validTo": 1945,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
