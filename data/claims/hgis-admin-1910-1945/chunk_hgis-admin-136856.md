---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-136856"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-136856-boundary",
    "subject": "place-hgis-admin-136856",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-136856"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-136856",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第111號(1913-12-29);平安北道令第5號(1914-03-13);朝鮮總督府令第113號(1914-07-13);新舊對照朝鮮全道府郡面里洞名稱一覽(1917)\",\n  \"end\": \"19430930\",\n  \"end_source\": \"朝鮮總督府令第296號(1943-09-29);平安北道令第23號(1943-09-29)\",\n  \"fid\": 6930,\n  \"fullname\": \"평안북도/선천군\",\n  \"fullname_c\": \"平安北道/宣川郡\",\n  \"geom_ref\": \"기호\",\n  \"id\": 136856,\n  \"key\": \"10/568\",\n  \"lv\": 2,\n  \"name\": \"선천군\",\n  \"name_cn\": \"宣川郡\",\n  \"reference\": \"1914년 3월 1일 기존 곽산군 중 서면 직현리와 호암리 일부(동래강 서안), 남면 하단리 노도와 기존 선천군이 선천군으로 통합되었다(부령111호). 4월 1일 새 선천군 내 면의 구획, 명칭이 정리되고\",\n  \"trust\": 1,\n  \"type\": \"郡\",\n  \"up_key\": \"10\",\n  \"work_date\": \"20220802\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1914,
    "validTo": 1943,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
