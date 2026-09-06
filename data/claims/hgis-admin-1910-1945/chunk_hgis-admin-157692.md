---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-157692"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-157692-boundary",
    "subject": "place-hgis-admin-157692",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-provinces-1910-1945.geojson#hgis-admin-157692"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-157692",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第29號(1912-11-01);朝鮮總督府令第111號(1913-12-29);慶尙南道令第2號(1914-03-16);朝鮮總督府令第173號(1914-12-22);朝鮮總督府令第3號(1915-01-30)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 2418,\n  \"fullname\": \"경상북도\",\n  \"fullname_c\": \"慶尙北道\",\n  \"geom_ref\": \"기호\",\n  \"id\": 157692,\n  \"key\": \"4\",\n  \"lv\": 1,\n  \"name\": \"경상북도\",\n  \"name_cn\": \"慶尙北道\",\n  \"reference\": \"전국 도와 부군의 명칭, 관할구역을 정한 부령 111호(1913-12-29)가 14년 3월 1일 시행되면서 경상북도와 관할 부군의 명칭, 구역이 변경되었다. 그 이전 12년 12월 1일 경북 청도와 밀양 그리고 경북 �\",\n  \"trust\": 1,\n  \"type\": \"道\",\n  \"up_key\": null,\n  \"work_date\": \"20220926\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
