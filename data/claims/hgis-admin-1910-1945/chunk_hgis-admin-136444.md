---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-136444"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-136444-boundary",
    "subject": "place-hgis-admin-136444",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-136444"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-136444",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19101001\",\n  \"begin_sour\": \"朝鮮總督府令第7號(1910-10-01)\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);平安北道令第5號(1914-03-13);朝鮮總督府令第113號(1914-07-13);新舊對照朝鮮全道府郡面里洞名稱一覽(1917)\",\n  \"fid\": 7024,\n  \"fullname\": \"평안북도/용천군/외하면\",\n  \"fullname_c\": \"平安北道/龍川郡/外下面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 136444,\n  \"key\": \"10/563/7091\",\n  \"lv\": 3,\n  \"name\": \"외하면\",\n  \"name_cn\": \"外下面\",\n  \"reference\": \"1914년 3월 1일 기존 용천군이 용천군으로 설정되었다(부령111호). 4월 1일 용천군 내 면의 구획, 명칭이 정리되고(도령5호) 8월 1일 용천군 부라면 원성동 수운도가 철산군으로 편입되었다(부령113�\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"10/563\",\n  \"work_date\": \"20220802\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
