---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-147856"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-147856-boundary",
    "subject": "place-hgis-admin-147856",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-147856"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-147856",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19180101\",\n  \"begin_sour\": \"조선총독부직원록1919(한국사데이터베이스 jw_1919_1672_0190);매일신보(1918-11-28, 대한민국신문아카이브 CNTS-00094060893)\",\n  \"end\": \"19430930\",\n  \"end_source\": \"朝鮮總督府令第297號(1943-09-29)\",\n  \"fid\": 1685,\n  \"fullname\": \"경상남도/동래군/구포면\",\n  \"fullname_c\": \"慶尙南道/東萊郡/龜浦面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 147856,\n  \"key\": \"3/586/7493\",\n  \"lv\": 3,\n  \"name\": \"구포면\",\n  \"name_cn\": \"龜浦面\",\n  \"reference\": \"좌이면은 18년 무렵 구포면으로 변경되었으나 관련 법령은 확인되지 않는다. 19년도 직원록과 매일신보 기사를 통해 18년 중 구포면 출현은 확인되므로 편의상 18년 1월 1일을 변경 시점으로 한��\",\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"3/586\",\n  \"work_date\": \"20220907\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1918,
    "validTo": 1943,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
