---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-136479"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-136479-boundary",
    "subject": "place-hgis-admin-136479",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-136479"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-136479",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19121231\",\n  \"end_source\": \"불명\",\n  \"fid\": 7315,\n  \"fullname\": \"평안북도/태천군/북면\",\n  \"fullname_c\": \"平安北道/泰川郡/北面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 136479,\n  \"key\": \"10/579/7359\",\n  \"lv\": 3,\n  \"name\": \"북면\",\n  \"name_cn\": \"北面\",\n  \"reference\": \"1912地方行政區域名稱一覽의 태천군 북면은 12년 1월 이후 13년말 사이의 어느 시점에서 강동면과 강서면으로 나뉜 것으로 보이나 분명한 시점은 확인되지 않는다. 일단 편의상 1913년 1월 1일 시�\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"10/579\",\n  \"work_date\": \"20220802\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1910,
    "validTo": 1912,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
