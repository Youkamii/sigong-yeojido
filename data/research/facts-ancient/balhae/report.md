# balhae 조사 보고 (발해 698~926, 권역 north)

조사원: Claude Opus 5 / high. 작업 폴더 `data/research/facts-ancient/balhae`.
결과: 사실 25건, 장면 5건, 근거 주장 68건(로컬 원문 인용 65 · 웹 발췌 3). 검증기 PASS(실패 0, 경고 0).

## 1. 어떻게 찾았나

로컬 chunk 검색만 썼다(`scripts/search_chunks.py`). db.history.go.kr 은 열지 않았다.

```
grep -l "渤海" data/sources/jipseong-*/chunks.jsonl          # 발해 기사가 있는 사서 25종
python scripts/search_chunks.py --source src-jipseong-ko_034 --keyword 渤海 --limit 200   # 구당서 62건
python scripts/search_chunks.py --source src-jipseong-ko_035 --keyword 渤海 --limit 200   # 신당서 27건
python scripts/search_chunks.py --source src-jipseong-ko_044 --keyword 渤海 --from 698 --to 926   # 책부원구 151건
python scripts/search_chunks.py --source src-jipseong-ko_039 --keyword 渤海   # 당회요 12건
python scripts/search_chunks.py --source src-jipseong-ko_040 --keyword 渤海   # 오대회요 5건
python scripts/search_chunks.py --source src-zhws-balhaego --keyword 渤海     # 발해고 1건(전문 12,338자)
python scripts/search_chunks.py --source src-encykorea-balhae --keyword 발해  # 백과 발췌 6건
python scripts/search_chunks.py --source src-samguksagi --keyword 北國        # 삼국사기 신라본기 4건
python scripts/search_chunks.py --keyword 渤海 --from 924 --to 930            # 고려사·고려사절요 46건
python scripts/search_chunks.py --id <chunk id>                               # 조각 전체 확인
```

검색으로 나온 조각은 모두 310개였고, 그 가운데 아래 63개를 실제로 열어 읽고 판정했다.

### 후보 표(63개)

| # | chunk id | 갈래 후보 | date.raw | 내용 | 판정 |
|---|---|---|---|---|---|
| 1 | `chunk_jipseong-ko_034_ko_034_1650_0010` | administration/settlement | - | 구당서 발해말갈전 전문 — 동모산 축성·편호 10여만·홀한주 도독·833 학생 파견 | 채택 |
| 2 | `chunk_jipseong-ko_035_ko_035_1840_0050` | administration/economy/foreign | - | 신당서 발해전 전문 — 5경15부62주·산물 12종·5도·상경 천도 | 채택 |
| 3 | `chunk_zhws_balhaego_113277_325287` | administration/facility/foreign | - | 발해고(정약용 강역고) — 5경 15부 비정·상경 옛 성 규모·39역 1170리 | 채택 |
| 4 | `chunk_era51_encykorea-balhae-698` | administration | - | 한국민족문화대백과 — 698년 대조영 건국 | 채택 |
| 5 | `chunk_era51_encykorea-balhae-926` | administration | - | 한국민족문화대백과 — 925년 12월 침공, 926년 초 멸망 | 채택 |
| 6 | `chunk_period96_three_kingdoms_late_balhae-713` | administration | - | 한국민족문화대백과 — 713년 발해군왕, 국명 발해 | 채택 |
| 7 | `chunk_period96_three_kingdoms_late_balhae-start` | administration | - | 제정 시기 698년(표) | 보류(중복) |
| 8 | `chunk_period96_three_kingdoms_late_balhae-end` | administration | - | 폐지 시기 926년(표) | 보류(중복) |
| 9 | `chunk_period96_three_kingdoms_late_balhae-732` | war | - | 732년 장문휴 등주 공격 | 기각(전쟁 갈래 할당 없음) |
| 10 | `chunk_goryeosa_kr_001_0090_0020_0010` | settlement | 0925-09-06L0 | 925.9.6 발해 장군 신덕 등 500인 투항 | 채택(보조) |
| 11 | `chunk_goryeosa_kr_001_0090_0020_0020` | settlement/administration | 0925-09-10L0 | 925.9.10 대화균 등 民 100호 / 홀한성 포위와 멸망 / 5경15부62주 | 채택 |
| 12 | `chunk_goryeosa_kr_001_0090_0050_0010` | settlement | 0925-12-29L0 | 925.12.29 모두간·박어 民 1000호 | 채택 |
| 13 | `chunk_goryeosa-jeolyo_kj_001_0010_0090_0050_0010` | settlement | 0925 | 925.12 대광현 등 前後來奔者數萬戶·동단국 | 채택 |
| 14 | `chunk_goryeosa_kr_001_0110_0020_0010` | settlement | 0927-03-03L0 | 927.3.3 발해인 투항 | 기각(칸 연도 밖) |
| 15 | `chunk_goryeosa_kr_001_0120_0020_0010` | settlement | 0928-03-02L0 | 928.3.2 발해인 김신 등 60호 내투 | 기각(칸 연도 밖) |
| 16 | `chunk_goryeosa_kr_001_0120_0060_0010` | settlement | 0928-07-08L0 | 928.7.8 대유범 내부 | 기각(칸 연도 밖) |
| 17 | `chunk_goryeosa_kr_001_0120_0080_0020` | settlement | 0928-09-25L0 | 928.9.25 은계종 삼배 | 기각(칸 연도 밖) |
| 18 | `chunk_goryeosa_kr_001_0130_0020_0030` | settlement | 0929-06-23L0 | 929.6.23 홍견 귀부 | 기각(칸 연도 밖) |
| 19 | `chunk_goryeosa_kr_001_0130_0040_0020` | settlement | 0929-09-10L0 | 929.9.10 정근 내투 | 기각(칸 연도 밖) |
| 20 | `chunk_jipseong-ko_044_ko_044_0680_0550` | economy | 0738-08-99L1 | 738 윤8월 豹鼠皮 1000장·乾文魚 100구 | 채택 |
| 21 | `chunk_jipseong-ko_044_ko_044_0680_0590` | economy | 0740-10-99L0 | 740.10 豹鼠皮·昆布 | 보류(738과 품목 중복) |
| 22 | `chunk_jipseong-ko_044_ko_044_0720_0150` | economy | 0729-03-99L0 | 729.3 鯔魚 헌상, 帛 20필 하사 | 보류 |
| 23 | `chunk_jipseong-ko_044_ko_044_0680_0340` | economy | 0728-02-99L0 | 728.2 鷹(매) 헌상 | 보류 |
| 24 | `chunk_jipseong-ko_044_ko_044_0680_0520` | economy | 0737-04-99L0 | 737.4 공백계 鷹鶻 헌상 | 보류 |
| 25 | `chunk_jipseong-ko_044_ko_044_0680_0560` | economy | 0739-02-99L0 | 739.2 鷹 헌상 | 보류 |
| 26 | `chunk_jipseong-ko_044_ko_044_0680_0620` | economy | 0741-04-99L0 | 741.4 鷹·鶻 헌상 | 보류 |
| 27 | `chunk_jipseong-ko_044_ko_044_0680_0690` | foreign | 0746-03-99L0 | 746.3 賀正 | 보류 |
| 28 | `chunk_jipseong-ko_044_ko_044_0680_0720` | economy | 0749-03-99L0 | 749.3 鷹 헌상 | 보류 |
| 29 | `chunk_jipseong-ko_044_ko_044_0680_0740` | economy | 0750-03-99L0 | 750.3 鷹 헌상 | 보류 |
| 30 | `chunk_jipseong-ko_044_ko_044_0680_0780` | foreign | 0754-01-99L0 | 754.1 賀正 | 보류 |
| 31 | `chunk_jipseong-ko_044_ko_044_0690_0090` | foreign | 0773-06-99L0 | 773.6 賀正 | 보류 |
| 32 | `chunk_jipseong-ko_044_ko_044_0690_0210` | economy | 0777-02-99L0 | 777.2 鷹 헌상 | 보류 |
| 33 | `chunk_jipseong-ko_044_ko_044_0690_0390` | economy | 0814-11-99L0 | 814.11 鷹 헌상 | 보류 |
| 34 | `chunk_jipseong-ko_044_ko_044_0690_0640` | foreign | 0911-08-99L0 | 911.8 후량에 조하·방물 | 보류 |
| 35 | `chunk_jipseong-ko_044_ko_044_0720_0020` | foreign | 0724-02-99L0 | 724.2 하조경 賀正 | 보류 |
| 36 | `chunk_jipseong-ko_044_ko_044_0730_0070` | foreign | 0791-05-99L0 | 791.5 하정사 대상정 | 보류 |
| 37 | `chunk_jipseong-ko_044_ko_044_0730_0220` | economy | 0817-03-99L0 | 817.3 발해 사신 대성신에게 錦綿 하사 | 보류 |
| 38 | `chunk_jipseong-ko_044_ko_044_0730_0330` | foreign | 0837-01-99L0 | 837.1 인덕전 賀正 대면 | 보류 |
| 39 | `chunk_jipseong-ko_044_ko_044_0950_0010` | economy | 0836-06-99L0 | 836.6 치청절도사 熟銅 호시 요청 | 채택 |
| 40 | `chunk_jipseong-ko_039_ko_039_0110_0020` | culture | 0738-06-99L0 | 738.6.27 唐禮·三國志·晉書·三十六國春秋 필사 요청 | 채택 |
| 41 | `chunk_jipseong-ko_039_ko_039_0120_0020` | culture | 0837-03-99L0 | 837.3 대준명 수행 학생의 부학독서 | 보류 |
| 42 | `chunk_jipseong-ko_039_ko_039_0190_0020` | foreign | 0895-10-99L0 | 895.10 대위해에게 칙서 | 보류 |
| 43 | `chunk_jipseong-ko_039_ko_039_0480_0010` | administration | - | 당회요 발해조 개관 | 보류 |
| 44 | `chunk_jipseong-ko_039_ko_039_0480_0020` | foreign | 0792-12-99L1 | 792 윤12월 압말갈사 양길복 등 35인 내조 | 보류 |
| 45 | `chunk_jipseong-ko_040_ko_040_0050_0010` | economy/settlement | - | 오대회요 발해조 — 勝兵丁戶四十餘萬·926.4 인삼·곤포·백부자 | 채택 |
| 46 | `chunk_jipseong-ko_040_ko_040_0030_0020` | administration | - | 오대회요 거란조 — 926.7 부여성 함락·동단국 | 보류(전쟁) |
| 47 | `chunk_jipseong-ko_036_ko_036_0150_0010` | administration | 0926-01-99L0 | 구오대사 926.1 契丹寇渤海 | 보류(전쟁) |
| 48 | `chunk_jipseong-ko_036_ko_036_0160_0010` | foreign | 0926-04-99L0 | 926.4 대인선 사신 조공 | 보류 |
| 49 | `chunk_jipseong-ko_036_ko_036_0130_0030` | foreign | 0924-05-99L0 | 924.5 대인선 방물 | 보류 |
| 50 | `chunk_jipseong-ko_037_ko_037_0020_0030` | foreign | 0924-01-99L0 | 924.1 대우모 파견 | 보류 |
| 51 | `chunk_jipseong-ko_034_ko_034_0110_0110` | foreign | 0777-01-99L0 | 777.1 일본국 무녀 11인 헌상 | 채택 |
| 52 | `chunk_jipseong-ko_034_ko_034_0080_0130` | person | 0719-03-99L0 | 719.3 대조영 사망 | 보류(인물 할당 없음) |
| 53 | `chunk_jipseong-ko_034_ko_034_0090_0040` | person | 0738-99-99L0 | 738 대무예 사망 | 보류(인물 할당 없음) |
| 54 | `chunk_jipseong-ko_034_ko_034_0130_0070` | foreign | 0795-02-99L0 | 795.2 대숭린 발해군왕 책봉 | 보류 |
| 55 | `chunk_jipseong-ko_034_ko_034_0170_0010` | culture | 0824-02-99L0 | 824.2 대총예 등 50인 숙위 | 보류 |
| 56 | `chunk_jipseong-ko_034_ko_034_0180_0020` | foreign | 0831-01-99L0 | 831.1 대이진 책봉 | 보류 |
| 57 | `chunk_jipseong-ko_035_ko_035_0350_0090` | foreign | - | 신당서 지리지 — 등주에서 발해 왕성까지 도리기 | 보류(발해고와 중복) |
| 58 | `chunk_jipseong-ko_035_ko_035_0350_0040` | administration | - | 신당서 지리지 — 渤海都督府 등 기미주 | 보류 |
| 59 | `chunk_jipseong-ko_035_ko_035_0410_0070` | culture | - | 장건장 渤海國記 3권(예문지) | 보류 |
| 60 | `chunk_samguksagi_sg_010_0020_0310` | foreign | 0790-03-99L0 | 790.3 일길찬 백어를 북국에 사신으로 | 채택 |
| 61 | `chunk_samguksagi_sg_010_0050_0180` | foreign | 0812-09-99L0 | 812.9 급찬 숭정을 북국에 사신으로 | 보류(790과 성격 중복) |
| 62 | `chunk_samguksagi_sg_008_0040_1560` | war | 0733-07-99L0 | 733 당 현종이 발해 공격 요청 | 기각(전쟁) |
| 63 | `chunk_samguksagi_sg_046_0030_0160` | war | - | 최치원 상태사시중장 — 나·당의 발해 공격 | 기각(전쟁) |

후보 합계 63개


주 사료 세 덩어리가 이 칸의 뼈대다.

- **구당서 발해말갈전**(`chunk_jipseong-ko_034_ko_034_1650_0010`, 2,700자) — 동모산 축성, 편호 10여만, 홀한주 도독, 833년 학생 파견.
- **신당서 발해전**(`chunk_jipseong-ko_035_ko_035_1840_0050`, 2,732자) — 5경 15부 62주, 산물 12종, 대외 5도, 상경·동경 천도, 관제.
- **발해고**(정약용 강역고 渤海考, `chunk_zhws_balhaego_113277_325287`, 12,338자) — 5경 15부의 위치 비정, 상경 옛 성의 규모, 가탐 군국지의 39역 1170리.

## 2. 무엇을 골랐나 — 갈래 할당과 결과

| 갈래 | 할당(20건 기준) | 실제 | 비고 |
|---|---|---|---|
| administration | 6 | 7 | 건국·책봉·상경 천도·동경 천도·상경 환도·5경15부62주·멸망 |
| settlement | 4 | 5 | 편호 10여만, 유민 결집, 100호·1000호·수만 호 이탈 |
| facility | 3 | 3 | 오루하 성벽, 상경성 성곽, 부여부 주둔 |
| economy | 3 | 4 | 산물 12종, 738 가죽·마른 문어, 836 숙동 호시, 926 인삼·다시마 |
| foreign | 3 | 4 | 대외 5도, 신라도 39역, 777 일본 무녀, 790 신라 사신 |
| culture | 1 | 2 | 738 당례·삼국지 필사 요청, 833 태학 유학생 |
| **합계** | **20** | **25** | 권역은 전부 north |

### 사실 목록

| id | 갈래 | 연도 | 원문 표기 | 장소 | 내용 |
|---|---|---|---|---|---|
| `fact-balhae-001` | administration | 698 | 698년 | 동모산 | 대조영이 무리를 이끌고 계루의 옛 땅 동모산에 성을 쌓고 자리 잡아 나라를 세웠다. 성력 연간에 스스로 진국… |
| `fact-balhae-002` | administration | 713 | 713년 | 홀한주(발해 전역) | 당이 대조영을 발해군왕으로 책봉하고 그가 다스리는 땅을 홀한주로 삼아 홀한주도독을 겸하게 했다. 이때부터 말… |
| `fact-balhae-003` | administration | 755 | 天寶末 | 상경 용천부 | 문왕 대흠무가 天寶 말에 옛 도읍에서 300리 떨어진 홀한하 동쪽 상경으로 도읍을 옮겼다. |
| `fact-balhae-004` | administration | 785 | 貞元時 | 동경 용원부(책성부) | 문왕 말년 정원 연간에 도읍을 동남쪽 동경 용원부로 옮겼다. 동경은 경·염·목·하 네 주를 거느렸고 책성부라… |
| `fact-balhae-005` | administration | 794 | 改年中興 | 상경 용천부 | 대원의가 죽은 뒤 국인이 굉림의 아들 화여를 왕으로 세우니 도읍을 다시 상경으로 옮기고 연호를 중흥으로 고쳤… |
| `fact-balhae-006` | administration | 830 | 大和四年 | 발해 전역(5경 15부 62주) | 선왕 대인수가 해북 여러 부를 쳐서 강역을 크게 넓혔고, 발해는 해동성국으로 불리며 5경 15부 62주의 지… |
| `fact-balhae-007` | administration | 926 | 926년 | 홀한성(상경 용천부) | 거란이 크게 군사를 일으켜 발해 대인선을 치고 홀한성을 에워쌌다. 대인선이 싸움에 져 항복하면서 발해가 무너… |
| `fact-balhae-008` | settlement | 698 | 編戶十餘萬 | 발해(진국) 전역 | 대조영이 진국왕으로 선 무렵 발해의 편호가 10여만, 싸울 수 있는 군사가 수만이었다. |
| `fact-balhae-009` | settlement | 698 | 稍稍歸之 | 동모산 일대 | 대조영이 싸움을 잘하니 말갈 무리와 고구려 유민이 점차 모여들었고, 성곽을 쌓고 살자 고구려의 남은 사람들이… |
| `fact-balhae-010` | settlement | 925 | 率民一百戶來附 | 발해(예부경 대화균 등이 떠난 곳) | 발해 예부경 대화균, 균로사정 대원균, 공부경 대복모, 좌우위장군 대심리 등이 백성 100호를 이끌고 발해를… |
| `fact-balhae-011` | settlement | 925 | 十二月 | 발해(모두간·박어가 떠난 곳) | 발해 좌수위소장 모두간과 검교개국남 박어 등이 백성 1000호를 이끌고 발해를 떠나 고려에 붙었다. |
| `fact-balhae-012` | settlement | 925 | 前後來奔者數萬戶 | 발해(세자 대광현 등이 떠난 곳) | 거란이 발해를 멸하자 세자 대광현과 장군 신덕, 예부경 대화균, 소장 모두간, 검교개국남 박어 등이 남은 무… |
| `fact-balhae-013` | facility | 696 | 萬歲通天 | 태백산 동북 오루하 가 | 걸걸중상과 걸사비우가 무리를 이끌고 요수를 건너 태백산 동북으로 가서 오루하를 막고 성벽을 세워 스스로 지켰… |
| `fact-balhae-014` | facility | 755 | 週三十里 | 상경성(홀한성) 성곽 | 발해고가 인용한 성경지는 영고탑 서남 60리 호아합하 남쪽 옛 큰 성을 둘레 30리, 사면 7문, 내성 둘레… |
| `fact-balhae-015` | facility | 830 | 常屯勁兵 | 부여부 | 발해는 옛 부여 땅에 부여부를 두고 늘 날쌘 군사를 주둔시켜 거란을 막게 했다. 부여부는 부주와 선주 두 주… |
| `fact-balhae-016` | economy | 830 | 俗所貴者 | 노성·위성·현주·옥주·용주·솔빈부·남해부·미타호 | 발해에서 값지게 치는 것으로 노성의 벼, 위성의 쇠, 현주의 베, 옥주의 솜, 용주의 명주, 미타호의 붕어,… |
| `fact-balhae-017` | economy | 738 | 開元二十六年 | 발해에서 당으로 | 발해가 사신을 보내 표범쥐 가죽 1000장과 말린 문어 100마리를 당에 바쳤다. 발해가 내다 판 물건의 규… |
| `fact-balhae-018` | economy | 836 | 開成元年 | 치주·청주(당 치청절도사 관내) | 치청절도사가 신라와 발해 사신이 곧 올 터이니 숙동(정련한 구리)만은 금하지 말아 달라고 아뢰었다. 같은 달… |
| `fact-balhae-019` | economy | 926 | 天成元年四月 | 발해에서 후당으로 | 발해가 대진림 등 116인을 보내 조공하며 인삼과 다시마, 백부자를 바쳤다. 나라가 무너지기 직전까지 이어진… |
| `fact-balhae-020` | foreign | 830 | 日本道也 | 용원부·남해부·압록부·장령부·부여부 | 발해는 용원부에서 일본도, 남해부에서 신라도, 압록부에서 조공도, 장령부에서 영주도, 부여부에서 거란도로 나… |
| `fact-balhae-021` | foreign | 800 | 凡三十九驛 | 신라 천정군~발해 책성부 | 가탐의 군국지는 신라 천정군에서 발해 책성부까지 역 39개, 1170리라고 적었다. 신라와 발해를 잇는 신라… |
| `fact-balhae-022` | foreign | 777 | 十二年 | 발해 사신이 당에 이름 | 발해 사신이 일본에서 온 무녀 11인을 당에 바쳤다. 발해가 일본과 당 사이를 잇고 있었음을 보여준다. |
| `fact-balhae-023` | foreign | 790 | 三月 | 신라에서 북국(발해)으로 | 신라가 일길찬 백어를 북국(발해)에 사신으로 보냈다. 삼국사기에 남은 신라-발해 사이의 직접 왕래 기사다. |
| `fact-balhae-024` | culture | 738 | 二十六年 | 발해에서 당으로 | 발해가 사신을 보내 당례와 삼국지·진서·삼십육국춘추를 베껴 가기를 청해 허락받았다. |
| `fact-balhae-025` | culture | 833 | 七年正月 | 당 상도(장안) 태학 | 발해가 고보영 편에 학생 3인을 상도 태학에 보내 배우게 해 달라고 청했고, 앞서 보낸 학생 3인은 학업을 … |

## 3. 판단한 것들(결정사항)

1. **전쟁을 넣지 않았다.** 732년 장문휴의 등주 공격, 733년 나·당 협공, 926년 부여성 함락은 후보에서 읽었지만 이 칸의 갈래 할당에 war 가 없어 모두 기각했다. 다만 926년 발해 멸망은 나라가 끝난 행정 사실이라 `administration` 으로 넣고 장면 kind 만 `siege` 로 두었다.
2. **이미 있는 장면을 다시 만들지 않았다.** `services/host/app/history-scenes.json` 에 `scene-anc-balhae-698`(동모산 축성과 건국)이 있어 fact-balhae-001 은 `sceneId` 를 비우고 note 에 적었다. 검증기는 `sceneId` 가 같은 result.json 의 scenes 안에 있어야 통과하므로 기존 장면 id 를 그대로 쓸 수 없었다.
3. **좌표는 상경 용천부 하나만.** 영어 위키백과 `Shangjing Longquanfu` 문서 머리의 십진 표시 좌표(44.1306; 129.1417)를 발췌해 `syj:locatedAt` location 주장(`claim-balhae-sangyeong-loc`)으로 만들고, 좌표를 쓰는 사실 5건은 모두 이 claim id 를 `coordinateBasis` 로 가리킨다. 한국어 위키백과 상경용천부·팔련성 문서에는 표시 좌표가 없었고, 서고성 문서는 없었다. 동모산은 기존 장면이 남긴 판단(좌표 없음)을 그대로 따랐다. 못 구한 것은 `missing[]` 에 적었다.
4. **연도가 한 해로 특정되지 않는 것은 범위로 표시했다.** 상경 천도는 `天寶末`(742~756)이라 year 755·earliest 742·latest 756, 동경 천도는 `貞元時`(785~805)라 year 785·latest 793, 오루하 성벽은 `萬歲通天`(696~697)이라 earliest 696·latest 697 로 두었다. 신당서가 제도(5경 15부·산물·5도)를 적은 시점은 해동성국기라 기준 해를 선왕이 죽은 `大和四年`(830)으로 잡고 note 에 근거를 남겼다.
5. **호구 수는 원문 표기를 지켰다.** `編戶十餘萬`은 10만 호(하한), `率民一百戶`는 100호, `率民一千戶`는 1000호로 `density` 에 숫자로 넣었다. `前後來奔者數萬戶`는 어림수라 숫자로 환산하지 않고 `syj:administeredAs` literal 로만 남기고 density 를 비웠다.
6. **925년 유민 기사의 권역.** 기록은 고려 쪽(고려사·고려사절요)에 남았지만 인구가 빠져나간 곳은 발해이므로 권역을 north 로 집계하고, placeLabel 을 "발해(…가 떠난 곳)"로 적었다. 927~929년 기사는 이 칸의 연도(698~926) 밖이라 기각했다.
7. **836년 숙동 호시와 833년 유학생은 장소가 당이다.** 그래도 이 칸의 주체가 발해라 north 로 집계하고 note 에 그 사정을 적었다.
8. **literal 주장의 자료형.** 검증기 `scripts/fact_predicates.json` 은 `syj:householdCount`/`syj:populationCount` 에 `numeric: true` 를 걸어 두어 문자열 값을 거부한다. 그래서 호수만 수(100000·100·1000)로 넣고, 나머지 원문 표기 literal(`五京·十五府·六十二州`, `忽汗州都督`, `數萬戶` 등)은 문자열로 넣었다.

## 4. 장면 5개

| 장면 id | 종류 | 연도 | 좌표 | 내용 |
|---|---|---|---|---|
| `scene-balhae-sangyeong-move-755` | migration / administration | 755 | 상경(44.1306, 129.1417) | 문왕이 홀한하 동쪽 상경으로 천도 |
| `scene-balhae-sangyeong-wall-755` | construction / facility | 755~926 | 상경 | 둘레 30리·7문·내성 5리·궁전터 |
| `scene-balhae-fall-926` | siege / administration | 926 | 상경(홀한성) | 거란이 홀한성을 에워싸고 대인선이 항복 |
| `scene-balhae-aoluha-696` | construction / facility | 696~697 | 없음 | 오루하를 막고 성벽을 세워 스스로 지킴 |
| `scene-balhae-exodus-925` | migration / settlement | 925 | 없음 | 100호·1000호·수만 호가 발해를 떠남 |

좌표 근거가 없는 두 장면은 `place` 를 null 로 두었다(검증기는 place 객체가 있으면 lon/lat 를 반드시 수로 요구한다).

## 5. 웹 원본

| rawFile | URL | httpStatus | bytes | sha256(앞 16자) |
|---|---|---|---|---|
| `raw/enwiki-shangjing.html` | https://en.wikipedia.org/wiki/Shangjing_Longquanfu | 200 | 89045 | `d2a21fc7542fda47…` |
| `raw/kowiki-sangyeong.html` | https://ko.wikipedia.org/wiki/%EC%83%81%EA%B2%BD%EC%9A%A9%EC%B2%9C%EB%B6%80 | 200 | 84635 | `4ffc28db1b97e5ac…` |

발췌는 출처당 4단어·7단어(영어 위키), 8단어·5단어(한국어 위키)로 25단어 한도 안이고, 검증기가 HTML 텍스트와 대조해 통과했다.

## 6. 못 찾은 것 (missing)

- **5경의 좌표** — 상경 용천부만 영어 위키백과에서 십진 좌표를 얻었다. 중경 현덕부(서고성)·동경 용원부(팔련성)·남경 남해부·서경 압록부는 ko/en 위키백과에 좌표가 없거나 문서가 없었다. (필요한 출처: 국립문화유산연구원 또는 en.wikipedia 의 서고성·팔련성 문서(좌표 포함))
- **동모산 좌표** — 동모산은 위키백과 문서에 표시 좌표가 없어 좌표를 만들지 않았다. 기존 scene-anc-balhae-698 도 같은 이유로 좌표를 비워 두었다. (필요한 출처: 동모산(성산자산성) 위치를 십진 좌표로 적은 허용 출처)
- **발해 안의 재해·구휼 기사** — 중국 정사 발해전과 고려사에는 발해 내부의 가뭄·홍수·기근·진휼 기사가 없다. 이 칸에서 disaster 갈래를 채우지 못했다. (필요한 출처: 발해 관련 금석문 또는 일본 사서(속일본기) 전사본)
- **발해의 절·탑 건립 연대** — 상경성 절터·영광탑 같은 불교 시설의 건립 연대를 적은 원문 조각을 로컬 사료에서 찾지 못해 facility 를 성곽·주둔지로만 채웠다. (필요한 출처: 국가유산포털 또는 국립문화유산연구원의 발해 불교 유적 해설)

가장 아쉬운 것은 재해·구휼(disaster)이다. 중국 정사 발해전과 고려사 어디에도 발해 안의 가뭄·홍수·기근·진휼 기사가 없다. 이 칸의 할당에 disaster 가 없는 이유도 같을 것이다.

## 7. 검증기 출력

`python scripts/check_fact_research.py data/research/facts-ancient --job balhae`

```

category × 10년
byCategoryDecade | 690 | 710 | 730 | 750 | 770 | 780 | 790 | 800 | 830 | 920 | total
-----------------+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+------
settlement       | 2   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 3   | 5
administration   | 1   | 1   | 0   | 1   | 0   | 1   | 1   | 0   | 1   | 1   | 7
facility         | 1   | 0   | 0   | 1   | 0   | 0   | 0   | 0   | 1   | 0   | 3
economy          | 0   | 0   | 1   | 0   | 0   | 0   | 0   | 0   | 2   | 1   | 4
disaster         | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
culture          | 0   | 0   | 1   | 0   | 0   | 0   | 0   | 0   | 1   | 0   | 2
transport        | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
foreign          | 0   | 0   | 0   | 0   | 1   | 0   | 1   | 1   | 1   | 0   | 4
person           | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
war              | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0

region × 10년
byRegionDecade | 690 | 710 | 730 | 750 | 770 | 780 | 790 | 800 | 830 | 920 | total
---------------+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+------
capital        | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
north          | 4   | 1   | 2   | 2   | 1   | 1   | 2   | 1   | 6   | 5   | 25
central        | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
south          | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
island         | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0

job 별 집계
job    | facts | scenes | claims | chunkClaims | excerptClaims
-------+-------+--------+--------+-------------+--------------
balhae | 25    | 5      | 68     | 65          | 3

PASS: failures=0 warnings=0
```

exit code 0.


## 8. 검수 반영 (적대 검수 10건)

검수원이 기각 2건 + [minor] 8건을 냈다. 모두 원문을 다시 열어 확인한 뒤 고쳤다. 사실 25 → 27건, claim 68 → 72건(로컬 70 · 발췌 2), 장면 5건 그대로다.

### 기각 2건

1. **fact-balhae-019 — 원문에 없는 시간 해석** (확인됨). 오대회요 chunk(`chunk_jipseong-ko_040_ko_040_0050_0010`)를 다시 읽었다. 天成元年(926) 4월 조공 → 其年七月 조공 → `先是, 契丹大首領邪律阿保機 …` → `是歲率諸番部落攻渤海國 扶餘城, 下之` 순서라, 오대회요는 거란의 침공을 같은 해 **뒤쪽**에 놓는다. 반면 fact-balhae-007 과 claim-balhae-fall-time(백과 발췌: 925년 12월 침공·926년 초 멸망)은 4월보다 앞이다. 즉 "나라가 무너지기 직전까지 이어진 물자 왕래" 는 원문이 하지 않은 시간 해석이고 결과 파일 안에서도 자기모순이었다. what 의 마지막 문장을 **"오대회요는 이 조공을 후당 천성 원년(926) 4월조에 실었다"** 로 바꿔 원문 배치만 적고, 시점 충돌은 note 로 옮겨 양쪽 기술을 나란히 적었으며 confidence 를 medium → **low** 로 낮췄다. 근거 claim 두 개(claim-balhae-926-goods-time/-goods)는 인용·연호가 정확해 그대로 뒀다.
2. **fact-balhae-007 / scene-balhae-fall-926 — 갈래 오분류** (확인됨). 인용 원문이 `乃大擧, 攻渤海大諲譔, 圍忽汗城. 大諲譔戰敗乞降` 이고 장면은 kind=siege · sceneFunction=fortress · effects.attack.enabled=true · attacker/defender 참가자다. 사실과 장면의 category 를 `administration` → **`war`** 로 고쳤다. administration 은 6건(fact-001~006)이 남아 할당 6을 그대로 채우고, 0이던 war 가 1이 됐다(브리프의 "전투는 새 지역·새 시기에만" — 926년 만주에는 기존 장면이 없다).

### [minor] 8건

3. **fact-balhae-001 sceneId 충돌** — 규칙과 도구가 부딪히는 자리라 현 상태(sceneId: null)를 유지하고, 그 이유를 fact 의 note 와 `missing` 의 **miss-balhae-6** 에 적었다. 브리프 규칙 8은 기존 장면(scene-anc-balhae-698)의 id 를 적으라 하지만 `check_fact_research.py` 430~431 행은 fact.sceneId 를 같은 result.json 의 scenes 안에서만 찾으므로 기존 id 를 넣으면 검증이 실패한다. 도구 쪽 수정이 필요한 항목으로 올렸다.
4. **fact-balhae-013 이 칸 밖(696)** — 칸 밖임을 note 에 명시하고, 범위 안 시설을 1건 보강했다. 새 **fact-balhae-027**(남경 남해부의 돌쌓은 둘레 9리 성, 발해고가 인용한 성경지·요사 기술)을 넣어 698~926 안의 facility 가 014·015·027 3건이 됐다. 정약용이 요 해주=남해부 비정을 의심한 점을 note 에 적고 confidence 는 low, 좌표는 넣지 않았다.
5. **권역 표기(north 에 섞인 중국 내지 사건)** — 권역 코드에 국외가 없다는 점을 `missing` 의 **miss-balhae-5** 로 올리고, 해당 사실 6건(017·018·019·022·024·025)의 note 에 통일된 문구 **"집계 권역은 주체(발해) 기준이며 실제 장소는 북위 약 N도의 …다"** 를 넣었다(장안 34.3 · 낙양 34.8 · 산둥 36.8).
6. **claim-balhae-buyeobu-time 의 설치 연도 830 단정** — predicate 를 `syj:establishedIn` → `syj:occurredIn` 으로 낮추고 quote 를 제도 서술의 기준 해가 드러나는 `大和四年(830), 仁秀死, 謚宣王` 로 바꿨으며, fact-balhae-015 의 `persistence` 를 **비웠다**(830년에 부여부가 생긴 것처럼 세계 표시에 들어가지 않게). 같은 이유로 claim-balhae-sangyeongseong-time 도 `syj:builtIn` → `syj:occurredIn` 으로 낮추고 "축조 연도가 아니라 상경 천도 기준 해" 를 note 에 적었다.
7. **syj:administeredAs 남용** — 원문 행정 단위 표기가 아닌 값 4건을 옮겼다. 성곽 규모(claim-balhae-sangyeongseong-scale)·주둔(claim-balhae-buyeobu-garrison)·호수 어림수(claim-balhae-manho-scale)는 `syj:relatedTo`(entity)로 바꾸고 원문은 quote 와 note 에 남겼다. 현대 지명 비정(claim-balhae-sangyeong-modern)은 좌표가 없어 `syj:locatedAt` 으로 올릴 수 없으므로 **claim 을 지웠다**(발췌 ex-sangyeong-place 는 sources 에 그대로 두었고, 현대 지명은 fact.modernPlace 에만 남는다). 대신 행정 단위 표기로 쓸 수 있는 claim 2건(claim-balhae-buyeobu-unit `扶餘府 領扶·仙二州`, claim-balhae-namhaebu-unit `南京 南海府 領沃·睛·椒三州`)을 신당서 원문에서 새로 뽑았다. predicate 목록에 규모·주둔용이 없다는 점은 **miss-balhae-7** 로 올렸다.
8. **fact-balhae-012 중복 계수** — note 에 "이 수만 호는 010(100호)·011(1000호) 무리를 이름까지 나열해 포함한 총계" 를 명시하고 density 를 비운 상태를 유지했다. 겹치지 않는 취락 사실로 새 **fact-balhae-026**(거란이 발해를 멸한 뒤 부락을 사로잡아 요동으로 옮기고 발해 주현 이름을 요동 고을에 옮겨 붙였다, 발해고)을 넣어 겹치지 않는 settlement 가 008·009·026 3건 + 이주 묶음 1건이 됐다.
9. **fact-balhae-017 의 "내다 판"** — 원문 `遣使獻` 은 조공이므로 what 을 **"바쳤다"** 로 고치고, 수량도 **"말린 문어 100마리(원문 一白口, 一百口의 오기로 본다)"** 로 what 안에서 유보를 드러냈다.
10. **fact-balhae-021 의 신라도 단정** — what 에서 "신라도의 길이다" 를 빼고 "신라와 발해를 잇는 육로다" 로 고쳤다. note 에 "발해고는 이 가탐 군국지 대목을 동경 용원부(책성부) 항목에 싣고, 신당서는 `南海, 新羅道也` 로 신라도를 남해부에 건다. 39역을 신라도로 보는 것은 후대 통설" 을 적고, transport 할당이 없어 foreign 으로 두는 근거도 함께 남겼다.

### 새로 넣은 근거(모두 로컬 chunk 인용, 검증기 통과)

| claim | 인용 | quote |
|---|---|---|
| claim-balhae-buyeobu-unit | chunk_jipseong-ko_035_ko_035_1840_0050 | 扶餘故地爲扶餘府, 常屯勁兵扞契丹, 領扶·仙二州 |
| claim-balhae-namhaebu-unit | 같은 chunk | 沃沮故地爲南京, 曰南海府, 領沃·睛·椒三州 |
| claim-balhae-namhaebu-wall | chunk_zhws_balhaego_113277_325287 | 海州渤海南京.疊石爲城.幅員九里.都督沃晴椒三州 |
| claim-balhae-namhaebu-time | chunk_jipseong-ko_035_ko_035_1840_0050 | 大和四年(830), 仁秀死, 謚宣王 |
| claim-balhae-georan-relocate | chunk_zhws_balhaego_113277_325287 | 契丹旣滅渤海.虜其部落.多徙遼東.遂取渤海州縣之名 |

### 수정 뒤 검증기 출력

`python scripts/check_fact_research.py data/research/facts-ancient --job balhae`

```
category × 10년
byCategoryDecade | 690 | 710 | 730 | 750 | 770 | 780 | 790 | 800 | 830 | 920 | total
-----------------+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+------
settlement       | 2   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 4   | 6
administration   | 1   | 1   | 0   | 1   | 0   | 1   | 1   | 0   | 1   | 0   | 6
facility         | 1   | 0   | 0   | 1   | 0   | 0   | 0   | 0   | 2   | 0   | 4
economy          | 0   | 0   | 1   | 0   | 0   | 0   | 0   | 0   | 2   | 1   | 4
disaster         | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
culture          | 0   | 0   | 1   | 0   | 0   | 0   | 0   | 0   | 1   | 0   | 2
transport        | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
foreign          | 0   | 0   | 0   | 0   | 1   | 0   | 1   | 1   | 1   | 0   | 4
person           | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
war              | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 1   | 1

region × 10년
byRegionDecade | 690 | 710 | 730 | 750 | 770 | 780 | 790 | 800 | 830 | 920 | total
---------------+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+------
capital        | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
north          | 4   | 1   | 2   | 2   | 1   | 1   | 2   | 1   | 7   | 6   | 27
central        | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
south          | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
island         | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0

job 별 집계
job    | facts | scenes | claims | chunkClaims | excerptClaims
-------+-------+--------+--------+-------------+--------------
balhae | 27    | 5      | 72     | 70          | 2

PASS: failures=0 warnings=0
```

exit code 0. 갈래 할당은 administration 6/6 · settlement 6/4 · facility 4/3(범위 안 3) · economy 4/3 · foreign 4/3 · culture 1 이상(2) 로 모두 충족하고, war 1건이 새로 잡혔다.
