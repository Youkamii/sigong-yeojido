---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-2283"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-2283-boundary",
    "subject": "place-hgis-admin-2283",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-2283"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-2283",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);朝鮮總督府京畿道令第3號(1914-03-13);朝鮮總督府京畿道告示第58號(1915-10-28);朝鮮總督府令第113號(1915-11-11)\",\n  \"fid\": 1221,\n  \"fullname\": \"경기도/영평군/읍내면\",\n  \"fullname_c\": \"京畿道/永平郡/邑內面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 2283,\n  \"key\": \"2/37/560\",\n  \"lv\": 3,\n  \"name\": \"읍내면\",\n  \"name_cn\": \"邑內面\",\n  \"reference\": \"14년 행정구역 개편 당시 영평군은, 14년 3월 1일 포천군으로 전체 통합된 후(부령111호) 4월 1일 신규 포천군의 면의 구획과 명칭이 정비되었다(도령3호). 이후 15년 10월 28일 신규 포천군 전체 동��\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"2/37\",\n  \"work_date\": \"20201231\",\n  \"worker\": \"2020국편GIS사업팀\"\n}",
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
