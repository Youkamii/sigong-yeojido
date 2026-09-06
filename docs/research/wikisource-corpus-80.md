# 공개 고전 전사본 6종·113페이지 (#80)

2026-09-07. Claude Opus 5 / Max가 확인한 공개 사료 단서를 바탕으로 실제 페이지를 내려받고 본문을 연결했다. [수집 페이지·revision·HTML 해시·결손](wikisource-corpus-80.json)과 [전체 문자 대조](wikisource-corpus-80-audit.json)를 보존했다.

| 전사본 | 실제 수집 | 확인한 한계 |
|---|---|---|
| 고려도경 | 표제·40권·序·行狀·跋文, 44페이지 | 페이지가 모두 있다는 뜻이다. 원판본의 그림과 텍스트 전면 대조는 하지 않았다 |
| 신증동국여지승람 | 표제·卷001~033, 34페이지 | 034~055는 미수록. 033은 다른 권보다 짧아 권 내부의 완전성 미확인 |
| 계원필경집 | 표제·序·20권, 22페이지 | 後記·附錄 없음. 표제의 제공처 품질 표시는 25%, 결자 경고가 있음 |
| 발해고 | 중국어 전사본 1페이지 | 한국어 위키문헌의 여러 판본·번역과 합치지 않음 |
| 동국통감 | 표제·卷一~三·外紀·부속 글, 9페이지 | 나머지 권 전문은 없음 |
| 매천야록 | 표제·卷之一·二, 3페이지 | 三~六 없음. 두 권의 내부 완전성도 원판본과 미대조 |

계원필경집 卷一은 연구 단서에서 위키텍스트 784 bytes라 목차일 수 있다고 보았다. **실제 렌더링 본문은 4,175자이고 표문 본문이 있다.** 크기만으로 결손을 판정하지 않았다. 고려도경 표제는 四庫全書 수록이라고 쓰지만, 그 설명만으로 전사의 저본 실물까지 대조한 것은 아니다.

## 실제 수집 경로

중국어 위키문헌의 현재 robots는 일반 `action=query/parse` API를 차단한다. 첫 실행은 로컬 robots 검사에서 멈췄으며 API에 요청하지 않았다. 제공처가 허용한 `/wiki/` 공개 본문 페이지를 1초 이상 간격으로 읽었다. 원 페이지와 같은 작품 아래의 공개 링크만 따랐으며 검색·편집·API·프록시 경로로 우회하지 않았다. 처음 계획한 위키텍스트 확보는 **NOT_RUN**이고 실제 받은 원 HTML을 gzip으로 보존했다.

각 HTML에 실린 `wgArticleId`·`wgRevisionId`와 전체 HTML SHA256을 함께 기록한다. 다른 문서나 틀에서 불러온 내용은 원 페이지 revision만으로 고정되지 않으므로, 미래의 같은 revision 재렌더링과 바이트가 같다고 보장하지 않는다. 저장한 실제 HTML에서 본문·머리말·글자 설명·이미지 참조를 재현한다.

본문 중 편집 버튼·라이선스 상자·목차 표시 같은 화면 요소만 제외했다. 위키문헌 머리말과 결자 경고는 `headerText`, 글자에 붙은 title 설명은 `editorialTitles`, 제공처 품질 표시는 `publisherQualityFlag`에 남는다. 今上御名과 title의 眘 설명 같은 피휘 표시는 고쳐 쓰지 않았다. 이미지 내용을 자동 전사하지 않았다. 표제·목차 페이지는 `source-metadata`로 구별한다.

각 원 페이지 하단에서 CC BY-SA 4.0 링크를 직접 확인했다. Source 카드와 chunk에 출처·라이선스·영구 버전 링크를 남기고 편집 이력을 통해 위키문헌 편집자를 표시한다. 같은 조건으로 재배포하며, 기관의 원판본·전문·한글 완역본을 확보했다는 뜻으로 쓰지 않는다. 편찬연도와 대상 기간은 이번 전사에서 별도로 확정하지 않아 미상이다.

## 검증

전체 변환을 다시 실행해 Source 카드·본문·수집 메타데이터·원 HTML 131개 파일의 바이트가 같음을 [비교 기록](wikisource-corpus-80-repeat.json)으로 확인했다.

표준 라이브러리 HTMLParser로 추출한 결과를 BeautifulSoup/lxml의 별도 DOM 파서로 다시 읽어 대조했다. 본문과 머리말의 공백을 제외한 글자가 **113페이지 모두 일치**했다. 독립 검사에서 실패는 0이다. 전사문 자체의 역사·교감 정확성을 보증하는 검사는 아니다. 편집 표지 분리와 피휘 설명·이미지 전사 미실행을 다루는 검사 2개도 통과했다.

조사 호출은 구독 한도로 중단됐지만 결과 파일은 남겼다. [원 실행 기록](../../data/research/wikisource-corpus-80/run.json)의 종료 코드 1과 오류 상태를 그대로 보존했다. Codex가 실제 공개 페이지를 대조하고 추출기를 구현했다. 운영 검사는 c2 배포 기록에 별도로 남긴다.

```powershell
python -X utf8 scripts/fetch_wikisource_corpus.py --cache "$env:TEMP/sigong-wikisource-80"
python -X utf8 scripts/import_wikisource_corpus.py --cache "$env:TEMP/sigong-wikisource-80" --research "$env:TEMP/sigong-goal-opus5/source-gaps-52-12" --out docs/research/wikisource-corpus-80.json
python -X utf8 scripts/verify_wikisource_corpus.py --out docs/research/wikisource-corpus-80-audit.json
```
