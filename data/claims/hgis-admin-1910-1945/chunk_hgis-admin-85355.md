---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-85355"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-85355-boundary",
    "subject": "place-hgis-admin-85355",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-85355"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-85355",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);平安南道令第2號(1914-03-01);平安南道告示第59號(1915-10-19);平安南道告示第74號(1915-12-27)\",\n  \"fid\": 6654,\n  \"fullname\": \"평안남도/증산군/초곡면\",\n  \"fullname_c\": \"平安南道/甑山郡/草谷面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 85355,\n  \"key\": \"9/516/5895\",\n  \"lv\": 3,\n  \"name\": \"초곡면\",\n  \"name_cn\": \"草谷面\",\n  \"reference\": \"1914년 3월 1일 기존 증산군 중 진방면, 초곡면은 평원군으로, 나머지 지역은 강서군으로 편입되었다(부령111호). 4월 1일 새 평원군, 강서군 내 면의 구획, 명칭이 정해졌다(도령2호). 15년 12월 1일\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"9/516\",\n  \"work_date\": \"20220627\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
