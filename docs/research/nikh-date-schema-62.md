# 공식 배포 ZIP의 날짜 DTD 확인 (#62)

2026-09-07. 고려사절요([15115521](https://www.data.go.kr/data/15115521/fileData.do))와 한국독립운동사자료([15115618](https://www.data.go.kr/data/15115618/fileData.do))의 실제 내려받은 ZIP에 포함된 `history.dtd`를 확인했다. 두 파일은 31,459 bytes로 SHA256이 같고, 머리말은 **2020-07-30, ver 1.4**이다.

`dateOccured`의 선언은 472~476행이다. 발생 날짜의 `date`와 `type` 속성을 자유 문자열인 CDATA로 선언할 뿐 L0·L1·LO·99를 정의하지 않는다. 해당 네 문자열은 DTD 안에 모두 0회다. 690행의 날짜 입력형식 주석은 `dateInsert`·`dateModified` 선언 뒤에 있다. 이를 발생일의 접미사 정의로 확대해 읽지 않았다. [원 파일 해시·선언·행 번호·검색 수](nikh-date-schema-62.json)를 기록했다.

Claude Opus 5 / Max는 KADH가 재배포한 2015-11-30 ver 1.3 DTD에서 정의를 찾지 못했다. Codex는 후속 수집에서 확보한 **기관의 실제 배포 ZIP에 든 ver 1.4**를 추가로 대조했다. 이는 다른 버전의 확인이며 이전 파일의 버전을 정정한 것이 아니다. [조사 실행 기록](../../data/research/samguksagi-glyphs-8/run.json).

공식 정의를 찾았다는 뜻이 아니다. 고순종실록의 1896년 이후 L0, 고려사의 대문자 O인 `LO`, 삼국유사의 `0111-99-99L0`와 본문 표기의 관계는 여전히 미확인이다. 날짜 원값과 type을 유지하며, L만으로 역법을 정하지 않는다.

淲/㴲는 [두 기관 판본의 세 지점](samguksagi-glyphs-8.md)을 직접 대조했다. 국편 웹 퍼머링크 대조는 robots 제한으로 **NOT_RUN**이다. [기관 문의 초안](nikh-inquiry-draft.md)은 아직 보내지 않았다. #62는 공식 정의 확인이 남아 열어 둔다.

```powershell
python -X utf8 scripts/verify_nikh_date_schema.py "$env:TEMP/sigong-goal-public/bulk/15115521.zip" "$env:TEMP/sigong-goal-public/bulk/15115618.zip" --out docs/research/nikh-date-schema-62.json
```
