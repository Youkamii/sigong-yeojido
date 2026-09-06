---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-10674"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-10674-boundary",
    "subject": "place-hgis-admin-10674",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-10674"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-10674",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);朝鮮總督府忠淸北道令第2號(1914-04-01);朝鮮總督府忠淸北道告示第13號(1915-04-08)\",\n  \"fid\": 5931,\n  \"fullname\": \"충청북도/제천군/동면\",\n  \"fullname_c\": \"忠淸北道/堤川郡/東面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 10674,\n  \"key\": \"8/206/2237\",\n  \"lv\": 3,\n  \"name\": \"동면\",\n  \"name_cn\": \"東面\",\n  \"reference\": \"14년 행정구역 개편 당시 제천, 청풍, 충주 덕산면이 제천군으로 통합되었다(부령111호). 14년 4월 1일 새 제천군 내 면의 구획, 명칭이 정해지고(도령2호) 15년 4월 8일 제천군 전체 동리가 정비되��\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"8/206\",\n  \"work_date\": \"20211126\",\n  \"worker\": \"2020국편GIS사업팀\"\n}",
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
