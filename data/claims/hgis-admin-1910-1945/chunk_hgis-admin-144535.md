---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-144535"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-144535-boundary",
    "subject": "place-hgis-admin-144535",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-144535"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-144535",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第111號(1913-12-29);慶尙南道令第2號(1914-03-01);新舊對照朝鮮全道府郡面里洞名稱一覽\",\n  \"end\": \"19390930\",\n  \"end_source\": \"朝鮮總督府令第168號(1939-09-30)\",\n  \"fid\": 2075,\n  \"fullname\": \"경상남도/진주군/금곡면\",\n  \"fullname_c\": \"慶尙南道/晉州郡/金谷面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 144535,\n  \"key\": \"3/596/7739\",\n  \"lv\": 3,\n  \"name\": \"금곡면\",\n  \"name_cn\": \"金谷面\",\n  \"reference\": \"14년 3월 1일 기존 진주군(사천으로 편입된 부화곡면, 뉴동면 제외)과 함안군 상봉, 하봉, 상사면 진주군으로 통합되었다(부령111호). 4월 1일 새 진주군 내 면의 구획과 명칭이 정해졌다(도령2호).\",\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"3/596\",\n  \"work_date\": \"20220907\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1914,
    "validTo": 1939,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
