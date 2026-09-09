# c2 응답 중단과 임시 공개 환경 (#137)

2026-09-09 12:02 KST 이후 c2 `192.168.35.47:22`는 TCP 연결 후 SSH banner를 응답하지 않는다.
8870 HTTP와 기존 공개 URL도 응답하지 않는다. 기능 반영 후 최종 재확인에서도 새 SSH가 timeout이었다. 서버 안의 로그를 읽지 못해 원인은 미확정이다.

직전 수행한 일:

1. 명령·cwd를 확인한 기존 RDF watcher 290919만 종료했다.
2. `/home/lia-c2/sigong-yeojido`를 `10bd9a22`로 fast-forward했다.
3. 기존 뷰어 304567을 유지하면서 `/tmp/sigong-warm-viewer-136.py` 준비 프로세스 325678과 새 watcher 325679를 시작했다.
4. 기존 뷰어를 종료하거나 새 뷰어로 포트를 전환하는 단계는 실행하지 않았다. 이후 접속이 끊겼다.

중복 색인 준비와 RDF 빌드의 메모리 부하가 의심되지만 RSS·swap·OOM 로그로 확인하지 못했다.
새 준비 프로세스만 중지하려던 명령도 SSH banner timeout으로 실행되지 않았다. Fuseki 167737·다른 서비스 FinBridge 222676을 직접 종료하거나 서버를 재부팅하지 않았다.

복구 시 먼저 콘솔 또는 SSH로 명령과 PID가 여전히 일치하는지 확인한다. 오래된 PID 숫자만 보고 종료하지 않는다.
새 준비 프로세스·watcher의 RSS와 `free`, swap, OOM 기록을 확인하고 불필요한 준비 프로세스를 정리한다.
사용자 요청 밖의 서비스를 재기동하지 않는다. 자원 상태를 확인하기 전에 두 번째 전체 색인을 다시 띄우지 않는다.
뷰어 코드를 최신 main으로 동기화한 뒤 단일 뷰어·RDF·원문 접근과 공개 URL을 확인해야 #137을 닫을 수 있다.
원인 규명·c2의 최신 코드 실행·공개 HTTP 복구는 현재 NOT_VERIFIED다.

## 지금 사용하는 임시 환경

[임시 공개 화면](https://convention-pierre-bloom-pros.trycloudflare.com/), 로컬 `http://127.0.0.1:8874`.
Windows 저장소 `C:\Users\gkfkd\Git\sigong-yeojido`의 `services/host/server.py`를 실행한다.
환경 변수 `SIGONG_FUSEKI_QUERY=http://127.0.0.1:3035/sigong/query`로 실제 로컬 Fuseki를 연결했다.

| 프로세스 | PID | 위치·역할 |
|---|---|---|
| 뷰어 | 31088 | `server.py --host 127.0.0.1 --port 8874` |
| Fuseki | 32068 | Java21, `-Xmx512m`, localhost 3035, in-memory dataset `/sigong` |
| 공개 터널 | 3484 | cloudflared → 127.0.0.1:8874 |

PID는 기록 시점 값이다. 상태·로그는 `%TEMP%/sigong-fallback-136/run.json`, `viewer.log`, `fuseki.log`, `tunnel.log`에 있다.
모두 `CREATE_NO_WINDOW`로 실행했다. #138에서 초기 병렬 파일 요청의 연결 대기 수를 늘린 뒤 임시 뷰어만 33280에서 31088로 재기동했다. Fuseki와 터널은 유지했다. 뷰어의 정적 파일은 현재 저장소를 사용하므로 프런트엔드 변경은 반영되지만 Python 코드는 재기동이 필요하다.

RDF 315,183트리플·Claim 12,769개·Source 카드 1,841개·전승 9개가 있는 실제 데이터다. fixture나 가짜 API가 아니다.
다만 c2의 전체 벌크 원문 보관소를 복사한 것은 아니다. 중지하면 인메모리 Fuseki는 실제 TTL 재적재가 필요하고 임시 터널 주소도 바뀔 수 있다.
TTL SHA256은 `696e16cf96639783746f8cc581409a71411b8bab4a1d75efec2b18c403adec89`이다.

[이번 Opus 원본 보관](archive-detail-130-136.json)의 압축 파일은 gitignored `data/bulk/opus-research-130-136-20260909.zip`에 안전하게 보관했다.
c2 전송은 NOT_COPIED다. 접속 복구 후 지정 경로에 복사하고 SHA256을 대조한다.
기존 c2 공개 URL은 `https://undertaken-coleman-interests-bruce.trycloudflare.com/`이며 현재 정상 주소로 안내하지 않는다.
