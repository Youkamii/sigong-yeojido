# 한사군 학술 GIS와 지점 서술 (#49)

Claude Opus 5 / Max effort의 추가 조사에서 Source 3개·chunk 7개·Claim 10개를 반영했다.
CHGIS의 임둔 1개·현도 2개·낙랑 1개, 모두 4개 재구성 지점을 지도·RDF에 연결했다.
주 렌즈의 **한사군 · 학술 GIS와 지점 서술**에서 볼 수 있다.

CHGIS 레코드 `hvd_112638`, `112640`, `112641`, `112642`를 직접 받아 원 문자열 좌표와
지명·기간·기간 규칙·현재 위치·국가 코드·라이선스를 대조했다. 조사 초안이 확인하지 못한
임둔의 JSON과 첫 현도군 기록의 현재 위치 문자열도 원 JSON에서 확인해 그대로 남겼다.
네 레코드 모두 `CC BY-NC 4.0`을 표시하며 수록한 자료에도 그 조건과 제공처를 명시했다.

학술 GIS의 郡 단위 재구성 점이다. 특정 발굴 유적을 지목한 좌표 근거는 없다.
서로 다른 현도군 기록을 합치지 않으며 AKS 낙랑토성과 CHGIS 낙랑 점의 동일성도 주장하지 않는다.
기간의 음수 연도 체계와 규칙 코드 0/3을 확인하지 못해 원값을 보존했다.
화면에서는 기간 미상으로 조회되고 상세에 원 기간이 보인다. `end=0`을 서기 0년이나
폐지 연도로 바꾸지 않았으며 원 `country code=cn`도 현재 국가 판정으로 옮겨 쓰지 않는다.

한국민족문화대백과사전의 낙랑토성 발췌와 푸순시 정부의 현도군 이치 서술도 HTML에서 대조했다.
낙랑군청을 성 안에 비정한 추정과 112년 노동공원 자리로의 이치 서술을 각각 연결했다.
노동공원 OSM 검색은 robots 제한으로 재대조하지 않았으므로 그 좌표는 수록하지 않았다.

[전수 대조·좌표·해시·보류](hansagun-sites-49.json),
[실제 Opus 호출](../../data/research/hansagun-sites-49/run.json),
[미반영 제안도 포함한 조사 초안](../../data/research/hansagun-sites-49/result.json).

```bash
python scripts/import_hansagun_sites.py --research /path/to/hansagun-sites-49 \
  --cache /path/to/checked-html-and-json --out docs/research/hansagun-sites-49.json
python services/validate.py
```

진번 좌표·모든 군의 대안 지점과 직접 근거는 여전히 부족하다. Q6과 #49는 부분 상태를 유지한다.
사람의 역사 해석 검토는 아직 없다.
