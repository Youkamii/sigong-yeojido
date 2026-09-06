---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-176305"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-176305-boundary",
    "subject": "place-hgis-admin-176305",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-176305"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-176305",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19120401\",\n  \"begin_sour\": \"朝鮮總督府令第35號(1912-03-22)\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第14號(1913-03-04);朝鮮總督府令第111號(1913-12-29);慶尙南道令第2號(1914-03-01);朝鮮總督府令第14號(1913-03-04);新舊對照朝鮮全道府郡面里洞名稱一覽\",\n  \"fid\": 1901,\n  \"fullname\": \"경상남도/양산군\",\n  \"fullname_c\": \"慶尙南道/梁山郡\",\n  \"geom_ref\": \"추정\",\n  \"id\": 176305,\n  \"key\": \"3/103\",\n  \"lv\": 2,\n  \"name\": \"양산군\",\n  \"name_cn\": \"梁山郡\",\n  \"reference\": \"梁山郡 外南面을 蔚山郡 外南面으로 편입\",\n  \"trust\": 2,\n  \"type\": \"郡\",\n  \"up_key\": \"3\",\n  \"work_date\": \"20220907\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1912,
    "validTo": 1914,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
