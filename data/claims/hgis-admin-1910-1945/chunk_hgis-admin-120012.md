---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-120012"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-120012-boundary",
    "subject": "place-hgis-admin-120012",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-120012"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-120012",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19100510\",\n  \"begin_sour\": \"民籍統計表\",\n  \"end\": \"19140228\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);全羅南道令第2號(1914-03-02);朝鮮總督府令第64號(1915-06-18);新舊對照朝鮮全道府郡面里洞名稱一覽(1917)\",\n  \"fid\": 4050,\n  \"fullname\": \"전라남도/장성군/서삼면\",\n  \"fullname_c\": \"全羅南道/長城郡/西三面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 120012,\n  \"key\": \"5/148/1516\",\n  \"lv\": 3,\n  \"name\": \"서삼면\",\n  \"name_cn\": \"西三面\",\n  \"reference\": \"1914년 3월 1일 기존 장성군 중 갑향면은 담양군으로 편입되고 장성군의 나머지 지역과 함평군 대화면 그리고 영광군 외동면, 내동면, 현내면, 삼남면, 삼북면, 외서면이 장성군으로 통합되었다(\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"5/148\",\n  \"work_date\": \"20220728\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
