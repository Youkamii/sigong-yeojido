---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-93245"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-93245-boundary",
    "subject": "place-hgis-admin-93245",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-provinces-1910-1945.geojson#hgis-admin-93245"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-93245",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19191101\",\n  \"begin_sour\": \"朝鮮總督府令第160號(1919-10-04)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 8176,\n  \"fullname\": \"황해도\",\n  \"fullname_c\": \"黃海道\",\n  \"geom_ref\": \"기호\",\n  \"id\": 93245,\n  \"key\": \"14\",\n  \"lv\": 1,\n  \"name\": \"황해도\",\n  \"name_cn\": \"黃海道\",\n  \"reference\": \"황해 황주 인교면 인제리 일부 평남 중화군 간동면으로 편입\",\n  \"trust\": 4,\n  \"type\": \"道\",\n  \"up_key\": null,\n  \"work_date\": \"20220628\",\n  \"worker\": \"2021국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1919,
    "validTo": 1945,
    "generatedBy": "codex",
    "generatedAt": "2026-09-06",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
