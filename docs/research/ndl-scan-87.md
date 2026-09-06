# 경국대전 1934년판 스캔 수록·열람 (#87)

NDL이 공개한 『경국대전』 1934년판의 **319코마 전체**를 원해상도 JPEG로 받았다.
합계 **956,756,379바이트**이며 319장 모두 디코딩·크기·해시 검사를 통과했다.
코마는 양쪽 페이지를 함께 찍은 스캔 한 장이다. NDL 서지는 600쪽으로 적고 있어 이를 319쪽짜리 책으로 세지 않는다.

- 원 제공처: [NDL 1232807](https://dl.ndl.go.jp/pid/1232807), 朝鮮総督府中枢院, 昭和9(1934), DOI 10.11501/1232807.
- 원 manifest의 권리 표시는 PDM이며 국립국회도서관 출처와 [이용 안내](https://www.ndl.go.jp/jp/use/reproduction/index.html)를 카드에 남겼다.
- Source 1개·이미지 참조 chunk 319개다. **전사문·OCR·번역·새 역사 Claim은 각각 0개**다. text는 빈 문자열이고 최초 편찬연도·법 시행기간도 추정하지 않았다.
- 사료 카드의 ‘수록한 스캔 보기’에서 앞면·뒷면·번호 이동과 원본 확대 열람이 된다. 사료를 끄면 스캔도 사라진다.
- 원 이미지 전체는 `data/scans/ndl-gyeongguk-1934/`에 별도 보관한다. Git에는 [원 manifest·319개 해시](../../data/research/ndl-gyeongguk-1934/image-index.json)와 이미지 참조를 수록하며 웹 열람은 NDL 원본 주소를 사용한다.

Claude Opus 5 / max 조사에서 처음 요약한 172코마는 잘못된 수였다. 원 manifest의 319개 목록을 직접 세고, 조사자의 최종 정정도 보존했다. 목록은 吏典·戶典·禮典·兵典·刑典·工典 시작점을 포함하지만 전 글자나 다른 판본과 대조한 결과는 아니다.

다운로드 중 122·240·241번에 403이 있었다. 뒤에 수신한 본문은 `Service Unavailable / Please visit later.`였고, 안내에 따라 간격을 두고 **같은 원본 URL**로 다시 받아 전부 복구했다. 초기 실패 4회와 최종 결손 0개를 이미지 목록에 함께 남겼다. 주소·크기·클라이언트를 바꿔 접근한 것이 아니다.

[두 빈 디렉터리의 반복 추출](ndl-scan-87-repeat.json)은 8개 출력 파일 전체 바이트가 같고 실제 저장소 파일과도 같았다.
[실제 개발 뷰어의 5개 검사](ndl-scan-87-local.json)는 c2로 복사한 319장 전체 해시·실제 API 객체·첫/중간/끝 이미지·면 이동·사료 해제/복구·480px 열람을 확인했다. 브라우저 오류는 0개다.
첫 모바일 검사의 패널 열기 누락은 [초기 실패](ndl-scan-87-initial.json)에 남겼다.

```sh
python scripts/fetch_ndl_scans.py --cache /tmp/ndl-1232807 --images data/scans/ndl-gyeongguk-1934
python scripts/import_ndl_scan.py --cache /tmp/ndl-1232807 --research /path/to/completed-opus-research --out /tmp/ndl-import.json
python scripts/verify_ndl_scan.py --base http://127.0.0.1:8870 --out /tmp/ndl-check
```

제공처가 잠시 뒤 재접속하라고 응답한 경우 실패 기록을 확인하고 충분히 기다린 뒤 `--retry-missing`으로 같은 주소에서 이어받을 수 있다. 결손이 남으면 수집 명령은 실패 종료한다.

수록 후 전체 검증은 Claim 9,416개·실패 0·경고 0, TTL 244,954트리플 반복 생성·재파싱·인용·digest 검사 실패 0이다. Source 1,073개·로컬 chunk 83,346개이며 이 중 319개가 새 스캔 참조다. 운영 반영·수용 기록은 배포 후 별도로 남긴다.
