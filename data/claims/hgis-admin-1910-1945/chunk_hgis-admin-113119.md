---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-113119"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-113119-boundary",
    "subject": "place-hgis-admin-113119",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-113119"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-113119",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);全羅南道令第2號(1914-03-02);新舊對照朝鮮全道府郡面里洞名稱一覽(1917)\",\n  \"fid\": 3696,\n  \"fullname\": \"전라남도/담양군/목면\",\n  \"fullname_c\": \"全羅南道/潭陽郡/木面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 113119,\n  \"key\": \"5/160/6563\",\n  \"lv\": 3,\n  \"name\": \"목면\",\n  \"name_cn\": \"木面\",\n  \"reference\": \"1914년 3월 1일 기존 담양군과 창평군 중 군내면, 고현내면, 내남면, 외남면, 서면, 북면, 장남면, 동서면, 장북면, 덕면, 대편, 가면 그리고 장성군 갑향면 및 광주군 갈전면, 대치면이 담양군으로\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"5/160\",\n  \"work_date\": \"20220728\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
