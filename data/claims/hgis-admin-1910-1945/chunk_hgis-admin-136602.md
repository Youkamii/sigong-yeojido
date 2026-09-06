---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-136602"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-136602-boundary",
    "subject": "place-hgis-admin-136602",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-136602"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-136602",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19180401\",\n  \"begin_sour\": \"面ノ名稱變更ノ件(1917-11-26, 面에 關한 書類綴 국가기록원 CJA0002577)\",\n  \"end\": \"19310331\",\n  \"end_source\": \"朝鮮總督府令第103號(1930-12-29)\",\n  \"fid\": 6771,\n  \"fullname\": \"평안북도/강계군/강계면\",\n  \"fullname_c\": \"平安北道/江界郡/江界面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 136602,\n  \"key\": \"10/559/7001\",\n  \"lv\": 3,\n  \"name\": \"강계면\",\n  \"name_cn\": \"江界面\",\n  \"reference\": \"18년 4월 1일 읍내면에서 강계면으로 명칭 변경\",\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"10/559\",\n  \"work_date\": \"20220802\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1918,
    "validTo": 1931,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
