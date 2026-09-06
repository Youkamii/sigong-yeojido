---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-148815"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-148815-boundary",
    "subject": "place-hgis-admin-148815",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-148815"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-148815",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19360401\",\n  \"begin_sour\": \"朝鮮總督府令第8號(1936-02-14)\",\n  \"end\": \"19420930\",\n  \"end_source\": \"朝鮮總督府令第242號(1942-09-30);慶尙南道令第25號(1942-09-30)\",\n  \"fid\": 1695,\n  \"fullname\": \"경상남도/동래군/사하면\",\n  \"fullname_c\": \"慶尙南道/東萊郡/沙下面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 148815,\n  \"key\": \"3/586/7501\",\n  \"lv\": 3,\n  \"name\": \"사하면\",\n  \"name_cn\": \"沙下面\",\n  \"reference\": null,\n  \"trust\": 3,\n  \"type\": \"面\",\n  \"up_key\": \"3/586\",\n  \"work_date\": \"20220907\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1936,
    "validTo": 1942,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
