---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-733"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-733-boundary",
    "subject": "place-hgis-admin-733",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-733"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-733",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19171001\",\n  \"begin_sour\": \"朝鮮總督府京畿道令第6號(1917-09-17)\",\n  \"end\": \"19310331\",\n  \"end_source\": \"朝鮮總督府令第103號(1930-12-29)\",\n  \"fid\": 985,\n  \"fullname\": \"경기도/시흥군/영등포면\",\n  \"fullname_c\": \"京畿道/始興郡/永登浦面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 733,\n  \"key\": \"2/28/395\",\n  \"lv\": 3,\n  \"name\": \"영등포면\",\n  \"name_cn\": \"永登浦面\",\n  \"reference\": \"17년 북면 일부를 영등포면으로 변경\",\n  \"trust\": 4,\n  \"type\": \"面\",\n  \"up_key\": \"2/28\",\n  \"work_date\": \"20201231\",\n  \"worker\": \"2020국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1917,
    "validTo": 1931,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
