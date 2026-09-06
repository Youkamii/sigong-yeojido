---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-56349"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-56349-boundary",
    "subject": "place-hgis-admin-56349",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-56349"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-56349",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);朝鮮總督府黃海道令第2號(1914-03-23);朝鮮總督府黃海道告示第11號(1914-03-30);朝鮮總督府令第113號(1914-07-13);朝鮮總督府黃海道告示第38號(1916-08-05);朝鮮總督府黃海道�\",\n  \"fid\": 8283,\n  \"fullname\": \"황해도/봉산군\",\n  \"fullname_c\": \"黃海道/鳳山郡\",\n  \"geom_ref\": \"추정\",\n  \"id\": 56349,\n  \"key\": \"14/442\",\n  \"lv\": 2,\n  \"name\": \"봉산군\",\n  \"name_cn\": \"鳳山郡\",\n  \"reference\": \"봉산군은 1914년 3월 1일 이후 14년 7월 무릉면의 평산군 편입(도령4호), 16년 8월 서흥, 평산, 봉산 간 동리 조정을 거쳐 16년 9월 1일 최종적으로 면과 동리의 구역 명칭이 확정되었다. 이 과정 전체\",\n  \"trust\": 2,\n  \"type\": \"郡\",\n  \"up_key\": \"14\",\n  \"work_date\": \"20210830\",\n  \"worker\": \"2021국편GIS사업팀\"\n}",
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
