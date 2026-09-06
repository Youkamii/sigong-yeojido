---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-156931"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-156931-boundary",
    "subject": "place-hgis-admin-156931",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-156931"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-156931",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第111號(1913-12-29);慶尙南道令第2號(1914-03-16);慶尙北道告示第82號(1914-08-05)\",\n  \"end\": \"19380930\",\n  \"end_source\": \"朝鮮總督府令第196號(1938-09-27);慶尙北道令第36號(1938-09-27)\",\n  \"fid\": 2578,\n  \"fullname\": \"경상북도/달성군/공산면\",\n  \"fullname_c\": \"慶尙北道/達城郡/公山面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 156931,\n  \"key\": \"4/136/1403\",\n  \"lv\": 3,\n  \"name\": \"공산면\",\n  \"name_cn\": \"公山面\",\n  \"reference\": \"14년 3월 1일 현풍군과 기존 대구부 중 대구면 제외 지역(단 대구면 신천, 신암동은 달성군 편입) 전체가 달성군으로 설정되었다(부령111호). 14년 4월 1일 새 달성군 내 면의 구획, 명칭이 정리되��\",\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"4/136\",\n  \"work_date\": \"20220926\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
