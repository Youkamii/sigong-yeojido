# 고려 918–1391 장면 조사 보고 (goryeo_scenes)

작성: Claude Opus 5 / 재부팅 후 새 CLI 세션 (이전 대화는 `--resume` 불가로 복구 실패, `recovered-activity.json` 의 사전 작업만 재사용)

## 1. 산출물

| 파일 | 내용 |
|---|---|
| `result.json` | `{sources, entities, claims, scenes, missing}` — 소스 33, 엔티티 88, 클레임 141, 장면 24 |
| `progress.json` | 완료 장면 목록·검증 결과 (증분 저장) |
| `manifest.json` | 실제 다운로드 기록 68건 (url, fetchedUtc, httpStatus, byteLength, sha256, rawFile, rawFileRetained) |
| `raw/` | 실제 응답 바이트 43개 파일 |
| `build_result.py` | result.json 생성·검증 스크립트 (발췌 문자열 원문 대조, 예산·참조 무결성 검사) |
| `fetch.py`, `txt.py` | urllib 다운로드 헬퍼(타임아웃 15초·재시도 1회, 캐시), HTML 제거 헬퍼 |

`build_result.py` 는 실행할 때마다 다음을 강제 검증하고, 하나라도 실패하면 문제 목록을 출력한다.
- 모든 발췌가 해당 raw 파일의 HTML 제거·공백 정규화 텍스트에 **글자 그대로** 존재하는가
- 웹페이지 1건당 발췌 총합이 **25 단어 이하**인가
- 모든 claim → source/excerpt, scene → claim/entity 참조가 실제로 존재하는가, claim ID 가 유일한가
- (7절 수정 이후 추가) importer 와 같은 규칙으로, time 객체의 `verbatim` 이 인용 발췌의 부분 문자열인가, 그리고 `earliest`·`latest`·`year` 의 모든 숫자가 **그 발췌 텍스트 안에** 문자열로 존재하는가

현재 상태: `OK: all excerpts verbatim, all references resolve, budgets within limit`.

## 2. 장면 목록 (24개, 초·중·후기 분포)

| 장면 | 연도 | kind | 장소 표시 근거 |
|---|---|---|---|
| scene-goryeo-founding-918 | 918 | court | 철원 지역 앵커 (포정전 지점 미상) |
| scene-illicheon-936 | 936 | battle | 선산 지역 앵커 (출처가 "일선군(선산)" 명시) |
| scene-anyungjin-993 | 993 | siege | 안주 앵커로 대체 (원 지명 문덕군) |
| scene-seohui-damphan-993 | 993 | court | 동상, 담판 지점은 "거란의 군영"뿐 |
| scene-gujudaecheop-1019 | 1019 | battle | 구성 지역 앵커 (출처가 구주=평북 구성 명시) |
| scene-dongbuk-9seong-1107 | 1107–1109 | construction | **좌표 없음 — 학설 대립** |
| scene-myocheong-nan-1135 | 1135 | siege | 평양 지역 앵커 (출처가 서경=평양 명시) |
| scene-bohyeonwon-1170 | 1170 | court | 개성 앵커 (출처는 "개경 동남쪽"만) |
| scene-manjeok-1198 | 1198 | assembly | 개성 앵커 (북산 지점 미상) |
| scene-ganghwa-cheondo-1232 | 1232 | construction | 강화 지역 앵커 + 1232~1270 국도 존속 구간 |
| scene-cheoinseong-1232 | 1232 | battle | **유적 좌표** 37.14750/127.16861 |
| scene-daejanggyeong-pangak-1237 | 1237–1248 | publication | 강화 앵커 (대장도감·분사대장도감) |
| scene-daejanggyeong-wanseong-1251 | 1251 | publication | 강화 앵커 (보관지 기준) |
| scene-jindo-yongjang-1270 | 1270 | construction | **featureId `khs-event-yongjang` 재사용** |
| scene-jindo-hamnak-1271 | 1271 | battle | 진도 섬 앵커 (남도석성 좌표 미확보) |
| scene-gaegyeong-hamnak-1361 | 1361 | siege | 개성 앵커 |
| scene-bokju-cheondo-1361 | 1361 | court | 안동 앵커 (출처가 복주=안동 명시) |
| scene-gaegyeong-suibok-1362 | 1362 | battle | 개성 앵커 |
| scene-mokhwa-jaebae-1363 | 1363 | construction | **유적 좌표** 35.28944/127.95778 |
| scene-mokhwa-doip-1363 | 1363 | court | **좌표 없음 — 경로 미서술** |
| scene-hwatongdogam-1377 | 1377 | construction | **좌표 없음 — 소재지 미서술**, 1377~1388 존속 구간 |
| scene-jikji-1377 | 1377 | publication | **유적 좌표** 36.64389/127.47139 |
| scene-jinpo-1380 | 1380 | naval | **좌표 없음 — 해역 좌표 미확보 (육상 앵커 사용 거부)** |
| scene-wihwado-hoegun-1388 | 1388 | assembly | 위화도 40.137/124.446 (문서 내 상충 값 병기) |

## 3. 지시사항 준수 확인

- **최우 / 1251년 문제**: `scene-daejanggyeong-wanseong-1251` 에서 최우는 `presence='related'`, 역할은 "대장도감 설치를 주도한 집권자(발기·후원 측)" 로만 두었다. 1251년 완성 현장 인물로 넣지 않았다. 판각 작업 자체는 별도 장면 `scene-daejanggyeong-pangak-1237` 에서 집단 행위자(`group-daejangdogam-ganghwa-1237-1248`)가 `on-site` 로 수행한다.
- **날짜 이견 유지**: 해인사 대장경 항목(1251년 완성)과 합천 해인사 대장경판 항목(1237년 판각 시작~1248년 목록 조성)의 서술이 다르므로 **합치지 않고** 이벤트·장면·클레임을 분리했다. `missing` 에도 기록했다.
- **위치 이견 유지**: 동북 9성은 함흥평야설·길주설·두만강 이북설이 갈린다는 출처 문장을 그대로 클레임으로 두고 좌표를 확정하지 않았다.
- **진영 분리**: 모든 충돌 장면에서 침입 측과 방어 측을 분리했고, 각 참가자 `role` 안에 소속(고려 측 / 거란 측 / 몽골 측 / 삼별초 측 / 서경 반란 측 / 개경 조정 측 / 홍건적 측 / 왜구 침입 측 / 고려 수군)을 한국어로 적었다.
- **집단은 사건별 ID**: 처인부곡민(1232), 개경 노비(1198), 대장도감 인원(1237–1248), 진포 왜구 선단(1380), 진포 고려 수군(1380)을 각각 별도 ID 로 만들었다. 전국 단위 하나의 주민 엔티티를 쓰지 않았다.
- **현장 vs 관련**: 명령·기획만 서술된 인물은 `related` 로 두었다 — 최우(강화천도·대장경), 윤관(9성), 김부식(1135년 서경 성내 행위 서술 없음), 이의방(보현원 현장 지목 없음), 최영·우왕(위화도 현장 아님), 왕건(일리천 관련 인물 목록에만 등장), 문익점(재배 실행자는 정천익), 성사달(서문만), 승화후 온·배중손(1270년 진도 축성 현장 서술 없음), 공민왕(1362년 탈환 전투 현장 서술 없음).
- **fire 효과**: 24개 장면 모두 `fire.enabled=false`. 이번에 내려받은 어떤 출처도 특정 사건·장소·시점의 소실·방화를 명시하지 않았다. 전쟁이니 불이 났을 것이라는 추정으로 켜지 않았다.
- **ships / attack**: 진포 해전만 `ships.enabled=true`(전함 100척·왜선 500여 척이 출처에 명시). `attack` 은 공격·격파·살해가 문면에 있는 8개 장면에서만 켰다.
- **수치·진형**: 병력 수(20만, 10만, 500여 척, 100척)는 모두 출처 문면 표기를 그대로 옮긴 것이고, 진형·이동 경로·소실 건물은 만들지 않았다. `visualActions` 에 "출처에 없으므로 표현하지 않는다"를 명시했다.
- **생몰 수집 안 함**: 이 실행은 사건·행위·장소만 수집했다. 생몰 연도 클레임은 하나도 만들지 않았다.

## 4. 좌표 근거의 성격 구분

- **historical action 근거**(무엇이 언제 어디서 일어났는가)는 전부 한국학중앙연구원 한국민족문화대백과사전 항목 본문이다.
- **geographic 좌표 근거**는 별도 소스로 분리했다. `src-kowiki-*` 5건(처인성·흥덕사지·위화도·용장산성·산청 목면시배 유지)은 위키백과 문서에 표시된 좌표이며, `coordinateNote` 에 "표시용 좌표이고 사건 배치의 사료 근거가 아니다"를 명시했다.
- **지역 앵커**는 `existing-place-anchors.json`(국편 1910~1945 행정 경계 범위 중심)만 사용했고, 매번 `anchorPlaceId` + `precision='area'` + "지역 기준 추정 배치" 설명을 붙였다.
- `khs-event-yongjang` 은 백과 항목의 주소(전남 진도군 군내면 용장리 106번지)가 existing-sites 기록과 같은 유적임을 확인한 뒤에만 재사용했다. 위키백과 용장산성 좌표(34.51556; 126.33806)와도 대조된다.

## 5. 남은 결손 (concrete missing links)

`result.json` 의 `missing` 배열에 14건이 구조화되어 있다. 핵심만 다시 적으면:

1. **진포 해역 좌표** — 진포 해전은 금강 하구 해상이다. 서천·군산 등 육상 군현 앵커를 쓰면 해전을 육지에 올리게 되므로 좌표를 비웠다. 국립해양조사원 등의 해역 좌표, 또는 진포대첩 관련 공식 지리 메타데이터가 필요하다.
2. **동북 9성** — 출처 자체가 세 학설이 갈린다고 밝힌다. 어느 설도 표시 기준으로 채택하지 않았다. 학설별 후보 좌표를 병기하려면 각 학설을 명시한 별도 근거가 필요하다.
3. **안융진성(평안남도 문덕군 신리)** — 문덕군 단위 좌표를 얻지 못했다. 위키백과 `문덕군` 문서에는 좌표가 없다. 인접 안주 앵커로 대체했고 지명 불일치를 `coordinateNote` 에 남겼다. 993년 두 장면이 이 한계를 공유한다.
4. **남도석성 좌표** — 배중손 전사지로 서술되지만 좌표를 못 얻어 진도 섬 앵커로 대체했다. 용장성 지점과 명시적으로 구분해 두었다.
5. **보현원 절터**, **개경 북산**, **강도(江都) 궁궐터**, **화통도감 소재지**, **1251년 완성 장소** — 모두 출처가 지점을 밝히지 않는다.
6. **위화도 좌표 상충** — 위키백과 위화도 문서가 제목 좌표(40.137; 124.446)와 섬 정보 상자(39.8702; 124.2941)에 서로 다른 값을 싣는다. 제목 좌표를 표시에 쓰고 두 값 모두 클레임으로 남겼다. 공식 지리 자료 확인이 필요하다.
7. **국가유산청 계열 접근 불가** — `www.khs.go.kr`, `www.cha.go.kr`, `www.heritage.go.kr` 는 이전 실행에서 연결 시간 초과로 확인되어 이번엔 요청하지 않았다. 지정 좌표를 얻지 못한 유적은 위키백과 표시 좌표로 대체하고 출처를 밝혔다.
8. **encykorea 검색 경로 차단** — `robots.txt` 가 `/Article/Search`, `/Article/Hashtag` 등을 금지한다. `/Article/Keyword/<term>` 은 금지 목록에 없어 시도했으나 25건 모두 404 였다(manifest 에 기록, 본문 미보존). 그래서 항목 ID 는 웹 검색으로 찾고 `/Article/E00xxxxx` 만 직접 내려받았다.
9. **미제작 장면 후보** — 1359년 홍건적 제1차 침입(같은 원본 파일에 서술 있음, 항목당 25단어 발췌 예산 때문에 1361년을 우선함), 삼국사기 편찬 1145, 노비안검법 956 / 과거제 958, 천리장성 1033–1044, 이자겸의 난 1126. 카탈로그에 이벤트 ID 는 있으나 이번 실행에서 해당 항목 원본을 내려받지 못했거나(삼국사기·광종·천리장성·이자겸) 예산상 미루었다.

## 6. 라이선스 표기

encykorea 본문의 텍스트 이용 조건을 페이지에서 확정하지 못해 모든 소스의 `license` 를 `unverified` 로 두었다. (미디어에는 공공누리 제1유형 표기가 보이지만 본문 텍스트에 그대로 적용된다고 단정할 근거를 확인하지 못했다.) 위키백과 문서도 라이선스 문자열을 내려받은 바이트에서 확인하지 못해 동일하게 `unverified` 로 두었다.

## 7. 수정 기록 — 날짜 인용 보강 (integration-review 대응)

`integration-review.json` 이 `claim-ganghwado-capital-span` 한 건을 지적했다. importer(`import_period_research.py`)는 time 객체의 `earliest`·`latest` 숫자가 **그 클레임이 인용한 단일 발췌 텍스트 안에** 문자열로 있어야 통과시킨다. 문제의 클레임은 1232~1270 구간을 주장하면서 1270년만 담긴 문장(`ex-cheondo-choeu`)을 인용했고, 시작 연도 1232는 같은 항목의 **다른 문장**(`ex-cheondo-1232`)에 있었다. 역사 서술은 옳지만 인용 연결이 부족한 경우였다.

수정 방식 — 사실은 그대로 두고 인용만 나눴다.

- 삭제: `claim-ganghwado-capital-span` (earliest 1232 / latest 1270, `ex-cheondo-choeu` 인용)
- 신설: `claim-ganghwado-capital-start-1232` — `syj:activeIn`, verbatim "1232년(고종 19) 몽골의 침략에 대항하기 위해 도읍지를 강화도로 옮긴 사건이다.", earliest=latest=1232, `ex-cheondo-1232` 인용
- 신설: `claim-ganghwado-capital-end-1270` — `syj:activeIn`, verbatim "1270년(원종 11) 개경(開京)으로 환도(還都)할 때까지 고려의 국도가 되었다.", earliest=latest=1270, `ex-cheondo-choeu` 인용
- `scene-ganghwa-cheondo-1232` 의 `dateClaimIds` 가 두 클레임을 **함께** 인용하도록 바꿨고(`actionClaimIds` 도 동일), 강화도가 국도였던 1232~1270 활동 구간은 두 경계 클레임의 조합으로 그대로 유지된다.

지키지 않은 것 / 하지 않은 것:
- 발췌를 새로 늘리지 않았다. `src-ency-ganghwa-cheondo` 는 기존 발췌 2개 그대로이고 총 **23 단어**로 25 단어 예산 안에 있다.
- 연도·연호를 바꾸거나 구간을 축소·삭제하지 않았다. 1232 시작과 1270 종료 모두 원문 문장을 그대로 인용해 유지된다.
- 다른 23개 장면과 나머지 클레임은 손대지 않았다.

검증: `result.json` 을 대상으로 importer 와 동일한 규칙(발췌의 raw 파일 원문 일치, URL당 25단어, time verbatim 부분문자열, 모든 숫자 경계의 발췌 내 존재, `이듬해`·기원전 예외 포함)을 독립 스크립트로 재적용한 결과 **문제 0건**이다. 전체 time 객체 5개(`ts-9seong-1107-1109`, `ts-pangak-1237-1248`, `ts-hwatongdogam-1377-1388`, `ts-ganghwado-gukdo-start-1232`, `ts-ganghwado-gukdo-end-1270`)와 모든 year 객체가 통과한다.

남는 한계(발명하지 않고 기록만 함): 이 출처는 강화도 국도 존속 구간을 **한 문장으로** 밝히지 않는다. 시작과 끝이 서로 다른 문장에 있어, 단일 발췌 인용으로는 구간 전체를 표현할 수 없다. 구간을 하나의 time 객체로 담으려면 1232와 1270을 동시에 포함하는 원문 문장을 담은 별도 근거가 필요하다.
