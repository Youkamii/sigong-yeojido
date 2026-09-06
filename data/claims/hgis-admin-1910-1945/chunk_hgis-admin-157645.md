---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-157645"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-157645-boundary",
    "subject": "place-hgis-admin-157645",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-157645"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-157645",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第111號(1913-12-29);慶尙南道令第2號(1914-03-16);朝鮮總督府令第173號(1914-12-22)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 2514,\n  \"fullname\": \"경상북도/군위군\",\n  \"fullname_c\": \"慶尙北道/軍威郡\",\n  \"geom_ref\": \"기호\",\n  \"id\": 157645,\n  \"key\": \"4/139\",\n  \"lv\": 2,\n  \"name\": \"군위군\",\n  \"name_cn\": \"軍威郡\",\n  \"reference\": \"14년 3월 1일 기존 의흥과 군위가 군위군으로 통합되었다(부령111호). 14년 4월 1일 새 군위군 내 면의 구획, 명칭이 정리되었다(도령2호). 15년 1월 1일 의성 소문면 용대리가 군위로 편입되었다. 이\",\n  \"trust\": 1,\n  \"type\": \"郡\",\n  \"up_key\": \"4\",\n  \"work_date\": \"20220926\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
