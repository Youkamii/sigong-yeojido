---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-69078"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-69078-boundary",
    "subject": "place-hgis-admin-69078",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-69078"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-69078",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19111231\",\n  \"end_source\": \"地方行政區域名稱一覽(1912)\",\n  \"fid\": 7473,\n  \"fullname\": \"함경남도/문천군/운림사\",\n  \"fullname_c\": \"咸鏡南道/文川郡/雲林社\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 69078,\n  \"key\": \"12/466/5000\",\n  \"lv\": 3,\n  \"name\": \"운림사\",\n  \"name_cn\": \"雲林社\",\n  \"reference\": null,\n  \"trust\": 2,\n  \"type\": \"社\",\n  \"up_key\": \"12/466\",\n  \"work_date\": \"20220627\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1910,
    "validTo": 1911,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
