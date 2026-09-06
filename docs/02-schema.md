# 스키마 정본 — 데이터를 어떤 모양으로 쌓는가

> 이 문서가 정본이다. 구현이 이 문서와 어긋나면 **문서를 먼저 고치고** 코드를 맞춘다.
> 비전은 `00-vision.md`, 사료 목록은 `01-sources.md`.

아래 Turtle는 관계를 설명하는 축약 예시다. quote·digest·출처가 생략된 예시는 실제 근거 데이터가 아니다.
실제 입력은 `data/claims/`의 검증된 `claims-json` 형식과 `services/validate.py`를 따른다.

## 0. 설계 원칙 다섯 개

1. **엔티티는 껍데기다.** 인물 노드는 id와 타입만 갖는다. 이름도, 생몰년도, 아버지도 전부 Claim으로 붙는다.
   엔티티에 속성을 직접 박으면 **사료 토글이 작동하지 않는다** — 사료를 끄면 그 사료가 건 Claim만 사라지고
   엔티티는 속성이 줄어든 채 남아야 한다. 이게 이 스키마의 형태를 결정한다.
2. **원문은 RDF에 복제하지 않는다.** 그래프에는 chunk id 문자열만. 원문은 JSONL이 단일 진실.
3. **근거 없는 서술은 없다.** 모든 Claim은 chunk를 가리킨다. 가리키지 못하면 빌드가 거부한다.
4. **AI가 만든 것과 사람이 확인한 것을 섞지 않는다.** 노드마다 딱지가 붙는다.
5. **클래스는 답할 질문이 있을 때만 만든다.** taxonomy 욕심을 내지 않는다.

## 1. 이 스키마가 답해야 하는 질문 (클래스의 근거)

| # | 질문 | 필요한 것 |
|---|---|---|
| Q1 | 삼국사기만 켜고 500년 지도를 보여줘 | Claim이 Source를 가리킴 |
| Q2 | 백제 건국 연도를 사료별로 다 보여줘 | 같은 대상에 상충 Claim 공존 |
| Q3 | 6세기에 살았고 신라 소속인 인물 전부 | 타입 + 시간 + 소속 질의 |
| Q4 | 이 주장의 근거가 뭐야 | Claim → Chunk → 원문 |
| Q5 | 삼국사기와 일본서기가 연도가 다른 사건 전부 | 충돌 자동 검출 |
| Q6 | 한사군 위치 후보 전부와 각각의 근거 | 좌표가 Claim |
| Q7 | AI가 이은 것만 빼고 보여줘 | provenance 필터 |
| Q8 | 이 사료가 다루는 기간이 언제야 | Source에 시간 두 개 |
| Q9 | 이 이름과 저 이름이 같은 사람이라는 근거는 | 동일성이 Claim |

이 아홉 개가 클래스 목록 전부를 정당화한다. 여기 없는 클래스는 만들지 않는다.

## 2. 네임스페이스

```turtle
@prefix syj:  <https://sigong-yeojido.kr/ns#> .
@prefix rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd:  <http://www.w3.org/2001/XMLSchema#> .
@prefix prov: <http://www.w3.org/ns/prov#> .
```

자체 어휘 하나 + 표준 넷. **OWL 추론은 쓰지 않는다.** 검증은 SPARQL 규칙으로 한다.

외부 표준(CIDOC-CRM · OWL-Time · GeoSPARQL)은 **채택하지 않고 매핑만** 단다 — 우리 클래스에
`rdfs:seeAlso`로 대응 클래스를 적어둔다. 나중에 데이터를 내보낼 때 쓰려는 것이지
지금 그 무게를 지고 가지 않는다.

## 3. 층 구조 — 네 층

```
Source (사료)          삼국사기 · 광개토왕비 · 국편 한국사
   │  ↓ 쪼갬
Chunk (원문 조각)      삼국사기 권23 온조왕 즉위조
   │  ↓ 읽음
Claim (주장)           "이 대목은 백제 건국을 기원전 18년이라 말한다"
   │  ↓ 걸림
Entity (세계 요소)     백제 · 온조왕 · 위례성
```

**Claim이 유일한 다리다.** Entity와 Chunk는 직접 연결되지 않는다.

## 4. 클래스 카탈로그

| 클래스 | 무엇 | 근거를 갖나 |
|---|---|---|
| `syj:Source` | 사료 한 종 | — (자기가 근거) |
| `syj:Chunk` | 사료의 한 대목 | — |
| `syj:Claim` | 하나의 주장 | 필수 |
| `syj:Person` | 사람 | 껍데기 |
| `syj:Place` | 장소 | 껍데기 |
| `syj:Polity` | 나라 · 세력 | 껍데기 |
| `syj:Event` | 사건 | 껍데기 |
| `syj:Office` | 관직 · 지위 | 껍데기 |
| `syj:Organization` | 관서 · 조직 | 껍데기 |
| `syj:TimeSpan` | 시간 구간 | Claim에 붙음 |
| `syj:Location` | 좌표 | Claim에 붙음 |
| `syj:Conflict` | 충돌 표시 | 빌드 산출 |

12개. `Organization`은 Q4의 근거 주체를 표현하기 위해 추가했다(#51).
예를 들어 군국기무처가 올린 의안의 주체는 관서이고, 그 안에 규정된 총재는 관직이다. 두 종류를 합치지 않는다.

## 5. Source — 사료

시간을 **두 개** 갖는다. 이게 타임라인의 막대와 점이 된다.

```turtle
syj:src-samguksagi a syj:Source ;
    rdfs:label "삼국사기"@ko ;
    syj:sourceKind "관찬사서" ;
    syj:composedYear 1145 ;                    # 쓰여진 때 → 타임라인의 점
    syj:coversFrom -57 ; syj:coversTo 935 ;    # 다루는 기간 → 타임라인의 막대
    syj:compiler "김부식" ;
    syj:originalLanguage "hanmun" ;
    syj:license "public-domain" ;
    syj:caution "신라 중심 시각. 초기 기록의 연대 신빙성 논쟁"@ko ;
    syj:defaultLens false .
```

`syj:defaultLens true`인 Source들이 지도에서 **진한 선**으로 그려진다(기본은 현대 연구서).
나머지는 흐린 선. 사용자가 토글하면 이 집합이 바뀐다.

`syj:license` 값: `public-domain` / `open` / `restricted` / `unverified`.
**`unverified`가 기본값이다** — 확인 전에는 확인했다고 적지 않는다.

## 6. Chunk — 원문 조각

**id가 출처와 위치를 복원할 수 있어야 한다.** 결정론적으로 만든다.

```
chunk_{sourceId}_{위치}

chunk_samguksagi_23-onjo-01      삼국사기 권23 온조왕조 1번째 단락
chunk_gwanggaeto_2-sinmyo        광개토왕비 2면 신묘년조
chunk_sillok_taejo-01-03-15-2    태조실록 1년 3월 15일 2번째 기사
```

원문은 `data/sources/<sourceId>/chunks.jsonl`에 한 줄씩. RDF에는 **id와 라벨만** 들어간다.

```json
{"id":"chunk_samguksagi_23-onjo-01","sourceId":"src-samguksagi",
 "locator":"권23 백제본기 온조왕 즉위년","lang":"hanmun",
 "text":"百濟始祖溫祚王...","translation":null,"translationSource":null}
```

`translation`은 별도 필드다. **번역문은 원문과 저작권이 다르므로 섞지 않는다.**

## 7. Claim — 이 스키마의 심장

모든 서술이 여기 있다. Claim 하나는 **"어떤 사료의 어떤 대목이, 어떤 대상에 대해, 뭐라고 말하는가"** 다.

```turtle
syj:claim-baekje-founded-samguksagi a syj:Claim ;
    syj:subject syj:polity-baekje ;            # 무엇에 대해
    syj:predicate syj:foundedIn ;              # 어떤 속성을
    syj:objectTime syj:ts-bc18 ;               # 뭐라고
    syj:citesChunk syj:chunk_samguksagi_23-onjo-01 ;
    syj:isSupportedBy "chunk_samguksagi_23-onjo-01" ;   # 규칙 엔진용 리터럴
    syj:fromSource syj:src-samguksagi ;        # 토글의 축
    syj:quote "百濟始祖溫祚王" ;                 # 원문 substring (검증됨)
    syj:origin "human" ;                       # human | ai
    syj:status "stable" ;                      # draft | stable | deprecated
    syj:claimDigest "a3f9..." .                # 주장 내용 SHA-256
```

**인용을 두 번 적는다** — URI 에지(`syj:citesChunk`)는 그래프 탐색용, 문자열 리터럴
(`syj:isSupportedBy`)은 규칙 엔진용. 레퍼런스 구현의 패턴을 그대로 가져온다.

### 7.1 quote 검증

`syj:quote`는 반드시 해당 chunk 원문의 **부분 문자열**이어야 한다(공백 정규화 기준).
아니면 빌드가 실패한다. AI가 원문에 없는 문장을 지어내는 걸 막는 장치다.

### 7.2 claimDigest — 근거 붙여놓고 내용 바꾸기 방지

Claim의 내용(subject · predicate · object)을 SHA-256으로 찍어 저장한다.
근거를 달아둔 뒤 주장을 몰래 고치면 digest가 어긋나 빌드가 거부한다.

논쟁적인 데이터를 다루는 프로젝트라 이게 필요하다 — "이 주장엔 삼국사기 근거가 있다"고
해놓고 주장 내용만 슬쩍 바꾸는 걸 구조적으로 막는다.

### 7.3 origin — AI가 만든 것과 사람이 확인한 것

| 값 | 뜻 |
|---|---|
| `human` | 사람이 넣었거나 확인함 |
| `ai` | AI가 사료를 읽고 뽑았고, 아직 사람이 안 봄 |

`syj:verifiedBy` / `syj:verifiedAt`이 붙으면 사람이 본 것이다.
**화면에서 `ai`만 끄고 볼 수 있어야 한다** (Q7).

## 8. 시간 — 원문 표기를 보존한다

간지 · 연호를 절대연도로 옮기는 순간 정보가 사라진다. 둘 다 보관한다.

국편 XML의 `dateOccured/@date`는 ISO 날짜로 해석하지 않는다. 원표기와 라벨을 보존하고,
현재 연력은 맨 앞의 연도만 사용한다. 음수 연도는 이 프로젝트의 역사 연도 표기
(`-57` = 기원전 57년)이며, 0년을 포함하는 천문학적 연도와 다르다.
`L`·끝자리 숫자의 공식 뜻은 미확인이고 `99`를 실제 월·일로 변환하지 않는다.
여러 날짜 형식이 병기되면 각각의 `type`·값·라벨을 보존한다.
상위 일자의 날짜를 물려받은 기사에는 그 level id도 남긴다.
근거와 예외는 [날짜·글자 조사](research/date-and-character-format.md)에 적는다.

```turtle
syj:ts-yeongnak-6 a syj:TimeSpan ;
    syj:verbatim "永樂六年 丙申" ;          # 원문 그대로
    syj:year 396 ;                          # 변환값
    syj:precision "year" ;                  # year|month|day|decade|century|unknown
    syj:earliest 396 ; syj:latest 396 .     # 불확실하면 범위가 벌어진다
```

`syj:precision`이 `unknown`이면 연도가 없다. **버리지 않고 상대 순서로 담는다.**

```turtle
syj:event-a syj:before syj:event-b .
```

### 8.1 역법 변환 자체가 Claim일 수 있다

같은 간지는 60년마다 돌아오므로 환산 근거를 별도로 남긴다. 아래는 **1주갑, 60년** 차이의 설명용 예시다.
일본서기의 이주갑인상 논의는 **2주갑, 120년** 이동이며 이 예시와 구별한다.
그래서 변환은 데이터에 박는 게 아니라 Claim으로 둘 수 있어야 한다.

```turtle
syj:claim-sinmyo-reading-a a syj:Claim ;
    syj:subject syj:ts-nihongi-sinmyo ;
    syj:predicate syj:convertsTo ;
    syj:objectYear 391 ;
    syj:fromSource syj:src-nihonshoki-literal .

syj:claim-sinmyo-reading-b a syj:Claim ;
    syj:subject syj:ts-nihongi-sinmyo ;
    syj:predicate syj:convertsTo ;
    syj:objectYear 451 ;                    # 391년에서 1주갑 = 60년 이동 (설명용 예시)
    syj:fromSource syj:src-modern-scholarship .
```

렌즈를 바꾸면 **연표 전체가 밀린다.** 이게 제대로 작동하면 이 프로젝트는 성공이다.

### 8.2 현재 저장·조회 계약 (#55)

`object.kind=time`은 `id`, 원문의 연속 문자열인 `verbatim`, `precision`을 필수로 받는다.
`year`, `earliest`, `latest`는 정수 연도 또는 null이다. 음수는 기원전이며 0년은 쓰지 않는다.
한쪽 범위만 알면 다른 쪽은 null로 남긴다. 양 끝이 있으면 earliest ≤ latest여야 하고,
year도 있으면 그 범위 안에 있어야 한다. `calendar`는 출처가 명시한 역법 이름만 적는다.
원문이 서기 연도를 주지 않으면 `convertsTo` 주장의 값과 근거를 따로 남긴다.
같은 TimeSpan ID를 다른 원표기·정밀도·범위로 재정의하면 빌드가 거부한다.

위의 Turtle은 관계를 설명하는 축약 예시다. 실제 `before`/`after`도 subject·objectEntity와
fromSource·citesChunk·quote가 있는 Claim으로 적으며, 대상은 Event 또는 정의된 TimeSpan이다.
환산의 간지 검사는 명시된 연도 간지에만 적용한다. 월 뒤의 일진을 연도 간지로 검사하지 않는다.
기원전 계산은 역사 연도를 천문학적 연도에 대응시킨 뒤 60년 주기를 계산한다.

`GET /api/time?sources=...&origin=all|human|ai`는 원표기·범위, 선택한 사료의 환산 주장,
상대 순서 주장을 구분해 준다. `entity`로 대상을 좁힐 수 있다. 화면의 연대 주장 목록과
시간 막대의 작은 표식에서 원문·환산 근거를 열 수 있다. 서기 환산이 없으면 목록에 미상으로 남긴다.
서로 다른 사료가 붙인 환산값을 한 숫자로 덮어쓰지 않는다. 국편 `L0/L1/99` 코드의 뜻은 여전히 미확인이다.

## 9. 장소 — 좌표도 Claim이다

한사군이 어디였냐는 학설이다. 점 하나를 찍으면 그게 판정이 된다.

```turtle
syj:place-nangnang a syj:Place ;
    rdfs:label "낙랑군"@ko .                 # 껍데기. 좌표 없음

syj:claim-nangnang-loc-pyongyang a syj:Claim ;
    syj:subject syj:place-nangnang ;
    syj:predicate syj:locatedAt ;
    syj:objectLocation [ a syj:Location ; syj:lat 39.02 ; syj:lon 125.75 ] ;
    syj:fromSource syj:src-modern-scholarship ;
    syj:citesChunk syj:chunk_kuksa_nangnang-01 .

syj:claim-nangnang-loc-liaoxi a syj:Claim ;
    syj:subject syj:place-nangnang ;
    syj:predicate syj:locatedAt ;
    syj:objectLocation [ a syj:Location ; syj:lat 41.5 ; syj:lon 120.5 ] ;
    syj:fromSource syj:src-alt-scholarship .
```

지도에는 **켜진 렌즈의 좌표만** 찍힌다. 둘 다 켜면 점이 둘 찍힌다. 그게 맞다.

### 9.1 지명은 시대에 따라 다른 곳을 가리킨다

`locatedAt` Claim에 시간 범위를 붙일 수 있다.

```turtle
syj:claim-hanseong-loc-early
    syj:validFrom -18 ; syj:validTo 475 .
```

## 10. 동일성도 Claim이다

"이 이름과 저 이름이 같은 사람이다"를 조용히 통합하면 학설 하나를 몰래 채택하는 것이다.

```turtle
syj:claim-identity-geunchogo a syj:Claim ;
    syj:predicate syj:sameEntityAs ;
    syj:subject syj:person-geunchogo ;
    syj:objectEntity syj:person-shoko-nihonshoki ;
    syj:fromSource syj:src-modern-scholarship ;
    syj:origin "human" .
```

**`owl:sameAs`를 쓰지 않는다.** 추론기가 자동 병합해버리면 되돌릴 수 없다.
병합은 질의할 때 켜진 렌즈에 따라 한다.

## 11. 충돌 — 빌드가 자동으로 찾는다

같은 `(subject, predicate)`에 서로 다른 값의 Claim이 둘 이상이면 빌드가 표시를 방출한다.
사람이 손으로 적지 않는다.

여러 값을 함께 가질 수 있는 `syj:mentionedIn`, `syj:describedAs`, `syj:instructs`,
`syj:hasTitle`, `syj:hasOutcome`, `syj:subjectToRule`은 이 집계에서 제외한다.
목록은 `services/validate.py`의 `MULTI_VALUED_PREDICATES`가 정본이고 TTL 빌더도 가져다 쓴다.
뷰어의 `MULTI`도 같은 목록을 쓴다. `readsCharacterAs`처럼 판독이 다른 주장은 계속 나란히 표시한다.

```turtle
syj:conflict-baekje-founding a syj:Conflict ;
    syj:aboutSubject syj:polity-baekje ;
    syj:aboutPredicate syj:foundedIn ;
    syj:involvesClaim syj:claim-baekje-founded-samguksagi ,
                      syj:claim-baekje-founded-modern .
```

**충돌은 오류가 아니다.** 검증 게이트를 막지 않고 정보로 표시된다.

반면 아래는 진짜 오류라 빌드를 막는다.

| 검사 | 내용 |
|---|---|
| 근거 없는 Claim | `citesChunk`가 비었다 |
| quote 불일치 | 원문에 없는 문장을 인용했다 |
| digest 불일치 | 근거를 단 뒤 주장이 바뀌었다 |
| 죽은 chunk id | 가리키는 chunk가 없다 |
| 계보 순환 | A가 B의 아버지이고 B가 A의 아버지 |
| 사망 후 등장 | 같은 렌즈 안에서만 검사한다 |

마지막 항목이 중요하다. **다른 사료끼리는 모순이어도 된다.** 한 사료 안에서 앞뒤가 안 맞을 때만 오류다.

### 11.1 실행하는 역사 규칙과 남은 조건 (#54)

검사는 `fromSource`가 같은 주장끼리 수행한다. 선택한 여러 사료를 합쳐 하나의 판정으로 만들지 않는다.
`hasParent`·`childOf`·`descendantOf`는 자식→부모/조상, `parentOf`·`fatherOf`·`motherOf`는 반대 방향이다.
이 방향을 맞춰 순환을 검사한다. `before`·`after`는 엄격한 상대 순서이며 순환을 허용하지 않는다.
여러 부모·조상·상대 순서·등장 시점은 동시에 존재할 수 있으므로 단일 값 충돌 집계에서 제외한다.
뷰어도 API가 제공하는 검증기의 동일한 다중 값 목록을 사용한다.

`bornIn`, `diedIn`, `appearsIn`, `occurredIn`, `occurredAt`, `foundedIn`, `accededIn`의 날짜 객체는
year 또는 time이다. 특히 `appearsIn`은 **살아 있는 사람이 해당 시점에 행동했다는 주장**에만 쓴다.
사망자를 나중에 회고하거나 이름만 언급한 기록은 이에 해당하지 않는다.
같은 사료의 `convertsTo`만 적용하며, 서로 다른 후보 연도는 최소/최대 범위로 남긴다.
명시된 시간 범위들이 겹치거나 끝이 미상이면 역전이라고 판정하지 않는다.
모든 가능한 사망 시점보다 뒤인 등장, 모든 가능한 출생 시점보다 앞인 등장,
명백한 출생/사망 역전과 before/after의 연대 역전만 오류로 보고한다.

지리 검사는 출처가 있는 `physicallyPresentAt` 두 건과, 그 두 건을 직접 가리키는
`minimumTravelHours`가 있을 때 실행한다. 단순 언급·같은 해·현대 대표점은 입력으로 승격하지 않는다.
두 출현의 subject와 fromSource가 같아야 한다. 이름이 비슷한 인물이나 다른 사료를 합치지 않는다.

`physicallyPresentAt`은 해당 인물이 실제로 그 자리에 있었다는 주장이다. object는 location이며
`presence: {earliest, latest, radiusKm}`를 추가한다. earliest/latest는 출처로 환산한 시각의
양끝을 나타내는 ISO 형식 문자열로 날짜·시각·UTC 오프셋을 모두 적는다. radiusKm는
원 자료가 뒷받침하는 위치 오차 반경이다. 값이 없으면 미판정으로 남긴다.
현재 시각 입력은 서기 1~9999년의 명시적 달력 환산에 한정하며 음력·간지를 자동 환산하지 않는다.

`minimumTravelHours`는 literal object의 value에 읽을 수 있는 조건을 적고
`fromPresence`, `toPresence`에 두 출현 Claim id, `hours`에 양수인 이동시간 하한을 둔다.
`uncertaintyIncluded: true`는 인용한 이동시간 하한이 두 위치의 오차 범위까지 고려한다는
명시적 주장이다. 이 조건 자체도 기존의 fromSource·citesChunk·quote 검사를 받는다.
파발 참 간격이나 평균 이동속도를 시간 하한으로 바꾸지 않으며 기본 속도는 없다.

두 시각 범위가 순서대로 떨어져 있고 위치 오차 영역도 겹치지 않을 때,
`늦은 출현 latest − 이른 출현 earliest`를 가능한 이동시간의 최대값으로 사용한다.
이 최대값조차 인용된 시간 하한보다 작으면 `history-geography` 오류다. 같은 값이면 오류가 아니다.
출처·인물이 다르거나 범위가 미상·겹침이면 미판정, 잘못된 참조·숫자·시각은 입력 오류다.
두 술어는 여러 값이 가능한 목록에 포함한다. 조건은 object 안에서 digest와 함께 보호되고,
RDF의 `geographyObject`에도 보존해 그래프 API가 같은 객체를 반환한다.

인공 사례로 불가능·경계값·시차·불확실성·사료 분리와 실제 검증기·TTL 경로를 검사한다.
현재 한국사 원문에서 모든 조건을 충족한 실제 사례는 확보하지 못했다. `report_geography_checks.py`는
실제 적용 건수와 미판정을 별도로 출력한다. 적용 대상 0건이나 자동 검사 통과를 역사적 확정으로 읽지 않는다.

## 12. 파일 배치

```
data/
  sources/
    <sourceId>.md                사료 카드 (머리말에 §5의 필드)
    <sourceId>/chunks.jsonl      원문 조각
  claims/
    <sourceId>/<chunkId>.md      그 대목에서 뽑은 주장들  ← AI가 쓰는 파일
  entities/
    person/<id>.md               껍데기 (id · 타입 · 대표 라벨만)
    place/<id>.md
    polity/<id>.md
    event/<id>.md
  build/
    sigong.ttl                   빌드 산출물
```

**AI가 쓰는 단위는 `claims/<sourceId>/<chunkId>.md` 하나다.** chunk 하나 읽고 파일 하나 쓴다.
엔티티 파일은 얇고, 주장 파일이 두껍다. 빌드가 주장을 모아 엔티티에 붙인다.

마크다운 머리말은 OKF에서 가져온 형태를 쓴다 — `type`, `sources`, `generated`, `verified`, `status`.
**규격 준수가 목표는 아니다.** 쓸모 있는 필드만 빌린다.

## 13. 파이프라인

| 순서 | 명령 | 산출물 |
|---|---|---|
| 1 | `services/ingestion/extract_nikh_xml.py` 또는 사료별 적재 스크립트 | `data/sources/<source>/chunks.jsonl` |
| 2 | (AI) 주장 추출 | `claims/**/*.md` |
| 3 | `python3 services/validate.py` | 근거 · quote · digest 검사 (실패 시 중단) |
| 4 | `python3 services/build_ttl.py` | `data/build/sigong.ttl` + 노드 · 인용 카운트 로그 |
| 5 | `python3 scripts/sync_fuseki.py` | 검증·빌드 후 Fuseki 교체 적재·개수 대조 |
| 6 | 뷰어 | 지도 · 3D · 그래프 · 챗봇 |

Fuseki는 로컬이 아니라 **사용자 서버(c2)에서 돈다.** (2026-09-05: c2 `~/sigong-yeojido/.fuseki/` 에 Temurin 21 + Fuseki 6.2.0 포터블 설치, `scripts/fuseki.sh start|load|query`, 127.0.0.1:3030, 인메모리 데이터셋 /sigong. c3 는 사용자의 개인비서 서버라 쓰지 않는다.)

## 14. 현재 결정과 남은 선택

- 엔티티는 `person-geunchogo`처럼 뜻을 읽을 수 있는 ID를 쓰고 사료별 구별이 필요하면 별도 ID를 둔다.
- Fuseki를 인메모리로 둘지 TDB2로 디스크에 둘지 — 규모를 보고 정한다
- 사료 토글 상태를 어디에 저장할지 (URL 파라미터 / 로컬 저장)
- 2D·3D·RDF는 `services/places.py`의 같은 후보 목록과 사료·시간 조건을 쓴다. 역사 경계도 같은 원 레코드에서 나온다.
- c2 RAM 7.8 GB. 재부팅 자동 시작은 미설정이며 현재 감시 프로세스의 자동 재적재와 구별한다.
