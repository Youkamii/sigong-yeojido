---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-2720"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-2720-boundary",
    "subject": "place-hgis-admin-2720",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-2720"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-2720",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);朝鮮總督府京畿道令第3號(1914-03-13);朝鮮總督府忠淸北道令第2號(1914-03-09)\",\n  \"fid\": 1257,\n  \"fullname\": \"경기도/음죽군\",\n  \"fullname_c\": \"京畿道/陰竹郡\",\n  \"geom_ref\": \"추정\",\n  \"id\": 2720,\n  \"key\": \"2/38\",\n  \"lv\": 2,\n  \"name\": \"음죽군\",\n  \"name_cn\": \"陰竹郡\",\n  \"reference\": \"1914년 3월 1일부터 시행된 행정구역 개편과 관련된 일련의 변경 사항은 19140301을 시작 기준으로 본다\",\n  \"trust\": 2,\n  \"type\": \"郡\",\n  \"up_key\": \"2\",\n  \"work_date\": \"20201231\",\n  \"worker\": \"2020국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1910,
    "validTo": 1914,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
