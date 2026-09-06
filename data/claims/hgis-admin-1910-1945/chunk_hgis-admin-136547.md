---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-136547"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-136547-boundary",
    "subject": "place-hgis-admin-136547",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-provinces-1910-1945.geojson#hgis-admin-136547"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-136547",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);平安北道令第5號(1914-03-13);朝鮮總督府令第113號(1914-07-13)\",\n  \"fid\": 6755,\n  \"fullname\": \"평안북도\",\n  \"fullname_c\": \"平安北道\",\n  \"geom_ref\": \"기호\",\n  \"id\": 136547,\n  \"key\": \"10\",\n  \"lv\": 1,\n  \"name\": \"평안북도\",\n  \"name_cn\": \"平安北道\",\n  \"reference\": \"전국 도와 부군의 명칭, 관할구역을 정한 부령 111호(1913-12-29)가 14년 3월 1일 시행되면서 평안북도와 관할 부군의 명칭, 구역이 새로 정해졌다. 4월 1일 평안북도 내 각 면의 명칭, 구역이 정해졌�\",\n  \"trust\": 2,\n  \"type\": \"道\",\n  \"up_key\": null,\n  \"work_date\": \"20220802\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1910,
    "validTo": 1914,
    "generatedBy": "codex",
    "generatedAt": "2026-09-06",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
