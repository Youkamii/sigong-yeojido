---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-5177"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-5177-boundary",
    "subject": "place-hgis-admin-5177",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-5177"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-5177",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);京畿道令第3號(1914-03-13);京畿道告示第63號(1914-11-20);京畿道告示第28號(1917-06-15)\",\n  \"fid\": 869,\n  \"fullname\": \"경기도/부평군/군내면\",\n  \"fullname_c\": \"京畿道/富平郡/郡內面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 5177,\n  \"key\": \"2/25/300\",\n  \"lv\": 3,\n  \"name\": \"군내면\",\n  \"name_cn\": \"郡內面\",\n  \"reference\": \"1914년 3월 1일 기존 부평군은 부천군으로 편입되었다(부령111호). 4월 1일 새 부천군 내 면의 구획, 명칭이 정해졌다(도령3호). 11월 20일 새 부천군의 다주면 등의 동리 구획, 명칭이 정리되고(고시\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"2/25\",\n  \"work_date\": \"20201231\",\n  \"worker\": \"2020국편GIS사업팀\"\n}",
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
