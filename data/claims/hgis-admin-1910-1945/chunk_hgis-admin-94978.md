---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-94978"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-94978-boundary",
    "subject": "place-hgis-admin-94978",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-94978"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-94978",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);全羅北道令第2號(1914-03-10);朝鮮總督府令第77號(1915-08-05);新舊對照朝鮮全道府郡面里洞名稱一覽(1917)\",\n  \"fid\": 4739,\n  \"fullname\": \"전라북도/운봉군/북하면\",\n  \"fullname_c\": \"全羅北道/雲峯郡/北下面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 94978,\n  \"key\": \"6/535/6275\",\n  \"lv\": 3,\n  \"name\": \"북하면\",\n  \"name_cn\": \"北下面\",\n  \"reference\": \"1914년 3월 1일 기존 운봉군이 남원군으로 통합되었다(부령111호). 14년 4월 1일 새 남원군 내 면의 구획, 명칭이 정리되었다(도령2호). 15년  9월 1일 산내면 실상리 일부(구 운봉 지역)가 경남 함양��\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"6/535\",\n  \"work_date\": \"20220726\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
