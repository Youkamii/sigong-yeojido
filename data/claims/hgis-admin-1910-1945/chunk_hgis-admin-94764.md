---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-94764"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-94764-boundary",
    "subject": "place-hgis-admin-94764",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-94764"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-94764",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19311101\",\n  \"begin_sour\": \"朝鮮總督府令第132號(1931-10-20)\",\n  \"end\": \"19350228\",\n  \"end_source\": \"朝鮮總督府令第7號(1935-01-26);全羅北道第1號(1935-01-30)\",\n  \"fid\": 4486,\n  \"fullname\": \"전라북도/남원군/남원읍\",\n  \"fullname_c\": \"全羅北道/南原郡/南原邑\",\n  \"geom_ref\": \"기호\",\n  \"id\": 94764,\n  \"key\": \"6/181/1823\",\n  \"lv\": 3,\n  \"name\": \"남원읍\",\n  \"name_cn\": \"南原邑\",\n  \"reference\": \"19311101에 南原面을 南原邑으로 승격함. 19350301에 면단위 개편이 이루어짐\",\n  \"trust\": 1,\n  \"type\": \"邑\",\n  \"up_key\": \"6/181\",\n  \"work_date\": \"20220726\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1931,
    "validTo": 1935,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
