---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-144633"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-144633-boundary",
    "subject": "place-hgis-admin-144633",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-144633"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-144633",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19180101\",\n  \"begin_sour\": \"창녕군지(2003,55)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 2180,\n  \"fullname\": \"경상남도/창녕군/창녕면\",\n  \"fullname_c\": \"慶尙南道/昌寧郡/昌寧面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 144633,\n  \"key\": \"3/96/7804\",\n  \"lv\": 3,\n  \"name\": \"창녕면\",\n  \"name_cn\": \"昌寧面\",\n  \"reference\": \"18년 1월 창녕면 개칭 일자 명확하지 않아 편의상 1월 1일로 정리\",\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"3/96\",\n  \"work_date\": \"20220907\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1918,
    "validTo": 1945,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
