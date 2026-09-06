---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-95138"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-95138-boundary",
    "subject": "place-hgis-admin-95138",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-95138"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-95138",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19301226\",\n  \"begin_sour\": \"全羅北道令第16號(1930-12-26)\",\n  \"end\": \"19310331\",\n  \"end_source\": \"朝鮮總督府令第103號(1930-12-29)\",\n  \"fid\": 4947,\n  \"fullname\": \"전라북도/정읍군/정주면\",\n  \"fullname_c\": \"全羅北道/井邑郡/井州面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 95138,\n  \"key\": \"6/170/6375\",\n  \"lv\": 3,\n  \"name\": \"정주면\",\n  \"name_cn\": \"井州面\",\n  \"reference\": \"19301226에 井邑郡 井邑面이 井州面으로 개칭됨. 19310401에 井邑郡 井州面이 井州邑으로 개칭됨\",\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"6/170\",\n  \"work_date\": \"20220726\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1930,
    "validTo": 1931,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
