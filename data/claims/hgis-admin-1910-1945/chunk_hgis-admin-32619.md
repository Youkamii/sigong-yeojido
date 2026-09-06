---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-32619"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-32619-boundary",
    "subject": "place-hgis-admin-32619",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-32619"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-32619",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第85號(1912-04-17);朝鮮總督府令第111號(1913-12-29);朝鮮總督府忠淸南道令第3號(1914-03-16);正誤(1914-03-31,朝鮮總督府忠淸南道令第3號;忠淸南道告示第9號);正誤(1914-04-07,忠淸南道令第3號);\",\n  \"fid\": 5508,\n  \"fullname\": \"충청남도/은진군\",\n  \"fullname_c\": \"忠淸南道/恩津郡\",\n  \"geom_ref\": \"추정\",\n  \"id\": 32619,\n  \"key\": \"7/419\",\n  \"lv\": 2,\n  \"name\": \"은진군\",\n  \"name_cn\": \"恩津郡\",\n  \"reference\": \"14년 행정구역 개편 당시 은진군은, 연산, 노성 및 석성 일부와 통합되어 논산군이 되었다(부령111호). 그 이전 12년 4월 17일 전북 여산 북일면의 일부 동리가 은진 김포면으로 편입되었다(부령85�\",\n  \"trust\": 2,\n  \"type\": \"郡\",\n  \"up_key\": \"7\",\n  \"work_date\": \"20210830\",\n  \"worker\": \"2021국편GIS사업팀\"\n}",
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
