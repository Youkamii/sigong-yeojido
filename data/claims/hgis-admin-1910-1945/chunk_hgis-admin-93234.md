---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-93234"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-93234-boundary",
    "subject": "place-hgis-admin-93234",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-93234"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-93234",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"平安南道告示第33號(1913-09-12);朝鮮總督府令第111號(1913-12-29);平安南道告示第11號(1914-03-14);朝鮮總督府告示第103號(在朝鮮各國居留地制度廢止,1914-04-01)\",\n  \"end\": \"19380331\",\n  \"end_source\": \"朝鮮總督府令第36號(1938-03-30);平安南道令第8號(1938-03-30)\",\n  \"fid\": 6657,\n  \"fullname\": \"평안남도/진남포부\",\n  \"fullname_c\": \"平安南道/鎭南浦府\",\n  \"geom_ref\": \"기호\",\n  \"id\": 93234,\n  \"key\": \"9/517\",\n  \"lv\": 2,\n  \"name\": \"진남포부\",\n  \"name_cn\": \"鎭南浦府\",\n  \"reference\": \"1914년 3월 1일 기존 진남포부의 원당면 지역 일부와 각국거류지가 새 진남포부로 설정되었다(부령111호, 고시103호). 그 이전 13년 9월 20일 진남포항의 하역장 시가지가 항정이라는 이름의 새 동��\",\n  \"trust\": 1,\n  \"type\": \"府\",\n  \"up_key\": \"9\",\n  \"work_date\": \"20220627\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1914,
    "validTo": 1938,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
