---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-84990"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-84990-boundary",
    "subject": "place-hgis-admin-84990",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-84990"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-84990",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19111231\",\n  \"end_source\": \"地方行政區域名稱一覽(1912)\",\n  \"fid\": 7981,\n  \"fullname\": \"함경북도/명천군/상우북사\",\n  \"fullname_c\": \"咸鏡北道/明川郡/上雩北社\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 84990,\n  \"key\": \"13/488/5360\",\n  \"lv\": 3,\n  \"name\": \"상우북사\",\n  \"name_cn\": \"上雩北社\",\n  \"reference\": \"民籍統計表(1910)에는 \\\"下雩北社\\\"로 표기되어 있으나 地方行政區域名稱一覽(1912)과 지도상의 위치로 보아 \\\"上雩北社\\\"의 오기로 보임\",\n  \"trust\": 2,\n  \"type\": \"社\",\n  \"up_key\": \"13/488\",\n  \"work_date\": \"20220627\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
