---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-112215"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-112215-boundary",
    "subject": "place-hgis-admin-112215",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-112215"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-112215",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19321101\",\n  \"begin_sour\": \"全羅南道令第20號(1932-10-20)\",\n  \"end\": \"19350930\",\n  \"end_source\": \"朝鮮總督府令第112號(1935-09-28)\",\n  \"fid\": 3557,\n  \"fullname\": \"전라남도/광주군/지산면\",\n  \"fullname_c\": \"全羅南道/光州郡/芝山面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 112215,\n  \"key\": \"5/542/6521\",\n  \"lv\": 3,\n  \"name\": \"지산면\",\n  \"name_cn\": \"芝山面\",\n  \"reference\": null,\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"5/542\",\n  \"work_date\": \"20220728\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1932,
    "validTo": 1935,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
