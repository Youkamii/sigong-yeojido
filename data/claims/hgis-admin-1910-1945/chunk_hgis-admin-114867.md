---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-114867"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-114867-boundary",
    "subject": "place-hgis-admin-114867",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-114867"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-114867",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);全羅南道令第2號(1914-03-02);新舊對照朝鮮全道府郡面里洞名稱一覽(1917)\",\n  \"fid\": 3888,\n  \"fullname\": \"전라남도/여수군\",\n  \"fullname_c\": \"全羅南道/麗水郡\",\n  \"geom_ref\": \"추정\",\n  \"id\": 114867,\n  \"key\": \"5/548\",\n  \"lv\": 2,\n  \"name\": \"여수군\",\n  \"name_cn\": \"麗水郡\",\n  \"reference\": \"1914년 3월 1일 기존 여수군 전체와 돌산군 중 두남면, 남면, 화개면, 삼산면, 옥정면(장도, 내백일리, 외백일리 제외)과 태인면 묘도가 여수군으로 통합되었다(부령111호). 4월 1일 새 여수군 내 면\",\n  \"trust\": 2,\n  \"type\": \"郡\",\n  \"up_key\": \"5\",\n  \"work_date\": \"20220728\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
