---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-5558"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-5558-boundary",
    "subject": "place-hgis-admin-5558",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-5558"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-5558",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19101001\",\n  \"begin_sour\": \"朝鮮總督府令第7號(1910-10-01);朝鮮總督府京畿道令第3號(1911-04-01)\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);京畿道令第1號(1914-01-30);京畿道令第3號(1914-03-13);京畿道告示第7號(1914-04-01);京畿道告示第54號(1915-10-28)\",\n  \"fid\": 694,\n  \"fullname\": \"경기도/경성부/서부\",\n  \"fullname_c\": \"京畿道/京城府/西部\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 5558,\n  \"key\": \"2/10/78\",\n  \"lv\": 3,\n  \"name\": \"서부\",\n  \"name_cn\": \"西部\",\n  \"reference\": \"1910-10-01 한성부를 경성부로 개칭 후 부와 면의 설정은 1911-04-01. 편의상 시작일을 1910-10-01로 설정;1914년 3월 1일 기존 경성부 중 동부, 남부, 북부, 중부 전체와 서부, 용산면, 숭신면의 다수 지역(\",\n  \"trust\": 2,\n  \"type\": \"部\",\n  \"up_key\": \"2/10\",\n  \"work_date\": \"20201231\",\n  \"worker\": \"2020국편GIS사업팀\"\n}",
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
