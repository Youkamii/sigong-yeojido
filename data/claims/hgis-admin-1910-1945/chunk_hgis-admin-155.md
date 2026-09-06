---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-155"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-155-boundary",
    "subject": "place-hgis-admin-155",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-155"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-155",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19120801\",\n  \"begin_sour\": \"朝鮮總督府令第130號(1912-07-17);朝鮮總督府京畿道告示第32號(1912-07-31)\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);京畿道令第3號(1914-03-13);京畿道告示第63號(1914-11-20);京畿道告示第28號(1917-06-15)\",\n  \"fid\": 868,\n  \"fullname\": \"경기도/부평군\",\n  \"fullname_c\": \"京畿道/富平郡\",\n  \"geom_ref\": \"추정\",\n  \"id\": 155,\n  \"key\": \"2/25\",\n  \"lv\": 2,\n  \"name\": \"부평군\",\n  \"name_cn\": \"富平郡\",\n  \"reference\": \"1912년 8월 1일 장군소면 신정리로 통합되어 있던 前천신리 및 신기리의 後坪이 부평 수탄면 개봉리로 편입;1914년 3월 1일부터 시행된 행정구역 개편과 관련된 일련의 변경 사항은 19140301을 시작\",\n  \"trust\": 4,\n  \"type\": \"郡\",\n  \"up_key\": \"2\",\n  \"work_date\": \"20201231\",\n  \"worker\": \"2020국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1912,
    "validTo": 1914,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
