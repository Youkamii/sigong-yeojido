---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-85095"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-85095-boundary",
    "subject": "place-hgis-admin-85095",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-85095"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-85095",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第111號(1913-12-29);咸鏡北道令第1號(1914-03-18);咸鏡北道告示第23號(1914-07-15)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 8104,\n  \"fullname\": \"함경북도/종성군\",\n  \"fullname_c\": \"咸鏡北道/鍾城郡\",\n  \"geom_ref\": \"기호\",\n  \"id\": 85095,\n  \"key\": \"13/494\",\n  \"lv\": 2,\n  \"name\": \"종성군\",\n  \"name_cn\": \"鍾城郡\",\n  \"reference\": \"14년 3월 1일 기존 종성군의 풍해면은 경흥군에 편입되고 나머지 지역은 종성군으로 설정되었다(부령111호). 14년 4월 1일 종성군 내 면의 구획, 명칭이 정해지고(도령1호)  7월 15일 종성군 내 동리\",\n  \"trust\": 1,\n  \"type\": \"郡\",\n  \"up_key\": \"13\",\n  \"work_date\": \"20220627\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1914,
    "validTo": 1945,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
