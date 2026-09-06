---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-144228"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-144228-boundary",
    "subject": "place-hgis-admin-144228",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-144228"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-144228",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19180401\",\n  \"begin_sour\": \"朝鮮總督府職員錄 1919(한국사데이터베이스, https://db.history.go.kr/item/level.do?itemId=jw&types=1919-13-116-0796-00863);密陽地名攷(1994, 각읍면 항목) 참고\",\n  \"end\": \"19310331\",\n  \"end_source\": \"朝鮮總督府令第103號(1930-12-29)\",\n  \"fid\": 1746,\n  \"fullname\": \"경상남도/밀양군/밀양면\",\n  \"fullname_c\": \"慶尙南道/密陽郡/密陽面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 144228,\n  \"key\": \"3/107/7568\",\n  \"lv\": 3,\n  \"name\": \"밀양면\",\n  \"name_cn\": \"密陽面\",\n  \"reference\": \"18년 2월 이후 부내면이 밀양면으로, 천화산내·산외면이 각각 산내면, 산외면으로, 상서초동·이동면이 초동면, 이동면으로 변경된 것으로 보이나 근거 법령이 확인되지 않아 일단 18년 4월 1일\",\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"3/107\",\n  \"work_date\": \"20220907\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1918,
    "validTo": 1931,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
