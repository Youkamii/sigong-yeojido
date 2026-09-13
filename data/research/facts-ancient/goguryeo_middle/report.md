# goguryeo_middle 조사 보고 (고구려 300~500, 권역 north/central)

## 1. 검색 과정

작업 폴더 `C:/Users/gkfkd/Git/sigong-facts` 에서 `scripts/search_chunks.py` 만 썼다. db.history.go.kr 은 열지 않았다.

- `--source src-samguksagi --from 300 --to 500 --locator 髙句麗本紀 --limit 500` → 고구려본기 권17~19 의 해당 구간 조각 **197개** 를 통째로 뽑아 제목·첫머리를 훑었다. (locator 는 정자 `高`가 아니라 이체자 `髙` 를 써야 걸린다.)
- 지리지: `--from 300 --to 500 --locator 高句麗` → 권37 지리4 '평양성과 장안성' 조각 1개(연도 427).
- 금석문: `--keyword 廣開土`, `--keyword 中原 --keyword 高句麗碑`, `--source src-geumseok-...` 로 광개토왕릉비(해제+전사본 `src-gwanggaeto` 44행), 충주 고구려비, 덕흥리 고분 묵서명, 호우총 호우, 서봉총 은합우를 확인했다.
- 집성(`data/sources/jipseong-*`)에서는 이 칸에 새로 쓸 만한 고구려 戶口 기사를 찾지 못했다(missing miss-1).

### 후보 조각표 (68건)

| chunk id | date.raw | 갈래 후보 | 제목 | 첫머리 | 채택 |
|---|---|---|---|---|---|
| chunk_samguksagi_sg_017_0050_0130 | 0300-01-99L0 | disaster | 지진이 일어나고, 가물어 흉년이 되다 | 九年, 春正月, 地震. 自二月至秋七月不雨, 年饑民相食. | 채택 |
| chunk_samguksagi_sg_017_0050_0140 | 0300-08-99L0 | settlement | 창조리가 봉상왕을 폐위하고, 봉상왕이 사망하다 | 八月, 王發國内男女年十五已上, 修理宫室. 民乏於食, 困於役, 因之以流亡. 倉助利 |  |
| chunk_samguksagi_sg_017_0060_0010 | 0300-08-99L0 | economy/person | 미천왕, 왕위에 오르기 전에 도망하여 곤궁하게 지내다 | 羙川王, 諱乙弗, 西川王之子古鄒加咄固之子. 初烽上王疑弗咄固有異心, 殺之, 子乙弗 | 채택 |
| chunk_samguksagi_sg_017_0060_0060 | 0302-09-99L0 | settlement | 현도군을 침략하고 잡아 온 포로를 평양에 두다 | 三年, 秋九月, 王率兵三萬, 侵玄菟郡, 虜獲八千人, 移之平壤. | 채택 |
| chunk_samguksagi_sg_017_0060_0080 | 0313-10-99L0 | war | 낙랑군을 침략하다 | 十四年, 冬十月, 侵樂浪郡, 虜獲男女二千餘口. |  |
| chunk_samguksagi_sg_017_0060_0150 | 0330-99-99L0 | economy | 석륵에게 호시를 보내다 | 三十一年, 遣使後趙 石勒, 致其楛矢. | 채택 |
| chunk_samguksagi_sg_018_0020_0020 | 0332-02-99L0 | culture | 졸본의 시조 사당에 제사지내고, 백성을 구휼하다 | 二年, 春二月, 王如卒本, 祀始祖廟, 廵問百姓老病, 賑給. |  |
| chunk_samguksagi_sg_018_0020_0040 | 0334-08-99L0 | facility | 평양성을 증축하다 | 四年, 秋八月, 増築平壤城. | 채택 |
| chunk_samguksagi_sg_018_0020_0050 | 0334-12-99L0 | disaster | 눈이 오지 않다 | 冬十二月, 無雪. |  |
| chunk_samguksagi_sg_018_0020_0060 | 0335-01-99L0 | facility | 신성을 축조하다 | 五年, 春正月, 築國北新城. |  |
| chunk_samguksagi_sg_018_0020_0070 | 0335-07-99L0 | disaster | 서리가 내리다 | 秋七月, 隕霜殺穀. |  |
| chunk_samguksagi_sg_018_0020_0081 | 0336-03-99L0 | foreign | 동진에 사신을 파견하다 | (春三月) 遣使如晉, 貢方物. |  |
| chunk_samguksagi_sg_018_0020_0110 | 0342-02-99L0 | administration | 환도성을 보수하고 국내성을 축조하다 | 十二年, 春二月, 修葺丸都城, 又築國内城. | 채택 |
| chunk_samguksagi_sg_018_0020_0120 | 0342-08-99L0 | administration | 환도성으로 거처를 옮기다 | 秋八月, 移居丸都城. | 채택 |
| chunk_samguksagi_sg_018_0020_0150 | 0343-02-99L0 | foreign | 왕의 동생을 전연에 보내다 | 十三年, 春二月, 王遣其弟, 稱臣入朝於燕, 貢珍異以千數. 燕王皝乃還其父尸, 猶留 |  |
| chunk_samguksagi_sg_018_0020_0160 | 0343-07-99L0 | administration | 평양 동황성으로 거처를 옮기다 | 秋七月, 移居平壤東黄城. 城在今西京東木覔山中. |  |
| chunk_samguksagi_sg_018_0020_0170 | 0343-11-99L0 | disaster | 눈이 5척 내리다 | 冬十一月, 雪五尺. |  |
| chunk_samguksagi_sg_018_0030_0020 | 0372-06-99L0 | culture | 전진으로부터 불교를 수용하다 | 二年, 夏六月, 秦王符堅遣使及浮屠順道, 送佛像·經文. 王遣使迴謝, 以貢方物. | 채택 |
| chunk_samguksagi_sg_018_0030_0030 | 0372-06-99L0 | culture | 태학을 설립하다 | 立大學, 敎育子弟. | 채택 |
| chunk_samguksagi_sg_018_0030_0040 | 0373-99-99L0 | administration | 율령을 반포하다 | 三年, 始頒律令. | 채택 |
| chunk_samguksagi_sg_018_0030_0050 | 0374-99-99L0 | culture | 승려 아도가 오다 | 四年, 僧阿道来. |  |
| chunk_samguksagi_sg_018_0030_0060 | 0375-02-99L0 | facility | 초문사와 이불란사를 창건하다 | 五年, 春二月, 始創肖門寺, 以置順道. 又創伊弗蘭寺, 以置阿道. 此海東佛法之始. | 채택 |
| chunk_samguksagi_sg_018_0030_0090 | 0377-10-99L0 | disaster | 눈이 오지 않고 전염병이 돌다 | 七年, 冬十月, 無雪, 雷. 民疫. |  |
| chunk_samguksagi_sg_018_0030_0110 | 0378-99-99L0 | disaster | 가뭄으로 백성들이 굶주리다 | 八年, 旱, 民饑相食. |  |
| chunk_samguksagi_sg_018_0040_0080 | 0388-04-99L0 | disaster | 크게 가물다 | 五年, 夏四月, 大旱. |  |
| chunk_samguksagi_sg_018_0040_0090 | 0388-08-99L0 | disaster | 누리 피해가 일어나다 | 秋八月, 蝗. |  |
| chunk_samguksagi_sg_018_0040_0100 | 0389-99-99L0 | disaster | 기근이 들어 홍수가 나자 물품을 지급하여 구제하다 | 六年, 春, 饑人相食, 王發倉賑給. | 채택 |
| chunk_samguksagi_sg_018_0040_0130 | 0392-99-99L0 | foreign | 신라와 화친을 맺고 볼모를 받다 | 九年, 春, 遣使新羅修好, 新羅王遣姪實聖為質. |  |
| chunk_samguksagi_sg_018_0040_0140 | 0392-03-99L0 | culture | 불교를 믿으라고 교를 내리다 | 三月, 下教, 崇信佛法求福. |  |
| chunk_samguksagi_sg_018_0040_0141 | 0392-03-99L0 | culture | 국사를 건립하고 종묘를 수건하다 | 命有司, 立國社, 修宗廟. |  |
| chunk_samguksagi_sg_018_0050_0030 | 0392-09-99L0 | settlement | 거란을 정벌하다 | 九月, 北伐契丹, 虜男女五百口, 又招諭本國䧟沒民口一萬而歸. |  |
| chunk_samguksagi_sg_018_0050_0051 | 0393-08-99L0 | facility | 평양에 9개의 절을 창건하다 | 創九寺於平壤. | 채택 |
| chunk_samguksagi_sg_018_0050_0070 | 0394-08-99L0 | facility | 나라 남쪽에 7개의 성을 쌓다 | 八月, 築國南七城, 以備百濟之寇. | 채택 |
| chunk_samguksagi_sg_018_0050_0160 | 0407-02-99L0 | facility | 궁궐을 증축하다 | 十六年, 春二月, 増修宮闕. |  |
| chunk_samguksagi_sg_018_0050_0190 | 0409-07-99L0 | settlement | 나라 동쪽에 6개의 성을 쌓다 | 秋七月, 築國東秃山等六城, 移平壤民户. | 채택 |
| chunk_samguksagi_sg_018_0050_0200 | 0409-08-99L0 | administration | 왕이 남쪽 지방을 순행하다 | 八月, 王南巡. |  |
| chunk_samguksagi_sg_018_0060_0020 | 0413-99-99L0 | foreign | 동진에 사신을 파견하다 | 元年, 遣長史髙翼, 入晉奉表, 獻赭白馬. 安帝封王髙句麗王·樂安郡公. | 채택 |
| chunk_samguksagi_sg_018_0060_0050 | 0414-12-99L0 | disaster | 눈이 다섯 척 내리다 | 十二月, 王都雪五尺. |  |
| chunk_samguksagi_sg_018_0060_0060 | 0419-05-99L0 | disaster | 큰 홍수가 나다 | 七年, 夏五月, 國東大氷, 王遣使存問. | 채택 |
| chunk_samguksagi_sg_018_0060_0070 | 0424-02-99L0 | foreign | 신라가 사신을 보내다 | 十二年, 春二月, 新羅遣使修聘. 王勞慰之特厚. |  |
| chunk_samguksagi_sg_018_0060_0080 | 0424-09-99L0 | economy | 군신에게 잔치를 베풀다 | 秋九月, 大有年. 王宴群臣於宫. | 채택 |
| chunk_samguksagi_sg_018_0060_0100 | 0427-99-99L0 | administration | 평양으로 도읍을 옮기다 | 十五年, 移都平壤. | 채택 |
| chunk_samguksagi_sg_018_0060_0110 | 0435-06-99L0 | foreign | 북위에 사신을 보내 책봉을 받다 | 二十三年, 夏六月, 王遣使入魏朝貢, 且請國諱. 世祖嘉其誠欵, 使録帝系及諱以與之, |  |
| chunk_samguksagi_sg_018_0060_0150 | 0436-05-99L0 | settlement | 북연왕 풍홍을 데려오다 | 五月, 燕王率龍城見戶東徙, 焚宫殿, 火一旬不滅. 合婦人被甲居中, 陽伊等勒精兵居外 |  |
| chunk_samguksagi_sg_018_0060_0330 | 0471-99-99L0 | settlement | 백성 노구 등이 북위에 투항하다 | 五十九年, 秋九月, 民奴各等, 奔降於魏, 各賜田宅. 是魏 髙祖延興元年也. |  |
| chunk_samguksagi_sg_018_0060_0350 | 0472-07-99L0 | economy | 북위에 사신을 파견하다 | 秋七月, 遣使入魏朝貢. 自此已後, 貢獻倍前, 其報賜亦稍加焉. |  |
| chunk_samguksagi_sg_018_0060_0550 | 0484-10-99L0 | foreign | 북위에 사신을 파견하다 | 七十二年, 冬十月, 遣使入魏朝貢. 時魏人謂我方強, 置諸國使邸, 齊使第一, 我使者 |  |
| chunk_samguksagi_sg_018_0060_0710 | 0491-12-99L0 | person | 장수왕이 사망하다 | 冬十二月, 王薨. 年九十八歳, 號長壽王. 魏 孝文聞之, 制素委貌布深衣, 舉哀於東 | 채택 |
| chunk_samguksagi_sg_019_0020_0060 | 0493-10-99L0 | disaster | 지진이 일어나다 | 二年, 冬十月, 地震. |  |
| chunk_samguksagi_sg_019_0020_0080 | 0494-02-99L0 | foreign | 부여가 투항하다 | 二月, 扶餘王及妻孥, 以國來降. | 채택 |
| chunk_samguksagi_sg_019_0020_0120 | 0494-10-99L0 | disaster | 기상이변이 일어나다 | 冬十月, 桃李華. |  |
| chunk_samguksagi_sg_019_0020_0140 | 0495-02-99L0 | disaster | 크게 가물다 | 大旱. |  |
| chunk_samguksagi_sg_019_0020_0160 | 0495-07-99L0 | culture | 남쪽을 순수하여 바다에 제사를 지내다 | 秋七月, 南巡狩, 望海而還. |  |
| chunk_samguksagi_sg_019_0020_0220 | 0498-07-99L0 | facility | 금강사를 창건하다 | 秋七月, 創金剛寺. |  |
| chunk_samguksagi_sg_019_0020_0240 | 0499-99-99L0 | settlement | 백제의 백성이 투항해오다 | 八年, 百濟民饑, 二千人來投. | 채택 |
| chunk_samguksagi_sg_037_0020_0030 | 0427-99-99L0 | administration | 평양성과 장안성 | 都囯内歴四百二十五年, 長壽王十五年, 移都平壤. 歴一百五十六年, 平原王二十八年,  | 채택 |
| chunk_gwanggaeto_1-05 | - | economy | 전사본 1면 5번째 줄 | 二九登祚，號為永樂太王，恩澤洽於皇天，威武柳被四海。掃除□□，庶寧其業。國富民殷，五穀豊 |  |
| chunk_gwanggaeto_1-06 | - | facility | 전사본 1면 6번째 줄 | 弔，卅有九晏駕棄國。以甲寅年九月廿九日乙酉遷就山陵於是立碑銘記勳績，以永後世。焉其辭曰： | 채택 |
| chunk_gwanggaeto_3-08 | - | settlement | 전사본 3면 8번째 줄 | 鴨盧。凡所攻破城六十四村，一千四百守墓人煙戶賣勾余民國煙。二看煙三東海賈國煙三看煙五敦城 |  |
| chunk_gwanggaeto_4-06 | - | settlement | 전사본 4면 6번째 줄 | 若吾萬年之後，安守墓者。但取吾躬率所略來韓穢，令備洒掃言教如此，是以如教令。取韓穢二百廿 | 채택 |
| chunk_gwanggaeto_4-07 | - | settlement | 전사본 4면 7번째 줄 | 其不知法則，復取舊民一百十家，合新舊守墓石國煙，卅看煙三百都合三百卅家。自上祖先王以來， | 채택 |
| chunk_gwanggaeto_4-09 | - | administration | 전사본 4면 9번째 줄 | 又制守墓人自今以後不得更相轉賣，雖有富足之者亦不得檀買，其有違令賣者刑之買人，制令守墓之 | 채택 |
| chunk_geumseok-gskh_001_0010_0010_gskh_001_0010_0010_0010 | - | facility | 槪觀 | 槪觀 가. 碑의 상태 「國岡上廣開土境平安好太王陵碑」는 장수왕 3년(414)에 세 | 채택 |
| chunk_geumseok-gskh_001_0010_0030_gskh_001_0010_0030_0010 | - | administration | 槪觀 | 槪觀 忠北 中原郡 可金面 龍田里 立石部落 입구에 위치하고 있으며, 1979년 단 | 채택 |
| chunk_geumseok-gskh_001_0010_0030_gskh_001_0010_0030_0020 | 9999-99-99 | administration | 徐永大 | 判讀文 - 범례 - (前面) 五月中高麗大王相王公□新羅寐錦世世爲願如兄如弟 上下相和 | 채택 |
| chunk_geumseok-gskh_001_0020_0040_gskh_001_0020_0040_0020 | 0408-99-99 | person | 徐永大 | 判讀文 □□郡 信都縣 都鄕 中甘里 釋加文佛弟子□□氏鎭仕 位建威將軍 國小大兄 左將 | 채택 |
| chunk_geumseok-gskh_001_0020_0040_gskh_001_0020_0040_0090 | - | person | 解釋文 | 解釋文 □□郡 信都縣 都鄕 [中]甘里 사람이며 釋迦文佛의 弟子인 □□氏 鎭은 역 | 채택 |
| chunk_geumseok-gskh_001_0050_0010_gskh_001_0050_0010_0010 | - | foreign | 槪觀 | 槪觀 경북 경주시 소재 新羅古墳 路西洞 140호에서 출토된 청동제 壺杅의 바깥쪽 |  |


## 2. 고른 기준과 판단

- 할당(20건 기준) `settlement 3 · administration 4 · facility 3 · economy 3 · disaster 2 · culture 2 · foreign 2 · person 1` 을 모두 넘겨 **26건**을 골랐다: settlement 4 · administration 5 · facility 5 · economy 3 · disaster 3 · culture 2 · foreign 2 · person 2.
- 전쟁은 할당에 없어 넣지 않았다. 고구려본기 300~500 구간의 절반 가까이가 對燕·對百濟 전투와 '遣使入魏朝貢' 반복인데, 조공 기사는 대표 2건(413 동진 책봉, 494 부여 항복)만 foreign 으로 쓰고 나머지는 버렸다.
- **장소가 특정되는 것**(평양·국내성·환도성·광개토왕릉비)과 **뒤에 남는 것**(도읍·성·절·율령·수묘인 제도)에 persistence 를 달았다. 도읍 지속은 지리지 조각이 '평양 425년 뒤 천도 → 156년 뒤 평원왕 28년 장안성' 이라 적어 fact-gg-008 의 persistence 를 `city 427~586` 으로 두었다.
- **사람이 어떻게 살았나** 쪽을 우선했다: 미천왕 을불의 소금 행상(압록 물길 교역), 8천 명·2천 명·330가·1만 공력 같은 인구/노동 수치, 지진·가뭄·기근·발창진급·이상저온 위문.
- 이미 `services/host/app/history-scenes.json` 에 있는 장면은 새로 만들지 않았다. grep 으로 300~500 구간을 확인해 **scene-anc-taehak-372**(태학), **scene-anc-pyongyang-transfer-427**(평양 천도), **scene-city-pyongyang-capital-427-668**, **scene-anc-pyongyangseong-371**(평양성 전투) 가 있음을 확인했고, 태학(fact-gg-022)과 평양 천도(fact-gg-008)는 `sceneId: null` 로 두고 note 에 기존 장면 id 를 적었다. (검증기는 fact.sceneId 가 **같은 result.json 의 scenes** 에 있어야 통과시키므로 외부 id 를 넣을 수 없다.)

### 수치 주장을 density 로 처리한 이유

검증기의 `syj:householdCount`/`syj:populationCount` 는 `unit` 을 각각 `戶`/`口` 로 **강제**하고 value 를 수로 요구한다. 이 칸의 원문 단위는 `八千人`·`二千人`·`三百卅家` 로 戶·口 가 아니다. 원문 표기를 고치지 않으려고 수치는 `facts[].density {population|households, unit, claimIds}` 로만 적고, 그 근거 claim 은 수치가 들어간 인용을 그대로 갖고 있다(예 `虜獲八千人, 移之平壤`).

## 3. 연도 처리

- 삼국사기 조각은 모두 `date.raw` 앞자리 서기연을 그대로 썼고, time 주장의 `verbatim` 은 chunk 본문과 quote 양쪽에 있는 표기(`三年`·`秋七月`·`十五年` 등)만 썼다.
- 본문에 연월 표기가 아예 없는 세 조각(`創九寺於平壤`, `立大學, 敎育子弟`, 미천왕 소금 기사)은 verbatim 을 지어내지 않고 `{"kind":"year","value":...}` 로 두었다(각각 393·372·300, chunk date.raw 와 일치).
- 금석문은 date 가 없거나 미상(`9999-99-99`)이라 연도 검사가 생략된다. 대신 근거를 본문에서 댔다.
  - 광개토왕릉비 414: 금석문 해제 조각의 "「國岡上廣開土境平安好太王陵碑」는 장수왕 3년(414)에 세워졌다" + 전사본의 `以甲寅年九月廿九日乙酉遷就山陵於是立碑銘記勳績`.
  - 덕흥리 묵서명 408: 판독문의 `年七十七薨焉永樂十八年`(영락 18년 = 408).
  - 충주 고구려비: 연대가 비문에 없다. 해제의 "건립시기를 … 5세기 전후로 좁혀볼 수 있게 한다" 만 근거로 `precision:"century"`, year 450(earliest 401 / latest 500), `confidence:"low"` 로 두고 449년설·495년설을 note 에 적었다.

## 4. 좌표

좌표는 만들지 않고 위키백과 표시 좌표(`class="geo"` 십진 값)만 발췌해 썼다. 네 출처 모두 Python `urllib.request` 로 `raw/*.html` 에 바이트 그대로 저장하고 sha256·byteLength·fetchedUtc 를 manifest.json 과 sources[] 에 적었다.

| sourceId | 대상 | 발췌 좌표 |
|---|---|---|
| src-enwiki-pyongyang | 평양 | 39.01667; 125.74750 |
| src-enwiki-gungnae | 국내성(Gungnae Fortress) | 41.12083; 126.17861 |
| src-enwiki-hwando | 환도산성 | 41.146528; 126.163194 |
| src-kowiki-gwanggaeto-bi | 광개토왕릉비 | 41.14472; 126.21417 |

- 원문이 장소를 말하지 않은 사실(율령 반포·진휼·불교 수용·풍년 잔치)에는 **그 해의 도읍 좌표를 `precision:"area"` 로** 붙이고 `coordinateNote`·`note` 에 "원문에 장소가 없다"고 적었으며 `confidence` 를 medium 으로 낮췄다.
- 좌표를 못 구한 것은 넣지 않았다: 충주 고구려비(ko/en 위키 문서에 십진 좌표 없음), 덕흥리 고분, 국남 7성, 나라 동쪽 6성, 압록 사수촌. 각각 note 와 missing 에 적었다.

## 5. 남은 구멍 (missing)

- 고구려 호구 총수 기사 없음 — 집성(위서 고구려전) 필요.
- 충주 고구려비·덕흥리 고분의 십진 좌표 — 국가유산포털 등 필요.
- 300~500 고구려본기에 `市`·`驛` 기사가 없어 economy 는 소금 행상·교역품(楛矢)·풍년으로 채웠다.

## 6. 검증기 출력

```
category × 10년

byCategoryDecade | 300 | 330 | 340 | 370 | 380 | 390 | 400 | 410 | 420 | 450 | 490 | total

-----------------+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+------

settlement       | 1   | 0   | 0   | 0   | 0   | 0   | 1   | 1   | 0   | 0   | 1   | 4

administration   | 0   | 0   | 1   | 1   | 0   | 0   | 0   | 1   | 1   | 1   | 0   | 5

facility         | 0   | 1   | 0   | 1   | 0   | 2   | 0   | 1   | 0   | 0   | 0   | 5

economy          | 1   | 1   | 0   | 0   | 0   | 0   | 0   | 0   | 1   | 0   | 0   | 3

disaster         | 1   | 0   | 0   | 0   | 1   | 0   | 0   | 1   | 0   | 0   | 0   | 3

culture          | 0   | 0   | 0   | 2   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 2

transport        | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0

foreign          | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 1   | 0   | 0   | 1   | 2

person           | 0   | 0   | 0   | 0   | 0   | 0   | 1   | 0   | 0   | 0   | 1   | 2

war              | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0



region × 10년

byRegionDecade | 300 | 330 | 340 | 370 | 380 | 390 | 400 | 410 | 420 | 450 | 490 | total

---------------+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+------

capital        | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0

north          | 3   | 2   | 1   | 4   | 1   | 1   | 1   | 5   | 2   | 0   | 3   | 23

central        | 0   | 0   | 0   | 0   | 0   | 1   | 1   | 0   | 0   | 1   | 0   | 3

south          | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0

island         | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0



job 별 집계

job             | facts | scenes | claims | chunkClaims | excerptClaims

----------------+-------+--------+--------+-------------+--------------

goguryeo_middle | 26    | 19     | 59     | 55          | 4



PASS: failures=0 warnings=0
```

`python scripts/check_fact_research.py data/research/facts-ancient --job goguryeo_middle` → **PASS: failures=0 warnings=0** (exit 0).

### 자체 재확인 (검증기와 별개로 한 번 더)

`result.json` 의 chunk 인용 55건을 `search_chunks.py --id` 로 다시 열어 (1) quote 가 chunk text 의 부분 문자열인지, (2) time/year 값이 `date.raw` 앞자리 서기연과 같은지, (3) time.verbatim 이 chunk text 와 quote 양쪽에 있는지 독립 검사했다. **55/55 통과, 불일치 0.**

---

## 검수 반영 (2차)

검수원이 기각한 8건을 모두 고쳤다. 원문은 `search_chunks.py --id` 로 다시 열어 대조했다.

### 1. fact-gg-020 — 419년 國東大氷 (유일한 non-minor 기각)

`chunk_samguksagi_sg_018_0060_0060` 을 다시 열어 확인한 결과 검수원 지적이 맞다. chunk 의 `annotations` 에
교감주 `이병도교감 《삼국사기》에는 水로 되어 있다. 주자본과 을해목활자본에는 氷으로 되어 있다` 가 붙어 있고,
chunk 의 `title` 도 `큰 홍수가 나다` 이며 `subjectClasses` 는 재해유형·재해대책이다.
1차 조사는 이 교감주를 언급하지 않고 氷 판본만 택해 단정했다. 고친 내용:

- `what` → `5월에 나라 동쪽에 큰 재해(大氷/大水)가 나자 왕이 사신을 보내 위문하였다` (판본 차이를 남김)
- `confidence` → `high` 에서 **medium**
- `note` 에 교감주 전문과 chunk title 이 `큰 홍수가 나다` 라는 점을 적음
- 원문에 없는 해석 문장 `여름 이상 저온 기록` **삭제**
- `scene-gg-relief-419` 의 title → `나라 동쪽에 큰 재해가 나자 사신을 보내 위문하다 (419)`, summary 도 판본 차이를 밝히도록 고침
- `claim-gg-419-act` 의 note 에도 교감주를 적음

### 2. fact-gg-016 — 330년 楛矢 (economy → foreign)

chunk `subjectClasses` 가 `정치>외교>사신>파견·영접` 하나뿐이고 locator 제목도 `석륵에게 호시를 보내다` 라
검수원 판단대로 **foreign 으로 옮겼다**. economy 가 2건으로 떨어지므로 검수원이 지정한 대로 economy 를 더 찾아 채웠다.

- **fact-gg-028 (신규, economy)** — 335년 7월 `隕霜殺穀`(chunk_samguksagi_sg_018_0020_0070).
  chunk 의 subjectClasses 첫 항목이 `경제>경제정책>재해` 이고, facts-brief 의 economy 행 `흉작·풍작` 에 해당한다.
  같은 result 의 fact-gg-017(424년 大有年 풍년)과 짝이 되는 흉작 기록이다. 霜 이 disaster 행에도 있어 갈래가 겹친다는
  점은 note 에 적었다. 새 claim: `claim-gg-335-time`(time 秋七月/335) · `claim-gg-335-act`.
- **fact-gg-029 (신규, economy)** — 408년 덕흥리 묵서의 식료 조달
  (`日煞牛羊酒宍米粲 不可盡掃旦食鹽`, 해석문 `날마다 소와 양을 잡아서 …`).
  economy 행 `鐵·鹽` 과 생활 소비에 해당한다. fact-gg-026(person)은 묘주 진의 관력·매장을 세고 이 건은 식료 조달을
  세도록 근거 claim 을 나눴다. 새 claim: `claim-gg-408-food`(판독문) · `claim-gg-408-food-ko`(해석문).

결과: economy 4건(015 소금 행상 · 017 풍년 · 028 흉작 · 029 식료), foreign 3건. 할당 여유가 생겼다.

### 3. fact-gg-015 — 소금을 '판' 것이 아니라 '부린' 것 + 사건 시점

- `what` → `을불이 동촌 사람 재모와 함께 소금 장사를 하여 배로 압록에 이르러 강 동쪽 사수촌 사람 집에 소금을 부렸다`
  (원문 `將鹽下寄江東思收村人家` 의 寄 를 살림, claim 의 note 와 일치시킴)
- `note` 에 `미천왕 즉위 기사(date.raw 0300-08)에 실린 회고담이라 사건 자체는 300년 이전` 을 추가.
  year·decade 300 은 규칙상 chunk 의 date.raw 를 따른 값임을 함께 적었다.
- `scene-gg-salt-300` 의 summary 도 같은 취지로 고침.

### 4. fact-gg-005 — 환도성과 국내성 분리

persistence `to:null` 과 note 의 `같은 해 11월 함락` 이 충돌하고, placeLabel 이 두 곳을 묶고 있었다.
검수원이 제시한 두 갈래 중 **분리** 를 택했다.

- **fact-gg-005** — 환도성만. placeLabel `환도성`, 좌표 환도산성,
  `persistence {city, 342, 342}`. 소멸 근거로 `chunk_samguksagi_sg_018_0020_0140`(342년 11월)에서
  새 claim 2개를 뽑았다: `claim-gg-342-fall-time`(syj:destroyedIn, time 十一月/342) ·
  `claim-gg-342-fall-act`(quote `燒其宫室, 毀丸都城而還`).
- **fact-gg-027 (신규, administration)** — 국내성만. placeLabel `국내성`, 좌표 국내성,
  `persistence {city, 342, 427}`(끝 근거는 같은 result 의 `claim-gg-427-move` 移都平壤).
  장면은 기존 scene 이 두 성을 함께 다루므로 sceneId 는 null 로 두고 그 사정을 note 에 적었다.
- `scene-gg-hwando-guknae-342` 의 title·summary 에 11월 함락을 넣고 persistence 를 `{city, 342, 342}` 로 닫았다.

이로써 build_fact_layers 의 openEnded(endYear 2100) 구역 번짐이 사라진다.

### 5. fact-gg-004 — region 과 placeLabel 불일치

원문에 받아들인 곳이 없으므로 `placeLabel` 을 `고구려 남쪽 변경` → **`고구려`** 로 바꿔 region `north` 와 맞췄다.
note 에 fact-gg-013(국남 7성)은 원문에 `國南` 과 백제 접경이 명시되어 central 로 둔 것이므로 기준이 서로 다르지 않다는 점을 적었다.

### 6. fact-gg-009 — 450 은 대표값

`note` 에 `year·decade 450 은 5세기 중엽을 커버리지 표에 세우기 위한 대표값이며 사료 근거가 있는 연도가 아니다` 를 명시했다.
confidence 는 그대로 low.

### 7. fact-gg-003 / 007 / 014 — 재위년 표기 통일

414년 세 건의 `yearVerbatim` 을 능비 자체의 표기 **`甲寅年`** 으로 통일하고, 세 건 모두 note 에
`해제 chunk 는 장수왕 3년으로 적었으나 삼국사기 즉위 기사(0413)를 따르면 414년은 장수왕 2년` 을 덧붙였다.
fact-gg-003 의 claimIds 에 `claim-gg-neungbi-erect`(甲寅年 근거)를 추가했다.

### 8. sources[].title — 리다이렉트 문서 제목

내려받은 raw HTML 의 `<title>` 을 다시 읽어 확인했다(`Gungnae - Wikipedia`, `Hwando - Wikipedia`).
`src-enwiki-gungnae` 의 title 을 `Gungnae Fortress` → **`Gungnae`**,
`src-enwiki-hwando` 의 title 을 `Hwando Mountain Fortress` → **`Hwando`** 로 고쳤다.
요청 URL·sha256·byteLength 는 manifest 와 그대로 일치하고 좌표 발췌도 그대로다.

### 재검증

chunk 인용 61건을 다시 `search_chunks.py --id` 로 열어 (1) quote 가 chunk text 의 부분 문자열인지,
(2) time/year 값이 date.raw 앞자리 서기연과 같은지, (3) time.verbatim 이 chunk text 와 quote 양쪽에 있는지
독립 검사했다. **61/61 통과, 불일치 0.** fact→claim·scene 참조도 전부 확인했다.

갈래 할당(20건 기준): settlement 4/3 · administration 6/4 · facility 5/3 · economy 4/3 · disaster 3/2 ·
culture 2/2 · foreign 3/2 · person 2/1 = **29건 ≥ 20**, 모든 갈래 충족.

```console
$ python scripts/check_fact_research.py data/research/facts-ancient --job goguryeo_middle
category × 10년
byCategoryDecade | 300 | 330 | 340 | 370 | 380 | 390 | 400 | 410 | 420 | 450 | 490 | total
-----------------+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+------
settlement       | 1   | 0   | 0   | 0   | 0   | 0   | 1   | 1   | 0   | 0   | 1   | 4
administration   | 0   | 0   | 2   | 1   | 0   | 0   | 0   | 1   | 1   | 1   | 0   | 6
facility         | 0   | 1   | 0   | 1   | 0   | 2   | 0   | 1   | 0   | 0   | 0   | 5
economy          | 1   | 1   | 0   | 0   | 0   | 0   | 1   | 0   | 1   | 0   | 0   | 4
disaster         | 1   | 0   | 0   | 0   | 1   | 0   | 0   | 1   | 0   | 0   | 0   | 3
culture          | 0   | 0   | 0   | 2   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 2
transport        | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
foreign          | 0   | 1   | 0   | 0   | 0   | 0   | 0   | 1   | 0   | 0   | 1   | 3
person           | 0   | 0   | 0   | 0   | 0   | 0   | 1   | 0   | 0   | 0   | 1   | 2
war              | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0

region × 10년
byRegionDecade | 300 | 330 | 340 | 370 | 380 | 390 | 400 | 410 | 420 | 450 | 490 | total
---------------+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+------
capital        | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
north          | 3   | 3   | 2   | 4   | 1   | 1   | 1   | 5   | 2   | 0   | 3   | 25
central        | 0   | 0   | 0   | 0   | 0   | 1   | 2   | 0   | 0   | 1   | 0   | 4
south          | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
island         | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0

job 별 집계
job             | facts | scenes | claims | chunkClaims | excerptClaims
----------------+-------+--------+--------+-------------+--------------
goguryeo_middle | 29    | 19     | 65     | 61          | 4

PASS: failures=0 warnings=0
```

`run.json` 의 `started` 는 이번 수정 실행 시각(epoch 1789261856)으로 갱신했다.
