---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-144285"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-144285-boundary",
    "subject": "place-hgis-admin-144285",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-144285"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-144285",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19120801\",\n  \"begin_sour\": \"朝鮮總督府令第129號(1912-07-17)\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);慶尙南道令第2號(1914-03-01);新舊對照朝鮮全道府郡面里洞名稱一覽\",\n  \"fid\": 1803,\n  \"fullname\": \"경상남도/사천군/남양면\",\n  \"fullname_c\": \"慶尙南道/泗川郡/南陽面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 144285,\n  \"key\": \"3/106/7596\",\n  \"lv\": 3,\n  \"name\": \"남양면\",\n  \"name_cn\": \"南陽面\",\n  \"reference\": \"12년 8월 1일 고성군 남양면을 사천군으로 이속;14년 3월 1일 기존 사천과 곤양군 대부분, 진주 부화곡면, 뉴동면이 사천군으로 통합되었다(부령111호). 4월 1일 창녕군 내 면의 구획과 명칭이 정해\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"3/106\",\n  \"work_date\": \"20220907\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1912,
    "validTo": 1914,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
