---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-92850"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-92850-boundary",
    "subject": "place-hgis-admin-92850",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-92850"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-92850",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第111號(1913-12-29);平安南道令第2號(1914-03-01);平安南道告示第50號(1917-06-21)\",\n  \"end\": \"19290331\",\n  \"end_source\": \"平安南道令第7號(1929-03-25)\",\n  \"fid\": 6429,\n  \"fullname\": \"평안남도/순천군/은산면\",\n  \"fullname_c\": \"平安南道/順川郡/殷山面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 92850,\n  \"key\": \"9/511/5786\",\n  \"lv\": 3,\n  \"name\": \"은산면\",\n  \"name_cn\": \"殷山面\",\n  \"reference\": \"1914년 3월 1일 기존 순천군과 개천군 내남면이 순천군으로 통합되었다(부령111호). 4월 1일 새 순천군 내 면의 구획, 명칭이 정해졌다(도령2호). 17년 8월 1일 순천군 내 전체 동리의 구획, 명칭이 ��\",\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"9/511\",\n  \"work_date\": \"20220627\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1914,
    "validTo": 1929,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
