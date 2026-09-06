---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-144262"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-144262-boundary",
    "subject": "place-hgis-admin-144262",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-144262"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-144262",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19101001\",\n  \"begin_sour\": \"朝鮮總督府令第7號(1910-10-01)\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);慶尙南道令第2號(1914-03-01)\",\n  \"fid\": 1784,\n  \"fullname\": \"경상남도/부산부/동하면\",\n  \"fullname_c\": \"慶尙南道/釜山府/東下面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 144262,\n  \"key\": \"3/591/7582\",\n  \"lv\": 3,\n  \"name\": \"동하면\",\n  \"name_cn\": \"東下面\",\n  \"reference\": \"10년 10월 1일 동래부에서 이름을 바꾼 부산부는 14년 3월 1일 부산부와 동래군으로 나뉘었다(부령111호). 4월 1일 고시로 거류지제도가 폐지되어 기존 거류지는 일반 행정구역으로서 새 부산부에\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"3/591\",\n  \"work_date\": \"20220907\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
