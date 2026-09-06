---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-119805"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-119805-boundary",
    "subject": "place-hgis-admin-119805",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-119805"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-119805",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第111號(1913-12-29);全羅南道令第2號(1914-03-02);朝鮮總督府令第64號(1915-06-18);新舊對照朝鮮全道府郡面里洞名稱一覽(1917)\",\n  \"end\": \"19450814\",\n  \"end_source\": \"기준시점:해방\",\n  \"fid\": 4041,\n  \"fullname\": \"전라남도/장성군/북상면\",\n  \"fullname_c\": \"全羅南道/長城郡/北上面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 119805,\n  \"key\": \"5/148/6823\",\n  \"lv\": 3,\n  \"name\": \"북상면\",\n  \"name_cn\": \"北上面\",\n  \"reference\": \"1914년 3월 1일 기존 장성군 중 갑향면은 담양군으로 편입되고 장성군의 나머지 지역과 함평군 대화면 그리고 영광군 외동면, 내동면, 현내면, 삼남면, 삼북면, 외서면이 장성군으로 통합되었다(\",\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"5/148\",\n  \"work_date\": \"20220728\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
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
