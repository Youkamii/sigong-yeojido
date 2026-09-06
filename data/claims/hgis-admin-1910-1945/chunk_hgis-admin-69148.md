---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-69148"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-69148-boundary",
    "subject": "place-hgis-admin-69148",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-69148"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-69148",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第111號(1913-12-29);咸鏡南道令第4號(1914-03-05);咸鏡南道告示第9號(1914-03-14);咸鏡南道告示第28號(1915-11-20)\",\n  \"end\": \"19310331\",\n  \"end_source\": \"朝鮮總督府咸鏡南道令第3號(1931-03-05)\",\n  \"fid\": 7553,\n  \"fullname\": \"함경남도/삼수군/읍관면\",\n  \"fullname_c\": \"咸鏡南道/三水郡/邑館面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 69148,\n  \"key\": \"12/468/5060\",\n  \"lv\": 3,\n  \"name\": \"읍관면\",\n  \"name_cn\": \"邑館面\",\n  \"reference\": \"14년 3월 1일 기존 삼수군의 영역이 그대로 삼수군으로 설정되었다(부령111호). 4월 1일 삼수군 내 면의 구획, 명칭이 정리되고(도령4호) 3개 동리의 명칭이 변경되었다(고시9호). 15년 11월 20일 삼��\",\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"12/468\",\n  \"work_date\": \"20220627\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1914,
    "validTo": 1931,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
