---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-157468"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-157468-boundary",
    "subject": "place-hgis-admin-157468",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-157468"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-157468",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);朝鮮總督府令第29號(1912-11-01);慶尙北道令第2號(1914-03-16);慶尙北道告示第80號(1914-08-05);慶尙北道告示第81號(1914-08-05)\",\n  \"fid\": 3268,\n  \"fullname\": \"경상북도/청도군/용산면\",\n  \"fullname_c\": \"慶尙北道/淸道郡/龍山面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 157468,\n  \"key\": \"4/117/8437\",\n  \"lv\": 3,\n  \"name\": \"용산면\",\n  \"name_cn\": \"龍山面\",\n  \"reference\": \"11년 11월 7일 청도군 내 면, 동리 구획, 명칭 변경;14년 3월 1일 행정구역 개편 당시 기존 청도군이 청도군으로 유지되었다(부령111호). 그 이전 12년 12월 1일 청도 외서면이 경남 밀양으로 편입되��\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"4/117\",\n  \"work_date\": \"20220926\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
