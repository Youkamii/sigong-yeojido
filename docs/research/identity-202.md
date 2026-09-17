# 같은 이름 중복 기록 묶음 심사 (#202)

#200 이 개체 이름을 정리하다가 찾아낸 "같은 유형·같은 이름인데 `sameEntityAs` 로 묶이지 않은" 묶음을 하나씩 심사한다.
행정구역이 HGIS 번호로만 갈리는 589묶음은 대상이 아니다(`docs/research/entity-labels-200.md` '충돌' 절).
대상은 나머지 125묶음이다. #200 문서가 적은 121묶음에 더해, 라벨에 `CHGIS` 가 든 4묶음(강원도·낙랑군·임둔군·현도군)이
문자열 검사에서 HGIS 쪽으로 새 있었다. 이 4묶음도 HGIS 번호로만 갈리는 행정구역이 아니라 같은 대상의 중복 기록이므로
같이 심사한다.

## 판정 기준 (심사 시작 전에 정한다)

세 값 중 하나로만 판정한다.

**동일** — 아래를 모두 만족할 때만.

1. 유형이 같다(`sameEntityAs` 는 같은 유형끼리만 화면 병합에 쓰인다 — `services/chronicle_query.py:39`).
2. 가리키는 대상이 하나로 특정된다. 사람은 한자 이름·생몰·관직이, 사건은 연도·장소·주체가, 장소는 위치·시기가
   서로 맞부딪히지 않고 최소 한 가지가 적극적으로 일치한다.
3. 두 기록의 연도·장소가 **다르지 않다**. 한쪽에만 값이 있고 다른 쪽이 비어 있는 것은 어긋남이 아니다.
4. 근거로 인용할 문장이 실제 chunk 원문에 있다(`services/validate.py:557` 의 quote 검사를 통과해야 한다).

**별개** — 이름만 같고 대상이 다르다. 연도가 다른 같은 종류의 사건(예: 신라 경도 지진 100·304·779),
같은 이름의 다른 사람, 같은 이름의 다른 장소, 시기가 겹치지 않는 별도 행정 단위가 여기에 든다.

**보류** — 같을 법하나 확정할 근거가 부족하다. 특히:

- 껍데기 개체라 주장이 거의 없어 연도·장소를 대조할 수 없다.
- 상위·하위 관계가 의심된다(사건 전체 vs 그 안의 한 국면, 군(郡) vs 같은 이름의 치소).
- 시기 구분이 살아 있는 기록(예: CHGIS 재구성처럼 기간이 나뉜 도형)이라 묶으면 시기 정보가 뭉개진다.
- 두 번째 반증 검토에서 "다른 대상일 수 있다"가 성립했다.

근거는 묶음마다 한 줄, `파일:줄` 또는 주장 id 로 적는다.

## 정본 선택 규칙 (#192 와 같다)

`services/chronicle_query.py:44` 의 `priority()` 그대로다. 앞선 것이 정본이다.

1. `person-encykorea-…-e0\d+` (백과 항목 번호가 붙은 인물)
2. `person-encykorea-` · `place-encykorea-` 로 시작하는 id
3. id 에 `-hs-` 가 든 것 (교과서 계열)
4. 주장 수가 많은 것
5. 그래도 같으면 id 문자열 순서

주장 파일은 `data/claims/<사료>/identity-202/` 에 두고 `origin: ai` · `status: draft` 로 적는다.
데이터의 개체를 합치지 않는다 — 켜진 사료에 따라 화면에서만 하나로 보이는 표시 병합이다(`docs/02-schema.md` §10).

## 결과

125묶음을 모두 심사했다. **동일 72 · 별개 5 · 보류 48**.
동일로 판정한 묶음에서 `syj:sameEntityAs` 주장 **82건**을 만들었고, 파일은 82개다 (같은 chunk 를 인용하는 주장은 한 파일에 모았다).

| 유형 | 동일 | 별개 | 보류 |
|---|---:|---:|---:|
| Event | 39 | 3 | 7 |
| Place | 31 | 1 | 38 |
| Person | 1 | 1 | 1 |
| Polity | 1 | 0 | 2 |

심사는 Claude Opus 5 하위 에이전트 다섯이 25묶음씩 나눠 맡았다. 각자 판정을 내린 뒤 동일로 본 묶음만
"이 둘이 다른 대상일 가능성"을 찾는 2차 반증 검토를 한 번 더 거쳤다. 인용문은 전부 `data/sources/<사료>/chunks.jsonl`
원문과 대조해 실제로 있는 문장인지 확인했다.

리더가 마지막에 한 번 더 걸렀다. 주장이 **한 건도 없는** 개체(주어로도 목적어로도 나오지 않는 껍데기)가 낀 쌍은
연도·장소를 대조할 길이 없으므로 위 판정 기준의 '보류' 첫 항목을 그대로 적용해 내렸다. 이 때문에 6묶음이
동일에서 보류로 내려갔고(개경 나성 축조·거란의 2차 침입·거란의 3차 침입·귀주 대첩·조선건국준비위원회 결성·현종의 나주 피난),
'천태종 개창'은 세 개체 중 껍데기가 낀 한 쌍만 빼고 나머지 한 쌍을 남겼다.

## 묶음별 판정

| 묶음 | 유형 | 이름 | 판정 | 개체 | 근거 |
|---|---|---|---|---|---|
| G001 | Event | 5·18 민주화 운동 | 동일 | `event-hs-c4-518` / `event-hs-c5-518-movement` | 두 기록 모두 1980년 5월 18~27일 광주 사건(event-hs-c4-518 occurredIn c4-518-def / event-hs-c5-518-movement 518-1980)으로 연도·장소가 일치한다 |
| G002 | Event | 갑오개혁 | 동일 | `event-encykorea-gabo-gaehyeok-1894` / `event-hs-gabo` | 양쪽 모두 '1894년(고종 31) 7월부터 1896년 2월까지' 같은 정의 문장을 인용한다 |
| G003 | Event | 강조의 정변 | 동일 | `event-encykorea-gangjo-jeongbyeon-1009` / `event-hs-ge2-gangjo-coup` | 양쪽 모두 1009년 강조가 목종을 폐하고 현종을 옹립한 정변이다(gangjo-1009 / goryeosa kr_003_0330_0020_0020) |
| G004 | Event | 개경 나성 축조 | 보류 | `event-ge3-12` / `event-hs-naseong` | event-ge3-12는 껍데기지만 라벨이 동일하고 event-hs-naseong의 1029년 나성 기사(goryeosa kr_005_0070_0120_0020)와 어긋나는 값이 없다 / 2차 확인: 한쪽이 주장 0건인 껍데기라 연도·장소를 대조할 수 없어 보류로 내림 |
| G005 | Event | 거란의 2차 침입 | 보류 | `event-ge3-02` / `event-hs-khitan-2nd` | event-ge3-02는 껍데기지만 라벨이 같고 event-hs-khitan-2nd의 1010년 침입 기록과 충돌하는 값이 없다 / 2차 확인: 한쪽이 주장 0건인 껍데기라 연도·장소를 대조할 수 없어 보류로 내림 |
| G006 | Event | 거란의 3차 침입 | 보류 | `event-ge3-08` / `event-hs-khitan-3rd` | event-ge3-08은 껍데기지만 라벨이 같고 event-hs-khitan-3rd의 1018~1019 기록과 충돌이 없다 / 2차 확인: 한쪽이 주장 0건인 껍데기라 연도·장소를 대조할 수 없어 보류로 내림 |
| G007 | Event | 경복궁 중건 | 동일 | `event-jl-gyeongbokgung-junggeon-1865` / `event-mt1-gyeongbok-junggeon` | 두 기록이 같은 chunk(gbg-1868, gbg-daebi)를 인용하며 1865~1868 경복궁 중건으로 일치한다 |
| G008 | Event | 고구려 멸망 | 동일 | `event-goguryeo-fall-668` / `event-hs-sg5-goguryeo-fall` | 양쪽 모두 668년 9월 평양성 함락(chunk_scenes-103_ancient_scenes_bojang-fall)을 근거로 삼는다 |
| G009 | Event | 고려 건국 | 동일 | `event-goryeo-founding-918` / `event-hs-goryeo-founding` | 양쪽 모두 918년 포정전 즉위·국호 고려를 근거로 한다(gtaejo-founding / goryeosa kr_001_0020_0010_0010) |
| G010 | Event | 관산성 전투 | 동일 | `event-gwansanseong-jeontu-554` / `event-hs4-gwansanseong` | 양쪽 모두 같은 chunk(gwansan-year)의 554년 관산성 전투를 인용한다 |
| G011 | Event | 귀주 대첩 | 보류 | `event-ge3-10` / `event-hs-gwiju-daecheop` | event-ge3-10은 껍데기지만 라벨이 같고 event-hs-gwiju-daecheop의 1019년 귀주 기록과 충돌이 없다 / 2차 확인: 한쪽이 주장 0건인 껍데기라 연도·장소를 대조할 수 없어 보류로 내림 |
| G012 | Event | 기묘사화 | 동일 | `event-encykorea-gimyo-sahwa-1519` / `event-hs-gimyo-sahwa` | 두 기록이 같은 chunk(je-gm-defi, je-gm-cause)의 1519년 조광조 화 사건을 인용한다 |
| G013 | Event | 기벌포 전투 | 동일 | `event-gibeolpo-676` / `event-hs-sg5-gibeolpo` | 양쪽 모두 같은 chunk(munmu-gibeolpo)의 676년 시득-설인귀 기벌포 전투를 인용한다 |
| G014 | Event | 대한제국 선포 | 동일 | `event-encykorea-daehanjeguk-proclaimed-1897` / `event-mt3-daehanjeguk` | 양쪽 모두 같은 chunk(daehan-proclaim)의 1897년 10월 12일 황제국 선포를 인용한다 |
| G015 | Event | 발해 멸망 | 동일 | `event-balhae-fall-926` / `event-hs-nbg3-balhae-fall` | 양쪽 모두 926년 발해 멸망(balhae-end / balhae-926)으로 연도가 일치한다 |
| G016 | Event | 백두산정계비 건립 | 동일 | `event-hs4-baekdusan-stele` / `event-jl-baekdusan-jeonggyebi-1712` | 두 기록 모두 1712년 백두산정계비 건립이며 같은 chunk(bd-def)를 공유한다 |
| G017 | Event | 백제 멸망 | 동일 | `event-baekje-fall-660` / `event-hs-sg5-baekje-fall` | 양쪽 모두 같은 chunk(uija-siege, uija-sojeongbang)의 660년 사비성 함락을 인용한다 |
| G018 | Event | 벽골제 증축 | 동일 | `event-byeokgolje-790` / `event-ced-e790` | 두 기록이 같은 chunk_samguksagi_sg_010_0020_0280의 '増築碧骨堤' 기사를 근거로 삼고 둘 다 790년이다 |
| G019 | Event | 별무반 설치 | 동일 | `event-encykorea-byeolmuban-seolchi-1104` / `event-hs-byeolmuban` | 양쪽 모두 1104년 윤관의 별무반 설치다(byeolmuban-seolchi / goryeosa kr_081_0010_0020_0050_0700) |
| G020 | Event | 병인박해 | 동일 | `event-encykorea-byeongin-bakhae-1866` / `event-mt1-byeongin-bakhae` | 두 기록 모두 같은 chunk(byeongin-bakhae-defi, -hayaa)의 1866~1873 천주교 박해를 인용한다 |
| G021 | Event | 병인양요 | 동일 | `event-jl-byeongin-yangyo-1866` / `event-mt1-byeongin-yangyo` | 두 기록이 같은 chunk(by-def, by-enter, by-repel)의 1866년 강화도 프랑스군 침입을 인용한다 |
| G022 | Event | 병자호란 | 동일 | `event-encykorea-byeongja-horan-1636` / `event-hs-jl2-byeongja` | 두 기록 모두 같은 chunk(bj-def)의 1636년 12월~1637년 1월 청의 제2차 침입을 인용한다 |
| G023 | Event | 사비 천도 | 보류 | `event-hs-s3-sabi-move` / `event-sabi-transfer-sy` | event-hs-s3-sabi-move는 주장 0개 껍데기이고 event-sabi-transfer-sy는 '사료별 사건 서술을 구별하기 위한 이름'으로 event-sabi-transfer-sg와 sameEventAs로 묶인 사료별 기록이라 층위가 다르다(data/entities/event/event-sabi-transfer-sg.md) |
| G024 | Event | 살수대첩 | 동일 | `event-hs4-salsu` / `event-salsu-daecheop-612` | 두 기록이 같은 chunk(salsu-main)의 612년 7월 24일 살수 전투를 인용한다 |
| G025 | Event | 삼년산성 축조 | 동일 | `event-samnyeon-470` / `syj135-event-samnyeonsanseong-chukjo-470` | event-samnyeon-470(삼국사기 築三年山城)과 syj135 기록 모두 470년 삼년산성 축조를 가리킨다 |
| G026 | Event | 숙종의 치세 | 별개 | `event-hs-goryeo-sukjong` / `event-hs3-sukjong-reign` | event-hs-goryeo-sukjong 은 고려 숙종(1095~1105)이고 event-hs3-sukjong-reign 은 조선 후기 교육과정 묶음 소속이다(data/research/curriculum-joseon-late/joseon-late-3/review.json 에서만 참조) — 다른 왕의 치세다 |
| G027 | Event | 신라 경도 지진 | 별개 | `event-ced-d100` / `event-ced-d304` / `event-ced-d779` | 같은 종류 사건이 100·304·779년으로 연도가 모두 다르다(data/entities/event/event-ced-d100.md, -d304.md, -d779.md) |
| G028 | Event | 신미양요 | 동일 | `event-jl-sinmi-yangyo-1871` / `event-mt1-sinmi-yangyo` | 둘 다 1871년 미국 아시아함대의 강화도 침입·광성보 전투를 같은 원문(chunk_scenes-103_joseon_late_scenes_sm-def)에서 기술한다 |
| G029 | Event | 신유박해 | 동일 | `event-encykorea-sinyu-bakhae-1801` / `event-hs-jl5-sinyu` | 둘 다 1801년(순조 1) 천주교도 박해사건이고 새남터 처형 기술까지 같은 원문에서 온다 |
| G030 | Event | 아관파천 | 동일 | `event-agwan-pacheon-1896` / `event-mt3-agwan` | 둘 다 1896년 2월 11일 러시아공사관 이어를 같은 원문(chunk_scenes-103_modern_scenes_agwan-meta)으로 적는다 |
| G031 | Event | 연개소문의 정변 | 동일 | `event-hs-sg5-yeon-coup` / `event-yeongaesomun-coup-642` | 둘 다 642년 평양성에서 연개소문이 영류왕을 시해하고 보장왕을 세운 정변이다 |
| G032 | Event | 을묘왜변 | 동일 | `event-hs-eulmyo-waebyeon` / `event-je-eulmyo-waebyeon-1555` | 둘 다 1555년(명종 10) 왜구의 강진·진도 침입과 달량포 포위를 같은 백과 원문으로 적는다 |
| G033 | Event | 을미사변 | 동일 | `event-eulmi-sabyeon-1895` / `event-hs-eulmi-incident` | 둘 다 1895년 10월 8일 새벽 경복궁 기습과 왕후 살해를 같은 원문으로 적는다 |
| G034 | Event | 이자겸의 난 | 동일 | `event-encykorea-ijagyeom-nan-1126` / `event-hs-ge4-ijagyeom-nan` | 둘 다 1126년(인종 4) 이자겸이 척준경의 군사력으로 일으킨 난이다 |
| G035 | Event | 인조반정 | 동일 | `event-encykorea-injo-banjeong-1623` / `event-hs-jl2-injo-banjeong` | 둘 다 1623년 3월 13일 밤 창의문 돌파·창덕궁 진입을 같은 백과 원문으로 적는다 |
| G036 | Event | 임오군란 | 동일 | `event-imo-gullan-1882` / `event-mt1-imo-gullan` | 둘 다 1882년 6월 훈국병 군료분쟁에서 발단한 사건을 같은 정의 문장(chunk_scenes-103_modern_scenes_imo-def)으로 적는다 |
| G037 | Event | 임진왜란 | 동일 | `event-encykorea-imjinwaeran` / `event-hs-imjin-war` / `event-hs-jl1-imjin-war` | 세 기록 모두 1592~1598년 일본의 침입 전쟁 전체를 가리키며 같은 기간 문장(chunk_period92_joseon-modern_imjin-span 등)을 인용한다 |
| G038 | Event | 정묘호란 | 동일 | `event-hs-jl2-jeongmyo` / `event-jl-jeongmyo-horan-1627` | 둘 다 1627년(인조 5) 후금 침입 전쟁이며 안주성·강화도 피난까지 같은 원문에서 온다 |
| G039 | Event | 제너럴셔먼호 사건 | 동일 | `event-mt1-sherman` / `event-syj135-general-sherman-1866` | 둘 다 1866년 7월 평양 대동강에서 제너럴셔먼호가 소각된 사건을 같은 사료(src-syj135-aks-sherman)로 적는다 |
| G040 | Event | 조선건국준비위원회 결성 | 보류 | `event-geonjun-1945` / `event-hs-c1-geonjun` | event-hs-c1-geonjun 은 라벨만 있는 껍데기지만(data/entities/event/event-hs-c1-geonjun.md) 조선건국준비위원회 결성은 1945년 여운형 주도의 단일 사건이라 event-geonjun-1945 와 어긋나는 값이 없다 / 2차 확인: 한쪽이 주장 0건인 껍데기라 연도·장소를 대조할 수 없어 보류로 내림 |
| G041 | Event | 중종반정 | 동일 | `event-encykorea-jungjong-banjeong-1506` / `event-hs-jungjong-banjeong` | 둘 다 1506년(연산군 12) 성희안·박원종 등이 연산군을 폐하고 진성대군을 세운 사건을 같은 원문으로 적는다 |
| G042 | Event | 천리장성 축조 | 별개 | `event-encykorea-cheollijangseong-chukjo-1033-1044` / `event-gg-jangseong-631` / `event-hs-cheonri-jangseong` | event-gg-jangseong-631 은 삼국사기 631년 고구려 천리장성(chunk_samguksagi_sg_020_0030_0160)이고 나머지 둘은 고려 1033~1044년 장성이라 연대·주체가 다르다 |
| G043 | Event | 천태종 개창 | 동일 | `event-ge3-23` / `event-hs-cheontaejong` / `event-hs-ge4-uicheon-cheontae` | event-hs-cheontaejong 과 event-hs-ge4-uicheon-cheontae 는 1097년 국청사 천태종 개립을 같은 원문(chunk_period96_goryeo_early_uicheon-1097)으로 적고, event-ge3-23 도 고려 전기(ge3) 묶음 소속이라 같은 사건이다 (주장이 하나도 없는 껍데기 event-ge3-23 는 대조할 값이 없어 이 쌍만 보류) |
| G044 | Event | 태학 설립 | 동일 | `event-encykorea-taehak-founded-372` / `event-gg-taehak-372` / `event-hs-sg2-taehak` | 셋 모두 372년 고구려 소수림왕대 국내성 태학 설립을 가리킨다(chunk_scenes-103_ancient_scenes_taehak-year, chunk_samguksagi_sg_018_0030_0030) |
| G045 | Event | 평양 천도 | 동일 | `event-gg-pyongyang-427` / `event-hs-sg2-pyongyang-move` | 둘 다 삼국사기 장수왕 15년(427) '移都平壤' 기사(chunk_samguksagi_sg_018_0060_0100)를 근거로 한다 |
| G046 | Event | 현종의 나주 피난 | 보류 | `event-ge3-04` / `event-hs-hyeonjong-naju` | event-ge3-04 는 껍데기지만 고려 전기(ge3) 묶음 소속이고, event-hs-hyeonjong-naju 의 1011년 거란 침입 피난(chunk_goryeosa_kr_004_0040_0010_0070)과 어긋나는 값이 없다 / 2차 확인: 한쪽이 주장 0건인 껍데기라 연도·장소를 대조할 수 없어 보류로 내림 |
| G047 | Event | 홍경래의 난 | 동일 | `event-hs-jl5-hong-gyeongnae` / `event-jl-honggyeongrae-nan-1811` | 둘 다 1811년(순조 11) 홍경래·우군칙의 난이고 정주성 퇴각·1811년 12월~이듬해 4월 기간까지 같은 원문에서 온다 |
| G048 | Event | 황산벌 전투 | 동일 | `event-hs-sg5-hwangsanbeol` / `event-hwangsanbeol-jeontu-660` | 둘 다 660년 황산벌(논산 연산)에서 벌어진 백제군·신라군 전투를 같은 정의 문장(chunk_scenes-103_ancient_scenes_hwangsan-def)으로 적는다 |
| G049 | Event | 훈민정음 창제 | 동일 | `event-encykorea-hunminjeongeum-changje-1443` / `event-hs-hunminjeongeum-creation` | 둘 다 세종이 1443년(세종 25) 겨울에 훈민정음을 창제했다는 같은 문장(chunk_period92_joseon-modern_hunmin-1443)을 근거로 한다 |
| G050 | Person | 김무력 | 동일 | `person-gim-muryeok` / `person-kim-mulyeok` | person-kim-mulyeok 은 단양적성비의 '沙喙部武力智阿干支', person-gim-muryeok 은 554년 관산성의 신주군주 김무력(data/claims/anc-enc-gwansanseong/scenes-103/chunk_scenes-103_ancient_scenes_gwansan-kimmuryeok.md)으로 6세기 중엽 신라의 같은 무력이다 |
| G051 | Person | 염장 | 보류 | `person-encykorea-yeomjang` / `person-hs-yeomjang` | 두 개체 모두 주장 0건(data/entities/person/person-encykorea-yeomjang.md, person-hs-yeomjang.md) — 인용할 quote 가 없어 확정 불가 |
| G052 | Person | 조영규 | 별개 | `person-je-jo-yeonggyu` / `person-syj103-jo-yeonggyu` | 한자·시대가 어긋난다: 趙英珪(이방원 문객, 1392) vs 趙英圭(1592년 양산군수, chunk_scenes-103_harbors_and_presence_dn-jo) |
| G053 | Place | 강원도 | 보류 | `place-hgis-admin-156701` / `place-hs-gangwon` | place-hgis-admin-156701 은 1917~1945 기간이 살아 있는 HGIS 경계 기록(chunk_hgis-admin-156701)이라 묶으면 시기 정보가 뭉개진다 |
| G054 | Place | 강화 연무당 | 동일 | `place-ganghwa-yeonmudang` / `place-mt1-yeonmudang` | 강화 읍내의 단일 유적(연무당 터)이고 어긋나는 값이 없다; place-mt1-yeonmudang 좌표 37.75111/126.48472(chunk_curriculum-modern-transition_modern-transition-1_geo-goryeogungji) |
| G055 | Place | 개경 북산 | 동일 | `place-ency-gaegyeong-buksan` / `place-hs-gaegyeong-buksan` | 둘 다 개경 송악산 자락의 북산 한 곳이고 충돌값이 없다; place-hs-gaegyeong-buksan 주장이 안화사·송악산과 연결(chunk_curriculum-goryeo-late_goryeo-late-1_anhwasa-songak) |
| G056 | Place | 경주 월성 | 동일 | `place-gyeongju-wolseong` / `place-hs-gyeongju-wolseong` / `place-hs-nbg3-wolseong` / `place-hs-sg5-wolseong` / `place-hs-wolseong` / `place-hs4-wolseong` | 여섯 기록의 좌표가 모두 35.83083/129.22611 로 일치한다(chunk_curriculum-samguk_samguk-2_geo-wolseong 등) |
| G057 | Place | 고구려 | 보류 | `place-cliopatria-01262` / `place-cliopatria-01339` / `place-cliopatria-01368` / `place-cliopatria-01384` / `place-cliopatria-01474` / `place-cliopatria-01585` / `place-cliopatria-01686` / `place-cliopatria-01710` / `place-cliopatria-01818` / `place-cliopatria-01831` / `place-cliopatria-01852` / `place-cliopatria-01857` / `place-cliopatria-01868` / `place-cliopatria-01908` / `place-cliopatria-01934` / `place-cliopatria-01945` / `place-cliopatria-02135` / `place-cliopatria-02165` / `place-cliopatria-02354` / `place-cliopatria-02524` / `place-cliopatria-02565` / `place-cliopatria-02687` / `place-cliopatria-02718` / `place-cliopatria-02925` | Cliopatria 시기별 분할 도형 24건(면적 93,626~390,513 로 제각각, chunk_cliopatria-01262 등) — 묶으면 시기 정보가 뭉개진다 |
| G058 | Place | 고려 | 보류 | `place-cliopatria-04120` / `place-cliopatria-04138` / `place-cliopatria-04218` / `place-cliopatria-05360` / `place-cliopatria-05424` / `place-cliopatria-05955` / `place-cliopatria-06103` / `place-cliopatria-07109` / `place-cliopatria-07258` / `place-cliopatria-07312` | Cliopatria 시기별 분할 도형 10건(면적 81,546~208,184, chunk_cliopatria-04120 등) |
| G059 | Place | 고조선 | 보류 | `place-cliopatria-00986` / `place-cliopatria-01120` | Cliopatria 시기별 분할 도형 2건(chunk_cliopatria-00986 / 01120, 면적·해시 다름) |
| G060 | Place | 고창 죽림리 고인돌군 | 보류 | `place-hs-pg1-gochang` / `place-hs-pg1-scene-gochang` | place-hs-pg1-scene-gochang 은 라벨 자체가 '고창고인돌박물관 표시점'이라 유적 전체와 대리 표시점의 상하 관계가 의심된다 |
| G061 | Place | 공주 명학소 | 동일 | `place-hs-myeonghakso` / `place-lg128-gongju-myeonghakso` | 둘 다 망이·망소이 난의 공주 명학소(鳴鶴所) 한 곳이고, 고려사가 충순현 승격을 적는다(chunk_goryeosa_kr_019_0110_0060_0020) |
| G062 | Place | 관산성 | 동일 | `place-gwansanseong` / `place-hs4-gwansanseong` | 두 기록 모두 충청북도 옥천을 가리킨다(chunk_scenes-103_ancient_scenes_gwansan-place, place-hs4-gwansanseong 좌표 36.3008/127.5686=옥천) |
| G063 | Place | 구주성 | 동일 | `place-encykorea-gujuseong` / `place-gl2-gwijuseong` | 구주(龜州)는 지금의 평북 구성이며 place-gl2-gwijuseong 좌표 39.967/125.167 이 구성이다(chunk_curriculum-goryeo-late_goryeo-late-2_gl2-kusong-geo) |
| G064 | Place | 구지봉 | 동일 | `place-hs-gujibong` / `place-sgy-gujibong` / `place-syj136-gujibong` | 좌표 35.243194/128.875889 와 '경상남도 김해시 구산동'(chunk_scenes-136_oral_traditions_syj136-gujibong-place)이 같은 곳을 가리킨다 |
| G065 | Place | 국립중앙박물관 | 동일 | `place-gl3-nmk` / `place-hs4-jungang-museum` | 좌표가 37.5239/126.9803 과 37.52393/126.980493 로 사실상 같은 지점이다(chunk_curriculum-goryeo-late_goryeo-late-3_gl3-geo-nmk) |
| G066 | Place | 금성 | 보류 | `place-geumseong` / `place-sgy-geumseong` | place-geumseong 은 라벨 '금성'뿐인 껍데기(data/entities/place/place-geumseong.md) — 신라 왕성 금성 외 나주 금성 등 동명 지명이 있어 특정 불가 |
| G067 | Place | 나주 | 보류 | `place-naju` / `place-naju-station-1929` / `place-syj135-naju-1237` | 세 개체 모두 주장 0건이고 place-naju-station-1929 는 통학열차 도착지(역)라 상하 관계가 의심된다 — 인용할 quote 도 없다 |
| G068 | Place | 낙랑군 | 보류 | `place-chgis-hvd-112642` / `place-encykorea-nangnanggun` / `place-nangnang` | place-chgis-hvd-112642 는 기간(-108~-83)이 살아 있는 CHGIS 재구성 기록(chunk_chgis-hvd-112642)이라 묶으면 시기 정보가 뭉개진다 |
| G069 | Place | 단양 금굴 유적 | 동일 | `place-hs-pg1-geumgul` / `place-hs-pg1-scene-paleo` | 같은 교과 사료 계열의 단양 금굴 유적 한 곳이고 좌표 36.99639/128.3575 외 충돌값이 없다(chunk_curriculum-prehistoric-gojoseon_prehistoric-gojoseon-1_geo-geumgul) |
| G070 | Place | 대한민국 | 보류 | `place-cliopatria-14878` / `place-cliopatria-14978` / `place-cliopatria-15536` | Cliopatria 시기별 분할 도형 3건(면적 102,811 vs 105,176, chunk_cliopatria-14878 등) |
| G071 | Place | 대한제국 | 보류 | `place-cliopatria-13762` / `place-cliopatria-13785` / `place-cliopatria-13846` / `place-cliopatria-13886` | Cliopatria 시기별 분할 도형 4건(chunk_cliopatria-13762 등, 경계 해시 상이) |
| G072 | Place | 동모산 | 보류 | `place-balhae-dongmosan` / `place-dongmosan` | 두 개체 모두 주장 0건(place-balhae-dongmosan.md, place-dongmosan.md) — 인용할 quote 가 없다 |
| G073 | Place | 마산 | 보류 | `place-encykorea-masan` / `place-hs-c3-masan` / `place-hs-masan` / `place-masan-1960` | 정본 후보 place-encykorea-masan 과 place-masan-1960 이 모두 주장 0건이라 짝마다 인용할 quote 를 댈 수 없다 |
| G074 | Place | 마한 | 보류 | `place-cliopatria-01146` / `place-cliopatria-01736` | Cliopatria 시기별 분할 도형 2건(chunk_cliopatria-01146 / 01736) |
| G075 | Place | 매소성 | 동일 | `place-hs-sg5-maesoseong` / `place-syj122-maesoseong` | 둘 다 675년 매소성 전투의 성 한 곳이고, place-hs-sg5-maesoseong 좌표 38.00848/127.10086(chunk_curriculum-samguk_samguk-5_geo-cheongsan) 외 충돌값이 없다 |
| G076 | Place | 밀양 | 보류 | `place-hs-miryang` / `place-syj136-miryang` | data/entities/place/place-syj136-miryang.md 는 주장 0개 껍데기이고 라벨이 '밀양부 관아'라 고을 전체 vs 치소 관계가 의심된다 |
| G077 | Place | 발해 | 보류 | `place-cliopatria-02987` / `place-cliopatria-03087` / `place-cliopatria-03435` / `place-cliopatria-03536` / `place-cliopatria-04068` / `place-cliopatria-04124` | place-cliopatria-02987~04124 는 시기별로 잘린 Cliopatria 재구성 도형(각 syj:hasBoundaryRecord 1건)이라 묶으면 시기 정보가 뭉개진다 |
| G078 | Place | 백제 | 보류 | `place-cliopatria-01752` / `place-cliopatria-01851` / `place-cliopatria-01869` / `place-cliopatria-02134` / `place-cliopatria-02396` / `place-cliopatria-02823` | place-cliopatria-01752~02823 모두 시기별 Cliopatria 경계 도형(chunk_cliopatria-01752 등)이라 기간 구분이 살아 있는 기록이다 |
| G079 | Place | 변한 | 보류 | `place-cliopatria-01128` / `place-cliopatria-02244` / `place-cliopatria-02375` | place-cliopatria-01128/02244/02375 는 시기별 Cliopatria 경계 도형이라 묶으면 기간 정보가 사라진다 |
| G080 | Place | 부산 | 보류 | `place-encykorea-busan` / `place-hs-c3-busan` | data/entities/place/place-encykorea-busan.md·place-hs-c3-busan.md 둘 다 주장 0개라 인용할 원문 문장이 없다 |
| G081 | Place | 부산포 | 보류 | `place-hs-busanpo` / `place-hs-jl2-busanpo` / `place-je-busanpo` | place-hs-busanpo(35.10389/129.07889)와 place-hs-jl2-busanpo(35.10056/129.03278)의 좌표가 어긋나고 place-je-busanpo 는 주장 0개다 |
| G082 | Place | 북한 | 보류 | `place-cliopatria-14876` / `place-cliopatria-14973` / `place-cliopatria-15505` | place-cliopatria-14876/14973/15505 는 시기별 Cliopatria 경계 도형이다 |
| G083 | Place | 북한산성 | 동일 | `place-bukhansanseong` / `place-jl2-bukhansanseong` | data/entities/place/place-jl2-bukhansanseong.md 의 표시 좌표 37.647056/126.973222 가 place-bukhansanseong 의 syj:locatedAt 값과 소수점까지 같다 |
| G084 | Place | 사도성 | 보류 | `place-sadoseong` / `place-sgy-sadoseong` | data/entities/place/place-sgy-sadoseong.md 는 주장 0개 껍데기라 place-sadoseong 의 293년 개축 기록과 대조할 값이 없다 |
| G085 | Place | 삼년산성 | 동일 | `place-samnyeonsanseong` / `syj135-place-samnyeonsanseong` | place-samnyeonsanseong 과 syj135-place-samnyeonsanseong 이 모두 36.48917/127.74167(보은 오정산)을 가리킨다 |
| G086 | Place | 서울 | 보류 | `place-encykorea-seoul` / `place-seoul-1910` | data/entities/place/place-encykorea-seoul.md·place-seoul-1910.md 둘 다 주장 0개라 인용할 원문 문장이 없다 |
| G087 | Place | 서울 암사동 유적 | 동일 | `place-hs-pg1-amsadong` / `place-hs-pg1-scene-amsa` / `syj135-place-amsadong` | place-hs-pg1-scene-amsa 와 syj135-place-amsadong 이 37.56056/127.13028 로 일치하고 place-hs-pg1-amsadong 은 같은 교육과정 묶음의 동일 라벨 껍데기다 |
| G088 | Place | 시흥 오이도 유적 | 동일 | `place-hs-pg1-oido` / `place-hs-pg1-scene-jeulmun` | place-hs-pg1-scene-jeulmun 이 37.34556/126.69333 오이도 좌표를 갖고 place-hs-pg1-oido 는 같은 교육과정 묶음의 동일 라벨 껍데기다 |
| G089 | Place | 신라 | 보류 | `place-cliopatria-01810` / `place-cliopatria-02261` / `place-cliopatria-02358` / `place-cliopatria-02387` / `place-cliopatria-02881` / `place-cliopatria-02900` / `place-cliopatria-02919` | place-cliopatria-01810~02919 는 시기별 Cliopatria 경계 도형이라 묶으면 기간 정보가 사라진다 |
| G090 | Place | 신라 왕경 | 보류 | `place-gyeongdo` / `place-silla-capital` | place-silla-capital 의 근거는 광개토대왕비 chunk_gwanggaeto_2-08 의 '從男居城至新羅城' 하나뿐이라 이 新羅城이 경주 왕경인지 확정되지 않는다 |
| G091 | Place | 아사달 | 보류 | `place-hs-pg1-asadal` / `place-hs-pg1-scene-founding` | place-hs-pg1-scene-founding 은 아사달을 왕검성·평양(39.01667/125.7475)으로 비정해 묶은 기록이고 place-hs-pg1-asadal 은 주장 0개라, 비정이 갈리는 두 대상을 뭉갤 수 있다 |
| G092 | Place | 안동 도산서원 | 동일 | `place-je-dosanseowon` / `place-mt1-dosan-seowon` | place-je-dosanseowon 과 place-mt1-dosan-seowon 의 syj:locatedAt 이 36.72722/128.83778 로 같다 |
| G093 | Place | 안동부 | 보류 | `place-regional163-andong` / `place-syj135-andongbu` | place-regional163-andong·place-syj135-andongbu 둘 다 주장 0개이고 후자는 '고창군이 승격된 이름'이라 시기가 다른 행정 단위일 수 있다 |
| G094 | Place | 암태도 | 동일 | `place-hs-amtaedo` / `place-mod128-amtaedo` | 두 기록이 같은 chunk_scenes-128_modern_localities_amtae-coord 의 같은 좌표(34.827722/126.112139)를 인용한다 |
| G095 | Place | 완산주 | 동일 | `place-syj128-wansanju` / `place-wansanju` | place-syj128-wansanju(900년 견훤 도읍 '완산주(完山州) [현 전주]')와 place-wansanju(삼국사기 '復置完山州')가 같은 전주의 州를 가리키고 위치가 어긋나지 않는다 |
| G096 | Place | 울주 검단리 유적 | 동일 | `place-hs-pg1-geomdanri` / `syj135-place-geomdanri` | 두 기록 모두 울주 검단리 환호 취락 유적을 가리키고 syj135 쪽 좌표 35.44917/129.18167(울주군 웅촌면)와 어긋나는 값이 없다 |
| G097 | Place | 웅진 | 동일 | `place-ungjin` / `place-ungjin-gongju` | place-ungjin-gongju 가 웅진도읍기(475~538)의 웅진이 지금의 공주임을 밝히고 place-ungjin 에는 어긋나는 값이 없다 |
| G098 | Place | 월성 | 동일 | `place-sgy-wolseong` / `place-wolseong` | place-sgy-wolseong 과 place-wolseong 이 같은 chunk_samguksagi_sg_001_0060_0240 의 월성 축성 기사를 근거로 삼는다 |
| G099 | Place | 일리천 | 동일 | `place-ency-illicheon` / `place-hs-ilicheon` | place-ency-illicheon 은 일리천을 일선군(선산)[현 경상북도 구미시]로, place-hs-ilicheon 은 구미 좌표(36.119469/128.344381)로 잡아 위치가 일치한다 |
| G100 | Place | 임둔군 | 보류 | `place-chgis-hvd-112638` / `place-encykorea-imdungun` | place-chgis-hvd-112638 은 기간(-108~-82)이 살아 있는 CHGIS 재구성 지점이고 place-encykorea-imdungun 은 함경남도설·강원도설로 비정이 갈려 있어 묶으면 시기·비정 정보가 뭉개진다 |
| G101 | Place | 제주도 | 보류 | `place-encykorea-jejudo` / `place-jeju43-jeju-island` | 양쪽 모두 주장 0건(data/entities/place/place-encykorea-jejudo.md, place-jeju43-jeju-island.md) — 인용할 원문이 없어 확정 불가 |
| G102 | Place | 조선 | 보류 | `place-cliopatria-07360` / `place-cliopatria-07585` / `place-cliopatria-07773` / `place-cliopatria-08542` / `place-cliopatria-09102` / `place-cliopatria-09265` / `place-cliopatria-09322` / `place-cliopatria-09543` / `place-cliopatria-09641` / `place-cliopatria-09705` / `place-cliopatria-09735` / `place-cliopatria-13124` / `place-cliopatria-13719` | Cliopatria 시기별 경계 도형 13건(geometrySha256·Area 상이, chunk_cliopatria-07360 등) — 시기 구분이 살아 있는 재구성 도형 |
| G103 | Place | 주원방포 | 동일 | `place-hs-juwonbangpo` / `place-je-juwonbangpo` | 둘 다 주원방포(周原防浦)=경상남도 통영, chunk_scenes-103_joseon_early_scenes_je-dm-depart 원문이 동일 지점을 지시 |
| G104 | Place | 진 | 보류 | `place-cliopatria-00993` / `place-cliopatria-01104` | Cliopatria 재구성 도형 2건(chunk_cliopatria-00993 / -01104) — 기하 해시는 같으나 시기 구분 도형이라 묶으면 시기 정보가 뭉개짐 |
| G105 | Place | 진도 용장성 | 동일 | `place-gl2-yongjangseong` / `place-khs-yongjang` | 두 기록이 같은 좌표 34.51556;126.33806(chunk_scenes-103_goryeo_scenes_geo-yongjang)를 공유하고 국가유산 지정명도 '진도 용장성'으로 일치 |
| G106 | Place | 진한 | 보류 | `place-cliopatria-01145` / `place-cliopatria-01796` | Cliopatria 재구성 도형 2건(chunk_cliopatria-01145 / -01796) — 시기 구분 도형 |
| G107 | Place | 청해진 | 동일 | `place-cheonghaejin` / `place-encykorea-cheonghaejin` | 삼국사기 '罷清海鎮'(chunk_samguksagi_sg_011_0020_0340)의 폐지와 백과의 '851년 철폐'(chunk_scenes-103_ancient_scenes_cheonghaejin-828-851)가 일치 |
| G108 | Place | 통일신라 | 보류 | `place-cliopatria-02939` / `place-cliopatria-03880` / `place-cliopatria-04031` / `place-cliopatria-04151` | Cliopatria 재구성 도형 4건(Area 149880/125072/38421) — 시기별 경계 기록 |
| G109 | Place | 판문점 | 동일 | `place-hs-panmunjeom` / `place-panmunjom` | 두 기록 좌표가 37.95556;126.67778로 동일(chunk_scenes-103_contemporary_scenes_panmunjom-geo, chunk_curriculum-contemporary_contemporary-2_geo-panmunjeom) |
| G110 | Place | 평양 대동강 | 보류 | `place-mt1-daedonggang` / `place-syj135-daedonggang-pyongyang` | 양쪽 주장 0건(place-mt1-daedonggang.md, place-syj135-daedonggang-pyongyang.md) — 인용 근거 없음 |
| G111 | Place | 평양성 | 별개 | `place-encykorea-pyongyangseong` / `place-encykorea-pyongyangseong-371` / `place-hs4-pyongyangseong` / `place-pyongyangseong` | 371년 평양성=대성산성(chunk_scenes-103_ancient_scenes_sosurim-371-death), 후기 장안성 견해(chunk_pyongyang_ex-encykorea-2), 현 평양 시가지 좌표(39.01667;125.7475)가 서로 다른 성을 가리켜 충돌 |
| G112 | Place | 한성부 | 보류 | `place-hs-jl2-hanseongbu` / `place-jl-hanseong-hyeongjang-1801` | place-hs-jl2-hanseongbu는 행정구역 좌표(chunk_scenes-103_joseon_late_scenes_coord-hanseongbu), place-jl-hanseong-hyeongjang-1801은 신유박해 처형 장소 일대로 주장 0건 — 상위·하위 관계 의심 |
| G113 | Place | 한양 궁궐 일원 | 보류 | `place-hs-hanyang-hyangyak` / `place-hs-hanyang-nongsa` / `place-hs-hanyang-samgang` | 세 기록이 각각 교태전·소주방·향원정 좌표(37.579908/37.579472/37.58222)를 쓰는 별개 표시점이라 묶으면 편찬처 표시가 뭉개짐 |
| G114 | Place | 함경남도 홍원 | 보류 | `place-hs-c5-hongwon` / `place-mod128-hongwon` | 양쪽 주장 0건(place-hs-c5-hongwon.md, place-mod128-hongwon.md) — 인용 근거 없음 |
| G115 | Place | 현도군 | 보류 | `place-chgis-hvd-112640` / `place-chgis-hvd-112641` / `place-encykorea-hyeondogun` | CHGIS 기간 분할 도형(-108~-83 / -82~0, chunk_chgis-hvd-112640·112641)과 백과의 군치 이동 기록(chunk_ex-hyeondo-1)이 섞여 있어 시기·치소 구분이 뭉개짐 |
| G116 | Place | 홍산 | 동일 | `place-gl4-hongsan` / `place-syj122-hongsan` | place-gl4-hongsan 좌표 [126.76058,36.22682]는 부여군 홍산면으로 place-syj122-hongsan 라벨(鴻山, 부여군 홍산면)과 일치 |
| G117 | Place | 홍주성 | 동일 | `place-hs-hongjuseong` / `place-syj135-hongjuseong` | place-hs-hongjuseong 좌표 36.59917;126.65972(chunk_curriculum-modern-transition_modern-transition-3_geo-hongju)는 홍성 홍주읍성으로 place-syj135-hongjuseong(洪州城)과 같은 성 |
| G118 | Place | 화주 | 동일 | `place-gl2-hwaju` / `place-lg128-hwaju` | place-gl2-hwaju 좌표 39.545;127.240(금야=영흥)과 place-lg128-hwaju의 '화주(和州 : 지금의 함경남도 영흥)'(chunk_scenes-128_late_goryeo_lg128-sc-hwaju)가 일치 |
| G119 | Place | 황산벌 | 동일 | `place-hs-sg5-hwangsanbeol` / `place-hwangsanbeol` | place-hs-sg5-hwangsanbeol 좌표 127.19858,36.23049(논산 연산)와 '황산은 지금의 충청남도 논산시 연산 지방이다'(chunk_scenes-103_ancient_scenes_hwangsan-place)가 일치 |
| G120 | Place | 황토현 | 동일 | `place-hs-hwangtohyeon` / `place-hwangtohyeon` | place-hs-hwangtohyeon 좌표 35.6305;126.830111(chunk_curriculum-modern-transition_modern-transition-2_geo-donghakmuseum)은 정읍 황토현 전적 일대로 place-hwangtohyeon(黃土峴)과 같은 곳 |
| G121 | Place | 후백제 | 보류 | `place-cliopatria-03891` / `place-cliopatria-04134` | Cliopatria 재구성 도형 2건(chunk_cliopatria-03891 / -04134, 기하 해시 상이) — 시기 구분 도형 |
| G122 | Place | 흥화진 | 동일 | `place-hs-heunghwajin` / `place-syj122-heunghwajin` | place-hs-heunghwajin 좌표 40.19694;124.53194(의주 일대, chunk_curriculum-goryeo-early_goryeo-early-3_geo-uiju)와 place-syj122-heunghwajin(興化鎭)이 같은 고려 관문 진 |
| G123 | Polity | 거란 | 보류 | `polity-ency-georan` / `polity-georan` / `polity-hs-georan` | 정본 후보 polity-hs-georan과 polity-ency-georan 모두 주장 0건이라 그 쌍에 붙일 인용문을 만들 수 없음 — 인용 불가로 보류 |
| G124 | Polity | 당 | 보류 | `polity-hs-nbg-tang` / `polity-hs-sg5-tang` / `polity-hs4-tang` / `polity-tang` | 네 기록 모두 주장 0건(polity-hs-nbg-tang, polity-hs-sg5-tang, polity-hs4-tang, polity-tang) — 인용 근거 없음 |
| G125 | Polity | 왜 | 동일 | `polity-hs-s3-wa` / `polity-hs-sg5-wa` / `polity-hs4-wae` / `polity-wa` | 광개토왕비의 倭(chunk_gwanggaeto_1-09)와 삼국사기 백강 기사의 倭國(chunk_samguksagi_sg_007_0020_0104)이 같은 왜를 가리키고 충돌하는 값이 없음 |

## 보류 48묶음 — 왜 묶지 않았나

**한쪽이 주장 없는 껍데기라 대조하거나 인용할 원문이 없다** (25묶음)

- G004 개경 나성 축조 — event-ge3-12는 껍데기지만 라벨이 동일하고 event-hs-naseong의 1029년 나성 기사(goryeosa kr_005_0070_0120_0020)와 어긋나는 값이 없다 / 2차 확인: 한쪽이 주장 0건인 껍데기라 연도·장소를 대조할 수 없어 보류로 내림
- G005 거란의 2차 침입 — event-ge3-02는 껍데기지만 라벨이 같고 event-hs-khitan-2nd의 1010년 침입 기록과 충돌하는 값이 없다 / 2차 확인: 한쪽이 주장 0건인 껍데기라 연도·장소를 대조할 수 없어 보류로 내림
- G006 거란의 3차 침입 — event-ge3-08은 껍데기지만 라벨이 같고 event-hs-khitan-3rd의 1018~1019 기록과 충돌이 없다 / 2차 확인: 한쪽이 주장 0건인 껍데기라 연도·장소를 대조할 수 없어 보류로 내림
- G011 귀주 대첩 — event-ge3-10은 껍데기지만 라벨이 같고 event-hs-gwiju-daecheop의 1019년 귀주 기록과 충돌이 없다 / 2차 확인: 한쪽이 주장 0건인 껍데기라 연도·장소를 대조할 수 없어 보류로 내림
- G023 사비 천도 — event-hs-s3-sabi-move는 주장 0개 껍데기이고 event-sabi-transfer-sy는 '사료별 사건 서술을 구별하기 위한 이름'으로 event-sabi-transfer-sg와 sameEventAs로 묶인 사료별 기록이라 층위가 다르다(data/entities/event/event-sabi-transfer-sg.md)
- G040 조선건국준비위원회 결성 — event-hs-c1-geonjun 은 라벨만 있는 껍데기지만(data/entities/event/event-hs-c1-geonjun.md) 조선건국준비위원회 결성은 1945년 여운형 주도의 단일 사건이라 event-geonjun-1945 와 어긋나는 값이 없다 / 2차 확인: 한쪽이 주장 0건인 껍데기라 연도·장소를 대조할 수 없어 보류로 내림
- G046 현종의 나주 피난 — event-ge3-04 는 껍데기지만 고려 전기(ge3) 묶음 소속이고, event-hs-hyeonjong-naju 의 1011년 거란 침입 피난(chunk_goryeosa_kr_004_0040_0010_0070)과 어긋나는 값이 없다 / 2차 확인: 한쪽이 주장 0건인 껍데기라 연도·장소를 대조할 수 없어 보류로 내림
- G051 염장 — 두 개체 모두 주장 0건(data/entities/person/person-encykorea-yeomjang.md, person-hs-yeomjang.md) — 인용할 quote 가 없어 확정 불가
- G066 금성 — place-geumseong 은 라벨 '금성'뿐인 껍데기(data/entities/place/place-geumseong.md) — 신라 왕성 금성 외 나주 금성 등 동명 지명이 있어 특정 불가
- G067 나주 — 세 개체 모두 주장 0건이고 place-naju-station-1929 는 통학열차 도착지(역)라 상하 관계가 의심된다 — 인용할 quote 도 없다
- G072 동모산 — 두 개체 모두 주장 0건(place-balhae-dongmosan.md, place-dongmosan.md) — 인용할 quote 가 없다
- G073 마산 — 정본 후보 place-encykorea-masan 과 place-masan-1960 이 모두 주장 0건이라 짝마다 인용할 quote 를 댈 수 없다
- G076 밀양 — data/entities/place/place-syj136-miryang.md 는 주장 0개 껍데기이고 라벨이 '밀양부 관아'라 고을 전체 vs 치소 관계가 의심된다
- G080 부산 — data/entities/place/place-encykorea-busan.md·place-hs-c3-busan.md 둘 다 주장 0개라 인용할 원문 문장이 없다
- G081 부산포 — place-hs-busanpo(35.10389/129.07889)와 place-hs-jl2-busanpo(35.10056/129.03278)의 좌표가 어긋나고 place-je-busanpo 는 주장 0개다
- G084 사도성 — data/entities/place/place-sgy-sadoseong.md 는 주장 0개 껍데기라 place-sadoseong 의 293년 개축 기록과 대조할 값이 없다
- G086 서울 — data/entities/place/place-encykorea-seoul.md·place-seoul-1910.md 둘 다 주장 0개라 인용할 원문 문장이 없다
- G091 아사달 — place-hs-pg1-scene-founding 은 아사달을 왕검성·평양(39.01667/125.7475)으로 비정해 묶은 기록이고 place-hs-pg1-asadal 은 주장 0개라, 비정이 갈리는 두 대상을 뭉갤 수 있다
- G093 안동부 — place-regional163-andong·place-syj135-andongbu 둘 다 주장 0개이고 후자는 '고창군이 승격된 이름'이라 시기가 다른 행정 단위일 수 있다
- G101 제주도 — 양쪽 모두 주장 0건(data/entities/place/place-encykorea-jejudo.md, place-jeju43-jeju-island.md) — 인용할 원문이 없어 확정 불가
- G110 평양 대동강 — 양쪽 주장 0건(place-mt1-daedonggang.md, place-syj135-daedonggang-pyongyang.md) — 인용 근거 없음
- G112 한성부 — place-hs-jl2-hanseongbu는 행정구역 좌표(chunk_scenes-103_joseon_late_scenes_coord-hanseongbu), place-jl-hanseong-hyeongjang-1801은 신유박해 처형 장소 일대로 주장 0건 — 상위·하위 관계 의심
- G114 함경남도 홍원 — 양쪽 주장 0건(place-hs-c5-hongwon.md, place-mod128-hongwon.md) — 인용 근거 없음
- G123 거란 — 정본 후보 polity-hs-georan과 polity-ency-georan 모두 주장 0건이라 그 쌍에 붙일 인용문을 만들 수 없음 — 인용 불가로 보류
- G124 당 — 네 기록 모두 주장 0건(polity-hs-nbg-tang, polity-hs-sg5-tang, polity-hs4-tang, polity-tang) — 인용 근거 없음

**시기별로 나뉜 경계 도형이라 묶으면 시기 정보가 뭉개진다** (20묶음)

- G053 강원도 — place-hgis-admin-156701 은 1917~1945 기간이 살아 있는 HGIS 경계 기록(chunk_hgis-admin-156701)이라 묶으면 시기 정보가 뭉개진다
- G057 고구려 — Cliopatria 시기별 분할 도형 24건(면적 93,626~390,513 로 제각각, chunk_cliopatria-01262 등) — 묶으면 시기 정보가 뭉개진다
- G058 고려 — Cliopatria 시기별 분할 도형 10건(면적 81,546~208,184, chunk_cliopatria-04120 등)
- G059 고조선 — Cliopatria 시기별 분할 도형 2건(chunk_cliopatria-00986 / 01120, 면적·해시 다름)
- G068 낙랑군 — place-chgis-hvd-112642 는 기간(-108~-83)이 살아 있는 CHGIS 재구성 기록(chunk_chgis-hvd-112642)이라 묶으면 시기 정보가 뭉개진다
- G070 대한민국 — Cliopatria 시기별 분할 도형 3건(면적 102,811 vs 105,176, chunk_cliopatria-14878 등)
- G071 대한제국 — Cliopatria 시기별 분할 도형 4건(chunk_cliopatria-13762 등, 경계 해시 상이)
- G074 마한 — Cliopatria 시기별 분할 도형 2건(chunk_cliopatria-01146 / 01736)
- G077 발해 — place-cliopatria-02987~04124 는 시기별로 잘린 Cliopatria 재구성 도형(각 syj:hasBoundaryRecord 1건)이라 묶으면 시기 정보가 뭉개진다
- G078 백제 — place-cliopatria-01752~02823 모두 시기별 Cliopatria 경계 도형(chunk_cliopatria-01752 등)이라 기간 구분이 살아 있는 기록이다
- G079 변한 — place-cliopatria-01128/02244/02375 는 시기별 Cliopatria 경계 도형이라 묶으면 기간 정보가 사라진다
- G082 북한 — place-cliopatria-14876/14973/15505 는 시기별 Cliopatria 경계 도형이다
- G089 신라 — place-cliopatria-01810~02919 는 시기별 Cliopatria 경계 도형이라 묶으면 기간 정보가 사라진다
- G100 임둔군 — place-chgis-hvd-112638 은 기간(-108~-82)이 살아 있는 CHGIS 재구성 지점이고 place-encykorea-imdungun 은 함경남도설·강원도설로 비정이 갈려 있어 묶으면 시기·비정 정보가 뭉개진다
- G102 조선 — Cliopatria 시기별 경계 도형 13건(geometrySha256·Area 상이, chunk_cliopatria-07360 등) — 시기 구분이 살아 있는 재구성 도형
- G104 진 — Cliopatria 재구성 도형 2건(chunk_cliopatria-00993 / -01104) — 기하 해시는 같으나 시기 구분 도형이라 묶으면 시기 정보가 뭉개짐
- G106 진한 — Cliopatria 재구성 도형 2건(chunk_cliopatria-01145 / -01796) — 시기 구분 도형
- G108 통일신라 — Cliopatria 재구성 도형 4건(Area 149880/125072/38421) — 시기별 경계 기록
- G115 현도군 — CHGIS 기간 분할 도형(-108~-83 / -82~0, chunk_chgis-hvd-112640·112641)과 백과의 군치 이동 기록(chunk_ex-hyeondo-1)이 섞여 있어 시기·치소 구분이 뭉개짐
- G121 후백제 — Cliopatria 재구성 도형 2건(chunk_cliopatria-03891 / -04134, 기하 해시 상이) — 시기 구분 도형

**상위·하위 관계나 대리 지점이 의심된다** (2묶음)

- G060 고창 죽림리 고인돌군 — place-hs-pg1-scene-gochang 은 라벨 자체가 '고창고인돌박물관 표시점'이라 유적 전체와 대리 표시점의 상하 관계가 의심된다
- G113 한양 궁궐 일원 — 세 기록이 각각 교태전·소주방·향원정 좌표(37.579908/37.579472/37.58222)를 쓰는 별개 표시점이라 묶으면 편찬처 표시가 뭉개짐

**그 밖에 확정할 근거가 모자란다** (1묶음)

- G090 신라 왕경 — place-silla-capital 의 근거는 광개토대왕비 chunk_gwanggaeto_2-08 의 '從男居城至新羅城' 하나뿐이라 이 新羅城이 경주 왕경인지 확정되지 않는다

## 별개 5묶음

- G026 숙종의 치세 — event-hs-goryeo-sukjong 은 고려 숙종(1095~1105)이고 event-hs3-sukjong-reign 은 조선 후기 교육과정 묶음 소속이다(data/research/curriculum-joseon-late/joseon-late-3/review.json 에서만 참조) — 다른 왕의 치세다
- G027 신라 경도 지진 — 같은 종류 사건이 100·304·779년으로 연도가 모두 다르다(data/entities/event/event-ced-d100.md, -d304.md, -d779.md)
- G042 천리장성 축조 — event-gg-jangseong-631 은 삼국사기 631년 고구려 천리장성(chunk_samguksagi_sg_020_0030_0160)이고 나머지 둘은 고려 1033~1044년 장성이라 연대·주체가 다르다
- G052 조영규 — 한자·시대가 어긋난다: 趙英珪(이방원 문객, 1392) vs 趙英圭(1592년 양산군수, chunk_scenes-103_harbors_and_presence_dn-jo)
- G111 평양성 — 371년 평양성=대성산성(chunk_scenes-103_ancient_scenes_sosurim-371-death), 후기 장안성 견해(chunk_pyongyang_ex-encykorea-2), 현 평양 시가지 좌표(39.01667;125.7475)가 서로 다른 성을 가리켜 충돌


## 검사

| 무엇 | 결과 |
| --- | --- |
| `python services/validate.py --write-digests` | OK (실패 0·경고 0). digest 68개가 바뀌었고, 그 68개 전부 이번에 주장 파일을 넣은 사료다. 줄바꿈만 바뀐 파일은 0개라 되돌릴 것이 없었다 |
| `python services/build_ttl.py` | OK. 트리플 473,657개, 경고 0·실패 0, `data/build/sigong.ttl` 을 썼다 (서버는 띄우지 않았다) |
| `node --test tests/*.mjs` | 404개 중 403 통과. 실패 1건은 기준 커밋에도 있던 `tests/test_place_state.mjs` 의 'outside candidates retain dates…' |
| 충돌이 실제로 줄었나 | `python scripts/clean_entity_labels.py --report` 를 다시 돌리니 충돌 묶음 714 → **643**, 손대지 못한 개체 1,472 → **1,396**. 동일로 묶은 72묶음 가운데 71묶음이 충돌 목록에서 빠졌다 ('천태종 개창'은 껍데기가 낀 나머지 한 쌍 때문에 목록에 남는다) |
| 인용문 | 주장 82건의 `quote`·`citesChunk`·`fromSource` 는 모두 기존 주장에서 그대로 가져왔고, validate 의 quote 검사(`services/validate.py:557`)를 통과했다 |

## 남은 일

- 보류 48묶음은 그대로 둔다. 시기별로 나뉜 경계 도형은 묶는 것 자체가 옳지 않고, 껍데기 쪽은 먼저 주장을 채워야 판정할 수 있다.
- 껍데기(`event-ge3-*` 등)에 연도·장소 주장을 붙이면 보류 가운데 여럿이 다시 심사 대상이 된다.
- HGIS 번호로만 갈리는 행정구역 589묶음은 이번에도 손대지 않았다.
