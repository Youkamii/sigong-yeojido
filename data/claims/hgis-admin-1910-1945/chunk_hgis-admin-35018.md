---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-35018"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-35018-boundary",
    "subject": "place-hgis-admin-35018",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-provinces-1910-1945.geojson#hgis-admin-35018"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-35018",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第85號(1912-04-17);朝鮮總督府令第30號(1912-11-08);朝鮮總督府令第111號(1913-12-29);朝鮮總督府忠淸南道令第3號(1914-03-16);朝鮮總督府令第113號(1914-07-13);朝鮮總督府令第42號(1915-05-01);朝鮮�\",\n  \"fid\": 5030,\n  \"fullname\": \"충청남도\",\n  \"fullname_c\": \"忠淸南道\",\n  \"geom_ref\": \"추정\",\n  \"id\": 35018,\n  \"key\": \"7\",\n  \"lv\": 1,\n  \"name\": \"충청남도\",\n  \"name_cn\": \"忠淸南道\",\n  \"reference\": \"14년 3월 1일 기준 전국적 행정구역 개편 이전 12년 4월 17일 전북 여산과 충남 은진, 임천 사이의 경계 조정(부령85호), 12월 1일 충북 청주와 충남 연기 및 충북 문의와 충남 공주 사이의 경계 조정\",\n  \"trust\": 2,\n  \"type\": \"道\",\n  \"up_key\": null,\n  \"work_date\": \"20210830\",\n  \"worker\": \"2021국편GIS사업팀\"\n}",
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
