---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-95070"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-95070-boundary",
    "subject": "place-hgis-admin-95070",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-95070"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-95070",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19300701\",\n  \"begin_sour\": \"全羅北道告示第119號(1930-06-26);全羅北道令第12號(1930-06-26)\",\n  \"end\": \"19350228\",\n  \"end_source\": \"朝鮮總督府令第6號(1935-01-26);全羅北道令第1號(1935-01-30)\",\n  \"fid\": 4870,\n  \"fullname\": \"전라북도/전주군/난전면\",\n  \"fullname_c\": \"全羅北道/全州郡/薍田面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 95070,\n  \"key\": \"6/536/6329\",\n  \"lv\": 3,\n  \"name\": \"난전면\",\n  \"name_cn\": \"薍田面\",\n  \"reference\": \"19300701에 全州郡 薍田面 일부가 全州郡 全州面으로 편입됨. 19350301에 면단위 전면 대개편이 이루어지며 소멸함\",\n  \"trust\": 4,\n  \"type\": \"面\",\n  \"up_key\": \"6/536\",\n  \"work_date\": \"20220726\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
