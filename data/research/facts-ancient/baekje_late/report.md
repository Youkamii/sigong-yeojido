# baekje_late 조사 보고 — 백제 사비·웅진기 (500~660, south)

담당: 사실 조사원(Opus 5, high). 작업 폴더 `C:/Users/gkfkd/Git/sigong-facts`, 산출 폴더
`data/research/facts-ancient/baekje_late/`. Git 조작·서버 실행·배포는 하지 않았다.

## 1. 검색 과정

먼저 `docs/research/facts-brief.md` 와 `docs/research/facts-format.md` 를 읽고
`python scripts/search_chunks.py --help`, `python scripts/check_fact_research.py --help` 로 사용법을 확인했다.
검증기 본문(`scripts/check_fact_research.py`)과 `scripts/fact_predicates.json` 도 직접 읽어 제약을 확인했다.

넓게 뽑은 검색:

```
python scripts/search_chunks.py --source src-samguksagi --from 500 --to 660 --locator 百濟本紀 --limit 2000 --fields id,date,title   # 188 조각
python scripts/search_chunks.py --keyword 五方 --keyword 百濟 --limit 20      # 주서·수서·북사 백제전
python scripts/search_chunks.py --keyword 砂宅智積      # 부여 사택지적비
python scripts/search_chunks.py --keyword 彌勒寺        # 익산 미륵사지 서탑 금제사리봉안기
python scripts/search_chunks.py --id <chunk id>         # 채택 후보 전문 확인
```

백제본기 500~660년 구간은 188 조각이었고, 이 가운데 전쟁 기사와 단순 천문 기사(일식·혜성)를 걷어내고
갈래에 걸리는 후보만 아래 표로 추렸다. 금석문·집성은 날짜 필드가 없어 키워드로 찾았다.

### 후보 표 (삼국사기 백제본기, 56건)

| # | 연도 | chunk id (chunk_samguksagi_ 접두어 생략) | 조각 제목 | 후보 갈래 |
|---|---|---|---|---|
| 1 | 0500 | `sg_026_0040_0400` | 임류각에서 잔치를 베풀다 | culture |
| 2 | 0501 | `sg_026_0040_0420` | 서리가 내려 보리를 해치다 | disaster |
| 3 | 0501 | `sg_026_0040_0430` | 여름부터 가을까지 비가 내리지 않다 | disaster |
| 4 | 0501 | `sg_026_0040_0440` | 탄현에 목책을 세워 신라의 침입을 대비하다 | facility |
| 5 | 0501 | `sg_026_0040_0450` | 가림성을 축조하여 백가로 하여금 지키게 하다 | facility |
| 6 | 0502 | `sg_026_0050_0050` | 백성들이 굶주리고 전염병이 일어나다 | disaster |
| 7 | 0503 | `sg_026_0050_0080` | 겨울에 물이 얼지 않다 | disaster |
| 8 | 0506 | `sg_026_0050_0090` | 봄에 전염병이 유행하다 | disaster |
| 9 | 0506 | `sg_026_0050_0100` | 봄에 비가 내리지 않아 백성이 굶주려 구제에 나서다 | disaster |
| 10 | 0507 | `sg_026_0050_0120` | 장령성을 축조하여 말갈의 침입에 대비하다 | facility |
| 11 | 0510 | `sg_026_0050_0140` | 제방을 튼튼히 하고 농사를 짓도록 권장하다 | economy |
| 12 | 0512 | `sg_026_0050_0150` | 양나라에 조공하다 | foreign |
| 13 | 0521 | `sg_026_0050_0180` | 홍수가 일어나다 | disaster |
| 14 | 0521 | `sg_026_0050_0190` | 누리 떼가 곡식을 해쳐 백성들이 굶주리다 | disaster |
| 15 | 0521 | `sg_026_0050_0200` | 양에 사절을 파견하여 조공하다 | foreign |
| 16 | 0521 | `sg_026_0050_0210` | 양 고조가 조서를 보내 책명하다 | foreign |
| 17 | 0522 | `sg_026_0050_0230` | 지진이 일어나다 | disaster |
| 18 | 0523 | `sg_026_0050_0240` | 한수 이북의 백성을 징발하여 쌍현성을 쌓다 | facility |
| 19 | 0524 | `sg_026_0060_0030` | 양 고조가 왕을 책봉하다 | foreign |
| 20 | 0526 | `sg_026_0060_0050` | 웅진성을 수축하고 사정책을 세우다 | facility |
| 21 | 0538 | `sg_026_0060_0100` | 도읍을 사비로 옮기고 국호를 남부여라 칭하다 | administration |
| 22 | 0541 | `sg_026_0060_0120` | 양에서 모시박사 등을 보내주다 | culture |
| 23 | 0570 | `sg_027_0020_0060` | 제가 왕을 거기대장군으로 책봉하다 | foreign |
| 24 | 0579 | `sg_027_0020_0150` | 지진이 일어나다 | disaster |
| 25 | 0599 | `sg_027_0040_0020` | 살생을 금하라는 명령을 내리다 | culture |
| 26 | 0600 | `sg_027_0040_0030` | 왕흥사를 창건하다 | facility |
| 27 | 0600 | `sg_027_0040_0040` | 칠악사에서 기우제를 지내다 | culture |
| 28 | 0605 | `sg_027_0050_0030` | 각산성을 쌓다 | facility |
| 29 | 0606 | `sg_027_0050_0050` | 서울에 흙비가 내리다 | disaster |
| 30 | 0606 | `sg_027_0050_0060` | 가물어 기근이 들다 | disaster |
| 31 | 0608 | `sg_027_0050_0100` | 수 사절이 왜국으로 가면서 백제의 남쪽 길을 통과하다 | foreign |
| 32 | 0611 | `sg_027_0050_0130` | 적암성을 쌓다 | facility |
| 33 | 0612 | `sg_027_0050_0170` | 홍수가 일어나 인가가 유실되다 | disaster |
| 34 | 0621 | `sg_027_0050_0210` | 당에 사절을 보내 과하마를 보내다 | foreign |
| 35 | 0626 | `sg_027_0050_0270` | 당에 사신을 보내 명광개 등을 선사하다 | foreign |
| 36 | 0630 | `sg_027_0050_0340` | 사비의 궁전을 중수하다 | facility |
| 37 | 0630 | `sg_027_0050_0350` | 가뭄이 들어 궁전 중수를 중단하다 | disaster |
| 38 | 0632 | `sg_027_0050_0390` | 마천성을 개축하다 | facility |
| 39 | 0634 | `sg_027_0050_0440` | 왕흥사를 준공하다 | facility |
| 40 | 0634 | `sg_027_0050_0450` | 대궐 남쪽에 연못을 파다 | facility |
| 41 | 0636 | `sg_027_0050_0470` | 사비하 북쪽 포구에서 연회를 열다 | economy |
| 42 | 0636 | `sg_027_0050_0490` | 가뭄이 발생하다 | disaster |
| 43 | 0636 | `sg_027_0050_0500` | 망해루에서 잔치를 벌이다 | culture |
| 44 | 0640 | `sg_027_0050_0570` | 당에 자제들을 국학에 입학시켜 줄 것을 요청하다 | culture |
| 45 | 0642 | `sg_028_0020_0040` | 주군을 순행하여 백성을 위무하다 | administration |
| 46 | 0649 | `sg_028_0020_0170` | 겨울에 물이 얼지 않다 | disaster |
| 47 | 0653 | `sg_028_0020_0200` | 가뭄이 들어 백성이 굶주리다 | disaster |
| 48 | 0653 | `sg_028_0020_0210` | 왜국과 우호관계를 맺다 | foreign |
| 49 | 0655 | `sg_028_0020_0220` | 태자의 궁을 수리하다 | facility |
| 50 | 0655 | `sg_028_0020_0240` | 마천성을 중수하다 | facility |
| 51 | 0657 | `sg_028_0020_0270` | 왕의 서자 41명을 좌평으로 임명하다 | administration |
| 52 | 0657 | `sg_028_0020_0280` | 큰 가뭄이 들어 농토가 황폐화되다 | disaster |
| 53 | 0660 | `sg_028_0020_0340` | 서울의 우물이 핏빛으로 변하다 | disaster |
| 54 | 0660 | `sg_028_0020_0370` | 백제 멸망의 여러 징후가 나타나다 | disaster |
| 55 | 0660 | `sg_028_0020_0380` | 당나라와 신라가 연합군을 편성하여 백제를 공격하다 | administration |
| 56 | 0660 | `sg_028_0020_0390` | 복신이 부흥운동을 일으키다 | administration |

### 삼국사기 밖 후보

| 출처 | chunk id | 내용 | 후보 갈래 |
|---|---|---|---|
| 周書 百濟傳 | `chunk_jipseong-ko_030_ko_030_0090_0030` | 治固麻城·五方(고사·득안·구지하·도선·웅진)·都下有萬家 分爲五部·方領/郡將·賦稅(布絹絲麻米)·外官 都市部/點口部 | settlement, administration, economy |
| 隋書 百濟傳 | `chunk_jipseong-ko_033_ko_033_0550_0020` | 畿內爲五部 部有五巷·方有十郡·八族·五穀牛豬雞·厥田下濕 人皆山居·巨栗·島居十五所 | settlement, economy, person |
| 北史(삼국사기 지리4 인용) | `chunk_samguksagi_sg_037_0030_0020` | 其都曰居拔城 又云固麻城 其外更有五方城 | administration |
| 삼국유사 南扶餘 | `chunk_samgukyusa_sy_002_0010_0200_0010` | 부여군=전백제 왕도, 所夫里郡, 量田帳籍 | administration |
| 부여 사택지적비 | `chunk_geumseok-gskh_002_0020_0010_gskh_002_0020_0010_0020` | 甲寅年正月九日 奈祇城 砂宅智積, 穿金以建珍堂 鑿玉以立寶塔 | person, facility |
| 익산 미륵사지 서탑 금제사리봉안기 | `chunk_geumseok-gskh_002_0050_0040_gskh_002_0050_0040_0020` | 我百濟王后 佐平沙宅積德女… 造立伽藍 以己亥年正月卄九日 奉迎舍利 | culture, person |

## 2. 고른 기준과 판단

- **장소가 특정되는 것**과 **뒤에 오래 남는 것**(성·절·둑·도읍)을 먼저 골라 `persistence` 를 붙였다.
  임류각·가림성·웅진성·왕흥사·궁남지가 여기에 해당한다.
- **사람이 어떻게 살았는지 보여주는 것**을 다음으로 골랐다. 76만 호(660)·900호 유출(521)·도성 1만 가(주서)는
  `density` 로, 발창진구(506)·대수(612)·기근과 역병(502)·대한(657)은 `disaster` 로 넣었다.
- **전쟁은 할당에 없어 넣지 않았다.** 660년 나당 연합군 기사는 전투가 아니라 그 안의 호구·군현 수치와
  5도독부 설치만 뽑아 settlement·administration 으로 썼다.
- **이미 있는 장면은 새로 만들지 않았다.** `services/host/app/history-scenes.json` 을 열어
  `scene-city-sabi-capital-538-660`(사비 도읍기), `scene-syj128-mireuksa-sari-639`(미륵사 사리 봉안),
  `scene-anc-sabi-660`(사비성 포위·항복)을 확인했고, 538년 사비 천도와 639년 사리 봉안은 **사실만 남기고 장면을 만들지 않았다**.
  검증기가 `facts[].sceneId` 를 같은 result.json 안의 scenes 로만 해석하므로 기존 장면 id 를 그대로 적을 수 없어
  `sceneId: null` 로 두고 note 에 기존 장면 id 를 적었다.

### 판단이 필요했던 곳

1. **집성(주서·수서)의 연도.** 두 chunk 는 `date` 가 없어 검증기의 연도 대조를 받지 않는다. 임의로 연도를 붙이지 않고
   같은 chunk 안에 실제로 적힌 연호 — 주서 `建德六年`(577), 수서 `開皇十八年`(598) — 를 `time` 주장의 verbatim 으로 쓰고,
   그 연도가 기사 시점이지 제도 성립 연도가 아니라는 사실을 fact note 에 적었다. `confidence: medium`.
   검수 뒤에는 이 5건의 note 를 `[대용 연도]` 로 시작하게 하고 사실 목록 표에 `연도 성격` 열을 넣어 표시했다(6절).
2. **固麻城을 사비로 본 것.** 주서는 治固麻城이라 하면서 北方을 熊津城으로 따로 적었고, 삼국사기 지리4가 인용한 북사는
   居拔城=固麻城이라 한다. 그래서 도성을 사비로 읽고 note 에 근거를 남겼다.
   다만 固麻城을 熊津(곰나루)의 음차로 보는 설(이병도 등)도 있어 검수 뒤 note 에 반대 학설을 함께 적었다. `confidence: medium`.
3. **좌표.** 만들지 않았다. 위키백과 6개 문서의 문서 머리 표시 좌표(`class="geo"` 의 십진값)만 발췌해 썼고,
   비정이 갈리는 곳(5방성·내지성·백제 남로·제방)은 좌표를 붙이지 않고 note 에 이유를 적었다.
   지점이 원문에 없는 도성 사건(홍수·구휼 등)은 `precision: area` 로 두고 coordinateNote 에 "원문에 지점 없음"을 명시했다.
4. **literal 값의 자료형.** 지시문은 호구 수 literal 을 문자열로 적으라고 했으나,
   `scripts/fact_predicates.json` 의 `syj:householdCount` 는 `numeric: true` 라서 검증기가 **수만** 받는다
   (`check_fact_research.py` 의 `rule.get('numeric')` 분기). 그래서 호구 주장만 수(760000, 900)로 적었고
   나머지 literal 은 모두 문자열로 적었다. 주서의 `萬家` 는 단위가 戶가 아니므로 householdCount 를 쓰지 않고
   `syj:administeredAs` 문자열 주장 + `density {households: 10000, unit: "家"}` 로 처리했다.
5. **yearVerbatim.** 조각 본문이 달(秋八月 등)로 시작해 재위년 표기가 본문에 없는 경우에는 chunk `date.label` 의
   재위년(예 "21년 08월" → `二十一年`)을 적었다. 이때 시간 주장은 verbatim 이 필요 없는 `{"kind":"year"}` 로 넣어
   본문에 없는 글자를 verbatim 으로 주장하지 않았다.

## 3. 산출물

- 사실 26건, 장면 7건, 주장 51건(전부 로컬 chunk 인용, 웹 인용 주장 0건). 사실 id 는 `fact-bj-001`~`fact-bj-026` 연번이다.
- 갈래: settlement 3 · administration 4 · facility 5 · economy 4 · disaster 4 · culture 3 · foreign 2 · person 1.
  할당(settlement 3 · administration 4 · facility 3 · economy 3 · disaster 2 · culture 2 · foreign 2 · person 1)을
  모두 채우고 facility·economy·disaster·culture 를 더 채웠다. 권역은 전부 `south`.
- 웹 출처 6건(ko.wikipedia 공산성·부소산성·왕흥사지·궁남지·익산 미륵사지·성흥산성). 발췌는 문서 머리 십진 좌표
  한 줄씩(각 2단어)이며 `raw/*.html` 원본 바이트·sha256·byteLength·fetchedUtc 를 manifest 와 sources 양쪽에 적었다.
  db.history.go.kr 은 열지 않았다.

### 사실 목록

‘연도 성격’ 열의 **대용 연도**는 사건 연도가 아니라 그 기사가 실린 사서의 다른 연호를 빌려 온 연도라는 뜻이다(주서 建德六年=577, 수서 開皇十八年=598). 해당 사실의 note 도 `[대용 연도]` 로 시작한다.

| id | 갈래 | 연도 | 연도 성격 | 장소 | lat, lon | 장면 | 확신 |
|---|---|---|---|---|---|---|---|
| `fact-bj-001` | settlement | 660 | 사건 연도 | 백제 전역(도읍 사비) | — | — | high |
| `fact-bj-002` | settlement | 521 | 사건 연도 | 백제(도읍 웅진) | — | — | high |
| `fact-bj-003` | settlement | 577 | **대용 연도** | 사비 도성 | 36.2875, 126.91528 | — | medium |
| `fact-bj-004` | administration | 538 | 사건 연도 | 사비 | 36.2875, 126.91528 | — | high |
| `fact-bj-005` | administration | 577 | **대용 연도** | 백제 5방(중방 고사성 등) | — | — | medium |
| `fact-bj-006` | administration | 657 | 사건 연도 | 사비 도성 | 36.2875, 126.91528 | — | high |
| `fact-bj-007` | administration | 660 | 사건 연도 | 웅진도독부 | 36.46333, 127.12694 | — | high |
| `fact-bj-008` | facility | 500 | 사건 연도 | 웅진 왕궁 임류각 | 36.46333, 127.12694 | scene-bj-imnyugak-500 | high |
| `fact-bj-009` | facility | 501 | 사건 연도 | 가림성 | 36.19556, 126.89833 | scene-bj-garimseong-501 | high |
| `fact-bj-010` | facility | 526 | 사건 연도 | 웅진성 | 36.46333, 127.12694 | scene-bj-ungjinseong-526 | high |
| `fact-bj-011` | facility | 600 | 사건 연도 | 왕흥사 | 36.29639, 126.90694 | scene-bj-wangheungsa-600 | high |
| `fact-bj-012` | facility | 634 | 사건 연도 | 궁남지 | 36.269056, 126.9136333 | scene-bj-gungnamji-634 | high |
| `fact-bj-013` | economy | 510 | 사건 연도 | 백제 전역 | — | — | high |
| `fact-bj-014` | economy | 577 | **대용 연도** | 백제 전역 | — | — | medium |
| `fact-bj-015` | economy | 577 | **대용 연도** | 사비 도성 | 36.2875, 126.91528 | — | medium |
| `fact-bj-016` | economy | 598 | **대용 연도** | 백제 전역 | — | — | medium |
| `fact-bj-017` | disaster | 502 | 사건 연도 | 백제(도읍 웅진) | — | — | high |
| `fact-bj-018` | disaster | 506 | 사건 연도 | 웅진성 | 36.46333, 127.12694 | scene-bj-jingu-506 | high |
| `fact-bj-019` | disaster | 612 | 사건 연도 | 사비 도성 | 36.2875, 126.91528 | scene-bj-daesu-612 | high |
| `fact-bj-020` | disaster | 657 | 사건 연도 | 백제 전역 | — | — | high |
| `fact-bj-021` | culture | 541 | 사건 연도 | 사비 도성 | 36.2875, 126.91528 | — | high |
| `fact-bj-022` | culture | 599 | 사건 연도 | 사비 도성 | 36.2875, 126.91528 | — | high |
| `fact-bj-023` | culture | 639 | 사건 연도 | 미륵사 | 36.01083, 127.03056 | — | high |
| `fact-bj-024` | foreign | 521 | 사건 연도 | 사비 이전 도읍 웅진 | — | — | high |
| `fact-bj-025` | foreign | 608 | 사건 연도 | 백제 남로 | — | — | high |
| `fact-bj-026` | person | 654 | 사건 연도 | 내지성(奈祇城) | — | — | medium |

### 장면 목록

| id | 연도 | kind/category | sceneFunction | place | persistence |
|---|---|---|---|---|---|
| `scene-bj-imnyugak-500` | 500~500 | construction/facility | construction_site | 웅진 왕궁(공산성) | facility |
| `scene-bj-garimseong-501` | 501~501 | construction/facility | fortress | 가림성(성흥산성) | facility |
| `scene-bj-jingu-506` | 506~506 | relief/disaster | relief | 웅진성(공산성) | none |
| `scene-bj-ungjinseong-526` | 526~526 | construction/facility | fortress | 웅진성(공산성) | facility |
| `scene-bj-wangheungsa-600` | 600~634 | construction/facility | temple | 왕흥사지 | facility |
| `scene-bj-gungnamji-634` | 634~634 | construction/facility | construction_site | 궁남지 | facility |
| `scene-bj-daesu-612` | 612~612 | disaster/disaster | — | 사비 도성(부소산성) | none |

## 4. 못 채운 것

`missing[]` 에 4건을 적었다: 사비 도성 안 시장 자리, 5방성의 현재 위치, 사비기 역·나루(transport 0건),
도성 호구의 연대 있는 수치.

## 5. 검증기 출력

```
category × 10년
byCategoryDecade | 500 | 510 | 520 | 530 | 540 | 570 | 590 | 600 | 610 | 630 | 650 | 660 | total
-----------------+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+------
settlement       | 0   | 0   | 1   | 0   | 0   | 1   | 0   | 0   | 0   | 0   | 0   | 1   | 3
administration   | 0   | 0   | 0   | 1   | 0   | 1   | 0   | 0   | 0   | 0   | 1   | 1   | 4
facility         | 2   | 0   | 1   | 0   | 0   | 0   | 0   | 1   | 0   | 1   | 0   | 0   | 5
economy          | 0   | 1   | 0   | 0   | 0   | 2   | 1   | 0   | 0   | 0   | 0   | 0   | 4
disaster         | 2   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 1   | 0   | 1   | 0   | 4
culture          | 0   | 0   | 0   | 0   | 1   | 0   | 1   | 0   | 0   | 1   | 0   | 0   | 3
transport        | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
foreign          | 0   | 0   | 1   | 0   | 0   | 0   | 0   | 1   | 0   | 0   | 0   | 0   | 2
person           | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 1   | 0   | 1
war              | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0

region × 10년
byRegionDecade | 500 | 510 | 520 | 530 | 540 | 570 | 590 | 600 | 610 | 630 | 650 | 660 | total
---------------+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+------
capital        | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
north          | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
central        | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
south          | 4   | 1   | 3   | 1   | 1   | 4   | 2   | 2   | 1   | 2   | 3   | 2   | 26
island         | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0

job 별 집계
job         | facts | scenes | claims | chunkClaims | excerptClaims
------------+-------+--------+--------+-------------+--------------
baekje_late | 26    | 7      | 51     | 51          | 0

PASS: failures=0 warnings=0
```

`python scripts/check_fact_research.py data/research/facts-ancient --job baekje_late` 결과
**PASS: failures=0 warnings=0** (확인됨, 직접 실행).

## 6. 검수 반영 (적대 검수 1차)

검수원이 1건을 기각하고 8건을 [minor] 로 지적했다. 아래처럼 모두 고쳤고, 고친 뒤 검증기를 다시 돌려 PASS 를 확인했다(위 5절 출력은 수정 후의 것이다).

| 지적 | 무엇이 문제였나 | 어떻게 고쳤나 |
|---|---|---|
| **기각 — `fact-bj-001`** | 나라 전체 76만 호에 사비(부소산성) 점 좌표를 붙여 `density` 를 함께 두었다. 세계 연결 코드는 density 를 좌표 반경 40단위·±150년 안의 **그 지점 가구 수**로 읽고, 거리가 같으면 파일에서 먼저 나온 기록을 택한다. 그래서 전국 76만 호가 같은 좌표의 도성 1만 가 기록(`fact-bj-003`)을 밀어내고 부여 반경 26km 의 밀도 계수를 결정하게 되어 있었다. | 검수원 권장대로 `fact-bj-001` 에서 `lon`·`lat`·`coordinateBasis` 를 **뺐다**. 인용·what·claim·density 는 그대로 두었다. 이제 사비 지점의 밀도는 `fact-bj-003`(도성 1만 가) 하나만 맡는다. 좌표를 뺀 이유를 note 에 적었다. |
| [minor] `fact-bj-005` | `persistence {kind:'institution', from:577}` 의 577 은 사료 근거가 없다(주서에 5방 설치 연도가 없고 建德六年은 사신 기사 연도다). | `persistence` 를 **null** 로 바꾸고, note 에 "주서 백제전에는 5방 설치 연도가 없다 / 제도 시작 연도가 미상이라 persistence 를 두지 않았다"를 적었다. 538(사비 천도)로 잡는 선택지도 있었으나 그 역시 별도 주장이 되므로 쓰지 않았다. |
| [minor] `fact-bj-003` | 固麻城=사비 설만 적고 固麻城=熊津(곰나루) 음차설이 빠졌다. | note 에 "固麻城을 熊津(곰나루)의 음차로 읽어 웅진으로 보는 설(이병도 등)도 있어 confidence 는 medium 이다"를 더했다. `confidence: medium` 유지. |
| [minor] 대용 연도 5건(`003`·`005`·`014`·`015`·`016`) | 주서 建德六年(577)·수서 開皇十八年(598)은 서술형 기사에 붙인 대용 연도인데 커버리지 표에서는 사건 연도처럼 보인다. | 위 **사실 목록 표에 `연도 성격` 열을 새로 넣어 해당 5건을 "대용 연도"로 표시**했고, 각 사실의 note 를 `[대용 연도]` 로 시작하게 고쳤다. (재번호 때문에 옛 `fact-bj-015~017` 은 지금 `fact-bj-014~016` 이다.) |
| [minor] `syj:administeredAs` 오용 7건 | `administeredAs` 는 州·郡·縣·京 같은 행정 표기용인데 가뭄·기근·금살생·제방·조세·산물·국호에 쓰였다. | 5건(`cl-bj-657d-act` 大早赤地, `cl-bj-502-act` 民饑且疫, `cl-bj-599-act` 禁殺生, `cl-bj-510-act` 隄防, `cl-bj-538-name` 國號南扶餘)은 **주장을 지웠다** — 같은 사실의 시간 주장 quote 가 그 원문을 이미 그대로 담고 있어 근거가 줄지 않는다(예 `cl-bj-502-time` quote = `二年, 春, 民饑且疫.`). 남은 2건(`cl-bj-jubseo-tax` 賦稅, `cl-bj-suseo-life` 五穀·牛·豬·雞)은 시간 주장 quote 가 그 대목을 담지 않아 지울 수 없어, 허용 목록의 catch-all 인 **`syj:relatedTo`(분류 불가 시)** 로 바꾸고 주제 엔티티 `inst-baekje-busae`·`thing-baekje-sanmul` 을 entities 에 더했다. 원문은 quote 에 그대로 남아 있다. `fact_predicates.json` 은 건드리지 않았다. |
| [minor] `fact-bj-012`(옛 `013`) 궁남지 | 연결 장면 `scene-bj-gungnamji-634` 의 `sceneFunction` 이 `irrigation` 이었다. 원문(擬方丈仙山)은 방장선산을 본뜬 궁원 연못이지 관개 시설이 아니다. | `sceneFunction` 을 **`construction_site`** 로 바꾸고 장면 summary 에 "관개 시설이 아니라 궁원(宮苑)의 못이다"를 더했다. 사실 note 에도 같은 이유를 적었다. |
| [minor] `yearVerbatim` | 재위년 표기가 인용 chunk 본문에 없고 `date.label` 에서 온 사실이 11건이다. | 프로그램으로 26건 전부를 인용 chunk 본문과 대조해 본문에 없는 **11건(`001`·`002`·`007`·`009`·`012`·`018`·`019`·`020`·`022`·`024`·`025`)의 note 에 "yearVerbatim(…)은 chunk date.label 의 재위년 표기이며 인용 chunk 본문에는 없다"를 적었다.** 시간 주장 자체는 원래부터 verbatim 이 필요 없는 `{"kind":"year"}` 였으므로 주장은 손대지 않았다. |
| [minor] `fact-bj-004`·`fact-bj-023`(옛 `024`) sceneId | facts-brief 규칙 8 은 기존 장면 id 를 적으라 하지만 `check_fact_research.py` 430~431 행이 sceneId 를 같은 result 의 scenes 안에서만 찾아 검증이 실패한다. | 검수원 판단대로 **지금 상태(null + note)를 유지**했다. 아래 "남긴 제안"에 별도 이슈로 적었다. |
| [minor] `fact-bj-008` 결번 | 001~007, 009~027 로 008 이 비어 있었다. | 결번 사유를 지어내지 않고 **009~027 을 008~026 으로 재번호**해 `fact-bj-001`~`fact-bj-026` 연번으로 만들었다. 사실 id 는 result.json 밖에서 참조되지 않아 다른 곳이 깨지지 않는다. |

수치 변화: 주장 56 → **51건**(5건 삭제, 2건 술어 교체), 엔티티 13 → **15개**. 사실 26건·장면 7건·권역 south 26건은 그대로다.
갈래 집계도 그대로 settlement 3 · administration 4 · facility 5 · economy 4 · disaster 4 · culture 3 · foreign 2 · person 1 로 할당을 모두 채운다.

### 남긴 제안 (이 job 에서는 건드리지 않음)

1. `scripts/fact_predicates.json` 에 **literal 을 받는 범용 술어**(예 `syj:describedAs`)를 더하는 편이 낫다. 지금은 재해·시책·생활상 같은 서술형 원문을 담을 자리가 `administeredAs` 밖에 없어 오용이 반복된다. 이번에는 임의 확장이 금지되어 `relatedTo` + 주제 엔티티로 우회했다.
2. `check_fact_research.py` 의 `facts[].sceneId` 검사를 **`services/host/app/history-scenes.json` 의 기존 장면 id 도 허용**하도록 고치면 facts-brief 규칙 8 을 그대로 지킬 수 있다. 지금은 규칙과 검증기가 충돌해 `sceneId: null` + note 로 둘 수밖에 없다.
