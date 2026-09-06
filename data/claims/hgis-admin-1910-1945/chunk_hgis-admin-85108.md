---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-85108"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-85108-boundary",
    "subject": "place-hgis-admin-85108",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-85108"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-85108",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19101001\",\n  \"begin_sour\": \"朝鮮總督府令第7號(1910-10-01)\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);咸鏡北道告示第5號(1914-03-13);咸鏡北道令第1號(1914-03-18);朝鮮總督府令第131號(1914-08-29);咸鏡北道告示第42號(1914-12-02)\",\n  \"fid\": 8125,\n  \"fullname\": \"함경북도/청진부\",\n  \"fullname_c\": \"咸鏡北道/淸津府\",\n  \"geom_ref\": \"추정\",\n  \"id\": 85108,\n  \"key\": \"13/495\",\n  \"lv\": 2,\n  \"name\": \"청진부\",\n  \"name_cn\": \"淸津府\",\n  \"reference\": \"10년 10월 1일 부령군에서 이름을 바꾼 청진부는 14년 3월 1일 청진부와 부령군으로 나뉘었다. 청하면의 일부 동리가 청진부로 설정되고 나머지 지역은 부령군으로 설정되었다(부령111호).  14년 3�\",\n  \"trust\": 2,\n  \"type\": \"府\",\n  \"up_key\": \"13\",\n  \"work_date\": \"20220627\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
