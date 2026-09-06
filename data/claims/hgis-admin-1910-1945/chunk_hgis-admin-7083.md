---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-7083"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-7083-boundary",
    "subject": "place-hgis-admin-7083",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-7083"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-7083",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第111號(1913-12-29);朝鮮總督府京畿道令第3號(1914-03-13);朝鮮總督府京畿道告示第9號(1914-04-01);朝鮮總督府京畿道告示第4號(1915-01-29)\",\n  \"end\": \"19310331\",\n  \"end_source\": \"朝鮮總督府令第103號(1930-12-29)\",\n  \"fid\": 922,\n  \"fullname\": \"경기도/수원군/수원면\",\n  \"fullname_c\": \"京畿道/水原郡/水原面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 7083,\n  \"key\": \"2/27/351\",\n  \"lv\": 3,\n  \"name\": \"수원면\",\n  \"name_cn\": \"水原面\",\n  \"reference\": \"14년 행정구역 개편 당시 수원군의 경우, 14년 3월 1일 기존 수원군 대부분과 남양군 대부분, 광주군 일부와 안산군 일부를 합하여 새로운 수원군이 설정된 후(부령111호). 4월 1일 면의 구획과 명�\",\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"2/27\",\n  \"work_date\": \"20201231\",\n  \"worker\": \"2020국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1914,
    "validTo": 1931,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
