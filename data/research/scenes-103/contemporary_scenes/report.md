# 1946~2025 현대 장면 조사 보고 (contemporary_scenes)

- 담당 구간: 1946~2025년. 결과물: `result.json` (sources / entities / claims / scenes / missing), `manifest.json`, `progress.json`, 원본 바이트 `raw/`.
- 이번 실행은 재부팅으로 끊긴 이전 세션의 이어하기가 아니라 **새 세션**이다. 재부팅 전 활동 기록(`recovered-activity.json`)을 먼저 읽었고, 그 기록에는 카탈로그 구조 확인까지만 남아 있었다. 내려받은 원본은 하나도 남아 있지 않아 이번에 모두 새로 받았다.
- 장면 23개, 출처 33개, 클레임 127개. 1940년대부터 2020년대까지 각 10년대에 최소 1개 장면이 있다.
- 모든 발췌는 내려받은 바이트에서 HTML 태그를 벗기고 공백을 정규화한 텍스트에 **그대로 존재하는지 자동 검증**했고(`mk.py`), 웹페이지 1건당 발췌 낱말 수 25개 이하를 스크립트로 강제했다. `validate.py`는 클레임-발췌-엔터티-장면 참조, 좌표·정밀도·편 구분, 원본 파일 존재를 검사하며 현재 오류 0건이다.

## 1. 장면 목록
| 연도 | 장면 | 종류 | 장소 표시 | 좌표 근거 |
| --- | --- | --- | --- | --- |
| 1947~1954 | 제주4·3사건 — 제주도 (1947~1954) | battle | 제주도 (area) | 기존 area anchor `hgis-admin-121419` |
| 1948 | 대한민국 정부수립 선포식과 제헌국회 — 중앙청 (1948) | assembly | 중앙청 앞뜰 (옛 조선총독부 청사, 경복궁 앞) (area) | `src-kowiki-gyeongbokgung-geo` |
| 1950 | 인천상륙작전 — 인천 해안·월미도 (1950) | naval | 인천 해안·월미도 (area) | `src-kowiki-wolmido` |
| 1953 | 판문점 군사정전협정 조인 (1953) | assembly | 판문점 (area) | `src-kowiki-panmunjom` |
| 1960 | 4·19혁명 — 마산 3·15 항의 시위와 김주열 (1960) | assembly | 마산 (중앙부두 앞바다 포함) (area) | 기존 area anchor `hgis-admin-150534` |
| 1967 | 한국수출산업공업단지(구로공단) 준공식 (1967) | construction | 구로동 공업단지 (한국수출산업공단본부 광장) (area) | `src-kowiki-guro-station` |
| 1970 | 경부고속도로 완전 개통 준공식 (1970) | construction | 경부고속도로 대구~부산 구간 (area) | 기존 area anchor `hgis-admin-174575` |
| 1970 | 전태일 분신 항거 — 서울 평화시장 (1970) | fire | 서울 평화시장 (area) | **좌표 없음** |
| 1973 | 포항제철소 제1고로 첫 쇳물과 1기 준공 (1973) | construction | 포항제철소 (포항만) (area) | 기존 area anchor `hgis-admin-157669` |
| 1974 | 서울지하철 1호선 개통식 — 청량리역 (1974) | construction | 청량리 지하철역 (site) | `src-kowiki-cheongnyangni` |
| 1975 | 여의도 국회의사당 준공과 이전 (1975) | construction | 여의도 국회의사당 (site) | `src-kowiki-assembly-building` |
| 1979 | 부마민주항쟁 — 부산대학교에서 시작된 시위 (1979) | assembly | 부산대학교 구내 도서관 앞 (area) | 기존 area anchor `hgis-admin-145002` |
| 1980 | 5·18민주화운동 — 전남도청과 금남로 (1980) | battle | 전남도청 (광주 금남로 일대) (site) | 기존 site feature `khs-event-jeonnam-office` |
| 1983 | KBS '이산가족을 찾습니다' 생방송과 여의도광장 인파 (1983) | assembly | 여의도광장 (KBS 특별생방송 인파) (area) | `src-kowiki-yeouido-park` |
| 1987 | 명동대성당 추모미사와 박종철 사건 진상 폭로 — 6월항쟁의 해방구 (1987) | assembly | 명동성당(명동대성당) (site) | `src-kowiki-myeongdong-cathedral` |
| 1988 | 서울올림픽 — 잠실 올림픽 주경기장 (1988) | assembly | 잠실 올림픽 주경기장 (site) | `src-kowiki-olympic-stadium` |
| 1993 | 대전엑스포 — 대덕연구단지 일대 (1993) | assembly | 대전 대덕연구단지 일대 (엑스포 행사장) (area) | 기존 area anchor `hgis-admin-24523` |
| 1995 | 조선총독부 청사(중앙청) 철거 — 경복궁 앞 (1995) | construction | 옛 조선총독부 청사 자리 (경복궁 앞) (area) | `src-kowiki-gyeongbokgung-geo` |
| 2001 | 인천국제공항 개항 — 영종도 매립지 (2001) | construction | 인천국제공항 (영종도) (site) | `src-kowiki-incheon-airport` |
| 2005 | 청계천 복원 — 고가도로 철거와 물길 개방 (2005) | construction | 청계천 (복원 구간) (area) | `src-kowiki-cheonggye-plaza` |
| 2009 | 나로우주센터 설립과 나로호 1차 발사 — 고흥 외나로도 (2009) | construction | 나로우주센터 (전남 고흥군 봉래면 외나로도) (site) | `src-enwiki-naro-space-center` |
| 2018 | 2018년 판문점 남북정상회담 — 평화의 집 (2018) | assembly | 판문점 평화의 집 (area) | `src-kowiki-panmunjom` |
| 2021 | 누리호 1차 발사 (2021) | construction | 나로우주센터 (전남 고흥군) (area) | `src-enwiki-naro-space-center` |

## 2. 사용한 출처

기관별로는 국가기록원 '기록으로 만나는 대한민국' 주제 문서 15건, 한국민족문화대백과사전 4건, 대한민국 정책브리핑 1건, 위키백과(좌표 표기용) 13건이다. 위키백과는 **역사 서술 근거로 쓰지 않았고 좌표 표시에만** 썼다.

| 출처 ID | 발행 기관 | 제목 | 발췌 낱말 | 이용조건 표기 |
| --- | --- | --- | --- | --- |
| `src-archives-419` | 행정안전부 국가기록원 | 기록으로 만나는 대한민국 > 국가상징·의례 > 4.19혁명 기념 | 24 | unverified |
| `src-archives-518` | 행정안전부 국가기록원 | 기록으로 만나는 대한민국 > 국가상징·의례 > 5.18 광주민주화운동 | 23 | unverified |
| `src-archives-airport` | 행정안전부 국가기록원 | 기록으로 만나는 대한민국 > 경제·산업 > 국제공항 | 23 | unverified |
| `src-archives-cheonggyecheon` | 행정안전부 국가기록원 | 기록으로 만나는 대한민국 > 문화·체육 > 청계천 | 20 | unverified |
| `src-archives-expo` | 행정안전부 국가기록원 | 기록으로 만나는 대한민국 > 경제·산업 > 엑스포 | 19 | unverified |
| `src-archives-exway` | 행정안전부 국가기록원 | 기록으로 만나는 대한민국 > 경제·산업 > 경부고속도로 | 24 | unverified |
| `src-archives-guro` | 행정안전부 국가기록원 | 기록으로 만나는 대한민국 > 경제·산업 > 구로공단 | 24 | unverified |
| `src-archives-intlsports` | 행정안전부 국가기록원 | 기록으로 만나는 대한민국 > 문화·체육 > 올림픽과 월드컵 | 25 | unverified |
| `src-archives-joseonchong` | 행정안전부 국가기록원 | 기록으로 만나는 대한민국 > 사회 > 조선총독부 청사 철거 | 20 | unverified |
| `src-archives-jsa` | 행정안전부 국가기록원 | 기록으로 만나는 대한민국 > 국방·외교 > 판문점 | 23 | unverified |
| `src-archives-myeongdong` | 행정안전부 국가기록원 | 기록으로 만나는 대한민국 > 문화·체육 > 명동성당 | 25 | unverified |
| `src-archives-parliament` | 행정안전부 국가기록원 | 기록으로 만나는 대한민국 > 정치·행정 > 국회의사당 | 22 | unverified |
| `src-archives-pohang-steel` | 행정안전부 국가기록원 | 기록으로 만나는 대한민국 > 경제·산업 > 포항제철 | 23 | unverified |
| `src-archives-reunion` | 행정안전부 국가기록원 | 기록으로 만나는 대한민국 > 국방·외교 > 이산가족찾기 | 23 | unverified |
| `src-archives-satellite` | 행정안전부 국가기록원 | 기록으로 만나는 대한민국 > 과학·기술 > 인공위성 | 23 | unverified |
| `src-archives-subway` | 행정안전부 국가기록원 | 기록으로 만나는 대한민국 > 사회 > 지하철 | 23 | unverified |
| `src-encykorea-buma` | 한국학중앙연구원 한국민족문화대백과사전 | 부마민주항쟁 - 한국민족문화대백과사전 | 24 | 공공누리 |
| `src-encykorea-incheon-landing` | 한국학중앙연구원 한국민족문화대백과사전 | 인천상륙작전 - 한국민족문화대백과사전 | 25 | unverified |
| `src-encykorea-jeju43` | 한국학중앙연구원 한국민족문화대백과사전 | 제주4·3사건 - 한국민족문화대백과사전 | 22 | 공공누리 |
| `src-encykorea-jeon-taeil` | 한국학중앙연구원 한국민족문화대백과사전 | 전태일 - 한국민족문화대백과사전 | 23 | unverified |
| `src-enwiki-naro-space-center` | Wikipedia (English) contributors | Naro Space Center - Wikipedia | 2 | CC BY-SA 4.0 |
| `src-koreakr-nuri` | 문화체육관광부 대한민국 정책브리핑(korea.kr) | 한국형 우주발사체(누리호) - 대한민국 정책브리핑 | 23 | unverified |
| `src-kowiki-assembly-building` | 위키백과(한국어) 기여자 | 대한민국 국회의사당 - 위키백과 | 2 | CC BY-SA 4.0 |
| `src-kowiki-cheonggye-plaza` | 위키백과(한국어) 기여자 | 청계광장 - 위키백과 | 2 | CC BY-SA 4.0 |
| `src-kowiki-cheongnyangni` | 위키백과(한국어) 기여자 | 청량리역 - 위키백과 | 2 | unverified |
| `src-kowiki-guro-station` | 위키백과(한국어) 기여자 | 구로역 - 위키백과 | 2 | CC BY-SA 4.0 |
| `src-kowiki-gyeongbokgung-geo` | 위키백과(한국어) 기여자 | 경복궁 - 위키백과 | 2 | CC BY-SA 4.0 |
| `src-kowiki-incheon-airport` | 위키백과(한국어) 기여자 | 인천국제공항 - 위키백과 | 2 | CC BY-SA 4.0 |
| `src-kowiki-myeongdong-cathedral` | 위키백과(한국어) 기여자 | 명동성당 - 위키백과 | 2 | CC BY-SA 4.0 |
| `src-kowiki-olympic-stadium` | 위키백과(한국어) 기여자 | 서울올림픽주경기장 - 위키백과 | 2 | CC BY-SA 4.0 |
| `src-kowiki-panmunjom` | 위키백과(한국어) 기여자 | 판문점 - 위키백과 | 2 | CC BY-SA 4.0 |
| `src-kowiki-wolmido` | 위키백과(한국어) 기여자 | 월미도 - 위키백과 | 2 | unverified |
| `src-kowiki-yeouido-park` | 위키백과(한국어) 기여자 | 여의도공원 - 위키백과 | 2 | CC BY-SA 4.0 |

## 3. 좌표를 세운 방식 (역사 서술과 분리)

1. **기존 site feature 재사용** — 같은 유적을 가리킬 때만. 5·18 장면은 `khs-event-jeonnam-office`(광주 전라남도청 구 본관)를 그대로 썼고, 이 점이 **현재 국가유산 목록 건물의 위치**이지 1980년 공방의 공간 범위가 아니라는 사실을 `coordinateNote`에 적었다.
2. **기존 area anchor 재사용** — 출처가 지역 이름까지만 밝힌 경우(제주도, 마산, 부산, 대구, 대전, 영일). `precision='area'`이며 국사편찬위원회 1910~1945 경계 자료의 화면 배치용 중심점이라는 점을 매 장면에 적었다.
3. **위키백과 표시 좌표** — 출처가 특정 시설을 이름으로 밝혔지만 공공기관 좌표를 얻지 못한 경우(청량리역, 월미도, 판문점, 명동성당, 경복궁, 여의도공원, 잠실 주경기장, 청계광장, 국회의사당, 인천국제공항, 구로역, 나로우주센터). 문서의 geo 마이크로포맷 값을 그대로 인용하고, **현재 시설 위치 표기**라는 한계를 적었다.
4. **좌표 없음** — 전태일 장면(서울 평화시장)은 근거 있는 좌표를 얻지 못해 `lon`/`lat`을 `null`로 두었다. 가까운 흥인지문 좌표로 대신 놓지 않았다.

바다·해안 처리: 인천상륙작전은 `medium='sea'`로 두고 월미도 표시점을 area 정밀도로만 썼다. 함대 정박 해면 좌표를 지어내지 않았고, 해상 활동을 내륙 중심점으로 옮기지도 않았다.

## 4. 기존 카탈로그 재사용

동일성이 확인된 ID만 재사용했다(사건 12건, 인물 2건, 장소 2건): `event-encykorea-jeju43`, `event-encykorea-rok-government-1948`, `event-encykorea-korean-war`, `event-korean-armistice`, `event-encykorea-419-1960`, `event-encykorea-jeon-taeil-immolation-1970`, `event-encykorea-buma-1979`, `event-encykorea-518-1980`, `event-encykorea-june-uprising-1987`, `event-encykorea-park-jongchul-torture-1987`, `event-encykorea-seoul-olympics-1988`, `event-panmunjom-declaration`, `person-encykorea-jeon-taeil`, `person-encykorea-park-chunghee`, `place-encykorea-seoul-pyeonghwa-market`, `place-encykorea-gwangju-1980`.

문서 항목(`event-korean-armistice`, `event-panmunjom-declaration`)은 **행위 사건과 합치지 않고** 새 사건(`event-panmunjom-armistice-signing-1953`, `event-panmunjom-summit-2018`)을 만든 뒤 `syj:relatedTo`로 이었다.

부대·집회 인파처럼 사건마다 다른 집단은 사건별 ID로 따로 만들었다(예: `polity-518-citizen-army`, `polity-518-martial-law-army`, `polity-buma-students-1979`). 스키마의 엔터티 종류가 `Person|Event|Place|Polity`뿐이라 방송사(KBS)·참석자 집단도 `Polity`로 넣었다. 조직 종류가 필요하면 가져오는 쪽에서 바꿔야 한다.

## 5. 편(side) 구분과 효과

- 충돌 장면은 두 편을 절대 합치지 않았다. 5·18은 시민군(defender)과 계엄군(invader), 제주4·3은 남로당 무장대와 토벌대, 1960 마산과 1979 부마는 시위대(civilian)와 진압 경찰(defender)로 나누고 각 참가자 `role`에 진영을 한국어로 적었다.
- `fire`는 전태일 장면 하나에만 켰다. 출처가 '근로기준법 화형식', '분신'이라고 명시하기 때문이다. 전쟁 장면이라고 해서 불을 켜지 않았다.
- `ships`/`attack`은 인천상륙작전(261척 함정, 함포사격)과 5·18(공방·재진입)에만 켰고 각각 근거 클레임을 달았다.
- 병력 수·대형·이동 경로·불탄 건물은 출처에 있는 수치 외에는 쓰지 않았다.

## 6. 남은 빈칸 (구체적 미연결 고리)

- **서울 평화시장 좌표** — 전태일 분신 장소인 평화시장의 좌표를 담은 공공기관 페이지를 얻지 못했다(위키백과 '평화시장' 문서에 좌표 없음, nominatim은 robots 불허, 국가유산청 계열은 이전 실행에서 접속 불가). 인근 흥인지문 좌표로 대체하지 않았다.
  - 영향: `scene-jeon-taeil-1970`
- **인천상륙작전 해면 좌표** — 상륙 함대가 있던 해면이나 상륙 해안(그린·레드·블루 비치)의 공공기관 좌표를 얻지 못해 위키백과 월미도 좌표를 area 기준으로만 썼다.
  - 영향: `scene-incheon-landing-1950`
- **경부고속도로 준공식장** — 국가기록원 서술은 준공식이 열린 장소 이름을 적지 않는다. 그래서 대구 area anchor로만 배치했다.
  - 영향: `scene-gyeongbu-expressway-1970`
- **포항제철소 실측 좌표** — 포항제철소 부지의 공공기관 좌표를 얻지 못했다(위키백과 '포항제철소' 문서 없음). 영일 area anchor로만 배치했다.
  - 영향: `scene-pohang-steel-1973`
- **2018 판문점선언 남측 참석자** — 국가기록원 판문점 서술의 해당 문장은 김정은 국무위원장만 이름을 적는다. 문재인 대통령의 이 행위 현장 근거를 같은 발췌에서 얻지 못해 참가자로 세우지 않았다.
  - 영향: `scene-panmunjom-summit-2018`
- **부산대학교 좌표** — 부마민주항쟁 시작 지점(부산대 구내 도서관 앞)의 공공기관 좌표를 얻지 못해 부산 area anchor로만 배치했다.
  - 영향: `scene-buma-busan-1979`
- **마산 중앙부두 좌표** — 김주열 시신이 발견된 마산 중앙부두 앞바다의 좌표를 얻지 못해 마산 area anchor를 썼다. 바다 지점을 육지 중심으로 옮겨 표시하지 않도록 medium은 land, precision은 area로 두었다.
  - 영향: `scene-masan-419-1960`
- **1953 정전협정 조인식장 좌표** — 조인식이 열린 판문점 목조 건물의 위치를 특정한 공공기관 좌표를 얻지 못해 위키백과 판문점 좌표를 area로 썼다.
  - 영향: `scene-panmunjom-armistice-1953`
- **1948년 제헌국회 개원 날짜** — 국가기록원 국회의사당 서술은 '이곳에서 제헌국회가 개원되었는데'라고만 적어 개원 날짜가 문장에 없다. 같은 기관의 조선총독부 청사 문서에는 1948년 5월 31일 개의가 적혀 있으나 발췌 낱말 한도 때문에 인용하지 못했다.
  - 영향: `scene-rok-founding-1948`
- **2002 한일월드컵 장소** — 국가기록원 '올림픽과 월드컵' 서술은 개최지를 '한국과 일본'과 '거리'로만 적고 경기장 이름을 밝히지 않는다. 거리응원 장면을 특정 좌표에 놓을 근거가 없어 이번 장면 목록에서 뺐다.
  - 영향: (장면 없음 / 이번에 만들지 못한 주제)
- **6·25전쟁 중 중앙청 방화 연도** — 조선총독부 청사 문서는 '북한군은 퇴각하면서 중앙청에 불을 질렀는데'라고만 적고 연도를 밝히지 않는다. 연도를 추정해 화재 장면을 만들지 않았다.
  - 영향: (장면 없음 / 이번에 만들지 못한 주제)
- **2021년 누리호 발사 장소 문장** — 정책브리핑 페이지의 2021년 1차 발사 서술에는 발사 장소가 적혀 있지 않다. 같은 페이지의 2018년 시험발사체 문장이 밝힌 '전남 고흥군 나로우주센터'를 근거로 배치하고 그 한계를 좌표 설명에 적었다.
  - 영향: `scene-nuri-launch-2021`
- **구로공단 준공식장 좌표** — '한국 수출산업공단본부 광장'의 좌표를 얻지 못해 같은 구로동의 구로역 좌표를 area 기준으로 썼다.
  - 영향: `scene-guro-complex-1967`
- **1987년 6월항쟁 전국 국면** — 이번에 내려받은 국가기록원 명동성당 서술은 명동성당의 역할만 적는다. 서울 시청 앞·전국 도시의 6월항쟁 집회 장소와 날짜를 담은 기관 자료는 확보하지 못했다.
  - 영향: `scene-myeongdong-1987`
- **2022년 누리호 2차 발사** — 정책브리핑 해당 페이지는 2022년 4월까지 운영된 자료라 2022년 6월 21일 2차 발사 성공을 담고 있지 않다. 2022년 이후 사건은 이번 범위에서 근거를 갖춘 장면으로 만들지 못했다.
  - 영향: (장면 없음 / 이번에 만들지 못한 주제)

### 접근하지 못한 경로 (이번 실행에서 실제로 확인한 것)

- `ko.wikipedia.org/api/rest_v1/`, `www.wikidata.org/w/api.php`, `www.wikidata.org/wiki/Special:EntityData` — robots.txt가 막아 쓰지 않았다. 대신 허용된 `/wiki/` 문서 HTML의 geo 표기를 읽었다.
- `nominatim.openstreetmap.org/search` — robots.txt 불허. 지오코딩을 하지 않았고, 그래서 평화시장·구로공단 광장 같은 지점의 좌표를 만들지 못했다.
- `www.ccourt.go.kr`(헌법재판소), `www.seoul.go.kr`, `www.history.go.kr`, `contents.history.go.kr`(우리역사넷) — robots.txt 불허. 2017년 탄핵 심판 같은 법정 장면을 이 경로로 만들지 못했다.
- `theme.archives.go.kr/robots.txt`는 404를 돌려준다(규칙 없음). 본문 페이지는 정상 응답이라 그대로 받았다.
- `encykorea.aks.ac.kr/Article/Search`는 robots.txt 불허라서 항목 검색을 못 했다. 항목 ID는 웹 검색으로 찾은 뒤 허용된 `/Article/E…` 주소만 직접 내려받았다.

## 6-1. 인용 수리 (integration-review.json 대응, 사후 수정)

가져오기 스크립트는 time 객체의 모든 숫자 연도 값이 **인용문 안에 문자열로 존재**해야 통과시킨다(`import_period_research.py` 139~147행). 검토 파일이 지적한 건은 1건이다.

- `claim-pohang-1973-date` — time verbatim은 '같은 해 7월 3일'인데 인용문이 `"같은 해 7월 3일 조강연산"`뿐이라 1973이라는 값이 인용문에 없었다. 국가기록원 원문은 `"…포항제철소의 제1고로에서 1973년 6월 첫 쇳물을 토해냈다. 이어 같은 해 7월 3일 조강연산…"`으로 이어지므로, **연도를 담은 앞 문장부터 준공일까지를 하나의 연속 인용으로 넓혔다**(`ex-pohang-firstiron`). 짧게 잘렸던 `ex-pohang-date`는 지우고 날짜 클레임이 넓힌 인용을 가리키게 했다.
- 바뀐 것은 인용 범위와 클레임의 인용 연결뿐이다. 사실·날짜·기간은 그대로다. time verbatim은 원문 표기 '같은 해 7월 3일'을 유지했고, 준공일(1973년 7월 3일)이라는 시점도 그대로다. 이 장면은 하루 시점이라 시작·종료를 나눌 구간이 없어 날짜 클레임은 1개를 유지했다.
- `src-archives-pohang-steel`의 발췌 낱말 수는 22 → 23으로, URL당 25낱말 한도 안이다.
- 같은 규칙을 result.json의 time·year 클레임 24건 전부에 다시 적용해(`check_dates.py`, 가져오기 스크립트의 판정 로직을 그대로 옮긴 검사) 위반 0건을 확인했다. 제주4·3처럼 시작·종료가 있는 구간(`1947년 3월 1일부터 1954년 9월 21일까지`)은 두 연도가 모두 한 인용문 안에 있어 손대지 않았다. 나머지 22개 장면도 그대로다.

## 7. 다음 실행에 넘기는 제안

1. 평화시장·구로공단 광장·부산대·마산 중앙부두처럼 **이름은 확실한데 좌표만 없는 지점**을 공공 지리 자료(브이월드, 도로명주소 등 키가 필요한 API 포함)로 채우면 장면 4개의 정밀도가 바로 올라간다.
2. 1961년 5·16, 1972년 유신 선포, 1979년 10·26, 1997년 외환위기, 2000·2007년 남북정상회담은 카탈로그에 사건 ID가 이미 있으나 **행위 장소를 밝힌 문장**을 이번에 확보하지 못해 장면을 만들지 않았다. 한국민족문화대백과사전 해당 항목 ID를 확보하면 대부분 해결된다.
3. 2022년 이후(누리호 2차 발사 등)는 기관 문서가 최신화되어 있지 않아 비어 있다. 과학기술정보통신부·항우연 보도자료를 받으면 2020년대 장면을 늘릴 수 있다.
