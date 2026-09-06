---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-55170"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-55170-boundary",
    "subject": "place-hgis-admin-55170",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-55170"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-55170",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);朝鮮總督府江原道令第2號(1914-03-11);朝鮮總督府令第113號(1915-11-11);朝鮮總督府江原道告示第50號(1915-12-01);朝鮮總督府江原道告示第52號(1915-12-25);朝鮮總督府江原道�\",\n  \"fid\": 359,\n  \"fullname\": \"강원도/춘천군\",\n  \"fullname_c\": \"江原道/春川郡\",\n  \"geom_ref\": \"추정\",\n  \"id\": 55170,\n  \"key\": \"1/3\",\n  \"lv\": 2,\n  \"name\": \"춘천군\",\n  \"name_cn\": \"春川郡\",\n  \"reference\": \"14년 3월 1일 기존 춘천군으로 새 춘천군의 영역이 정해지고(부령111호) 4월 1일 새 춘천군 내 면의 구획, 명칭이 정해졌다(도령2호).15년 12월 1일 포천 이동면 도평리 일부가 춘천 사내면 맹대리로\",\n  \"trust\": 2,\n  \"type\": \"郡\",\n  \"up_key\": \"1\",\n  \"work_date\": \"20210830\",\n  \"worker\": \"2021국편GIS사업팀\"\n}",
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
