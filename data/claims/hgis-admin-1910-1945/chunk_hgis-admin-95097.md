---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-95097"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-95097-boundary",
    "subject": "place-hgis-admin-95097",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-95097"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-95097",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19300701\",\n  \"begin_sour\": \"全羅北道告示第119號(1930-06-26);全羅北道令第12號(1930-06-26)\",\n  \"end\": \"19350930\",\n  \"end_source\": \"朝鮮總督府令第112號(1935-09-28);全羅北道令第34號(1935-10-01)\",\n  \"fid\": 4899,\n  \"fullname\": \"전라북도/전주군/이동면\",\n  \"fullname_c\": \"全羅北道/全州郡/伊東面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 95097,\n  \"key\": \"6/536/6352\",\n  \"lv\": 3,\n  \"name\": \"이동면\",\n  \"name_cn\": \"伊東面\",\n  \"reference\": \"19300701에 全州郡 伊東面 일부를 全州郡 全州面으로 편입함. 19351001에 全州郡을 完州郡으로 개편함\",\n  \"trust\": 4,\n  \"type\": \"面\",\n  \"up_key\": \"6/536\",\n  \"work_date\": \"20220726\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1930,
    "validTo": 1935,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
