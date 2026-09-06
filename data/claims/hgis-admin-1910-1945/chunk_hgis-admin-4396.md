---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-4396"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-4396-boundary",
    "subject": "place-hgis-admin-4396",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-4396"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-4396",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第111號(1913-12-29);京畿道令第1號(1914-01-30);京畿道令第3號(1914-03-13);京畿道告示第7號(1914-04-01)\",\n  \"end\": \"19360331\",\n  \"end_source\": \"朝鮮總督府令第8號(1936-02-14);朝鮮總督府京畿道吿示第32號(1936-03-23)\",\n  \"fid\": 683,\n  \"fullname\": \"경기도/경성부\",\n  \"fullname_c\": \"京畿道/京城府\",\n  \"geom_ref\": \"기호\",\n  \"id\": 4396,\n  \"key\": \"2/10\",\n  \"lv\": 2,\n  \"name\": \"경성부\",\n  \"name_cn\": \"京城府\",\n  \"reference\": \"1914년 3월 1일 기존 경성부 중 동부, 남부, 북부, 중부 전체와 서부, 용산면, 숭신면의 다수 지역(고양군으로 편입되지 않은 지역)과 인창면 내 장거리 등 일부 동리, 한지면 내 전생동 등 일부 동\",\n  \"trust\": 1,\n  \"type\": \"府\",\n  \"up_key\": \"2\",\n  \"work_date\": \"20201231\",\n  \"worker\": \"2020국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1914,
    "validTo": 1936,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
