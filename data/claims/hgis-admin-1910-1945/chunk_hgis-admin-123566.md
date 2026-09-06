---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-123566"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-123566-boundary",
    "subject": "place-hgis-admin-123566",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-123566"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-123566",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);全羅南道令第2號(1914-03-02);朝鮮總督府令第14號(1915-03-16);新舊對照朝鮮全道府郡面里洞名稱一覽(1917)\",\n  \"fid\": 4264,\n  \"fullname\": \"전라남도/해남군/옥천시면\",\n  \"fullname_c\": \"全羅南道/海南郡/玉泉始面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 123566,\n  \"key\": \"5/144/6961\",\n  \"lv\": 3,\n  \"name\": \"옥천시면\",\n  \"name_cn\": \"玉泉始面\",\n  \"reference\": \"1914년 3월 1일 기존 해남군과 강진군의 백도면 월성리, 항리, 만수리, 좌일리, 금당리, 내봉리, 동리, 중산리, 방축리, 남촌리 그리고 완도군 보길면 삼마도가 해남군으로 통합되었다(부령111호).\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"5/144\",\n  \"work_date\": \"20220728\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
