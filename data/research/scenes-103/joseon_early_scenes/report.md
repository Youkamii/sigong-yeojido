# 조선 전기(1392~1591) 장면 조사 보고 — joseon_early_scenes

작성: Claude Opus 5 (시공여지도 #96/#101/#103 장면 수집)
산출물: `result.json`, `progress.json`, `manifest.json`, `raw/` (원본 바이트 34개)

## 1. 결과 요약

| 항목 | 수 |
|---|---|
| 장면(scenes) | 22 (1392~1574) |
| 출처(sources) | 24 (내려받은 원본 34개 중 인용에 쓴 것) |
| 주장(claims) | 139 |
| 엔티티(entities) | 90 (기존 카탈로그 재사용 26 + 이번 신규 64) |
| 미해결 기록(missing) | 10 |
| 내려받은 총 바이트 | 7,168,848 |

시대 분포: 1392·1392·1394·1395·1396~1398·1402·1403·1419·1434·1443·1446·1467·1485·1498·1506·1510·1510·1519·1543·1550·1555·1574.
전쟁 외 활동(천도·궁궐/성곽 공사·지도 제작·활자 주조·물시계·문자·법전·서원 건립과 사액)이 14건, 무력 충돌·정변이 8건이다.
임진왜란(1592~1598)은 다른 수집자 담당이라 손대지 않았다.

## 2. 검증 방법과 통과 결과

`build.py`(출처·엔티티·주장 정의) + `build2.py`(장면 조립·검증·쓰기)로 만들었고, 결과 파일만 따로 읽는 독립 감사도 돌렸다. 마지막 감사 오류 수 = **0**.

- **원본 대조**: 24개 출처의 SHA-256을 `raw/` 파일에서 다시 계산해 `result.json` 값과 일치 확인. 인용문 67개 전부가 HTML 제거·공백 정규화 뒤 해당 원본 안에 연속 문자열로 실재함을 확인.
- **인용 분량**: 웹페이지(URL) 1개당 인용 단어 합계 ≤ 25 단어. 최대치 25단어인 출처가 4개(E0032776, E0065805, E0026916, E0042945).
- **날짜 규칙(임포터 요구)**: `syj:occurredIn` / `syj:activeIn` 객체의 모든 숫자 연도·구간 경계가 **인용된 발췌문 안에 그대로 존재**해야 한다. 검사한 경계 23개 전부 PASS. `이듬해` 류의 상대 표현은 쓰지 않았다.
- **구간 주장**: 유일한 구간은 한양도성 축성(`ts-je-doseong-1396-1398`)이며, 시작·종료가 한 문장에 함께 적힌 원문("1396년(조선 태조 5) 축성을 시작하여 2년 뒤인 1398년에 완공하였다")을 verbatim으로 담았다. 시작·종료를 따로 쪼갤 필요가 없는 형태다. 나머지는 모두 시점(point-in-time) 주장이며 생몰·왕조 기간을 거주·활동 기간으로 늘린 곳은 없다.
- **ID 중복**: source/entity/claim/scene/excerpt 각 계열에서 중복 없음. 모든 claim의 sourceId·citesExcerpt·object.entity, 장면의 eventId·claimIds·participants.entityId·coordinateSourceIds가 모두 실재하는 ID를 가리킴.
- **효과 근거**: `fire` 사용 0건(이 구간에서 특정 사건·장소의 방화/소실을 명시한 원문을 얻지 못해 전부 false). `ships` 2건(1419 병선 227척, 1555 선박 70여 척), `attack` 4건(1467, 1510×2, 1555) 모두 해당 사건의 원문 근거 claim을 달았다.

## 3. 장면 목록과 좌표 근거

| 연도 | scene id | kind | 장소 표시 | 좌표 성격 |
|---|---|---|---|---|
| 1392 | scene-je-jeong-mongju-1392 | court | 선죽교(개성) | 지역 앵커 hgis-admin-6836 · 추정 배치 |
| 1392 | scene-je-joseon-founding-1392 | court | 개경 | 지역 앵커 hgis-admin-6836 · 추정 배치 |
| 1394 | scene-je-hanyang-cheondo-1394 | assembly | 한양 | 위키데이터 Q8684(서울) 표시점 |
| 1395 | scene-je-gyeongbokgung-1395 | construction | 경복궁 | 위키백과 「경복궁」 좌표(site) |
| 1396~98 | scene-je-hanyang-doseong-1396 | construction | 한양도성 | 위키데이터 Q5472741 표시점(선형 유적) |
| 1402 | scene-je-honil-gangni-1402 | publication | 한성(제작지 미상) | Q8684 표시점 |
| 1403 | scene-je-jujaso-1403 | publication | 훈도방 주자소 | Q8684 표시점 |
| 1419 | scene-je-daemado-chulhang-1419 | naval | 주원방포(현 통영) 출항지 | 지역 앵커 hgis-admin-145025 |
| 1434 | scene-je-jagyeongnu-1434 | construction | 보루각(경복궁 안) | 경복궁 좌표(궁궐 표시) |
| 1443 | scene-je-hunminjeongeum-changje-1443 | publication | 한성(장소 서술 없음) | Q8684 표시점 · place.claimIds 비어 있음 |
| 1446 | scene-je-hunminjeongeum-haerye-1446 | publication | 한성(장소 서술 없음) | Q8684 표시점 · place.claimIds 비어 있음 |
| 1467 | scene-je-yisiae-nan-1467 | battle | 길주(함길도) | 지역 앵커 hgis-admin-85261 |
| 1485 | scene-je-gyeongguk-daejeon-1485 | publication | 한성(중앙 관서) | Q8684 표시점 · place.claimIds 비어 있음 |
| 1498 | scene-je-muo-sahwa-1498 | court | 한성(처결 장소 없음) | Q8684 표시점 |
| 1506 | scene-je-jungjong-banjeong-1506 | assembly | 훈련원(한성) | Q8684 표시점 |
| 1510 | scene-je-sampo-waeran-busanpo-1510 | battle | 부산포(동래) | 지역 앵커 hgis-admin-145002 |
| 1510 | scene-je-sampo-waeran-jepo-1510 | siege | 제포(웅천) | 지역 앵커 hgis-admin-145022 |
| 1519 | scene-je-gimyo-sahwa-1519 | court | 한성(처결 장소 없음) | Q8684 표시점 |
| 1543 | scene-je-baegundong-seowon-1543 | construction | 백운동서원(풍기) | 위키백과 「소수서원」 좌표(site) + 풍기 앵커 |
| 1550 | scene-je-sosu-saeaek-1550 | court | 백운동서원 사액 | 같은 좌표 |
| 1555 | scene-je-eulmyo-waebyeon-1555 | siege | 달량포·강진·진도 일대 | 지역 앵커 hgis-admin-110816 |
| 1574 | scene-je-dosanseowon-1574 | construction | 안동 도산서원 | 위키백과 「도산서원」 좌표(site) + 안동 앵커 |

좌표 성격은 장면마다 `place.coordinateNote`에 그대로 적어 두었다. 위키백과·위키데이터 좌표는 **현대 지리 표시값**이며 당시 건물 배치·공사 범위를 뜻하지 않는다고 각 장면에 명시했다. 역사 서술 근거(언제·무엇을·어디서)와 좌표 근거는 서로 다른 claim/source로 분리했다.

## 4. 재사용한 카탈로그 ID

- 사건 7개: `event-joseon-founding-1392`, `event-jeong-mongju-killed-1392`, `event-encykorea-hunminjeongeum-changje-1443`, `event-encykorea-hunminjeongeum-banpo-1446`, `event-encykorea-muo-sahwa-1498`, `event-encykorea-jungjong-banjeong-1506`, `event-encykorea-gimyo-sahwa-1519` (7개 중 기존 장면 패킷이 없던 항목 전부).
- 장소 3개: `place-encykorea-gaegyeong`, `place-seonjukgyo`, `place-gyeongbokgung`.
- 인물 15개(태조·태종·세종·세조·연산군·정몽주·정도전·장영실·정인지·신숙주·성삼문·조광조·이황·성희안·박원종). `ent-wka-seong-huian`/`ent-wka-bak-wonjong`은 실록 계열 자료에서 각각 지중추부사·부사용 직함으로 중종반정 관련 사건에 이미 참여자로 걸려 있어 동일 인물로 판단하고 재사용했다.
- 동명이인 위험이 있는 ID(예: 고려 문종·성종, 태조 왕건)는 쓰지 않았다. 새로 만든 인물·장소·집단 ID는 모두 `-je-` 접두사를 붙여 기존 ID와 충돌하지 않는다.
- 요새/사건 집단은 전국 단위 엔티티로 묶지 않고 사건별 집단으로 분리했다: `polity-je-doseong-builders-1396`, `polity-je-sampo-japanese-residents-1510`, `polity-je-hamgildo-rebels-1467`, `polity-je-banjeong-musa-1506`, `polity-je-andong-yurim-1574`, `polity-je-waegu-1555`.

## 5. 남은 빠진 고리 (구체 목록)

1. **한성부 지역 앵커 없음.** `existing-place-anchors.json`(354개)에 옛 한성부/경성부 항목이 없어 도성 내부 9개 장면을 Q8684 표시점으로만 배치했다. 필요한 것: 한성부 또는 5부(部) 경계의 표시 중심 1점. 다른 수집자의 공통 지역 앵커 작업에 한성부가 추가되면 그 ID로 교체하면 된다.
2. **도성 내부 소지명 좌표 미확보**: 훈도방(주자소), 집현전, 훈련원, 의정부 청사, 보루각 터(경회루 남쪽·현 수정전 자리로 서술됨). 서울역사편찬원·서울시 공공데이터의 옛 지명 좌표가 있으면 1403·1446·1506·1434 장면의 precision을 site로 올릴 수 있다.
3. **선죽교 좌표 미확보**(북한 개성). 현재 개성 지역 앵커로 대체. 대체 경로: 국가유산 관련 공식 자료나 유네스코 개성역사유적지구 좌표.
4. **1443 창제·1446 집필의 장소 서술 자체가 원문에 없음.** 두 장면은 `place.claimIds`가 비어 있고 좌표는 표시용이다. 실록 원문(세종실록) 접근이 열리면 장소 주장을 보강할 수 있으나 이번에는 국편(NIKH) 계열 엔드포인트를 요청하지 않았다.
5. **1485 경국대전 시행**도 장소 서술이 없어 `place.claimIds`가 비어 있다(전국 시행 사안).
6. **1402 혼일강리역대국도지도 제작 장소 없음.** 참여자 3인(김사형·이무·이회)을 모두 `related`로 두었다. 제작 관서·장소를 밝히는 자료가 나오면 on-site로 올릴 수 있다.
7. **삼포 왜관·포구 개별 좌표 미확보**: 제포(웅천)·부산포·염포. 현재 창원·부산 지역 앵커로 표시했고 실제 포구는 그보다 바닷가 쪽이다. 달량포(1555)도 위치 서술이 원문에 없어 강진 앵커로 대체했다.
8. **1419 대마도 교전 자체는 표시 범위 밖.** 원문이 명시한 주원방포 출항까지만 담았다. 대마도 상륙·전투를 그리려면 한반도 밖 좌표 정책이 먼저 정해져야 한다.
9. **김종서의 육진 개척(1433년 이후)**: 원문 `raw/encykorea-E0010494-kim-jongseo.html`을 받아 두었으나 여섯 진의 개별 위치·연도를 특정할 서술을 찾지 못해 장면으로 만들지 않았다. 회령·종성·온성·경원·경흥·부령 앵커는 이미 있으므로, 진별 설치 연도를 적은 자료만 확보되면 바로 장면화할 수 있다.
10. **임꺽정(1559~1562)**: 백과 항목 `E0047412`가 홍명희의 소설을 주로 다루어 실존 인물의 연도별 활동·장소 서술을 얻지 못했다(원본은 `raw/`에 보관). 니탕개의 난(1583), 정여립 사건(1589) 등 1580년대 사건은 이번 회차에 접근 가능한 원문을 확보하지 못했다.

### 접근이 막힌 엔드포인트(실제 오류)

- `https://www.khs.go.kr/robots.txt` — `URLError: urlopen error timed out` (15초, 1회 재시도). 국가유산청 지정 좌표를 기관 원본으로 받지 못해 좌표를 위키 계열로 대체했다.
- `https://www.grandculture.net/robots.txt` — `URLError: [SSL: WRONG_SIGNATURE_TYPE]`. 향토문화전자대전(디지털영암문화대전 을묘왜변 항목)을 쓰지 못했다.
- `contents.history.go.kr`(우리역사넷, 국사편찬위원회) — 지침에 따라 요청하지 않음.
- `encykorea.aks.ac.kr/Article/Keyword/...` — 404, `/Article/Search` 는 robots.txt Disallow. 항목 ID는 웹 검색으로만 찾았고 본문은 허용 경로 `/Article/E00xxxxx` 에서 받았다.
- 위키데이터 `/wiki/Special:EntityData` 는 robots.txt Disallow라 쓰지 않고, 허용 경로인 항목 페이지 `/wiki/Q8684`, `/wiki/Q5472741` 의 P625 표기를 인용했다.

## 6. 임포터가 주의할 점

- 3개 장면(1443, 1446, 1485)은 `place.claimIds`가 의도적으로 비어 있다. 좌표는 표시용이며 장소 주장이 아니다.
- 같은 해 두 장면(1392 즉위/피살, 1510 부산포/제포)은 별개 사건이다. 동시 발생으로 묶으면 안 된다.
- 참여자 presence는 `on-site` 24건 / `related` 34건이다. 명령·계획·추모 대상·소속만 있는 인물은 전부 `related`로 두었다(예: 정몽주 사건의 이방원, 자격루의 세종·이천·김조, 사화의 인물들).
- 대립 진영은 role 문자열에 진영 이름을 함께 적어 구분했다(조선 측 / 일본거류민 측 / 함길도 토착 세력 측 / 관군 측 / 훈구세력·신진사류).
- `fire` 효과는 전 장면 false다. 임진왜란식 화재 연출을 이 구간 장면에 얹지 말 것.
