---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-92699"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-92699-boundary",
    "subject": "place-hgis-admin-92699",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-92699"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-92699",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第111號(1913-12-29);平安南道令第8號(1914-01-04);平安南道令第2號(1914-03-01);平安南道告示第68號(1915-11-04);平安南道告示第74號(1915-12-27)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 6166,\n  \"fullname\": \"평안남도/강서군/초리면\",\n  \"fullname_c\": \"平安南道/江西郡/草里面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 92699,\n  \"key\": \"9/499/5539\",\n  \"lv\": 3,\n  \"name\": \"초리면\",\n  \"name_cn\": \"草里面\",\n  \"reference\": \"1914년 3월 1일 기존 강서군과 증산군 중 진방면, 초곡면을 제외한 지역 그리고 평양부 금여대면 일부 동리를 강서군으로 통합하였다(부령111호). 3월 1일 평양부에서 편입된 지역의 소속 면이 정�\",\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"9/499\",\n  \"work_date\": \"20220627\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1914,
    "validTo": 1945,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
