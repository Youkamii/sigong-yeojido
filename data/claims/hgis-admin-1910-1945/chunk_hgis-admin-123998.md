---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-123998"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-123998-boundary",
    "subject": "place-hgis-admin-123998",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-123998"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-123998",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);全羅南道令第2號(1914-03-02);新舊對照朝鮮全道府郡面里洞名稱一覽(1917)\",\n  \"fid\": 4305,\n  \"fullname\": \"전라남도/흥양군/남서면\",\n  \"fullname_c\": \"全羅南道/興陽郡/南西面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 123998,\n  \"key\": \"5/557/6981\",\n  \"lv\": 3,\n  \"name\": \"남서면\",\n  \"name_cn\": \"南西面\",\n  \"reference\": \"1914년 3월 1일 기존 흥양군은 돌산군 금산면, 봉래면 및 옥정면 장도, 내백일리, 외백일리와 완도군 득량면과 함께 고흥군으로 통합되었다(부령111호). 4월 1일 새 고흥군 내 면의 구획, 명칭이 정\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"5/557\",\n  \"work_date\": \"20220728\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
