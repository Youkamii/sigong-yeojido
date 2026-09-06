---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-144156"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-144156-boundary",
    "subject": "place-hgis-admin-144156",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-144156"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-144156",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19180501\",\n  \"begin_sour\": \"面ノ名稱竝區域變更ノ件(1918-04-25, 面에 關한 書類綴 국가기록원 CJA0002577)\",\n  \"end\": \"19311031\",\n  \"end_source\": \"朝鮮總督府令第132號(1931-10-20)\",\n  \"fid\": 1613,\n  \"fullname\": \"경상남도/김해군/김해면\",\n  \"fullname_c\": \"慶尙南道/金海郡/金海面\",\n  \"geom_ref\": \"추정\",\n  \"id\": 144156,\n  \"key\": \"3/110/7464\",\n  \"lv\": 3,\n  \"name\": \"김해면\",\n  \"name_cn\": \"金海面\",\n  \"reference\": \"18년 좌부면(김해면), 우부면이 김해면으로 통합되었다. 시행일자는 확인되지 않으나 총독 지령안이 4월 26일자로 시행되었으므로 5월 1일로 추정한다(面ノ名稱竝區域變更ノ件). 18년 1~4월 사이\",\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"3/110\",\n  \"work_date\": \"20220907\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1918,
    "validTo": 1931,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
