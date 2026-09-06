---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-157387"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-157387-boundary",
    "subject": "place-hgis-admin-157387",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-157387"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-157387",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第111號(1913-12-29);慶尙南道令第2號(1914-03-16);慶尙北道告示第47號(1914-05-27);朝鮮總督府令第173號(1914-12-22)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 3156,\n  \"fullname\": \"경상북도/의성군/단촌면\",\n  \"fullname_c\": \"慶尙北道/義城郡/丹村面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 157387,\n  \"key\": \"4/118/1219\",\n  \"lv\": 3,\n  \"name\": \"단촌면\",\n  \"name_cn\": \"丹村面\",\n  \"reference\": \"14년 3월 1일 기존 의성과 비안(현서면 제외), 용궁군 신하면이 의성군으로 통합되었다(부령111호). 14년 4월 1일 새 의성군 내 면의 구획, 명칭이 정리되었다(도령2호). 14년 5월 27일 의성군 내 동리\",\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"4/118\",\n  \"work_date\": \"20220926\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1914,
    "validTo": 1945,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
