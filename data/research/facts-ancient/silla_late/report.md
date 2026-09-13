# silla_late 조사 보고 — 신라 500~668, 권역 south·central

## 1. 검색 과정

작업 폴더 `C:/Users/gkfkd/Git/sigong-facts`. 원문은 로컬 chunk 인용만 썼고, 웹은 좌표를 얻으려고 위키백과(ko/en)만 받았다. `db.history.go.kr` 은 열지 않았다.

쓴 명령(대표):

```
python scripts/search_chunks.py --source src-samguksagi --locator 新羅本紀 --from 500 --to 668 --limit 400 --format table --fields id,date,locator
python scripts/search_chunks.py --source src-samguksagi --locator 新羅本紀 --from 654 --to 668 --limit 300 --format table   # 전쟁 기사 제외 필터와 함께
python scripts/search_chunks.py --keyword 赤城 --limit 20 --format table
python scripts/search_chunks.py --keyword 南山新城 --limit 20 --format table
python scripts/search_chunks.py --keyword 신라 --locator "신라 › 비문" --limit 200 --format table   # 금석문 원문 조각만 추림
python scripts/search_chunks.py --id <chunk id>            # 채택 후보마다 전체 필드 확인
python scripts/check_fact_research.py data/research/facts-ancient --job silla_late
```

삼국사기 신라본기 권3~6 안에서 500~668년에 걸친 조각 약 480개를 훑고, 갈래 할당에 없는 전쟁 기사를 걸러 아래 후보 69개를 남겼다. 금석문은 `신라 › 비문` locator 로 원문 조각을 모두 뽑아 연대가 붙은 것만 골랐다.

## 2. 후보 표 (69건)

채택 = 이번 result.json 에 넣은 것, 보류 = 근거·장소·중복 문제로 뺀 것.

| # | 연도 | chunk / 사료 | 내용 | 갈래 | 판정 |
|---|---|---|---|---|---|
| 1 | 502 | sg_004_0020_0050 | 州郡主 勸農, 始用牛耕 | economy | **채택 fact-sl-015** |
| 2 | 502 | sg_004_0020_0030 | 순장 금지 | culture | 보류(장소 없음, 자리 부족) |
| 3 | 503 | sg_004_0020_0060 | 국호 신라 확정·왕호 제정 | administration | 보류(장소 없음) |
| 4 | 503 | 포항 냉수리비 | 재물 결정 | administration | 보류(기존 장면 scene-syj128-pohang-naengsuri-503) |
| 5 | 504 | sg_004_0020_0080 | 파리·미실·진덕·골화 등 12성 축조 | facility | 보류(성 위치 비정 불가) |
| 6 | 505 | sg_004_0020_0090 | 王親定國內州郡縣 | administration | **채택(fact-sl-005 보조 주장)** |
| 7 | 505 | sg_004_0020_0100 | 실직주 설치, 이사부 군주 | administration | **채택 fact-sl-005** |
| 8 | 505 | sg_004_0020_0110 | 始命所司藏氷, 制舟楫之利 | economy | 보류(장소 없음) |
| 9 | 506 | sg_004_0020_0120 | 春夏旱 民饑 發倉賑救 | disaster | **채택 fact-sl-018** |
| 10 | 509 | sg_004_0020_0130 | 置京都東市 | economy | **채택 fact-sl-016** |
| 11 | 509 | sg_004_0020_0150 | 隕霜殺菽 | disaster | 보류(피해 수치 없음) |
| 12 | 510 | sg_004_0020_0160 | 地震 壞人屋 有死者 | disaster | 보류(수치·장소 없음) |
| 13 | 512 | sg_004_0020_0180 | 우산국 복속 | foreign | 보류(기존 장면 scene-anc-usanguk-512) |
| 14 | 514 | sg_004_0020_0190 | 置小京於阿尸村 | administration | **채택(fact-sl-001 보조 주장)** |
| 15 | 514 | sg_004_0020_0200 | 徙六部及南地人戶, 充實之 | settlement | **채택 fact-sl-001** |
| 16 | 517 | sg_004_0030_0040 | 始置兵部 | administration | 보류(장소 없음) |
| 17 | 518 | sg_004_0030_0050 | 築株山城 | facility | 보류(위치 비정 불가) |
| 18 | 520 | sg_004_0030_0060 | 율령 반포, 백관 공복 제정 | administration | 보류(장소 없음) |
| 19 | 521 | sg_004_0030_0070 | 遣使於梁, 貢方物 | foreign | 보류(549·565년 건이 더 구체) |
| 20 | 524 | 울진 봉평리 신라비 | 지역 조처 | administration | 보류(기존 장면 scene-syj128-uljin-bongpyeong-524) |
| 21 | 528 | sg_004_0030_0110 | 肇行佛法, 이차돈 | culture | 보류(기존 장면 scene-anc-ichadon-527) |
| 22 | 531 | sg_004_0030_0130 | 命有司修理隄防 | economy | **채택 fact-sl-017** |
| 23 | 532 | sg_004_0030_0150 | 금관국왕 김구해 항복 | administration | 보류(가야 갈래, 다른 칸과 겹침) |
| 24 | 536 | 영천 청제비 병진명 | 청못 축조 | facility | 보류(기존 장면 scene-syj128-yeongcheon-cheongje-536) |
| 25 | 544 | sg_004_0040_0070 | 興輪寺成 | facility | 보류(기존 흥륜사 장면과 혼동 우려) |
| 26 | 545 | sg_004_0040_0090 | 國史 편찬 착수 | culture | **채택 fact-sl-022** |
| 27 | 549 | sg_004_0040_0110 | 양의 불사리, 백관이 흥륜사 앞길에서 봉영 | foreign | **채택 fact-sl-024** |
| 28 | 550 | 단양 신라 적성비 | 王敎事, 赤城佃舍法 | administration | **채택 fact-sl-006** |
| 29 | 551 | sg_004_0040_0150 | 하림궁 우륵 연주 | culture | 보류(기존 장면 scene-syj128-gugwon-ureuk-552) |
| 30 | 551 | 경주 명활성비 | 명활성 축성 | facility | 보류(기존 장면 scene-syj135-myeonghwalsanseong-chukseong-551) |
| 31 | 552 | 임신서기석 | 두 청년의 학문 서약 | culture | 보류(간지만 있고 장소 미상) |
| 32 | 553 | sg_004_0040_0180 | 월성 동쪽 신궁을 절로 바꿈 → 황룡사 | facility | **채택 fact-sl-012** |
| 33 | 553 | sg_004_0040_0190 | 백제 동북 변두리를 취해 新州(新興) 설치 | administration | **채택 fact-sl-007** |
| 34 | 554 | sg_004_0040_0210 | 修築明活城 | facility | 보류(551 장면과 중복) |
| 35 | 554 | sg_004_0040_0220 | 관산성 전투 | war | 보류(할당 없음, 기존 장면) |
| 36 | 555 | sg_004_0040_0240 | 王巡幸北漢山, 拓定封疆 | administration | **채택(fact-sl-009 장면 관련 주장)** |
| 37 | 555 | sg_004_0040_0230 | 비사벌에 완산주 설치 | administration | 보류(561 창녕비 기존 장면과 겹침) |
| 38 | 557 | sg_004_0040_0270 | 以國原爲小京 | administration | **채택 fact-sl-008** |
| 39 | 557 | sg_004_0040_0280 | 廢新州, 置北漢山州 | administration | **채택(fact-sl-007 종료 주장), 별도 사실은 보류(치소 미상)** |
| 40 | 558 | sg_004_0040_0290 | 徙貴戚子弟及六部豪民, 以實國原 | settlement | **채택 fact-sl-002** |
| 41 | 561 | 창녕 척경비 | 진흥왕 순수 | administration | 보류(기존 장면 scene-syj128-changnyeong-sunsu-561) |
| 42 | 565 | sg_004_0040_0370 | 陳이 불경 1700여 권을 보냄 | foreign | **채택 fact-sl-025** |
| 43 | 566 | sg_004_0040_0410 | 皇龍寺畢功 | facility | **채택(fact-sl-012 완공 주장)** |
| 44 | 566 | sg_004_0040_0380 | 祗園·實際 二寺成 | facility | 보류(절터 미상) |
| 45 | 568 | 북한산 진흥왕 순수비 | 巡狩, 路過漢城 | administration | **채택 fact-sl-009** |
| 46 | 568 | 마운령·황초령 순수비 | 순수 | administration | 보류(권역 north, 이 칸 밖) |
| 47 | 574 | sg_004_0040_0520 | 황룡사 장륙상 주조(銅 35,007근) | culture | 보류(자리 부족, 후속 조사 권장) |
| 48 | 576 | sg_004_0040_0550 | 始奉源花 → 화랑 | culture | 보류(장소 없음) |
| 49 | 578 | 대구 무술명 오작비 | 저수지 축조 | facility | 보류(기존 장면 scene-syj128-daegu-ojak) |
| 50 | 589 | sg_004_0060_0170 | 國西大水, 漂沒人戶 30,360, 死者 200여 | disaster | **채택 fact-sl-019** |
| 51 | 591 | sg_004_0060_0190 + 남산신성비 제1비 | 南山城 축조 周 2,854步 | facility | **채택 fact-sl-011** |
| 52 | 593 | sg_004_0060_0200 | 명활성 周3,000步·서형산성 周2,000步 개축 | facility | 보류(명활성 장면 중복) |
| 53 | 596 | sg_004_0060_0240 | 永興寺火, 延燒 350家 | disaster | **채택 fact-sl-020** |
| 54 | 613 | sg_004_0060_0430 | 황룡사 백고좌회 | culture | **채택 fact-sl-023** |
| 55 | 628 | sg_004_0060_0690/0700 | 大旱 移市 畫龍祈雨 / 民飢 賣子女 | disaster | 보류(자리 부족, 후속 조사 권장) |
| 56 | 634 | sg_005_0020_0110 | 芬皇寺成 | facility | **채택 fact-sl-013** |
| 57 | 635 | sg_005_0020_0140 | 靈廟寺成 | facility | 보류(절터 좌표 없음) |
| 58 | 639 | sg_005_0020_0260 | 何瑟羅州爲北小京 | administration | **채택 fact-sl-010** |
| 59 | 642 | sg_005_0020_0340 | 拜庾信爲押梁州軍主 | person | **채택 fact-sl-026** |
| 60 | 651 | sg_005_0030_0220 | 稟主를 執事部로 고침 | administration | 보류(장소 없음) |
| 61 | 655 | sg_005_0040_0140 | 立鼓樓月城內 | facility | 보류(자리 부족) |
| 62 | 657 | sg_005_0040_0170 | 一善郡大水, 溺死 300여 | disaster | **채택 fact-sl-021** |
| 63 | 658 | sg_005_0040_0190 | 하슬라 罷京爲州, 悉直爲北鎭 | administration | **채택(fact-sl-010 종료 주장)** |
| 64 | 663 | sg_006_0020_0320 | 南山新城에 長倉을 지음 | economy | 보류(fact-sl-014 note 로 기록) |
| 65 | 663 | sg_006_0020_0330 | 築冨山城 | facility | **채택 fact-sl-014** |
| 66 | 664 | sg_006_0020_0430 | 徙民於諸王陵園, 各二十戸 | settlement | **채택 fact-sl-003** |
| 67 | 665 | sg_006_0020_0560 | 絹布 1필 규격 개정 | economy | 보류(장소 없음) |
| 68 | 666 | sg_006_0020_0620 | 연정토 투항: 城12·戸763·口3,543 | settlement | **채택 fact-sl-004** |
| 69 | 668 | sg_006_0020_0850 | 국원 사신 용장의 욕돌역 잔치 | person | 보류(역 위치 미상) |

## 3. 판단

- **갈래 할당 충족.** 목표 `settlement 3 · administration 4 · facility 3 · economy 3 · disaster 2 · culture 2 · foreign 2 · person 1` 에 대해 실제 `settlement 4 · administration 6 · facility 4 · economy 3 · disaster 4 · culture 2 · foreign 2 · person 1` = 26건. 전쟁(war)은 할당에 없어 한 건도 넣지 않았다.
- **권역.** 위도 규정(central 37~39, south 37 미만)을 그대로 따랐다. 충주(36.99)와 단양(36.98)은 통상 중부로 부르지만 규정상 south 로 적고 해당 fact 의 note 에 밝혔다. central 4건은 삼척(505)·한강 하류 신주(553)·북한산(568)·강릉(639)이다.
- **기존 장면과의 중복 회피.** `services/host/app/history-scenes.json` 에서 480~690년 장면 27개를 뽑아 제목·id 를 대조했다. 우산국(512)·이차돈(527)·냉수리비(503)·봉평비(524)·청제비(536)·명활성비(551)·우륵(552)·창녕비(561)·오작비(518/578)·대야성(642)·황룡사 구층목탑(643~645)에 해당하는 건은 새 장면으로 만들지 않고 후보에서 뺐다.
- **좌표.** 만들지 않았다. 위키백과 13개 문서 머리의 십진 표시 좌표(class 가 geo 인 값)만 raw/*.html 에 바이트 그대로 받아 sha256·byteLength·fetchedUtc 를 manifest·sources 에 적고, 그 발췌를 인용하는 `syj:locatedAt` location 주장을 만들어 fact 의 coordinateBasis 와 scene 의 place.claimIds 에 걸었다. 출처당 발췌는 좌표 문자열 하나(2단어)뿐이다.
- **좌표를 두지 않은 사실**: fact-sl-001(아시촌 위치 학설 갈림), 003(왕릉원 다수), 004(왕도·주부 분산), 007(신주 치소 미상), 015·017·018(장소 무기재), 019(국서 범위), 020(영흥사 터 미확정), 025(수령 장소 무기재). 이유는 각 note 에 적었다.
- **행정 좌표의 한계.** 실직·국원·하슬라·일선군·압량주는 옛 치소 좌표가 아니라 오늘날 시·군 중심 좌표다. precision 을 area 로 두고 coordinateNote 에 밝혔다.
- **연대가 흔들리는 것**: 단양 적성비(550년 전후, 545·551년설), 북한산 순수비(568년 추정, 555·561년 이후설)는 confidence medium. 아시촌 소경도 위치 학설이 갈려 medium 이다.
- **수치 근거(density)**: fact-sl-003(능마다 20호), 004(763호 3,543구), 019(30,360호), 020(350가). 원문 단위를 그대로 unit 에 적었다(戶·口·家).
- **지속(persistence)**: 도읍·군현·성·절에 걸었다. 끝난 기록이 있는 것만 to 를 채웠다 — 신주 553→557(폐지 기사), 하슬라 북소경 639→658(罷京爲州). 황룡사·분황사·부산성·남산신성은 이 범위 안에 소멸 기록이 없어 to 는 null 이다.
- **predicate 를 고친 것**: 처음에 성 둘레와 역역 구간 길이를 `syj:administeredAs` 로 적었으나 이 predicate 는 州·郡·縣·京 같은 행정 단위 표기를 위한 것이므로, 둘레 주장은 빼고(연도 주장의 quote 에 이미 周二千八百五十四步 가 들어 있다) 구간 길이는 `syj:relatedTo` 로 바꿨다. 주어와 목적어가 같았던 relatedTo 주장 3건(적성·일선군·흥륜사)은 주어를 polity-silla 로 고쳤다.
- **yearVerbatim 의 한계**: 인용한 조각 본문에 연도 글자가 없고 월만 있는 경우(fact-sl-004·013·014·025)는 그 조각의 date.label 에 있는 재위년 표기를 적고 note 에 그 사실을 밝혔다. 북한산 순수비는 비에 연호가 남지 않아 '연대 표기 없음(568년 추정)' 으로 적었다.

## 4. 자체 대조

무작위 8건(claim-sl-07-a, 25-a, 04-p, 09-a, 16-a, 02-t, 02-a, 21-a)을 iter_chunks 로 다시 열어 quote 가 chunk text 의 부분 문자열인지, date.raw 서기연과 시간 값이 같은지, time 의 verbatim 이 chunk text 와 quote 양쪽에 있는지, sourceId 가 맞는지를 검증기와 별도로 확인했다 — 8건 모두 통과.

## 5. 검증기 출력

`python scripts/check_fact_research.py data/research/facts-ancient --job silla_late` (exit 0)

```
category × 10년
byCategoryDecade | 500 | 510 | 530 | 540 | 550 | 560 | 580 | 590 | 610 | 630 | 640 | 650 | 660 | total
-----------------+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+------
settlement       | 0   | 1   | 0   | 0   | 1   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 2   | 4
administration   | 1   | 0   | 0   | 0   | 3   | 1   | 0   | 0   | 0   | 1   | 0   | 0   | 0   | 6
facility         | 0   | 0   | 0   | 0   | 1   | 0   | 0   | 1   | 0   | 1   | 0   | 0   | 1   | 4
economy          | 2   | 0   | 1   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 3
disaster         | 1   | 0   | 0   | 0   | 0   | 0   | 1   | 1   | 0   | 0   | 0   | 1   | 0   | 4
culture          | 0   | 0   | 0   | 1   | 0   | 0   | 0   | 0   | 1   | 0   | 0   | 0   | 0   | 2
transport        | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
foreign          | 0   | 0   | 0   | 1   | 0   | 1   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 2
person           | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 1   | 0   | 0   | 1
war              | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0

region × 10년
byRegionDecade | 500 | 510 | 530 | 540 | 550 | 560 | 580 | 590 | 610 | 630 | 640 | 650 | 660 | total
---------------+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+------
capital        | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
north          | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
central        | 1   | 0   | 0   | 0   | 1   | 1   | 0   | 0   | 0   | 1   | 0   | 0   | 0   | 4
south          | 3   | 1   | 1   | 2   | 4   | 1   | 1   | 2   | 1   | 1   | 1   | 1   | 3   | 22
island         | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0

job 별 집계
job        | facts | scenes | claims | chunkClaims | excerptClaims
-----------+-------+--------+--------+-------------+--------------
silla_late | 26    | 17     | 76     | 63          | 13

PASS: failures=0 warnings=0
```

## 6. 못 찾은 것 (missing)

result.json 의 missing[] 에 5건을 적었다: 아시촌 소경 위치, 신주 치소, 영흥사 터, 신라 전체 호구 총수, 북한산주 치소.

## 7. 검수 반영 (2차)

검수원이 기각한 10건을 원문을 다시 열어 대조하고 모두 고쳤다. 뺀 사실은 없고 26건·17장면·76주장 그대로이며 갈래 할당도 유지된다(settlement 4·administration 5·facility 5·economy 3·disaster 4·culture 2·foreign 2·person 1).

| 항목 | 무엇이 문제였나 | 어떻게 고쳤나 |
|---|---|---|
| fact-sl-004 (비-minor) | 원문 오독. `chunk_samguksagi_sg_006_0020_0620` 은 "淵淨土, 以城十二·戸七百六十三·口三千五百四十三來投. 淨土及從官二十四人, 給衣物·糧料·家舎, 安置王都及州府. 其八城完, 並遣士卒鎮守." 로, 왕도·주부에 안치된 것은 연정토와 종관 24인뿐인데 what·density 가 763호 전부를 경주·주치로 옮긴 것처럼 읽혔다 | what 을 "연정토가 성 12·호 763·구 3543을 거느리고 투항했고, 연정토와 종관 24인은 왕도와 주부에 안치되었다"로 고쳤다. placeLabel 을 "연정토가 거느린 고구려 12성"(modernPlace "고구려 남부(정확한 위치 미상)")으로 바꿔 density 를 왕도·주부와 분리했다. note 에 원문 전문과 "온전한 8성에는 신라가 군사를 보내 지켰다"를 적었고, claim-sl-04-a·04-h·04-p 의 note 도 같이 바로잡았다 |
| fact-sl-009 | facts-brief 표는 立碑(금석문 비문 건립)를 facility 로 못박았는데 administration 이었다 | fact 와 scene-sl-bukhansan-sunsubi-568 의 category 를 모두 facility 로 옮겼다. administration 5건·facility 5건으로 두 할당 다 충족한다 |
| fact-sl-013 · 014 · 025 · 004 · 009 | yearVerbatim 에 인용 chunk 본문에 없는 글자(三年·二十六年·六年)나 서술문이 들어 있었다 | 다섯 건 모두 "원문 연도 표기 없음"으로 바꾸고, 연도가 chunk 의 date.raw(0634/0663/0565/0666/0568)에서 왔다는 사실을 note 로 옮겼다. **빈 문자열로 두라는 지적은 그대로 따르지 못했다** — 검증기가 facts 의 `yearVerbatim` 을 `str`(비지 않음)로 검사해 빈 값이면 5건 모두 실패한다(직접 실행해 확인). 원문에 없는 글자를 넣지 않는다는 취지만 살렸다 |
| fact-sl-003 | 원문 "命有司, 徙民於諸王陵園, 各二十戸." 에 없는 守 의 뜻을 붙였고, 능 하나당 20호를 fact 단위 밀도로 적었다 | what 을 "여러 왕릉원에 백성을 각 20호씩 옮겨 살게 했다"로 되돌리고 density.unit 을 "戶/陵園" 으로 바꿔 1능당 값임을 드러냈다. note 와 claim-sl-03-h 의 note 에 능의 수가 원문에 없어 총량 미상임을 적었다 |
| fact-sl-020 | 불에 탄 민가 350家(피해)를 density.households 로 넣었다 | density 를 통째로 제거하고 350家 는 what·note 에만 남겼다. note 에 "피해 수이지 취락 규모 기록이 아니다"를 적었다 |
| claim-sl-22-a (fact-sl-022) | 인용 "命大阿湌居柒夫等, 廣集文士, 俾之修撰." 에 장소가 없는데 predicate syj:participatedIn 으로 거칠부를 place-wolseong 에 묶었다 | entities 에 `work-guksa`(국사 편찬)를 더하고 predicate 를 syj:relatedTo, object 를 work-guksa 로 바꿨다. fact-sl-022 note 에 "좌표는 월성 표시 좌표를 placeLabel '신라 왕경' 기준 area 근사로 쓴 값이며 편찬이 월성에서 이루어졌다는 근거는 없다"를 적었다 |
| fact-sl-006 | 좌표가 위키백과 '단양군' 문서의 군 행정 중심인데 modernPlace 는 적성산성 자리인 "하방리"였다 | modernPlace 를 "충청북도 단양군"으로 완화하고 note 에 "좌표는 단양군 중심이며 적성비·적성산성 자리는 아니다(몇 km 어긋난다)"를 적었다. 같은 성격의 fact-sl-002·008(충주시청 좌표)에도 단서를 더했다 |
| fact-sl-024 | `chunk_samguksagi_sg_004_0040_0110` 본문은 정덕본·을해목활자본의 逸 자를 싣고 교감주가 《삼국사절요》의 送 을 밝히는데 note 에 그 사정이 없었다 | note 에 "인용 판본은 逸, 삼국사절요는 送 — '보내오자'는 送 을 따라 옮긴 것"을 적었다 |
| scene-sl-guksa-545 | 편찬 착수 장면에 sceneFunction print_workshop(인쇄 공방)이 붙어 화면에서 인쇄 장면이 선다 | 선택 필드이므로 sceneFunction 을 제거하고 성격은 summary 로만 남겼다 |
| fact-sl-005 | 실직주 persistence to=null 의 사정 설명이 없었다 | note 에 "658년 실직이 北鎭이 되는 등(chunk_samguksagi_sg_005_0040_0190 '又以悉直爲北鎭') 이후 성격이 바뀌지만 소멸 기록은 없어 to 를 null 로 둔다"를 적었다 |

수정에 쓴 원문은 모두 `--id` 로 다시 열어 확인했다: `chunk_samguksagi_sg_006_0020_0620`(연정토), `chunk_samguksagi_sg_006_0020_0430`(왕릉원 徙民), `chunk_samguksagi_sg_004_0040_0110`(사리, 교감주 sg_004_r023), `chunk_samguksagi_sg_005_0040_0190`(실직 北鎭 658).

### 2차 검증기 출력

```console
python scripts/check_fact_research.py data/research/facts-ancient --job silla_late

category × 10년
byCategoryDecade | 500 | 510 | 530 | 540 | 550 | 560 | 580 | 590 | 610 | 630 | 640 | 650 | 660 | total
-----------------+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+------
settlement       | 0   | 1   | 0   | 0   | 1   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 2   | 4
administration   | 1   | 0   | 0   | 0   | 3   | 0   | 0   | 0   | 0   | 1   | 0   | 0   | 0   | 5
facility         | 0   | 0   | 0   | 0   | 1   | 1   | 0   | 1   | 0   | 1   | 0   | 0   | 1   | 5
economy          | 2   | 0   | 1   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 3
disaster         | 1   | 0   | 0   | 0   | 0   | 0   | 1   | 1   | 0   | 0   | 0   | 1   | 0   | 4
culture          | 0   | 0   | 0   | 1   | 0   | 0   | 0   | 0   | 1   | 0   | 0   | 0   | 0   | 2
transport        | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
foreign          | 0   | 0   | 0   | 1   | 0   | 1   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 2
person           | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 1   | 0   | 0   | 1
war              | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0

region × 10년
byRegionDecade | 500 | 510 | 530 | 540 | 550 | 560 | 580 | 590 | 610 | 630 | 640 | 650 | 660 | total
---------------+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+------
capital        | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
north          | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
central        | 1   | 0   | 0   | 0   | 1   | 1   | 0   | 0   | 0   | 1   | 0   | 0   | 0   | 4
south          | 3   | 1   | 1   | 2   | 4   | 1   | 1   | 2   | 1   | 1   | 1   | 1   | 3   | 22
island         | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0

job 별 집계
job        | facts | scenes | claims | chunkClaims | excerptClaims
-----------+-------+--------+--------+-------------+--------------
silla_late | 26    | 17     | 76     | 63          | 13

PASS: failures=0 warnings=0
```
