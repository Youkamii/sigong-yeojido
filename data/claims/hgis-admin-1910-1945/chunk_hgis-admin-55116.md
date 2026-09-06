---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-55116"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-55116-boundary",
    "subject": "place-hgis-admin-55116",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-55116"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-55116",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19111231\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);朝鮮總督府江原道令第2號(1914-03-11);朝鮮總督府江原道告示第52號(1914-12-25)\",\n  \"fid\": 313,\n  \"fullname\": \"강원도/인제군/신내면\",\n  \"fullname_c\": \"江原道/麟蹄郡/新內面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 55116,\n  \"key\": \"1/68/4155\",\n  \"lv\": 3,\n  \"name\": \"신내면\",\n  \"name_cn\": \"新內面\",\n  \"reference\": null,\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"1/68\",\n  \"work_date\": \"20210830\",\n  \"worker\": \"2021국편GIS사업팀\"\n}",
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
