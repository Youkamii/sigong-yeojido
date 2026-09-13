# goguryeo_late 조사 보고 (고구려 500~668, 권역 north)

## 1. 검색 과정

로컬 원문만 썼다. 삼국사기 고구려본기 권19~22의 locator 첫머리는 `卷第十九 髙句麗本紀 第七` 처럼 **高가 아니라 髙(U+9AD9)** 라서 `--locator 高句麗本紀` 로는 한 건도 잡히지 않는다. 그래서 chunks.jsonl 을 직접 훑어 `sg_019`~`sg_022` 조각 365건을 먼저 목록으로 뽑고(연도·제목·본문), 거기에 갈래별 키워드를 걸었다.

```
python scripts/search_chunks.py --source src-samguksagi --from 500 --to 668 --limit 600 --fields id,locator,date,title
python scripts/search_chunks.py --source src-jipseong-ko_033 --keyword 高麗 --keyword 戶 --limit 10
python scripts/search_chunks.py --source src-jipseong-ko_041 --keyword 高麗 --keyword 戶 --limit 5
python scripts/search_chunks.py --id chunk_jipseong-ko_034_ko_034_1550_0010
```

갈래별로 건 키워드: 築·修·堤·寺·塔(시설) / 賑·賜·饑·飢·疫·旱·蝗·雹·霜·大水·地震(재해) / 農·桑·租·市·穀(경제) / 戶·口·徙·移·遷都·州縣·置(취락·행정). 집성은 `src-jipseong-ko_033`(수서), `ko_034`(구당서), `ko_041`(통전) 세 사서를 골라 고려전·식화전을 통째로 열어 읽었다.


## 2. 후보 조각 표 (61건)

### 2-1. 삼국사기 고구려본기 권19~22 (56건)

| chunk id | 서기연 | 제목 | 갈래 후보 | 판단 |
|---|---|---|---|---|
| `chunk_samguksagi_sg_019_0020_0340` | 504 | 예실불이 북위에 사신으로 가 황제를 알현하다 | foreign | 채택 fact-gg-for-001 |
| `chunk_samguksagi_sg_019_0030_0060` | 521 | 시조의 사당에 제사지내다 | culture | 보류 — 시조 사당 제사는 619년 졸본 기사를 채택 |
| `chunk_samguksagi_sg_019_0030_0070` | 521 | 빈핍한 자들에게 곡식을 내려주다 | economy | 보류 — 졸본 행차 중 빈핍자에 곡식 하사(521), 523 진휼과 중복 |
| `chunk_samguksagi_sg_019_0030_0080` | 523 | 가뭄이 들다 | disaster | 보류 — 523 봄 가뭄, 같은 해 10월 진휼 기사를 채택 |
| `chunk_samguksagi_sg_019_0030_0100` | 523 | 기근이 들어 백성을 구휼하다 | disaster | 채택 fact-gg-dis-001 |
| `chunk_samguksagi_sg_019_0040_0110` | 535 | 홍수가 나다 | disaster | 채택 fact-gg-dis-002 |
| `chunk_samguksagi_sg_019_0040_0120` | 535 | 지진이 나다 | disaster | 보류 — 지진 단문 |
| `chunk_samguksagi_sg_019_0040_0130` | 535 | 천둥이 치고 전염병이 돌다 | disaster | 보류 — 대역(전염병) 단문, 할당 초과 |
| `chunk_samguksagi_sg_019_0040_0140` | 536 | 가뭄이 들어 굶주린 백성을 구휼하다 | disaster | 채택 fact-gg-dis-003 |
| `chunk_samguksagi_sg_019_0040_0150` | 536 | 누리가 발생하다 | disaster | 보류 — 누리 단문 |
| `chunk_samguksagi_sg_019_0040_0170` | 537 | 왕이 순행하면서 백성을 구휼하다 | disaster | 보류 — 537 왕 순무 진구, 536과 중복 |
| `chunk_samguksagi_sg_019_0040_0240` | 542 | 큰 바람이 불다 | disaster | 보류 — 큰 바람 단문 |
| `chunk_samguksagi_sg_019_0040_0250` | 542 | 우박이 내리다 | disaster | 보류 — 우박 단문 |
| `chunk_samguksagi_sg_019_0050_0030` | 546 | 배나무가 가지를 서로 잇다 | culture | 보류 — 배나무 상서 |
| `chunk_samguksagi_sg_019_0050_0060` | 547 | 백암성과 신성을 수리하다 | facility | 채택 fact-gg-fac-001 |
| `chunk_samguksagi_sg_019_0050_0090` | 548 | 환도에서 가화를 바치다 | economy | 보류 — 환도에서 가화를 바침, 장소·행위는 있으나 단문 |
| `chunk_samguksagi_sg_019_0050_0190` | 552 | 장안성을 쌓다 | facility | 채택 fact-gg-fac-002 |
| `chunk_samguksagi_sg_019_0050_0220` | 555 | 왕도에서 호랑이를 잡다 | settlement | 보류 — 왕도에서 호랑이를 잡음 |
| `chunk_samguksagi_sg_019_0050_0260` | 557 | 환도성에서 간주리의 반역을 진압하다 | war | 제외 — 환도성 간주리 반역(전쟁/내분, 할당 밖) |
| `chunk_samguksagi_sg_019_0060_0040` | 560 | 죄수를 사면하다 | administration | 보류 — 사면 |
| `chunk_samguksagi_sg_019_0060_0060` | 561 | 홍수가 나다 | disaster | 보류 — 홍수 단문 |
| `chunk_samguksagi_sg_019_0060_0090` | 563 | 큰 가뭄이 들다 | disaster | 보류 — 563 대한, 왕이 상선을 줄이고 산천에 기도 |
| `chunk_samguksagi_sg_019_0060_0160` | 571 | 왕이 패하의 들판에서 사냥을 하다 | economy | 보류 — 패하 들판 사냥 |
| `chunk_samguksagi_sg_019_0060_0170` | 571 | 궁실 수리를 중단하다 | economy | 채택 fact-gg-eco-004 |
| `chunk_samguksagi_sg_019_0060_0220` | 581 | 서리와 우박이 내리다 | disaster | 보류 — 서리·우박이 곡식을 죽임 |
| `chunk_samguksagi_sg_019_0060_0230` | 581 | 굶주린 백성을 구휼하다 | disaster | 보류 — 581 왕 순행 무휼, 523/536과 중복 |
| `chunk_samguksagi_sg_019_0060_0280` | 583 | 농사와 양잠을 권장하다 | economy | 채택 fact-gg-eco-002 |
| `chunk_samguksagi_sg_019_0060_0340` | 586 | 장안성으로 도읍을 옮기다 | administration | 채택 fact-gg-adm-001 |
| `chunk_samguksagi_sg_019_0060_0350` | 590 | 수의 침입에 대비하다 | economy | 채택 fact-gg-eco-003 |
| `chunk_samguksagi_sg_020_0020_0140` | 600 | 신집을 편찬하다 | culture | 채택 fact-gg-cul-001 |
| `chunk_samguksagi_sg_020_0020_0160` | 607 | 돌궐의 장막에서 수 양제와 마주치고 입조를 요구받다 | foreign | 보류 — 돌궐 장막에서 수 양제와 조우(607) |
| `chunk_samguksagi_sg_020_0020_0310` | 613 | 수 양제가 고구려 원정을 준비하다 | war | 제외 — 수의 요동 고성 수리·군량 저장(수 쪽 시설) |
| `chunk_samguksagi_sg_020_0030_0030` | 619 | 졸본에 가서 시조 사당에 제사지내다 | culture | 채택 fact-gg-cul-004 |
| `chunk_samguksagi_sg_020_0030_0060` | 622 | 당과 전쟁 포로를 교환하다 | foreign | 보류 — 622 화인 1만여 명 송환, 할당 초과로 뺌 |
| `chunk_samguksagi_sg_020_0030_0080` | 624 | 당에 역서의 반포를 요청하다 | culture | 보류 — 당에 역서 반포 요청(624) |
| `chunk_samguksagi_sg_020_0030_0081` | 624 | 당의 책봉을 받고 『도덕경』 강의를 듣다 | culture | 보류 — 도덕경 강의를 들음(624), 643 도교 기사와 중복 |
| `chunk_samguksagi_sg_020_0030_0100` | 625 | 당에 불교와 도교의 가르침을 구하다 | culture | 보류 — 당에 불교·도교의 가르침을 구함(625) |
| `chunk_samguksagi_sg_020_0030_0120` | 628 | 당에 봉역도를 보내다 | foreign | 채택 fact-gg-for-002 |
| `chunk_samguksagi_sg_020_0030_0150` | 631 | 당이 경관을 허물다 | foreign | 보류 — 당이 경관을 헐다(631) |
| `chunk_samguksagi_sg_020_0030_0160` | 631 | 천리장성 축조를 시작하다 | facility | 채택 fact-gg-fac-003 |
| `chunk_samguksagi_sg_020_0030_0190` | 640 | 당에 자제의 국학 입학을 요청하다 | culture | 보류 — 당 국학 입학 요청(640) |
| `chunk_samguksagi_sg_020_0030_0230` | 642 | 연개소문에게 장성 축조를 감독하게 하다 | facility | 보류 — 연개소문에게 장성 축조 감독(642), 631 기사와 중복 |
| `chunk_samguksagi_sg_020_0030_0240` | 642 | 연개소문이 왕을 시해하다 | person | 보류 — 642 연개소문 시해, 기존 scene-anc-yeongaesomun-642와 중복 |
| `chunk_samguksagi_sg_021_0020_0050` | 643 | 연개소문의 요청으로 당에 도교를 요청하다 | culture | 채택 fact-gg-cul-002 |
| `chunk_samguksagi_sg_021_0020_0120` | 644 | 평양에 붉은 눈이 내리다 | disaster | 보류 — 평양에 붉은 눈(644) |
| `chunk_samguksagi_sg_021_0020_0183` | 645 | 요동성에서 주몽의 사당에 여신을 모시다 | culture | 보류 — 요동성 주몽 사당의 여신(645), 전쟁 기사 안에 있음 |
| `chunk_samguksagi_sg_021_0020_0190` | 645 | 백암성이 함락되다 | settlement/administration | 채택 fact-gg-set-002, fact-gg-adm-003 |
| `chunk_samguksagi_sg_021_0020_0224` | 645 | 당이 토산을 축조하다 | war | 제외 — 안시성 토산(당의 공성 토목) |
| `chunk_samguksagi_sg_022_0020_0150` | 650 | 보덕이 남쪽으로 옮겨가다 | culture | 보류 — 650 보덕의 남행, 도착지가 남부라 권역 밖 |
| `chunk_samguksagi_sg_022_0020_0160` | 650 | 재이로 백성이 굶주리다 | disaster | 보류 — 650 상박해곡 민기, 할당 초과 |
| `chunk_samguksagi_sg_022_0020_0230` | 656 | 왕도에 재이가 일어나다 | disaster | 보류 — 656 왕도의 재이 |
| `chunk_samguksagi_sg_022_0020_0370` | 666 | 연개소문이 죽고, 아들들이 다투다 | person | 채택 fact-gg-per-001 |
| `chunk_samguksagi_sg_022_0020_0420` | 667 | 이적 당군이 신성을 빼앗고 천남생 군과 합하다 | war | 제외 — 신성 함락(전쟁) |
| `chunk_samguksagi_sg_022_0020_0460` | 668 | 평양성이 함락되다 | war | 제외 — 평양성 함락, 기존 scene-anc-goguryeo-fall-668 |
| `chunk_samguksagi_sg_022_0020_0480` | 668 | 당 고종이 고구려 정복 의례를 행하다 | administration | 채택 fact-gg-adm-002 |
| `chunk_samguksagi_sg_022_0020_0500` | 669 | 당 고종이 고구려 유민을 사민시키다 | settlement | 제외 — 669년 고구려 유민 사민, 연도가 칸(668) 밖 |

### 2-2. 집성(중국 정사·통전) 5건

| chunk id | 출전 | 연도 | 갈래 후보 | 판단 |
|---|---|---|---|---|
| `chunk_jipseong-ko_041_ko_041_0010_0010` | 통전 식화 역대성쇠호구 | 668 | settlement | 채택 fact-gg-set-001 |
| `chunk_jipseong-ko_041_ko_041_0010_0020` | 통전 식화 역대성쇠호구 | 669 | settlement | 제외 — 669년 고구려민 3만 사민, 칸 밖 |
| `chunk_jipseong-ko_033_ko_033_0550_0010` | 수서 권81 동이 고려 | 연대 없음 | administration/economy/settlement | 채택 fact-gg-set-004, fact-gg-adm-004, fact-gg-eco-001 |
| `chunk_jipseong-ko_034_ko_034_1550_0010` | 구당서 권199상 동이 고려 | 연대 없음 | settlement/administration/culture | 채택 fact-gg-set-003, fact-gg-adm-005, fact-gg-cul-003 |
| `chunk_jipseong-ko_033_ko_033_0200_0010` | 수서 권24 지 식화 | 연대 없음 | economy | 보류 — 수의 재정 기사라 고구려 생활을 직접 보여주지 않음 |

## 3. 고른 기준과 판단

- **장소가 특정되고 뒤에 남는 것 우선.** 장안성(552 축조 → 586 천도 → 668 도호부), 백암성(547 개축 → 645 암주), 졸본 시조묘, 천리장성처럼 `persistence` 를 붙일 수 있는 것을 앞에 놓았다.
- **사람이 어떻게 살았나.** 호구(668년 69만 7200호), 성 하나의 인구(백암성 1만여 구), 조세(수서의 人稅布五匹·租戶一石), 주거와 온돌(구당서 長坑), 경당, 진휼 두 건을 넣었다.
- **전쟁은 빼되 그 안의 비전쟁 사실은 살렸다.** 645년 백암성 기사는 전투 기사지만 성 인구와 주(州) 편제라는 두 갈래를 담고 있어 그 부분만 사실로 세고, 전투 자체는 장면으로 만들지 않았다.
- **기존 장면과 겹치지 않게.** `services/host/app/history-scenes.json` 에 이미 `scene-anc-salsu-612`(살수대첩), `scene-anc-yeongaesomun-642`(연개소문 정변), `scene-anc-goguryeo-fall-668`(평양성 함락)이 있어 그 사건들은 새 장면으로 만들지 않았다. 642년 정변은 사실에서도 빼고 666년 연개소문 사후 형제 분쟁을 person 으로 잡았다. 검증기는 `sceneId` 를 이 result.json 안의 scenes 에서만 찾으므로 기존 장면 id 를 적을 수 없어 note 로 남겼다.
- **연대 표기가 없는 집성 서술.** 수서 고려전·구당서 고려전 조각에는 `date` 가 없다. 처음에는 "수대의 중간 600", "당 전기의 중간 640" 이라는 임의 중간값을 연도로 박았는데, 이는 근거 없는 숫자여서 검수에서 기각됐다. 지금은 **연대를 주장하는 claim 을 아예 두지 않고**, 그 서술이 확실히 유효한 구간의 하한에 사실을 배치한다 — 수서 서술은 도읍을 장안성이라 부르므로 하한이 586년 천도, 구당서 서술은 그 열전이 당과의 교섭을 적기 시작하는 武德 2년(619)이 하한이다. 두 하한 모두 날짜가 붙은 삼국사기 조각(0586, 0619)으로 뒷받침되고, 해당 사실은 `confidence: low` 에 note 로 "배치 기준이지 시작 연도가 아니다" 라고 적었다. 욕살·도사(fact-gg-adm-005)만은 욕살이 연대와 함께 실제로 쓰인 삼국사기 645년 안시성 기사가 있어 645에 두었다.
- **좌표는 만들지 않았다.** en.wikipedia 네 문서(Pyongyang, Ji'an, Dengta, Huanren)의 머리 표시 좌표(`class="geo"`)만 발췌해 `syj:locatedAt` location 주장 네 건을 만들고, 사실의 `coordinateBasis` 와 장면 `place.claimIds` 가 그 주장을 가리키게 했다. 성 하나의 정확한 지점이 아니라 비정지의 시(市) 좌표라서 `precision` 은 모두 `area` 다. 천리장성(선형), 한성(위치 학설 갈림), 國南(범위만 있음)에는 좌표를 넣지 않고 note 에 이유를 적었다.
- **검증기와 지시가 어긋난 곳.** 지시문은 호구 literal 의 value 를 문자열로 적으라고 했지만, `scripts/fact_predicates.json` 의 `syj:householdCount`·`syj:populationCount` 는 `"numeric": true` 라서 검증기가 문자열을 거부한다. 통과가 목표이므로 숫자(697200, 10000)로 적었다. 단위는 각각 `戶`, `口`.

## 4. 채택한 사실 26건

| 갈래 | 건수 | 할당 | 사실 |
|---|---|---|---|
| settlement | 4 | 3 | 668 호구 69만7200호 · 645 백암성 1만여 구 · 주거와 온돌(619 배치) · 평양성 규모(586 배치) |
| administration | 5 | 4 | 586 장안성 천도 · 668 안동도호부 · 645 암주 · 삼경(586 배치) · 645 욕살/도사 |
| facility | 3 | 3 | 547 백암성 개축 · 552 장안성 축조 · 631 천리장성 |
| economy | 3 | 3 | 조세(586 배치) · 583 권농상 · 590 적곡 |
| disaster | 4 | 2 | 523 발창진구 · 535 국남 대수 · 536 가뭄 구휼 · 571 황·한으로 파역 |
| culture | 4 | 2 | 600 신집 · 643 도교 · 경당(619 배치) · 619 졸본 시조묘 |
| foreign | 2 | 2 | 504 예실불 · 628 봉역도 |
| person | 1 | 1 | 666 연개소문 사후 남생의 국내성 웅거 |

장면 11개는 장소와 행위가 분명한 것만 만들었다(축조 3, 천도 1, 구휼 2, 편찬 1, 의례 2, 조정 2). 천리장성과 536년 구휼은 지점을 특정할 수 없어 `place: null` 이다.

## 5. 못 찾은 것

`missing[]` 에 다섯 건을 적었다 — 후기 고구려의 市(시장) 기사, 築堤·作橋 기사, 한성(三京)의 위치, 성 단위 개별 좌표, 그리고 연대가 없는 중국 정사 서술의 연도를 댈 한국민족문화대백과 발췌(encykorea 의 `/Article/Search` 가 robots 로 막혀 문서 id 를 찾지 못했다).


## 6. 검증기 출력 (검수 반영 뒤 다시 실행)

```
category × 10년
byCategoryDecade | 500 | 520 | 530 | 540 | 550 | 570 | 580 | 590 | 600 | 610 | 620 | 630 | 640 | 660 | total
-----------------+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+------
settlement       | 0   | 0   | 0   | 0   | 0   | 0   | 1   | 0   | 0   | 1   | 0   | 0   | 1   | 1   | 4
administration   | 0   | 0   | 0   | 0   | 0   | 0   | 2   | 0   | 0   | 0   | 0   | 0   | 2   | 1   | 5
facility         | 0   | 0   | 0   | 1   | 1   | 0   | 0   | 0   | 0   | 0   | 0   | 1   | 0   | 0   | 3
economy          | 0   | 0   | 0   | 0   | 0   | 0   | 2   | 1   | 0   | 0   | 0   | 0   | 0   | 0   | 3
disaster         | 0   | 1   | 2   | 0   | 0   | 1   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 4
culture          | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 1   | 2   | 0   | 0   | 1   | 0   | 4
transport        | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
foreign          | 1   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 1   | 0   | 0   | 0   | 2
person           | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 1   | 1
war              | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0

region × 10년
byRegionDecade | 500 | 520 | 530 | 540 | 550 | 570 | 580 | 590 | 600 | 610 | 620 | 630 | 640 | 660 | total
---------------+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+------
capital        | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
north          | 1   | 1   | 2   | 1   | 1   | 1   | 5   | 1   | 1   | 3   | 1   | 1   | 4   | 3   | 26
central        | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
south          | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
island         | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0

job 별 집계
job           | facts | scenes | claims | chunkClaims | excerptClaims
--------------+-------+--------+--------+-------------+--------------
goguryeo_late | 26    | 11     | 58     | 54          | 4

PASS: failures=0 warnings=0
```

## 7. 검수 반영

검수원은 검증기 PASS 에도 NEEDS_FIX 를 냈다. 핵심 결함은 하나였다 — 연대가 없는 집성 조각에 임의 중간값(600·640)을
연도로 박고 `syj:occurredIn` 으로 단정한 것. 아래처럼 고쳤다.

### 7-1. 기각된 여섯 건 (근거 없는 연도)

연도를 주장하던 claim 여섯 개(`claim-gg-housing-time`, `claim-gg-pyscale-time`, `claim-gg-samgyeong-time`,
`claim-gg-yoksal-time`, `claim-gg-tax-time`, `claim-gg-gyeongdang-time`)를 **모두 지웠다.** 대신 각 사실의
`year` 는 다른 claim 이 실제로 대는 연도에만 놓았다. 새로 만든 근거는 셋이다.

| 새 claim | 조각 | 인용 | 쓰임 |
|---|---|---|---|
| `claim-gg-619t-time` | `chunk_jipseong-ko_034_...` | `武德二年, 遣使來朝.` | 구당서 고려전이 당과의 교섭을 적기 시작하는 해(연호 武德 2년 = 619) |
| `claim-gg-619s-time` | `chunk_samguksagi_sg_020_0030_0020` (date.raw `0619-02-99L0`) | `二年, 春二月, 遣使如唐朝貢.` | 위 연호가 서기 619년임을 날짜 붙은 조각으로 확인 |
| `claim-gg-645y-time` / `claim-gg-645y-yoksal` | `chunk_samguksagi_sg_021_0020_0210` (date.raw `0645-05-99L0`) | `北部耨薩髙延壽·南部耨薩髙恵真` | 욕살이 연대와 함께 실제로 쓰인 용례 |

| 사실 | 전 | 후 | 근거 |
|---|---|---|---|
| `fact-gg-set-003` 주거·온돌 | 640 (당 전기 중간값) | **619**, confidence low | 구당서 고려전의 하한. 인용에 없던 "절·신묘·왕궁·관청만 기와" 를 받치는 `claim-gg-housing-roof` 를 새로 달아 `what` 전체가 인용으로 덮인다 |
| `fact-gg-set-004` 평양성 규모 | 600 (수대 중간값) | **586**, confidence low | 도읍을 장안성이라 부르는 상태의 하한 = 586 천도(`claim-gg-586-time`) |
| `fact-gg-adm-004` 삼경 | 600 | **586**, confidence low | 같은 이유. 성립하지 않던 `polity-goguryeo occurredIn 600` 주장은 삭제 |
| `fact-gg-adm-005` 욕살·도사 | 640 | **645**, confidence medium | 삼국사기 645년 안시성 기사의 욕살 용례 |
| `fact-gg-eco-001` 조세 | 600 | **586**, confidence low | 같은 서술 문단이 전제하는 장안성 도읍의 하한. 수치 자체는 수서 원문 그대로 |
| `fact-gg-cul-003` 경당 | 640 (연도 근거로 `俗愛書籍` 인용) | **619**, confidence low | 연도와 무관한 인용을 연도 근거로 쓰던 것을 없앴다. 인용을 `俗愛書籍, 至於衡門廝養之家 …` 전체로 넓혀 "천한 집안까지" 가 받쳐진다 |

`yearVerbatim` 도 `(연대 표기 없음)` 대신 하한 연도의 원문 표기(`武德二年`, `二十八年`, `(보장왕 4년)`)를 적었다.
연도를 배치 기준으로만 쓴다는 사실은 여섯 사실의 `note` 에 "배치 기준이지 시작한 해가 아니다" 로 명시했고,
`missing[]` 에 `miss-5` 로 남겼다(encykorea 발췌를 못 붙인 이유 포함).

### 7-2. [minor] 여덟 건

- **`claim-gg-571-act`** — 인용(`重修宫室, 蝗·旱罷伇`)에 장소가 없으므로 predicate 를 `syj:tookPlaceAt` → `syj:relatedTo` 로 낮추고, 좌표를 뺐다. 갈래도 蝗·旱으로 부역을 파한 기사라 economy → disaster 로 옮겨 id 를 `fact-gg-dis-004` 로 바꿨다(economy 3 = 할당, disaster 4 ≥ 2).
- **`fact-gg-dis-001`(523 기근)** — 장소가 없는 기사에 평양 좌표를 붙인 것을 지웠다. 장면 `scene-gg-relief-523` 의 `place` 도 `null` 로 바꿔 `dis-002`·`dis-003` 과 처리를 하나로 맞췄다. 이로써 장소 기록이 없는 기사에 좌표가 붙은 사실은 없다.
- **668년 호구 중복 계수** — `fact-gg-set-001` 의 `what` 에서 성 수를 빼 호구만 세고, `fact-gg-adm-002` 의 `what` 에서 "5부 176성 69만여 호" 를 빼 편제와 안동도호부만 담게 했다. 170(通典)/176(삼국사기) 차이는 두 사실의 note 에 같은 문장으로 적었다.
- **`fact-gg-adm-003` 巖州 존속** — `persistence.to` 를 645 로 닫고, 근거로 `claim-gg-645-withdraw`(`勑班師. 先拔遼·蓋二州戸口度遼 …`, 삼국사기 645)를 새로 달았다. "첫 사례" 표현은 순서를 빼고 "같은 원정에서 개모성은 蓋州, 요동성은 遼州가 되었다" 로 고쳤다(같은 인용이 遼·蓋 두 주를 증언한다).
- **`scene-gg-andong-668` 참가 인원 2만** — 근거가 없던 count 에 `claim-gg-668a-troops`(`以右威衞大將軍薛仁貴檢校安東都護, 㧾兵二萬人, 以鎮撫之.`)를 만들어 걸었다.
- **`fact-gg-cul-004` 졸본 시조묘** — 619년 제사 기사가 사당의 시작 연도를 말하지 않으므로 `persistence` 를 뺐고, 장면 쪽은 `kind: none` 으로 바꿨다.
- **`fact-gg-for-001`·`for-002` 권역** — note 에 "region 코드는 사행지가 아니라 주체인 고구려를 가리킨다(낙양·장안은 위도 34도대라 north 가 아니다)" 를 적었다.
- **586 천도 장면 중복** — 기존 `scene-city-pyongyang-capital-427-668` 은 427~668년 도읍기 전체를 담은 **기간 장면**(kind `settlement`)이고, 여기서 만든 `scene-gg-jangan-move-586` 은 586년 천도라는 **한 해의 사건 장면**(kind `migration`)이다. 성격이 달라 유지하되 `fact-gg-adm-001` 의 note 에 관계를 적었다.
- **호구 literal 을 숫자로 쓴 것** — 검수원 판단대로 `scripts/fact_predicates.json` 의 `numeric: true` 때문에 검증기가 숫자를 요구하므로 그대로 두었다(지시문과 어긋나는 것은 지시문 쪽이다).

### 7-3. 바뀐 수치

사실 26건(전과 같음), 장면 11개, claim 58개(전 57 — 연도 주장 6개 삭제, 새 근거 7개 추가).
갈래 할당은 settlement 4≥3, administration 5≥4, facility 3=3, economy 3=3, disaster 4≥2, culture 4≥2,
foreign 2=2, person 1=1 로 모두 채웠다. 10년 칸은 근거 없는 600·640 칸 여섯 개가 사라지고
580(5)·610(3)·640(4) 로 옮겨졌으며, 모든 사실의 `year` 는 자기 `claimIds` 안의 시간 주장이 대는 연도와 일치한다
(별도 스크립트로 26건 전수 확인).
