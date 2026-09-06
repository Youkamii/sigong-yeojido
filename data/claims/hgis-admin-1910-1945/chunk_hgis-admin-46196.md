---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-46196"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-46196-boundary",
    "subject": "place-hgis-admin-46196",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-46196"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-46196",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19380101\",\n  \"begin_sour\": \"朝鮮總督府京畿道令第28號(1937-12-15)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 1153,\n  \"fullname\": \"경기도/양평군/양평면\",\n  \"fullname_c\": \"京畿道/楊平郡/楊平面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 46196,\n  \"key\": \"2/33/4044\",\n  \"lv\": 3,\n  \"name\": \"양평면\",\n  \"name_cn\": \"楊平面\",\n  \"reference\": \"38년 1월 1일 갈산면이 양평면으로 개칭\",\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"2/33\",\n  \"work_date\": \"20210820\",\n  \"worker\": \"2021국편GIS담당\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1938,
    "validTo": 1945,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
