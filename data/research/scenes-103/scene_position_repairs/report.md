# scene_position_repairs — 세 장면의 위치 보수 (이슈 #103)

수집·다운로드·발췌: Claude Opus 5 (Max). 작업 범위는 이미 있는 세 장면의 **배치 문제 해결**뿐이며 새 시대 묶음을 만들지 않았다.
`result.json` 에는 `scene-jinpo-1380`, `scene-jeon-taeil-1970`, `scene-nuri-launch-2021` 세 장면만 들어 있다.

| 항목 | 수 |
| --- | --- |
| sources | 11 (기존 재사용 6 · 신규 5) |
| excerpts | 18 (모든 URL별 합계 25낱말 이하) |
| claims | 28 (기존 복사 18 · 신규 10) |
| entities | 10 |
| scenes | 3 |
| missing | 4 |
| manifest 레코드 | 16 (인용 11 · 조사용 5) |

기존 사건·인물·장면 ID는 그대로 뒀다: `event-goryeo-jinpo-1380`, `person-ency-nase`, `person-ency-choemuseon`,
`person-ency-simdeokbu`, `place-ency-jinpo`, `event-encykorea-jeon-taeil-immolation-1970`, `person-encykorea-jeon-taeil`,
`place-encykorea-seoul-pyeonghwa-market`, `event-nuri-first-launch-2021`, `place-naro-space-center`.

---

## 1. scene-jinpo-1380 — 금강 하구 표시점을 넣었다

**전** `lon/lat = null`. **후** `126.66669, 36.0`, `medium="sea"`, `precision="area"`.

동일성 확인을 먼저 했다. 고려 쪽 출처는 진포를 "금강 하구의 진포"(최무선 항목)이자
"진포(鎭浦: 지금의 충청남도 서천)"(나세 항목)로 적는다. `../ancient_scenes/` 가 `scene-anc-gibeolpo-676`(같은 금강 하구)용으로
내려받아 둔 위키데이터 레코드 Q489139 의 저장 바이트에서 다음 세 가지를 직접 확인했다.

- `Geum River (Q489139)` — 항목 자체
- `native label 금강 (Korean)` — 한국어 이름이 '금강'
- `coordinate location 36°0'0.0"N, 126°40'0.1"E applies to part river mouth` — P625 값의 한정어가 **강 하구**

즉 출처가 말하는 "금강 하구"와 이 지리 레코드가 같은 대상임이 바이트로 확인되어, 하구 공통 표시점으로만 재사용했다.
전투 지점의 실측 좌표가 아니며 `coordinateNote` 에 그렇게 적었다.

물 매질을 지켰는지 확인하려고 `../ancient_scenes/coastline.json`(국편 HGIS 1910~1945 육지 다각형, MultiPolygon 102개)에
even-odd 레이캐스팅을 돌렸다.

- (126.66669, 36.0) → 육지 다각형 **밖**, 가장 가까운 육지 꼭짓점까지 약 **0.76 km** → 바다
- 검산: 서천 읍내(126.6919, 36.0805) 육지 / 군산 시가(126.7369, 35.9678) 육지 / 서해 앞바다(126.30, 36.00) 바다

서천·군산 같은 **내륙 군현 중심점은 쓰지 않았다.** 기존 10개 claim 은 손대지 않고 그대로 복사했고,
하구 표시점 근거로 `claim-spr-geum-mouth-coord`, `claim-spr-geum-identity` 두 개만 새로 만들었다.

## 2. scene-jeon-taeil-1970 — 서울 지역 기준 추정 배치

**전** `lon/lat = null`. **후** `126.99, 37.56`, `precision="area"`, 주석에 `지역 기준 추정 배치` 명시.

먼저 실제 지점 좌표를 찾아봤고, 없다는 것을 세 군데에서 확인했다.

- 한국어 위키백과 `평화시장 (서울)` — 좌표 표기 없음. 다만 정보상자에 **주소**가 있다: `서울시 중구 청계천로 274 (을지로6가)`
- 영어 위키백과 `Seoul Peace Market` — 좌표 표기 없음
- 위키데이터 `Q12621852` — P625 없음. `located in the administrative territorial entity Jung District` 만 있음

그래서 주소·행정구역까지는 출처 근거로 남기고(`claim-spr-pyeonghwa-address`, `claim-spr-pyeonghwa-area`,
`claim-spr-pyeonghwa-jung-district`) 배치는 지역 기준으로 했다.

`anchorPlaceId` 는 채우지 못했다. 지정된 `../contemporary_scenes/existing-place-anchors.json` 은
국편 1910~1945 군현 앵커 **354개**인데 라벨을 모두 훑어도 서울·경성·한성·중구가 하나도 없다(간성·강릉·고양·과천·인천 …).
맞출 앵커가 없으므로 필드를 지어내지 않고 비웠고 이유를 `coordinateNote` 와 `missing` 에 적었다.

대신 이 컬렉션의 다른 서울 장면들이 이미 쓰고 있는 기준점을 그대로 썼다 — 위키데이터 서울(Q8684) 의
`coordinate location 37°33'36"N, 126°59'24"E` → (126.99, 37.56). `modern_scenes`(임오군란·한성순보·아관파천·경술국치·태화관)과
`joseon_early_scenes` 가 같은 점을 같은 문구로 쓴다.

중구(Q50441) 표시점(37°33'21"N, 126°58'13"E)도 받아서 비교했는데, 주소로 어림하면 시장 자리에서 3~4 km로
서울 표시점(2 km 안팎)보다 오히려 멀어 쓰지 않았다. 두 거리 모두 주소에서 어림한 값이고 측량값이 아니다. 이 판단 근거로 받은 바이트도 manifest 에 남겼다(`citedInResult: false`).

**아는 서울 장면을 좌표 없이 두지 않았고**, 동시에 실제 지점이 아님을 라벨·주석·`missing` 세 곳에 적었다.

## 3. scene-nuri-launch-2021 — 2018년 게이팅을 2021년 장소 근거로 교체

**전** `place.claimIds = ["claim-kslv-2018-launch"]` — 2018년 시험발사체 문장으로 2021년 발사를 배치.
**후** `place.claimIds = ["claim-spr-nuri-2021-place", "claim-spr-naro-site-spec", "claim-coord-naro"]`.

새 근거는 **발사 당일 정책브리핑 기사**(korea.kr 148894641, 작성 청와대, 작성일 2021.10.21)다.

- `문 대통령은 이날 전남 고흥군 나로우주센터를 찾아 발사를 참관하고 결과를 보고받은 뒤`
- `누리호 발사 참관 후 대국민 메시지…"내년 5월 반드시 성공할 것" 2021.10.21`

여기에 개발 주관기관 근거를 더했다(한국항공우주연구원 누리호 페이지).

- `2021년 10월 21일 누리호 1차 비행시험이 진행되었다`
- `발사장소 : 나로우주센터(전남 고흥군 봉래면 하반로 508) 동경 127.53도, 북위 34.43도`

**정확히 무엇이 확인되고 무엇이 아닌지.** "2021년 10월 21일 나로우주센터에서 발사했다"를 한 문장에 담은 자료는
접근 범위에서 찾지 못했다. 확인된 것은 (a) 2021년 10월 21일자 정부 기사가 그날 대통령이 전남 고흥군 나로우주센터에 가서
**누리호 발사를 참관**했다고 적는다는 것, (b) 항우연이 1차 비행시험 날짜를 2021년 10월 21일로 적는다는 것,
(c) 항우연이 누리호 발사장을 나로우주센터로 적고 주소·좌표를 준다는 것이다. (c)의 제원표는 **3차 발사** 상세 항목에 붙어 있어
2021년 발사의 장소 근거로는 쓰지 않고 시설 좌표 근거로만 썼다. 이 한계를 `coordinateNote` 와 `missing` 에 적었다.
이전 배치의 2018년 시험발사체 claim 세 개(`claim-kslv-2018-launch`, `claim-kslv-2018-date`,
`claim-nuri-2021-facility-link`)는 이 장면에서 뺐다 — 그 문장들은 2021년 발사의 장소 근거가 아니었기 때문이다.
(그 claim 들은 `contemporary_scenes` 묶음에 그대로 남아 있다.)

**실패를 지웠는지 확인.** 지우지 않고 오히려 근거를 만들었다. 이전 묶음은 실패를 요약·연출 메모에만 두고 claim 이 없었는데,
같은 정책브리핑 페이지에서 `위성모사체를 목표궤도인 고도 700 km 태양동기궤도에 투입하지는 못했다.` 를 발췌해
`claim-spr-nuri-2021-outcome` 을 새로 만들고 장면 `actionClaimIds` 에 넣었다. 요약도
"…이륙했으나 위성모사체를 목표 궤도인 고도 700 km 태양동기궤도에 투입하지는 못했다"로 고쳐 성공으로 읽히지 않게 했다.
2018년 문장을 뺀 자리에 이 발췌를 넣어 이 출처의 낱말 예산은 22낱말(≤25)로 유지된다.

좌표 자체는 기존 값 `127.535, 34.43194`(영어 위키백과 Naro Space Center 표시 좌표)를 그대로 뒀다.
항우연 표기 `동경 127.53도, 북위 34.43도` 와 어긋나지 않는다.

---

## 원본 바이트와 무결성

모든 바이트는 이 디렉터리의 `raw/` 안에 있고 각 source 의 `rawFile` 은 디렉터리 안에서 해석된다.
재사용한 6개는 원 묶음에서 복사한 뒤 sha256·byteLength 를 **다시 계산해 원 manifest 값과 일치함을 확인**했고,
새로 받은 5개는 직접 내려받았다. `manifest.json` 은 url / fetchedUtc / httpStatus / byteLength / sha256 을 담는다.

| rawFile | 출처 | 상태 |
| --- | --- | --- |
| `raw/ency-E0057297-choemuseon.html` | goryeo_scenes 복사 | 해시 일치 |
| `raw/ency-E0011388-nase.html` | goryeo_scenes 복사 | 해시 일치 |
| `raw/encykorea-jeon-taeil.html` | contemporary_scenes 복사 | 해시 일치 |
| `raw/korea-kr-nuri.html` | contemporary_scenes 복사 | 해시 일치 |
| `raw/enwiki-naro-space-center.html` | contemporary_scenes 복사 | 해시 일치 |
| `raw/wikidata-Q489139-geumgang.html` | ancient_scenes 복사 | 해시 일치 |
| `raw/kowiki-pyeonghwa-market-seoul.html` | 신규 다운로드 | 200 · 118,591 B |
| `raw/wikidata-Q12621852-pyeonghwa-market.html` | 신규 다운로드 | 200 · 66,777 B |
| `raw/wikidata-Q8684-seoul.html` | 신규 다운로드 | 200 · 1,061,099 B |
| `raw/koreakr-148894641-nuri-launch.html` | 신규 다운로드 | 200 · 176,089 B |
| `raw/kari-nuri-51.html` | 신규 다운로드 | 200 · 287,557 B |

조사용으로 받았지만 인용하지 않은 5건(korea.kr 148915636 / 148893722 / 148891557, 영어 위키백과 Seoul Peace Market,
위키데이터 Q50441)도 manifest 에 `citedInResult: false` 와 사유를 붙여 남겼다. 왜 그 자료를 쓰지 않았는지 대조할 수 있게 하기 위함이다.

**robots.** 모든 요청 전에 해당 호스트의 robots.txt 를 받아 우리 UA 와 `*` 양쪽에 대해 확인했다.
`https://www.wikidata.org/wiki/Special:EntityData/Q8684.json` 은 robots 가 막아 **받지 않았고**, 허용된 항목 페이지
`https://www.wikidata.org/wiki/Q8684` 로 대체했다. korea.kr 통합검색 결과 페이지는 정적 바이트에 결과가 없어 폐기했다.
모든 하위 프로세스는 창 없이 실행했고 브라우저·터미널 창을 띄우지 않았다.

## 발췌 검증

`scripts/import_period_research.py` 의 검사를 그대로 옮긴 `validate.py` 로 대조했다.

- URL별 발췌 낱말 합계 ≤ 25 — 최대 24(나세), 그다음 23(최무선·전태일·발사당일 기사)
- 발췌 18개 전부가 저장 바이트의 `HTMLParser` 추출 텍스트(원문/공백정규화/노드공백 세 뷰 중 하나)에 **그대로 존재**
- 숫자 연도·경계값이 모두 그 인용 안에 있음: 1380 / 1970 / 2021(×3) — `verbatim` 도 인용문 안에 존재
- sha256·byteLength 가 manifest 와 source 양쪽에서 일치, `rawFile` 이 이 디렉터리 안에서 해석됨
- 장면이 가리키는 claim·source id 가 모두 실재, 세 장면 모두 좌표가 채워짐, `sea` 장면의 점이 육지 밖

결과: `all importer checks pass`.

## 남은 공백 (`missing`)

1. **진포 해전 지점의 실측 좌표** — 배치점은 금강 하구 공통 표시점이며 전투 지점이 아니다.
2. **평화시장 지점 좌표** — 세 곳에서 좌표 없음을 확인. 주소(중구 청계천로 274)까지만 출처로 확인했고,
   제공된 앵커 목록에 서울 항목이 없어 `anchorPlaceId` 를 맞추지 못했다. 주소로 어림한 차이는 2 km 안팎(측량값 아님).
3. **누리호 1차 발사 장소를 한 문장에 적은 자료** — 못 찾았다. 발사 당일 기사 + 항우연 날짜 표기를 조합했다.
4. **누리호 1차 발사대(제2발사대)의 좌표** — 시설 표시점만 있고 발사대 지점은 없다.
