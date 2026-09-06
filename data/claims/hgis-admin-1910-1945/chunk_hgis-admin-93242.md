---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-93242"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-93242-boundary",
    "subject": "place-hgis-admin-93242",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-93242"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-93242",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第111號(1913-12-29);平安南道令第2號(1914-03-01);平安南道告示第43號(1915-08-10);平安南道告示第59號(1915-10-19)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 6733,\n  \"fullname\": \"평안남도/평원군\",\n  \"fullname_c\": \"平安南道/平原郡\",\n  \"geom_ref\": \"기호\",\n  \"id\": 93242,\n  \"key\": \"9/520\",\n  \"lv\": 2,\n  \"name\": \"평원군\",\n  \"name_cn\": \"平原郡\",\n  \"reference\": \"1914년 3월 1일 기존 순안군, 숙천군, 영유군과 평양부 덕산면, 증산군 진방면, 초곡면이 평원군으로 통합되었다(부령111호). 4월 1일 새 평원군 내 면의 구획, 명칭이 정해졌다(도령2호). 15년 9월 1�\",\n  \"trust\": 1,\n  \"type\": \"郡\",\n  \"up_key\": \"9\",\n  \"work_date\": \"20220627\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
