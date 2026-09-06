---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-144745"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-144745-boundary",
    "subject": "place-hgis-admin-144745",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-144745"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-144745",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第111號(1913-12-29);慶尙南道令第2號(1914-03-01);新舊對照朝鮮全道府郡面里洞名稱一覽\",\n  \"end\": \"19321231\",\n  \"end_source\": \"慶尙南道令第17號(1932-10-31)\",\n  \"fid\": 2329,\n  \"fullname\": \"경상남도/함안군/죽남면\",\n  \"fullname_c\": \"慶尙南道/咸安郡/竹南面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 144745,\n  \"key\": \"3/91/7896\",\n  \"lv\": 3,\n  \"name\": \"죽남면\",\n  \"name_cn\": \"竹南面\",\n  \"reference\": \"14년 3월 1일 기존 함안군 중 상봉, 하봉, 상사면은 진주로 편입되고 나머지 함안 전체와 영산군 길곡면 사촌리를 합하여 새로이 함안군이 설정되었다(부령111호). 4월 1일 새 함안군 내 면의 구획\",\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"3/91\",\n  \"work_date\": \"20220907\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
