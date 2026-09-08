# ancient_capital_activity — 고대 도성 지속 활동 구간

이슈 #96 중 고대 도성 몫. 지도가 사건 사이에서 비지 않도록, 출처가 **연속으로 진술한** 도읍 기간만 닫힌 구간으로 뽑았다. 장면은 4개이고 모두 `kind: "settlement"` 이다.

## 결과

| scene / event id | 구간 | 위치(지역 기준) | 근거의 성격 |
|---|---|---|---|
| `scene-city-ungjin-capital-475-538` / `event-city-ungjin-capital-475-538` | 475~538 | 웅진(충남 공주), 앵커 `hgis-admin-20613` | 「백제」가 웅진도읍기를 475∼538로 직접 구분 |
| `scene-city-sabi-capital-538-660` / `event-city-sabi-capital-538-660` | 538~660 | 사비(충남 부여군 부여읍), 앵커 `hgis-admin-27192` | 같은 문장이 사비도읍기를 538∼660으로 구분 |
| `scene-city-pyongyang-capital-427-668` / `event-city-pyongyang-capital-427-668` | 427~668 | 평양, 앵커 `hgis-admin-93236` | 「평양시」가 "천도 이후 멸망 때까지 240여 년간 수도" 로 연속을 진술 |
| `scene-city-gyeongju-wolseong-201-935` / `event-city-gyeongju-wolseong-201-935` | 201~935 | 신라 왕경 경주, 앵커 `hgis-admin-157642` | 「경주 월성」이 "신라가 멸망하는 시기까지 지속적으로 사용" 으로 연속을 진술 |

`sources / entities / claims / scenes / missing` 는 `../goryeo_scenes/result.json` 과 같은 스키마다. 구간 클레임은 같은 파일에 이미 쓰이는 `object.kind = "time"` (`verbatim` / `precision` / `earliest` / `latest`) 형태를 따랐고, 도읍 기능의 지속에는 `syj:activeIn` 을 썼다(강화도 국도 구간 클레임과 같은 방식).

## 연속성을 어떻게 확인했는가

첫 언급과 마지막 언급을 이어 붙이지 않았다. 네 구간 모두 출처 문장 자체가 기능의 지속 또는 닫힌 시기 구분을 말한다.

- 웅진·사비: 「백제」가 수도 변천 기준으로 `웅진도읍기(475∼538)`, `사비도읍기(538∼660)` 를 한 문장에서 구분한다. 한 문장에 두 경계가 다 있어 각각 구간 클레임 하나로 담았다.
- 평양: 「평양시」가 427년 천도와 "이후 고구려의 멸망 때까지 240여 년간 수도로 번성" 을 한 문장에서 말한다. 끝 경계 668은 같은 항목의 다른 문장(평양성 함락)을 인용한 별도 클레임이 담는다 — 시작·끝 인용문이 다르므로 클레임을 둘로 나누고 `dateClaimIds` 가 둘 다 가리킨다.
- 경주: 「경주 월성」이 "신라가 멸망하는 시기까지 지속적으로 사용" 이라고 적는다. 끝 경계 935는 「신라」의 왕조 하한 문장에서 왔다.

시작 경계 427(장수왕)·475(공산성)·끝 경계 668(고구려)에는 다른 항목의 두 번째 근거 클레임을 붙였다.

## 남긴 불확실성 (정규화하지 않음)

- **월성 201 vs 101**: 「경주 월성」이 같은 간지(파사 이사금 22)를 내용 요약에서 201년, 본문에서 101년으로 적어 항목 안에서 어긋난다. 두 값을 각각 클레임으로 남겼고 `dateClaimIds` 가 둘 다 가리킨다. `startYear` 는 요약문의 201을 썼다.
- **월성의 고고학 연대**: 같은 항목이 토성 완공을 5세기 초반으로 보고하고 3세기 말∼5세기 후반의 이견을 밝힌다. 특정 연도가 아니어서 연도 클레임으로 만들 수 없었고, 출처별 인용 상한(25어) 때문에 그 문장은 인용에 넣지 않았다. `missing` 에 적었다.
- **평양 도읍기 내부 이동**: 안학궁 일대 → 장안성. 「평양성」은 586년(평원왕 28), 「평양천도」는 "천도 뒤 160년 만" 으로 표현이 다르다. 구간의 끝이 아니라 내부 이동이므로 `syj:describedAs` 로만 남기고 경계로 쓰지 않았다.
- **전승 연대는 쓰지 않음**: 신라 건국 서기전 57년, 백제 건국 기원전 18년은 건국 전승 연대여서 도성 활동 구간의 시작으로 삼지 않았다. 한성도읍기(기원전 18∼475)도 장면으로 만들지 않았다.

## 좌표

네 장면 모두 `precision: "area"`, `coordinateNote` 에 `지역 기준 추정 배치` 를 명시했다. 출처는 왕성 소재지를 시·군·동 수준(공주시 산성동 / 부여군 부여읍 부소산 / 평양 동북 안학궁 / 경주시 인왕동)으로만 적고 도성 범위나 좌표를 주지 않는다. `../goryeo_scenes/existing-place-anchors.json` 의 시군 표시 기준점(국편 1910~1945 행정 경계 자료의 범위 중심)을 썼다. 궁성 지점 좌표가 아니다.

## 인물·효과

- 참여자는 정치체만 두었다(`polity-baekje`, `polity-goguryeo`, `polity-silla`, `presence: "related"`, `side: "civilian"`). 특정 인물이 전 기간 도성에 있었다는 서술을 찾지 못했고, 재위 기간이나 생몰년으로 상주를 추정하지 않았다.
- `effects.fire / ships / attack` 은 네 장면 모두 `false`. 이 구간들은 도성 유지에 대한 것이고 화재·함선·공격을 뒷받침하는 문장이 없다.
- `visualActions` 는 집·저자·관아와 이름 없는 사람들의 평상시 동작으로만 썼다.

## 재사용한 ID

- Polity: `polity-baekje`, `polity-goguryeo`, `polity-silla` (`../existing-catalog.json` 확인)
- Place: `place-sabi`, `place-pyongyangseong`, `place-silla-capital` (같은 파일에서 확인)
- 신규 Place: `place-ungjin-gongju`, `place-gyeongju-wolseong` — 카탈로그에 웅진·월성(신라) 항목이 없었다.
- 앵커: `hgis-admin-20613`(공주), `hgis-admin-27192`(부여), `hgis-admin-93236`(평양), `hgis-admin-157642`(경주)

## 출처와 raw

`manifest.json` 에 `url / fetchedUtc / httpStatus / byteLength / sha256 / rawFile` 를 남겼다. 모두 한국학중앙연구원 한국민족문화대백과사전이며 robots.txt(`Disallow: /Article/Search` 등)의 금지 경로는 건드리지 않았다. 항목 ID는 검색 경로 대신 웹 검색으로 찾아 `/Article/<ID>` 로 직접 받았다.

새로 받은 4건:

| 항목 | URL | bytes |
|---|---|---|
| 평양천도 | `/Article/E0071979` | 79,307 |
| 공주 공산성 | `/Article/E0004450` | 105,709 |
| 부여 부소산성 | `/Article/E0024406` | 114,781 |
| 경주 월성 | `/Article/E0002909` | 113,518 |
| 평양시 | `/Article/E0059979` | 180,429 |

(「평양천도」는 427년 천도와 "160년 만에 장안성" 을 확인하는 데 썼고, 최종 인용은 더 명확한 「평양시」 문장을 택해 result.json 의 sources 에는 넣지 않았다. raw 와 manifest 에는 남아 있다.)

sibling 잡에서 이미 받아 둔 바이트를 그대로 복사해 재사용한 5건 — 원 기록(url/fetchedUtc/httpStatus/byteLength/sha256)을 유지하고 sha256 을 다시 계산해 일치를 확인했다. `manifest.json` 항목에 `copiedFrom` / `provenanceNote` 를 붙였다.

| 항목 | URL | 원본 |
|---|---|---|
| 백제 | `/Article/E0022355` | `../ancient_scenes/raw/enc-E0022355-baekje.html` |
| 신라 | `/Article/E0032800` | `../ancient_scenes/raw/enc-E0032800-silla.html` |
| 고구려 | `/Article/E0003323` | `../ancient_scenes/raw/enc-E0003323-goguryeo.html` |
| 장수왕 | `/Article/E0048605` | `../ancient_scenes/raw/enc-E0048605-jangsuwang.html` |
| 평양성 | `/Article/E0059975` | `../ancient_scenes/raw/enc-E0059975-pyongyangseong.html` |
| robots.txt | `encykorea.aks.ac.kr/robots.txt` | `../ancient_scenes/raw/robots-encykorea.txt` |

## 검증 (`build_result.py`)

빌드 때 다음을 강제하고, 하나라도 걸리면 result.json 을 쓰지 않는다.

- 모든 인용문이 해당 raw 파일의 (공백 정규화된) 본문에 그대로 있는가
- 출처 URL 하나당 인용문 합계 ≤ 25어 — 실제 19 / 24 / 22 / 23 / 8 / 4 / 7 / 23 / 12
- `time` 객체의 `verbatim` 이 인용문 안에 있고, `earliest`·`latest` 가 인용문에 문자열로 나타나는가
- `describedAs` 리터럴 안의 연도 숫자도 인용문에 있는가
- scene 의 `startYear`/`endYear` 가 `dateClaimIds` 의 실제 경계 값에 있는가
- scene 이 가리키는 모든 claim id 와 entity id 가 출력 안에 존재하는가
- 모든 장면이 `precision: "area"` 이고 `coordinateNote` 에 지역 기준 추정 배치가 적혀 있는가
- `effects` 가 근거 없이 켜져 있지 않은가

## 하지 않은 것

- 요청 범위 밖 확장 없음. 도성 구간 4개 외에 사건 장면을 추가하지 않았다.
- 광범위 아카이브 수집 없음. 실제 내려받기는 5건(신규) + 복사 6건이다.
- 다른 잡의 인물·장면을 손대지 않았다.
