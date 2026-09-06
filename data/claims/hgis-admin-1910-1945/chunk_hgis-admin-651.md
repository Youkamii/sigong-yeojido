---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-651"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-651-boundary",
    "subject": "place-hgis-admin-651",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-provinces-1910-1945.geojson#hgis-admin-651"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-651",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第111號(1913-12-29);京畿道令第1號(1914-01-30);京畿道令第3號(1914-03-13);朝鮮總督府告示第103號(在朝鮮各國居留地制度廢止,1914-04-01);朝鮮總督府令第113號(1914-07-13);朝鮮總督府令第133號(19\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 562,\n  \"fullname\": \"경기도\",\n  \"fullname_c\": \"京畿道\",\n  \"geom_ref\": \"기호\",\n  \"id\": 651,\n  \"key\": \"2\",\n  \"lv\": 1,\n  \"name\": \"경기도\",\n  \"name_cn\": \"京畿道\",\n  \"reference\": \"전국 도와 부군의 명칭, 관할구역을 정한 부령 111호(1913-12-29)가 14년 3월 1일 시행되면서 경기도와 관할 부군의 명칭, 구역이 새로이 정해졌다. 3월 1일 경성부, 인천부, 고양군, 음죽군의 동리가\",\n  \"trust\": 1,\n  \"type\": \"道\",\n  \"up_key\": null,\n  \"work_date\": \"20201231\",\n  \"worker\": \"2020국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1914,
    "validTo": 1945,
    "generatedBy": "codex",
    "generatedAt": "2026-09-06",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
