# 홍가 연호 환산을 사료 선택에 연결 (#55)

삼국사기의 鴻嘉三年은 기원전 18년, 삼국유사 변한백제조의 鴻嘉四年甲辰은 기원전 17년으로
적은 일본어 위키백과 연호표를 별도 Source와 `convertsTo` Claim 2개로 수록했다.
원 사료의 날짜를 덮어쓰지 않는다. 남부여조의 鴻佳三年은 다른 글자이며 동일 연호라는 근거를 확보하지 못해 환산하지 않았다.

조사: Claude Opus 5 / max 완료본(`data/research/cross-chronology-53-55/`).
조사자가 표를 재배열한 문자열은 인용으로 쓰지 않았다. 실제 HTML의 3행·5열 전체를 원래 순서로 읽고
공백만 셀 구분에 써서 chunk에 저장했다. 행·열 배열과 페이지 해시는 `hongga-conversions-55.json`에 있다.
표를 옮겼다는 편집 설명도 원문과 분리했다. 출처는 **3차 자료**이며 기관 역법표·참고 원서의 독립 대조는 미완료다.

비교 화면의 ‘이 사례의 사료 켜기’로 환산표까지 켠다. 두 연도 버튼은 해당 환산 근거를 열고
시간축을 각각 기원전 18년·17년으로 이동시킨다. 환산표 Source를 끄면 숫자 투영은 없어지고 원표기만 남는다.
연대 API와 근거 패널에는 Claim의 해석 한계를 담은 note도 전달한다.

재현: `scripts/import_hongga_conversions.py --research <완료 조사 폴더> --cache <실제 HTML 캐시> --checks <페이지 검사 JSON> --out docs/research/hongga-conversions-55.json`
실제 Fuseki·화면 검사는 `scripts/verify_time.py`로 수행한다. fixture의 환산 성공과 실제 자료 검사를 구별한다.
