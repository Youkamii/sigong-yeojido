# c2 원인 확인과 단일 뷰어 복구 (#137)

2026-09-09 13:50 KST에 SSH 접속이 다시 가능해졌다. `192.168.35.1~254` 전체에 ICMP 확인을 했고 c2는 기존 `192.168.35.47`에서 응답한다.
부팅 시각은 **2026-08-20 21:41**, 연속 가동 시간은 약19일16시간이다. 재부팅이나 IP 변경이 아니다.
다른 장비의 전체 IP·MAC 목록은 로컬 `%TEMP%/sigong-lan-check-137.json`에만 두었다.

커널 로그에서 **2026-09-09 13:38:17 기존 뷰어304567을 메모리 부족으로 종료한 기록**을 확인했다.
기존 뷰어 종료 시 anon-rss3,781,296kB, 준비용 뷰어325678 확인 시 RSS3,351,660kB, Fuseki RSS817,628kB였다.
메모리8GB 서버에서 기존 뷰어를 유지하면서 준비용 뷰어의 전체 색인도 올린 배포 방식이 메모리 부담을 키웠다.
두 뷰어의 중복 색인을 피하지 못한 것은 배포 작업의 잘못이다. SSH 응답 중단의 시작 시점별 메모리 추이는 남아 있지 않지만, 기존 뷰어의 실제 종료 원인은 OOM 로그로 확인했다.
[실제 프로세스·부팅·OOM 근거](c2-recovery-137.json).

13:54에 명령을 확인한 준비용 뷰어325678을 종료한 뒤, 최신 기능 코드의 뷰어326490을 **하나만** 시작했다.
소스 기준은 `d362e293`(기능 코드`e5b88453`)다. 단일 뷰어의 초기 준비도 약8분이 걸렸고, 14:02 KST에 내부·공개 HTTP200을 확인했다. 14:03에 전승15개·성곽배경12개 공개 검사가 통과했다. 원문 API는2,603,432조각과 실제 삼국사기 본문을 반환했다. 준비 후 RSS약3.3GiB·남은 메모리약2.6GiB이며 재기동 이후 새 OOM 로그는 없었다.
뷰어 로그는 `/tmp/sigong-viewer-recovery-137.log`, PID 기록은 `/tmp/sigong-server.pid`다.
기존 Fuseki167737·RDF watcher325679·FinBridge222676은 재시작하지 않았다.

Fuseki의 실제315,183트리플을 확인했다. c2 TTL SHA256은 `5a4009c04d99fe109236cb01bfd3ef5883f18f9739af55435220778318f43bae`다.
이번 Opus 원본 ZIP을 c2의 `/home/lia-c2/work/history-detail-130-136/`에 복사했고 SHA256도 로컬과 일치했다.
[원본 보관 검증](archive-detail-130-136.json). 아래의 NOT_COPIED·원인 미확정 문장은 당시 상태이며 이 확인으로 갱신한다.

기존 공개 주소는 DNS 조회가 실패하여 지도용 새 터널326965를 시작했다. [복구한 c2 공개 화면](https://attend-bacon-eligibility-selections.trycloudflare.com/)의 HTTP와 실제 브라우저 검증을 완료했다. 기존 지도 터널146152만 정리했다.
[전승15 PASS](traditions-c2-recovered-137.json) · [성곽 배경12 PASS](historical-sites-c2-recovered-137.json).
다른 서비스의 터널은 유지했다. Windows 임시 공개판도 계속 사용 가능하다. 서버 응답 복구·원인 확인·원본 보관은 완료했으며 메모리 구조 개선은 아래 #139에 남긴다.

## 남은 구조 개선 #139

`collect_chunks`는 전체 원문 본문을 Python 객체에 보관하며 `places_with_mentions`는 장소마다 전체 조각을 순회한다.
복구 중 단일 뷰어도 RSS약3.2GiB, 수분의 초기 계산을 요구했다. 3D 렌더링 자체는 브라우저에서 수행한다.
원문·검색 색인을 디스크에 두고 필요한 항목만 읽으며 변경분 집계만 갱신하는 개선은 #139로 추적한다.
단일 프로세스로 복구한 것을 이 저장 구조의 최적화 완료로 부르지 않는다. 앞으로 전체 색인을 가진 뷰어 둘을 겹쳐 기동하지 않는다.

# 당시 접속 불가 기록과 임시 공개 환경 (#137)

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
