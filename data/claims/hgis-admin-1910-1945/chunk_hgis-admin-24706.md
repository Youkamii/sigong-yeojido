---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-24706"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-24706-boundary",
    "subject": "place-hgis-admin-24706",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-24706"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-24706",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19321001\",\n  \"begin_sour\": \"朝鮮總督府令第102號(1932-10-01)\",\n  \"end\": \"19350930\",\n  \"end_source\": \"朝鮮總督府令第112號(1935-10-01)\",\n  \"fid\": 5190,\n  \"fullname\": \"충청남도/대전군/유천면\",\n  \"fullname_c\": \"忠淸南道/大田郡/柳川面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 24706,\n  \"key\": \"7/403/2431\",\n  \"lv\": 3,\n  \"name\": \"유천면\",\n  \"name_cn\": \"柳川面\",\n  \"reference\": null,\n  \"trust\": 4,\n  \"type\": \"面\",\n  \"up_key\": \"7/403\",\n  \"work_date\": \"20210830\",\n  \"worker\": \"2021국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1932,
    "validTo": 1935,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
