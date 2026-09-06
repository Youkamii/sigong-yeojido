---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-117667"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-117667-boundary",
    "subject": "place-hgis-admin-117667",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-117667"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-117667",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第111號(1913-12-29);朝鮮總督府告示第103號(在朝鮮各國居留地制度廢止,1914-04-01);新舊對照朝鮮全道府郡面里洞名稱一覽(1917)\",\n  \"end\": \"19320930\",\n  \"end_source\": \"朝鮮總督府令第75號(1932-08-15)\",\n  \"fid\": 3734,\n  \"fullname\": \"전라남도/목포부\",\n  \"fullname_c\": \"全羅南道/木浦府\",\n  \"geom_ref\": \"기호\",\n  \"id\": 117667,\n  \"key\": \"5/550\",\n  \"lv\": 2,\n  \"name\": \"목포부\",\n  \"name_cn\": \"木浦府\",\n  \"reference\": \"1914년 3월 1일 기존 목포부 중 부내면 일부 동리와 목포각국거류지가 합하여 새 목포부가 되었다(부령111호). 전남의 경우 14년 행정구역 개편 당시 동리 개편에 관한 고시가 없어 동리 변경 내역\",\n  \"trust\": 1,\n  \"type\": \"府\",\n  \"up_key\": \"5\",\n  \"work_date\": \"20220728\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1914,
    "validTo": 1932,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
