---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-116990"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-116990-boundary",
    "subject": "place-hgis-admin-116990",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-116990"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-116990",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19101001\",\n  \"begin_sour\": \"朝鮮總督府令第7號(1910-10-01)\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);全羅南道令第2號(1914-03-02);朝鮮總督府告示第103號(在朝鮮各國居留地制度廢止,1914-04-01);新舊對照朝鮮全道府郡面里洞名稱一覽(1917)\",\n  \"fid\": 3736,\n  \"fullname\": \"전라남도/목포부/각국거류지\",\n  \"fullname_c\": \"全羅南道/木浦府/各國居留地\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 116990,\n  \"key\": \"5/550/6702\",\n  \"lv\": 3,\n  \"name\": \"각국거류지\",\n  \"name_cn\": \"各國居留地\",\n  \"reference\": \"자료상 1914신구대조부터 확인 / 목포 개항시점은 19100510 이전부터이지만 朝鮮總督府令第7號(1910-10-01)을 전거로 19101001로 begin 시점 설정;1914년 3월 1일 기존 목포부 중 부내면 일부 동리와 목포각\",\n  \"trust\": 4,\n  \"type\": \"居留地\",\n  \"up_key\": \"5/550\",\n  \"work_date\": \"20220728\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
