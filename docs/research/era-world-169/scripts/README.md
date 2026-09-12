# 평가 때 실행한 캡처 스크립트

`capture_era_review.py`와 `inspect_era_runtime.py`는 이번 평가에서 실행한 원본을 보관한 것이다. 실제 실행은 Windows 임시 폴더에서 Python 3.12, 설치된 Chrome, Playwright를 사용했다. 브라우저는 `headless=True`로 띄웠다.

- `capture_era_review.py`: 공개 주소의 연도를 입력하고 관찰 카메라를 고정해 31개 연도·114개 장면을 저장했다. 각 장면은 UI와 캔버스 두 장이다. 관찰 좌표는 역사 시설의 정확한 위치 주장에 사용하지 않는다.
- `inspect_era_runtime.py`: 현재 장면의 이름에 `river`가 있는 객체, 월드 그룹의 자식과 경계를 기록했다. 이름 없는 모든 메시의 내용을 판별하는 검사는 아니다.

스크립트를 다른 폴더에서 다시 실행하면 출력은 그 스크립트 옆의 `sigong-era-review`에 생긴다. 런타임 검사 스크립트는 이 출력 폴더가 이미 있는 환경에서 실행했다. 다시 실행할 때는 공개 서비스의 버전과 출력 위치를 먼저 확인해야 한다. 캡처 스크립트의 `code: 7312de21`은 이번 실행의 확인된 기준을 기록한 상수이며, 미래 실행에서 서비스 SHA를 자동으로 검증하는 기능이 아니다. 새 실행을 이번 평가의 원본 결과에 덮어쓰지 않는다.

이번 실행 결과는 [캡처 메타데이터](../captures/manifest.json), [런타임 열거](../runtime-inspection.json), [원본 보관 기록](../evidence-index.json)에 있다. 개별 평가자의 평지 조립 검사와 추가 근거는 `../reviews/*support.json` 또는 `*evidence.json`에 별도로 보관한다.
