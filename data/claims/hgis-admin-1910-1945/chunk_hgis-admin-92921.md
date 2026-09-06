---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-92921"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-92921-boundary",
    "subject": "place-hgis-admin-92921",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-92921"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-92921",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第111號(1913-12-29);平安南道令第2號(1914-03-01);平安南道告示第68號(1917-08-28)\",\n  \"end\": \"19290331\",\n  \"end_source\": \"平安南道令第7號(1929-03-25)\",\n  \"fid\": 6505,\n  \"fullname\": \"평안남도/양덕군/화촌면\",\n  \"fullname_c\": \"平安南道/陽德郡/化村面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 92921,\n  \"key\": \"9/513/5838\",\n  \"lv\": 3,\n  \"name\": \"화촌면\",\n  \"name_cn\": \"化村面\",\n  \"reference\": \"1914년 3월 1일 기존 양덕군 중 대구면은 성천군으로 편입되고 나머지 지역이 양덕군으로 설정되었다(부령111호). 4월 1일 양덕군 내 면의 구획, 명칭이 정리되고(도령2호) 17년 10월 1일 양덕군 내 �\",\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"9/513\",\n  \"work_date\": \"20220627\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1914,
    "validTo": 1929,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
