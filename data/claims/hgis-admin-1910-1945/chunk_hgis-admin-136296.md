---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-136296"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-136296-boundary",
    "subject": "place-hgis-admin-136296",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-136296"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-136296",
    "quote": "{\n  \"alias\": \"曲河面\",\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);平安北道令第5號(1914-03-13);新舊對照朝鮮全道府郡面里洞名稱一覽(1917)\",\n  \"fid\": 6777,\n  \"fullname\": \"평안북도/강계군/곡하방\",\n  \"fullname_c\": \"平安北道/江界郡/曲河坊\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 136296,\n  \"key\": \"10/559/7006\",\n  \"lv\": 3,\n  \"name\": \"곡하방\",\n  \"name_cn\": \"曲河坊\",\n  \"reference\": \"1912지방행정구역명칭일람까지 曲河坊으로 명칭 확인되나 평안북도령제5호(1914-03-13)에는 曲河面으로 나타남. 曲河面 별칭 처리;1914년 3월 1일 기존 강계군이 강계군으로 설정되었다(부령111호).\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"10/559\",\n  \"work_date\": \"20220802\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
