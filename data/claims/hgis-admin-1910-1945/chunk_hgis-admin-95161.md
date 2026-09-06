---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-95161"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-95161-boundary",
    "subject": "place-hgis-admin-95161",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-95161"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-95161",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第111號(1913-12-29);全羅北道令第2號(1914-03-10);新舊對照朝鮮全道府郡面里洞名稱一覽(1917)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 4974,\n  \"fullname\": \"전라북도/진안군/상전면\",\n  \"fullname_c\": \"全羅北道/鎭安郡/上田面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 95161,\n  \"key\": \"6/169/1701\",\n  \"lv\": 3,\n  \"name\": \"상전면\",\n  \"name_cn\": \"上田面\",\n  \"reference\": \"1914년 3월 1일 기존 용담군과 진안군이 진안군으로 통합되었다(부령111호). 14년 4월 1일 새 진안군 내 면의 구획, 명칭이 정리되었다(도령2호). 전북의 경우 14년 행정구역 개편 당시 동리 개편에 �\",\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"6/169\",\n  \"work_date\": \"20220726\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
