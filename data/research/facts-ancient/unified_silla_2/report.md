# unified_silla_2 조사 보고 — 통일신라·후삼국 (780~935, south·central)

- 조사원: Opus 5 (high), runner=workflow
- 결과(검수 반영 뒤): 사실 27건 · 장면 16건 · 주장 60건(전부 로컬 chunk 인용) · 웹 출처 12건(좌표 근거 전용)
- 검증기: `python scripts/check_fact_research.py data/research/facts-ancient --job unified_silla_2` → **PASS: failures=0 warnings=0** (exit 0)

## 1. 검색 과정

### 1.1 쓴 명령

```
python scripts/search_chunks.py --help
python scripts/check_fact_research.py --help
python scripts/search_chunks.py --source src-samguksagi --from 780 --to 935 --limit 5000 --fields id,date,locator
python scripts/search_chunks.py --source src-samgukyusa --from 780 --to 935 --limit 200 --fields id,date,locator
python scripts/search_chunks.py --from 780 --to 935 --limit 400 --fields id,sourceId,date,locator   # 금석문·집성 훑기
python scripts/search_chunks.py --source src-samguksagi --from 780 --to 935 --keyword 徙 (戶 民 賑 倉 市 稅 租 堤 茶 置 州 築 城 …)
python scripts/search_chunks.py --id <chunk id>    # 고른 조각의 전체 텍스트 확인
```

- 삼국사기는 780~935년 구간에 **593조각**이 걸렸다. 전부 `연도 / 권 / 표제`로 줄여 뽑아 훑은 뒤 갈래별로 골랐다.
- 삼국유사는 같은 구간 29조각뿐이라 표제만 보고 넘겼다(굴산사 창건 847, 낙산 불전 858 등은 후보로만 남김).
- 금석문(`src-geumseok-*`)은 `--from/--to` 로도 잡힌다. `date.raw`가 `0810-99-99` / `798-99-99` 꼴이라 연도 검사에 그대로 쓸 수 있었다. 이 칸에서 실제로 쓴 것은 영천 청제비(798), 중초사지 당간지주(827), 도피안사 철불 조상기(865), 개선사지 석등기(868)다.

### 1.2 후보 표 (훑어서 남긴 것 — ✔ 는 채택)

| 연도 | 갈래 후보 | 표제 / 핵심 구절 | chunk 꼬리 | 결과 |
|---|---|---|---|---|
| 780 | disaster | 누런 안개 / 흙비 | sg_009_0040_0580·0590 | 기상 이변만이라 제외 |
| 781 | administration | 사자를 보내 주·군을 위무 | sg_009_0050_0070 | 장소 불특정 |
| 782 | settlement | 移民戸於浿江鎭 | sg_009_0050_0090 | ✔ fact-001 |
| 783 | administration | 체신을 대곡진 군주로 | sg_009_0050_0110 | 인사 기사 |
| 785 | administration | 攺㧾管為都督 | sg_010_0020_0060 | ✔ fact-005 |
| 786 | disaster | 王都民饑, 出粟三萬三千二百四十石 | sg_010_0020_0120 | ✔ fact-018 |
| 788 | culture | 讀書三品 시행 | sg_010_0020_0210 | 후보(문화 3건 채워 제외) |
| 789 | disaster | 漢山州民饑, 出粟以賙之 | sg_010_0020_0240 | 원문에 연대 표기 없음 |
| 790 | facility | 増築碧骨堤, 徴全州等七州人興役 | sg_010_0020_0280 | ✔ fact-010 (기존 장면 있음) |
| 790 | disaster | 한산·웅천 두 주 진휼 | sg_010_0020_0340 | 중복 성격 |
| 794 | facility | 始創奉恩寺 / 起望恩樓 | sg_010_0020_0520 | 후보(시설 5건 채워 제외) |
| 796 | disaster | 京都飢疫, 發倉廪賑恤 | sg_010_0020_0580 | ✔ fact-019 |
| 798 | facility | 청제비 貞元十四年…菁堤治記之 | geumseok 005_0010_0241 | ✔ fact-011 |
| 799 | economy | 菁州 居老縣爲學生禄邑 | sg_010_0030_0020 | 후보 |
| 800 | culture | 고선사 서당화상비 | geumseok 005_0010_0090 | 비문 연대만 |
| 801 | facility | 무장사 아미타불 조상비 | geumseok 005_0010_0010 | 후보 |
| 802 | facility | 創加耶山海印寺 | sg_010_0040_0190 | 기존 장면 있음 |
| 803 | foreign | 與日夲國交聘結好 | sg_010_0040_0230 | 후보 |
| 804 | foreign | 日夲國遣使, 進黄金三百两 | sg_010_0040_0260 | ✔ fact-025 |
| 804 | facility | 重修臨海殿, 新作東宫萬壽房 | sg_010_0040_0270 | 후보 |
| 806 | culture | 禁新創佛寺, 唯許修葺 | sg_010_0040_0370 | 후보 |
| 808 | administration | 發使十二道, 分定諸郡邑疆境 | sg_010_0040_0460 | 후보(행정 5건 채워 제외) |
| 810 | economy | 發使修葺國内隄防 | sg_010_0050_0070 | 859년 기사와 중복 |
| 810 | facility | 창녕 인양사 조성비(食 一萬五千五百九十五石) | geumseok 005_0010_0280 | 후보 — 창녕 좌표 못 구함 |
| 813 | administration | 헌창을 무진주 도독으로 | sg_010_0050_0190 | 인사 기사 |
| 814 | disaster | 國西大水, 復一年租調 | sg_010_0050_0230 | 후보 |
| 817 | disaster | 人多飢死, 發倉穀存恤 | sg_010_0050_0380 | ✔ fact-020 |
| 818 | culture | 백률사 석당기 | geumseok 005_0010_0170 | 후보 |
| 821 | disaster | 기근으로 자손을 팔다 | sg_010_0050_0470 | 후보 |
| 823 | administration | 合水城郡·唐恩縣 | sg_010_0050_0640 | 829년과 중복 |
| 826 | facility | 徴漢山北諸州郡人一萬, 築浿江長城三百里 | sg_010_0050_0720 | ✔ fact-012 |
| 827 | facility | 중초사지 당간지주명 | geumseok 005_0030_0090 | ✔ fact-014 |
| 828 | foreign | 清海大使弓福…以卒萬人, 鎮清海 | sg_010_0060_0130 | ✔ fact-024 (기존 장면 있음) |
| 828 | economy | 持茶種子來, 王使植地理山 | sg_010_0060_0150 | ✔ fact-015 |
| 829 | administration | 以唐恩郡爲唐城鎮 | sg_010_0060_0160 | ✔ fact-006 |
| 830 | culture | 진천 태화4년명 마애여래입상 | geumseok 005_0020_0090 | 후보 |
| 833 | disaster | 國内大飢 / 民多疫死 | sg_010_0060_0270·0290 | 후보 |
| 835 | culture | 경주 배리 윤을곡 마애불좌상명 | geumseok 005_0020_0030 | 후보 |
| 839 | foreign | 청해진 대사 궁복을 진해장군으로 | sg_011_0020_0020 | 후보 |
| 844 | administration | 置穴口鎮, 以阿湌啓弘爲鎮頭 | sg_011_0020_0170 | ✔ fact-007 |
| 845 | facility | 김립지찬 성주사비 | geumseok 005_0010_0110 | 후보 |
| 846 | facility | 포항 법광사 석탑지 | geumseok 005_0040_0040 | 후보 |
| 847 | facility | 범일이 굴산사를 창건 (삼국유사) | sy_003_0020_0190_0020 | 후보 — 강릉 좌표 미확보 |
| 851 | settlement | 罷清海鎮, 徙其人於碧骨郡 | sg_011_0020_0340 | ✔ fact-002 (기존 장면 있음) |
| 855 | facility | 경주 창림사 무구정탑지 | geumseok 005_0040_0050 | 후보 |
| 858 | facility | 보림사 철조비로자나불 조상기 | geumseok 005_0020_0080 | 기존 장면 있음 |
| 859 | economy | 教修完隄防, 勸農 | sg_011_0030_0090 | ✔ fact-017 |
| 863 | culture | 왕이 국학에 행차 | sg_011_0040_0070 | 후보 |
| 865 | culture | 도피안사 철불 結緣一千五百餘人 | geumseok 005_0020_0120 | ✔ fact-021 |
| 866 | culture | 황룡사 연등회 | sg_011_0040_0150 | 후보 |
| 868 | economy | 개선사 석등기 油糧業租三百碩 / 渚沓四結 | geumseok 005_0040_0090 | ✔ fact-016 |
| 870 | facility | 보림사 남탑지·북탑지 | geumseok 005_0040_0060·0070 | 후보 |
| 871 | facility | 王命有司, 攺造皇龍寺塔 | sg_011_0040_0310 | ✔ fact-013 (시작) |
| 873 | facility | 皇龍寺塔成, 九層髙二十二丈 | sg_011_0040_0370 | ✔ fact-013 (완공) |
| 873 | disaster | 民饑且疫, 王發使賑救 | sg_011_0040_0360 | 후보 |
| 874 | person | 최치원 乾符元年甲午…一舉及第 | sg_046_0030_0030 | ✔ fact-026 |
| 876 | culture | 皇龍寺齋僧, 設百髙座講經 | sg_011_0050_0030 | ✔ fact-023 |
| 879 | culture | 국학 행차 | sg_011_0050_0090 | 후보 |
| 880 | settlement | 京都民屋相屬 / 覆屋以瓦不以茅 | sg_011_0050_0170 | ✔ fact-004 |
| 885 | person | 三月, 崔致逺還 | sg_011_0050_0230 | ✔ fact-026 |
| 886 | facility | 양양 선림원지 홍각선사탑비 | geumseok 005_0010_0230 | 후보 |
| 887 | economy | 復諸州郡一年租稅 | sg_011_0070_0020 | 후보(경제 3건 채워 제외) |
| 887 | facility | 하동 쌍계사 진감선사탑비 | geumseok 005_0010_0310 | 기존 장면 있음 |
| 888 | culture | 修集郷歌, 謂之三代目 | sg_011_0070_0060 | ✔ fact-022 |
| 889 | economy | 諸州郡不輸貢賦, 府庫虛竭 | sg_011_0070_0130 | 기존 장면 있음 |
| 890 | facility | 성주사지 낭혜화상탑비 / 월광사 원랑선사탑비 | geumseok 005_0010_0180·0270 | 후보 |
| 896 | war | 赤袴賊, 至亰西部牟梁里 | sg_011_0070_0230 | 전쟁 갈래라 제외 |
| 897 | administration | 善宗謂松岳郡漢北名郡…定以為都 | sg_050_0020_0210 | 898년 본기 기사로 대체 |
| 898 | administration | 遂都於松岳郡 | sg_012_0020_0050 | ✔ fact-008 |
| 904 | settlement | 移青州人戸一千, 入鐡圎城爲京 | sg_050_0020_0330 | ✔ fact-003 |
| 905 | administration | 弓裔移都於鐡圎 | sg_012_0020_0180 | ✔ fact-009 |
| 910 | facility | 남원 실상사 편운화상 승탑 | geumseok 005_0040_0100 | 후보 |
| 924 | facility | 봉암사 지증대사탑비 / 봉림사 진경대사탑비 | geumseok 005_0010_0160·0290 | 후보 |
| 935 | administration | 攺新羅爲慶州, 以爲公之食邑 | sg_012_0060_0280 | 후보 |

## 2. 고를 때 쓴 기준

1. **장소가 특정되는 것**을 앞세웠다. 벽골제·청제·황룡사·중초사·개선사·도피안사처럼 지금도 자리가 남은 곳을 먼저 넣었다.
2. **뒤에 오래 남는 것**은 `persistence` 로 적었다. 도읍(송악 898~905, 철원 905~919), 진(당성진 829~, 혈구진 844~, 청해진 828~851), 둑·절·탑(벽골제·청제·황룡사탑·중초사 당간지주·개선사 석등).
3. **사람이 어떻게 살았는지 보이는 것**을 밀었다. 904년 청주 민호 1,000호(`density.households=1000`), 798년 법공부 14,140명, 826년 부역민 1만, 865년 결연 1,500여 인, 786년 진휼 조 33,240석은 `participantGroups.count` 나 사실 본문에 숫자로 남겼다.
4. 갈래 할당에 없는 **전쟁은 넣지 않았다**. 896년 적고적, 927년 공산, 930년 고창 같은 후보는 표에만 남겼다.
5. `services/host/app/history-scenes.json` 에 이미 있는 장면(벽골제 790, 해인사 802, 청해진 828, 보림사 철불 858, 진감선사탑비 887, 원종·애노 889, 청해진 철폐 851)은 **새 장면을 만들지 않았다.** 그중 이 칸의 갈래에 맞는 790·851·828 세 건은 사실로만 남기고 `sceneId` 를 `null` 로 두었다 — 검증기가 `fact.sceneId` 를 같은 result 의 scenes 안에서만 찾기 때문에 바깥 장면 id 를 적으면 실패한다.

## 3. 갈래 충족

| 갈래 | 할당 | 채운 수 |
|---|---|---|
| settlement | 3 | 4 |
| administration | 4 | 5 |
| facility | 3 | 5 |
| economy | 3 | 3 |
| disaster | 2 | 3 |
| culture | 2 | 3 |
| foreign | 2 | 2 |
| person | 1 | 1 |
| **합계** | **20** | **26** |

권역은 south 17 / central 9. 10년 구간은 780·790·800·810·820·840·850·860·870·880·890·900 열두 칸에 걸쳤다.

## 4. 좌표 처리

좌표는 만들지 않았다. ko/en 위키백과 문서 머리의 십진 표시 좌표(`class="geo"`)만 **Python urllib 로 원본 바이트를 `raw/*.html` 에 저장**하고, 그 좌표 문자열을 출처당 발췌 1개(2단어)로 적어 `coordinateBasis` 에 `"<sourceId> <excerptId>"` 로 연결했다. sha256·byteLength·fetchedUtc 는 `manifest.json` 과 `sources[]` 에 같이 적었고 검증기가 재계산해 맞췄다.

| sourceId | 좌표 | 쓴 곳 |
|---|---|---|
| src-kowiki-hwangnyongsa | 35.83694; 129.23250 | 황룡사탑(873), 백고좌(876) |
| src-kowiki-byeokgolje | 35.75444; 126.85444 | 벽골제 증축(790), 벽골군 이주(851) |
| src-kowiki-cheongjebi | 35.92472; 128.94083 | 청제 수리(798) |
| src-kowiki-jungchosaji | 37.41833; 126.91833 | 중초사 당간지주(827) |
| src-kowiki-gaeseonsaji | 35.18556; 126.98278 | 개선사 석등(868) |
| src-kowiki-gaeseong | 37.966667; 126.55 | 송악 도읍(898) |
| src-kowiki-jirisan | 35.33694; 127.73056 | 차 종자 파종(828) |
| src-enwiki-cheorwon | 38.20917; 127.21750 | 철원 사민(904), 철원 천도(905), 도피안사(865) |
| src-enwiki-ganghwa | 37.73889; 126.48944 | 혈구진(844) |
| src-enwiki-hwaseong | 37.18056; 126.82639 | 당성진(829) |
| src-enwiki-gyeongju | 35.850; 129.217 | 왕경 관련 6건 |

좌표를 못 구한 것은 넣지 않고 `note` 에 이유를 적었다: 패강진(782)·패강장성(826)·청해진(828). 군·시 중심 좌표를 유적 대신 쓴 곳(철원·강화·화성)도 `precision: "area"` 와 `coordinateNote`·`note` 에 그대로 밝혔다.

db.history.go.kr 은 열지 않았다. 원문 인용 56건은 전부 로컬 chunk(`citesChunk` + `quote`)다.

## 5. 판단·주의한 점

- **연도**: 시간 주장의 `year/earliest/latest` 는 인용한 chunk 의 `date.raw` 앞자리 서기연에 맞췄고, `verbatim` 은 chunk text 와 quote 양쪽에 있는 원문 표기만 썼다(`六年`, `秋七月`, `貞元十四年戊寅四月十三日` 등).
- **원문에 날짜 표기가 없는 조각**(888년 삼대목)은 `time` 대신 `{"kind":"year","value":888}` 주장을 써서 chunk 의 `date.raw` 만 근거로 삼았다. 이 사실은 편찬 장소도 추정이라 `confidence: medium` 이다.
- **호구 literal**: 지시문에는 `value` 를 문자열로 적으라고 되어 있었으나, 이 저장소의 `scripts/check_fact_research.py` 는 `fact_predicates.json` 의 `numeric: true` 때문에 `syj:householdCount` 의 `value` 가 **수(number)** 여야 통과한다(문자열이면 `0 이상의 수가 필요합니다` 로 실패). 그래서 `{"kind":"literal","value":1000,"unit":"戶"}` 로 적었다 — **확인됨**(검증기 실행으로 확인). `facts[].density.households` 도 숫자 1000이다.
- **827년 중초사 당간지주**: 명문 첫머리는 보력 2년 병오(826) 채석, 완성은 정미년(827) 2월 30일이다. chunk 의 `date.raw` 가 827이므로 완성 연대를 시간 주장으로 삼았고 채석 시작은 장면 요약과 note 에 적었다.
- **880년 월상루 기사**는 태평성대를 꾸민 서술이라는 지적이 있어 `confidence: medium` 으로 두었다.
- **826년 패강장성**은 성벽 노선 비정이 갈려 좌표를 넣지 않고 `confidence: medium` 으로 두었다.
- 장면 `place` 는 검증기가 `lon`·`lat` 를 필수로 요구하므로, 좌표 근거가 없는 장면(패강진 782, 패강장성 826)은 `place: null` 로 두었다.

## 6. 못 찾은 것 (`missing[]`)

1. 패강진 치소·패강장성 노선의 십진 좌표
2. 청해진(완도 장도)의 십진 좌표 — 완도군 위키 문서에 표시 좌표가 없다
3. 780~935년 군현별 戶·口 총수 — 이 구간 신라본기에 호구 총수 기사가 없어 밀도 숫자 근거가 904년 청주 민호 1,000호뿐이다
4. 경시(동시·서시·남시) 운영 기사 — market 장면 근거가 880년 월상루 기사 하나에 그쳤다

## 7. 검증기 출력 — 1차(검수 전) 실행 (그대로 붙임)

> 아래 표는 검수 반영 **전** 의 1차 결과(사실 26 · 장면 16 · 주장 56)다. 반영 뒤 최종 출력은 8.4 절에 있다.

```

category × 10년
byCategoryDecade | 780 | 790 | 800 | 810 | 820 | 840 | 850 | 860 | 870 | 880 | 890 | 900 | total
-----------------+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+------
settlement       | 1   | 0   | 0   | 0   | 0   | 0   | 1   | 0   | 0   | 1   | 0   | 1   | 4
administration   | 1   | 0   | 0   | 0   | 1   | 1   | 0   | 0   | 0   | 0   | 1   | 1   | 5
facility         | 0   | 2   | 0   | 0   | 2   | 0   | 0   | 0   | 1   | 0   | 0   | 0   | 5
economy          | 0   | 0   | 0   | 0   | 1   | 0   | 1   | 1   | 0   | 0   | 0   | 0   | 3
disaster         | 1   | 1   | 0   | 1   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 3
culture          | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 1   | 1   | 1   | 0   | 0   | 3
transport        | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
foreign          | 0   | 0   | 1   | 0   | 1   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 2
person           | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 1   | 0   | 0   | 1
war              | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0

region × 10년
byRegionDecade | 780 | 790 | 800 | 810 | 820 | 840 | 850 | 860 | 870 | 880 | 890 | 900 | total
---------------+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+------
capital        | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
north          | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0
central        | 1   | 0   | 0   | 0   | 3   | 1   | 0   | 1   | 0   | 0   | 1   | 2   | 9
south          | 2   | 3   | 1   | 1   | 2   | 0   | 2   | 1   | 2   | 3   | 0   | 0   | 17
island         | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0

job 별 집계
job             | facts | scenes | claims | chunkClaims | excerptClaims
----------------+-------+--------+--------+-------------+--------------
unified_silla_2 | 26    | 16     | 56     | 56          | 0

PASS: failures=0 warnings=0
```

## 8. 검수 반영 (적대 검수 기각 항목 처리)

검수원이 기각한 12건을 전부 고쳤다. 원문은 모두 `search_chunks.py --id` 로 다시 열어 대조했다.

### 8.1 기각 3건 ([minor] 아님)

**(1) fact-us2-016 / scene-us2-gaeseonsa-868 — 23년 뒤 사건을 868년 장면의 근거로 씀**

개선사지 석등기 chunk(`chunk_geumseok-gskh_005_0040_0090_gskh_005_0040_0090_0020`)를 다시 열어 보니 표점문이 두 문단이다.

- 868년: `唐咸通九年戊子中春夕, 繼月光, 前國子監卿沙干金中庸, 送上油糧業租三百碩, 僧靈▨, 建立石燈.`
- 891년: `龍紀三年辛亥十月日, 僧入雲, 京租一百碩, 烏乎比所里公書·俊休二人, 常買其分石保坪大業, 渚沓四結, 奧沓十結.`

지적대로였다. 그래서

- `claim-us2-868-land`(891년 매입 구절을 868년 근거로 쓰던 것)를 **버리고** 두 주장으로 갈랐다.
  - 새 `claim-us2-868-build` — subject `person-kim-jungyong`, quote `送上油糧業租三百碩, 僧靈▨, 建立石燈`.
  - 새 `claim-us2-891-land` — subject `person-ipun`, quote 를 `渚沓四結, 奧沓十結` 까지 늘려 '오답 10결' 에 근거를 붙였다.
- `fact-us2-016` 은 868년 부분(기름값 업조 300석 희사 + 석등 건립)으로 좁혔고, 891년 논 매입은 **새 `fact-us2-027`**(economy · south · decade 890)로 분리했다.
- `scene-us2-gaeseonsa-868` 의 `actionClaimIds`·`place.claimIds`·`participants`·`effects`·`persistence.basisClaimIds` 를 모두 `claim-us2-868-build` 로 바꿨다. 891년 사실에는 장면을 만들지 않았다(행위 장소가 석등 앞이 아니라 사들인 논이다).

**남는 제약을 숨기지 않고 적어 둔다.** 이 chunk 의 `date.raw` 는 `0868-99-99` 하나뿐이라, 891 을 값으로 갖는 time·year 주장을 달면 검증기의 연도 일치 검사(`claims[...].object 연도 불일치`)에 걸린다. 그래서 `fact-us2-027` 의 근거는 entity 주장 하나이고, `year` 891 은 명문 자체의 `龍紀三年辛亥` 표기를 따랐다. 이 사정을 fact 의 note 와 `missing[miss-us2-5]` 에 적었다.

**(2) fact-us2-009 — persistence.to=919 에 근거 없음**

검수원이 알려 준 `chunk_samguksagi_sg_012_0040_0080`(`卷第十二 新羅本紀 第十二 › 景明王 › 태조가 도읍을 송악군으로 옮기다`, date.raw `0919-99-99L0`, 본문 `我太祖移都松岳郡.`)을 열어 확인하고 두 주장을 새로 만들었다.

- `claim-us2-919-time` — `syj:occurredIn`, object `{kind:'year', value:919}`, quote `我太祖移都松岳郡`. 원문에 연대 글자가 없어 time 의 verbatim 을 채울 수 없으므로 year object 를 썼다.
- `claim-us2-919-capital` — `syj:capitalMovedTo` → `place-songakgun`, quote `移都松岳郡`.

`fact-us2-009.claimIds` 와 `scene-us2-cheorwon-capital-905.persistence.basisClaimIds` 에 둘 다 달았다. 이제 `to=919` 가 인용으로 받쳐진다.

**(3) fact-us2-014 / scene-us2-jungchosa-827 — 승려 12명이 아니라 11명**

중초사지 당간지주명 표점문을 세었다: 節州統 恒昌 / 上和上 眞行 / 貞坐 義說 / 上坐 年嵩 / 史師二 妙凡·則永 / 典都唯乃二 昌樂·法智 / 徒上二 智生·眞方 / 作上 秀南 = **11명**. 검수원 말이 맞다. `participantGroups[0].count` 를 11 로 고치고, note 에 11명의 이름을 모두 적었으며 장면 summary 도 '승려 11명' 으로 바꿨다.

### 8.2 [minor] 9건

| 항목 | 무엇을 했나 |
|---|---|
| fact-us2-004 (880 기와·숯) | `what` 을 "왕과 시중 민공은 … 들었다고 말했다" 로 고쳐 전문(傳聞)임을 드러냈다. market 근거로 `市井歡娱` 를 인용하는 **새 `claim-us2-880-market`**(quote `邉境謐静, 市井歡娱`)을 만들어 `effects.market.claimIds` 에 달았고, note 에 `孤聞今之民閒`·`臣亦甞聞之如此` 를 적었다 |
| fact-us2-026 (최치원) | `what` 에서 '빈공과' 를 뺐다(원문 `禮部侍郎裴瓉下, 一舉及第` 에 없는 말). note 에 귀국 기사 원문이 `三月, 崔致逺還.` 뿐이며 왕경 소재·좌표는 추정값임을 적었다 |
| fact-us2-015 (차 종자) | `persistence`(facility) 를 **삭제**했다. 차밭은 시설이 아니다. note 에 `茶自善徳王時有之, 至於此盛焉` 을 적었다 |
| fact-us2-013 (황룡사탑) | note 에 "645년에 선 구층목탑의 개조이며 from 873 은 개조 완공 연도, 창건탑 존속은 기존 `scene-anc-hwangnyongsa-tap-645` 기록에 맡긴다" 를 적었다 |
| fact-us2-007 (혈구진) | note 에 "혈구(穴口)를 강화로 본 통설을 따랐고 인용 원문에 강화 표기는 없다, 좌표는 강화군 중심" 을 적었다 |
| fact-us2-006 (당성진) | ko 위키백과 **화성 당성** 문서를 새로 받아(`raw/wiki-ko-hwaseong-dangseong.html`, sha256 `4df61723…`) `class="geo"` 값 `37.19306; 126.71417` 을 발췌로 넣고 좌표를 화성시 중심(126.82639, 37.18056)에서 **당성 좌표로 교체**했다. 장면 `scene-us2-dangseongjin-829.place` 도 같이 바꿨다 |
| fact-us2-022 (삼대목) | `yearVerbatim` 을 `(연대 표기 없음)` 으로 바꿨다(원문에 연대 글자 없음, 빈 문자열은 검증기가 필수 필드로 막는다). `claim-us2-888-work` 의 quote 를 `王素與角干魏弘通, 至是常入内用事. 仍命與大矩和尚, 修集郷歌, 謂之三代目云.` 로 늘려 '각간 위홍' 에 근거를 붙였다 |
| fact-us2-008 (송악 도읍) | `scene-us2-songak-capital-898.persistence.basisClaimIds` 와 fact 의 claimIds 에 `claim-us2-905-capital` 을 달아 `to=905` 의 근거를 연결했다 |
| 자기참조 claim 11개 | subject 를 행위 주체로 바꿔 `tookPlaceAt` 이 실제 장소 연결이 되게 했다: `claim-us2-880-city`·`880-roof`·`790-build`·`798-work`·`826-build`·`827-work`·`873-tower`·`876-ritual`·`786-relief`·`796-relief`·`828-tea` 의 subject → `polity-silla`, `claim-us2-817-relief` 의 object → 새 entity `place-silla-jugun`. 검수원 목록에 없던 `claim-us2-828-tea`(subject·object 가 모두 `place-jirisan`)도 같은 꼴이라 함께 고쳤다 |

새로 만든 entity: `person-wanggeon`, `person-kim-jungyong`, `person-ipun`, `place-silla-jugun`.

### 8.3 고치지 않은 것과 그 이유

- **브리프 규칙 8 대 검증기 충돌** — 검수원이 지적한 대로 `check_fact_research.py` 430~431행이 `fact.sceneId` 를 같은 result 의 scenes 안에서만 찾으므로, 기존 장면(`scene-anc-cheonghaejin-828` 등)의 id 를 sceneId 에 적으면 검증기가 실패한다. 지금처럼 `sceneId: null` + note 에 기존 id 를 적는 방식을 그대로 뒀다. 검증기나 브리프 중 하나를 고쳐야 할 문제라 이 조사 폴더에서 손대지 않았다.
- **fact-us2-003·009 의 철원군 중심 좌표** — 궁예 도성 유적은 비무장지대 안이라 허용 출처에서 십진 좌표를 얻지 못했다. note 에 "군 중심 좌표이며 도성 유적 좌표가 아니다" 를 그대로 두었다.

### 8.4 검수 반영 뒤 검증기 출력 (그대로 붙임)

```
category × 10년

byCategoryDecade | 780 | 790 | 800 | 810 | 820 | 840 | 850 | 860 | 870 | 880 | 890 | 900 | total

-----------------+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+------

settlement       | 1   | 0   | 0   | 0   | 0   | 0   | 1   | 0   | 0   | 1   | 0   | 1   | 4

administration   | 1   | 0   | 0   | 0   | 1   | 1   | 0   | 0   | 0   | 0   | 1   | 1   | 5

facility         | 0   | 2   | 0   | 0   | 2   | 0   | 0   | 0   | 1   | 0   | 0   | 0   | 5

economy          | 0   | 0   | 0   | 0   | 1   | 0   | 1   | 1   | 0   | 0   | 1   | 0   | 4

disaster         | 1   | 1   | 0   | 1   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 3

culture          | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 1   | 1   | 1   | 0   | 0   | 3

transport        | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0

foreign          | 0   | 0   | 1   | 0   | 1   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 2

person           | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 1   | 0   | 0   | 1

war              | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0



region × 10년

byRegionDecade | 780 | 790 | 800 | 810 | 820 | 840 | 850 | 860 | 870 | 880 | 890 | 900 | total

---------------+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+------

capital        | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0

north          | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0

central        | 1   | 0   | 0   | 0   | 3   | 1   | 0   | 1   | 0   | 0   | 1   | 2   | 9

south          | 2   | 3   | 1   | 1   | 2   | 0   | 2   | 1   | 2   | 3   | 1   | 0   | 18

island         | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0



job 별 집계

job             | facts | scenes | claims | chunkClaims | excerptClaims

----------------+-------+--------+--------+-------------+--------------

unified_silla_2 | 27    | 16     | 60     | 60          | 0



PASS: failures=0 warnings=0
```
