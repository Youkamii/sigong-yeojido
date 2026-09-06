---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-45104"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-45104-boundary",
    "subject": "place-hgis-admin-45104",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-45104"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-45104",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19280815\",\n  \"begin_sour\": \"朝鮮總督府京畿道令第3號(1914-03-13);朝鮮總督府令第113號(1914-07-13);朝鮮總督府京畿道告示第10號(1914-04-01);朝鮮總督府京畿道告示第32號(1915-06-28)\",\n  \"end\": \"19300930\",\n  \"end_source\": \"朝鮮總督府令第68號(1930-09-11)\",\n  \"fid\": 651,\n  \"fullname\": \"경기도/개성군/중면\",\n  \"fullname_c\": \"京畿道/開城郡/中面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 45104,\n  \"key\": \"2/8/66\",\n  \"lv\": 3,\n  \"name\": \"중면\",\n  \"name_cn\": \"中面\",\n  \"reference\": \"개성 송도면을 개성부로 설치, 기존 개성군은 개풍군으로 변경\",\n  \"trust\": 4,\n  \"type\": \"面\",\n  \"up_key\": \"2/8\",\n  \"work_date\": \"20210820\",\n  \"worker\": \"2021국편GIS담당\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1928,
    "validTo": 1930,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
