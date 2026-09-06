---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-114466"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-114466-boundary",
    "subject": "place-hgis-admin-114466",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-districts-1910-1945.geojson#hgis-admin-114466"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-114466",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);全羅南道令第2號(1914-03-02);新舊對照朝鮮全道府郡面里洞名稱一覽(1917)\",\n  \"fid\": 3596,\n  \"fullname\": \"전라남도/나주군\",\n  \"fullname_c\": \"全羅南道/羅州郡\",\n  \"geom_ref\": \"추정\",\n  \"id\": 114466,\n  \"key\": \"5/161\",\n  \"lv\": 2,\n  \"name\": \"나주군\",\n  \"name_cn\": \"羅州郡\",\n  \"reference\": \"1914년 3월 1일 기존 남평군, 나주군 전체 및 함평군 장본면, 적량면, 여황면 그리고 광주 소지면 송록리, 송하리가 나주군으로 통합되었다(부령111호). 4월 1일 새 나주군 내 면의 구획, 명칭이 정�\",\n  \"trust\": 2,\n  \"type\": \"郡\",\n  \"up_key\": \"5\",\n  \"work_date\": \"20220728\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
