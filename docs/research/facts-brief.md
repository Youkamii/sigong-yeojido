# 사실 수집 지침 — 삼국·통일신라·발해 파일럿 (#180 #182)

목표: 3D 세계가 쓸 수 있는 "연도 + 장소 + 무슨 일" 사실을 10년 × 권역 격자에 채운다. 파일럿은 기원전 1세기~935년, 15개 조사(job) × 20건 = 300건 이상이다. 사실은 반드시 근거(로컬 원문 chunk 인용 또는 허용된 웹 발췌)를 달고, 형식은 [facts-format.md](facts-format.md)를 따른다. 검증기 `scripts/check_fact_research.py`를 통과하지 못하는 항목은 사실로 세지 않는다.

## 왜 이 갈래인가

현재 장면 패킷 294개는 건축·회의·조정·전투에 몰려 있고, 0~2020년의 10년 구간 203개 중 97개가 비어 있다. 삼국시대(0~700년)는 약 30개뿐이다. 화면에서 부족한 것은 "이 시대 이 지역에 사람이 어떻게 살았나"이므로 우선순위는 다음 순서다.

| 순위 | category | 화면에서 쓰이는 곳 | 주로 어디서 찾나 |
|---|---|---|---|
| 1 | `settlement` 취락·인구 | 추정 배경 마을 밀도(지금은 짐작 계수) | 삼국사기 본기의 戶·口·萬家, 지리지 郡縣, 移民·徙民 기사, 집성(중국 정사 동이전 戶數) |
| 2 | `administration` 행정·도읍 | 도시가 언제부터 언제까지 있는지 | 遷都·築城·置州·置郡·小京 설치, 州郡 개편, 지리지 |
| 3 | `facility` 시설 | 시설이 남는 기간 | 創寺·立寺·築堤·作橋·築城·立碑, 금석문 비문 건립 |
| 4 | `economy` 생활·경제 | 마을 옆에 무엇이 있나 | 市 개설(京市·東市·西市), 牛耕, 堤 수리, 鐵·鹽, 交易·朝貢 물품, 흉작·풍작 |
| 5 | `disaster` 재해·질병·구휼 | 구휼·이주 장면, 밀도 | 旱·大水·地震·饑·疫·蝗·霜·雹, 發倉賑給 |
| 6 | `culture` 종교·문화·교육 | 장면 기능 | 佛法 공인, 國學 설치, 첨성대, 향가, 불상·탑, 화랑 |
| 7 | `transport` 교통·길 | 옛 길 | 驛 설치, 나루, 우역, 조운 |
| 8 | `foreign` 대외 | 해외 거점(표시는 뒤로) | 遣使·朝貢·倭·唐·渤海 사신, 왜에 보낸 박사·불상, 장보고 |
| 9 | `person` 인물 | 동시대 인물 표시 | 활동 장소가 특정되는 인물의 생몰·활동 |
| 10 | `war` 전쟁·군사 | 이미 많음 | 전투는 새 지역·새 시기에만 |

## 조사 칸(job) 15개

| job | 대상 | 연도 | 권역 | 할당(20건) | 주 사료 |
|---|---|---|---|---|---|
| `goguryeo_early` | 고구려 | -37~300 | north | settlement 3 · administration 4 · facility 3 · economy 3 · disaster 2 · culture 2 · foreign 2 · person 1 | 삼국사기 고구려본기 권13~17, 집성(삼국지 동이전), 금석문 |
| `goguryeo_middle` | 고구려 | 300~500 | north(평양 427 이후 north/central) | 같은 비율 | 고구려본기 권17~19, 광개토왕릉비·충주고구려비(금석문) |
| `goguryeo_late` | 고구려 | 500~668 | north | 같은 비율 | 고구려본기 권19~22, 집성(수서·구당서) |
| `baekje_early` | 백제 | -18~300 | central(한성) | 같은 비율 | 백제본기 권23~24 |
| `baekje_middle` | 백제 | 300~500 | central → south(웅진 475) | 같은 비율 | 백제본기 권24~26, 집성(송서·양서), 무령왕릉 지석(금석문) |
| `baekje_late` | 백제 | 500~660 | south(사비) | 같은 비율 | 백제본기 권26~28, 사택지적비·미륵사 사리봉안기(금석문) |
| `silla_gaya_early` | 신라·가야 | -57~300 | south | 같은 비율(가야 4건 이상) | 신라본기 권1~2, 삼국유사 가락국기, 집성(삼국지 변진) |
| `silla_middle` | 신라 | 300~500 | south | 같은 비율 | 신라본기 권3, 포항 냉수리·중성리비(금석문) |
| `silla_late` | 신라 | 500~668 | south → central(한강 553) | 같은 비율 | 신라본기 권4~6, 단양 적성비·창녕비·북한산비·남산신성비(금석문) |
| `unified_silla_1` | 통일신라 | 668~780 | 전국(9주 5소경) | settlement 4 · administration 5 · facility 3 · economy 3 · disaster 2 · culture 2 · transport 1 | 신라본기 권6~9, 지리지 권34~36, 금석문(감산사·성덕대왕신종) |
| `unified_silla_2` | 통일신라·후삼국 | 780~935 | 전국 | 같은 비율(foreign 2: 장보고·당) | 신라본기 권10~12, 금석문(선사 비문), 삼국유사 |
| `balhae` | 발해 | 698~926 | north(만주 포함) | administration 6 · settlement 4 · facility 3 · economy 3 · foreign 3 · culture 1 | 집성(구당서·신당서 발해전), 발해고(위키문헌), 삼국사기 신라본기의 발해 기사 |
| `cross_settlement_admin` | 취락·인구·행정 횡단 | -57~935 | 전국 | settlement 10 · administration 10 | 삼국사기 지리지 권34~37(郡縣 소속·옛 이름·경덕왕 개명), 본기의 戶口·徙民 기사 |
| `cross_economy_disaster` | 생활·경제·재해 횡단 | -57~935 | 전국 | economy 10 · disaster 10 | 본기의 市·堤·耕·鐵·鹽 기사, 旱·水·震·饑·疫 기사(374건 후보) |
| `cross_facility_culture` | 시설·종교·교육 횡단 | -57~935 | 전국 | facility 10 · culture 10 | 創寺·築城·築堤·立碑 기사, 삼국유사 탑상·흥법, 금석문 비문 건립 연대 |

권역 코드: `capital`(당시 도읍 반경 약 30km) · `north`(위도 39 이상, 만주 포함) · `central`(37~39) · `south`(37 미만 본토) · `island`(제주·울릉·도서).

## 규칙

1. **근거 없는 사실은 없다.** 사실 1건마다 claim 1개 이상. 원문 chunk 인용은 `citesChunk` + `quote`(chunk 본문의 부분 문자열, 공백 무시). 웹 발췌는 `citesExcerpt`(출처당 25단어 이하, raw HTML 에 그대로 있는 문장).
2. **연도는 chunk 의 date.raw 를 따른다.** 삼국사기·고려사 chunk 에는 서기연이 들어 있다(`0551-03-99L0` → 551). 재위년 환산을 직접 하지 말고 chunk 의 값을 쓴다. date 가 없는 금석문·집성은 비문 자체의 연호나 한국민족문화대백과 발췌로 연도를 댄다.
3. **좌표는 만들지 않는다.** 위키백과(ko/en) 문서 머리의 표시 좌표, 국가유산포털·한국민족문화대백과의 위치 서술만 쓰고 `coordinateBasis` 에 출처 id 를 적는다. 지명 비정에 학설이 갈리면 `precision:'area'` 로 두고 `note` 에 다른 후보를 적는다. 초기 삼국사기 기사(3세기 이전)의 신빙성 논쟁은 사실을 버리는 이유가 아니라 `confidence:'medium'` 과 note 의 이유다.
4. **db.history.go.kr 은 열지 않는다**(robots 금지). 원문은 로컬 chunk 로만. 웹은 encykorea.aks.ac.kr, ko/en.wikipedia.org, heritage.go.kr, museum.go.kr, nrich.go.kr 만.
5. **장면은 장소와 행위가 있을 때만.** 호구 수·군현 개명처럼 행위 장면이 어색한 사실은 `facts[]` 에만 넣고 `sceneId: null`. 장면을 만들면 `kind`·`category`·`region`·`decade` 를 채우고, 가능한 것은 `sceneFunction`(temple·market·relief·construction_site·fortress·harbor·kiln·irrigation·migration…)과 `participantGroups`(집단·역할·자세·인원, 인원은 표현값)를 적는다.
6. **지속 효과는 persistence 로.** 도읍·군현·성·절·둑처럼 뒤에 남는 것은 `persistence {kind, from, to|null, basisClaimIds}`. `to` 는 소멸 기록이 있을 때만 적고 없으면 null.
7. **취락·인구는 density 로.** 戶·口·家 숫자가 있으면 `density {households, population, unit, claimIds}` 를 채운다. 만(萬)·천(千) 표기는 숫자로 환산하고 `unit` 에 원문 단위를 적는다.
8. 한 job 안에서 같은 사실을 두 번 세지 않는다. 다른 job 과 겹칠 수 있는 유명 사실(황룡사·평양 천도 등)은 자기 칸의 갈래에 맞을 때만 넣고, 이미 `services/host/app/history-scenes.json` 에 있는 장면(제목으로 grep)은 새 장면으로 만들지 않고 facts 에서 `sceneId` 를 기존 id 로 적는다.
9. 찾지 못한 것은 `missing[]` 에 무엇이 필요했는지 적는다. 억지로 채우지 않는다.

## 검색 방법

작업 폴더는 `C:/Users/gkfkd/Git/sigong-facts` 이다. 원문 검색:

```
python scripts/search_chunks.py --source src-samguksagi --from 500 --to 560 --keyword 築 --limit 40
python scripts/search_chunks.py --source src-samguksagi --locator 新羅本紀 --keyword 市 --format table
python scripts/search_chunks.py --keyword 戶 --keyword 萬 --format table          # 사료 전체
python scripts/search_chunks.py --id chunk_samguksagi_sg_004_0040_0150            # 한 조각 전체
grep -l "渤海" data/sources/jipseong-*/chunks.jsonl                                 # 집성에서 발해 기사가 있는 사서
```

삼국사기 지리지는 `--locator 雜志 --keyword 郡` 처럼 찾는다. 금석문은 `--source src-geumseok-gskh_001` 형식이 아니라 폴더 이름으로 `--source` 를 주거나 `--keyword` 만 준다(검증기·CLI 의 `--help` 를 먼저 읽는다).

웹 원본은 Bash 에서 Python `urllib.request` 로 `raw/<이름>.html` 에 바이트 그대로 저장하고 sha256·byteLength·fetchedUtc 를 manifest 와 sources 에 적는다. 발췌 문장은 HTML 태그를 뺀 텍스트에서 그대로 복사한다.

## 산출물

`data/research/facts-ancient/<job>/` 에 `result.json`, `run.json`, `manifest.json`, `raw/`, `report.md`. 끝나기 전에 반드시 `python scripts/check_fact_research.py data/research/facts-ancient --job <job>` 를 실행해 실패 0 을 확인하고, 그 출력을 report.md 에 붙인다.

## 검수원(적대 검수)

job 마다 다른 조사원이 결과를 반박한다: 검증기 재실행, 무작위 5건의 chunk 를 열어 인용·연도·장소가 맞는지 대조, 좌표 출처 확인, 갈래 할당 충족 여부. CONFIRMED 만 남기고 기각 사유를 report.md 에 적는다. 조사원은 기각된 항목을 고치거나 뺀다.
