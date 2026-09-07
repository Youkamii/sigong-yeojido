# invasion_events — 육상 침입·농성·화재 장면 수집 보고

담당 범위: 부산/동래 1592, 진주 2차 농성 1593, 행주 1593, 명시적으로 인용된 1592년 궁궐 화재 1건,
보성사 독립선언서 인쇄 1919(비전투 장면). 이순신 전기·해전은 다른 수집자 담당이라 손대지 않았다.

## 산출물

| 파일 | 내용 |
| --- | --- |
| `result.json` | sources 10 / entities 25 / claims 53 / scenes 6 / missing 9 |
| `manifest.json` | 실제 요청 14건 (성공 12, 실패 2) — url, fetchedUtc, httpStatus, byteLength, sha256 |
| `progress.json` | 마지막 요청·기록된 장면 목록 |
| `raw/` | 응답 원본 바이트 12개 파일 (+ 실패 응답 1개 `.err`) |
| `txt/` | 인용문 대조용 HTML 제거 텍스트 (검증 보조물, 출처 아님) |
| `fetch.py` / `strip.py` / `build.py` | 다운로드·태그제거·검증 스크립트 |

`build.py`는 인용문마다 (1) 해당 raw 파일의 공백 정규화 텍스트에 **연속 부분문자열로 실재하는지**,
(2) 웹페이지 1건당 인용 단어 수가 25 이하인지, (3) 모든 claimId·excerptId·entityId 참조가 실재하는지,
(4) `presence='on-site'` 참여자와 켜진 effect가 각각 근거 claim을 갖는지 검사한다. 검사를 통과하지 못하면
`result.json`을 쓰지 않는다. 장면 1~3을 먼저 쓰고(부분 저장) 이후 6장면 전체로 덮어썼다.

## 장면 6건

| scene | kind | 연도 | 위치 정밀도 | 좌표 근거 | 참여자 |
| --- | --- | --- | --- | --- | --- |
| `scene-busanjin-1592` | siege | 1592 | area | 기존 anchor `hgis-admin-145002`(부산) | 정발(방어)·일본군(침입)·성안 남녀노소(민간) |
| `scene-dongnae-1592` | siege | 1592 | area | 기존 anchor `hgis-admin-147793`(동래) | 송상현(방어)·일본군(침입)·동래성 백성(민간) |
| `scene-jinju-second-siege-1593` | siege | 1593 | site | 한국관광공사 진주성 페이지(신규 다운로드) | 김천일·황진·최경회(방어)·일본군(침입)·성 안 주민(민간) |
| `scene-haengju-1593` | battle | 1593 | site | 기존 feature `khs-event-haengju` 재사용 | 권율·처영(방어)·일본군(침입)·부녀자 포함 관민(민간) |
| `scene-hanyang-palace-fire-1592` | fire | 1592 | site | 한국관광공사 경복궁 페이지(신규 다운로드) | 난민·일본군 **둘 다 presence='related'** |
| `scene-boseongsa-printing-1919` | publication | 1919 | site | 독립기념관 사적지 페이지(신규 다운로드) | 이종일·김홍규·장효근(printer) |

재사용한 기존 ID: `event-encykorea-jinju-jeontu-1593`, `event-khs-haengju`, `event-declaration-printing-1919`,
`person-encykorea-gwon-yul-e0007022`, `place-khs-haengju`, `place-bosungsa`, feature `khs-event-haengju`,
anchor `hgis-admin-145002`·`hgis-admin-147793`. 동명이인·동명 지명 재사용은 없다.

## 판단이 갈릴 수 있는 지점 — 명시

1. **1592년 궁궐 화재의 방화 주체는 확정하지 않았다.** 임진왜란 항목 한 문단이 『선조수정실록』(난민이 장례원·형조를
   불지름)과 『서정일기』(일본군 방화로 유추 가능)를 나란히 적는다. 두 집단 모두 `presence='related'`로 두고
   역할 문구에 어느 기록에 근거한 서술인지 적었다. 어느 쪽도 현장 방화자로 세우지 않았다.
2. **fire effect는 이 장면에서만 켰다.** 근거는 "1592년 임진왜란으로 궁은 전소되고 말았다",
   "창덕궁 · 창경궁 등도 모두 불에 타버려", "세 궁궐이 모두 불타"라는 실제 소실 문장이다.
   행주대첩 항목에도 성책에 불이 붙었다가 꺼졌다는 서술과 퇴각 시 시체를 불태웠다는 서술이 있으나,
   불이 유지된 장면이 아니어서 행주 장면의 fire는 껐다.
3. **ships effect는 부산진 장면에서만 켰다.** 근거는 "400여척의 병선으로"(부산포 침입) 한 구절이다.
   해전 장면이 아니라 상륙 국면의 배 표현이며, 이순신 담당 범위와 겹치지 않는다.
4. **집단 행위자 타입.** 스키마에 집단(Group) 타입이 없어 "일본군", "성안 백성·주민·관민", "난민(亂民)"을
   `Polity`로 넣었다. 라벨에 '집단 행위자'라고 적어 국가가 아님을 드러냈다. 통합 시 타입 교정이 필요하면 알려 달라.
5. **연도 해상도.** 진주 2차 농성은 원문 "1593년 6월 20일부터 29일까지 열흘 간 계속되었다."를 `ts-jinju1593`
   time 객체에 그대로 넣고 precision은 year로 두었다. 음력 표기를 양력으로 바꾸지 않았고 날짜 범위를 추정하지 않았다.
6. **면적 정밀도 좌표의 성격.** 부산·동래 anchor는 국사편찬위원회 1910~1945 행정구역 경계 자료의 범위 중심점이다.
   20세기 행정구역 중심이므로 16세기 성터 위치가 아니다. 각 장면 `coordinateNote`에 같은 문장을 적었다.

## 채워지지 않은 연결 — 구체적으로

1. **국가유산청 전 도메인 접속 불가.** `www.khs.go.kr`, `royal.khs.go.kr`, `www.heritage.go.kr`,
   `www.cha.go.kr` 모두 20초 시간 초과(재시도 1회 포함, manifest에 1건 기록). 그 결과:
   - 부산진성·동래읍성의 지정 좌표를 얻지 못해 두 장면이 `precision='area'`에 머문다.
   - 진주성 사적 좌표 대신 한국관광공사 대표 지점을 썼다. 기준계·오차 표기가 없고 성곽 범위도 아니다.
   - 행주산성은 기존 feature 좌표를 그대로 재사용했을 뿐, 이번 실행에서 기관 값을 재확인하지 못했다.
2. **동래전투의 노개방(동래교수)·조영규(양산군수)** 는 원문에 있으나 페이지당 25단어 한도 안에서
   날짜·송상현·포위·백성을 우선하느라 인용하지 못했다. 다음 배치에서 이 항목만 추가 인용하면 바로 참여자로 올릴 수 있다.
3. **부산진전투의 정발 외 방어자.** 원문이 "첨사 이하 차례로 전사하고"라고만 적어 이름 있는 다른 현장 인물이 없다.
4. **1592년 화재의 소실 전각 목록.** "전소" 이상으로 어떤 건물이 탔는지 적은 근거가 없어 건물 단위 표현은 만들지 않았다.
   실록 원문은 국사편찬위원회 사이트라 이번 지침대로 요청하지 않았다.
5. **보성사 인쇄 장면의 천도교 지도부.** 손병희는 보성사 소유·자금과 연결되지만 2월 27일 인쇄 현장에 있었다는
   문장을 확보하지 못해 참여자에서 뺐다. 기존 `person-encykorea-son-byeonghui`는 쓰지 않았다.
6. **한양(서울) area anchor 부재.** `existing-place-anchors.json` 354건에 서울·한성·경성 항목이 없다.
   경복궁·보성사는 각각 새로 내려받은 site 좌표로 채웠지만, 서울권 다른 장면을 추가하려면 anchor가 필요하다.
7. **접근 자체를 하지 않은 곳.** `www.jongno.go.kr`는 robots가 `User-Agent: *`에 `Disallow: /`라 요청하지 않았다.
   `www.grandculture.net`(한국향토문화전자대전)은 robots가 다수 AI 크롤러(anthropic-ai 포함)에 `Disallow: /`를
   걸어 두어 UA 문자열상 차단 대상이 아니더라도 요청하지 않았다. `mfis.mpva.go.kr`도 `*`에 `Disallow: /`라 제외했다.
   지침대로 NIKH/KCI/KISS/ITKC 엔드포인트는 요청하지 않았다.
8. **실패한 요청 1건.** `tour.jinju.go.kr`의 진주성 사적 상세 페이지가 HTTP 400을 반환했다(응답 본문
   `raw/jinju-tour-jinjuseong-605.html.err`에 보관). 진주성의 민간인 서술을 지자체 출처로 보강하려던 시도였다.
9. **사용하지 않은 다운로드 1건.** `raw/encykorea-dongnip-seoneonseo-E0015982.html`(독립선언서 항목)은
   내려받았으나 인쇄 장면에 추가로 필요한 구절이 없어 `result.json` sources에 넣지 않았다. manifest에는 남아 있다.

## 라이선스 표기

- 한국민족문화대백과사전 7건: 페이지에 "공공저작물로서 공공누리 제도에 따라 이용 가능합니다."라고 적혀 있다(실제 표기).
- 한국관광공사 2건: "Copyright© Korea Tourism Organization. All Rights Reserved."(실제 표기, 제한적).
- 독립기념관 1건: 하단 주소 이미지 alt의 "Copyright 2021 THE INDEPENDENCE HALL OF KOREA All rights reserved"(실제 표기).

추정 라이선스는 넣지 않았다.
