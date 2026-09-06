---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-3560"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-3560-boundary",
    "subject": "place-hgis-admin-3560",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-3560"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-3560",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);京畿道令第3號(1914-03-13);京畿道告示第10號(1914-04-01);朝鮮總督府令第113號(1914-07-13);京畿道告示第32號(1915-06-28)\",\n  \"fid\": 652,\n  \"fullname\": \"경기도/개성군/중서면\",\n  \"fullname_c\": \"京畿道/開城郡/中西面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 3560,\n  \"key\": \"2/8/67\",\n  \"lv\": 3,\n  \"name\": \"중서면\",\n  \"name_cn\": \"中西面\",\n  \"reference\": \"1914년 3월 1일 기존 개성군과 풍덕군이 개성군으로 통합되었다(부령111호). 4월 1일 새 개성군 내  면의  구획, 명칭이 정해지고(도령3호) 개성군 송도면 내 동리의 구획, 명칭이 정해졌다(고시10호\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"2/8\",\n  \"work_date\": \"20201231\",\n  \"worker\": \"2020국편GIS사업팀\"\n}",
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
