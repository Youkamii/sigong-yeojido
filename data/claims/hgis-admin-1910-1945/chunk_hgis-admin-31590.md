---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-31590"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-31590-boundary",
    "subject": "place-hgis-admin-31590",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-31590"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-31590",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19111231\",\n  \"end_source\": \"地方行政區域名稱一覽(1912)\",\n  \"fid\": 5701,\n  \"fullname\": \"충청남도/홍주군/고남면\",\n  \"fullname_c\": \"忠淸南道/洪州郡/高南面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 31590,\n  \"key\": \"7/426/2799\",\n  \"lv\": 3,\n  \"name\": \"고남면\",\n  \"name_cn\": \"高南面\",\n  \"reference\": \"10년 민적통계표 자료까지만 확인 가능\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"7/426\",\n  \"work_date\": \"20210830\",\n  \"worker\": \"2021국편GIS사업팀\"\n}",
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
