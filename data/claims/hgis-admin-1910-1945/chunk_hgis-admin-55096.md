---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-55096"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-55096-boundary",
    "subject": "place-hgis-admin-55096",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-55096"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-55096",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第111號(1913-12-29);朝鮮總督府江原道令第2號(1914-03-11);朝鮮總督府江原道告示第50號(1916-07-17);江原道告示第50, 55號 正誤(1916-08-10)\",\n  \"end\": \"19170331\",\n  \"end_source\": \"朝鮮總督府令第18號(1917-03-10);朝鮮總督府江原道令第4號(1917-03-20)\",\n  \"fid\": 270,\n  \"fullname\": \"강원도/이천군\",\n  \"fullname_c\": \"江原道/伊川郡\",\n  \"geom_ref\": \"기호\",\n  \"id\": 55096,\n  \"key\": \"1/435\",\n  \"lv\": 2,\n  \"name\": \"이천군\",\n  \"name_cn\": \"伊川郡\",\n  \"reference\": \"14년 3월 1일 이천, 안협군이 이천군으로 통합되었다(부령111호). 14년 4월 1일 새 이천군 내 면의 구획, 명칭이 정해지고(도령2호) 16년 8월 1일 이천군 내 동리가 정비되었다(고시50호). 이 과정 전��\",\n  \"trust\": 3,\n  \"type\": \"郡\",\n  \"up_key\": \"1\",\n  \"work_date\": \"20210830\",\n  \"worker\": \"2021국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1914,
    "validTo": 1917,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
