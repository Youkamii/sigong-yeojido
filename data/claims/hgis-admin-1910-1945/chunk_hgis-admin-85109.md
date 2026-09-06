---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-85109"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-85109-boundary",
    "subject": "place-hgis-admin-85109",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-85109"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-85109",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第111號(1913-12-29);咸鏡北道告示第5號(1914-03-13);朝鮮總督府令第131號(1914-08-29);咸鏡北道告示第42號(1914-12-02)\",\n  \"end\": \"19340331\",\n  \"end_source\": \"朝鮮總督府令第27號(1934-03-28);咸鏡北道吿示第38號(1934-03-31)\",\n  \"fid\": 8126,\n  \"fullname\": \"함경북도/청진부\",\n  \"fullname_c\": \"咸鏡北道/淸津府\",\n  \"geom_ref\": \"기호\",\n  \"id\": 85109,\n  \"key\": \"13/495\",\n  \"lv\": 2,\n  \"name\": \"청진부\",\n  \"name_cn\": \"淸津府\",\n  \"reference\": \"14년 3월 1일 기존 청진부의 청하면 청진동과 신암동 일부가 새로 청진부로 설정되었다(부령111호).  14년 3월 13일 새로 설정된 청진부의 동리가 일본식으로 변경되었고(고시5호) 9월 1일 부령군 ��\",\n  \"trust\": 1,\n  \"type\": \"府\",\n  \"up_key\": \"13\",\n  \"work_date\": \"20220627\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1914,
    "validTo": 1934,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
