---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-3800"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-3800-boundary",
    "subject": "place-hgis-admin-3800",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-3800"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-3800",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第111號(1913-12-29);朝鮮總督府京畿道令第3號(1914-03-13);朝鮮總督府令第113號(1914-07-13);朝鮮總督府京畿道令第8號(1914-07-31);朝鮮總督府京畿道告示第5號(1915-02-05)\",\n  \"end\": \"19380930\",\n  \"end_source\": \"朝鮮總督府令第196號(1938-09-27)\",\n  \"fid\": 1376,\n  \"fullname\": \"경기도/진위군\",\n  \"fullname_c\": \"京畿道/振威郡\",\n  \"geom_ref\": \"기호\",\n  \"id\": 3800,\n  \"key\": \"2/45\",\n  \"lv\": 2,\n  \"name\": \"진위군\",\n  \"name_cn\": \"振威郡\",\n  \"reference\": \"14년 행정구역 개편 당시 기존 진위군, 수원군 종덕면 등 15개면, 충남 평택군이 진위군으로 통합되었다(부령111호). 4월 1일 새 진위군 내 면의 구획, 명칭이 정리되었고(도령3호) 8월 1일 서면 노�\",\n  \"trust\": 1,\n  \"type\": \"郡\",\n  \"up_key\": \"2\",\n  \"work_date\": \"20201231\",\n  \"worker\": \"2020국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1914,
    "validTo": 1938,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
