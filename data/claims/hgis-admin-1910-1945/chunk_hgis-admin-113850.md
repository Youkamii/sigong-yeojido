---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-113850"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-113850-boundary",
    "subject": "place-hgis-admin-113850",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-113850"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-113850",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19140301\",\n  \"begin_sour\": \"朝鮮總督府令第111號(1913-12-29);全羅南道令第2號(1914-03-02);新舊對照朝鮮全道府郡面里洞名稱一覽(1917)\",\n  \"end\": \"19290327\",\n  \"end_source\": \"全羅南道吿示第57號(1929-03-28)\",\n  \"fid\": 3605,\n  \"fullname\": \"전라남도/나주군/나신면\",\n  \"fullname_c\": \"全羅南道/羅州郡/羅新面\",\n  \"geom_ref\": \"기호\",\n  \"id\": 113850,\n  \"key\": \"5/161/6595\",\n  \"lv\": 3,\n  \"name\": \"나신면\",\n  \"name_cn\": \"羅新面\",\n  \"reference\": \"1914년 3월 1일 기존 남평군, 나주군 전체 및 함평군 장본면, 적량면, 여황면 그리고 광주 소지면 송록리, 송하리가 나주군으로 통합되었다(부령111호). 4월 1일 새 나주군 내 면의 구획, 명칭이 정�\",\n  \"trust\": 1,\n  \"type\": \"面\",\n  \"up_key\": \"5/161\",\n  \"work_date\": \"20220728\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1914,
    "validTo": 1929,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
