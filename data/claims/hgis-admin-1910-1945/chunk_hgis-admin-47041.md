---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-47041"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-47041-boundary",
    "subject": "place-hgis-admin-47041",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-47041"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-47041",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);朝鮮總督府江原道令第2號(1914-03-11);朝鮮總督府江原道告示第50號(1916-07-17);江原道告示第50, 55號 正誤(1916-08-10)\",\n  \"fid\": 146,\n  \"fullname\": \"강원도/안협군\",\n  \"fullname_c\": \"江原道/安峽郡\",\n  \"geom_ref\": \"추정\",\n  \"id\": 47041,\n  \"key\": \"1/433\",\n  \"lv\": 2,\n  \"name\": \"안협군\",\n  \"name_cn\": \"安峽郡\",\n  \"reference\": \"14년 3월 1일 안협군이 이천군으로 통합되었다(부령111호). 14년 4월 1일 새 이천군 내 면의 구획, 명칭이 정해지고(도령2호) 16년 8월 1일 이천군 내 동리가 정비되었다(고시50호). 이 과정 전체를 14�\",\n  \"trust\": 2,\n  \"type\": \"郡\",\n  \"up_key\": \"1\",\n  \"work_date\": \"20210830\",\n  \"worker\": \"2021국편GIS사업팀\"\n}",
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
