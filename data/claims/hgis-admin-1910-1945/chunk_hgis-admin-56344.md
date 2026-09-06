---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-56344"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-56344-boundary",
    "subject": "place-hgis-admin-56344",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-provinces-1910-1945.geojson#hgis-admin-56344"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-56344",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第6號(1910-10-01);朝鮮總督府令第7號(1910-10-01);朝鮮總督府令第111號(1913-12-29)\",\n  \"end\": \"19170331\",\n  \"end_source\": \"朝鮮總督府令第18號(1917-03-10);朝鮮總督府江原道令第4號(1917-03-20)\",\n  \"fid\": 8174,\n  \"fullname\": \"황해도\",\n  \"fullname_c\": \"黃海道\",\n  \"geom_ref\": \"기호\",\n  \"id\": 56344,\n  \"key\": \"14\",\n  \"lv\": 1,\n  \"name\": \"황해도\",\n  \"name_cn\": \"黃海道\",\n  \"reference\": \"전국 도와 부군의 명칭, 관할구역을 정한 부령 111호(1913-12-29)가 14년 3월 1일 시행되면서 황해도와 관할 부군의 명칭, 구역이 새로이 정해졌다.  14년 4월 1일 황해도 내  각 면의 명칭, 구역이 정��\",\n  \"trust\": 3,\n  \"type\": \"道\",\n  \"up_key\": null,\n  \"work_date\": \"20210830\",\n  \"worker\": \"2021국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1914,
    "validTo": 1917,
    "generatedBy": "codex",
    "generatedAt": "2026-09-06",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
