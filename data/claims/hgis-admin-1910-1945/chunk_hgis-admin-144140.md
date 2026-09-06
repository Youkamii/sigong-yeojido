---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-144140"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-144140-boundary",
    "subject": "place-hgis-admin-144140",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-144140"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-144140",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);慶尙南道令第2號(1914-03-01);新舊對照朝鮮全道府郡面里洞名稱一覽\",\n  \"fid\": 1592,\n  \"fullname\": \"경상남도/곤양군/동부면\",\n  \"fullname_c\": \"慶尙南道/昆陽郡/東部面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 144140,\n  \"key\": \"3/583/7448\",\n  \"lv\": 3,\n  \"name\": \"동부면\",\n  \"name_cn\": \"東部面\",\n  \"reference\": \"14년 3월 1일 기존 사천과 곤양군 대부분, 진주 부화곡면, 뉴동면이 사천군으로 통합되었다(부령111호). 4월 1일 창녕군 내 면의 구획과 명칭이 정해졌다(도령2호). 이를 모두 14년 3월 1일 행정구역\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"3/583\",\n  \"work_date\": \"20220907\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
