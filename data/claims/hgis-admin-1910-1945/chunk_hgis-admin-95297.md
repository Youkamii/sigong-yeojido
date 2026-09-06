---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-95297"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-95297-boundary",
    "subject": "place-hgis-admin-95297",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-95297"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-95297",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第111號(1913-12-29);朝鮮總督府告示第103號(在朝鮮各國居留地制度廢止,1914-04-01);新舊對照朝鮮全道府郡面里洞名稱一覽(1917)\",\n  \"end\": \"19320930\",\n  \"end_source\": \"朝鮮總督府令第92號(1932-09-24);全羅北道告示第180號(1932-09-29)\",\n  \"fid\": 4385,\n  \"fullname\": \"전라북도/군산부\",\n  \"fullname_c\": \"全羅北道/群山府\",\n  \"geom_ref\": \"기호\",\n  \"id\": 95297,\n  \"key\": \"6/523\",\n  \"lv\": 2,\n  \"name\": \"군산부\",\n  \"name_cn\": \"群山府\",\n  \"reference\": \"1914년 3월 1일 기존 군산부 중 북면의 일부 동리와 각국거류지가 새로이 군산부로 설정되었다(부령111호). 4월 1일 기존 군산의 각국거류지를 일반 행정구역으로 편입한다는 고시103호가 공표되��\",\n  \"trust\": 1,\n  \"type\": \"府\",\n  \"up_key\": \"6\",\n  \"work_date\": \"20220726\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
