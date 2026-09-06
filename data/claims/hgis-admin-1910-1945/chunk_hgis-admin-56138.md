---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-56138"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-56138-boundary",
    "subject": "place-hgis-admin-56138",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-provinces-1910-1945.geojson#hgis-admin-56138"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-56138",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29)\",\n  \"fid\": 1,\n  \"fullname\": \"강원도\",\n  \"fullname_c\": \"江原道\",\n  \"geom_ref\": \"추정\",\n  \"id\": 56138,\n  \"key\": \"1\",\n  \"lv\": 1,\n  \"name\": \"강원도\",\n  \"name_cn\": \"江原道\",\n  \"reference\": \"1914년 행정구역 대개편과 관련하여 법령 상 도 및 부군의 개편 시점은 1914년 3월 1일이나 실제로는 1913년부터 1917년에 걸쳐 도에서 동리 단위까지 세부적 정리가 이루어졌다. 자료 정리 및 활용�\",\n  \"trust\": 2,\n  \"type\": \"道\",\n  \"up_key\": null,\n  \"work_date\": \"20210830\",\n  \"worker\": \"2021국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1910,
    "validTo": 1914,
    "generatedBy": "codex",
    "generatedAt": "2026-09-06",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
