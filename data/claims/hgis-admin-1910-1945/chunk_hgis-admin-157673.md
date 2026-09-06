---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-157673"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-157673-boundary",
    "subject": "place-hgis-admin-157673",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-157673"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-157673",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第111號(1913-12-29);慶尙南道令第2號(1914-03-16);慶尙北道告示第52號(1914-06-15);新舊對照朝鮮全道府郡面里洞名稱一覽(1917)\",\n  \"end\": \"19150430\",\n  \"end_source\": \"朝鮮總督府令第44號(1915-05-01)\",\n  \"fid\": 3134,\n  \"fullname\": \"경상북도/울도군\",\n  \"fullname_c\": \"慶尙北道/鬱島郡\",\n  \"geom_ref\": \"기호\",\n  \"id\": 157673,\n  \"key\": \"4/614\",\n  \"lv\": 2,\n  \"name\": \"울도군\",\n  \"name_cn\": \"鬱島郡\",\n  \"reference\": \"14년 3월 1일 경남 울도군이 경북으로 이속되었고(부령111호) 4월 1일 면의 구획과 명칭이 정해지고(도령2호) 6월 15일 남면 장흥동이 서면 남양동으로 편입되었다(고시52호). 이를 14년 3월 1일 기준\",\n  \"trust\": 1,\n  \"type\": \"郡\",\n  \"up_key\": \"4\",\n  \"work_date\": \"20220926\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1914,
    "validTo": 1915,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
