---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-176303"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-176303-boundary",
    "subject": "place-hgis-admin-176303",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-176303"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-176303",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19190515\",\n  \"begin_sour\": \"朝鮮總督府令第89號(1919-05-15);朝鮮總督府江原道令第4號(1919-05-15)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 409,\n  \"fullname\": \"강원도/통천군\",\n  \"fullname_c\": \"江原道/通川郡\",\n  \"geom_ref\": \"기호\",\n  \"id\": 176303,\n  \"key\": \"1/436\",\n  \"lv\": 2,\n  \"name\": \"통천군\",\n  \"name_cn\": \"通川郡\",\n  \"reference\": \"朝鮮總督府令第89號(1919-05-15);朝鮮總督府江原道令第4號(1919-05-15) 19190515에 杆城郡이 高城郡으로 변경되고, 通川郡 臨南面 長箭里, 注驗里, 沙湖里, 南涯里가 高城郡으로 편입\",\n  \"trust\": 4,\n  \"type\": \"郡\",\n  \"up_key\": \"1\",\n  \"work_date\": \"20210830\",\n  \"worker\": \"2021국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1919,
    "validTo": 1945,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
