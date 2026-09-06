---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-93203"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-93203-boundary",
    "subject": "place-hgis-admin-93203",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-93203"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-93203",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第111號(1913-12-29);平安南道令第2號(1914-03-01);平安南道告示第44號(1915-08-10);平安南道告示第38號(1917-05-12)\",\n  \"end\": \"19350228\",\n  \"end_source\": \"朝鮮總督府令第6號(1935-01-26);平安南道令第2號(1935-02-07)\",\n  \"fid\": 6174,\n  \"fullname\": \"평안남도/개천군\",\n  \"fullname_c\": \"平安南道/价川郡\",\n  \"geom_ref\": \"기호\",\n  \"id\": 93203,\n  \"key\": \"9/500\",\n  \"lv\": 2,\n  \"name\": \"개천군\",\n  \"name_cn\": \"价川郡\",\n  \"reference\": \"1914년 3월 1일 기존 개천군 내남면이 순천군으로 편입되고 나머지 지역은 개천군으로 설정되었다(부령111호). 4월 1일 개천군 내 면의 구획, 명칭이 정리되었다(도령2호). 15년 9월 1일 안주군과 경\",\n  \"trust\": 1,\n  \"type\": \"郡\",\n  \"up_key\": \"9\",\n  \"work_date\": \"20220627\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1914,
    "validTo": 1935,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
