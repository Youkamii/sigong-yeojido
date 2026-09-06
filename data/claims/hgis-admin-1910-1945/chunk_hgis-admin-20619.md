---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-20619"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-20619-boundary",
    "subject": "place-hgis-admin-20619",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-20619"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-20619",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19321001\",\n  \"begin_sour\": \"朝鮮總督府令第102號(1932-10-01)\",\n  \"end\": \"19350930\",\n  \"end_source\": \"朝鮮總督府令第112號(09-28)\",\n  \"fid\": 5181,\n  \"fullname\": \"충청남도/대전군/대전읍\",\n  \"fullname_c\": \"忠淸南道/大田郡/大田邑\",\n  \"geom_ref\": \"기호\",\n  \"id\": 20619,\n  \"key\": \"7/403/2429\",\n  \"lv\": 3,\n  \"name\": \"대전읍\",\n  \"name_cn\": \"大田邑\",\n  \"reference\": \"32년 10월 1일 대전읍 구역 확장. 외남면, 유천면 지역 병합하였으나 병합된 동리의 새로운 동리명을 정한 고시는 확인되지 않는다. ;35년 10월 1일 대전읍이 대전부로 변경\",\n  \"trust\": 4,\n  \"type\": \"邑\",\n  \"up_key\": \"7/403\",\n  \"work_date\": \"20210830\",\n  \"worker\": \"2021국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1932,
    "validTo": 1935,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
