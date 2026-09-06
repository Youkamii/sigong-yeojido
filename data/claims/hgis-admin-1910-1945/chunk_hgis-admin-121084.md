---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-121084"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-121084-boundary",
    "subject": "place-hgis-admin-121084",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-121084"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-121084",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第111號(1913-12-29);全羅南道令第2號(1914-03-02);新舊對照朝鮮全道府郡面里洞名稱一覽(1917)\",\n  \"end\": \"19150430\",\n  \"end_source\": \"朝鮮總督府令第44號(1915-05-01)\",\n  \"fid\": 4125,\n  \"fullname\": \"전라남도/제주군/추자면\",\n  \"fullname_c\": \"全羅南道/濟州郡/楸子面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 121084,\n  \"key\": \"5/553/6866\",\n  \"lv\": 3,\n  \"name\": \"추자면\",\n  \"name_cn\": \"楸子面\",\n  \"reference\": null,\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"5/553\",\n  \"work_date\": \"20220728\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1914,
    "validTo": 1915,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
