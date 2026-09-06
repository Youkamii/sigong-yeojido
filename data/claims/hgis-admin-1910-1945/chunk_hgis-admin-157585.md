---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-157585"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-157585-boundary",
    "subject": "place-hgis-admin-157585",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-157585"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-157585",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19111127\",\n  \"end_source\": \"慶尙北道令第11號(1911-11-28);慶尙北道告示第40號(1911-12-19)\",\n  \"fid\": 3217,\n  \"fullname\": \"경상북도/자인군/하남면\",\n  \"fullname_c\": \"慶尙北道/慈仁郡/下南面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 157585,\n  \"key\": \"4/618/8407\",\n  \"lv\": 3,\n  \"name\": \"하남면\",\n  \"name_cn\": \"下南面\",\n  \"reference\": \"11년 11월 28일 면 구역 정리(도령11호) 후 12월 19일 각 면 동리 정리(고시40호), 둘 모두 11년 11월 28일을 기준으로 삼음.\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"4/618\",\n  \"work_date\": \"20220926\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
