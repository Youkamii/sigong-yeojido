# 1876~1945 장면 조사 보고 (modern_scenes)

담당 구간: 1876~1945. 산출물은 이 폴더 안에만 있다.

## 결과 요약

- `result.json` — 장면 21개, 근거 claim 135개, 출처 35개, entity 92개, missing 10항목
- `progress.json` — 장면이 하나씩 완성될 때마다 갱신(마지막 갱신 상태 기록)
- `manifest.json` — 실제 내려받은 원본 70건(url, fetchedUtc, httpStatus, byteLength, sha256)
- `raw/` — 응답 바이트 원본. result.json 의 모든 인용은 이 파일들에서 잘라 낸 연속 문자열이다.
- 재현 스크립트: `fetch.py`(내려받기), `body.py`/`sent.py`(문장 확인), `verify.py`(정규화), `build.py`+`scenes*.py`+`run_build.py`(결과 생성)

인용 규칙: 웹페이지 1건당 인용 총량 25단어 이하를 코드에서 강제했고(초과 시 빌드 실패), 인용문은 타이핑이 아니라 원본 바이트에서 잘라 냈다. 실제로 원문에는 호환한자(예: 金 U+F90A)가 섞여 있어 손으로 옮겨 적으면 원문과 달라진다.

## 장면 목록

| 연도 | scene id | kind | 사건 | 장소 표기 | precision / 좌표 | 좌표 근거 |
|---|---|---|---|---|---|---|
| 1876 | scene-ganghwa-treaty-1876 | court | 조일수호조규(강화도조약) 조인 | 강화부 강화 연무당(鍊武堂) | area / 126.44284, 37.71023 | anchor hgis-admin-557 |
| 1882 | scene-imo-gullan-1882 | battle | 임오군란 | 한성 궁궐과 도성 일원 (출처 표기: 궐내·궁궐) | area / 126.99000, 37.56000 | src-wikidata-q8684 |
| 1883 | scene-hanseong-sunbo-1883 | publication | 『한성순보』 창간 | 서울 저동(苧洞, 현 을지로2가) 통리아문 박문국 | area / 126.99000, 37.56000 | src-wikidata-q8684 |
| 1884 | scene-gapsin-1884 | assembly | 갑신정변 | 우정국 (개청 축하 연회장) | site / 126.98261, 37.57443 | src-kowiki-ujeongchongguk |
| 1894 | scene-hwangtohyeon-1894 | battle | 황토현 접전 | 황토현(黃土峴) 일대 | area / 126.85841, 35.54347 | anchor hgis-admin-95335 |
| 1894 | scene-ugeumchi-1894 | battle | 우금치 싸움 | 우금치(牛金峙) | site / 127.11153, 36.43102 | src-kowiki-ugeumchi |
| 1895 | scene-eulmi-sabyeon-1895 | battle | 을미사변 | 경복궁 (출처 표기: 경복궁 기습) | area / 126.97722, 37.57861 | src-kowiki-gyeongbokgung |
| 1896 | scene-agwan-pacheon-1896 | court | 아관파천 | 러시아공사관 (서울 정동) | area / 126.99000, 37.56000 | src-wikidata-q8684 |
| 1897 | scene-hwangudan-1897 | court | 환구단 황제 즉위식 | 환구단 | site / 126.97972, 37.56500 | src-kowiki-hwangudan |
| 1898 | scene-manmin-1898 | assembly | 만민공동회 | 종로 (만민공동회 개최 장소) | area / 126.98340, 37.56990 | src-wikidata-q487603 |
| 1905 | scene-eulsa-1905 | court | 을사늑약 | 궁중 어전회의장 (인용은 “궁중”·“궁궐”까지만 명시) | area / 126.97250, 37.56667 | src-kowiki-jungmyeongjeon |
| 1907 | scene-gukchae-bosang-1907 | assembly | 국채보상운동 제창 | 대구 광문사(廣文社) | area / 128.56629, 35.85917 | anchor hgis-admin-174575 |
| 1909 | scene-harbin-1909 | battle | 하얼빈역 저격 (1909) | 하얼빈역 (중국 헤이룽장성) | site / 126.62444, 45.75778 | src-kowiki-harbin-station |
| 1910 | scene-annexation-1910 | court | 한일병합 어전회의 | 서울 (서울거리와 어전회의장) | area / 126.99000, 37.56000 | src-wikidata-q8684 |
| 1919 | scene-aunae-1919 | assembly | 아우내 장터 독립만세운동 | 갈전면 아우내[並川] 장터 (현 천안 병천) | area / 127.31223, 36.79304 | src-wikidata-q16182156 |
| 1919 | scene-jeamri-1919 | fire | 제암리 학살과 방화 (1919) | 화성 제암리 (제암리 교회당과 마을) | site / 126.89255, 37.12566 | featureId khs-event-jeamri |
| 1919 | scene-taehwagwan-1919 | assembly | 민족대표의 태화관 집결 | 서울 인사동 태화관(泰華館) | area / 126.99000, 37.56000 | src-wikidata-q8684 |
| 1919 | scene-tapgol-1919 | assembly | 탑골공원 독립선언서 낭독 (1919) | 탑골공원 | site / 126.98861, 37.57111 | src-kowiki-tapgol |
| 1920 | scene-cheongsanri-1920 | battle | 청산리대첩 (1920) | 청산리 일대 (간도, 한반도 지도 범위 밖) | area / 없음(null) | — |
| 1929 | scene-gwangju-student-1929 | assembly | 광주학생운동 제1차 가두 투쟁 (1929) | 광주 시가 (광주고등보통학교 등 학생들의 가두 투쟁) | area / 126.90738, 35.15335 | src-kowiki-gwangju-ilgo |
| 1945 | scene-gwangbok-geonjun-1945 | assembly | 8·15광복과 건국준비위원회 결성 (1945) | (장소 미상 — 인용 출처에 광복 당일 장소와 건준 결성 장소 | area / 없음(null) | — |

- 기간 분포: 1876·1882·1883·1884·1894(2)·1895·1896·1897·1898·1905·1907·1909·1910·1919(4)·1920·1929·1945
- 유형 분포: assembly 8, battle 6, court 5, publication 1, fire 1
- 한반도 캔버스 밖: `scene-harbin-1909`(하얼빈역, 좌표 있음), `scene-cheongsanri-1920`(간도, 좌표 없음). 두 장면 모두 `place.outsidePeninsula=true` 로 표시했고 반도 안으로 옮기지 않았다.
- 불(fire) 효과는 `scene-jeamri-1919` 하나뿐이다. "총칼로 학살하고 불을 질렀다", "민가 30여 호를 불태운 참변" 이라는 명시 서술이 있는 경우에만 켰다. 갑신정변은 별궁 방화가 *실패*했다고 적혀 있어 껐고, 을미사변의 시신 소각 서술은 인용 절 밖이라 켜지 않았다.
- 기존 ID 재사용: event-ganghwado-treaty-1876, event-encykorea-samil-movement-1919, event-khs-jeamri, event-encykorea-cheongsanri-1920, event-encykorea-harbin-1909, event-gojong-imperial-enthronement-1897, event-encykorea-daehanjeguk-proclaimed-1897, event-korea-japan-annexation-treaty, event-encykorea-donghak-nongmin-1894, event-encykorea-gwangbok-1945 / 인물 신헌·고종·흥선대원군·전봉준·안중근·유관순·김좌진·홍범도·여운형·순종 / 장소 place-encykorea-ganghwabu, place-encykorea-taehwagwan, place-encykorea-cheongsanri, place-khs-jeamri, place-gyeongbokgung / 사이트 피처 khs-event-jeamri. 1919년 보성사 인쇄 장면은 이미 있으므로 만들지 않았다.

## 출처

| id | 제목 | 발행 | raw | sha256(앞 12) |
|---|---|---|---|---|
| src-ek-ganghwado-joyak | 강화도조약 - 한국민족문화대백과사전 (E0001508) | 한국학중앙연구원 한국민족문화대백과사전 | raw/encykorea-E0001508-ganghwado-joyak.html | 1f218f9f8630 |
| src-ek-imo-gullan | 임오군란 - 한국민족문화대백과사전 (E0047565) | 한국학중앙연구원 한국민족문화대백과사전 | raw/encykorea-E0047565.html | 38810666e23a |
| src-ek-hanseong-sunbo | 한성순보 - 한국민족문화대백과사전 (E0061736) | 한국학중앙연구원 한국민족문화대백과사전 | raw/encykorea-E0061736.html | 3eee73c16290 |
| src-ek-gapsin | 갑신정변 - 한국민족문화대백과사전 (E0000922) | 한국학중앙연구원 한국민족문화대백과사전 | raw/encykorea-E0000922.html | e1c53c1940c6 |
| src-ek-donghak | 동학운동 - 한국민족문화대백과사전 (E0016865) | 한국학중앙연구원 한국민족문화대백과사전 | raw/encykorea-E0016865-donghak-nongmin.html | 0589643f6370 |
| src-ek-jeon-bongjun | 전봉준 - 한국민족문화대백과사전 (E0049437) | 한국학중앙연구원 한국민족문화대백과사전 | raw/encykorea-E0049437.html | 715a991cb87e |
| src-ek-eulmi-sabyeon | 을미사변 - 한국민족문화대백과사전 (E0042948) | 한국학중앙연구원 한국민족문화대백과사전 | raw/encykorea-E0042948.html | 629c19e4b505 |
| src-ek-agwan-pacheon | 아관파천 - 한국민족문화대백과사전 (E0034214) | 한국학중앙연구원 한국민족문화대백과사전 | raw/encykorea-E0034214.html | d47a4ec9d5e5 |
| src-ek-gwangmu | 광무 - 한국민족문화대백과사전 (E0005117) | 한국학중앙연구원 한국민족문화대백과사전 | raw/encykorea-E0005117.html | baf03d611a1e |
| src-ek-daehanjeguk | 대한제국 - 한국민족문화대백과사전 (E0015187) | 한국학중앙연구원 한국민족문화대백과사전 | raw/encykorea-E0015187.html | ad81d2fdcd85 |
| src-ek-manmin | 만민공동회 - 한국민족문화대백과사전 (E0017594) | 한국학중앙연구원 한국민족문화대백과사전 | raw/encykorea-E0017594.html | cb211d33bb6d |
| src-ek-eulsa | 을사늑약 - 한국민족문화대백과사전 (E0042958) | 한국학중앙연구원 한국민족문화대백과사전 | raw/encykorea-E0042958.html | 7413eccc3d87 |
| src-ek-gukchae-bosang | 국채보상운동 - 한국민족문화대백과사전 (E0006527) | 한국학중앙연구원 한국민족문화대백과사전 | raw/encykorea-E0006527.html | 493dbdafe325 |
| src-ek-an-junggeun | 안중근 - 한국민족문화대백과사전 (E0035026) | 한국학중앙연구원 한국민족문화대백과사전 | raw/encykorea-E0035026.html | b4883cb0774b |
| src-ek-annexation-1910 | 한일병합조약 - 한국민족문화대백과사전 (E0061926) | 한국학중앙연구원 한국민족문화대백과사전 | raw/encykorea-E0061926.html | 63618a36d5f5 |
| src-ek-samil | 3·1운동 - 한국민족문화대백과사전 (E0026772) | 한국학중앙연구원 한국민족문화대백과사전 | raw/encykorea-E0026772.html | c0529399bd91 |
| src-ek-tapgol | 탑골공원 - 한국민족문화대백과사전 (E0058835) | 한국학중앙연구원 한국민족문화대백과사전 | raw/encykorea-E0058835.html | dbc9a5ed22ad |
| src-ek-cheonan-samil | 천안 3·1운동 - 한국민족문화대백과사전 (E0055955) | 한국학중앙연구원 한국민족문화대백과사전 | raw/encykorea-E0055955-cheonan-samil.html | 8668c5f3f793 |
| src-ek-jeamri | 수원 제암리 참변 - 한국민족문화대백과사전 (E0031610) | 한국학중앙연구원 한국민족문화대백과사전 | raw/encykorea-E0031610.html | d694d61163de |
| src-ek-cheongsanri | 청산리대첩 - 한국민족문화대백과사전 (E0056468) | 한국학중앙연구원 한국민족문화대백과사전 | raw/encykorea-E0056468.html | b65f3f26644e |
| src-ek-gwangju-student | 광주학생운동 - 한국민족문화대백과사전 (E0005301) | 한국학중앙연구원 한국민족문화대백과사전 | raw/encykorea-E0005301.html | 74dc2778b786 |
| src-ek-gwangbok | 8·15광복 - 한국민족문화대백과사전 (E0059769) | 한국학중앙연구원 한국민족문화대백과사전 | raw/encykorea-E0059769.html | 06cc8add306c |
| src-ek-yeo-unhyeong | 여운형 - 한국민족문화대백과사전 (E0036436) | 한국학중앙연구원 한국민족문화대백과사전 | raw/encykorea-E0036436.html | 9428999a42c5 |
| src-kowiki-ujeongchongguk | 우정총국 - 위키백과 | 위키미디어 재단 · 위키백과(한국어) | raw/kowiki-ujeongchongguk.html | 83dbd73145ff |
| src-kowiki-gyeongbokgung | 경복궁 - 위키백과 | 위키미디어 재단 · 위키백과(한국어) | raw/kowiki-gyeongbokgung.html | 81d032900dc4 |
| src-kowiki-hwangudan | 환구단 - 위키백과 | 위키미디어 재단 · 위키백과(한국어) | raw/kowiki-hwangudan.html | 742327b6cce1 |
| src-kowiki-jungmyeongjeon | 중명전 - 위키백과 | 위키미디어 재단 · 위키백과(한국어) | raw/kowiki-jungmyeongjeon.html | cca1bb994ee0 |
| src-kowiki-ugeumchi | 우금치 - 위키백과 | 위키미디어 재단 · 위키백과(한국어) | raw/kowiki-ugeumchi.html | 69cf7918a965 |
| src-kowiki-tapgol | 탑골공원 - 위키백과 | 위키미디어 재단 · 위키백과(한국어) | raw/kowiki-tapgol.html | d607a50b4119 |
| src-kowiki-harbin-station | 하얼빈역 - 위키백과 | 위키미디어 재단 · 위키백과(한국어) | raw/kowiki-harbin-station.html | 3e337ba4e4c3 |
| src-kowiki-gwangju-ilgo | 광주제일고등학교 - 위키백과 | 위키미디어 재단 · 위키백과(한국어) | raw/kowiki-gwangju-ilgo.html | 73c484a3c087 |
| src-wikidata-q16182156 | 병천면 (Q16182156) - 위키데이터 | 위키미디어 재단 · 위키데이터 | raw/wikidata-Q16182156.json | ed9477a71565 |
| src-wikidata-q8684 | 서울특별시 (Q8684) - 위키데이터 | 위키미디어 재단 · 위키데이터 | raw/wikidata-Q8684.json | 8a2c2a2b898e |
| src-wikidata-q487603 | 보신각 (Q487603) - 위키데이터 | 위키미디어 재단 · 위키데이터 | raw/wikidata-Q487603.json | aabd50a829cc |
| src-enwiki-jeamni | Jeamni massacre - Wikipedia | 위키미디어 재단 · Wikipedia ( | raw/enwiki-jeamni.html | a626b114da9c |

## 좌표 처리 원칙

1. 사료(사건·행위·인물) 근거와 좌표 근거를 분리했다. 좌표 출처는 `place.coordinateSourceIds` 에만 넣었다.
2. 국사편찬위원회 1910~1945 경계 자료 기반 anchor(강화·정읍·대구)는 행정구역 표시 중심이므로 `precision='area'` 로만 썼다.
3. 위키백과/위키데이터 좌표는 "현재 위치 표시"임을 좌표 note 에 적었다. 광주 장면의 좌표는 광주고등보통학교의 후신인 현재 광주제일고 위치이며 1929년 가두 투쟁 지점이 아니라고 명시했다.
4. 출처가 장소를 특정하지 못한 경우(임오군란의 '궁궐', 을사늑약의 '궁중', 아관파천의 공사관 실측 좌표, 태화관 터, 저동 박문국 터)에는 서울 도시 표시점을 `area` 로 쓰고 note 에 차이를 적었다. 좌표가 아예 없는 두 장면은 null 로 두었다.
5. 무작위 배치·임의 보정은 하지 않았다.

## 남은 연결 고리 (missing)

- **우금치 싸움의 진압 측 부대 표기** — 전봉준 항목의 인용 절은 공주 공격과 우금치 대패만 적고 맞선 부대 이름(일본군·정부군)은 뒤 문장에 있어 페이지당 25단어 인용 한도 안에서 넣지 못했다. 그래서 이 장면에는 진압 측 참가자를 세우지 않았다. (관련 장면: scene-ugeumchi-1894)
- **구 러시아공사관 실측 좌표** — 위키백과 「구 러시아 공사관」 문서와 위키데이터 Q12585324 모두 좌표(P625)가 없고, 국가유산청 계열 사이트는 이번 지침상 요청하지 않았다. 그래서 서울 도시 표시점으로만 배치했다. (관련 장면: scene-agwan-pacheon-1896)
- **을사늑약 체결 장소의 문헌 확정** — 인용한 한국민족문화대백과사전 본문은 “궁중”·“궁궐”로만 적고 경운궁 중명전을 명시하지 않는다. 중명전 좌표는 표시용으로만 썼고, 체결 장소를 확정하는 별도 근거는 이번에 내려받지 못했다. (관련 장면: scene-eulsa-1905)
- **하얼빈 의거 날짜 표기 차이** — 안중근 항목 요약문은 “9월 하얼빈역에서 이토를 사살”로 적고, 같은 사전의 다른 서술과 기존 카탈로그 인용은 1909년 10월 26일로 적는다. 두 표기를 합치지 않고 연도(1909)만 확정했다. (관련 장면: scene-harbin-1909)
- **한일병합조약 조인 자체의 시각·장소** — 인용한 문장은 8월 22일 어전회의 절차까지만 적는다. 조인 시각·장소(통감관저 등)를 확정하는 인용은 페이지당 25단어 한도 안에서 넣지 못했다. (관련 장면: scene-annexation-1910)
- **청산리 일대 좌표** — 위키데이터 청산리 전투(Q490156)와 위키백과 문서 모두 좌표가 없어 간도 청산리의 지리좌표를 얻지 못했다. 한반도 밖 사건이라 임의 배치를 하지 않고 lon/lat 을 비워 두었다. (관련 장면: scene-cheongsanri-1920)
- **1945년 광복 당일의 장소 있는 장면** — 8·15광복 항목과 여운형 항목의 인용문 모두 장소를 적지 않아 좌표를 비웠다. 장소가 붙은 광복 episode(서대문형무소 출옥, 총독부와의 행정권 이양 교섭, 서울역·거리 환영 등)는 별도 출처 확보가 필요하다. (관련 장면: scene-gwangbok-geonjun-1945)
- **1926년 6·10만세운동과 1932년 훙커우공원 의거 장면** — 두 사건의 한국민족문화대백과사전 항목 ID를 이번 실행에서 확인하지 못했고(사전 검색 경로는 robots 로 차단), 김구 항목 인용만으로는 훙커우공원이라는 장소가 확인되지 않아 장면을 만들지 않았다.
- **1930~40년대 국내 장면 밀도** — 1929년 광주학생운동 다음으로 1945년까지의 국내 장면은 이번 배치에 없다. 조선어학회사건·원산총파업 등은 항목 ID 확인과 추가 내려받기가 필요하다.
- **1896년 『독립신문』 창간 장면** — 서재필 항목은 1896년 4월 7일 창간 사실과 순 한글 민간 신문이라는 성격까지 적지만 발행 장소를 적지 않는다. 『독립신문』 항목의 사전 ID 를 이번 실행에서 확인하지 못해, 장소 근거 없이 장면을 만들지 않았다.

## 접근이 막혔거나 쓰지 않은 경로

- `encykorea.aks.ac.kr/robots.txt` 는 `/Article/Search` 등 검색 경로를 금지한다. 그래서 항목 ID 는 (a) 이미 내려받은 문서의 내부 링크 채굴, (b) 웹 검색 결과로만 찾았다.
- `gwangju.grandculture.net`(향토문화전자대전) robots.txt 는 `anthropic-ai` 를 포함한 AI 크롤러 목록에 `Disallow: /` 를 건다. 그래서 광주학생운동 관련 향토문화전자대전 페이지는 요청하지 않았다.
- 국사편찬위원회(우리역사넷 등) 계열 엔드포인트는 지침대로 요청하지 않았다.
- `sajeok.i815.or.kr`(독립기념관 사적지) 는 robots.txt 요청이 시간 초과로 실패해 더 시도하지 않았다.
- `en.wikipedia.org/wiki/Russian_legation_in_Seoul` 은 404 였다(manifest 에 그대로 기록). 그래서 구 러시아공사관 좌표를 얻지 못했다.

## 검증

`result.json` 에 대해 다음을 자동 확인했고 오류 0건이다: claim/source/excerpt ID 중복 없음, 모든 claim 의 `sourceId`·`citesExcerpt` 실재 및 상호 일치, 장면이 참조하는 모든 claimId·entityId 실재, side/presence/kind 값 유효, 좌표 출처 ID 실재, manifest 의 sha256·byteLength 가 디스크 파일과 일치.
