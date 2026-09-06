---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-8474"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-8474-boundary",
    "subject": "place-hgis-admin-8474",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-8474"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-8474",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);京畿道令第3號(1914-03-13);京畿道告示第61號(1914-11-13);朝鮮總督府令第41號(1915-04-30);京畿道告示第56號(1915-10-28)\",\n  \"fid\": 1136,\n  \"fullname\": \"경기도/양평군/남시면\",\n  \"fullname_c\": \"京畿道/楊平郡/南始面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 8474,\n  \"key\": \"2/33/501\",\n  \"lv\": 3,\n  \"name\": \"남시면\",\n  \"name_cn\": \"南始面\",\n  \"reference\": \"1914년 3월 1일 기존 양평군 중 남종면은 광주군으로 편입되고 나머지 지역이 새 양평군으로 설정되었다(부령111호). 4월 1일 새 양평군 내 면의 구획, 명칭이 정해지고(도령3호) 11월 13일 강상, 용�\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"2/33\",\n  \"work_date\": \"20201231\",\n  \"worker\": \"2020국편GIS사업팀\"\n}",
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
