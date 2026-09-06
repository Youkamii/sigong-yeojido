# reset-roads-57 — 한국사 역로/옛 도로 LineString 조사 보고

작성일 2026-09-07 · 조사·수집 담당 · 모델 claude-opus-5 (effort max)
산출물: `progress.json`, `result.json`, `report.md` (본 작업 폴더에만 기록. 기존 산출물은 수정·삭제하지 않음)

---

## 1. 결론 먼저

**좌표가 있는 한반도 역사 역로/옛 도로 LineString은 확보하지 못했습니다. 공개·재배포 가능한 형태로는 존재하지 않는 것으로 결론냅니다.**

- 확인한 8건 중 `integrationReady=true`는 **0건**입니다.
- 조선 8대로(八大路)의 벡터 데이터는 **실재가 확인**되었지만, 그것은 논문 저자들이 사적으로 입수한 **미공개 제3자 데이터**이고 원 제공처의 제공조건을 이 도구로는 확인할 수 없었습니다.
- 대안으로 검토한 "재배포 가능한 실제 지리참조 역사 지도"도 성립하지 않았습니다. 한국을 다루는 공개 georeference 결과물은 해도(海圖)뿐이어서 내륙 도로가 아예 그려져 있지 않습니다.

따라서 #57의 이 지도 종류는 **자료 없음**으로 처리하시고, 역참 점 직선 연결·현대 도로·현대 둘레길 대체는 하지 마십시오. 특히 검색 중 나온 `산림청_국가숲길 노선도(속리산둘레길) SHP`는 SHP 선형 데이터이지만 현대 탐방로이므로 금지된 대체에 해당해 라이선스 검토 없이 배제했습니다.

---

## 2. 조사한 후보 6개 (상한 준수)

| # | 후보 | 결과 | 핵심 사유 |
|---|---|---|---|
| C1 | JCAA 논문 'Benefit Maximizing Routes' (Shim·Ko·Park, 2022) | 데이터 미공개 | 논문은 CC BY 4.0이지만 사용한 8대로 벡터를 배포하지 않음. Data Accessibility Statement·부록 GIS 없음 |
| C2 | npj Heritage Science, Sino-Korean Tribute Routes (2025) | 지오메트리 없음 + 범위 밖 | 데이터 가용성 항목에 기초자료만 나열, 경로 파일 없음. 복원 구간 210 km는 중국 랴오닝 |
| C3 | 국가유산청 공간정보 (data.go.kr 15089320 / 15148507 → gis-heritage.go.kr) | 라이선스는 명확, 의미가 다름 | SHP·UTM-K·공공누리이나 **지정구역 면 데이터**이지 역로 선형이 아님 |
| C4 | 공개 리포지토리 일제 점검 (Zenodo API, OSF, figshare) | 부재 | Zenodo 17건 중 한국 역사 도로 데이터 0건. 튀르키예·러시아·도쿄 건과 성씨 'Korea' 오탐뿐 |
| C5 | David Rumsey Historical Map Collection | 라이선스만 확인, 카탈로그 차단 | CC BY-NC-SA 3.0 직접 확인. 그러나 한국 도엽 목록은 봇 검증 화면, georeferencer는 403 |
| C6 | 공개 georeferencing 플랫폼 (Wikimaps Warper, MapWarper.net) | 해당 없음 / 차단 | Wikimaps Warper의 'korea' 결과 5건 전부 Admiralty 해도(1855–1962), 내륙 도로 없음. MapWarper.net은 hCaptcha |

보조로 `공공데이터포털 키워드 '옛길'` 검색도 직접 확인했으나(5건), 역사 경로 선형 데이터는 없었습니다.

---

## 3. 직접 확인한 제공조건

원문을 직접 열어 확인한 것만 적습니다. 검색 결과 요약은 확인으로 취급하지 않았습니다.

### 3-1. JCAA (Journal of Computer Applications in Archaeology)
- 정확한 제목: *'Benefit Maximizing Routes': Development and Evaluation Using the Historical Roads of Korea's Joseon Dynasty (1392–1910)*
- 저자 Woo Jin Shim, Ilhong Ko, Soo Jin Park / 2022-08-19 / DOI 10.5334/jcaa.97
- **라이선스: CC BY 4.0** — 다만 이는 **논문 본문에만** 적용됩니다. 경로 벡터는 제3자 자료로 논문과 함께 배포되지 않습니다.
- 인용(≤25단어): "were fortunate enough to obtain vector data for eight of the Main Roads"
- 사료 근거로 명시된 것: 輿地圖書, 大東地志, Kim(2004), 그리고 한국학중앙연구원 2014–2017 복원 과제
- 저자들이 밝힌 한계: 산지가 아닌 지역에서는 DEM 오차·해상도 때문에 모델 경로 신뢰도가 떨어짐

### 3-2. npj Heritage Science
- 정확한 제목: *Digital reconstruction and representation of the Sino-Korean Tribute Routes using Geographic Information Systems*
- 저자 Liquan Gong, Kelly Greenop, Cathy Keys, Chris Landorf / 2025-05-13
- 데이터 가용성 항목에 열거된 것은 Mappi.net 정치지도, Harvard-Yenching IIIF 매니페스트, Wikimedia Commons 기복도, ALOS 12.5 m DEM, China Land Cover Dataset, ERA5-Land, OpenStreetMap **뿐**입니다. 복원 경로의 SHP/GeoJSON/KML은 없습니다.
- **라이선스 문구는 반환된 본문에 없어 미확인**입니다. CC 여부를 추정하지 않았습니다.
- 기간: 청 1616–1912. 복원 구간은 九連城~遼陽의 '遼東 八站' 약 210 km로 **랴오닝성 내부**이며, 서울은 출발지로 언급될 뿐 한반도 구간은 복원되지 않았습니다.
- 인용(≤25단어): "Terrain and environmental data used are derived from modern geographical information, which may differ from actual Qing Dynasty conditions"

### 3-3. 국가유산청 공간정보
- `국가유산청_문화재 공간정보 서비스_20090101` — SHP, **이용허락범위 '제한 없음'**, 등록 2021-09-23 / 수정 2025-06-26
- `국가유산청_지정유산 지도다운로드_20250831` — SHP, **이용허락범위 '제한 없음'**, 등록 2025-09-04 / 수정 2025-09-22
- 다운로드: `https://gis-heritage.go.kr/newMain/heritageDownload.do` (지정유산 공간정보 / 현상변경허용기준 공간정보, **UTM-K**, 공공누리(KOGL) 표시)
- 인용(≤25단어): "문화재 공간 정보 서비스는 문화재 정보와 지도 정보가 결합한 공간 정보 활용체계입니다"
- **왜 채택하지 않았는가**: 대상은 국보·보물·사적·명승 등의 **지정구역**입니다. 명승으로 지정된 옛길(문경새재, 대관령 옛길 등)이 일부 포함되더라도 보호구역 경계는 도로 중심선이 아니며, 제공자가 기간이나 복원 근거·한계를 서술하지 않습니다. 개별 옛길의 연대(예: 문경새재 1414년 개통)는 유산 설명 텍스트에 있을 뿐 공간 파일 속성이 아닙니다. 파일 실물을 열 수 없어 지오메트리 타입과 포함 항목도 미검증입니다.

### 3-4. David Rumsey Map Collection
- **라이선스: Creative Commons Attribution-NonCommercial-ShareAlike 3.0** (about 페이지에서 직접 확인)
- 표기 문구: "David Rumsey Map Collection, David Rumsey Map Center, Stanford Libraries" / 상업적 재판매는 carto@davidrumsey.com 허가 필요
- 인용(≤25단어): "This work is licensed under a Creative Commons License. By downloading any images from this site, you agree to the terms"
- **한계**: 컬렉션 전체 라이선스만 확인했을 뿐, 한국 관련 도엽이 georeference 되어 있는지·연대·도로 표현 여부는 하나도 확인하지 못했습니다.

---

## 4. 실패·차단 기록 (우회하지 않음)

| 대상 | 사유 |
|---|---|
| `C:\Users\gkfkd\Git\sigong-yeojido` | 파일 도구가 작업 폴더로 제한되어 **저장소를 전혀 읽지 못함**. 기존 산출물 맥락 없이 조사함 |
| www.nature.com | 303 → idp.nature.com → 302 재귀. 출판사 자체 쿠키 체인을 따라 본문 확보. 라이선스 블록은 렌더링되지 않아 미확인 |
| zenodo.org/search | 클라이언트 렌더링이라 결과 없음. 동일 제공자의 공개 REST API(`zenodo.org/api/records`)로 확인 |
| davidrumsey.com/luna/... | 'Verify Access' 봇 검증 화면. 우회 안 함 |
| davidrumsey.georeferencer.com | HTTP 403 |
| mapwarper.net | hCaptcha 챌린지. 우회 안 함 |
| **waks.aks.ac.kr** | 포털이 **HTTP 전용**. WebFetch가 HTTPS로 승격해 443 포트 연결 거부(ECONNREFUSED). **AKS 2014–2017 과제 성과물의 제공조건을 확인하지 못했습니다** |
| isprs-archives PDF | 텍스트 추출 실패(바이너리 반환). 후보 6개 상한을 지키려고 추가 추적하지 않음 |
| db.history.go.kr, contents.history.go.kr, hgis.history.go.kr, www.history.go.kr, sillok.history.go.kr, db.itkc.or.kr, KCI, KISS, Nominatim, OpenHistoricalMap, Pleiades | robots 금지 확정 도메인. **접속하지 않음.** 특히 국사편찬위원회 한국근대지리정보(HGIS)는 검색 결과에 조선 교통로 레이어 보유 가능성이 가장 높은 곳으로 반복 등장했지만 **존재 여부·조건 모두 미검증**입니다 |
| Hisgeo Joseon DB | 외부 공개 제한. 지시대로 footer CC 문구만으로 허용 판단을 내리지 않았습니다 |

프록시·UA 변경·다른 API 우회는 사용하지 않았습니다.

---

## 5. 남은 연락 항목 (우선순위 순)

1. **한국학중앙연구원 한국학진흥사업 성과포털 (waks.aks.ac.kr)** — 2014–2017 '조선시대 행정구역 및 수륙교통로 복원' 과제 성과물. 한반도 역로 LineString이 존재한다면 여기일 가능성이 가장 큽니다. 확인할 것: 교통로 GIS 레이어 포함 여부, 포맷, 이용조건(공공누리/CC), 다운로드·신청 절차. 현재 장애물은 **HTTP 전용 사이트**라는 기술적 문제이므로, HTTP 접속 가능한 환경이면 바로 확인됩니다.
2. **JCAA 논문 교신저자** — 8대로 벡터의 원 제공자, 재배포 가능 여부, 좌표계, 복원 기준연도와 한계 서술.
3. **국사편찬위원회 HGIS(한국근대지리정보)** — robots 제약이 없는 경로로 교통로 레이어 유무와 제공조건 확인.
4. **Hisgeo Joseon DB 운영 주체** — 재배포 허용 범위를 서면으로 확인(footer 문구 불가).
5. **David Rumsey** — 정상 브라우저에서 한국 도엽 검색, georeference·GCP 내보내기 가능 여부 확인. 필요 시 carto@davidrumsey.com.
6. **국가유산청 gis-heritage.go.kr SHP 실물** — Codex가 내려받아 지오메트리 타입·좌표계·명승 옛길 포함 여부·공공누리 유형 번호 확인. 단 역로 대체재로는 부적합하다는 전제 위에서.
7. **미추적 리드** — ISPRS Archives XLVIII-M-9-2025, 285(전주·완주 역사유산 매핑, CC BY)과 The Professional Geographer 76(1)의 원주 분지 역사 경로 모델링 논문. 후보 상한 때문에 이번에 추적하지 않았습니다.

---

## 6. Codex 통합 지침

- 이 지도 종류는 **`completed=false`, 자료 없음**으로 표시하십시오. `result.json`의 어떤 record도 통합 대상이 아닙니다.
- 임시방편 금지: 역참 점의 직선 연결, 현대 도로망, 현대 둘레길(속리산둘레길 등), 국가유산 지정구역 면을 선으로 바꾼 것 — 모두 이번 목표의 대체재가 아닙니다.
- 가장 빠른 해결 경로는 5절 1번(waks.aks.ac.kr을 HTTP로 확인)입니다. 이 한 건이 풀리면 조선 8대로 선형 확보 가능성이 열립니다.
