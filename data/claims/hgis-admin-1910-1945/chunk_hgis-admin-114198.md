---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-114198"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-114198-boundary",
    "subject": "place-hgis-admin-114198",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-114198"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-114198",
    "quote": "{\n  \"alias\": \"良知面\",\n  \"begin\": \"19171001\",\n  \"begin_sour\": \"面ノ名稱變更ノ件(1917-09-12, 面洞里名稱變更書類 국가기록원 CJA0002573)\",\n  \"end\": \"19290327\",\n  \"end_source\": \"全羅南道吿示第57號(1929-03-28)\",\n  \"fid\": 3636,\n  \"fullname\": \"전라남도/나주군/영산면\",\n  \"fullname_c\": \"全羅南道/羅州郡/榮山面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 114198,\n  \"key\": \"5/161/6610\",\n  \"lv\": 3,\n  \"name\": \"영산면\",\n  \"name_cn\": \"榮山面\",\n  \"reference\": null,\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"5/161\",\n  \"work_date\": \"20220728\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1917,
    "validTo": 1929,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
