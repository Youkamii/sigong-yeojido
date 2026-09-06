---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-94675"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-94675-boundary",
    "subject": "place-hgis-admin-94675",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-94675"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-94675",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19350301\",\n  \"begin_sour\": \"全羅北道令第1號(1935-01-30)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 4375,\n  \"fullname\": \"전라북도/고창군/아산면\",\n  \"fullname_c\": \"全羅北道/高敞郡/雅山面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 94675,\n  \"key\": \"6/184/1844\",\n  \"lv\": 3,\n  \"name\": \"아산면\",\n  \"name_cn\": \"雅山面\",\n  \"reference\": \"19140310에 전북 대개편 당시 大山面이 2개 있던 오류 중 하나를 19140328 관보에서 雅山面으로 수정함. 19350301에 高敞郡 石谷面 일부 동리를 편입함\",\n  \"trust\": 3,\n  \"type\": \"面\",\n  \"up_key\": \"6/184\",\n  \"work_date\": \"20220726\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1935,
    "validTo": 1945,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
