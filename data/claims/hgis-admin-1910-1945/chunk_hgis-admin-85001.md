---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-85001"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-85001-boundary",
    "subject": "place-hgis-admin-85001",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-85001"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-85001",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第111號(1913-12-29);咸鏡北道令第1號(1914-03-18);咸鏡北道告示第23號(1914-07-15)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 8003,\n  \"fullname\": \"함경북도/무산군/삼사면\",\n  \"fullname_c\": \"咸鏡北道/茂山郡/三社面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 85001,\n  \"key\": \"13/489/5371\",\n  \"lv\": 3,\n  \"name\": \"삼사면\",\n  \"name_cn\": \"三社面\",\n  \"reference\": \"14년 3월 1일 기존 무산군의 영역이 그대로 무산군으로 설정되었다(부령111호). 14년 4월 1일 무산군 내 면의 구획, 명칭이 정해지고(도령1호) 7월 15일 동리의 구획, 명칭이 정해졌다(고시23호).  이\",\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"13/489\",\n  \"work_date\": \"20220627\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
