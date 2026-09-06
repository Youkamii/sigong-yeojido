---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-121507"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-121507-boundary",
    "subject": "place-hgis-admin-121507",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-121507"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-121507",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);全羅南道令第2號(1914-03-02);全羅北道令第2號(1914-03-10);新舊對照朝鮮全道府郡面里洞名稱一覽(1917)\",\n  \"fid\": 4153,\n  \"fullname\": \"전라남도/지도군/기좌면\",\n  \"fullname_c\": \"全羅南道/智島郡/箕佐面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 121507,\n  \"key\": \"5/555/6892\",\n  \"lv\": 3,\n  \"name\": \"기좌면\",\n  \"name_cn\": \"箕佐面\",\n  \"reference\": \"1914년 3월 1일 기존 지도군 중 위도면, 낙월면은 영광군으로, 고군산면은 전북 옥구군으로, 나머지 지역은 무안군으로 편입되었다(부령111호). 4월 1일 새 영광군, 무안군, 옥구군 내 면의 구획, ��\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"5/555\",\n  \"work_date\": \"20220728\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
