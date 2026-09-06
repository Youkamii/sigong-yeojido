---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-6316"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-6316-boundary",
    "subject": "place-hgis-admin-6316",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-6316"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-6316",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第111號(1913-12-29);朝鮮總督府京畿道令第3號(1914-03-13);朝鮮總督府京畿道告示第52號(1914-10-19)朝鮮總督府京畿道告示第53號(1914-10-19);朝鮮總督府京畿道告示第54號(1915-10-28)\",\n  \"end\": \"19360331\",\n  \"end_source\": \"朝鮮總督府令第8號(1936-02-14);朝鮮總督府京畿道令第1號(1936-02-21)\",\n  \"fid\": 708,\n  \"fullname\": \"경기도/고양군\",\n  \"fullname_c\": \"京畿道/高陽郡\",\n  \"geom_ref\": \"기호\",\n  \"id\": 6316,\n  \"key\": \"2/11\",\n  \"lv\": 2,\n  \"name\": \"고양군\",\n  \"name_cn\": \"高陽郡\",\n  \"reference\": \"14년 행정구역 개편 당시 고양군의 경우, 14년 3월 1일 고양군 영역이 설정되고(부령111호) 14년 4월 1일 면의 구역, 명칭이 설정된 후(도령3호) 10월 19일 김포와 경계 동리 조정이 있은 후(고시52호,\",\n  \"trust\": 1,\n  \"type\": \"郡\",\n  \"up_key\": \"2\",\n  \"work_date\": \"20201231\",\n  \"worker\": \"2020국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1914,
    "validTo": 1936,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
