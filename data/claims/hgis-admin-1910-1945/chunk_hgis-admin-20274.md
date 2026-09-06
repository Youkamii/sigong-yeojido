---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-20274"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-20274-boundary",
    "subject": "place-hgis-admin-20274",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-20274"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-20274",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);朝鮮總督府忠淸北道令第2號(1914-04-01);朝鮮總督府忠淸北道告示第49號(1914-09-29);朝鮮總督府忠淸北道告示第65號(1914-12-29)\",\n  \"fid\": 5825,\n  \"fullname\": \"충청북도/연풍군\",\n  \"fullname_c\": \"忠淸北道/延豊郡\",\n  \"geom_ref\": \"추정\",\n  \"id\": 20274,\n  \"key\": \"8/235\",\n  \"lv\": 2,\n  \"name\": \"연풍군\",\n  \"name_cn\": \"延豊郡\",\n  \"reference\": \"14년 행정구역 개편 당시 연풍군은 괴산군으로 통합되었다(부령111호). 14년 4월 1일 새 괴산군 내 면의 구획, 명칭이 정해졌고(도령2호 ) 15년 1월 1일 괴산군 내 동리가 정비되었는데 이때 청주, ��\",\n  \"trust\": 2,\n  \"type\": \"郡\",\n  \"up_key\": \"8\",\n  \"work_date\": \"20211126\",\n  \"worker\": \"2020국편GIS사업팀\"\n}",
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
