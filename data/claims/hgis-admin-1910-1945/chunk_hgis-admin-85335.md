---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-85335"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-85335-boundary",
    "subject": "place-hgis-admin-85335",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-85335"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-85335",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"官報 제4694호(1910-06-02)\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);平安南道令第2號(1914-03-01);平安南道告示第50號(1917-06-21)\",\n  \"fid\": 6405,\n  \"fullname\": \"평안남도/순천군/산성면\",\n  \"fullname_c\": \"平安南道/順川郡/山城面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 85335,\n  \"key\": \"9/511/5768\",\n  \"lv\": 3,\n  \"name\": \"산성면\",\n  \"name_cn\": \"山城面\",\n  \"reference\": \"官報 제4694호(1910-06-02) \\\"鑛業 許可\\\"에 順川郡 山城面이 행정지명으로 확인됨\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"9/511\",\n  \"work_date\": \"20220627\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1910,
    "validTo": 1914,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
