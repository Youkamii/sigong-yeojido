---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-156869"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-156869-boundary",
    "subject": "place-hgis-admin-156869",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-156869"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-156869",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"慶尙北道令第2號(1912-10-15);慶尙北道告示第15號(1912-10-15);朝鮮總督府令第111號(1913-12-29);慶尙南道令第2號(1914-03-16)\",\n  \"fid\": 2507,\n  \"fullname\": \"경상북도/고령군/일량면\",\n  \"fullname_c\": \"慶尙北道/高靈郡/一良面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 156869,\n  \"key\": \"4/140/7993\",\n  \"lv\": 3,\n  \"name\": \"일량면\",\n  \"name_cn\": \"一良面\",\n  \"reference\": \"12년 10월 15일 고령군의 면과 동리의 정리가 이루어지고(도령2호, 고시15호) 14년 3월 1일 행정구역 개편 당시 기존 고령군이 고령군으로 유지되었다(부령111호). 14년 4월 1일 고령군 내 면의 구획,\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"4/140\",\n  \"work_date\": \"20220926\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
