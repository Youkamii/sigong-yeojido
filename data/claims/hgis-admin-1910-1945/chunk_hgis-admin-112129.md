---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-112129"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-112129-boundary",
    "subject": "place-hgis-admin-112129",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-112129"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-112129",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第111號(1913-12-29);全羅南道令第2號(1914-03-02);新舊對照朝鮮全道府郡面里洞名稱一覽(1917)\",\n  \"end\": \"19350930\",\n  \"end_source\": \"朝鮮總督府令第112號(1935-09-28)\",\n  \"fid\": 3549,\n  \"fullname\": \"전라남도/광주군/송정면\",\n  \"fullname_c\": \"全羅南道/光州郡/松汀面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 112129,\n  \"key\": \"5/542/6515\",\n  \"lv\": 3,\n  \"name\": \"송정면\",\n  \"name_cn\": \"松汀面\",\n  \"reference\": \"1914년 3월 1일 기존 광주군 중 갈전면, 대치면은 담양군으로,  소지면의 송록리, 송하리는 나주군으로 편입되고 나머지 광주 전체와 함평군 조산면이 광주군으로 통합되었다(부령111호). 4월 1일\",\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"5/542\",\n  \"work_date\": \"20220728\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1914,
    "validTo": 1935,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
