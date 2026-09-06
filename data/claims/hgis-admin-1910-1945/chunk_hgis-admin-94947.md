---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-94947"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-94947-boundary",
    "subject": "place-hgis-admin-94947",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-94947"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-94947",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19310301\",\n  \"begin_sour\": \"全羅北道令第5號(1931-02-21)\",\n  \"end\": \"19330809\",\n  \"end_source\": \"全羅北道令第15號(1933-08-04);全羅北道告示第140號(1933-08-04)\",\n  \"fid\": 4683,\n  \"fullname\": \"전라북도/옥구군/옥구면\",\n  \"fullname_c\": \"全羅北道/沃溝郡/沃溝面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 94947,\n  \"key\": \"6/533/6254\",\n  \"lv\": 3,\n  \"name\": \"옥구면\",\n  \"name_cn\": \"沃溝面\",\n  \"reference\": \"19310301에 沃溝郡 舊邑面을 沃溝面으로 개칭함. 19330810에 沃溝面 일부 동리를 米面으로 편입함\",\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"6/533\",\n  \"work_date\": \"20220726\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1931,
    "validTo": 1933,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
