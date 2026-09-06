---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-85093"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-85093-boundary",
    "subject": "place-hgis-admin-85093",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-85093"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-85093",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第111號(1913-12-29);咸鏡北道令第1號(1914-03-18);新舊對照朝鮮全道府郡面里洞名稱一覽(1917)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 8084,\n  \"fullname\": \"함경북도/온성군\",\n  \"fullname_c\": \"咸鏡北道/穩城郡\",\n  \"geom_ref\": \"기호\",\n  \"id\": 85093,\n  \"key\": \"13/493\",\n  \"lv\": 2,\n  \"name\": \"온성군\",\n  \"name_cn\": \"穩城郡\",\n  \"reference\": \"14년 3월 1일 기존 온성군의 영역이 그대로 경원군으로 설정되었다(부령111호). 14년 4월 1일 온성군 내 면의 구획, 명칭이 정해졌다(도령1호).  이 과정 전체를 1914년 3월 1일 기준 행정구역 개편으�\",\n  \"trust\": 1,\n  \"type\": \"郡\",\n  \"up_key\": \"13\",\n  \"work_date\": \"20220627\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
