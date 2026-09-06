---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-94328"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-94328-boundary",
    "subject": "place-hgis-admin-94328",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-94328"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-94328",
    "quote": "{\n  \"alias\": \"陽所面\",\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);全羅北道令第2號(1914-03-10);朝鮮總督府令第63號(1915-06-16);新舊對照朝鮮全道府郡面里洞名稱一覽(1917)\",\n  \"fid\": 4884,\n  \"fullname\": \"전라북도/전주군/소양면\",\n  \"fullname_c\": \"全羅北道/全州郡/所陽面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 94328,\n  \"key\": \"6/536/6343\",\n  \"lv\": 3,\n  \"name\": \"소양면\",\n  \"name_cn\": \"所陽面\",\n  \"reference\": \"1912년 <지방행정구역명칭일람>에는 陽所面으로 기록되었음. 각 자료에서 이칭이 있을 경우 관찬서인 <지방행정구역명칭일람>을 따르도록 한 원칙이 있으나, 일제시기는 물론 현재(완주군 소양\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"6/536\",\n  \"work_date\": \"20220726\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
