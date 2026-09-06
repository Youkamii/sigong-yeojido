---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-18383"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-18383-boundary",
    "subject": "place-hgis-admin-18383",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-provinces-1910-1945.geojson#hgis-admin-18383"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-18383",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第30號(1912-11-08);朝鮮總督府令第111號(1913-12-29);朝鮮總督府忠淸北道令第2號(1914-04-01);朝鮮總督府令第113號(1914-07-13);朝鮮總督府令第42號(1915-05-01)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 5737,\n  \"fullname\": \"충청북도\",\n  \"fullname_c\": \"忠淸北道\",\n  \"geom_ref\": \"기호\",\n  \"id\": 18383,\n  \"key\": \"8\",\n  \"lv\": 1,\n  \"name\": \"충청북도\",\n  \"name_cn\": \"忠淸北道\",\n  \"reference\": \"14년 3월 1일 기준 전국적 행정구역 개편 이전 12년 12월 1일 충북 청주와 충남 연기 및 충북 문의와 충남 공주 사이의 경계 조정이 있었다(부령30호). 14년 3월 1일 충청북도 내 군의 구역과 명칭이\",\n  \"trust\": 1,\n  \"type\": \"道\",\n  \"up_key\": null,\n  \"work_date\": \"20211126\",\n  \"worker\": \"2020국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1914,
    "validTo": 1945,
    "generatedBy": "codex",
    "generatedAt": "2026-09-06",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
