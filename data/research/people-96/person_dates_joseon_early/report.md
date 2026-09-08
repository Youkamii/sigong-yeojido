# 조선 전기 인물 연대 연결 (person_dates_joseon_early)

담당 ID 25건 전부를 처리했다. 24건은 전거가 확인된 연대를 붙였고, 1건은 근거를 찾지 못해 공백으로 남겼다.

## 방법
- `assigned-people.json`의 기존 엔티티 메타데이터와 원 사료 인용문(실록 계열 wca/wea/wfa)으로 먼저 인물을 특정한 뒤, 그 신원에 맞는 한국민족문화대백과사전 항목을 새로 내려받아 연대를 수집했다.
- 새 인물 ID를 만들지 않았고, 같은 이름·같은 인물이 서로 다른 사료 ID로 존재하는 경우(문종·황보인·정인지·허후)에도 병합하지 않고 각 ID에 개별 클레임을 달았다.
- 모든 발췌는 내려받은 원본 바이트에서 태그를 제거해 추출한 본문의 정확한 부분 문자열이며, 클레임의 모든 연도 숫자는 인용 발췌 안에 그대로 나온다. 간지·연호를 임의로 환산하지 않았다.
- 재위·생몰에서 장소를 추론하지 않았고, 거주 클레임이나 장면은 만들지 않았다.

## 자료 접근
- 한국민족문화대백과사전(encykorea.aks.ac.kr): robots.txt는 `/Article/Search`, `/Media/Search`, `/Article/WriterArticles`, `/Article/Hashtag`만 금지하며 `/Article/<ID>`는 허용된다. 20개 항목을 timeout 15초로 내려받아 `raw/`에 저장하고 `manifest.json`에 URL·시각·상태·바이트·SHA256을 기록했다.
- 「태조」(E0059033)는 형제 작업 `joseon_early_scenes`가 이미 받아 둔 원본을 SHA256 대조 후 복사했고, 원 수집 시각(2026-09-08T00:46:18Z)과 해시를 매니페스트에 그대로 보존했다.
- 조선왕조실록(sillok.history.go.kr)은 robots.txt가 `User-agent: *`에 대해 `Disallow: /`이므로 내려받지 않았다. 이 때문에 실록에만 남은 인물(시릉내시 이귀, 윤사로의 졸기)의 연대는 확보하지 못했다.

## 결과 요약
| ID | 인물 | 상태 | 연대 클레임 | 전거(encykorea 항목) |
|---|---|---|---|---|
| `ent-wca-taejo` | 태조 (太祖) | dated | bornIn 1335; diedIn 1408; reignedIn 1392~1398 | E0059033 |
| `ent-wca-min-je` | 민제 (閔霽) | dated | bornIn 1339; diedIn 1408 | E0020253 |
| `ent-wca-jeongangun` | 정안군 (靖安君) | dated | bornIn 1367; diedIn 1422; reignedIn 1400~1418; appearsIn 1392 | E0059039 |
| `ent-wca-yi-eung` | 이응 (李膺) | dated | bornIn 1365; diedIn 1414 | E0045490 |
| `ent-wca-min-mugu` | 민무구 (閔無咎) | dated | appearsIn 1410 | E0020099 |
| `ent-wca-min-mujil` | 무질(민무질) (無疾) | dated | appearsIn 1410 | E0020102 |
| `ent-wea-munjong` | 문종(휘 향) (文宗恭順欽明仁肅光文聖孝大王) | dated | bornIn 1414; diedIn 1452; reignedIn 1450~1452 | E0019665 |
| `ent-wea-sejong` | 세종장헌왕 (世宗莊憲王) | dated | bornIn 1397; diedIn 1450; reignedIn 1418~1450 | E0029857 |
| `ent-wea-ha-yeon` | 하연 (河演) | dated | bornIn 1376; diedIn 1453 | E0060659 |
| `ent-wea-hwangbo-in` | 황보인 (皇甫仁) | dated | appearsIn 1453; activeIn 1450 | E0065157 |
| `ent-wea-nam-ji` | 남지 (南智) | dated | appearsIn 1453; activeIn 1449 | E0012170 |
| `ent-wea-bak-jongu` | 박종우 (朴從愚) | dated | appearsIn 1464; activeIn 1447 | E0021170 |
| `ent-wea-jeong-inji` | 정인지 (鄭麟趾) | dated | bornIn 1396; diedIn 1478 | E0050800 |
| `ent-wea-heo-hu` | 허후 (許詡) | dated | appearsIn 1453; activeIn 1448 | E0063192 |
| `ent-wea-yi-sacheol` | 이사철 (李思哲) | dated | bornIn 1405; diedIn 1456 | E0044538 |
| `ent-wea-yi-gyejeon` | 이계전 (李季甸) | dated | bornIn 1404; diedIn 1459 | E0043613 |
| `ent-wfa-nosangun` | 노산군(휘 홍위) (魯山君) | dated | bornIn 1441; diedIn 1457; reignedIn 1452~1455 | E0013661 |
| `ent-wfa-munjong` | 문종공순왕 (文宗恭順王) | dated | bornIn 1414; diedIn 1452; reignedIn 1450~1452 | E0019665 |
| `ent-wfa-hwangbo-in` | 황보인 (皇甫仁) | dated | appearsIn 1453; activeIn 1450 | E0065157 |
| `ent-wfa-jeong-inji` | 정인지 (鄭麟趾) | dated | bornIn 1396; diedIn 1478 | E0050800 |
| `ent-wfa-heo-hu` | 허후 (許詡) | dated | appearsIn 1453; activeIn 1448 | E0063192 |
| `ent-wfa-jeong-cheok` | 정척 (鄭陟) | dated | bornIn 1390; diedIn 1475 | E0050992 |
| `ent-wfa-boseongyun-gyu` | 보성윤 㝓 (寶城 尹 㝓) | dated | bornIn 1410; activeIn 1450 | E0043480 |
| `ent-wfa-yun-saro` | 윤사로 (尹師路) | dated | activeIn 1455 | E0053135 |
| `ent-wfa-yi-gwi` | 이귀(시릉내시) (李貴) | unresolved | — | — |

## 판단이 필요했던 건
- **정안군(ent-wca-jeongangun)**: 원 사료(태종실록 총서)에서 정종의 후사가 없어 왕세자로 책봉된 '靖安君'이며, 사전 「태종」이 1392년 정안군 책봉과 정종의 양위를 함께 적어 동일인으로 확인된다. 같은 사료의 별도 ID(`ent-wca-taejong`)와 병합하지 않고 이 ID에만 생몰·재위·책봉 연도를 붙였다.
- **보성윤 㝓(ent-wfa-boseongyun-gyu)**: 사전 「이합(李㝓)」이 1450년 보성윤으로 강등되어 1466년까지 그 작호를 지녔고 주요 관직에 대전관이 올라 있어, 원 사료의 '寶城 尹 㝓爲代奠官'과 이름자·작호·직임이 모두 맞는다. 몰년은 사전이 '미상'이라 붙이지 않았다. 사전이 예로 든 대전관 사례는 1457년 단종 국상이어서, 원 사료의 1452년 문종 국상 건과 다른 기록이므로 그 해를 연대로 쓰지 않았다.
- **이응(ent-wca-yi-eung)**: 사전 「이응」은 태종대에 예조·호조판서와 병조판서를 지낸 동시대 李膺이고 참고문헌으로 『태종실록』을 들지만, 민무구·민무질과의 교유는 적지 않는다. 동명이인 가능성을 배제하지 못한 잠정 연결임을 클레임 note와 coverage에 남겼다.
- **윤사로(ent-wfa-yun-saro)**: 사전에 단독 항목이 없어 생몰년을 얻지 못했다. 「좌익공신」이 1455년 1등공신 명단에 '윤사로(尹師路)'를 올린 것에 근거해 활동 연도 1455년만 붙였고, 그 항목이 영천위·부마 표기를 하지 않으므로 이름 표기만으로 이은 잠정 연결임을 명시했다.
- **생년 미상 인물(황보인·남지·박종우·허후·민무구·민무질)**: 사전이 생년을 '미상'으로 적어 생몰 구간을 만들 수 없으므로, 기록된 사망 연도 한 해를 `syj:appearsIn`으로 두고 '연속적인 생존 기간이 아님'을 note에 적었다. 황보인·남지·박종우·허후는 사전이 연도를 명시한 관직 임명 연도를 `syj:activeIn`으로 추가했다.
- **허후 동명이인**: 우리 인물은 許詡(E0063192)이며 한자가 다른 許厚(E0063191)와 별개다. 사전은 1451년 직임을 우참찬으로 적어 원 사료의 '左參贊' 표기와 차이가 있어 그대로 남겼다.

## 남은 공백
- `ent-wfa-yi-gwi` (이귀, 시릉내시): 사전에 인물 항목이 없고(검색 결과는 문종·현릉·내시 제도 항목뿐), 유일한 1차 근거인 조선왕조실록은 robots.txt로 접근이 금지된다. 조선 중기 연평부원군 이귀(李貴) 같은 유명 동명이인으로 대체하지 않고 공백으로 남겼다.

## 산출물
- `result.json` (sources/entities/claims/scenes/missing), `coverage.json` (담당 ID 25건 전수), `progress.json`, `manifest.json`, `raw/`
- 재현 스크립트: `fetch.py`(수집), `extract.py`(본문 추출), `build.py`(발췌 캡처·검증), `build2.py`(클레임 생성), `verify.py`(독립 검증)
