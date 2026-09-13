# cross_facility_culture — 시설·종교·교육 횡단 (-57~935)

조사원: Opus 5 (high). 작업 폴더 `data/research/facts-ancient/cross_facility_culture/`.

## 1. 검색 과정

로컬 chunk 만 썼다(`db.history.go.kr` 은 열지 않았다). 실제로 돌린 명령 계열은 다음과 같다.

```
python scripts/search_chunks.py --source src-samguksagi --from -57 --to 935 --keyword 築城 --limit 80 --format table
python scripts/search_chunks.py --source src-samguksagi --from -57 --to 935 --keyword 築  --limit 60
python scripts/search_chunks.py --source src-samguksagi --from -57 --to 935 --keyword 堤  --keyword 橋 --keyword 立碑
python scripts/search_chunks.py --source src-samguksagi --from -57 --to 935 --keyword 創  --keyword 寺成
python scripts/search_chunks.py --source src-samguksagi --from -57 --to 935 --keyword 佛法 --keyword 國學 --keyword 讀書 --keyword 花郞 --keyword 漏刻 --keyword 塔
python scripts/search_chunks.py --source src-samgukyusa --locator 塔像 --limit 60
python scripts/search_chunks.py --source src-samgukyusa --locator 興法 --limit 40
python scripts/search_chunks.py --id <chunk id>          # 채택 후보는 전부 전체 본문을 열어 대조
```

두 갈래 키워드를 합쳐 -57~935 범위에서 연도를 읽을 수 있는 후보 **171건**을 모았고,
그 가운데 장소가 특정되거나 뒤에 오래 남는 것 위주로 26건을 골랐다. 아래 표는 채택분 전부와
미채택 후보를 균등 간격으로 섞은 발췌다(전체 목록은 위 명령을 그대로 다시 돌리면 재현된다).

금석문(`data/sources/geumseok-*`)은 chunk 에 `date` 가 없어 `--from/--to` 로 잡히지 않고,
비문 연호를 서기연으로 옮길 로컬 근거가 없어 이번 칸에서는 인용하지 않았다(missing miss-1).


## 2. 후보 표 (발췌 56행 / 전체 171)

| 갈래 | 연도 | chunk id | 기사 | 원문 앞부분 | 채택 |
|---|---|---|---|---|---|
| culture | -37 | `chunk_samgukyusa_sy_003_0020_0020_0010` | 고구려 성왕이 탑을 세우다 | 遼東城育王塔 三寳感通録載. 髙䴡遼東城傍塔者古老傳云. 昔髙䴡聖王按行國界次, 至此城見五色雲覆地徃尋雲中, 有僧執錫 |  |
| culture | 374 | `chunk_samgukyusa_sy_003_0010_0030_0040` | 묵호자와 아도에 대한 논 | 㨿此, 夲記與夲碑二說相戾不同如此. 嘗試論之. 梁·唐二僧傳及三國夲史皆載䴡 濟二國佛教之始在晉末大元之間, 則二道法 |  |
| culture | 375 | `chunk_samguksagi_sg_018_0030_0060` | 초문사와 이불란사를 창건하다 | 五年, 春二月, 始創肖門寺, 以置順道. 又創伊弗蘭寺, 以置阿道. 此海東佛法之始. | O |
| culture | 384 | `chunk_samguksagi_sg_024_0100_0030` | 마라난타가 불교를 전래하다 | 九月, 胡僧摩羅難陁自晉至, 王迎之, 致宫内禮敬焉. 佛法始於此. | O |
| culture | 393 | `chunk_samguksagi_sg_018_0050_0051` | 평양에 9개의 절을 창건하다 | 創九寺於平壤. | O |
| culture | 498 | `chunk_samguksagi_sg_019_0020_0220` | 금강사를 창건하다 | 秋七月, 創金剛寺. | O |
| culture | 503 | `chunk_samguksagi_sg_004_0020_0060` | 국호를 신라로 획정하고 임금을 왕이라고 부르다 | 四年, 冬十月, 羣臣上言, “始祖創業已來, 國名未定, 或稱斯羅, 或稱斯盧, 或言新羅. 臣等以爲新者德業日新,  |  |
| culture | 527 | `chunk_samgukyusa_sy_003_0010_0040_0050` | 대통사가 세워지다 | 又於大通元年丁未, 爲梁帝創寺於熊川州名大通寺. | O |
| culture | 528 | `chunk_samguksagi_sg_004_0030_0110` | 불교가 비로소 널리 퍼지다 | 十五年, 肇行佛法. 初訥祇王時, 沙門墨胡子自高句麗至一善郡, 郡人毛禮於家中作窟室安置. 於時, 梁遣使賜衣着·香物 | O |
| culture | 549 | `chunk_samguksagi_sg_004_0040_0110` | 양나라에서 부처의 사리를 보내다 | 十年, 春, 梁遣使與入學僧覺德, 逸佛舍利. 王使百官, 奉迎興輪寺前路 |  |
| culture | 566 | `chunk_samguksagi_sg_004_0040_0380` | 기원사와 실제사가 완공되다 | 二十七年, 春二月, 祗園·實際二寺成. |  |
| culture | 587 | `chunk_samguksagi_sg_004_0060_0140` | 대세와 구칠이 바다로 가다 | 九年, 秋七月, 大世·仇柒二人適海. 大世 奈勿王七世孫伊湌冬臺之子也. 資俊逸, 少有方外志. 與交遊僧淡水曰, “ |  |
| culture | 600 | `chunk_samguksagi_sg_027_0040_0030` | 왕흥사를 창건하다 | 二年, 春正月, 創王興寺, 度僧三十人. | O |
| culture | 600 | `chunk_samgukyusa_sy_003_0010_0050_0020` | 왕흥사ㆍ미륵사가 세워지다 | 明年庚申度僧三十人, 創王興寺於時都泗泚城始立栽而升遐. 武王継統, 父基子構歴數紀而畢成, 其寺亦名弥勒寺. 附山臨水 |  |
| culture | 634 | `chunk_samguksagi_sg_005_0020_0110` | 분황사가 완성되다 | 芬皇寺成. | O |
| culture | 634 | `chunk_samguksagi_sg_027_0050_0440` | 왕흥사를 준공하다 | 三十五年, 春二月, 王興寺成. 其寺臨水, 彩餙壯麗. 王每乗舟, 入寺行香. |  |
| culture | 640 | `chunk_samguksagi_sg_020_0030_0190` | 당에 자제의 국학 입학을 요청하다 | 王遣子弟入唐, 請入國學. |  |
| culture | 643 | `chunk_samgukyusa_sy_003_0020_0150_0090` | 자장법사가 삼장을 통도사에 안치하다 | 貞観十七年慈藏法師載三藏四百餘凾來, 安于通度寺. |  |
| culture | 650 | `chunk_samguksagi_sg_022_0020_0150` | 보덕이 남쪽으로 옮겨가다 | 九年, 夏六月, 盤龍寺普德和尚, 以國家奉道, 不信佛法, 南移完山 孤大山. |  |
| culture | 668 | `chunk_samguksagi_sg_022_0020_0480` | 당 고종이 고구려 정복 의례를 행하다 | 十二月, 帝受俘于含元殿. 以王政非己出, 赦以爲司平大常伯·貟外同正, 以泉男産爲司宰少卿, 僧信誠爲銀青光禄大夫,  |  |
| culture | 676 | `chunk_samguksagi_sg_007_0020_0550` | 의상이 부석사를 창건하다 | 十六年, 春二月, 髙僧義相奉旨, 創浮石寺. | O |
| culture | 679 | `chunk_samguksagi_sg_007_0020_0770` | 동궁을 짓고 문의 이름을 정하다 | 創造東宫, 始定内外諸門額號. |  |
| culture | 682 | `chunk_samguksagi_sg_038_0020_2120` | 국학 | 國學, 屬礼部, 神文王二年置. 景徳王攺爲大學監, 惠恭王復故. | O |
| culture | 685 | `chunk_samguksagi_sg_008_0020_0260` | 망덕사가 완성되다 | 夏四月, 望徳寺成. |  |
| culture | 718 | `chunk_samguksagi_sg_038_0020_2920` | 누각전 | 漏刻典, 聖徳王十七年始置. |  |
| culture | 746 | `chunk_samguksagi_sg_009_0030_0240` | 승려가 되도록 허락하다 | 度僧一百五十人. |  |
| culture | 755 | `chunk_samguksagi_sg_009_0030_0520` | 망덕사탑이 흔들리다 | 望德寺塔動. |  |
| culture | 764 | `chunk_samgukyusa_sy_003_0020_0080_0010` | 선덕왕이 영묘사를 창건하고 경덕왕대 장육존상을 개금하다 | 霊妙寺丈六 善徳王創寺塑像因縁, 具載良志法師傳. 景徳王即位二十三年丈六攺金, 租二万三千七百碩. |  |
| culture | 794 | `chunk_samguksagi_sg_010_0020_0520` | 봉은사 창건과 한산주의 흰 새 진상 및 망은루 건립 | 秋七月, 始創奉恩寺. 漢山州進白鳥. 起望恩樓於宫西. |  |
| culture | 802 | `chunk_samguksagi_sg_010_0040_0190` | 가야산 해인사를 세우고 삽량주가 붉은 까마귀를 바치다 | 八月, 創加耶山海印寺. 歃良州進赤烏. | O |
| culture | 827 | `chunk_samguksagi_sg_010_0060_0050` | 고구려 승려 구덕이 불경을 가지고 오다 | 三月, 髙句麗僧丘徳入唐, 賷經至, 王集諸寺僧徒, 出迎之. |  |
| culture | 840 | `chunk_samguksagi_sg_011_0020_0050` | 당에 갔던 질자와 학생들이 추방되어 돌아오다 | 唐 文宗勑鴻臚寺, 放還質子及年滿合歸國學生共一百五人. |  |
| culture | 868 | `chunk_samguksagi_sg_011_0040_0230` | 황룡사탑에 벼락이 치다 | 夏六月, 震皇龍寺塔. |  |
| culture | 888 | `chunk_samguksagi_sg_011_0070_0110` | 사면을 실시하고 승려에게 도첩을 주다 | 王不䂊, 録囚徒, 赦殊死已下, 許度僧六十人, 王疾乃瘳. |  |
| culture | 927 | `chunk_samguksagi_sg_012_0050_0090` | 황룡사 탑이 흔들려 북쪽으로 기울다 | 三月, 皇龍寺塔揺動北傾. |  |
| facility | -5 | `chunk_samguksagi_sg_023_0020_0250` | 한강 서북쪽에 성을 쌓고 주민을 이주시키다 | 秋七月, 築城漢江西北, 分漢城民. |  |
| facility | 101 | `chunk_samguksagi_sg_001_0060_0240` | 월성을 쌓다 | 二十二年, 春二月, 築城, 名月城. | O |
| facility | 101 | `chunk_samguksagi_sg_034_0020_0120` | 파사왕 월성 건축 | 婆娑王二十二年, 於金城東南築城, 號月城, 或號在城, 周一千二十三歩. | O |
| facility | 144 | `chunk_samguksagi_sg_001_0080_0180` | 제방 수리와 농지 개척을 명하고, 사치에 대한 금령을 내리다 | 十一年, 春二月, 下令, “農者政夲, 食惟民天. 諸州郡修完堤坊, 廣闢田野.” 又下令, 禁民間用金銀珠玉. |  |
| facility | 198 | `chunk_samguksagi_sg_016_0040_0030` | 환도성을 쌓다 | 二年, 春二月, 築丸都城. | O |
| facility | 247 | `chunk_samguksagi_sg_017_0020_0160` | 평양성을 쌓고 종묘와 사직을 옮기다 | 二十一年, 春二月, 王以丸都城經亂, 不可復都, 築平壤城, 移民及廟社. 平壤者, 夲仙人王儉之宅也. 或云, “王 | O |
| facility | 334 | `chunk_samguksagi_sg_018_0020_0040` | 평양성을 증축하다 | 四年, 秋八月, 増築平壤城. |  |
| facility | 342 | `chunk_samguksagi_sg_018_0020_0110` | 환도성을 보수하고 국내성을 축조하다 | 十二年, 春二月, 修葺丸都城, 又築國内城. | O |
| facility | 409 | `chunk_samguksagi_sg_018_0050_0190` | 나라 동쪽에 6개의 성을 쌓다 | 秋七月, 築國東秃山等六城, 移平壤民户. |  |
| facility | 429 | `chunk_samguksagi_sg_003_0040_0090` | 시제를 새로 쌓다 | 十三年, 新築矢堤, 岸長二千一百七十歩. | O |
| facility | 470 | `chunk_samguksagi_sg_003_0050_0180` | 삼년산성을 쌓다 | 十三年, 築三年山城. | O |
| facility | 474 | `chunk_samguksagi_sg_003_0050_0240` | 일모성 등 여섯 성을 쌓다 | 十七年, 築一牟·沙尸·廣石·沓逹·仇禮·坐羅等城. |  |
| facility | 490 | `chunk_samguksagi_sg_003_0060_0380` | 비라성을 다시 쌓다 | 十二年, 春二月, 重築鄙羅城. |  |
| facility | 498 | `chunk_samguksagi_sg_026_0040_0320` | 웅진교를 가설하다 | 二十年, 設熊津橋. | O |
| facility | 553 | `chunk_samguksagi_sg_004_0040_0180` | 황룡사를 짓다 | 十四年, 春二月, 王命所司築新宮於月城東, 黃龍見其地. 王疑之, 改爲佛寺, 賜號曰皇龍. |  |
| facility | 591 | `chunk_samguksagi_sg_004_0060_0190` | 남산성을 쌓다 | 秋七月, 築南山城, 周二千八百五十四步. | O |
| facility | 672 | `chunk_samguksagi_sg_007_0020_0180` | 한산주에 주장성을 쌓다 | 築漢山州晝長城, 周四千三百六十歩. | O |
| facility | 721 | `chunk_samguksagi_sg_008_0040_1120` | 북쪽 국경에 성을 쌓다 | 二十年, 秋七月, 徵何瑟羅道丁夫二千, 築長城於北境. | O |
| facility | 760 | `chunk_samguksagi_sg_009_0030_0750` | 월정교와 춘양교를 놓다 | 又於宫南蚊川之上, 起月浄·春陽二橋. | O |
| facility | 790 | `chunk_samguksagi_sg_010_0020_0280` | 시중 종기 임명과 벽골제 축조 및 웅천주의 붉은 까마귀 진상 | 六年, 春正月, 以宗基爲侍中. 増築碧骨堤, 徴全州等七州人興役. 熊川州進赤烏. | O |
| facility | 826 | `chunk_samguksagi_sg_010_0050_0720` | 패강장성을 쌓다 | 十八年, 秋七月, 命牛岑太守白永, 徴漢山北諸州郡人一萬, 築浿江長城三百里. | O |

## 3. 고른 기준과 판단

- **갈래 할당**: facility 10 / culture 10 이 목표였고 실제로는 facility 13 · culture 13 = 26건을 채웠다.
- **장소가 특정되는 것**을 먼저 골랐다. 월성·환도성·국내성·삼년산성·남산성·주장성·월정교·벽골제,
  초문사·금강사·왕흥사·분황사·부석사·해인사가 여기에 해당한다.
- **뒤에 오래 남는 것**은 `persistence` 를 붙였다. 성·절·둑·다리는 `facility`, 국학·불법 시행·화랑은 `institution`.
  소멸 기록이 없으므로 `to` 는 전부 `null` 로 두었다.
- **전쟁은 넣지 않았다**(할당에 없음). 벽골제·장성 기사처럼 사람이 동원된 것은 `participantGroups` 로 남겼다.
- **권역**은 위도 기준(north ≥ 39, central 37~39, south < 37)을 적용했다. 결과는 south 15 · north 8 · central 3 으로
  세 권역이 모두 채워졌다.
- **연도**는 전부 chunk 의 `date.raw` 를 따랐다. 원문에 연대 표기가 없는 기사(672 주장성, 760 월정교,
  634 분황사, 393 평양 9사)는 `object.kind` 를 `year` 로 두고 `yearVerbatim` 에 date.raw 값을 적었다.
  나머지는 `time` 으로 두고 `verbatim` 을 원문 표기(二十二年·秋七月·大通元年丁未 등)로 맞췄다.

### 좌표 처리

좌표는 만들지 않았다. ko/en 위키백과 문서의 표시 좌표(`class="geo"` 십진 좌표 문자열)만 발췌해
`syj:locatedAt` location 주장으로 만들고, 그 claim id 를 `facts[].coordinateBasis` 와 `scenes[].place.claimIds` 에 걸었다.
원본 HTML 15개를 `raw/` 에 바이트 그대로 저장하고 sha256·byteLength·fetchedUtc 를 manifest.json 과 sources[] 에 적었다.
발췌는 출처당 좌표 문자열 하나(2단어)뿐이다.

비정이 갈리는 것은 `precision: 'area'` 로 낮추고 note 에 이유를 적었다.

| 사실 | 좌표 출처 | precision | 비고 |
|---|---|---|---|
| 101 월성 | ko 「경주 월성」 | site | |
| 198 환도성 | en `Wandu` | site | |
| 247 평양성 · 393 평양 9사 · 498 금강사 | en `Pyongyang` | area | 3세기 평양성·청암리사지 비정에 학설이 갈림 |
| 342 국내성 · 372 불교 전래 · 375 초문사 | en `Gungnae` | site/area | 372·375 는 사건 지점이 아니라 당시 도읍 좌표 |
| 384 마라난타 | ko 「풍납토성」 | area | 한성 비정 |
| 470 삼년산성 | ko 「삼년산성」 | site | |
| 527 대통사 | en `Gongju` | area | 절터가 아니라 웅천주=공주 비정의 시 좌표 |
| 591 남산성 | en `Namsan Fortress` | area | 남산신성 동일시 견해 |
| 600 왕흥사 | ko 「부여 왕흥사지」 | site | |
| 634 분황사 | en `Bunhwangsa` | site | |
| 672 주장성 | ko 「남한산성」 | area | 주장성=남한산성 비정 |
| 676 부석사 · 760 월정교 · 790 벽골제 · 802 해인사 | ko 각 문서 | site | |

좌표 근거를 구하지 못한 429 시제·498 웅진교·721 북경 장성·826 패강 장성은 `lon/lat` 을 넣지 않고 note 에 이유를 적었다.

### 기존 장면과의 중복 회피

`services/host/app/history-scenes.json` 을 제목·id 로 뒤져 아래 넷은 **새 장면을 만들지 않고 사실만 남겼다**(`sceneId: null`).

| 사실 | 이미 있는 장면 id |
|---|---|
| 470 삼년산성 축조 | `scene-syj135-samnyeonsanseong-chukjo-470` |
| 676 부석사 창건 | `scene-syj122-buseoksa-676` |
| 790 벽골제 증축 | `scene-syj122-byeokgolje-790` |
| 802 해인사 창건 | `scene-syj128-haeinsa-802` |

지시대로 황룡사·불국사·감은사·흥륜사 관련 장면도 만들지 않았다. 528년 「肇行佛法」은
기존 `scene-anc-ichadon-527`(이차돈 순교와 흥륜사 공사)과 겹쳐 사실로만 남겼고,
527년 대통사는 같은 해 기사지만 웅천주의 별개 창건 기사여서 장면을 만들었다.
101년 월성은 기존 `scene-city-gyeongju-wolseong-201-935` 가 월성의 왕성 **지속**(settlement)을 다루는 구간 장면이라,
축성 **행위** 장면(`scene-cfc-wolseong-101`)과 구분해 새로 만들었다.

## 4. 결과 요약

- facts 26 (facility 13 · culture 13), scenes 15, claims 69 (로컬 chunk 인용 54 · 웹 발췌 15), sources 15, missing 3
- 10년 구간 커버리지: 100·190·240·340·370·380·390·420·470·490·520·570·590·600·630·670·680·720·760·790·800·820 — 22개 구간
- 권역: south 15 · north 8 · central 3

## 5. 자체 대조

검증기와 별개로 무작위 6개 claim 의 chunk 를 `--id` 로 다시 열어 quote 포함·sourceId 일치·date.raw 연도를 대조했고
(모두 일치), 웹 출처 15개는 sha256·byteLength 재계산과 발췌 문자열 포함 여부를 다시 확인했다(모두 일치).

## 6. 검증기 출력

```


category × 10년
byCategoryDecade | 100 | 190 | 240 | 340 | 370 | 380 | 390 | 420 | 470 | 490 | 520 | 570 | 590 | 600 | 630 | 670 | 680 | 720 | 760 | 790 | 800 | 820 | total
-----------------+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+------
settlement       | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
administration   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
facility         | 1   | 1   | 1   | 1   | 0   | 0   | 0   | 1   | 1   | 1   | 0   | 0   | 1   | 0   | 0   | 1   | 0   | 1   | 1   | 1   | 0   | 1   | 13
economy          | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
disaster         | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
culture          | 0   | 0   | 0   | 0   | 2   | 1   | 1   | 0   | 0   | 1   | 2   | 1   | 0   | 1   | 1   | 1   | 1   | 0   | 0   | 0   | 1   | 0   | 13
transport        | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
foreign          | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
person           | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
war              | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0

region × 10년
byRegionDecade | 100 | 190 | 240 | 340 | 370 | 380 | 390 | 420 | 470 | 490 | 520 | 570 | 590 | 600 | 630 | 670 | 680 | 720 | 760 | 790 | 800 | 820 | total
---------------+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+------
capital        | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
north          | 0   | 1   | 1   | 1   | 2   | 0   | 1   | 0   | 0   | 1   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 1   | 8
central        | 0   | 0   | 0   | 0   | 0   | 1   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 1   | 0   | 1   | 0   | 0   | 0   | 0   | 3
south          | 1   | 0   | 0   | 0   | 0   | 0   | 0   | 1   | 1   | 1   | 2   | 1   | 1   | 1   | 1   | 1   | 1   | 0   | 1   | 1   | 1   | 0   | 15
island         | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0

job 별 집계
job                    | facts | scenes | claims | chunkClaims | excerptClaims
-----------------------+-------+--------+--------+-------------+--------------
cross_facility_culture | 26    | 15     | 69     | 54          | 15

PASS: failures=0 warnings=0
```

`exit 0`, failures=0, warnings=0.

## 검수 반영 (2차)

검수원이 13건을 기각했다. 비[minor] 1건(f13 권역)과 [minor] 12건을 모두 손봤다. 결과: 사실 26건(facility 13 · culture 13), 장면 15개, claim 72개(chunk 56 + 발췌 16), 권역 south 15 · north 7 · central 4. 검증기 PASS(failures=0, warnings=0).

### 1) fact-cfc-f13 패강 장성 권역 — 기각 사유 인정, `north` → `central`

지적대로 자기 모순이었다. 원문(`chunk_samguksagi_sg_010_0050_0720`)에 나오는 지명은 牛岑(황해 금천 약 38.1)·漢山(서울 약 37.5)·浿江뿐이다. 삼국사기 지리지 `chunk_samguksagi_sg_037_0020_0030` 이 "今大同江爲浿水明矣"라 하여 패수를 대동강으로 보는 쪽을 따르더라도 대동강 하구~평양 구간은 위도 38.7~39.0이라 권역 코드의 north 기준(39 이상)에 닿지 않는다. 예성강 비정설은 더 남쪽이다. 39 이상을 가리키는 비정 근거를 찾지 못했으므로 region 을 `central` 로 고쳤다. 커버리지 표의 820년대 1건이 north 에서 central 로 옮겨갔다(north 8→7, central 3→4).

### 2) fact-cfc-f10 / f13 장성 권역 기준 통일

두 사실 note 첫 문장을 같은 문장으로 맞췄다.

> 장성 권역 기준(f10·f13 공통): 선형이 특정되지 않은 장성은 원문에 나오는 지명 가운데 가장 북쪽 기준점의 현대 비정 위도로 권역을 정한다(north=위도 39 이상, central=37~39).

f10 은 원문 지명이 何瑟羅(강릉 약 37.75) 하나뿐이고 北境은 지명이 아니므로 central, f13 은 위 계산으로 central 이다. 기존의 "동원 기지 기준 / 축성지 기준" 엇갈림은 사라졌고 두 건 모두 같은 규칙으로 같은 답이 나온다.

### 3) 기존 장면과 같은 사건 4건(f06·f12·c11·c13) — 검증기 제약 때문에 `existingSceneId` 필드로 대신함

검수원의 지시(`sceneId` 를 history-scenes.json 의 기존 id 로 채우라)를 그대로 넣어 보고 검증기를 돌렸더니 실패했다. **확인됨**:

```
cross_facility_culture/result.json/facts[fact-cfc-f06].sceneId/참조 없음: 'scene-syj135-samnyeonsanseong-chukjo-470'
FAIL: failures=1 warnings=0
```

`check_fact_research.py` 의 `fact()` 는 `self.refs([fact['sceneId']], scenes, ...)` 로 **이 result.json 의 scenes[] 안에서만** sceneId 를 찾는다(scripts/check_fact_research.py 430~431행). 외부 파일의 장면 id 는 구조적으로 넣을 수 없다. 그래서 브리프 규칙 8 의 의도(기계가 읽을 수 있는 연결)를 지키면서 검증기를 통과하도록, `sceneId` 는 null 로 두고 스펙 밖 추가 필드 `existingSceneId` 에 기존 장면 id 를 적었다(검증기의 `shape()` 는 필수 키만 보고 추가 키를 허용한다).

| 사실 | existingSceneId |
|---|---|
| fact-cfc-f06 삼년산성 470 | `scene-syj135-samnyeonsanseong-chukjo-470` |
| fact-cfc-f12 벽골제 790 | `scene-syj122-byeokgolje-790` |
| fact-cfc-c11 부석사 676 | `scene-syj122-buseoksa-676` |
| fact-cfc-c13 해인사 802 | `scene-syj128-haeinsa-802` |

네 건 모두 note 에도 같은 id 와 이 제약을 적어 두었다. 검증기 쪽을 고쳐 외부 장면 id 를 허용하게 하는 것은 이번 조사 범위 밖이라 건드리지 않았다 — 상위 병합 담당에게 제안으로 남긴다.

### 4) fact-cfc-c05 금강사 — 주장 형식을 낮추고 근거 사슬을 이었다

지적대로 `創金剛寺` 는 장소를 말하지 않는다. 두 가지를 함께 했다.

- `claim-c498-act` 의 predicate 를 `syj:tookPlaceAt(place-pyongyang)` → `syj:relatedTo(polity-goguryeo)` 로 낮췄다.
- 새 claim `claim-gg-capital-pyongyang-427` (`syj:capitalMovedTo` → place-pyongyang, `chunk_samguksagi_sg_018_0060_0100`, quote `十五年, 移都平壤`)을 만들어 fact 의 claimIds 와 장면 actionClaimIds 에 넣었다. 평양 비정이 어디서 오는지 사슬로 드러난다.

장면 요약과 좌표 note 도 "원문에 창건지가 없어 427년 천도 이후 도읍 좌표를 썼다"로 고쳤다. precision area · confidence medium 은 그대로다.

### 5) fact-cfc-c01 / c02 — 도읍 근거 chunk 를 인용하는 claim 추가

검수원이 제시한 두 선택지 중 "도읍 근거 chunk 를 인용하는 claim 을 하나 더 붙인다"를 택했다. 새 claim `claim-gg-capital-guknae` 는 지리지 `chunk_samguksagi_sg_037_0020_0030` 의 `都囯内歴四百二十五年, 長壽王十五年, 移都平壤` 를 인용한다 — 국내에 도읍한 지 425년 만인 427년에 평양으로 옮겼다는 서술이라 372년·375년 당시 도읍이 국내성임을 바로 보인다. c01·c02 의 claimIds 와 두 장면(`scene-cfc-gg-buddhism-372`, `scene-cfc-chomunsa-375`)의 actionClaimIds 에 넣고, 각 act claim 의 note 에 "인용문에 지명이 없다"를 명시했다. `tookPlaceAt` 자체는 이제 뒷받침이 있으므로 유지했다.

c04(평양 9사 393)는 원문이 `創九寺於平壤` 으로 지명을 직접 말하므로 같은 보강이 필요 없다.

### 6) 출처 제목 3건 — 실제 문서 제목으로 정정

내려받은 HTML 의 `<title>` 을 다시 읽어 고쳤다(바이트·sha256 은 그대로, 재수집 없음).

| sourceId | 전 | 후 | 실제 `<title>` |
|---|---|---|---|
| src-enwiki-wandu | Wandu | **Hwando** | `Hwando - Wikipedia` |
| src-enwiki-namsanfortress | Namsan Fortress | **Namsansinseong** | `Namsansinseong - Wikipedia` |
| src-kowiki-woljeonggyo | 월정교 | **경주 춘양교지와 월정교지** | `경주 춘양교지와 월정교지 - 위키백과…` |

URL 은 리다이렉트 전 주소 그대로 두었다(내려받은 바이트와 manifest 를 바꾸지 않기 위해서다). 각 locatedAt claim 의 note 에 "URL 은 리다이렉트"임을 적었다.

### 7) fact-cfc-f08 남산성 — note 를 실제 출처 강도에 맞추고 confidence 상향

지적대로 en.wikipedia Namsansinseong 문서는 591년 축성을 명시한다. 발췌를 하나 더 떠서 claim 으로 붙였다.

- 새 발췌 `ex-namsanseong-built591`: `According to the Samguk sagi, it was built in 591` (10단어, 이 출처 합계 12단어로 25단어 제한 안)
- 새 claim `claim-namsan-wiki591`: `syj:builtIn` year 591, `citesExcerpt`
- note 를 "견해에 따라" → "외부 출처로도 뒷받침된다"로 고치고 confidence `medium` → `high` 로 올렸다. 성 범위가 넓어 좌표 precision 은 area 그대로다.

### 8) fact-cfc-f11 월정교 — 합동 항목임을 반영하고 precision 하향

`claim-woljeong-loc` 의 location precision 을 `site` → `area` 로, 장면 place 의 precision 도 `site` → `area` 로 내렸다. 장면 place label 은 `월정교` → `월정교·춘양교(문천)`. note 는 "좌표는 월정교 지점" → "춘양교지·월정교지 합동 항목의 표시 좌표이며 두 다리를 구분하지 않아 area" 로 바꿨다.

### 9) yearVerbatim 4건(f09·f11·c04·c10) — 빈 문자열은 검증기가 막아 표식 문자열로 대체

검수원 지시대로 빈 문자열을 넣어 돌려 봤더니 실패했다. **확인됨**:

```
cross_facility_culture/result.json/facts[8].yearVerbatim/필수 필드 누락 또는 잘못된 자료형
FAIL: failures=1 warnings=0
```

facts 의 `yearVerbatim` 은 검증기 스키마에서 `'str'`(=`nonempty`) 이라 빈 값을 받지 않는다(placeLabel·modernPlace·note 만 `'text'` 로 빈 문자열 허용). 내부 메타데이터 문자열을 그대로 쓰던 것은 분명 잘못이므로 `"(원문 연대 표기 없음)"` 으로 바꾸고, date.raw 근거는 note 로 옮겼다.

| 사실 | 전 | 후 |
|---|---|---|
| f09 주장성 672 | `0672-08-99L0(date.raw)` | `(원문 연대 표기 없음)` |
| f11 월정교 760 | `0760-02-99L0(date.raw)` | `(원문 연대 표기 없음)` |
| c04 평양 9사 393 | `0393-08-99L0(date.raw)` | `(원문 연대 표기 없음)` |
| c10 분황사 634 | `0634-99-99L0(date.raw)` | `(원문 연대 표기 없음)` |

### 10) fact-cfc-f01 월성 — 기존 장면 id 를 기계가 읽을 필드로

`relatedExistingSceneId: "scene-city-gyeongju-wolseong-201-935"` 를 넣었다(같은 사건이 아니라 성격이 다른 관련 장면이므로 `existingSceneId` 가 아니라 별도 키로 두고 `existingSceneId` 는 null). note 에 기존 장면이 settlement 지속 장면이고 이번 것이 101년 construction 행위 장면이라는 구분과 함께, **병합 단계에서 좌표 0.03도·기간 겹침 규칙에 걸릴 수 있으니 상위 병합 담당이 확인해야 한다**는 경고를 적었다.

> 상위 병합 담당에게: `scene-cfc-wolseong-101`(경주 월성, 129.22611/35.83083, 101년)은 기존 `scene-city-gyeongju-wolseong-201-935` 와 같은 지점·겹치는 기간이다. facts-format 의 "기존 구역과 0.03도 이내이며 기간이 한 해라도 겹치면 추가하지 않는다" 규칙에 걸리는 후보이니 병합 시 판단이 필요하다.

### 바뀐 수치

| | 1차 | 2차 |
|---|---|---|
| facts | 26 (facility 13 · culture 13) | 26 (facility 13 · culture 13) |
| scenes | 15 | 15 |
| claims | 69 (chunk 54 + 발췌 15) | 72 (chunk 56 + 발췌 16) |
| 권역 | south 15 · north 8 · central 3 | south 15 · north 7 · central 4 |

사실은 하나도 빼지 않았으므로 20건 기준과 갈래 할당(각 10건)은 그대로 충족한다. 새로 추가한 것은 claim 3개(`claim-gg-capital-guknae`, `claim-gg-capital-pyongyang-427`, `claim-namsan-wiki591`)와 발췌 1개(`ex-namsanseong-built591`)뿐이고, 웹 재수집은 없어 manifest·sha256·byteLength 는 1차와 같다.

### 2차 검증기 출력

```

category × 10년
byCategoryDecade | 100 | 190 | 240 | 340 | 370 | 380 | 390 | 420 | 470 | 490 | 520 | 570 | 590 | 600 | 630 | 670 | 680 | 720 | 760 | 790 | 800 | 820 | total
-----------------+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+------
settlement       | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
administration   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
facility         | 1   | 1   | 1   | 1   | 0   | 0   | 0   | 1   | 1   | 1   | 0   | 0   | 1   | 0   | 0   | 1   | 0   | 1   | 1   | 1   | 0   | 1   | 13
economy          | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
disaster         | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
culture          | 0   | 0   | 0   | 0   | 2   | 1   | 1   | 0   | 0   | 1   | 2   | 1   | 0   | 1   | 1   | 1   | 1   | 0   | 0   | 0   | 1   | 0   | 13
transport        | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
foreign          | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
person           | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
war              | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0

region × 10년
byRegionDecade | 100 | 190 | 240 | 340 | 370 | 380 | 390 | 420 | 470 | 490 | 520 | 570 | 590 | 600 | 630 | 670 | 680 | 720 | 760 | 790 | 800 | 820 | total
---------------+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+------
capital        | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
north          | 0   | 1   | 1   | 1   | 2   | 0   | 1   | 0   | 0   | 1   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 7
central        | 0   | 0   | 0   | 0   | 0   | 1   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 1   | 0   | 1   | 0   | 0   | 0   | 1   | 4
south          | 1   | 0   | 0   | 0   | 0   | 0   | 0   | 1   | 1   | 1   | 2   | 1   | 1   | 1   | 1   | 1   | 1   | 0   | 1   | 1   | 1   | 0   | 15
island         | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0

job 별 집계
job                    | facts | scenes | claims | chunkClaims | excerptClaims
-----------------------+-------+--------+--------+-------------+--------------
cross_facility_culture | 26    | 15     | 72     | 56          | 16

PASS: failures=0 warnings=0
```

`exit 0`, failures=0, warnings=0.
