---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-144654"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-144654-boundary",
    "subject": "place-hgis-admin-144654",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-144654"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-144654",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19180401\",\n  \"begin_sour\": \"朝鮮總督府職員錄 1919(한국사데이터베이스,jw_1919_1674_0250)  참고\",\n  \"end\": \"19420930\",\n  \"end_source\": \"朝鮮總督府令第242號(1942-09-30);慶尙南道令第26號(1942-09-30)\",\n  \"fid\": 2203,\n  \"fullname\": \"경상남도/창원군/창원면\",\n  \"fullname_c\": \"慶尙南道/昌原郡/昌原面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 144654,\n  \"key\": \"3/95/7813\",\n  \"lv\": 3,\n  \"name\": \"창원면\",\n  \"name_cn\": \"昌原面\",\n  \"reference\": \"18년 무렵 부내면이 창원면으로 이름이 바뀌었으나 관련 법령이 확인되지 않아 정확한 시기는 알 수 없다. 직원록 자료 등을 참고하여 편의상 18년 4월 1일로 추정하여 둔다.\",\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"3/95\",\n  \"work_date\": \"20220907\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1918,
    "validTo": 1942,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
