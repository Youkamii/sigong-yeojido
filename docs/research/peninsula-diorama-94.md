# 한반도 안의 시대 장면 — #94

사용자가 제공한 Fantology 화면처럼 한반도 윤곽의 입체 바닥 안에 인물·건물·마을·숲·사건을 함께 놓는다.
이전의 사각 지형판, 별도 진열대, 장소의 빛기둥은 제거했다. 원래 렌더링 엔진과 공용 재질·스타일·vendor는 수정하지 않았다.

## 표시와 자료

- Cliopatria의 기존 저장 레코드 `cliopatria-13124` 외곽을 표시용 한반도 모양으로 사용한다.
  고정 배경이며 선택 연도의 국경이라고 주장하지 않는다. `korea-outline.json`에 원본 파일 해시와 속성을 보존했다.
- 저장된 고도 격자를 완만하게 표현하고, 해안선에 따라 입체 바닥을 잘랐다. 새 지형 조사·다운로드는 없다.
- 사건의 날짜가 맞는 직접 위치는 원래 좌표를 사용한다. 행주대첩의 기관 목록 좌표와 Claim 연결을 유지한다.
- 기존 지명 또는 국편 군·부 레코드에서 이름이 연결되면 주변에 상징 모형을 놓는다. 국편 자료의 범위 중심은
  지명 배치 참고점이며 역사적 현장이나 인물 위치에 대한 새 주장으로 적재하지 않는다. 동명이면서 중심이 크게 갈리는 지명은 제외했다.
- 위치가 연결되지 않은 동시대 인물은 사건 장면 주변에 상징 배치한다. 선택 패널과 이름표의 설명에서 이를 밝힌다.
- 마을 건물·짧은 길·숲은 장면 구성이다. 당시의 건축 배치, 실제 역로, 산림 분포나 복식 복원으로 주장하지 않는다.
- 생몰·활동·사건 기간과 선택 사료에 따라 모델과 클릭 대상이 함께 바뀐다. 날짜 근거가 없는 인물을 임의로 살려 두지 않는다.

## Fantology 사용

원본 `asset-catalog.json`의 조형도 16개를 그대로 추렸다. 원격 원본 카탈로그 SHA256은
`14b3deabb7f94a28177c6b718f7199d0f3e301ebcf8f27df0f7ea7a4225b3298`이며 다시 대조했다.
선택 조형도 해시는 [기록](peninsula-assets-94.json)에 있다. 기존 생성 모듈 7개는 수정하지 않았다.
숲은 원본 `terrain.js`의 `makeTreeGeometry`와 월드의 instancing·바이옴 색 처리를 가져왔다.
사건·인물·건물은 원본 `buildAssetField`로 조립한다. 문신·군인·승려 등의 외형도 상징 모델이다.

표시 파일은 다음 명령으로 기존 저장 자료와 원본 카탈로그에서 다시 만들 수 있다.

```
python scripts/build_chronicle_display.py --catalog <Fantology의 asset-catalog.json>
node scripts/test_chronicle.mjs
node scripts/test_chronicle_assets.mjs
python scripts/verify_chronicle_assets.py --base <viewer URL> --out <report folder> --screenshots
```

새 역사 조사·수집 및 Opus 호출은 없다. 개발·시각 구성은 Codex가 맡았다.
실제 화면 검사 통과와 사용자의 디자인 수용은 별개다. 한국사 전체 인물·사건 수록 완료를 뜻하지 않는다.
