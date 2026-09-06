---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-142971"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-142971-boundary",
    "subject": "place-hgis-admin-142971",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-142971"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-142971",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19180401\",\n  \"begin_sour\": \"面ノ區域變更ニ關スル件(1918-04-10, 面에 關한 書類綴 국가기록원 CJA0002577);面有財産處分認可ノ件(1918-08-13, 面에 關한 書類綴 국가기록원 CJA0002577)\",\n  \"end\": \"19350228\",\n  \"end_source\": \"平安北道令第1號(1935-02-02)\",\n  \"fid\": 7249,\n  \"fullname\": \"평안북도/철산군/부서면\",\n  \"fullname_c\": \"平安北道/鐵山郡/扶西面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 142971,\n  \"key\": \"10/577/7318\",\n  \"lv\": 3,\n  \"name\": \"부서면\",\n  \"name_cn\": \"扶西面\",\n  \"reference\": \"18년 4월 1일 철산군 부서면 서부동을 철산면(고성면)으로 편입.\",\n  \"trust\": 4,\n  \"type\": \"面\",\n  \"up_key\": \"10/577\",\n  \"work_date\": \"20220803\",\n  \"worker\": \"2022국편GIS담당\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1918,
    "validTo": 1935,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
