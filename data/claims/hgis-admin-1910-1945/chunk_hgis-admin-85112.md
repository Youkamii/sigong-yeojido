---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-85112"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-85112-boundary",
    "subject": "place-hgis-admin-85112",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-85112"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-85112",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);咸鏡北道令第1號(1914-03-18);咸鏡北道告示第9號(1914-04-01);咸鏡北道告示第23號(1914-07-15)\",\n  \"fid\": 8147,\n  \"fullname\": \"함경북도/회령군\",\n  \"fullname_c\": \"咸鏡北道/會寧郡\",\n  \"geom_ref\": \"추정\",\n  \"id\": 85112,\n  \"key\": \"13/497\",\n  \"lv\": 2,\n  \"name\": \"회령군\",\n  \"name_cn\": \"會寧郡\",\n  \"reference\": \"14년 3월 1일 기존 회령군의 관해면은 부령군에 편입되고 나머지 지역은 회령군으로 설정되었다(부령111호). 14년 4월 1일 회령군 내 면의 구획, 명칭이 정해지고 회령면 내 동리의 구획, 명칭이 ��\",\n  \"trust\": 2,\n  \"type\": \"郡\",\n  \"up_key\": \"13\",\n  \"work_date\": \"20220627\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
