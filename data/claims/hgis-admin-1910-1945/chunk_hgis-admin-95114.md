---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-95114"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-95114-boundary",
    "subject": "place-hgis-admin-95114",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-95114"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-95114",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19180418\",\n  \"begin_sour\": \"地方行政區域名稱臺帳(井邑郡,1925)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 4920,\n  \"fullname\": \"전라북도/정읍군/고부면\",\n  \"fullname_c\": \"全羅北道/井邑郡/古阜面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 95114,\n  \"key\": \"6/170/1721\",\n  \"lv\": 3,\n  \"name\": \"고부면\",\n  \"name_cn\": \"古阜面\",\n  \"reference\": \"1925년 <지방행정구역명칭대장> 정읍군편에 의하면, 大正 7年(1918) 4月 18日에 長文里의 소속이 永元面에서 古阜面으로 변경됨\",\n  \"trust\": 3,\n  \"type\": \"面\",\n  \"up_key\": \"6/170\",\n  \"work_date\": \"20220726\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
