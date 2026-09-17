# #205 출처 이름·발행처 우리말 병기 결과

기준: `docs/research/copy-style-v2.md`. 사용자 결정에 따라 영어로만 남아 있던 출처 이름과 발행처를
**「우리말 (원문)」** 꼴로 함께 적었다. 이미 우리말인 값은 손대지 않았다.

## 자료가 있는 곳

| 자리 | 파일 | 쓰이는 곳 |
|---|---|---|
| 출처 이름 | `data/sources/<출처>.md` 머리말 `label` | `services/build_ttl.py` 가 `rdfs:label` 로 옮기고, 화면은 `sourceLabel` 로 읽는다 |
| 발행처 묶음 | 같은 파일 `sourceGroup` | 출처 설정 목록의 묶음 제목 (`services/host/app/source-groups.js`) |
| 엮은이 | 같은 파일 `compiler` | 비교 화면의 판본 줄 (`services/host/app/compare.js`) |

카드의 출처 줄은 `services/host/app/atlas-story.js` 의 `sourceName()` 이 이름을 ` — ` 로 갈라
`발행처 「이름」` 으로 만든다. 그래서 새 이름도 `우리말 (원문) — 발행처 (원문)` 꼴로 맞췄다.

## 표기 규칙

- 이름은 `우리말 (원문)` 으로 적는다. 예 `평양 (Pyongyang)`.
- 발행처는 **원문 주소의 호스트를 보고 정했다.** 머리말에 남아 있던 영어 표기가 12가지로 갈려 있어 그대로 옮기지 않았다.

| 호스트 | 발행처 표기 |
|---|---|
| `en.wikipedia.org` | 영어 위키백과 (English Wikipedia) |
| `www.wikidata.org` | 위키데이터 (Wikidata) |
| `whc.unesco.org` | 유네스코 세계유산센터 (UNESCO World Heritage Centre) |
| `ko.wikipedia.org` | 위키백과 |

- `ko.wikipedia.org` 만 괄호 병기를 하지 않았다. 그 사이트의 제 이름이 우리말 「위키백과」라서 원문과 우리말이 같다.
  이름은 이미 우리말인데 발행처 자리에만 `ko.wikipedia`, `ko.wikipedia.org`, `Wikimedia Foundation` 이 남아 있던
  **32개 카드의 64개 값**이 여기 해당한다. 이미 `위키백과` 로 적혀 있던 다른 카드와 표기가 맞는다.
- 원문 이름 끝의 괄호는 쉼표로 편다. `Geum River (Q489139)` 는 `금강 (Geum River, Q489139)` 이 된다. 겹괄호를 막으려는 것이다.
- `English Wikipedia — Wando County` 처럼 발행처가 앞에 붙어 화면에서 이름과 발행처가 뒤바뀌던 2건도 함께 바로잡았다.

## 집계

- 고친 출처 카드 **343개**.
  - 이름·발행처를 우리말로 병기한 카드 311개 (`data/sources/*.md`).
  - 발행처만 `위키백과` 로 고친 카드 32개 (값 64개).
- 고친 뒤 `data/sources/**` 에 영어로만 남은 `label`·`sourceGroup`·`compiler` 는 **0건**이다.
- 번역 확신이 낮거나 보통인 것 **16건**. 아래 표에 적었다.
- 손대지 않은 것: `data/sources/jipseong-ko_*.md` 92건은 한문 서명(`史記`·`漢書`)이라 영어가 아니다.
  `苗威 · 中国历史地理论丛`, `崔恒 [等撰]||内藤吉之助 校` 같은 한문 엮은이도 그대로 뒀다.

## 확신이 낮은 항목

| 출처 | 원문 | 쓴 우리말 | 확신 | 왜 |
|---|---|---|---|---|
| `src-gl3-en-dadu-wall` | Yuan Dadu City Wall Ruins Park — Wikipedia | 원 대도 성벽 유적공원 | 보통 | 유적공원 우리말 공식 이름을 찾지 못해 직역했다 |
| `src-hs-c1-en-beishan` | Beishan Park — Wikipedia (en) | 베이산 공원 | 보통 | 지린시 北山公園. 통용 표기를 확인하지 못했다 |
| `src-hs-c1-en-nycbuilding` | New York City Building — Wikipedia | 뉴욕시 빌딩 | 낮음 | 1948년 유엔 총회가 열린 플러싱 건물. 굳어진 우리말 이름이 없다 |
| `src-hs-c5-en-kosong-station` | Kosong station — Wikipedia | 고성역 | 보통 | 강원도 고성 지역 역. 북한 역명 표기를 확인하지 못했다 |
| `src-hs-c5-en-muette` | Château de la Muette — Wikipedia | 라 뮈에트 성 | 보통 | OECD 본부가 든 건물. 프랑스어 이름을 음차했다 |
| `src-hs-en-busan-museum` | Busan Modern History Museum — Wikipedia | 부산근대역사관 | 보통 | 영문 문서 제목은 Modern History Museum 이고 현재 이름은 부산근현대역사관이다 |
| `src-hs-en-kaesong-folk-hotel` | Kaesong Folk Hotel — Wikipedia | 개성 민속여관 | 보통 | 개성 민속여관. 우리말 공식 표기를 확인하지 못했다 |
| `src-hs-en-kaesong-stadium` | Kaesong Youth Stadium — Wikipedia | 개성 청년경기장 | 보통 | 북한 표기가 청년경기장인지 확인하지 못했다 |
| `src-hs-en-kaesong-youth-stadium` | Kaesong Youth Stadium — Wikipedia | 개성 청년경기장 | 보통 | 위와 같다 |
| `src-hs-en-koguryo-capitals` | Capital Cities and Tombs of the Ancient Koguryo Kingdom — Wikipedia | 고대 고구려 왕국의 수도와 무덤군 | 보통 | 유네스코 목록 이름. 우리말 표기가 자료마다 다르다 |
| `src-hs-en-koryo-songgyungwan-univ` | Koryo Songgyungwan University — Wikipedia | 고려성균관대학 | 보통 | 고려성균관인지 고려성균관대학인지 확정하지 못했다 |
| `src-hs-en-liuding` | Liuding Mountain — Wikipedia | 류딩산 | 보통 | 한자가 六鼎山인지 六頂山인지 확정하지 못했다 |
| `src-hs-en-penglai` | Penglai, Yantai — Wikipedia | 옌타이 펑라이구 | 보통 | 蓬萊市가 2020년 옌타이 蓬萊區로 바뀌었다. 자료 시점이 불명확하다 |
| `src-hs-en-sonha-station` | Sonha station — Wikipedia | 선하역 | 낮음 | 북한 역명. 한자와 우리말 표기를 확인하지 못했다 |
| `src-hs-jl5-en-chongju` | Chongju — Wikipedia | 정주시 | 보통 | 좌표 39.650/125.333 을 보고 평안북도 정주시로 판단했다. 청주(淸州)와 혼동하기 쉽다 |
| `src-nb2-en-jeonghyo-tomb` | Ancient Tombs at Longtou Mountain — Wikipedia | 용두산 고분군 | 보통 | 정효공주 무덤이 있는 고분군. 영문 제목은 Longtou Mountain 이다 |

## 이름이 길어져서 고친 화면

이름이 `평양` 에서 `평양 (Pyongyang) — 영어 위키백과 (English Wikipedia)` 로 길어졌다. 어디가 넘치는지 코드로 확인했다.

| 자리 | 코드 | 어떻게 되나 | 손봤나 |
|---|---|---|---|
| 카드의 출처 줄 | `atlas.css` `.atlas-story-evidence button>small` | `display:block` 에 `nowrap` 이 없어 줄바꿈된다 | 그대로 |
| 연대기 근거 단추 | `chronicle.css` `.context-proof` | 위와 같다 | 그대로 |
| 찾기 결과의 출처 | `atlas.css` `.atlas-source-link` | 위와 같다 | 그대로 |
| 비교 화면 제목 | `compare.js` `<h3>` | 줄바꿈된다 | 그대로 |
| **출처 설정 목록** | `timeline.js` `_track()` | 라벨 칸이 112~152px 라 `_trimLabels()` 가 `…` 로 자른다. 앞이 이름이라 발행처만 잘리지 않고 이름까지 잘렸다 | **고침** |

출처 설정 목록은 이미 묶음 제목에 발행처가 나오므로 줄 이름에서는 발행처를 뗐다.
`services/host/app/source-groups.js` 에 `shortSourceLabel()` 을 두고 `timeline.js` 가 쓴다 —
`평양 (Pyongyang) — 영어 위키백과 (English Wikipedia)` 는 목록에서 `평양 (Pyongyang)` 으로 보인다.
마우스를 올리면 나오는 설명(`titleOf`)에는 전체 이름이 그대로 남는다. CSS 는 고치지 않았다.

## 이번 범위 밖으로 남긴 것

- 영어 위키백과에서 온 출처인데 `sourceGroup` 이 이미 우리말로 `위키백과`, `위키백과(영어)`,
  `위키미디어 재단 · Wikipedia (English)` 처럼 갈려 있는 것이 남아 있다. "이미 우리말인 출처는 건드리지 않는다"는
  결정을 지켜 그대로 뒀다. 다만 출처 설정 목록의 묶음이 그만큼 쪼개지고, 영어 위키백과인데 그냥 `위키백과` 로
  적혀 한국어판과 구분되지 않는 것도 있다. 한 번 더 정리하려면 별도 결정이 필요하다.
- `jipseong-ko_*` 92건의 한문 서명도 `사기 (史記)` 꼴로 병기할 수 있다. 영어가 아니라서 이번에는 뺐다.

## 전체 표

| 출처 | 고치기 전 | 고친 뒤 |
|---|---|---|
| `src-anc-wikidata-q489139` | Geum River (Q489139) - Wikidata | 금강 (Geum River, Q489139) — 위키데이터 (Wikidata) |
| `src-anc-wikidata-q499266` | Ch’ongch’on River (Q499266) - Wikidata | 청천강 (Ch’ongch’on River, Q499266) — 위키데이터 (Wikidata) |
| `src-anc-wikidata-q625594` | Cheonghaejin (Q625594) - Wikidata | 청해진 (Cheonghaejin, Q625594) — 위키데이터 (Wikidata) |
| `src-anc-wikidata-q711386` | Gungnae Fortress (Q711386) - Wikidata | 국내성 (Gungnae Fortress, Q711386) — 위키데이터 (Wikidata) |
| `src-c2-en-beijing` | Beijing — Wikipedia | 베이징 (Beijing) — 영어 위키백과 (English Wikipedia) |
| `src-c2-en-cheonan` | Cheonan — Wikipedia | 천안시 (Cheonan) — 영어 위키백과 (English Wikipedia) |
| `src-c2-en-gunsan` | Gunsan — Wikipedia | 군산시 (Gunsan) — 영어 위키백과 (English Wikipedia) |
| `src-c2-en-helong` | Helong — Wikipedia | 허룽시 (Helong) — 영어 위키백과 (English Wikipedia) |
| `src-c2-en-hongseong` | Hongseong County — Wikipedia | 홍성군 (Hongseong County) — 영어 위키백과 (English Wikipedia) |
| `src-c2-en-hwangju` | Hwangju County — Wikipedia | 황주군 (Hwangju County) — 영어 위키백과 (English Wikipedia) |
| `src-c2-en-insadong` | Insa-dong — Wikipedia | 인사동 (Insa-dong) — 영어 위키백과 (English Wikipedia) |
| `src-c2-en-jilin` | Jilin City — Wikipedia | 지린시 (Jilin City) — 영어 위키백과 (English Wikipedia) |
| `src-c2-en-jongno` | Jongno District — Wikipedia | 종로구 (Jongno District) — 영어 위키백과 (English Wikipedia) |
| `src-c2-en-kyzylorda` | Kyzylorda — Wikipedia | 크질오르다 (Kyzylorda) — 영어 위키백과 (English Wikipedia) |
| `src-c2-en-paris` | Paris — Wikipedia | 파리 (Paris) — 영어 위키백과 (English Wikipedia) |
| `src-c2-en-pyongyang` | Pyongyang — Wikipedia | 평양 (Pyongyang) — 영어 위키백과 (English Wikipedia) |
| `src-c2-en-shanghai` | Shanghai — Wikipedia | 상하이 (Shanghai) — 영어 위키백과 (English Wikipedia) |
| `src-c2-en-tumen` | Tumen, Jilin — Wikipedia | 지린성 투먼시 (Tumen, Jilin) — 영어 위키백과 (English Wikipedia) |
| `src-c2-en-washington` | Washington, D.C. — Wikipedia | 워싱턴 D.C. (Washington, D.C.) — 영어 위키백과 (English Wikipedia) |
| `src-c2-en-yanji` | Yanji — Wikipedia | 옌지시 (Yanji) — 영어 위키백과 (English Wikipedia) |
| `src-chgis-hansagun` | Harvard University and Fudan University | 하버드대학교·푸단대학교 (Harvard University and Fudan University) |
| `src-cliopatria-korea-v013` | Ed Chalstrey · James Bennett · Seshat Global History Databank | 에드 찰스트리·제임스 베넷 · 세샤트 세계사 데이터뱅크 (Ed Chalstrey · James Bennett · Seshat Global History Databank) |
| `src-curriculum-goryeo-early-goryeo-early-1-hs-en-cheorwon` | Cheorwon County — Wikipedia | 철원군 (Cheorwon County) — 영어 위키백과 (English Wikipedia) |
| `src-curriculum-goryeo-late-goryeo-late-1-hs-en-anhwasa` | Anhwa Temple — Wikipedia | 안화사 (Anhwa Temple) — 영어 위키백과 (English Wikipedia) |
| `src-enwiki-bunhwangsa` | Bunhwangsa | 분황사 (Bunhwangsa) — 영어 위키백과 (English Wikipedia) |
| `src-enwiki-changnyeong` | English Wikipedia — Changnyeong County | 창녕군 (Changnyeong County) — 영어 위키백과 (English Wikipedia) |
| `src-enwiki-cheorwon` | Cheorwon County | 철원군 (Cheorwon County) — 영어 위키백과 (English Wikipedia) |
| `src-enwiki-dengta` | Dengta, Liaoning | 랴오닝성 덩타시 (Dengta, Liaoning) — 영어 위키백과 (English Wikipedia) |
| `src-enwiki-gamsansa` | Gamsansa - Wikipedia | 감산사 (Gamsansa) — 영어 위키백과 (English Wikipedia) |
| `src-enwiki-ganghwa` | Ganghwa County | 강화군 (Ganghwa County) — 영어 위키백과 (English Wikipedia) |
| `src-enwiki-gimhae` | Gimhae - Wikipedia | 김해시 (Gimhae) — 영어 위키백과 (English Wikipedia) |
| `src-enwiki-gongju` | Gongju | 공주시 (Gongju) — 영어 위키백과 (English Wikipedia) |
| `src-enwiki-gungnae` | Gungnae | 국내성 (Gungnae) — 영어 위키백과 (English Wikipedia) |
| `src-enwiki-gyeongju` | Gyeongju - Wikipedia | 경주시 (Gyeongju) — 영어 위키백과 (English Wikipedia) |
| `src-enwiki-huanren` | Huanren Manchu Autonomous County | 환런만족자치현 (Huanren Manchu Autonomous County) — 영어 위키백과 (English Wikipedia) |
| `src-enwiki-hwando` | Hwando | 환도성 (Hwando) — 영어 위키백과 (English Wikipedia) |
| `src-enwiki-hwaseong` | Hwaseong, Gyeonggi | 경기도 화성시 (Hwaseong, Gyeonggi) — 영어 위키백과 (English Wikipedia) |
| `src-enwiki-jeamni` | Jeamni massacre - Wikipedia | 제암리 학살 (Jeamni massacre) — 영어 위키백과 (English Wikipedia) |
| `src-enwiki-jian` | Ji'an, Jilin | 지린성 지안시 (Ji'an, Jilin) — 영어 위키백과 (English Wikipedia) |
| `src-enwiki-kuwol-mountain` | Kuwol Mountain - Wikipedia | 구월산 (Kuwol Mountain) — 영어 위키백과 (English Wikipedia) |
| `src-enwiki-myeonghwalsanseong` | Myeonghwalsanseong | 명활산성 (Myeonghwalsanseong) — 영어 위키백과 (English Wikipedia) |
| `src-enwiki-namsanfortress` | Namsansinseong | 남산신성 (Namsansinseong) — 영어 위키백과 (English Wikipedia) |
| `src-enwiki-namwon` | Namwon - Wikipedia | 남원시 (Namwon) — 영어 위키백과 (English Wikipedia) |
| `src-enwiki-naro-space-center` | Naro Space Center - Wikipedia | 나로우주센터 (Naro Space Center) — 영어 위키백과 (English Wikipedia) |
| `src-enwiki-pyongyang` | Pyongyang | 평양 (Pyongyang) — 영어 위키백과 (English Wikipedia) |
| `src-enwiki-sacheonwangsa` | Sacheonwangsa - Wikipedia | 사천왕사 (Sacheonwangsa) — 영어 위키백과 (English Wikipedia) |
| `src-enwiki-shangjing` | Shangjing Longquanfu | 상경용천부 (Shangjing Longquanfu) — 영어 위키백과 (English Wikipedia) |
| `src-enwiki-wando` | English Wikipedia — Wando County | 완도군 (Wando County) — 영어 위키백과 (English Wikipedia) |
| `src-enwiki-wandu` | Hwando | 환도성 (Hwando) — 영어 위키백과 (English Wikipedia) |
| `src-enwiki-wonsan` | Wonsan - Wikipedia | 원산시 (Wonsan) — 영어 위키백과 (English Wikipedia) |
| `src-enwiki-wunu` | Wunü Mountain | 오녀산 (Wunü Mountain) — 영어 위키백과 (English Wikipedia) |
| `src-facts-ancient-cross_economy_disaster-enwiki-gungnae` | Gungnae Fortress | 국내성 (Gungnae Fortress) — 영어 위키백과 (English Wikipedia) |
| `src-facts-ancient-cross_facility_culture-enwiki-gungnae` | Gungnae | 국내성 (Gungnae) — 영어 위키백과 (English Wikipedia) |
| `src-facts-ancient-cross_facility_culture-enwiki-wandu` | Hwando | 환도성 (Hwando) — 영어 위키백과 (English Wikipedia) |
| `src-facts-ancient-goguryeo_middle-enwiki-gungnae` | Gungnae | 국내성 (Gungnae) — 영어 위키백과 (English Wikipedia) |
| `src-geonames-hamgyongnamdo` | GeoNames | 지오네임스 (GeoNames) |
| `src-geonames` | GeoNames geographical database | 지오네임스 지명 데이터베이스 (GeoNames geographical database) |
| `src-geonames` | Unxos GmbH (St. Gallen, Switzerland) | 운소스 (Unxos GmbH, 스위스 장크트갈렌) |
| `src-gl2-en-aewol` | Aewol | 애월 (Aewol) — 영어 위키백과 (English Wikipedia) |
| `src-gl2-en-kumya` | Kumya County — Wikipedia | 금야군 (Kumya County) — 영어 위키백과 (English Wikipedia) |
| `src-gl2-en-kusong` | Kusong — Wikipedia | 구성시 (Kusong) — 영어 위키백과 (English Wikipedia) |
| `src-gl2-en-manwoldae` | Manwoldae — Wikipedia | 만월대 (Manwoldae) — 영어 위키백과 (English Wikipedia) |
| `src-gl2-en-namdaemun` | Kaesong Namdaemun — Wikipedia | 개성 남대문 (Kaesong Namdaemun) — 영어 위키백과 (English Wikipedia) |
| `src-gl3-en-beijing` | Beijing — Wikipedia | 베이징 (Beijing) — 영어 위키백과 (English Wikipedia) |
| `src-gl3-en-chomsongdae` | Kaesong Chomsongdae — Wikipedia | 개성 첨성대 (Kaesong Chomsongdae) — 영어 위키백과 (English Wikipedia) |
| `src-gl3-en-dadu-wall` | Yuan Dadu City Wall Ruins Park — Wikipedia | 원 대도 성벽 유적공원 (Yuan Dadu City Wall Ruins Park) — 영어 위키백과 (English Wikipedia) |
| `src-gl3-en-dadu` | Dadu (Beijing) — Wikipedia | 원 대도 (Dadu, Beijing) — 영어 위키백과 (English Wikipedia) |
| `src-gl3-en-kaesong-walls` | Kaesong city walls — Wikipedia | 개성 성곽 (Kaesong city walls) — 영어 위키백과 (English Wikipedia) |
| `src-gl3-en-kaesong` | Kaesong — Wikipedia | 개성시 (Kaesong) — 영어 위키백과 (English Wikipedia) |
| `src-gl3-en-kongmin-tomb` | Mausoleum of King Kongmin — Wikipedia | 공민왕릉 (Mausoleum of King Kongmin) — 영어 위키백과 (English Wikipedia) |
| `src-gl3-en-kumya` | Kumya County — Wikipedia | 금야군 (Kumya County) — 영어 위키백과 (English Wikipedia) |
| `src-gl3-en-kwanumsa` | Kwanumsa (Kaesong) — Wikipedia | 개성 관음사 (Kwanumsa, Kaesong) — 영어 위키백과 (English Wikipedia) |
| `src-gl3-en-manwoldae` | Manwoldae — Wikipedia | 만월대 (Manwoldae) — 영어 위키백과 (English Wikipedia) |
| `src-gl3-en-masan` | Masan — Wikipedia | 마산 (Masan) — 영어 위키백과 (English Wikipedia) |
| `src-gl3-en-namdaemun` | Kaesong Namdaemun — Wikipedia | 개성 남대문 (Kaesong Namdaemun) — 영어 위키백과 (English Wikipedia) |
| `src-gl3-en-nmk` | National Museum of Korea — Wikipedia | 국립중앙박물관 (National Museum of Korea) — 영어 위키백과 (English Wikipedia) |
| `src-gl3-en-pyongyang` | Pyongyang — Wikipedia | 평양 (Pyongyang) — 영어 위키백과 (English Wikipedia) |
| `src-gl3-en-songgyungwan` | Koryo Songgyungwan — Wikipedia | 개성 성균관 (Koryo Songgyungwan) — 영어 위키백과 (English Wikipedia) |
| `src-gl3-en-sonjuk` | Sonjuk Bridge — Wikipedia | 선죽교 (Sonjuk Bridge) — 영어 위키백과 (English Wikipedia) |
| `src-gl3-en-sudeoksa-geo` | Sudeoksa — Wikipedia | 수덕사 (Sudeoksa) — 영어 위키백과 (English Wikipedia) |
| `src-gl4-en-bongjeongsa` | Bongjeongsa — Wikipedia | 봉정사 (Bongjeongsa) — 영어 위키백과 (English Wikipedia) |
| `src-gl4-en-kaesong-walls` | Kaesong city walls — English Wikipedia | 개성 성곽 (Kaesong city walls) — 영어 위키백과 (English Wikipedia) |
| `src-gl4-en-kaesong` | Kaesong — Wikipedia | 개성시 (Kaesong) — 영어 위키백과 (English Wikipedia) |
| `src-gl4-en-manwoldae` | Manwoldae — Wikipedia | 만월대 (Manwoldae) — 영어 위키백과 (English Wikipedia) |
| `src-gl4-en-namdaemun` | Kaesong Namdaemun — Wikipedia | 개성 남대문 (Kaesong Namdaemun) — 영어 위키백과 (English Wikipedia) |
| `src-gl4-en-seocheon` | Seocheon County — Wikipedia | 서천군 (Seocheon County) — 영어 위키백과 (English Wikipedia) |
| `src-gl4-en-songgyungwan` | Koryo Songgyungwan — Wikipedia | 개성 성균관 (Koryo Songgyungwan) — 영어 위키백과 (English Wikipedia) |
| `src-gl4-en-sonjuk` | Sonjuk Bridge — Wikipedia | 선죽교 (Sonjuk Bridge) — 영어 위키백과 (English Wikipedia) |
| `src-gl4-en-tsushima` | Tsushima Island — Wikipedia | 쓰시마섬 (Tsushima Island) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c1-en-beishan` | Beishan Park — Wikipedia (en) | 베이산 공원 (Beishan Park) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c1-en-bosingak` | Bosingak — Wikipedia | 보신각 (Bosingak) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c1-en-chiyoda` | Chiyoda, Tokyo — Wikipedia (en) | 도쿄 지요다구 (Chiyoda, Tokyo) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c1-en-ihwajang` | Ihwajang — Wikipedia | 이화장 (Ihwajang) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c1-en-jggb` | Japanese General Government Building, Seoul — Wikipedia | 조선총독부 청사 (Japanese General Government Building, Seoul) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c1-en-jilin` | Jilin City — Wikipedia (en) | 지린시 (Jilin City) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c1-en-liuhe` | Liuhe County — Wikipedia (en) | 류허현 (Liuhe County) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c1-en-mangyongdae` | Mangyongdae-guyok — Wikipedia | 만경대구역 (Mangyongdae-guyok) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c1-en-moranbong-theatre` | Moranbong Theatre — Wikipedia | 모란봉극장 (Moranbong Theatre) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c1-en-nycbuilding` | New York City Building — Wikipedia | 뉴욕시 빌딩 (New York City Building) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c1-en-pyongyang` | Pyongyang — Wikipedia | 평양 (Pyongyang) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c1-en-samcheong` | Samcheong-dong — Wikipedia | 삼청동 (Samcheong-dong) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c1-en-sanfrancisco` | San Francisco — Wikipedia (en) | 샌프란시스코 (San Francisco) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c1-en-seokjojeon` | Seokjojeon — Wikipedia | 석조전 (Seokjojeon) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c1-en-sogong` | Sogong-dong — Wikipedia | 소공동 (Sogong-dong) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c1-en-sonchon` | Sonchon County — Wikipedia (en) | 선천군 (Sonchon County) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c1-en-tapgol` | Tapgol Park — Wikipedia | 탑골공원 (Tapgol Park) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c1-en-vladivostok` | Vladivostok — Wikipedia (en) | 블라디보스토크 (Vladivostok) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c1-en-wangqing` | Wangqing County — Wikipedia (en) | 왕칭현 (Wangqing County) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c1-en-wuhan` | Wuhan — Wikipedia (en) | 우한시 (Wuhan) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c3-en-japan-pm` | Prime Minister's Official Residence (Japan) — Wikipedia | 일본 총리 관저 (Prime Minister's Official Residence, Japan) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c3-en-masan` | Masan — Wikipedia | 마산 (Masan) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c4-en-beijing` | Beijing — English Wikipedia | 베이징 (Beijing) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c4-en-bluehouse` | Blue House — English Wikipedia | 청와대 (Blue House) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c4-en-ggb-seoul` | Japanese General Government Building, Seoul — Wikipedia | 조선총독부 청사 (Japanese General Government Building, Seoul) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c4-en-gumi` | Gumi, North Gyeongsang — English Wikipedia | 경상북도 구미시 (Gumi, North Gyeongsang) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c4-en-huangpu` | Huangpu District, Shanghai — Wikipedia | 상하이 황푸구 (Huangpu District, Shanghai) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c4-en-huanren` | Huanren Manchu Autonomous County — Wikipedia | 환런만족자치현 (Huanren Manchu Autonomous County) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c4-en-hungnam` | Hŭngnam — Wikipedia | 흥남 (Hŭngnam) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c4-en-jeongdok` | Jeongdok Public Library — Wikipedia | 정독도서관 (Jeongdok Public Library) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c4-en-mukden-incident` | Mukden Incident — Wikipedia | 만주사변 (Mukden Incident) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c4-en-myeongdong` | Myeongdong Cathedral — English Wikipedia | 명동성당 (Myeongdong Cathedral) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c4-en-seodaemun` | Seodaemun-gu — English Wikipedia | 서대문구 (Seodaemun-gu) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c4-en-shanghai` | Shanghai — Wikipedia | 상하이 (Shanghai) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c4-en-shuangcheng` | Shuangcheng District — Wikipedia | 솽청구 (Shuangcheng District) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c4-en-ulsan` | Dong-gu, Ulsan — English Wikipedia | 울산 동구 (Dong-gu, Ulsan) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c4-en-unhq` | Headquarters of the United Nations — English Wikipedia | 국제연합 본부 (Headquarters of the United Nations) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c4-en-warmemorial` | War Memorial of Korea — English Wikipedia | 전쟁기념관 (War Memorial of Korea) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c4-en-xinbin` | Xinbin Manchu Autonomous County — Wikipedia | 신빈만족자치현 (Xinbin Manchu Autonomous County) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c5-en-bongha` | Bongha Village — Wikipedia | 봉하마을 (Bongha Village) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c5-en-gwanghwamun` | Gwanghwamun Plaza — Wikipedia | 광화문광장 (Gwanghwamun Plaza) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c5-en-kosong-station` | Kosong station — Wikipedia | 고성역 (Kosong station) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c5-en-kumgang` | Kumgangsan Tourist Region — Wikipedia | 금강산관광지구 (Kumgangsan Tourist Region) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c5-en-muette` | Château de la Muette — Wikipedia | 라 뮈에트 성 (Château de la Muette) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c5-en-summit2000` | 2000 inter-Korean summit — Wikipedia | 2000년 남북정상회담 (2000 inter-Korean summit) — 영어 위키백과 (English Wikipedia) |
| `src-hs-c5-en-taesong` | Taesong-guyok — Wikipedia | 대성구역 (Taesong-guyok) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-anak-tomb3` | Anak Tomb No. 3 — Wikipedia | 안악 3호분 (Anak Tomb No. 3) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-anhakgung` | Anhak Palace — Wikipedia | 안학궁 (Anhak Palace) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-anhwasa` | Anhwasa — Wikipedia | 안화사 (Anhwasa) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-beijing` | Beijing — Wikipedia | 베이징 (Beijing) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-binnenhof` | Binnenhof — Wikipedia | 비넨호프 (Binnenhof) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-bosingak` | Bosingak — Wikipedia | 보신각 (Bosingak) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-busan-museum` | Busan Modern History Museum — Wikipedia | 부산근대역사관 (Busan Modern History Museum) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-cairo` | Cairo — Wikipedia | 카이로 (Cairo) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-chasong` | Chasong County — Wikipedia | 자성군 (Chasong County) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-chemulpo` | Battle of Chemulpo Bay — Wikipedia | 제물포 해전 (Battle of Chemulpo Bay) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-cheonan` | Cheonan — Wikipedia | 천안시 (Cheonan) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-cheonghaejin` | Cheonghaejin — Wikipedia | 청해진 (Cheonghaejin) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-cheonmachong` | Cheonmachong — Wikipedia | 천마총 (Cheonmachong) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-cheorwon` | Cheorwon County — Wikipedia | 철원군 (Cheorwon County) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-chongqing` | Chongqing — Wikipedia | 충칭 (Chongqing) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-chung` | Chung-guyok — Wikipedia | 중구역 (Chung-guyok) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-daereungwon` | Daereungwon — Wikipedia | 대릉원 (Daereungwon) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-dandong` | Dandong — Wikipedia | 단둥 (Dandong) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-dangjin` | Dangjin — Wikipedia | 당진시 (Dangjin) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-dunhua` | Dunhua — Wikipedia | 둔화시 (Dunhua) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-ganghwa` | Ganghwa County — Wikipedia | 강화군 (Ganghwa County) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-gangneung` | Gangneung — Wikipedia | 강릉시 (Gangneung) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-geoje-pow` | Geoje POW camp — Wikipedia | 거제 포로수용소 (Geoje POW camp) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-gukje-market` | Gukje Market — Wikipedia | 국제시장 (Gukje Market) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-gyeongju` | Gyeongju — Wikipedia | 경주시 (Gyeongju) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-haicheng` | Haicheng, Liaoning — Wikipedia | 랴오닝성 하이청시 (Haicheng, Liaoning) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-hamhung` | Hamhung — Wikipedia | 함흥시 (Hamhung) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-heijo` | Heijō Palace — Wikipedia | 헤이조궁 (Heijō Palace) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-hungnam` | Hungnam — Wikipedia | 흥남 (Hungnam) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-iksan` | Iksan — Wikipedia | 익산시 (Iksan) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-isonokami` | Isonokami Shrine — Wikipedia | 이소노카미 신궁 (Isonokami Shrine) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-janggunchong` | Tomb of the General — Wikipedia | 장군총 (Tomb of the General) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-jian` | Ji'an, Jilin — Wikipedia | 지린성 지안시 (Ji'an, Jilin) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-jilin` | Jilin City — Wikipedia | 지린시 (Jilin City) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-kaesong-folk-hotel` | Kaesong Folk Hotel — Wikipedia | 개성 민속여관 (Kaesong Folk Hotel) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-kaesong-stadium` | Kaesong Youth Stadium — Wikipedia | 개성 청년경기장 (Kaesong Youth Stadium) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-kaesong-youth-stadium` | Kaesong Youth Stadium — Wikipedia | 개성 청년경기장 (Kaesong Youth Stadium) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-koguryo-capitals` | Capital Cities and Tombs of the Ancient Koguryo Kingdom — Wikipedia | 고대 고구려 왕국의 수도와 무덤군 (Capital Cities and Tombs of the Ancient Koguryo Kingdom) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-koryo-songgyungwan-univ` | Koryo Songgyungwan University — Wikipedia | 고려성균관대학 (Koryo Songgyungwan University) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-kwanumsa` | Kwanumsa (Kaesong) — Wikipedia | 개성 관음사 (Kwanumsa, Kaesong) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-kyongwon` | Kyongwon County — Wikipedia | 경원군 (Kyongwon County) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-liaoyang` | Liaoyang — Wikipedia | 랴오양시 (Liaoyang) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-linjiang` | Linjiang, Jilin — Wikipedia | 지린성 린장시 (Linjiang, Jilin) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-liuding` | Liuding Mountain — Wikipedia | 류딩산 (Liuding Mountain) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-longjing` | Longjing, Jilin — Wikipedia | 지린성 룽징시 (Longjing, Jilin) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-lushunkou` | Lushunkou, Dalian — Wikipedia | 다롄 뤼순커우구 (Lushunkou, Dalian) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-mangyongdae` | Mangyongdae-guyok — Wikipedia | 만경대구역 (Mangyongdae-guyok) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-manpo` | Manpo — Wikipedia | 만포시 (Manpo) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-masan` | Masan — Wikipedia | 마산 (Masan) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-mogao` | Mogao Caves — Wikipedia | 막고굴 (Mogao Caves) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-nagoya` | Nagoya — Wikipedia | 나고야 (Nagoya) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-naju` | Naju — Wikipedia | 나주시 (Naju) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-nalanda` | Nalanda mahavihara — Wikipedia | 날란다 사원 (Nalanda mahavihara) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-namdaemun` | Namdaemun (Kaesong) — Wikipedia | 개성 남대문 (Namdaemun, Kaesong) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-namsan` | Namsan (Gyeongju) — Wikipedia | 경주 남산 (Namsan, Gyeongju) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-nangnang` | Nangnang-guyok — Wikipedia | 낙랑구역 (Nangnang-guyok) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-nara` | Nara, Nara — Wikipedia | 나라시 (Nara, Nara) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-nodeul` | Nodeul Island — Wikipedia | 노들섬 (Nodeul Island) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-onsong` | Onsong County — Wikipedia | 온성군 (Onsong County) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-palgongsan` | Palgongsan — Wikipedia | 팔공산 (Palgongsan) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-penglai` | Penglai, Yantai — Wikipedia | 옌타이 펑라이구 (Penglai, Yantai) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-provisional-capital` | Provisional Capital Memorial Hall — Wikipedia | 임시수도기념관 (Provisional Capital Memorial Hall) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-pyongyang` | Pyongyang — Wikipedia | 평양 (Pyongyang) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-rongcheng` | Rongcheng, Shandong — Wikipedia | 산둥성 룽청시 (Rongcheng, Shandong) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-ryokpo` | Ryokpo-guyok — Wikipedia | 력포구역 (Ryokpo-guyok) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-sadong` | Sadong-guyok — Wikipedia | 사동구역 (Sadong-guyok) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-seo-daejeon` | Seo District, Daejeon — Wikipedia | 대전 서구 (Seo District, Daejeon) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-seocheon` | Seocheon County — Wikipedia | 서천군 (Seocheon County) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-seokjojeon` | Seokjojeon — Wikipedia | 석조전 (Seokjojeon) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-seonggyungwan` | Koryo Songgyungwan — Wikipedia | 개성 성균관 (Koryo Songgyungwan) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-seonjukgyo` | Sonjuk Bridge — Wikipedia | 선죽교 (Sonjuk Bridge) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-shanghai` | Shanghai — Wikipedia | 상하이 (Shanghai) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-shangjing` | Shangjing Longquanfu — Wikipedia | 상경용천부 (Shangjing Longquanfu) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-shenyang` | Shenyang — Wikipedia | 선양시 (Shenyang) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-sinwon` | Sinwon County — Wikipedia | 신원군 (Sinwon County) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-sonha-station` | Sonha station — Wikipedia | 선하역 (Sonha station) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-taedong-river` | Taedong River — Wikipedia | 대동강 (Taedong River) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-taedonggang` | Taedonggang-guyok — Wikipedia | 대동강구역 (Taedonggang-guyok) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-taesong` | Taesongsan — Wikipedia | 대성산 (Taesongsan) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-tokyo` | Tokyo — Wikipedia | 도쿄 (Tokyo) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-tomb-general` | Tomb of the General — Wikipedia | 장군총 (Tomb of the General) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-tsushima` | Tsushima Island — Wikipedia | 쓰시마섬 (Tsushima Island) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-waegwan` | Waegwan — Wikipedia | 왜관 (Waegwan) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-wando` | Wando County — Wikipedia | 완도군 (Wando County) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-wani` | Wani (scholar) — Wikipedia | 왕인 (Wani, scholar) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-wanju` | Wanju County — Wikipedia | 완주군 (Wanju County) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-war-memorial` | War Memorial of Korea — Wikipedia | 전쟁기념관 (War Memorial of Korea) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-washington-dc` | Washington, D.C. — Wikipedia | 워싱턴 D.C. (Washington, D.C.) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-wuhan` | Wuhan — Wikipedia | 우한시 (Wuhan) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-xian` | Xi'an — Wikipedia | 시안시 (Xi'an) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-yanan` | Yan'an — Wikipedia | 옌안시 (Yan'an) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-yesong` | Ryesong River — Wikipedia | 예성강 (Ryesong River) — 영어 위키백과 (English Wikipedia) |
| `src-hs-en-yuzhong` | Yuzhong District — Wikipedia | 위중구 (Yuzhong District) — 영어 위키백과 (English Wikipedia) |
| `src-hs-enwiki-kilju` | Kilju County - Wikipedia | 길주군 (Kilju County) — 영어 위키백과 (English Wikipedia) |
| `src-hs-ge4-en-anhwa` | Anhwa Temple — Wikipedia | 안화사 (Anhwa Temple) — 영어 위키백과 (English Wikipedia) |
| `src-hs-ge4-en-gilju` | Kilju County — Wikipedia | 길주군 (Kilju County) — 영어 위키백과 (English Wikipedia) |
| `src-hs-ge4-en-kaesong` | Kaesong — Wikipedia | 개성시 (Kaesong) — 영어 위키백과 (English Wikipedia) |
| `src-hs-ge4-en-manwoldae` | Manwoldae — Wikipedia | 만월대 (Manwoldae) — 영어 위키백과 (English Wikipedia) |
| `src-hs-ge4-en-namdaemun` | Kaesong Namdaemun — Wikipedia | 개성 남대문 (Kaesong Namdaemun) — 영어 위키백과 (English Wikipedia) |
| `src-hs-ge4-en-pyongyang` | Pyongyang — Wikipedia | 평양 (Pyongyang) — 영어 위키백과 (English Wikipedia) |
| `src-hs-ge4-en-songgyungwan` | Songgyungwan — Wikipedia | 성균관 (Songgyungwan) — 영어 위키백과 (English Wikipedia) |
| `src-hs-ge4-en-sonjuk` | Sonjuk Bridge — Wikipedia | 선죽교 (Sonjuk Bridge) — 영어 위키백과 (English Wikipedia) |
| `src-hs-jl1-en-gyeonghuigung` | Gyeonghuigung — Wikipedia | 경희궁 (Gyeonghuigung) — 영어 위키백과 (English Wikipedia) |
| `src-hs-jl1-en-hapcheon` | Hapcheon County — Wikipedia | 합천군 (Hapcheon County) — 영어 위키백과 (English Wikipedia) |
| `src-hs-jl1-en-myeongnyang-strait` | Myeongnyang Strait — Wikipedia | 명량해협 (Myeongnyang Strait) — 영어 위키백과 (English Wikipedia) |
| `src-hs-jl1-en-pohyonsa` | Pohyonsa — Wikipedia | 보현사 (Pohyonsa) — 영어 위키백과 (English Wikipedia) |
| `src-hs-jl1-en-pyochungsa` | Pyochungsa — Wikipedia | 표충사 (Pyochungsa) — 영어 위키백과 (English Wikipedia) |
| `src-hs-jl1-en-sangju` | Sangju — Wikipedia | 상주시 (Sangju) — 영어 위키백과 (English Wikipedia) |
| `src-hs-jl1-en-souimun` | Souimun — Wikipedia | 소의문 (Souimun) — 영어 위키백과 (English Wikipedia) |
| `src-hs-jl1-en-uiryeong` | Uiryeong County — Wikipedia | 의령군 (Uiryeong County) — 영어 위키백과 (English Wikipedia) |
| `src-hs-jl2-en-sarhu` | Battle of Sarhu — English Wikipedia | 사르후 전투 (Battle of Sarhu) — 영어 위키백과 (English Wikipedia) |
| `src-hs-jl5-en-chongju` | Chongju — Wikipedia | 정주시 (Chongju) — 영어 위키백과 (English Wikipedia) |
| `src-hs-jl5-en-gyeryongsan` | Gyeryongsan — Wikipedia | 계룡산 (Gyeryongsan) — 영어 위키백과 (English Wikipedia) |
| `src-hs-jl5-en-hyeongok` | Hyeongok-myeon — Wikipedia | 현곡면 (Hyeongok-myeon) — 영어 위키백과 (English Wikipedia) |
| `src-hs-jl5-en-yongdamjeong` | Yongdamjeong — Wikipedia | 용담정 (Yongdamjeong) — 영어 위키백과 (English Wikipedia) |
| `src-hs-pg1-en-bangudae` | Bangudae Petroglyphs — Wikipedia | 반구대 암각화 (Bangudae Petroglyphs) — 영어 위키백과 (English Wikipedia) |
| `src-hs-pg1-en-chaoyang` | Chaoyang, Liaoning — Wikipedia | 랴오닝성 차오양시 (Chaoyang, Liaoning) — 영어 위키백과 (English Wikipedia) |
| `src-hs-pg1-en-dolmen-sites` | Gochang, Hwasun and Ganghwa Dolmen Sites — Wikipedia | 고창·화순·강화 고인돌 유적 (Gochang, Hwasun and Ganghwa Dolmen Sites) — 영어 위키백과 (English Wikipedia) |
| `src-hs-pg1-en-myohyangsan` | Myohyangsan — Wikipedia | 묘향산 (Myohyangsan) — 영어 위키백과 (English Wikipedia) |
| `src-hs-pg1-en-pyongyang` | Pyongyang — Wikipedia | 평양 (Pyongyang) — 영어 위키백과 (English Wikipedia) |
| `src-hs-pg1-en-ryonggang` | Ryonggang County — Wikipedia | 룡강군 (Ryonggang County) — 영어 위키백과 (English Wikipedia) |
| `src-hs-pg1-en-uiju` | Uiju County — Wikipedia | 의주군 (Uiju County) — 영어 위키백과 (English Wikipedia) |
| `src-hs-s3-wiki-gongju` | Gongju — Wikipedia | 공주시 (Gongju) — 영어 위키백과 (English Wikipedia) |
| `src-hs-s3-wiki-gyeongju` | Gyeongju — Wikipedia | 경주시 (Gyeongju) — 영어 위키백과 (English Wikipedia) |
| `src-hs-s3-wiki-namsan` | Namsan (Gyeongju) — Wikipedia | 경주 남산 (Namsan, Gyeongju) — 영어 위키백과 (English Wikipedia) |
| `src-hs-s3-wiki-uiryeong` | Uiryeong County — Wikipedia | 의령군 (Uiryeong County) — 영어 위키백과 (English Wikipedia) |
| `src-hs3-en-bosingak` | Bosingak — Wikipedia | 보신각 (Bosingak) — 영어 위키백과 (English Wikipedia) |
| `src-hs3-en-buan` | Buan County — Wikipedia | 부안군 (Buan County) — 영어 위키백과 (English Wikipedia) |
| `src-hs3-en-changdeokgung` | Changdeokgung — Wikipedia | 창덕궁 (Changdeokgung) — 영어 위키백과 (English Wikipedia) |
| `src-hs3-en-changgyeonggung` | Changgyeonggung — Wikipedia | 창경궁 (Changgyeonggung) — 영어 위키백과 (English Wikipedia) |
| `src-hs3-en-donhwamun` | Donhwamun — Wikipedia | 돈화문 (Donhwamun) — 영어 위키백과 (English Wikipedia) |
| `src-hs3-en-kaesong` | Kaesong — Wikipedia | 개성시 (Kaesong) — 영어 위키백과 (English Wikipedia) |
| `src-hs3-en-mapo` | Mapo District — Wikipedia | 마포구 (Mapo District) — 영어 위키백과 (English Wikipedia) |
| `src-hs3-en-tanchon` | Tanchon — Wikipedia | 단천시 (Tanchon) — 영어 위키백과 (English Wikipedia) |
| `src-hs3-en-tongjiang` | Tongjiang, Heilongjiang — Wikipedia | 헤이룽장성 퉁장시 (Tongjiang, Heilongjiang) — 영어 위키백과 (English Wikipedia) |
| `src-hs3-en-uiju` | Uiju County — Wikipedia | 의주군 (Uiju County) — 영어 위키백과 (English Wikipedia) |
| `src-hs3-en-yesan` | Yesan County — Wikipedia | 예산군 (Yesan County) — 영어 위키백과 (English Wikipedia) |
| `src-hs4-en-anhak` | Anhak Palace — English Wikipedia | 안학궁 (Anhak Palace) — 영어 위키백과 (English Wikipedia) |
| `src-hs4-en-goguryeo-tombs` | Goguryeo tombs — English Wikipedia | 고구려 고분군 (Goguryeo tombs) — 영어 위키백과 (English Wikipedia) |
| `src-hs4-en-jeongnimsa` | Jeongnimsa — English Wikipedia | 정림사 (Jeongnimsa) — 영어 위키백과 (English Wikipedia) |
| `src-hs4-en-kangso-tombs` | Kangso Three Tombs — English Wikipedia | 강서삼묘 (Kangso Three Tombs) — 영어 위키백과 (English Wikipedia) |
| `src-hs4-en-kangso` | Kangso-guyŏk — English Wikipedia | 강서구역 (Kangso-guyŏk) — 영어 위키백과 (English Wikipedia) |
| `src-hs4-en-liaoyang` | Liaoyang — English Wikipedia | 랴오양시 (Liaoyang) — 영어 위키백과 (English Wikipedia) |
| `src-hs4-en-nongan` | Nong'an County — English Wikipedia | 눙안현 (Nong'an County) — 영어 위키백과 (English Wikipedia) |
| `src-hs4-en-okcheon` | Okcheon County — English Wikipedia | 옥천군 (Okcheon County) — 영어 위키백과 (English Wikipedia) |
| `src-je-wikidata-q5472741` | Fortress Wall of Seoul (Q5472741) - Wikidata | 한양도성 (Fortress Wall of Seoul, Q5472741) — 위키데이터 (Wikidata) |
| `src-je-wikidata-q8684` | Seoul (Q8684) - Wikidata | 서울 (Seoul, Q8684) — 위키데이터 (Wikidata) |
| `src-nb2-en-dunhua` | Dunhua — Wikipedia | 둔화시 (Dunhua) — 영어 위키백과 (English Wikipedia) |
| `src-nb2-en-helong` | Helong, Jilin — Wikipedia | 지린성 허룽시 (Helong, Jilin) — 영어 위키백과 (English Wikipedia) |
| `src-nb2-en-hunchun` | Hunchun — Wikipedia | 훈춘시 (Hunchun) — 영어 위키백과 (English Wikipedia) |
| `src-nb2-en-jeonghyo-tomb` | Ancient Tombs at Longtou Mountain — Wikipedia | 용두산 고분군 (Ancient Tombs at Longtou Mountain) — 영어 위키백과 (English Wikipedia) |
| `src-nb2-en-jingpo` | Jingpo Lake — Wikipedia | 징포호 (Jingpo Lake) — 영어 위키백과 (English Wikipedia) |
| `src-nb2-en-kraskino` | Kraskino — Wikipedia | 크라스키노 (Kraskino) — 영어 위키백과 (English Wikipedia) |
| `src-nb2-en-mudanjiang` | Mudanjiang — Wikipedia | 무단장시 (Mudanjiang) — 영어 위키백과 (English Wikipedia) |
| `src-nb2-en-namsan` | Namsan (Gyeongju) — Wikipedia | 경주 남산 (Namsan, Gyeongju) — 영어 위키백과 (English Wikipedia) |
| `src-nb2-en-ningan` | Ning'an — Wikipedia | 닝안시 (Ning'an) — 영어 위키백과 (English Wikipedia) |
| `src-nb2-en-pyongyang` | Pyongyang — Wikipedia | 평양 (Pyongyang) — 영어 위키백과 (English Wikipedia) |
| `src-nb2-en-sanggyeong` | Shangjing Longquanfu — Wikipedia | 상경용천부 (Shangjing Longquanfu) — 영어 위키백과 (English Wikipedia) |
| `src-nb2-en-tohamsan` | Tohamsan — Wikipedia | 토함산 (Tohamsan) — 영어 위키백과 (English Wikipedia) |
| `src-nb2-en-wonsan` | Wonsan — Wikipedia | 원산시 (Wonsan) — 영어 위키백과 (English Wikipedia) |
| `src-spr-wikidata-q12621852` | Pyounghwa Market (Q12621852) - Wikidata | 평화시장 (Pyounghwa Market, Q12621852) — 위키데이터 (Wikidata) |
| `src-syj103-wikidata-donghae` | Donghae-myeon (Q16183858) | 동해면 (Donghae-myeon, Q16183858) — 위키데이터 (Wikidata) |
| `src-syj103-wikidata-gohado` | Gohado (Q12584477) | 고하도 (Gohado, Q12584477) — 위키데이터 (Wikidata) |
| `src-syj103-wikidata-hoehwa` | Hoehwa-myeon (Q12625999) | 회화면 (Hoehwa-myeon, Q12625999) — 위키데이터 (Wikidata) |
| `src-syj122-enwiki-songgwangsa` | Songgwangsa - Wikipedia | 송광사 (Songgwangsa) — 영어 위키백과 (English Wikipedia) |
| `src-unesco-hwaseong-817` | Hwaseong Fortress - UNESCO World Heritage Centre | 수원 화성 (Hwaseong Fortress) — 유네스코 세계유산센터 (UNESCO World Heritage Centre) |
| `src-web-enwiki-bosingak` | Bosingak — Wikipedia | 보신각 (Bosingak) — 영어 위키백과 (English Wikipedia) |
| `src-web-enwiki-changgyeonggung` | Changgyeonggung — Wikipedia | 창경궁 (Changgyeonggung) — 영어 위키백과 (English Wikipedia) |
| `src-web-enwiki-jeonju` | Jeonju — Wikipedia | 전주시 (Jeonju) — 영어 위키백과 (English Wikipedia) |
| `src-web-enwiki-jongno` | Jongno — Wikipedia | 종로 (Jongno) — 영어 위키백과 (English Wikipedia) |
| `src-web-enwiki-kaesong` | Kaesong — Wikipedia | 개성시 (Kaesong) — 영어 위키백과 (English Wikipedia) |
| `src-web-enwiki-kyongwon` | Kyongwon — Wikipedia | 경원 (Kyongwon) — 영어 위키백과 (English Wikipedia) |
| `src-web-enwiki-manwoldae` | Manwoldae — Wikipedia | 만월대 (Manwoldae) — 영어 위키백과 (English Wikipedia) |
| `src-web-enwiki-myeongdong` | Myeong-dong — Wikipedia | 명동 (Myeong-dong) — 영어 위키백과 (English Wikipedia) |
| `src-web-enwiki-nanjing` | Nanjing — Wikipedia | 난징 (Nanjing) — 영어 위키백과 (English Wikipedia) |
| `src-web-enwiki-seoulplaza` | Seoul Plaza — Wikipedia | 서울광장 (Seoul Plaza) — 영어 위키백과 (English Wikipedia) |
| `src-web-enwiki-sungkyunkwan` | Sungkyunkwan — Wikipedia | 성균관 (Sungkyunkwan) — 영어 위키백과 (English Wikipedia) |

### 발행처만 고친 것 (ko.wikipedia.org)

| 출처 | 자리 | 고치기 전 | 고친 뒤 |
|---|---|---|---|
| `src-c2-gap-ko-byeongcheon` | `sourceGroup` | ko.wikipedia | 위키백과 |
| `src-c2-gap-ko-byeongcheon` | `compiler` | ko.wikipedia | 위키백과 |
| `src-c2-ko-bang` | `sourceGroup` | ko.wikipedia | 위키백과 |
| `src-c2-ko-bang` | `compiler` | ko.wikipedia | 위키백과 |
| `src-c2-ko-bongodong` | `sourceGroup` | ko.wikipedia | 위키백과 |
| `src-c2-ko-bongodong` | `compiler` | ko.wikipedia | 위키백과 |
| `src-c2-ko-cheondogyo` | `sourceGroup` | ko.wikipedia | 위키백과 |
| `src-c2-ko-cheondogyo` | `compiler` | ko.wikipedia | 위키백과 |
| `src-c2-ko-cheongsanri` | `sourceGroup` | ko.wikipedia | 위키백과 |
| `src-c2-ko-cheongsanri` | `compiler` | ko.wikipedia | 위키백과 |
| `src-c2-ko-children` | `sourceGroup` | ko.wikipedia | 위키백과 |
| `src-c2-ko-children` | `compiler` | ko.wikipedia | 위키백과 |
| `src-c2-ko-gando` | `sourceGroup` | ko.wikipedia | 위키백과 |
| `src-c2-ko-gando` | `compiler` | ko.wikipedia | 위키백과 |
| `src-c2-ko-gumi` | `sourceGroup` | ko.wikipedia | 위키백과 |
| `src-c2-ko-gumi` | `compiler` | ko.wikipedia | 위키백과 |
| `src-c2-ko-gunsan-bank` | `sourceGroup` | ko.wikipedia | 위키백과 |
| `src-c2-ko-gunsan-bank` | `compiler` | ko.wikipedia | 위키백과 |
| `src-c2-ko-gunsan-customs` | `sourceGroup` | ko.wikipedia | 위키백과 |
| `src-c2-ko-gunsan-customs` | `compiler` | ko.wikipedia | 위키백과 |
| `src-c2-ko-hong` | `sourceGroup` | ko.wikipedia | 위키백과 |
| `src-c2-ko-hong` | `compiler` | ko.wikipedia | 위키백과 |
| `src-c2-ko-jayusi` | `sourceGroup` | ko.wikipedia | 위키백과 |
| `src-c2-ko-jayusi` | `compiler` | ko.wikipedia | 위키백과 |
| `src-c2-ko-jinju` | `sourceGroup` | ko.wikipedia | 위키백과 |
| `src-c2-ko-jinju` | `compiler` | ko.wikipedia | 위키백과 |
| `src-c2-ko-jrd` | `sourceGroup` | ko.wikipedia | 위키백과 |
| `src-c2-ko-jrd` | `compiler` | ko.wikipedia | 위키백과 |
| `src-c2-ko-kim-wonbong` | `sourceGroup` | ko.wikipedia | 위키백과 |
| `src-c2-ko-kim-wonbong` | `compiler` | ko.wikipedia | 위키백과 |
| `src-c2-ko-kpg` | `sourceGroup` | ko.wikipedia | 위키백과 |
| `src-c2-ko-kpg` | `compiler` | ko.wikipedia | 위키백과 |
| `src-c2-ko-modern-arch` | `sourceGroup` | ko.wikipedia | 위키백과 |
| `src-c2-ko-modern-arch` | `compiler` | ko.wikipedia | 위키백과 |
| `src-c2-ko-mulsan` | `sourceGroup` | ko.wikipedia | 위키백과 |
| `src-c2-ko-mulsan` | `compiler` | ko.wikipedia | 위키백과 |
| `src-c2-ko-park-eunsik` | `sourceGroup` | ko.wikipedia | 위키백과 |
| `src-c2-ko-park-eunsik` | `compiler` | ko.wikipedia | 위키백과 |
| `src-c2-ko-sanmi` | `sourceGroup` | ko.wikipedia | 위키백과 |
| `src-c2-ko-sanmi` | `compiler` | ko.wikipedia | 위키백과 |
| `src-c2-ko-svobodny` | `sourceGroup` | ko.wikipedia | 위키백과 |
| `src-c2-ko-svobodny` | `compiler` | ko.wikipedia | 위키백과 |
| `src-c2-ko-tapgol` | `sourceGroup` | ko.wikipedia | 위키백과 |
| `src-c2-ko-tapgol` | `compiler` | ko.wikipedia | 위키백과 |
| `src-c2-ko-uiyeoldan` | `sourceGroup` | ko.wikipedia | 위키백과 |
| `src-c2-ko-uiyeoldan` | `compiler` | ko.wikipedia | 위키백과 |
| `src-hs-ko-imhaejeon` | `sourceGroup` | Wikimedia Foundation | 위키백과 |
| `src-hs-ko-imhaejeon` | `compiler` | Wikimedia Foundation | 위키백과 |
| `src-hs-ko-sillabang` | `sourceGroup` | Wikimedia Foundation | 위키백과 |
| `src-hs-ko-sillabang` | `compiler` | Wikimedia Foundation | 위키백과 |
| `src-kowiki-cheongju` | `sourceGroup` | ko.wikipedia.org | 위키백과 |
| `src-kowiki-cheongju` | `compiler` | ko.wikipedia.org | 위키백과 |
| `src-kowiki-gwanmunseong` | `sourceGroup` | ko.wikipedia.org | 위키백과 |
| `src-kowiki-gwanmunseong` | `compiler` | ko.wikipedia.org | 위키백과 |
| `src-kowiki-iksan` | `sourceGroup` | ko.wikipedia.org | 위키백과 |
| `src-kowiki-iksan` | `compiler` | ko.wikipedia.org | 위키백과 |
| `src-kowiki-jeonju` | `sourceGroup` | ko.wikipedia.org | 위키백과 |
| `src-kowiki-jeonju` | `compiler` | ko.wikipedia.org | 위키백과 |
| `src-kowiki-namhansanseong` | `sourceGroup` | ko.wikipedia.org | 위키백과 |
| `src-kowiki-namhansanseong` | `compiler` | ko.wikipedia.org | 위키백과 |
| `src-kowiki-woljeonggyo` | `sourceGroup` | ko.wikipedia.org | 위키백과 |
| `src-kowiki-woljeonggyo` | `compiler` | ko.wikipedia.org | 위키백과 |
| `src-kowiki-wonju` | `sourceGroup` | ko.wikipedia.org | 위키백과 |
| `src-kowiki-wonju` | `compiler` | ko.wikipedia.org | 위키백과 |
