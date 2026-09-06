# 국사편찬위원회 문의 #12 — 제출 창구 확인 보고 (조사 전용, 미발송)

작성일 2026-09-07. 조사만 수행했고 개발·통합은 Codex 담당이다.
**누구에게도 메시지를 보내지 않았다 (`sent: false`).**

## 1. 결론

| 항목 | 값 |
| --- | --- |
| exactOfficialUrl | https://www.data.go.kr/data/15053635/fileData.do |
| department | 교육부 국사편찬위원회 **연구편찬정보화실** |
| channelType | **phone** (공개 업무 전화) |
| publicAddressOrNumber | **02-500-8387** |
| loginRequired | **false** (해당 필드는 로그인 없이 공개된 응답 본문에 있음) |
| sent | false |

확인된 국편 직통 공개 창구는 **전화 1종뿐이다.** 공개 업무 메일과 문의 URL은 확인하지 못했다.

## 2. 직접 확인한 사실

내려받아 둔 공식 HTML 3건의 `관리부서명`·`관리부서 전화번호` 필드가 **완전히 일치**했다.

- `data-15053635.html:2677-2685`
- `data-15115521.html:2675-2683`
- `data-15115618.html:2675-2683`

```html
<strong class="key">관리부서명</strong>
<div class="value">연구편찬정보화실</div>
...
<strong class="key">관리부서 전화번호</strong>
<div class="value">
  <span id="telNo"></span>
  <script>
    let telNo = "025008387";
```

원본값은 `025008387`이고, 표시값 `02-500-8387`은 **같은 페이지가 스스로 적용하는** 포맷 스크립트
`telNo.replace(/(^02.{0}|^01.{1}|[0-9]{3})([0-9]+)([0-9]{4})/,"$1-$2-$3")`의 결과다.
내가 임의로 자릿수를 나눈 추정이 아니다.

부수적으로 15053635의 `이용허락범위`는 `제한 없음`으로 표기되어 있었다 (`data-15053635.html:2859-2862`).

## 3. NIA 창구와 국편 창구의 구분

지시대로 아래는 **국편 직통이 아니므로 배제**했다.

| 창구 | 출처 | 소속 |
| --- | --- | --- |
| opendata_help@nia.or.kr | `data-15053635.html:3122` 푸터 '운영자 메일 상담' | NIA |
| 1566-0025 | 제공신청 안내 페이지 | NIA |
| odmc@nia.or.kr | 제공신청 안내 페이지 | NIA |
| /bbs/faq/selectFaqList.do ('문의하기') | `data-15053635.html:720, 2372, 3130` | 포털 일반 문의 |

데이터셋 페이지의 **'문의하기' 메뉴는 포털 FAQ 목록**(`/bbs/faq/selectFaqList.do`)으로 연결되며,
국편 부서로 가는 창구가 아니다. 세 HTML 어디에도 **공식 담당자 연락처 조회 링크는 없었고**,
국편 도메인 메일 주소도 없었다.

## 4. 확인한 URL (3건 + robots)

HTML 대조를 먼저 끝낸 뒤, 미확인 항목에만 fetch를 썼다.

1. `https://www.data.go.kr/robots.txt` — Googlebot 전용 규칙만 존재.
   Disallow: `/tcs/dss/selectDataSetList.do`, `/tcs/vas/`, `/tcs/lms/mpm/`, `/bbs/dnb/`, `/bbs/dsb/`, `/bbs/qna/selectQna.do`.
   조회한 경로는 그 목록에도 없다.
2. `https://www.data.go.kr/tcs/dor/insertDataOfferReqstProcssView.do` — **공공데이터 제공신청 안내 URL 확정.**
   절차 4단계(자료 확인 → 신청서 제출 → 10일 심사 → 제공) 안내이며 **로그인 없이 열람된다.**
   단 이 페이지에 적힌 연락처는 전부 NIA다.
3. `https://www.data.go.kr/tcs/dor/insertDataOfferReqstDocView.do` — **실제 신청서 작성은 로그인 필요.**
   `302 Found → /uim/login/loginView.do?login_error=2 → auth.data.go.kr SSO`.
   리다이렉트를 따라가지 않고 **'로그인 필요'로 기록**했다. 우회하지 않았다.

robots 금지 목록의 db.history.go.kr, contents.history.go.kr, hgis.history.go.kr,
www.history.go.kr, sillok.history.go.kr, db.itkc.or.kr은 **열지 않았다.**

## 5. 추측과 구분해서 남기는 판단

아래는 확인한 사실이 아니라 **내 판단**이다.

- 공공데이터 제공신청은 *포털에 없는* 데이터를 새로 신청하는 절차이고 NIA가 중개한다.
  초안 2건은 **이미 공개 배포 중인 자료의 이용범위·규격 문의**여서 이 창구의 목적과 어긋난다.
  제출 창구로 권하지 않는다.
- 확인된 창구가 전화뿐인데, 초안은 각각 4개·8개 문항의 장문 서면 질의다.
  전화로는 원문 그대로 접수되지 않는다. 실무적으로는 **02-500-8387로 연구편찬정보화실에
  서면 접수 경로(업무 메일 또는 공문 접수처)를 먼저 문의하는 순서**가 맞다고 본다.
  단 이는 사용자 결정 사항이며, 나는 연락하지 않았다.

## 6. 미해결 (unresolved)

확인 불가도 유효한 결과로 남긴다.

- 국편 연구편찬정보화실 **공개 업무 이메일: 미확인.** 공식 HTML 3건에 국편 메일이 없다.
  도메인 패턴으로 추정하지 않았다.
- 국편 자체 홈페이지 **문의 URL: 미확인.** www.history.go.kr이 robots 금지라 열지 않았다.
- 데이터셋 페이지 **'오류신고 및 문의' / '데이터 개선요청' 팝업의 접수 경로·로그인 여부: 미확인.**
  `fn_callErrorReportPopup` / `fn_callDataImproveReportPopup`은 외부 JS 함수이고 엔드포인트가
  HTML에 없다. 엔드포인트를 추측하거나 숨은 API를 호출하지 않았다.
- 따라서 **초안 2건을 원문 그대로 접수할 서면 창구는 아직 확정되지 않았다.**

## 7. 산출물

- `progress.json` — 중간 결과
- `result.json` — 최종 결과 (요청 필드 전부 포함)
- `report.md` — 이 문서
