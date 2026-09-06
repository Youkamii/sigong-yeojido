---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-1064"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-1064-boundary",
    "subject": "place-hgis-admin-1064",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-1064"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-1064",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府京畿道告示第31號(1912-07-29);朝鮮總督府令第111號(1913-12-29);朝鮮總督府京畿道令第3號(1914-03-13);朝鮮總督府京畿道告示第41號(1914-07-17)\",\n  \"fid\": 736,\n  \"fullname\": \"경기도/과천군/동면\",\n  \"fullname_c\": \"京畿道/果川郡/東面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 1064,\n  \"key\": \"2/12/106\",\n  \"lv\": 3,\n  \"name\": \"동면\",\n  \"name_cn\": \"東面\",\n  \"reference\": \"14년 행정구역 개편 당시 과천군의 경우, 12년 7월 29일 이미 관내 동리가 정비되고(고시31호) 14년 3월 1일 시흥군으로 통합되었다.(부령111호) 14년 4월 1일 면의 구역, 명칭이 설정된 후(도령3호) 동\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"2/12\",\n  \"work_date\": \"20201231\",\n  \"worker\": \"2020국편GIS사업팀\"\n}",
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
