---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-2621"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-2621-boundary",
    "subject": "place-hgis-admin-2621",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-2621"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-2621",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第111號(1913-12-29);朝鮮總督府京畿道令第3號(1914-03-13);朝鮮總督府京畿道告示第58號(1915-10-28);朝鮮總督府令第113號(1915-11-11)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 1460,\n  \"fullname\": \"경기도/포천군/가산면\",\n  \"fullname_c\": \"京畿道/抱川郡/加山面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 2621,\n  \"key\": \"2/48/694\",\n  \"lv\": 3,\n  \"name\": \"가산면\",\n  \"name_cn\": \"加山面\",\n  \"reference\": \"14년 행정구역 개편 당시 포천군은, 14년 3월 1일 기존 포천과 영평을 합하여 포천으로 설정된 후(부령111호) 4월 1일 신규 포천군의 면의 구획과 명칭이 정비되었다(도령3호). 이후 15년 10월 28일 ��\",\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"2/48\",\n  \"work_date\": \"20201231\",\n  \"worker\": \"2020국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1914,
    "validTo": 1945,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
