---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-1060"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-1060-boundary",
    "subject": "place-hgis-admin-1060",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-1060"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-1060",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第111號(1913-12-29);京畿道令第3號(1914-03-13);京畿道告示第57號(1915-10-28)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 584,\n  \"fullname\": \"경기도/가평군/하면\",\n  \"fullname_c\": \"京畿道/加平郡/下面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 1060,\n  \"key\": \"2/5/19\",\n  \"lv\": 3,\n  \"name\": \"하면\",\n  \"name_cn\": \"下面\",\n  \"reference\": \"1914년 3월 1일 기존 가평군이 가평군으로 설정되었다(부령111호). 4월 1일 새 가평군 내  면의  구획, 명칭이 정해지고(도령3호) 15년 10월 28일 가평군 내 동리의 구획, 명칭이 정해졌는데 이 때 양��\",\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"2/5\",\n  \"work_date\": \"20201231\",\n  \"worker\": \"2020국편GIS사업팀\"\n}",
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
