---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-92989"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-92989-boundary",
    "subject": "place-hgis-admin-92989",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-92989"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-92989",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);平安南道令第2號(1914-03-01);平安南道告示第67號(1915-11-04);平安南道告示第68號(1915-11-04)\",\n  \"fid\": 6589,\n  \"fullname\": \"평안남도/용강군/운동면\",\n  \"fullname_c\": \"平安南道/龍岡郡/雲洞面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 92989,\n  \"key\": \"9/504/5639\",\n  \"lv\": 3,\n  \"name\": \"운동면\",\n  \"name_cn\": \"雲洞面\",\n  \"reference\": \"1914년 3월 1일 기존 진남포부 중 원당면 일부 지역(새 진남포로 설정된 지역)을 제외한 지역과 기존 용강군이 용강군으로 통합되었다(부령111호). 4월 1일 용강군 내  면의  구획, 명칭이 정해지고\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"9/504\",\n  \"work_date\": \"20220627\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
