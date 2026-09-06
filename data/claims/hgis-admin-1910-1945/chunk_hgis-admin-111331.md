---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-111331"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-111331-boundary",
    "subject": "place-hgis-admin-111331",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-111331"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-111331",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第111號(1913-12-29);全羅南道令第2號(1914-03-02);朝鮮總督府令第173號(1914-12-22);新舊對照朝鮮全道府郡面里洞名稱一覽(1917)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 3483,\n  \"fullname\": \"전라남도/광양군/골약면\",\n  \"fullname_c\": \"全羅南道/光陽郡/骨若面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 111331,\n  \"key\": \"5/164/1651\",\n  \"lv\": 3,\n  \"name\": \"골약면\",\n  \"name_cn\": \"骨若面\",\n  \"reference\": \"\\t1914년 3월 1일 기존 광양군과 돌산군 태인면(묘도 제외)이 광양군으로 통합되었다(부령111호). 4월 1일 새 광양군 내 면의 구획, 명칭이 정해졌다(전남도령2호). 15년 5월 1일 광양 다압면 섬진리 ��\",\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"5/164\",\n  \"work_date\": \"20220728\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
