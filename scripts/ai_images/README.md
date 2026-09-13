# 사건·인물 AI 이미지 생성 (Pillow 필요: `python -m pip install Pillow`)
1. 입력 `{id,title,year,place,subjectType,meaning}` 배열을 준비한다. id는 소문자·숫자·하이픈, `-512` 끝은 예약이며 인물 year는 묘사 기준 연도다.
2. `pilot-items.json`의 공통 `stylePrefix`를 그대로 붙이고 meaning·시대·장소로 장면을 작성해 `prompt` 원문과 근거 `basis`, 고증 한계 `caveats`를 같은 항목에 저장한다.
3. Codex의 `image_gen.imagegen`에 항목마다 `{"prompt": 항목.prompt}`를 보내 단일 이미지를 생성한다. 사건 1536×1024, 인물 1024×1536을 프롬프트로 요청한다(크기·형식 전용 옵션 없음).
4. 응답의 실제 도구 이름을 `model`, 생성 완료 시각을 시간대 포함 ISO `generatedAt`으로 기록한다. 호출 시간·실제 형식·실패 원문은 별도 실행 기록에 남긴다. 실패 항목은 index에 넣지 않는다.
5. 원본을 열어 구도·문자·복식·폭력 묘사를 확인한다. 생성 도구의 원본 PNG는 저장소에 복사하지 않는다. 같은 프롬프트도 동일 픽셀을 보장하지 않는다.
6. `python scripts/ai_images/finalize_image.py --src <png> --id <id> --out services/host/assets/ai-images --metadata <항목.json>`을 실행한다. metadata 생략 시 `pilot-items.json`을 사용한다.
7. 스크립트는 방향 보정·흰 배경 RGB·비율 유지로 긴 변 1024/512 JPEG를 만들며 품질 85→80에서 250,000/80,000바이트 이하를 강제한다. 불가능하면 파일·index 변경 없이 실패한다.
8. 동일 id·파일이 있으면 기본 중단하며 명시적 `--overwrite`로 교체한다. index의 다른 항목은 보존한다. 여러 항목 변환은 순서대로 실행한다(동시 index 갱신 금지).
9. 출력 크기·바이트와 최종 JPEG 2종을 확인한다. `AI 생성 상상도`와 index.notice를 향후 UI에 함께 표시한다. 이번 파일럿은 UI·커밋·푸시·배포를 포함하지 않는다.
