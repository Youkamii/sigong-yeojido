---
type: Source
id: src-gwanggaeto
label: 광개토왕릉비
labelHanja: 國岡上廣開土境平安好太王 碑
sourceKind: 금석문
composedYear: 414
coversFrom: -37
coversTo: 414
compiler: 장수왕
originalLanguage: hanmun
defaultLens: false
license: open
licenseDetail: CC BY-SA 4.0
licenseVerifiedAt: 2026-09-04
licenseVerifiedVia: https://ko.wikisource.org/w/api.php?action=query&meta=siteinfo&siprop=rightsinfo
status: draft
generated:
  by: claude-opus-5
  at: 2026-09-04
verified: null
sources:
  - id: wikisource-362770
    resource: https://ko.wikisource.org/wiki/%EA%B5%AD%EA%B0%95%EC%83%81%EA%B4%91%EA%B0%9C%ED%86%A0%EA%B2%BD%ED%8F%89%EC%95%88%ED%98%B8%ED%83%9C%EC%99%95_%EB%B9%84%EB%AC%B8
    author: 위키문헌 기여자
    revision: 362770
    license: CC BY-SA 4.0
    fetched: 2026-09-04
---

# 광개토왕릉비

414년 장수왕이 아버지 광개토왕의 능 앞에 세운 비석. 네 면에 한문이 새겨져 있다.
고구려가 자기 손으로 남긴 기록이라는 점에서 다른 어떤 사료와도 지위가 다르다 —
삼국사기는 1145년 고려가, 일본서기는 720년 일본이 쓴 것이지만 이 비석은 **당대 고구려가 썼다.**

## 담고 있는 것

| 면 | 내용 |
|---|---|
| 1면 | 추모왕(주몽) 건국 전승 → 왕계 → 광개토왕 즉위·사망·비 건립 → 영락 5년·6년 정벌 |
| 2면 | 백제 공격, 성 목록, 8년·9년·10년 기사 |
| 3면 | 신라 구원, 14년 대방계 전투, 17년 정벌, 20년 동부여 — **결자가 특히 많다** |
| 4면 | 수묘인 연호 목록 + 수묘인 관리 규정 |

## 조심할 것

**이 텍스트는 학술 판독문이 아니다.** 위키문헌의 전사본이고, 어느 판독본(水谷悌二郎본·王健群본·
노태돈본 등)을 따랐는지 페이지에 밝혀져 있지 않다. 문서에 `{{정리 필요}}` 유지보수 딱지도 붙어 있다.
**파이프라인을 굴리기 위한 1차 재료이지, 이 판독을 정본으로 삼아서는 안 된다.**
학술 판독본을 별도 Source로 추가하고 대조하는 것이 다음 과제다.

**글자 수가 통설과 어긋난다.** 통설은 1,775자인데 이 전사본은 한자 1,638자 + 결자 180곳 = 1,818자로
집계된다(43자 차이). 집계 방식 차이일 수도, 전사본의 문제일 수도 있다. **확인 안 됨.**

**결자가 180곳이다.** 비석이 마모·손상된 자리다. 결자를 추정으로 메운 판독본이 여럿이고
그 추정이 곧 학설이다. 결자는 결자로 보존하고, 메우는 것은 Claim으로 둔다.

**본문에 편집자 주석이 섞여 있다.** 예: `渡海(或解作"每"字)` — "海"를 "每"로 읽는 설이 있다는
주석이 괄호로 원문 안에 들어와 있다. chunk를 만들 때 **원문과 주석을 분리해야 한다.**

**신묘년조는 한국 고대사 최대 쟁점 중 하나다.**

```
而倭以辛卯年來渡海(或解作"每"字)破百殘，{{?}}{{?}}新羅以為臣民
```

글자 몇 개의 판독과 구두점 위치에 따라 주어가 왜(倭)가 되기도 하고 고구려가 되기도 한다.
일본 학계의 임나일본부설이 이 구절에 기대어 왔고, 한국 학계는 판독·해석 양쪽에서 반박해 왔다.
**어느 쪽도 정본으로 삼지 않는다.** 각 판독을 별도 Claim으로 담고, 근거를 나란히 놓는다.

## 라이선스

두 가지를 구분해야 한다.

- **비문 자체**(414년) — 저작권 소멸. 공공영역
- **이 전사 텍스트** — 위키문헌 기여자들의 편집물로 CC BY-SA 4.0. 재배포 시 출처 표기 + 동일조건

머리말의 `license: open`은 후자에 대한 것이다. **확인됨** — 위키문헌 API(`meta=siteinfo&siprop=rightsinfo`)가
`https://creativecommons.org/licenses/by-sa/4.0/deed.ko` / `Creative Commons Attribution-Share Alike 4.0`을
직접 반환했다(2026-09-04 확인).

동일조건 조항(Share Alike)이 붙으므로, 이 텍스트를 실은 산출물을 배포할 때 라이선스가 전파된다.
**우리가 직접 쓴 주장·주석은 별개다** — 원문과 우리 서술을 파일 단위로 분리해 두는 이유이기도 하다.

## 원본 파일

| 파일 | 내용 |
|---|---|
| `gwanggaeto/raw.wikitext` | 위키문헌 위키텍스트 원본 (revid 362770, 2,951자) |
| `gwanggaeto/fetch-meta.json` | 수집 출처·시각·리비전 |
| `gwanggaeto/chunks.jsonl` | chunk 추출 산출물 (F2) |

`raw.wikitext`는 **손대지 않는다.** 가공은 전부 chunk 추출 단계에서 한다.
