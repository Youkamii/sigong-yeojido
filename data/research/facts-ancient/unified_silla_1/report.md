# unified_silla_1 조사 보고 — 통일신라 668~780

- 조사원: Claude Opus 5 (high), runner=workflow
- 결과(검수 반영 뒤): 사실 26건, 장면 20건, 주장 72건(전부 로컬 chunk 인용), 웹 출처 15건(좌표 전용)
- 검수 전 초판은 사실 26건·장면 19건·주장 70건·웹 출처 14건이었다. 바뀐 내용은 맨 아래 「8. 검수 반영」에 적었다.
- 검증기: `python scripts/check_fact_research.py data/research/facts-ancient --job unified_silla_1` → **PASS (failures=0, warnings=0)**

## 1. 검색 과정

`scripts/search_chunks.py` 로 연도 범위(668~780)와 갈래별 한자 키워드를 걸어 후보를 넓게 뽑았다. 실제로 돌린 명령은 대략 이렇다.

```
python scripts/search_chunks.py --source src-samguksagi --from 668 --to 780 --keyword 州 --format table --limit 60
python scripts/search_chunks.py --source src-samguksagi --from 668 --to 780 --keyword 市   (堤 倉 賑 驛 國學 戶 口)
python scripts/search_chunks.py --source src-samguksagi --from 668 --to 780 --keyword 寺   (地震 旱 蝗 疫 大水 徙 祿邑 田)
python scripts/search_chunks.py --source src-samguksagi --from 668 --to 780 --keyword 橋   (池 宮 城 開城 倭)
python scripts/search_chunks.py --source src-samguksagi --locator 雜志 --keyword 州 --limit 40
python scripts/search_chunks.py --keyword 小京   (毛伐 關門 鐘 甘山 神鍾 十七萬 金入宅 里坊)
python scripts/search_chunks.py --id <조각 id>        # 개별 조각 전문·date.raw 확인
```

`--keyword 堤` 와 `--keyword 祿邑` 은 이 연도 범위에서 결과가 0건이었다. 제방·녹읍은 `missing[]` 에 남겼다.

## 2. 후보 조각 (뽑아 본 것 전부)

`○` = 이번 결과에 채택, `–` = 후보로만 봄. 연도는 chunk `date.raw` 의 서기연이다. 조각 id 는 `chunk_samguksagi_` / `chunk_samgukyusa_` / `chunk_geumseok-` 접두어를 줄여 적었다.

| # | 조각 id | 연도 | 갈래 | 내용 | 채택 |
|---|---|---|---|---|---|
| 1 | sg_006_0020_0750 | 668 | administration | 置比列忽州, 용문을 총관으로 | – (전쟁기 임시 주) |
| 2 | sg_006_0020_0850 | 668 | transport | 褥突驛에서 국원 사신 용장이 잔치 | – (역 이름만, 위치 미상) |
| 3 | sg_006_0020_0890 | 668 | facility | 靈廟寺災 | – |
| 4 | sg_006_0020_0930 | 669 | disaster | 泉井·比列忽·各連 三郡民饑, 發倉賑恤 | ○ fact-017 |
| 5 | sg_006_0020_1020 | 670 | settlement | 攻取城六十三, 徙其人於内地 | ○ fact-026 |
| 6 | sg_006_0020_1040 | 670 | disaster | 京都地震 | – (779 지진이 더 구체적) |
| 7 | sg_006_0020_1060 | 670 | foreign | 倭國更号日本 | – (갈래 할당 밖) |
| 8 | sg_007_0020_0060 | 671 | facility | 震興輪寺南門 | – |
| 9 | sg_007_0020_0111 | 671 | administration | 置所夫里州, 진왕을 도독으로 | – (9주 정비 사실과 겹침) |
| 10 | sg_007_0020_0180 | 672 | facility | 築漢山州晝長城, 周四千三百六十歩 | ○ fact-010 |
| 11 | sg_007_0020_0300 | 673 | facility | 築國原城·北兄山城 등 8성 | – (개별 성 비정 어려움) |
| 12 | sg_007_0020_0340 | 673 | administration | 始置外司正, 州二人郡一人 | ○ fact-008 |
| 13 | sg_007_0020_0380 | 674 | facility | 宫内穿池造山(월지) | ○ fact-012 |
| 14 | sg_007_0020_0390 | 674 | disaster | 大風, 毀皇龍寺佛殿 | – |
| 15 | sg_007_0020_0440 | 675 | administration | 銅鑄百司及州郡印 頒之 | – |
| 16 | sg_007_0020_0550 | 676 | facility | 義相 創浮石寺 | – (기존 장면 scene-syj122-buseoksa-676 있음) |
| 17 | sg_007_0020_0660 | 678 | administration | 置北原小京 | ○ fact-005 |
| 18 | sg_007_0020_0680 | 678 | administration | 천훈을 武珍州 도독으로 | – |
| 19 | sg_007_0020_0780 | 679 | facility | 四天王寺成 | ○ fact-011 |
| 20 | sg_007_0020_0830 | 680 | administration | 加耶郡置金官小京 | ○ fact-006 |
| 21 | sg_008_0020_0170 | 683 | settlement | 安勝에게 京都의 甲第·良田 | – |
| 22 | sg_008_0020_0200 | 684 | settlement | 금마저 반란 → 徙其人於國南州郡, 以其地爲金馬郡 | ○ fact-025 |
| 23 | sg_008_0020_0210 | 685 | administration | 復置完山州 … 始備九州 | ○ fact-001 |
| 24 | sg_008_0020_0230 | 685 | administration/settlement | 置西原小亰 / 置南原小亰, 徙諸州郡民户分居之 | ○ fact-003, fact-004 |
| 25 | sg_008_0020_0250 | 685 | facility | 奉聖寺成 | – |
| 26 | sg_008_0020_0260 | 685 | facility | 望徳寺成 | – |
| 27 | sg_008_0020_0300 | 686 | administration | 泗沘州為郡, 熊川郡為州 | – |
| 28 | sg_008_0020_0320 | 686 | administration | 發羅州為郡, 武珍郡為州 | – |
| 29 | sg_008_0020_0360 | 687 | administration | 罷一善州, 復置沙伐州 | – |
| 30 | sg_008_0020_0390 | 687 | economy | 教賜文虎官僚田有差(관료전) | ○ fact-015 |
| 31 | sg_008_0020_0400 | 687 | facility | 築沙伐·歃良二州城 | – |
| 32 | sg_008_0030_0100 | 695 | disaster | 京都地震 | – |
| 33 | sg_008_0030_0120 | 695 | economy | 置西·南二市 | ○ fact-013 |
| 34 | sg_038_0020_2780 / 2820 | 695 | economy | 西市典·南市典, 孝昭王四年置, 監二人 | ○ fact-013 보강 |
| 35 | sg_008_0030_0140 | 696 | disaster | 國西旱 | – |
| 36 | sg_008_0030_0210 | 698 | disaster | 京都大水 | – |
| 37 | sg_008_0040_0100 | 703 | disaster | 京都大水, 溺死者衆 | – |
| 38 | sg_008_0040_0230 | 705 | disaster | 國東州郡饑, 人多流亡, 發使賑恤 | – (669 진휼과 겹치고 위치가 더 흐림) |
| 39 | sg_008_0040_0250 | 706 | disaster | 國内饑, 發倉廩賑之 | – |
| 40 | sg_008_0040_0640 | 713 | facility | 築開城 | – (개성 비정 논란) |
| 41 | sg_008_0040_0690 | 714 | disaster | 夏旱, 人多疾疫 | – |
| 42 | sg_008_0040_0750 | 715 | disaster | 大旱, 河西州 龍鳴嶽 居士 理曉, 祈雨於林泉寺池上 | ○ fact-019 |
| 43 | sg_008_0040_0850 | 716 | disaster | 旱, 又召居士理曉祈禱則雨 | – (715와 중복) |
| 44 | sg_008_0040_0920 | 718 | economy | 巡撫國西州郡, 親問髙年及鱞寡孤獨 | – |
| 45 | sg_008_0040_0990 | 718 | facility | 築漢山州都督管内諸城 | – |
| 46 | sg_008_0040_1160 | 722 | economy | 始給百姓丁田 | ○ fact-014 |
| 47 | sg_008_0040_1180 | 722 | facility | 築毛伐郡城, 以遮日夲賊路 | ○ fact-009 |
| 48 | sy_002_0010_0060_0010 | 722 | facility | 始築關門扵毛火郡, 周迴六千七百九十二歩五尺, 役徒三万九千二百六十二人 | ○ fact-009 |
| 49 | sg_008_0040_1410 | 728 | culture | 表請子弟入國學(당 국학 유학) | – |
| 50 | sg_008_0040_1670 | 736 | administration | 検察平壌·牛頭二州地勢 | ○ fact-007 |
| 51 | sg_009_0020_0310 | 742 | disaster | 東北地震, 有聲如雷 | – |
| 52 | sg_009_0030_0260 | 747 | culture | 置國學諸業愽士·助教 | ○ fact-022 |
| 53 | sg_038_0020_2120 | 682 | culture | 國學, 屬礼部, 神文王二年置 | ○ fact-022 보강 |
| 54 | sg_009_0030_0310 | 747 | disaster | 民饑且疫, 出使十道安撫 | – |
| 55 | sg_009_0030_0480 | 754 | facility | 修葺永興·元延二寺 | – |
| 56 | sg_009_0030_0490 | 754 | disaster | 旱·蝗 | – |
| 57 | sg_009_0030_0510 | 755 | economy | 穀貴民饑, 熊川州 向德 割股肉 | ○ fact-016 |
| 58 | sg_009_0030_0640 | 757 | administration | 9주 개명과 소경·군·현 편제 | ○ fact-002 |
| 59 | sg_009_0030_0740 | 760 | facility | 宫中穿大池 | – |
| 60 | sg_009_0030_0750 | 760 | transport | 於宫南蚊川之上, 起月浄·春陽二橋 | ○ fact-023 |
| 61 | sg_009_0030_0800 | 762 | administration | 築五谷·鵂巖·漢城·獐塞·池城·徳谷六城, 各置太守 | – (6성 개별 비정 어려움) |
| 62 | sg_009_0040_0070 | 766 | disaster | 康州地䧟成池, 縱廣五十餘尺 | – |
| 63 | sg_009_0040_0550 | 779 | disaster | 京都地震, 壞民屋, 死者百餘人 | ○ fact-018 |
| 64 | gskh_005_0020_0010…0020 | 719 | culture | 감산사 석조미륵보살입상 조상기 | ○ fact-021 |
| 65 | gskh_005_0070_0030…0020 | 771 | culture | 성덕대왕신종명 | ○ fact-020 |
| 66 | sy_003_0020_0070_0030 | 770 | culture | 봉덕사에 신종을 걸다(삼국유사) | ○ fact-020 보강 |
| 67 | sy_001_0020_0170_0020 | (날짜 없음) | settlement | 新羅全盛之時 京中十七萬八千九百三十六户, 一千三百六十坊, 五十五里 | ○ fact-024 |
| 68 | sg_034_0020_0210 | (날짜 없음) | administration | 九州所管郡縣, 無慮四百五十 | ○ fact-002 보강 |
| 69 | sg_035_0020_0020 | (날짜 없음) | facility | 中原京 … 文武王時築城, 周二千五百九十二歩 | – |
| 70 | sg_035_0020_0320 | (날짜 없음) | administration | 北原京 … 神文王五年築城, 周一千三十一歩 | ○ fact-005 보강 |
| 71 | sg_036_0020_0020 | (날짜 없음) | administration | 西原京, 神文王五年初置西原小京, 今清州 | ○ fact-003 보강 |
| 72 | sg_036_0020_0170 | (날짜 없음) | settlement | 南原小京, 神文王五年初置小亰, 今南原府 | ○ fact-004 보강 |
| 73 | sg_034_0020_0230 / 0340 | 524 / 665 | administration | 尚州·良州 조(신문왕 7년 축성 둘레 기록) | – (date.raw 가 6세기라 시간 주장에 못 씀) |
| 74 | sg_034_0020_0350 | 532 | administration | 金海小京(文武王二十年爲小京) | – (같은 이유, 본기 680 조각으로 대체) |
| 75 | sg_034_0020_0440 | (날짜 없음) | facility | 臨關郡 … 聖徳王築城, 以遮日本賊路 | – (관문성 사실과 중복) |

## 3. 고른 기준과 판단

- **갈래 할당**(settlement 4 · administration 5 · facility 3 · economy 3 · disaster 2 · culture 2 · transport 1)을 모두 채우고, 여유분은 장소가 뚜렷하고 뒤에 오래 남는 것으로 채웠다. 최종 26건: settlement 4 · administration 7 · facility 4 · economy 4 · disaster 3 · culture 3 · transport 1.
- **전쟁은 넣지 않았다.** 갈래 할당에 `war` 가 없어 668~676년 나당전쟁 기사는 후보에서 제외했다. 다만 670년 백제 63성 함락 기사는 전투가 아니라 **주민 이주**(徙其人於内地) 때문에 settlement 로 넣었다.
- **뒤에 남는 것 우선**: 소경 4곳(서원·남원·북원·금관), 9주 체제, 성 2곳(관문성·주장성), 절 2곳(사천왕사·감산사), 다리(월정교), 시장(서시·남시)에 `persistence` 를 붙였다. 소멸 기록이 원문에 없으므로 `to` 는 전부 `null` 이다.
- **사람이 어떻게 살았나**: 왕경 호수(178,936호)로 `density` 를 채우고, 관문성 역도 39,262명과 779년 지진 사망 100여 명을 `participantGroups.count` 로 넣었다. 남원소경 이주민과 금마저 강제 이주민은 인원이 원문에 없어 `count: null` 이다.
- **이미 있는 장면과 겹치지 않게**: `services/host/app/history-scenes.json` 의 650~800년 구간 장면(감은사 682, 부석사 676, 불국사 751, 기벌포 676, 매소성 675 등)을 확인하고 그 사건들은 새 장면으로 만들지 않았다. 부석사·감은사 창건은 후보에서 뺐다.
- **지리지 조각의 함정**: 삼국사기 지리지 상주·양주·김해소경 조는 `date.raw` 가 6세기(524·665·532)로 붙어 있어 그 조각으로 8세기 시간 주장을 만들면 연도 검사에 걸린다. 그래서 지리지는 **연도가 없는 조각**(중원경·북원경·서원경·남원소경·9주 총론)만 쓰고 시간은 본기 조각에서 댔다.
- **원문에 연호·재위년이 없는 조각**: `置北原小京` 처럼 본문에 연수 표기가 없는 조각은 `time.verbatim` 을 만들 수 없어 `{"kind":"year","value":678}` 형태의 year 주장을 썼다. verbatim 을 억지로 지어내지 않았다.
- **호구 수 literal**: 지시문에는 문자열로 적으라고 되어 있으나 `scripts/fact_predicates.json` 의 `syj:householdCount` 는 `"numeric": true` 라서 검증기가 문자열을 거부한다. 그래서 `{"kind":"literal","value":178936,"unit":"戶"}` 로 **숫자**를 넣었다. 이 판단으로 PASS 했다.

## 4. 좌표

좌표는 만들지 않고 ko/en 위키백과 문서 머리의 십진 표시 좌표(`class="geo"`)를 그대로 발췌해 `sources[].excerpts` 에 넣고 `coordinateBasis` 를 `"<sourceId> <excerptId>"` 로 적었다. 원본 HTML 14개는 `raw/` 에 바이트 그대로 두고 sha256·byteLength·fetchedUtc 를 `manifest.json` 과 `sources[]` 에 같은 값으로 기록했다.

| sourceId | 문서 | 발췌 좌표(lat; lon) | 쓰인 곳 |
|---|---|---|---|
| src-enwiki-gyeongju | en Gyeongju | 35.850; 129.217 | 왕경 관련 7건 |
| src-kowiki-jeonju | ko 전주시 | 35.82194; 127.14889 | 완산주 |
| src-kowiki-cheongju | ko 청주시 | 36.63333; 127.48333 | 서원소경 |
| src-enwiki-namwon | en Namwon | 35.41000; 127.38583 | 남원소경 |
| src-kowiki-wonju | ko 원주시 | 37.34167; 127.92083 | 북원소경 |
| src-enwiki-gimhae | en Gimhae | 35.23417; 128.88111 | 금관소경 |
| src-enwiki-pyongyang | en Pyongyang | 39.01667; 125.74750 | 평양주 |
| src-enwiki-wonsan | en Wonsan | 39.14750; 127.44611 | 천정군 |
| src-kowiki-gangneung | ko 강릉시 | 37.750; 128.900 | 하서주 |
| src-kowiki-gwanmunseong | ko 관문성 | 35.67000; 129.33472 | 모벌군성 |
| src-kowiki-namhansanseong | ko 남한산성 | 37.47803; 127.18419 | 주장성 |
| src-enwiki-sacheonwangsa | en Sacheonwangsa | 35.81917; 129.24194 | 사천왕사 |
| src-kowiki-woljeonggyo | ko 월정교 | 35.82944; 129.21806 | 월정교 |
| src-kowiki-iksan | ko 익산시 | 35.9438888989; 126.954444454 | 금마군 |

좌표를 못 구한 사실(외사정, 웅천주 향덕, 백제 63성)은 `lon`/`lat` 을 넣지 않고 `note` 에 이유를 적었다. ko 위키백과 경주시·남원시·김해시·평양시·원산시 문서에는 문서 머리 표시 좌표가 없어(`class="geo"` 없음) 영어판을 받아 썼고, 쓰지 않은 ko 원본은 지웠다.

`region` 코드는 지시 기준(north ≥ 39, central 37~39, south < 37, capital 은 도읍 반경 약 30km)대로 좌표 위도에 맞춰 붙였다. 평양(39.02)·원산(39.15)이 north, 원주(37.34)·남한산성(37.48)·강릉(37.75)이 central, 전주·청주·남원·김해·익산·공주가 south 다.

## 5. 스스로 검수한 것

- 70개 주장 전부를 빌더가 chunk 원문과 다시 대조했다: `quote` 가 공백 제거 후 chunk `text` 의 부분 문자열인지, `time.verbatim` 이 chunk text 와 quote 양쪽에 있는지, `sourceId` 가 chunk 의 것과 같은지, 시간 값이 `date.raw` 서기연과 같은지.
- 그 뒤 무작위 6건(`claim-us1-gwallyojeon-time`, `claim-us1-geumgwan-admin`, `claim-us1-rain715-act`, `claim-us1-757-hanju`, `claim-us1-seowon-admin`, `claim-us1-namwon-act`)을 `search_chunks.py --id` 로 다시 열어 인용·연도·locator 를 대조했다. 전부 일치했다.
- 좌표 발췌 14건은 검증기가 원본 HTML 텍스트와 대조해 통과시켰다(sha256·byteLength 포함).

**확인됨**: 검증기 PASS, 인용 대조 통과. **추정으로 남긴 것**: 주장성=남한산성 비정, 천정군=덕원(원산) 비정, 왕경 호수 기사의 연대와 해석(`confidence: low`), 임천사·용명악 자리.

## 6. 못 찾은 것 (missing[])

1. 주·군별 호구 수 — 지리지 권34~36에 통일신라 군현 호구가 없다. 신라촌락문서 판독문이 필요하다.
2. 제방·수리 시설 — 668~780년 구간에 築堤 기사가 0건이다. 영천 청제비·대구 무술오작비는 구간 밖이다.
3. 역·조운 — 욕돌역(668) 한 건 말고는 역로 기록을 못 찾아 transport 를 다리 한 건으로 채웠다.
4. 웅천주(공주)·우두주(춘천)·감산사지 좌표.

## 7. 검증기 출력

```
category × 10년
byCategoryDecade | 660 | 670 | 680 | 690 | 710 | 720 | 730 | 740 | 750 | 760 | 770 | total
-----------------+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+------
settlement       | 0   | 1   | 2   | 0   | 0   | 0   | 0   | 0   | 0   | 1   | 0   | 4
administration   | 0   | 2   | 3   | 0   | 0   | 0   | 1   | 0   | 1   | 0   | 0   | 7
facility         | 0   | 3   | 0   | 0   | 0   | 1   | 0   | 0   | 0   | 0   | 0   | 4
economy          | 0   | 0   | 1   | 1   | 0   | 1   | 0   | 0   | 1   | 0   | 0   | 4
disaster         | 1   | 0   | 0   | 0   | 1   | 0   | 0   | 0   | 0   | 0   | 1   | 3
culture          | 0   | 0   | 0   | 0   | 1   | 0   | 0   | 1   | 0   | 0   | 1   | 3
transport        | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 1   | 0   | 1
foreign          | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
person           | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
war              | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0

region × 10년
byRegionDecade | 660 | 670 | 680 | 690 | 710 | 720 | 730 | 740 | 750 | 760 | 770 | total
---------------+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+------
capital        | 0   | 3   | 1   | 1   | 1   | 2   | 0   | 1   | 1   | 2   | 2   | 14
north          | 1   | 0   | 0   | 0   | 0   | 0   | 1   | 0   | 0   | 0   | 0   | 2
central        | 0   | 2   | 0   | 0   | 1   | 0   | 0   | 0   | 0   | 0   | 0   | 3
south          | 0   | 1   | 5   | 0   | 0   | 0   | 0   | 0   | 1   | 0   | 0   | 7
island         | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0

job 별 집계
job             | facts | scenes | claims | chunkClaims | excerptClaims
----------------+-------+--------+--------+-------------+--------------
unified_silla_1 | 26    | 19     | 70     | 70          | 0

PASS: failures=0 warnings=0
```


## 8. 검수 반영 (2026-09-13)

검수원이 기각 2건(minor 아님)과 minor 8건을 냈다. 아래대로 고쳤고, 고친 뒤 검증기를 다시 돌려 PASS 했다.

### 기각 2건

**(1) fact-us1-024 — 삼국유사 왕경 호수 178,936호: 사실 자체를 뺐다.**
인용한 조각 `chunk_samgukyusa_sy_001_0020_0170_0020` 은 `date` 가 null 이고 본문에 연호도 없다. 그런데 초판은 연도 760·earliest 668·latest 780(조사 칸 경계를 그대로 옮긴 값)의 시간 주장을 만들고 `density {households: 178936}` 을 760년대에 달았다. 검증기는 date 가 null 이면 연도 검사를 건너뛰므로 이 창작을 잡지 못했고, 이 밀도 기록은 세계 연결 규칙(좌표 반경 40단위·연도 창 150년)에 걸려 실제 마을 밀도 계수를 바꾼다. 검수원이 준 세 갈래 중 (1)을 골랐다 — 사실과 주장 3건(`claim-us1-hosu-time/-count/-bang`)을 통째로 빼고 `missing[]` 에 `miss-us1-5`(전성기의 연대를 댈 출처가 필요하다)로 넘겼다. (3)안(encykorea 발췌로 연대를 다시 잡기)은 택하지 않았다. 웹 발췌로 연도를 대려면 발췌 안에 그 연도 숫자가 그대로 있어야 하는데 "8세기" 류의 서술은 이 조건을 못 채우고, 결국 다시 추정 연도를 붙이게 되기 때문이다.

**settlement 할당을 메운 새 사실 — fact-us1-027 (670년 안승·고구려 유민의 금마저 안치).**
`chunk_samguksagi_sg_006_0020_1000`(date.raw `0670-06-99L0`)의 "六月, 髙句麗水臨城人年岑大兄, 收合殘民 … 王處之國西金馬渚." 를 근거로 삼았다. 주장 4건(시점·장소·유민 집단·안승)과 장면 `scene-us1-anseung-670`(kind migration, sceneFunction migration)을 새로 만들었다. 좌표는 이미 받아 둔 `src-kowiki-iksan` 의 표시 좌표를 그대로 쓴다. 사람 수가 원문에 없으므로 density 는 붙이지 않았다. 684년 금마저 반란 진압 뒤 주민이 옮겨졌으므로(fact-us1-025) persistence 는 670~684로 닫았다. 새 장면 제목·주제가 `services/host/app/history-scenes.json` 과 겹치지 않는 것은 grep(안승·금마·보덕·익산)으로 확인했다.

**(2) fact-us1-019 — 기우 장소를 하서주에서 임천사로 바로잡고 좌표를 뺐다.**
원문은 "王召河西州龍鳴嶽居士理曉, 祈雨於林泉寺池上" 이다. 왕이 하서주 사람 이효를 *불러서* 임천사 못가에서 빌게 한 것이므로 행위 장소는 임천사이고 하서주는 이효의 출신지다. 고친 내용:
- `claim-us1-rain715-act` 의 대상을 `place-haseoju` → 새 엔티티 `place-imcheonsa` 로 바꾸고 인용을 "祈雨於林泉寺池上, 則雨浹旬." 로 좁혔다.
- 출신지는 새 주장 `claim-us1-rain715-origin`(`person-yihyo` — syj:relatedTo — `place-haseoju`, 인용 "王召河西州龍鳴嶽居士理曉")으로 따로 세웠다.
- 사실의 `lon`/`lat`/`coordinateBasis` 와 장면 `place` 를 지웠다(검증기가 장면 place 에 lon/lat 을 필수로 요구하므로 place 는 `null` 로 두고 설명은 summary·note 에 남겼다). 로컬 원문 전체를 `--keyword 林泉寺` / `龍鳴` 으로 훑어도 위치를 알려주는 조각은 이 한 건뿐이라 좌표를 댈 근거가 없다.
- 권역은 왕이 왕경에서 불러 시킨 일이므로 `central` → `capital` 로 바꿨다. placeLabel 도 "임천사 못가"로 고쳤다.
- 강릉 좌표 출처(`src-kowiki-gangneung`)는 이제 어떤 사실도 쓰지 않지만, 내려받은 기록이므로 sources·manifest 에는 남겨 뒀다.

### minor 8건

| 지적 | 조치 |
|---|---|
| cell.regions 에 capital 이 없는데 26건 중 14건이 capital | `cell.regions` 를 `["capital","south","central","north"]` 로 고쳤다(검수원 권장안). 왕경 사실을 south 로 뭉개면 도읍과 지방이 구분되지 않아 선언 쪽을 산출에 맞췄다. |
| 감산사에 경주시 표시점(약 12km 오차) | 영어 위키백과 「Gamsansa」를 새로 내려받아(`raw/en-gamsansa.html`, sha256 `0546d797…`) `class="geo"` 값 `35.7664625; 129.337048` 을 발췌로 삼고 사실·장면 좌표를 갈아끼웠다(precision `site`). ko 위키 「감산사지」에는 표시 좌표가 없어 쓰지 못했다. |
| 봉덕사(fact-us1-020)도 특정 절터 | 봉덕사 터는 자리가 미상이라 새 좌표를 댈 수 없었다. 다만 봉덕사는 왕경 안으로 비정되어 왕경 표시점과의 오차가 감산사만큼 크지 않으므로 좌표는 `precision: area` 로 두고, note 에 "터의 정확한 자리는 미상, 좌표는 왕경 전체 표시점, 종은 지금 국립경주박물관"이라고 적었다. |
| 향덕 기사(fact-us1-016)의 갈래 | `economy` → `disaster` 로 옮겼다(원문 첫 구절이 穀貴民饑). 결과는 economy 3/3, disaster 4/2 로 양쪽 할당을 지킨다. |
| participatedIn 주장 2건이 사람·집단 대신 장소를 가리킴 | `claim-us1-gwanmun-labor` 의 대상을 `group-gwanmun-labor` 로, `claim-us1-gamsan-person` 의 대상을 `person-gimjiseong` 으로 바꾸고 주체를 각각 `event-us1-gwanmun`·`event-us1-gamsan` 으로 맞췄다. |
| 남원소경 시점 인용이 서원소경 구절 | `claim-us1-namwon-time` 의 인용을 "三月, 置西原小亰, 以阿湌元泰為仕臣. 置南原小亰" 로 늘렸다. |
| 성덕대왕신종 연도 인용이 명문 제목뿐 | `claim-us1-bell-time` 의 인용을 같은 조각 안의 "大曆六年歲次辛亥 十二月十四日" 로 바꿨다. |
| time precision 과 verbatim 불일치 3건 | verbatim 을 precision 에 맞게 늘렸다: `claim-us1-quake779-time` "十五年, 春三月", `claim-us1-gwanmun-time` "開元十年壬戌十月", `claim-us1-gamsan-time` "開元七年己未二月十五日". 셋 다 조각 본문과 인용 양쪽에 있다. 관련 사실의 `yearVerbatim` 도 같은 표기로 맞췄다(fact-us1-009·018·019·021). |
| 월정교 출처 제목, 뜻 모를 'menge' id | 제목을 내려받은 문서의 실제 `<title>` 인 "경주 춘양교지와 월정교지 - 위키백과, 우리 모두의 백과사전" 으로 고쳤다. `place-cheongju-menge` → `place-cheongju-jinju`(청주 菁州, 오늘날 진주), `claim-us1-9ju-menge` → `claim-us1-9ju-geoyeol`(거열주를 갈라 두었다는 뜻)로 바꾸고 참조를 전부 따라 고쳤다. |

### 갈래 할당 (검수 반영 뒤)

settlement 4/4 · administration 7/5 · facility 4/3 · economy 3/3 · disaster 4/2 · culture 3/2 · transport 1/1 = 26건.

### 검증기 재실행 출력

```
category × 10년
byCategoryDecade | 660 | 670 | 680 | 690 | 710 | 720 | 730 | 740 | 750 | 760 | 770 | total
-----------------+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+------
settlement       | 0   | 2   | 2   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 4
administration   | 0   | 2   | 3   | 0   | 0   | 0   | 1   | 0   | 1   | 0   | 0   | 7
facility         | 0   | 3   | 0   | 0   | 0   | 1   | 0   | 0   | 0   | 0   | 0   | 4
economy          | 0   | 0   | 1   | 1   | 0   | 1   | 0   | 0   | 0   | 0   | 0   | 3
disaster         | 1   | 0   | 0   | 0   | 1   | 0   | 0   | 0   | 1   | 0   | 1   | 4
culture          | 0   | 0   | 0   | 0   | 1   | 0   | 0   | 1   | 0   | 0   | 1   | 3
transport        | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 1   | 0   | 1
foreign          | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
person           | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
war              | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0

region × 10년
byRegionDecade | 660 | 670 | 680 | 690 | 710 | 720 | 730 | 740 | 750 | 760 | 770 | total
---------------+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+------
capital        | 0   | 3   | 1   | 1   | 2   | 2   | 0   | 1   | 1   | 1   | 2   | 14
north          | 1   | 0   | 0   | 0   | 0   | 0   | 1   | 0   | 0   | 0   | 0   | 2
central        | 0   | 2   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 2
south          | 0   | 2   | 5   | 0   | 0   | 0   | 0   | 0   | 1   | 0   | 0   | 8
island         | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0

job 별 집계
job             | facts | scenes | claims | chunkClaims | excerptClaims
----------------+-------+--------+--------+-------------+--------------
unified_silla_1 | 26    | 20     | 72     | 72          | 0

PASS: failures=0 warnings=0
```
