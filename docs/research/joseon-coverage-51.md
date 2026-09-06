# 실록 10종의 인물·관직·계보 추가 (#51)

태종·문종·단종·세조·성종·중종·인조·영조·정조·순조실록에서 원문 18개를 인용하고
관계 90개·엔티티 105개를 추가했다. 각 사료의 앞 6개 chunk 안에서 찾은 사례다.
전체 실록의 인물·사건을 전수 추출한 수치가 아니다.

Claude Opus 5 / Max effort 호출은 세션 한도로 종료됐다. 그 전에 저장한 결과에는
10종의 초안 26개가 있다. 이 JSON의 모든 인용을 입력 원문과 정확히 대조한 뒤 반영했다.
에이전트의 완료 표기와 프로세스 실패를 구별하여 [호출 기록](../../data/research/joseon-coverage-51/run.json)과
[중단 메시지](../../data/research/joseon-coverage-51/result.txt)를 함께 보존했다.

목록 형태인 초안을 인물별 참여·직함 관계로 나눠 90개 Claim으로 만들었다.
봉호 변경은 각 봉호와 상대 순서를 연결하고, 정조의 생부와 명에 따른 계승 관계를 나눴다.
단종 총서의 `一子`를 외아들로 확정하지 않았으며 차례의 원 표기는 인용에 남겼다.
동명이인·휘의 빈 글자·대명사 해석의 한계·교감 주석을 구별한다. 새 서기 환산은 하지 않았다.
여러 참여자와 교류 상대를 판독 충돌로 세지 않도록 기존 다치 술어 목록을 보완했다.

[초안→Claim 전수 대응표와 사료별 수](joseon-coverage-51.json),
[원 초안과 미해결 해석](../../data/research/joseon-coverage-51/result.json).

`citation-chunks.jsonl`의 18개 행은 c2 전체 사료에서 받은 JSON 객체 전체를 유지한다.
기존 로더는 전체 사료와 복사본이 둘 다 있으면 같은 ID를 한 번만 센다.
반복 수입은 다른 내용의 기존 파일을 덮어쓰지 않으며 전체 인용·digest 검사를 통과했다.

```bash
python scripts/import_joseon_coverage.py --research /path/to/joseon-coverage-51 \
  --out docs/research/joseon-coverage-51.json
python services/validate.py
python -m unittest discover -s tests
```

사람의 역사 해석 검토는 아직 없다. 시대별·사료별 빈 연결을 보완하는 #51은 계속 열어 둔다.
