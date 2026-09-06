---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-55119"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-55119-boundary",
    "subject": "place-hgis-admin-55119",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-55119"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-55119",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第111號(1913-12-29);朝鮮總督府江原道令第2號(1914-03-11);江原道令第2號 正誤(1914-03-18);朝鮮總督府江原道告示第52號(1915-12-25)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 298,\n  \"fullname\": \"강원도/인제군\",\n  \"fullname_c\": \"江原道/麟蹄郡\",\n  \"geom_ref\": \"기호\",\n  \"id\": 55119,\n  \"key\": \"1/68\",\n  \"lv\": 2,\n  \"name\": \"인제군\",\n  \"name_cn\": \"麟蹄郡\",\n  \"reference\": \"14년 3월 1일 기존 인제군으로 새 인제군의 영역이 정해졌다(부령111호). 4월 1일 새 인제군 내 면의 구획, 명칭이 정해지고(도령2호) 16년 1월 1일 인제군 전체 동리의 구획과 명칭이 정리되었다(고\",\n  \"trust\": 1,\n  \"type\": \"郡\",\n  \"up_key\": \"1\",\n  \"work_date\": \"20210830\",\n  \"worker\": \"2021국편GIS사업팀\"\n}",
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
