---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-123901"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-123901-boundary",
    "subject": "place-hgis-admin-123901",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-123901"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-123901",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第111號(1913-12-29);全羅南道令第2號(1914-03-02);新舊對照朝鮮全道府郡面里洞名稱一覽(1917)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 4298,\n  \"fullname\": \"전라남도/화순군/춘양면\",\n  \"fullname_c\": \"全羅南道/和順郡/春陽面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 123901,\n  \"key\": \"5/143/1464\",\n  \"lv\": 3,\n  \"name\": \"춘양면\",\n  \"name_cn\": \"春陽面\",\n  \"reference\": \"1914년 3월 1일 기존 동복군, 능주군이 통합되어 화순군이 되었다(부령111호). 4월 1일 새 화순군 내 면의 구획, 명칭이 정해졌다(전남도령2호). 전남의 경우 14년 행정구역 개편 당시 동리 개편에 ��\",\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"5/143\",\n  \"work_date\": \"20220728\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
