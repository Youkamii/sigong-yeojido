---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-136737"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-136737-boundary",
    "subject": "place-hgis-admin-136737",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-136737"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-136737",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第111號(1913-12-29);平安北道令第5號(1914-03-13);新舊對照朝鮮全道府郡面里洞名稱一覽(1917)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 7347,\n  \"fullname\": \"평안북도/희천군/동면\",\n  \"fullname_c\": \"平安北道/熙川郡/東面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 136737,\n  \"key\": \"10/581/7379\",\n  \"lv\": 3,\n  \"name\": \"동면\",\n  \"name_cn\": \"東面\",\n  \"reference\": \"1914년 3월 1일 기존 희천군이 희천군으로 설정되었다(부령111호). 4월 1일 희천군 내 면의 구획, 명칭이 정리되었다(도령5호). 평북의 경우 14년 행정구역 개편 당시 동리 개편에 관한 고시가 없어\",\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"10/581\",\n  \"work_date\": \"20220802\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
