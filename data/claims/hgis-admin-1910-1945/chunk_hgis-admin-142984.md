---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-142984"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-142984-boundary",
    "subject": "place-hgis-admin-142984",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-142984"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-142984",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"18830830\",\n  \"begin_sour\": \"仁川口日本租界條約(고종실록 1883-08-30, 1883-09-30)\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府告示第103號(在朝鮮各國居留地制度廢止,1914-04-01);朝鮮總督府令第111號(1913-12-29)\",\n  \"fid\": 1312,\n  \"fullname\": \"경기도/인천부/일본전관거류지\",\n  \"fullname_c\": \"京畿道/仁川府/日本專管居留地\",\n  \"geom_ref\": \"지명\",\n  \"id\": 142984,\n  \"key\": \"2/40/137\",\n  \"lv\": 3,\n  \"name\": \"일본전관거류지\",\n  \"name_cn\": \"日本專管居留地\",\n  \"reference\": \"조계 지역은 편의상 다음과 같이 처리한다. 1) 조계지역은 국내 행정구역이 아니나 편의상 면 단위로 취급하여 해당 지역 부군을 상위로 취급한다. 2) 거류지 폐지는 공식적으로는 14년 4월 1일��\",\n  \"trust\": 4,\n  \"type\": \"居留地\",\n  \"up_key\": \"2/40\",\n  \"work_date\": \"20220816\",\n  \"worker\": \"2022국편GIS담당\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1883,
    "validTo": 1914,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
