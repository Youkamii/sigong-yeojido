---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-56726"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-56726-boundary",
    "subject": "place-hgis-admin-56726",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-56726"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-56726",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府黃海道告示第23號(1913-10-13);朝鮮總督府令第111號(1913-12-29);朝鮮總督府黃海道令第2號(1914-03-23);朝鮮總督府黃海道告示第11號(1914-03-30);正誤(1914-04-22, 4月8日朝鮮總督府黃海道告示第11號\",\n  \"fid\": 8821,\n  \"fullname\": \"황해도/해주군\",\n  \"fullname_c\": \"黃海道/海州郡\",\n  \"geom_ref\": \"추정\",\n  \"id\": 56726,\n  \"key\": \"14/456\",\n  \"lv\": 2,\n  \"name\": \"해주군\",\n  \"name_cn\": \"海州郡\",\n  \"reference\": \"해주군은 13년 10월 13일 주내면의 동리 명칭 변경(고시23호) 후 1914년 3월 1일 부령111호로 기본 구역이 설정되었고 이후 14년 4월 1일 면 정비(도령2호) 및 동리 일부 명칭 변경(고시11호), 14년 8월 5�\",\n  \"trust\": 2,\n  \"type\": \"郡\",\n  \"up_key\": \"14\",\n  \"work_date\": \"20210830\",\n  \"worker\": \"2021국편GIS사업팀\"\n}",
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
