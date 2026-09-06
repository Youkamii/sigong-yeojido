---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-4460"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-4460-boundary",
    "subject": "place-hgis-admin-4460",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-4460"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-4460",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府京畿道令第10號(1912-07-17);朝鮮總督府京畿道告示第28號(1912-07-17);朝鮮總督府令第111號(1913-12-29)\",\n  \"fid\": 1405,\n  \"fullname\": \"경기도/통진군\",\n  \"fullname_c\": \"京畿道/通津郡\",\n  \"geom_ref\": \"추정\",\n  \"id\": 4460,\n  \"key\": \"2/46\",\n  \"lv\": 2,\n  \"name\": \"통진군\",\n  \"name_cn\": \"通津郡\",\n  \"reference\": \"14년 행정구역 개편 당시 통진군의 경우, 12년 7월 17일 면과 동리 조정이 이루어진 후(도령10호,고시28호) 14년 3월 1일 양천군과 함께 김포군으로 통합되었다.(부령111호) 김포군으로 통합된 후 면,\",\n  \"trust\": 2,\n  \"type\": \"郡\",\n  \"up_key\": \"2\",\n  \"work_date\": \"20201231\",\n  \"worker\": \"2020국편GIS사업팀\"\n}",
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
