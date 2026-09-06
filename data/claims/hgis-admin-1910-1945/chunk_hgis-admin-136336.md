---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-136336"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-136336-boundary",
    "subject": "place-hgis-admin-136336",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-136336"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-136336",
    "quote": "{\n  \"alias\": \"龍淵面\",\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);平安北道令第5號(1914-03-13);新舊對照朝鮮全道府郡面里洞名稱一覽(1917)\",\n  \"fid\": 6842,\n  \"fullname\": \"평안북도/구성군/용연면\",\n  \"fullname_c\": \"平安北道/龜城郡/龍延面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 136336,\n  \"key\": \"10/561/7043\",\n  \"lv\": 3,\n  \"name\": \"용연면\",\n  \"name_cn\": \"龍延面\",\n  \"reference\": \"1912지방행정구역일람의 면 명칭을 대표로 삼고 민적통계표의 면 명칭은 별칭 처리;1914년 3월 1일 기존 구성군이 구성군으로 설정되었다(부령111호). 4월 1일 구성군 내 면의 구획, 명칭이 정리되�\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"10/561\",\n  \"work_date\": \"20220802\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
