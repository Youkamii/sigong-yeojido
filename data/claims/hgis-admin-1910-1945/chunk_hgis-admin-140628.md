---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-140628"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-140628-boundary",
    "subject": "place-hgis-admin-140628",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-140628"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-140628",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19410401\",\n  \"begin_sour\": \"朝鮮總督府令第84號(1941-03-26)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 7021,\n  \"fullname\": \"평안북도/용천군/양하면\",\n  \"fullname_c\": \"平安北道/龍川郡/楊下面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 140628,\n  \"key\": \"10/563/7089\",\n  \"lv\": 3,\n  \"name\": \"양하면\",\n  \"name_cn\": \"楊下面\",\n  \"reference\": \"41년 4월 1일 신의주부 확장에 따른 구역 조정 때 의주 고진면 대부분은 신의주에 편입되고 용하동, 미륵동, 연저동 각 일부가 용천군에 편입. 편입 후 소속 면이 법령에 확인되지 않아 해당 지��\",\n  \"trust\": 4,\n  \"type\": \"面\",\n  \"up_key\": \"10/563\",\n  \"work_date\": \"20220802\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1941,
    "validTo": 1945,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
