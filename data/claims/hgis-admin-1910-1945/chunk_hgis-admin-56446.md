---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-56446"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-56446-boundary",
    "subject": "place-hgis-admin-56446",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-56446"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-56446",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);朝鮮總督府黃海道令第2號(1914-03-23);朝鮮總督府黃海道告示第43號(1916-08-23);正誤(1916-09-21, 8月29日朝鮮總督府黃海道告示第43號 同告示第44號 正誤)\",\n  \"fid\": 8905,\n  \"fullname\": \"황해도/황주군/덕수면\",\n  \"fullname_c\": \"黃海道/黃州郡/德水面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 56446,\n  \"key\": \"14/457/4874\",\n  \"lv\": 3,\n  \"name\": \"덕수면\",\n  \"name_cn\": \"德水面\",\n  \"reference\": \"황주군은 1914년 3월 1일 개편(부령111호) 이후 14년 4월 1일 면 정비(도령2호)를 거쳐 16년 9월 1일 동리 전체 정비가 마무리되었다. 이 과정 전체를 14년 3월 1일 행정구역 개편의 일환으로 취급한다.\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"14/457\",\n  \"work_date\": \"20210830\",\n  \"worker\": \"2021국편GIS사업팀\"\n}",
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
