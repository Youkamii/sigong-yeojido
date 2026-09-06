---
type: "Claims"
source: "src-hgis-admin-1910-1945"
chunk: "chunk_hgis-admin-143252"
status: "draft"
generated_by: "codex"
---

```claims-json
[
  {
    "id": "claim-hgis-admin-143252-boundary",
    "subject": "place-hgis-admin-143252",
    "predicate": "syj:hasBoundaryRecord",
    "object": {
      "kind": "literal",
      "value": "hgis-townships-1883-1945.geojson#hgis-admin-143252"
    },
    "fromSource": "src-hgis-admin-1910-1945",
    "citesChunk": "chunk_hgis-admin-143252",
    "quote": "{\n  \"alias\": null,\n  \"begin\": \"19120101\",\n  \"begin_sour\": \"地方行政區域名稱一覽(1912)\",\n  \"end\": \"19131231\",\n  \"end_source\": \"朝鮮總督府令第111號(1913-12-29);慶尙南道令第2號(1914-03-01)\",\n  \"fid\": 1972,\n  \"fullname\": \"경상남도/울산군/두북면\",\n  \"fullname_c\": \"慶尙南道/蔚山郡/斗北面\",\n  \"geom_ref\": \"중앙\",\n  \"id\": 143252,\n  \"key\": \"3/594/7678\",\n  \"lv\": 3,\n  \"name\": \"두북면\",\n  \"name_cn\": \"斗北面\",\n  \"reference\": \"두동, 두서면은 1912년 직전 두북면으로 일시적으로 합설되었다가 다시 1914년 전후로 두동면,두서면으로 분리되는 것으로 추정된다. 편의상 합설 시기를 19120101, 분리 시기를 19140101로 본다.\",\n  \"trust\": 2,\n  \"type\": \"面\",\n  \"up_key\": \"3/594\",\n  \"work_date\": \"20220907\",\n  \"worker\": \"2022국편GIS사업팀\"\n}",
    "origin": "ai",
    "status": "draft",
    "validFrom": 1912,
    "validTo": 1913,
    "generatedBy": "codex",
    "generatedAt": "2026-09-07",
    "note": "기관이 구축한 역사 행정구역 레코드와 표시용 도형의 연결이다. 경계선은 원본 EPSG:4326 좌표를 Shapely 2.1.2, tolerance 0.002도로 단순화했다. 날짜는 레코드 begin/end 원값을 보존한다. 신뢰도 코드·추정 표기는 확정값으로 바꾸지 않았다."
  }
]
```
