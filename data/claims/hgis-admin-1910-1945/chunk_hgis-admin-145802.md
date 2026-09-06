---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-145802"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-145802-boundary",
    "subject": "place-hgis-admin-145802",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-145802"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-145802",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19101001\",\n  \"begin_sour\": \"朝鮮總督府令第7號(1910-10-01)\",\n  \"end\": \"19120228\",\n  \"end_source\": \"매일신보(1911-12-28, 대한민국신문아카이브 CNTS-00093912902);朝鮮總督府告示第68號(1912-03-08) 참고\",\n  \"fid\": 1731,\n  \"fullname\": \"경상남도/마산부/웅서면\",\n  \"fullname_c\": \"慶尙南道/馬山府/熊西面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 145802,\n  \"key\": \"3/590/7559\",\n  \"lv\": 3,\n  \"name\": \"웅서면\",\n  \"name_cn\": \"熊西面\",\n  \"reference\": \"12년 1월과 3월 중순 사이에 웅중면과 웅서면 일부가 통합되어 진해면이 되었다. 정확한 일자가 확인되지 않아 편의상 12년 3월 1일로 설정한다.\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"3/590\",\n  \"work_date\": \"20220907\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1910,
    "validTo": 1912,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
