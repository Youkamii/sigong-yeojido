---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-46976"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-46976-boundary",
    "subject": "place-hgis-admin-46976",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-46976"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-46976",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19190515\",\n  \"begin_sour\": \"朝鮮總督府令第88號(1919-05-15)\",\n  \"end\": \"19401130\",\n  \"end_source\": \"面ノ名稱變更ノ件(邑面並ニ町洞里區域變更關係書類 CJA0003482)\",\n  \"fid\": 79,\n  \"fullname\": \"강원도/고성군/오대면\",\n  \"fullname_c\": \"江原道/高城郡/梧垈面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 46976,\n  \"key\": \"1/76/4110\",\n  \"lv\": 3,\n  \"name\": \"오대면\",\n  \"name_cn\": \"梧垈面\",\n  \"reference\": null,\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"1/76\",\n  \"work_date\": \"20210830\",\n  \"worker\": \"2021국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1919,
    "validTo": 1940,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
