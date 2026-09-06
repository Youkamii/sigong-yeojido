---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-2658"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-2658-boundary",
    "subject": "place-hgis-admin-2658",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-2658"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-2658",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);京畿道令第1號(1914-01-30);京畿道令第3號(1914-03-13);京畿道告示第8號(1914-04-01);朝鮮總督府令第133號(1914-09-01);京畿道告示第63號(1914-11-20);京畿道告示第28號(1917-06-15)\",\n  \"fid\": 1297,\n  \"fullname\": \"경기도/인천부\",\n  \"fullname_c\": \"京畿道/仁川府\",\n  \"geom_ref\": \"추정\",\n  \"id\": 2658,\n  \"key\": \"2/40\",\n  \"lv\": 2,\n  \"name\": \"인천부\",\n  \"name_cn\": \"仁川府\",\n  \"reference\": \"1914년 3월 1일 기존 인천부 구읍면을 비롯한 대부분 지역은 부천군으로 편입되고 부내면과 다소면의 일부 동리는 새로 설정된 인천부로 편입되었다(부령111호). 같은 날 새로 설정된 인천부로 ��\",\n  \"trust\": 2,\n  \"type\": \"府\",\n  \"up_key\": \"2\",\n  \"work_date\": \"20201231\",\n  \"worker\": \"2020국편GIS사업팀\"\n}",
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
