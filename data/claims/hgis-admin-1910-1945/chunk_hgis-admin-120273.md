---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-120273"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-120273-boundary",
    "subject": "place-hgis-admin-120273",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-120273"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-120273",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19321101\",\n  \"begin_sour\": \"全羅南道令第20號(1932-10-20)\",\n  \"end\": \"19400430\",\n  \"end_source\": \"全羅南道令第17號(1940-04-18)\",\n  \"fid\": 4070,\n  \"fullname\": \"전라남도/장흥군/남면\",\n  \"fullname_c\": \"全羅南道/長興郡/南面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 120273,\n  \"key\": \"5/147/6834\",\n  \"lv\": 3,\n  \"name\": \"남면\",\n  \"name_cn\": \"南面\",\n  \"reference\": null,\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"5/147\",\n  \"work_date\": \"20220728\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1932,
    "validTo": 1940,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
