---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-85089"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-85089-boundary",
    "subject": "place-hgis-admin-85089",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-85089"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-85089",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第111號(1913-12-29);咸鏡北道令第1號(1914-03-18);咸鏡北道告示第40號(1914-11-18);新舊對照朝鮮全道府郡面里洞名稱一覽(1917)\",\n  \"end\": \"19410930\",\n  \"end_source\": \"朝鮮總督府令第252號(1941-09-29)\",\n  \"fid\": 8053,\n  \"fullname\": \"함경북도/성진군\",\n  \"fullname_c\": \"咸鏡北道/城津郡\",\n  \"geom_ref\": \"기호\",\n  \"id\": 85089,\n  \"key\": \"13/491\",\n  \"lv\": 2,\n  \"name\": \"성진군\",\n  \"name_cn\": \"城津郡\",\n  \"reference\": \"14년 3월 1일 성진항의 각국거류지를 포함하여 기존 성진군이 성진군으로 설정되었다(부령111호). 4월 1일 성진의 각국거류지를 일반 행정구역으로 편입하는 거류지제도 폐지가 고시되었다(고시\",\n  \"trust\": 1,\n  \"type\": \"郡\",\n  \"up_key\": \"13\",\n  \"work_date\": \"20220627\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1914,
    "validTo": 1941,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
