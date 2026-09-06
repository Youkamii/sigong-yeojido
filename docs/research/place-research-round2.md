# 고려사·삼국유사 지명 2라운드 (#18)

2026-09-06. 개발·통합은 Codex, 조사 8건과 별도 검증 3건은 Claude Opus 5 / Max effort로 수행했다.
실제 응답 모델은 11건 모두 `claude-opus-5`였다. 별도 터미널 창 없이 `CREATE_NO_WINDOW`로 실행했다.

## 범위와 수

| 사료 | 서로 다른 지명 색인 표기 | 출현 횟수 | 이번 표제 | 좌표 후보 | 위치 미정 |
|---|---:|---:|---:|---:|---:|
| 고려사 | 5,524 | 16,876 | 40 | 54 | 3 |
| 삼국유사 | 660 | 1,113 | 40 | 53 | 1 |

기존 이슈에 적힌 수는 서로 다른 표기 수와 출현 횟수가 섞여 있었다. 실제 `index-terms.jsonl`의
`type=지명`만 세고 빈 표기를 빼서 정정했다. 많은 순으로 정렬하고 동률이면 문자순으로 정해 상위 40개씩 조사했다.
입력 목록은 `data/research/{goryeosa,samgukyusa}-place-index.json`이다.

새 기록은 사료별 id를 써서 기존 60개와 합쳐 **140개**가 된다. 같은 표기만으로 기존 지명과 합치지 않는다.
원문 검색과 사료 선택도 `sourceId`에 맞춰 제한한다. 원문 색인 횟수는 검색 결과 수와 다를 수 있다.
색인에는 주석의 글자나 인명 문맥도 섞여 있기 때문이다.

## 검증과 반영

- 원문 인용·출처·색인 수·id·좌표 형식·기간을 80개 전부 검사했다. 최종 107개 좌표를 Wikidata의 실제 P625와 대조했다.
- 별도 조사자가 32개 표제를 골라 역사 출처·시대·현대 참조점 연결을 다시 확인했다. 모든 원문 출현의 역사적 위치를 검증한 결과는 아니다.
- 주요 지적 7건을 포함한 검토 결과와 수정 전후는 [감사 기록](place-round2-audit.json), 좌표 전수 대조는 [검증 결과](place-round2-validation.json)에 있다.
- 행정기구 설치·천도·절 창건 연도를 지명 자체의 시작으로 옮긴 값을 바로잡았다. 출처가 갈리면 기간을 비워 두었다.
- 사료 표본과 연결되지 않은 고려 동경의 요양 후보, 광역 동계·북계의 근거 부족 참조점 등을 제외했다. 삼국유사 신화의 태백산은 실제 해당 인용이 있는 표제에 묘향산·백두산 견해를 함께 두었다.
- 원문 `平壌`을 `平壤`으로 바꾼 인용 한 건을 복원했다. 왕검은 로컬 원문에서 `王之都王儉`을 확인하고 인용 구간을 넓혔다. 인명 `壇君王倹` 표본은 그 지명 근거에서 제외했다.
- 고려사 40개와 삼국유사 40개는 **AI 조사 후보**다. 인간 승인이나 Claim 승격을 뜻하지 않는다. ‘위치 확정’으로 보이던 배지는 #34에서 ‘좌표 후보’로 고쳤다.

`region`은 넓은 지역의 참조점, `approx`는 근사 참조점이다. 도시 중심점은 역사적 성터·관아·경계의 확정 좌표가 아니다.
경쟁 학설과 서로 다른 문맥의 동명 지명은 각 note·view에서 구별한다. 모든 이설에 좌표를 만들어 붙이지 않는다.
이번 파일은 뷰어 조사 자료이며 `data/claims/`와 기존 TTL 주장에는 추가하지 않았다.

## 재현

```bash
python scripts/prepare_place_research.py --source goryeosa --top 40 --out data/research/goryeosa-place-index.json
python scripts/prepare_place_research.py --source samgukyusa --top 40 --out data/research/samgukyusa-place-index.json
python scripts/check_place_research.py data/places-candidates-goryeosa.json data/places-candidates-samgukyusa.json --wikidata --report /tmp/place-check.json
.venv-build/bin/python scripts/verify_place_research.py --url 'http://127.0.0.1:8870/?q=low' --out /tmp/place-viewer
```

Wikidata는 이후 수정될 수 있다. 저장된 검증 결과에는 당시 확인한 좌표와 확인 시각을 남겼다.
조사 호출의 원시 기록·입력·중간본은 로컬 `%TEMP%/sigong-places-opus5/`에 있다.
고려사 별도 검증은 CLI의 성공 결과와 review 파일이 생성된 뒤 기록 도우미가 메시지 형식 차이로 실패했다.
재호출하지 않고 실제 성공 이벤트에서 모델·세션 정보를 복구했으며, 알 수 없는 OS 종료 코드는 null로 남겼다.

국편 웹 본문 두 도메인은 접근하지 않았다. 이미 받은 벌크 원문과 공개 기관·학술 자료를 사용했다.
