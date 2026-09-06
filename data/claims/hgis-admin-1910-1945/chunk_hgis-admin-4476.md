---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-4476"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-4476-boundary",
    "subject": "place-hgis-admin-4476",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-4476"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-4476",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府京畿道告示第11號(1912-10-11);朝鮮總督府令第111號(1913-12-29);朝鮮總督府京畿道令第3號(1914-03-13);朝鮮總督府京畿道告示第52號(1914-10-19)\",\n  \"fid\": 1123,\n  \"fullname\": \"경기도/양천군/삼정면\",\n  \"fullname_c\": \"京畿道/陽川郡/三井面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 4476,\n  \"key\": \"2/36/552\",\n  \"lv\": 3,\n  \"name\": \"삼정면\",\n  \"name_cn\": \"三井面\",\n  \"reference\": \"14년 행정구역 개편 당시 양천군의 경우, 14년 3월 1일 통진군과 함께 김포군으로 통합되었다.(부령111호) 그런데 이미 동리 정비는, 12년 10월 11일(고시11호) 이루어졌다. 김포군으로 통합된 후 면,\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"2/36\",\n  \"work_date\": \"20201231\",\n  \"worker\": \"2020국편GIS사업팀\"\n}",
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
