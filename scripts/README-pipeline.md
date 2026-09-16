# 조사 결과 재적재 순서

조사 결과(`data/research/<컬렉션>/<잡>/result.json`)를 저장소에 다시 넣을 때는 아래 순서를 그대로 지킨다.
순서가 어긋나면 개체 이름이 정리 전 표기로 돌아가거나(4단계를 건너뛴 경우) 그래프에 옛 이름이 남는다(5단계).

```sh
# 1. 적재 — 주장·발췌·개체 껍데기를 data/ 에 쓴다
python scripts/import_period_research.py --research data/research/<컬렉션>/<잡> \
    --collection <컬렉션> --out docs/research/<컬렉션>/<잡>.json

# 2. 검증 — 바뀐 내용을 사람이 확인한 뒤 digest 를 새로 적는다
python services/validate.py --write-digests

# 3. 장면 — 기존 장면은 두고 같은 id 만 갈아 끼운다
python scripts/build_history_scenes.py --research data/research/<컬렉션>/<잡> \
    --collection <컬렉션> --merge

# 4. 이름 정리 — 새로 들어온 개체 이름을 화면 규칙으로 정리한다 (#200)
python scripts/clean_entity_labels.py --apply

# 5. 그래프 — Turtle 을 다시 만든다
python services/build_ttl.py
```

## 4단계를 빠뜨리면 안 되는 이유

`import_period_research.py` 는 조사 결과의 `entities[].label` 을 그대로 껍데기 파일에 쓴다.
조사 결과에는 `철종 (조선 제25대, 민족문화대백과 E0056172)` 처럼 설명과 자료 번호가 이름에 붙어 있는 값이 들어 있고,
`data/research/**/result.json` 자체는 정리하지 않았으므로 **다시 적재할 때마다 정리 전 이름이 되살아난다.**

`clean_entity_labels.py --apply` 가 그 이름을 다시 정리한다.

- 이름에서 뗀 설명 → `labelNote`
- 설명에 섞인 자료 식별자(`HGIS 176301`, `민족문화대백과 E0056172`) → `sourceRef` (화면에 보이지 않는다)
- `집단 행위자` 꼬리 → `kind: "group"`
- 정리 전 이름 → `aliases` (옛 이름으로도 계속 검색된다)

멱등이다 — 이미 정리된 데이터에 다시 돌리면 `"cleaned": 0` 이 나오고 파일은 하나도 바뀌지 않는다.
정리 결과 같은 유형에 같은 이름이 둘 생기면(`sameEntityAs` 로 묶이지 않은 채) 그 개체들은 손대지 않고
충돌 목록으로만 보고한다 — `--report <경로.json>` 으로 목록을 받는다.

## 왜 적재기가 자동으로 부르지 않나

`clean_entity_labels.py` 는 `data/entities` 전체(13,000여 개)를 훑어 충돌 판정을 다시 한다.
칸 하나를 적재할 때마다 저장소 전체 이름을 손대는 것은 적재기의 일이 아니고, 적재 diff 에 무관한 파일이 섞여
사람이 검토하기 어려워진다. 그래서 적재기는 마지막에 다음 단계를 표준 오류로 알려 주기만 한다(4~5단계).

1~3단계 명령의 근거는 `docs/HANDOVER.md` 의 재적재 기록이고, 4~5단계는 #200 작업에서 직접 돌려 확인했다.
사실 조사 레이어(`summarize_facts.py`, `build_fact_layers.py --merge`)를 함께 갱신하는 컬렉션은
3단계와 4단계 사이에서 돌린다.
