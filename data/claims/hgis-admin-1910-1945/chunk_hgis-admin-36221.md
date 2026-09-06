---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-36221"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-36221-boundary",
    "subject": "place-hgis-admin-36221",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-36221"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-36221",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19111231\",\n  \"end_source\": \"地方行政區域名稱一覽(1912)\",\n  \"fid\": 5673,\n  \"fullname\": \"충청남도/해미군/하도면\",\n  \"fullname_c\": \"忠淸南道/海美郡/下道面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 36221,\n  \"key\": \"7/425/2791\",\n  \"lv\": 3,\n  \"name\": \"하도면\",\n  \"name_cn\": \"下道面\",\n  \"reference\": \"민적통계표의 상도면,하도면이 12년도 명칭일람에는 고북면으로 변경된 것이 확인되나 정확한 변경 시점은 법령 상 확인되지 않아 1912년 1월 1일을 기준으로 한다. [참고] 해미 고북면은 원래 ��\",\n  \"trust\": 4,\n  \"type\": \"面\",\n  \"up_key\": \"7/425\",\n  \"work_date\": \"20210830\",\n  \"worker\": \"2021국편GIS사업팀\"\n}",
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
