---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-94723"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-94723-boundary",
    "subject": "place-hgis-admin-94723",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-94723"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-94723",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"全羅北道金溝郡下西面都荘里洞第三統統表(1902-01);1912地方行政區域名稱一覽\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);全羅北道令第2號(1914-03-10);新舊對照朝鮮全道府郡面里洞名稱一覽(1917)\",\n  \"fid\": 4407,\n  \"fullname\": \"전라북도/금구군/하서면\",\n  \"fullname_c\": \"全羅北道/金溝郡/下西面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 94723,\n  \"key\": \"6/525/6064\",\n  \"lv\": 3,\n  \"name\": \"하서면\",\n  \"name_cn\": \"下西面\",\n  \"reference\": \"민적통계표 금구군 항목에는 下西面이 없음. 그러나 1902년 1월에 작성된 금구군 하서면 도장리의 統表가 있고, 이후 1912년 <지방행정구역명칭일람>에도 그 존재가 확인되기에 민적통계표의 오�\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"6/525\",\n  \"work_date\": \"20220726\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1910,
    "validTo": 1914,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
