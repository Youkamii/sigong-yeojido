---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-122652"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-122652-boundary",
    "subject": "place-hgis-admin-122652",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-122652"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-122652",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);全羅南道令第2號(1914-03-02);新舊對照朝鮮全道府郡面里洞名稱一覽(1917)\",\n  \"fid\": 4216,\n  \"fullname\": \"전라남도/함평군/대야면\",\n  \"fullname_c\": \"全羅南道/咸平郡/大也面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 122652,\n  \"key\": \"5/145/6938\",\n  \"lv\": 3,\n  \"name\": \"대야면\",\n  \"name_cn\": \"大也面\",\n  \"reference\": \"1914년 3월 1일 기존 함평군 중 장본면, 적량면, 여황면은 나주군으로, 대화면은 장성군으로, 조산면은 광주군으로 편입되고 나머지 함평군 지역과 목포부 금동면, 진례면, 좌촌면, 엄다면, 신로�\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"5/145\",\n  \"work_date\": \"20220728\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
