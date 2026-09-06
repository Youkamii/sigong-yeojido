---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-144999"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-144999-boundary",
    "subject": "place-hgis-admin-144999",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-144999"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-144999",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第111號(1913-12-29);慶尙南道令第2號(1914-03-01);朝鮮總督府告示第103號(在朝鮮各國居留地制度廢止,1914-04-01);朝鮮總督府令第133號(1914-09-01);新舊對照朝鮮全道府郡面里洞名稱一覽\",\n  \"end\": \"19420930\",\n  \"end_source\": \"朝鮮總督府令第242號(1942-09-30);慶尙南道令第26號(1942-09-30)\",\n  \"fid\": 1718,\n  \"fullname\": \"경상남도/마산부\",\n  \"fullname_c\": \"慶尙南道/馬山府\",\n  \"geom_ref\": \"기호\",\n  \"id\": 144999,\n  \"key\": \"3/590\",\n  \"lv\": 2,\n  \"name\": \"마산부\",\n  \"name_cn\": \"馬山府\",\n  \"reference\": \"14년 3월 1일 기존 마산부 중 조계지역과 외서면 등을 합하여 새롭게 마산부가 설정되었다(부령111호). 4월 1일 고시로 거류지제도가 폐지되어 기존 거류지는 일반 행정구역으로서 마산부에 편입\",\n  \"trust\": 1,\n  \"type\": \"府\",\n  \"up_key\": \"3\",\n  \"work_date\": \"20220907\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1914,
    "validTo": 1942,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
