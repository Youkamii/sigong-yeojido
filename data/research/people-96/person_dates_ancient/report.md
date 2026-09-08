# person_dates_ancient — 배정 Person 23건 연대 연결 보고

조사·수집: Claude Opus 5 (Max). 통합·개발: Root Codex.
산출물: `result.json`(sources/entities/claims/scenes/missing), `coverage.json`, `progress.json`, `manifest.json`, `raw/`.

## 결과 요약

- 배정 23건 중 **22건 dated**, **1건 unresolved**(`person-dong-yangjeong`).
- 출처 20개(모두 한국민족문화대백과사전 항목), Claim 44개, entities 23개(전부 기존 배정 Person ID, 새 ID 없음).
- 술어 사용: `syj:bornIn`/`syj:diedIn`(같은 출처·같은 표에서 쌍으로), `syj:reignedIn`, `syj:activeIn`, `syj:appearsIn`.
- `scenes: []`. 거주·위치 Claim 없음. 재위/생몰에서 위치를 유추하지 않음. Polity 재사용 불필요(모든 연대 Claim 이 Person→시간).

## 원자료 취득

- 새로 내려받은 페이지 17개, 형제 잡에서 복사한 페이지 4개(`enc-E0022785`(법흥왕), `enc-E0054400`(지증왕), `encykorea-E0059033`(조선 태조), `enc-E0003939`(고종)).
  복사본은 원 fetch 시각·httpStatus 를 그대로 보존하고 SHA256 을 재검증해 일치 확인했다(`manifest.json` 의 `reusedFrom`).
- 모든 요청은 robots.txt 확인 후, timeout 15초, 재시도 최대 1회. 전부 HTTP 200.
- `manifest.json` 21건 전부 재검증: 파일 존재·byteLength·sha256 일치.
- 발췌는 내려받은 파일의 태그 제거·엔티티 복원 후 공백 정규화한 실제 본문에서 **정확한 부분 문자열**로 뽑았고, 빌드 시 자동 검증한다(`build_result.py`).
  Claim object 의 모든 연도 숫자와 `verbatim` 문자열이 인용 발췌 안에 그대로 있는지도 자동 검증한다. URL 당 발췌 합계는 25단어 이하(최대 25).

## 연대 근거 (요지)

| Person ID | 연결한 값 | 출처 항목 |
|---|---|---|
| person-asinwang-sg | 재위 392~405 / 기록된 사망 405 | 아신왕 E0034365 |
| person-beopheung | 재위 514~540 | 법흥왕 E0022785 |
| person-encykorea-gojong | 1852~1919 / 재위 1863~1907 | 고종 E0003939 |
| person-encykorea-sammaekjong | 재위 540~576 | 진흥왕 E0055013 |
| person-encykorea-simmaekbu | 재위 540~576 | 진흥왕 E0055013 |
| person-dangun | (전승) BCE 2333~1122 | 단군 E0013538 |
| person-dangun-samgukyusa | (전승) BCE 2333~1122 | 단군 E0013538 |
| person-choechungheon | 1149~1219 | 최충헌 E0057707 |
| person-goryeo-myeongjong | 1131~1202 / 재위 1170~1197 | 명종 E0018365 |
| person-goryeo-wonjong | 1219~1274 / 재위 1259~1274 | 원종 E0040820 |
| person-goryeo-gongminwang | 1330~1374 / 재위 1351~1374 | 공민왕 E0004295 |
| person-daegwanghyeon | 기록된 활동 934 | 대광현 E0014050 |
| person-gimbu | 재위 927~935 / 기록된 사망 979 | 경순왕 E0002611 |
| person-geochilbu | 활동 545~551 / 기록된 사망 579 | 거칠부 E0001944 |
| person-jijeung | 437~514 / 재위 500~514 | 지증왕 E0054400 |
| person-joseon-taejo | 1335~1408 / 재위 1392~1398 | 태조 E0059033 |
| person-goryeo-wangdaebi-1392 | 기록된 활동 1392 / 기록된 사망 1428 | 정비 안씨 E0050291 |
| person-goryeo-jeongchangbuwongun-yo | 1345~1394 / 재위 1389~1392 | 공양왕 E0004385 |
| person-joseon-sejong | 1397~1450 / 재위 1418~1450 | 세종 E0029857 |
| person-jeong-inji | 1396~1478 | 정인지 E0050800 |
| person-baegeo | 기록된 활동 790 | 백어 E0022226 |
| person-hyeonso | 기록된 연도 1611 (성격 주의) | 팔송사 E0059755 |

## 정체 확인에서 특히 조심한 것

- **동명·동자 대입 금지 대상**
  - `person-baegeo`(백어): 민족문화대백과 「백어」 항목이 **관등 일길찬(一吉飡)** 과 **일명 백어(伯漁)** 를 적어, 기존 삼국사기 인용 「以一吉湌伯魚使北國」과 관등·인명이 맞는다. 한자만 같은 다른 伯魚(예: 공자의 아들)를 끌어오지 않았다.
  - `person-encykorea-simmaekbu`(심맥부): 진흥왕 항목의 **한 문장이 深麥夫 를 진흥왕의 이름 표기로 직접 제시**한다. 이 문장이 유일한 근거이며, `person-encykorea-sammaekjong` 과 병합하지 않고 각 ID 에 같은 출처의 재위 구간만 붙였다.
- **단군 2건**: 전승 연대임을 Claim note 에 명시했다. 같은 항목의 출생·사망 연도는 **둘 다 「미상」** 이며, `BCE.2333~BCE.1122` 는 개국 전승의 재위 구간이지 한 사람의 생물학적 수명이 아니다. `syj:appearsIn` 으로만 두었고 `bornIn/diedIn` 을 만들지 않았다. earliest/latest 의 음수는 인용문 「BCE.」 표기의 부호 표현이며 숫자 2333·1122 는 인용문에 그대로 있다.
- **직함만 있는 인물**: `person-goryeo-wangdaebi-1392`(태조실록의 王大妃/大妃)는 작호에 王大妃 가 포함되고 1392년 태조 즉위 때 대비 자격으로 옥새를 넘겼다는 서술이 기존 Claim 의 국면과 겹치는 「정비 안씨」 항목으로 연결했다. 다만 **태조실록 원문이 이 인물을 定妃 安氏 로 명시하지 않으므로** 동일인 확정은 별도 `sameEntityAs` Claim 으로 두어야 한다고 note 에 적었다.
- **`person-goryeo-jeongchangbuwongun-yo`(定昌府院君 瑤)**: 공양왕 항목이 이름을 「왕요(王瑤)」로 적고 재위가 1392년에 끝나는 점이 근거다. **한계를 note 에 명시**했다 — 이 항목은 「定昌府院君」 칭호를 적지 않고, 태조실록도 瑤 = 恭讓 을 명시하지 않는다(원 Claim 의 유보를 유지).
- **`person-gimbu`(金傅)**: 경순왕 항목의 이칭이 「김부(金傅)」이고 왕건이 그를 태자보다 위인 正承公 으로 봉했다는 서술이 기존 고려사 「拜金傅爲政丞, 位太子上」과 겹친다. 표기가 政丞 / 正承公 으로 다르다는 점, 「金傅 를 신라 어느 왕과 동일시할지」라는 원 Claim 의 유보를 확정으로 올리지 않았다는 점을 남겼다.
- **`person-hyeonso`(玄蘇)**: 이 항목은 1591년 사행을 언급하지 않아 동일인 판정은 추정 단계다. 또한 1611년은 **「이정암송사」라는 배가 도항을 시작한 해**이고 그 배가 현소에게 허가되었다는 서술로 현소와 이어지는 값이다. 현소의 생몰년이 아니며, 같은 문장이 그의 출생 해를 간지 「정유(丁酉)」로만 적고 숫자를 적지 않으므로 출생 연도는 만들지 않았다.

## 보존한 사료 간·항목 내 불일치

- `person-gimbu`: **같은 백과사전 항목 안에서** 항목 정보 표는 「사망 연도 979년(경종 3)」, 내용 요약은 「978년에 승하했다.」로 서로 다르다. 어느 쪽이 옳다고 정하지 않고 표의 값을 대표값으로 두되 불일치를 note 에 남겼다.
- `person-daegwanghyeon`: 항목이 귀화 시기에 대해 기록마다 다르다고 명시하므로 934년은 이설 없는 확정 연도가 아니다(발췌 `ex-daegwanghyeon-dispute` 로 보존).
- `person-encykorea-sammaekjong`/`simmaekbu`: 항목 정보 표의 출생 연도가 「534년(526년)」으로 두 수치를 병기하므로 **출생 연도 Claim 을 만들지 않았다**(발췌 `ex-jinheung-life` 로 보존).
- `person-baegeo`: 백과사전은 파견처를 「발해」라 하고 삼국사기 본문 글자는 「北國」이다. 원 Claim 의 지적대로 北國=渤海 동정은 사료 본문의 주장이 아니므로 그대로 남겼다.
- `person-encykorea-gojong`: 인용한 재위 구간(1863~1907)은 항목이 「조선의 제26대」 왕으로서 서술한 값이다. 대한제국 황제 재위만을 숫자로 적은 문장은 발췌에 없으므로 이 구간을 대한제국에 한정해 해석하지 않았다.

## 미해결 1건

**`person-dong-yangjeong` (佟養正)** — status `unresolved`.

1. 민족문화대백과사전에 「동양정」/「佟養正」 표제 항목이 검색되지 않음.
2. 대안으로 민족문화대백과 「임진왜란」 항목(E0047674)을 **실제로 내려받아**(manifest 기록, 280,826 bytes) 본문 전체를 검사 — 「현소」 0회, 「동양정」 0회, 「佟」 0회.
3. 연도(1592)가 표기되는 조선왕조실록 원문 페이지 `https://sillok.history.go.kr/id/wna_12506011_007` 은 **robots.txt 차단**으로 내려받지 않음(같은 도메인의 태조실록·선조실록 4개 URL 모두 ROBOTS-DISALLOW 확인).
4. 기존 Claim 의 `chunk.date`(1592-06-11)는 인용문 밖 메타데이터이므로 연도 근거로 승격하지 않았다. 확인되지 않은 연도를 만들지 않고 공백으로 둔다.

## 남는 작업 제안 (이 잡의 범위 밖)

- `person-dong-yangjeong` 은 국사편찬위원회 한국사데이터베이스 등 robots 가 허용하는 다른 국편 경로에서 1592년 기사 원문 페이지를 확보하면 해결 가능하다.
- 동일인 확정이 필요한 3건(`왕대비 1392` ↔ 정비 안씨, `定昌府院君 瑤` ↔ 공양왕, `현소` ↔ 선조실록 玄蘇)은 별도 `sameEntityAs` Claim 으로 세우는 편이 낫다. 이 잡에서는 병합하지 않았다.
