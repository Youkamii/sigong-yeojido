---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-144037"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-144037-boundary",
    "subject": "place-hgis-admin-144037",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-144037"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-144037",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);慶尙北道令第2號(1914-03-16);慶尙北道告示第52號(1914-06-20)\",\n  \"fid\": 1955,\n  \"fullname\": \"경상남도/울도군/서면\",\n  \"fullname_c\": \"慶尙南道/鬱島郡/西面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 144037,\n  \"key\": \"3/595/7707\",\n  \"lv\": 3,\n  \"name\": \"서면\",\n  \"name_cn\": \"西面\",\n  \"reference\": \"14년 3월 1일 경남 울도군이 경북으로 이속되었고(부령111호) 4월 1일 면의 구획과 명칭이 정해지고(도령2호) 6월 15일 남면 장흥동이 서면 남양동으로 편입되었다(고시52호). 이를 14년 3월 1일 기준\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"3/595\",\n  \"work_date\": \"20220907\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
