---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-85433"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-85433-boundary",
    "subject": "place-hgis-admin-85433",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-provinces-1910-1945.geojson#hgis-admin-85433"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-85433",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第111號(1913-12-29);平安南道令第8號(1914-01-04);平安南道令第2號(1914-03-01);朝鮮總督府告示第103號(在朝鮮各國居留地制度廢止,1914-04-01)\",\n  \"end\": \"19191031\",\n  \"end_source\": \"朝鮮總督府令第160號(1919-10-04);平安南道令第14號(1919-10-08)\",\n  \"fid\": 6107,\n  \"fullname\": \"평안남도\",\n  \"fullname_c\": \"平安南道\",\n  \"geom_ref\": \"기호\",\n  \"id\": 85433,\n  \"key\": \"9\",\n  \"lv\": 1,\n  \"name\": \"평안남도\",\n  \"name_cn\": \"平安南道\",\n  \"reference\": \"전국 도와 부군의 명칭, 관할구역을 정한 부령 111호(1913-12-29)가 14년 3월 1일 시행되면서 평안남도와 관할 부군의 명칭, 구역이 새로이 정해졌다. 14년 3월 1일 부령111호로 소속이 바뀐 일부 동리�\",\n  \"trust\": 4,\n  \"type\": \"道\",\n  \"up_key\": null,\n  \"work_date\": \"20220627\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1914,
    "validTo": 1919,
    "generatedBy": "codex",
    "generatedAt": "2026-09-06",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
