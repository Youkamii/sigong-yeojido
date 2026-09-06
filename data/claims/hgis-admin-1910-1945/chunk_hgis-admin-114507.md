---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-114507"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-114507-boundary",
    "subject": "place-hgis-admin-114507",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-114507"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-114507",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第111號(1913-12-29);全羅南道令第2號(1914-03-02);新舊對照朝鮮全道府郡面里洞名稱一覽(1917)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 3891,\n  \"fullname\": \"전라남도/여수군/남면\",\n  \"fullname_c\": \"全羅南道/麗水郡/南面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 114507,\n  \"key\": \"5/548/6622\",\n  \"lv\": 3,\n  \"name\": \"남면\",\n  \"name_cn\": \"南面\",\n  \"reference\": \"1914년 3월 1일 기존 여수군 전체와 돌산군 중 두남면, 남면, 화개면, 삼산면, 옥정면(장도, 내백일리, 외백일리 제외)과 태인면 묘도가 여수군으로 통합되었다(부령111호). 4월 1일 새 여수군 내 면\",\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"5/548\",\n  \"work_date\": \"20220728\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
