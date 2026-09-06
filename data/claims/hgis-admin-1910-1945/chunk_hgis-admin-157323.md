---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-157323"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-157323-boundary",
    "subject": "place-hgis-admin-157323",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-157323"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-157323",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);慶尙南道令第2號(1914-03-16);慶尙北道告示第79號(1914-07-25)\",\n  \"fid\": 3028,\n  \"fullname\": \"경상북도/영천군/권선면\",\n  \"fullname_c\": \"慶尙北道/榮川郡/權先面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 157323,\n  \"key\": \"4/613/8295\",\n  \"lv\": 3,\n  \"name\": \"권선면\",\n  \"name_cn\": \"權先面\",\n  \"reference\": \"14년 3월 1일 기존 榮川郡은 풍기군, 순흥군(화천면, 수민단면, 수식면 제외)과 함께 영주군으로 통합되었다(부령111호). 14년 4월 1일 영주군 내 면의 구획, 명칭이 정리되었다(도령2호). 14년 7월 25\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"4/613\",\n  \"work_date\": \"20220926\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
