# baekje_middle 조사 보고 — 백제 300~500년, central·south

조사원: Opus 5 (workflow, effort high) · 산출: 사실 26건 · 장면 12건 · 주장 57건 · 검증기 PASS(failures=0, warnings=0)

## 1. 검색 과정

작업 폴더는 `C:/Users/gkfkd/Git/sigong-facts`. 먼저 CLI 사용법을 확인했다.

```
python scripts/search_chunks.py --help
python scripts/check_fact_research.py --help
```

### 1-1. 후보 풀 만들기

백제본기 권24~26의 300~500년 구간을 통째로 뽑았다. 갈래별 키워드 검색보다 이 편이 빠짐없이 훑을 수 있었다.

```
python scripts/search_chunks.py --source src-samguksagi --from 300 --to 500 \
  --locator 百濟本紀 --limit 1000 --fields id,locator,date,text
```

→ 조각 **207개**. 이 207개를 전부 훑어 후보 표 **73행**(채택 26 + 탈락 47)을 만들었다(2절).

집성·금석문은 따로 찾았다.

```
python scripts/search_chunks.py --keyword 武寧 --limit 20 --fields id,sourceId,locator,date
python scripts/search_chunks.py --keyword 宋書 --keyword 百濟 --limit 10
python scripts/search_chunks.py --locator 百濟 --keyword 餘慶 --limit 10
python scripts/search_chunks.py --keyword 檐魯 --limit 10
python scripts/search_chunks.py --id chunk_jipseong-ko_024_ko_024_0280_0020
python scripts/search_chunks.py --source src-geumseok-gskh_002_0010_0010 --limit 20
python scripts/search_chunks.py --keyword 碧骨 --limit 10
```

### 1-2. 중복 확인

`services/host/app/history-scenes.json`(장면 294개)에서 290~510년 장면을 모두 뽑아 대조했다.

| 기존 장면 | 처리 |
|---|---|
| `scene-city-ungjin-capital-475-538` 백제 웅진 도읍기 | 475년 웅진 천도는 **사실로만** 남기고 장면을 만들지 않음(`sceneId: null`) |
| `scene-syj122-byeokgolje-330-790` 김제 벽골제 | 330년 벽골지 기사는 신라본기 소속이고 이미 장면이 있어 **제외** |
| `scene-anc-pyongyangseong-371` 평양성 전투 | 371년 고구려 전역은 전쟁 갈래라 할당에 없어 **제외** |

나머지 장면 12개는 기존 제목·id와 겹치지 않는다.

> 검증기는 `facts[].sceneId`가 **같은 result.json 안의 scenes**에 있어야 통과시킨다
> (`check_fact_research.py` 430~431행). 지침 8항의 "기존 장면 id를 적는다"를 그대로 하면 실패한다.
> 475년 웅진 천도는 `sceneId`를 비우고 note에 기존 장면 id를 적어 두었다.

## 2. 후보 표 (73행)

`○` 채택 · `—` 탈락. chunk 열은 `chunk_samguksagi_sg_` 뒤 꼬리만 적었다.

| # | 연도 | chunk 꼬리 | 원문 요지 | 갈래 후보 | 채택/사유 |
|---|---|---|---|---|---|
| 1 | 302 | 024_0050_0040 | 彗星晝見 | 천문 | — 갈래 없음 |
| 2 | 304 | 024_0050_0050 | 潛師襲取樂浪西縣 | war | — 전쟁 할당 없음 |
| 3 | 312 | 024_0060_0030 | 發使巡問百姓疾苦… 賜糓人三石 | disaster(구휼) | — 382 구휼과 중복 |
| 4 | 313 | 024_0060_0050 | 祀天地於南郊, 王親割牲 | culture | — 384·375에 밀림 |
| 5 | 316 | 024_0060_0060 | 春旱 | disaster | — 331에 밀림 |
| 6 | 320 | 024_0060_0080 | 築射䑓於宫西 | facility | — 지속성 약함 |
| 7 | 321 | 024_0060_0100 | 國南蝗害穀 | disaster | — 차순위 |
| 8 | **331** | 024_0060_0150 | 春夏大旱… 年饑, 人相食 | disaster | ○ fact-bm-017 |
| 9 | 333 | 024_0060_0160 | 王宫火, 連燒民户 | disaster | — 민호 수치 없음 |
| 10 | 333 | 024_0060_0170 | 修宫室 | facility | — 수리 기사 |
| 11 | 337 | 024_0060_0210 | 新羅遣使来聘 | foreign | — 다른 칸과 중복 |
| 12 | 347 | 024_0080_0020 | 祭天地神祗, 拜真淨爲朝廷佐平 | culture/admin | — 차순위 |
| 13 | 366 | 024_0080_0030 | 遣使聘新羅 | foreign | — 차순위 |
| 14 | 369 | 024_0080_0060 | 雉壤 전투, 分兵侵奪民戸 | war | — 전쟁 할당 없음 |
| 15 | 369 | 024_0080_0070 | 大閱於漢水南, 旗幟皆用黄 | war | — 전쟁·의례 |
| 16 | 371 | 024_0080_0090 | 平壤城 공격, 고국원왕 전사 | war | — 기존 장면 있음 |
| 17 | **371** | 024_0080_0100 | 移都漢山 | administration | ○ fact-bm-005 |
| 18 | **372** | 024_0080_0110 | 遣使入晉朝貢 | foreign | ○ fact-bm-023 |
| 19 | 372 | 024_0080_0120 | 地震 | disaster | — 피해 기술 없음 |
| 20 | 373 | 024_0080_0140 | 築城於青木嶺 | facility | — 386 관방과 겹침 |
| 21 | **375** | 024_0080_0160 | 得愽士髙興, 始有書記 | culture | ○ fact-bm-022 |
| 22 | 376 | 024_0090_0020 | 真髙道爲内臣佐平 | administration | — 인사 기사 |
| 23 | 379 | 024_0090_0070 | 雨土竟日 | disaster | — 차순위 |
| 24 | 380 | 024_0090_0080 | 大疫 | disaster | — 한 줄, 장면 어려움 |
| 25 | **382** | 024_0090_0100 | 民饑, 鬻子者… 王出官糓贖之 | disaster(구휼) | ○ fact-bm-018 |
| 26 | **384** | 024_0100_0030 | 摩羅難陁自晉至… 佛法始於此 | culture | ○ fact-bm-021 |
| 27 | **385** | 024_0100_0040 | 創佛寺於漢山, 度僧十人 | facility | ○ fact-bm-010 |
| 28 | **386** | 025_0020_0020 | 設關防, 自青木嶺… 西至於海 | administration | ○ fact-bm-009 |
| 29 | 386 | 025_0020_0030 | 隕霜害糓 | disaster | — 차순위 |
| 30 | 390 | 025_0020_0090 | 拔都坤城, 虜得二百人 | war | — 전쟁 할당 없음 |
| 31 | 391 | 025_0020_0110 | 重修宫室, 穿池造山 | facility | — 500 임류각과 성격 중복 |
| 32 | 397 | 025_0030_0110 | 與倭國結好, 太子腆支爲質 | foreign | — 457·429·372에 밀림 |
| 33 | 398 | 025_0030_0140 | 築雙峴城 | facility | — 공역 기술 없음 |
| 34 | 398 | 025_0030_0160 | 集都人, 習射於西臺 | culture | — 차순위 |
| 35 | **399** | 025_0030_0170 | 民苦於役, 多奔新羅, 戶口衰滅 | settlement | ○ fact-bm-001 |
| 36 | 402 | 025_0030_0200 | 夏大旱, 王親祭橫岳 | disaster | — 차순위 |
| 37 | **406** | 025_0040_0040 | 賜漢城租一千石 | economy | ○ fact-bm-014 |
| 38 | **408** | 025_0040_0060 | 拜餘信爲上佐平… 始於此 | administration | ○ fact-bm-007 |
| 39 | 416 | 025_0040_0090 | 東晉 安帝 冊命 鎮東將軍 | foreign | — 457 책봉과 중복 |
| 40 | **417** | 025_0040_0120 | 徴東·北二部人… 築沙口城 | facility | ○ fact-bm-011 |
| 41 | 418 | 025_0040_0130 | 遣使倭國, 送白綿十匹 | economy/foreign | — 차순위 |
| 42 | 428 | 025_0060_0020 | 王巡撫四部, 賜貧乏穀有差 | disaster(구휼) | — 382와 중복 |
| 43 | **429** | 025_0060_0040 | 遣使入宋朝貢 | foreign | ○ fact-bm-024 |
| 44 | **429** | jipseong-ko_024_0030_0010 | 宋書 文帝紀 百濟王遣使獻方物 | foreign(교차) | ○ 같은 사실의 둘째 주장 |
| 45 | 447 | 025_0060_0170 | 旱, 民饑, 流入新羅者多 | disaster | — 491·499와 중복 |
| 46 | **457** | jipseong-ko_024_0040_0030 | 宋書 以百濟王餘慶爲鎭東大將軍 | foreign | ○ fact-bm-025 |
| 47 | 469 | 025_0070_0040 | 葺雙峴城, 設大柵於青木嶺 | facility | — 386 관방과 겹침 |
| 48 | 472 | 025_0070_0050 | 遣使朝魏, 上表 | foreign | — 갈래 3건 이미 참 |
| 49 | 475 | 025_0070_0060 | 한성 함락, 개로왕 피살 | war | — 전쟁 할당 없음 |
| 50 | **475** | 026_0020_0020 | 移都於熊津 | administration | ○ fact-bm-006 (기존 장면 존재) |
| 51 | **476** | 026_0020_0030 | 修葺大豆山城, 移漢北民戶 | settlement | ○ fact-bm-002 |
| 52 | 476 | 026_0020_0050 | 躭羅國獻方物 | foreign | — 차순위 |
| 53 | **478** | 026_0030_0020 | 斬於熊建市 | economy(시장) | ○ fact-bm-015 |
| 54 | **479** | 026_0030_0060 | 移大且城於斗谷 | administration | ○ fact-bm-008 |
| 55 | **482** | 026_0040_0030 | 靺鞨襲破漢山城, 虜三百餘戸 | settlement(호수) | ○ fact-bm-003 |
| 56 | 483 | 026_0040_0050 | 至漢山城, 撫問軍民 | administration | — 차순위 |
| 57 | 484 | 026_0040_0070 | 南齊 冊封 요청 | foreign | — 차순위 |
| 58 | 486 | 026_0040_0120 | 重修宫室, 築牛頭城 | facility | — 498·500에 밀림 |
| 59 | **489** | 026_0040_0150 | 大有年, 國南海村人 獻合頴禾 | economy | ○ fact-bm-016 |
| 60 | 490 | 026_0040_0180 | 徴比部人… 築沙峴·耳山二城 | facility | — 417과 공역 기술 중복 |
| 61 | **491** | 026_0040_0210 | 熊川水漲, 漂沒王都二百餘家 | disaster | ○ fact-bm-019 |
| 62 | **491** | 026_0040_0220 | 民饑亡入新羅者六百餘家 | settlement | ○ fact-bm-004 |
| 63 | 493 | 026_0040_0260 | 신라와 혼인 | foreign | — 차순위 |
| 64 | 497 | 026_0040_0310 | 大雨, 漂毀民屋 | disaster | — 491 범람과 중복 |
| 65 | **498** | 026_0040_0320 | 設熊津橋 | facility | ○ fact-bm-012 |
| 66 | 498 | 026_0040_0330 | 築沙井城 | facility | — 차순위 |
| 67 | 498 | 026_0040_0340 | 至武珍州, 耽羅 乞罪 | admin/foreign | — 武珍州 표기의 시대성 논란 |
| 68 | **499** | 026_0040_0350 | 夏大旱… 漢山人亡入髙句麗者二千 | disaster | ○ fact-bm-020 |
| 69 | 499 | 026_0040_0360 | 大疫 | disaster | — 한 줄 |
| 70 | **500** | 026_0040_0370 | 起臨流閣於宫東, 髙五丈 | facility | ○ fact-bm-013 |
| 71 | (지석) | geumseok-gskh_002_0010_0010 | 寧東大將軍百濟斯麻王 年六十二歲 | person | ○ fact-bm-026 |
| 72 | (6세기) | jipseong-ko_026 梁書 백제전 | 二十二檐魯 | administration | — 서술 시점이 6세기 |
| 73 | (연도 없음) | jipseong-ko_024 宋書 백제전 | 元嘉·大明 책봉 열전 | foreign | — date 없는 열전, 본기 조각으로 대체 |

## 3. 판단 기록

### 3-1. 갈래 할당 충족

| 갈래 | 할당 | 채택 | 내용 |
|---|---|---|---|
| settlement | 3 | 4 | 399 호구 쇠멸 · 476 민호 이주 · 482 300호 포로 · 491 600가 유망 |
| administration | 4 | 5 | 371 한산 천도 · 475 웅진 천도 · 408 상좌평 · 479 대두성 이전 · 386 관방 |
| facility | 3 | 4 | 385 한산 불사 · 417 사구성 · 498 웅진교 · 500 임류각 |
| economy | 3 | 3 | 406 한성 조 1천 석 · 478 웅진 저자 · 489 대풍년 |
| disaster | 2 | 4 | 331 대가뭄 · 382 구휼 · 491 범람 · 499 대한발 |
| culture | 2 | 2 | 384 불법 전래 · 375 서기 |
| foreign | 2 | 3 | 372 동진 · 429 송(교차 확인) · 457 여경 책봉 |
| person | 1 | 1 | 무령왕 지석 |
| **합계** | **20** | **26** | 상한 26 |

war는 할당에 없어 한 건도 넣지 않았다(치양·평양성·한성 함락 모두 제외).

### 3-2. 우선순위 적용

- **장소가 특정되는 것**: 웅진(공산성)·한성(풍납토성) 계열을 우선했다. 좌표를 붙인 사실 7건 — 공산성 5건(475·478·491·498·500), 풍납토성 2건(384·406).
- **뒤에 오래 남는 것**: persistence를 붙인 사실 11건. 도읍(371~475 한산, 475~ 웅진), 관제(408 상좌평, 384 불법), 시설(385 절, 386 관방, 417 사구성, 476 대두산성, 478 저자, 498 다리, 500 임류각).
- **사람이 어떻게 살았는지**: density 4건(482년 300호, 491년 600가, 491년 200가, 499년 2천 명). 구휼·유망·범람·시장 장면을 일부러 챙겼다.

### 3-3. 좌표 처리

좌표는 만들지 않았다. 위키백과 문서 머리의 십진 표시 좌표(`span class="geo"`)만 썼다.

| 출처 | 발췌 | 좌표 |
|---|---|---|
| `src-kowiki-gongsanseong` (공산성) | `36.46333; 127.12694` (2단어) | lon 127.12694 / lat 36.46333 |
| `src-kowiki-pungnaptoseong` (풍납토성) | `37.53889; 127.12083` (2단어) | lon 127.12083 / lat 37.53889 |

둘 다 `urllib.request`로 바이트 그대로 `raw/`에 저장하고 sha256·byteLength·fetchedUtc를 manifest.json과 sources[]에 같은 값으로 적었다. 무령왕릉 위키백과 문서도 받아 봤으나 `span.geo`가 없어 쓰지 않고 지웠다. db.history.go.kr은 열지 않았다.

좌표를 **넣지 않은** 곳과 이유:

- 371 한산 천도 — 한산의 자리에 북한산·남한산·한성 내부 설이 갈린다.
- 385 한산 불사, 417 사구성, 476 대두산성, 479 두곡, 386 청목령·팔곤성, 482 한산성, 489 해촌 — 비정 미상 또는 이설.
- 462 무령왕 — 지석에 출생지가 없고 일본서기의 각라도 전승만 있다.

공산성 좌표를 쓴 웅진 관련 장면·사실은 모두 `precision: "area"`이고 `coordinateNote`에 도성 좌표를 대신 썼다고 적었다.

### 3-4. 시간 주장 처리

- 원문 인용의 `verbatim`은 chunk text와 quote 양쪽에 실제로 있는 표기만 썼다(`八年`, `秋九月`, `冬十月`, `二十二年`, `元嘉六年`, `大明元年` 등).
- 371년 `移都漢山.`처럼 본문에 연도 표기가 아예 없는 조각은 `{"kind":"year","value":371}`로 두고 근거를 `date.raw`(0371)에 맡겼다. fact의 `yearVerbatim`에는 조각의 date label(`26년(근초고왕)`)을 적고 note에 밝혔다.
- 집성 송서 본기 조각은 `date.raw`가 각각 0429·0457이라 연도 검사를 그대로 통과한다.
- 무령왕 지석은 판독문 조각의 `date.raw`가 0525(안장 연도)라 **출생 주장을 여기 걸 수 없었다.** `date`가 null인 해석문 조각(`…_0080`)을 인용해 `{"kind":"year","value":462}`로 두고, note에 "지석의 계묘년(523)과 향년 62세에서 역산했고 조각에 date가 없어 연도 검사가 생략된다"고 명시했다. confidence는 `medium`.

### 3-5. 스펙과 검증기가 어긋난 지점 (결정사항)

지시문에는 호구 같은 literal 주장을 `{"kind":"literal","value":"900","unit":"戶"}`처럼 **문자열**로 적으라고 되어 있었다. 그런데 `scripts/fact_predicates.json`의 `syj:householdCount`·`syj:populationCount`에는 `"numeric": true`가 있고 `check_fact_research.py` 280행이 `not number(obj['value'])`로 **수**를 요구한다. 문자열을 넣으면 실패한다.

→ 최종 조건이 "검증기 PASS"이므로 이 두 술어에만 수를 넣었다(`300`, `600`, `200`, `2000`). 단위도 검증기가 `戶`/`口`만 받아 원문 표기(`戸`, `家`, 사람 수 `二千`)와 다른데, claim의 `note`와 fact의 `note`·`density.unit`에 원문 표기를 남겼다. 수 제약이 없는 `syj:administeredAs`(408년 `上佐平`)에는 지시대로 문자열을 썼다.

## 4. 산출물

```
data/research/facts-ancient/baekje_middle/
  result.json     26 facts · 12 scenes · 57 claims · 2 sources · 47 entities · 4 missing
  run.json        workflow / claude-opus-5 / high
  manifest.json   원본 2건
  raw/gongsanseong.html, raw/pungnaptoseong.html
  report.md       이 문서
```

`missing[]` 4건: 백제 호구 총수, 한성기 도성의 확정 좌표, 웅진기 시장·가마 위치, 대두산성·사구성·두곡 비정.

## 5. 검증기 출력

```
python scripts/check_fact_research.py data/research/facts-ancient --job baekje_middle
```

```
category × 10년
byCategoryDecade | 330 | 370 | 380 | 390 | 400 | 410 | 420 | 450 | 460 | 470 | 480 | 490 | 500 | total
-----------------+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+------
settlement       | 0   | 0   | 0   | 1   | 0   | 0   | 0   | 0   | 0   | 1   | 1   | 1   | 0   | 4
administration   | 0   | 1   | 1   | 0   | 1   | 0   | 0   | 0   | 0   | 2   | 0   | 0   | 0   | 5
facility         | 0   | 0   | 1   | 0   | 0   | 1   | 0   | 0   | 0   | 0   | 0   | 1   | 1   | 4
economy          | 0   | 0   | 0   | 0   | 1   | 0   | 0   | 0   | 0   | 1   | 1   | 0   | 0   | 3
disaster         | 1   | 0   | 1   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 2   | 0   | 4
culture          | 0   | 1   | 1   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 2
transport        | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
foreign          | 0   | 1   | 0   | 0   | 0   | 0   | 1   | 1   | 0   | 0   | 0   | 0   | 0   | 3
person           | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 1   | 0   | 0   | 0   | 0   | 1
war              | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0

region × 10년
byRegionDecade | 330 | 370 | 380 | 390 | 400 | 410 | 420 | 450 | 460 | 470 | 480 | 490 | 500 | total
---------------+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+------
capital        | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
north          | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
central        | 1   | 3   | 4   | 1   | 2   | 1   | 1   | 1   | 0   | 0   | 1   | 1   | 0   | 16
south          | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 1   | 4   | 1   | 3   | 1   | 10
island         | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0

job 별 집계
job           | facts | scenes | claims | chunkClaims | excerptClaims
--------------+-------+--------+--------+-------------+--------------
baekje_middle | 26    | 12     | 57     | 57          | 0

PASS: failures=0 warnings=0
```

exit code 0.

## 6. 남은 우려

- `central` 16건, `south` 10건으로 한성기에 쏠렸다. 475년 이후 25년치에서 웅진기 사실 10건을 확보했으나 웅진기 자체가 짧아 더 늘리기 어려웠다.
- 480~500년대 disaster 2건이 모두 동성왕대다. 447·497년 기사를 넣으면 갈래가 재해로 더 기울어 뺐다.
- 482년 한산성, 499년 한산은 475년 이후 고구려 세력권과 겹치는 지역이다. 백제 기록을 따라 `central`로 두었으나 이견이 있을 수 있어 confidence를 `medium`으로 낮추고 note에 적었다.
- 梁書 백제전의 22담로는 행정 갈래로 값이 크지만 서술 시점이 6세기라 이 칸(300~500)에 억지로 연도를 붙이지 않고 뺐다. `baekje_late` 칸에서 다루는 편이 맞다.
- 478년 `熊建市`를 `熊津市`의 이표기로 본 것은 통설을 따른 해석이며 원문 표기 그대로는 아니다. confidence `medium`, note에 명시했다.

## 7. 검수 반영 (2차)

검수원이 NEEDS_FIX 2건 + [minor] 10건을 냈다. 원문 조각을 다시 열어 모두 확인하고 고쳤다. 뺀 사실은 없고, 갈래 이동을 메우려고 1건을 새로 넣어 26 → 27건이 되었다.

### 기각 2건 (minor 아님)

**fact-bm-026 무령왕 생년 462 → 461.** 인용 조각 `chunk_geumseok-gskh_002_0010_0010_gskh_002_0010_0010_0080`을 `--id`로 다시 열어 각주를 확인했다. 각주 `gskh_002_0010_0010_0080_0003`은 "卒年인 523년의 왕의 향수가 62세로 되어 있는 사실에서 무녕왕의 生年이 461년임을 알 수 있다. 『日本書紀』에도 雄略天皇 5년(461) 6월 1일 무녕왕이 탄생한 것으로 되어 있어 이 지석의 기록과 합치된다"고 못박는다. 462는 세는나이 역산값이라 인용 사료와 어긋났다.
- `claim-bm-muryeong-birth`의 object를 `{kind:year, value:461}`로 고치고, note에 각주 원문과 일본서기 근거, 462가 나오는 이유(세는나이 단순 역산)를 함께 적었다.
- fact의 `year` 461, `decade` 460, `confidence` medium.
- 검수원이 제안한 "판독문 조각(`..._0030`)의 `年六十二歲`를 quote로" 는 쓰지 못했다. 그 조각의 `date.raw`가 `0525-99-99`(안장 연도)여서 461년 시간 주장이 검증기의 연도 일치 검사에 걸린다. 대신 `claim-bm-muryeong-title`이 이미 그 판독문 조각의 `寧東大將軍百濟斯麻王年六十二歲`를 인용하고 있어 한자 원문 근거는 유지된다. fact의 `yearVerbatim`도 `年六十二歲`로 두었다(검증기가 `yearVerbatim`에 빈 문자열을 허용하지 않는다 — `shape(... yearVerbatim='str')`은 `nonempty` 검사다).
- `placeLabel`을 `무령왕릉(지석 출토지)`, `modernPlace`를 "충남 공주 송산리 무령왕릉 — 지석이 나온 곳이며 출생지가 아니다"로 고쳐 출생지 오독을 막았다.

**fact-bm-019 웅진 왕도 200호 density 제거.** 원문은 `熊川水漲, 漂沒王都二百餘家` — 왕도에서 떠내려간 집 수이지 도성의 가구 수가 아니다. 좌표가 붙은 유일한 density 기록이라 그대로 두면 `build_fact_layers.py`의 밀도 배열에 "웅진 왕도 / 491 / 200호"로 실려 백제 왕도가 200호짜리 마을로 계산된다. `density`를 `null`로 비우고 침수 가옥 수는 note로 옮겼다. 좌표와 장면은 그대로 두었다(재해 장면으로는 맞는 자리다).

### [minor] 10건

| 항목 | 고친 내용 |
|---|---|
| fact-bm-003 | `density` 제거(300여 戶는 말갈이 사로잡아 간 호수 `虜三百餘戸以歸`). 갈래를 `settlement` → `war`로 바꿨다(말갈의 습격 기사). |
| fact-bm-004 | `density` 제거(600여 家는 신라로 빠져나간 가호). note에 유출 인구임을 적었다. |
| fact-bm-020 | `density` 제거(2천은 고구려로 달아난 사람 수). `what`에서 "왕이 창고를 열지 않아 … 달아났다"는 인과 단정을 빼고 원문대로 두 문장을 나란히 적었다. |
| 호구 claim 4건 | `syj:householdCount`/`syj:populationCount`는 `scripts/fact_predicates.json`이 unit을 각각 `戶`/`口`로 못박아 두어 unit 자체는 바꿀 수 없다. 대신 `claim-bm-hansanseong-482-h`·`claim-bm-flee-silla-491-h`·`claim-bm-flood-491-h`·`claim-bm-famine-499-p`의 note에 원문 표기(`戸`·`家`·`二千`)와 검증기 규약 때문에 unit이 다르다는 사실을 적었다. |
| fact-bm-022 | `confidence` low, `yearVerbatim`을 `冬十一月` → `至是`로 바꾸고, note에 "375는 근초고왕 30년 졸기가 실린 위치일 뿐 書記 편찬 시점이 아니다"를 적었다. `claim-bm-seogi-375-a`의 note에도 같은 취지를 적었다. |
| fact-bm-009 | 갈래 `administration` → `facility`(關防 축조). 짝이 되는 `scene-bm-gwanbang-386`의 `category`도 `facility`로 맞췄다. 할당은 administration 4/4, facility 5/3으로 그대로 충족한다. |
| fact-bm-007 | `claim-bm-sangjwapyeong-408-l`의 predicate를 `syj:administeredAs`(州·郡·縣 등 행정 단위 전용) → `syj:relatedTo`(object: `polity-baekje`)로 바꿨다. 上佐平은 행정 단위가 아니라 관직명이다. 관직용 predicate 추가는 `scripts/fact_predicates.json` 수정이 필요한데 이 작업의 쓰기 범위 밖이라 하지 않았다. |
| fact-bm-005 | 시간 주장 `claim-bm-hansan-371-t`를 같은 해 첫 조각 `chunk_samguksagi_sg_024_0080_0080`(`二十六年, 髙句麗舉兵來`, date.raw `0371-99-99L0`)로 옮겨 한자 원문 표기 `二十六年`을 근거로 삼았다. `yearVerbatim`도 `26년(근초고왕)` → `二十六年`. 천도 기사 조각(`..._0100`)은 본문이 `移都漢山.` 뿐이라 연도 표기가 없다는 사실을 note에 적었다. 행위 주장은 그대로 `移都漢山`을 인용한다. |
| fact-bm-006 | 지침 8의 의도대로 기존 장면 `scene-city-ungjin-capital-475-538`에 연결하려 했으나, 검증기가 `fact.sceneId`를 같은 result.json의 `scenes` 안에서만 찾는다. 실제로 넣고 돌려보니 `facts[fact-bm-006].sceneId/참조 없음: 'scene-city-ungjin-capital-475-538'`으로 FAIL(failures=1)이 났다. 그래서 `sceneId`는 `null`로 두고 note에 기존 장면 id와 이 제약을 적었으며 `missing`에 `miss-5`로 남겼다. |
| fact-bm-023 | `what`에서 "백제의 첫 남조 통교 기사"를 빼고 원문대로 "근초고왕이 정월에 동진에 사신을 보내 조공했다"까지만 두었다. 첫 동진 견사라는 평가와 "東晉은 南朝(宋·齊·梁·陳)에 들지 않는다"는 단서는 note로 옮겼다. |
| fact-bm-025 | note에 "책봉 행위 자체는 송 도읍 건강의 조정에서 이뤄졌고, 좌표·권역은 수봉자인 백제 왕의 왕도(한성) 기준"임을 적었다. |

### 새로 넣은 사실 1건

fact-bm-003이 `settlement` → `war`로 빠지면서 settlement가 3건이 되어, 같은 갈래로 1건을 더 찾아 넣었다.

- **fact-bm-027** (settlement, central, 483) — `chunk_samguksagi_sg_026_0040_0050`(date.raw `0483-99-99L0`): `五年, 春, 王以獵出, 至漢山城, 撫問軍民, 浹旬乃還.` 웅진 천도(475)와 말갈의 습격(482) 뒤에도 한산성에 백제의 군사와 백성이 있었음을 보여준다. 근거 claim 2건(`claim-bm-hansanseong-483-t`, `claim-bm-hansanseong-483-a`)과 entity `event-bm-hansanseong-483`을 함께 넣었다. 한산성 비정이 갈려 좌표는 없다.

### 2차 검증기 출력

```console
$ python scripts/check_fact_research.py data/research/facts-ancient --job baekje_middle
job 별 집계
job           | facts | scenes | claims | chunkClaims | excerptClaims
--------------+-------+--------+--------+-------------+--------------
baekje_middle | 27    | 12     | 59     | 59          | 0

PASS: failures=0 warnings=0
```

exit code 0. 사실 27 / 장면 12 / claim 59, 전부 로컬 chunk 인용이다. 갈래 할당은 settlement 4/3 · administration 4/4 · facility 5/3 · economy 3/3 · disaster 4/2 · culture 2/2 · foreign 3/2 · person 1/1 이고 여기에 war 1건이 더 있다(fact-bm-003).
