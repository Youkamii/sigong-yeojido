# 고정 주소와 c2 운영

공개 주소는 **https://sigong.rabbion.info/**다. Cloudflare의 `sigong-yeojido` 이름 있는 터널을 사용한다.
DNS는 터널 `2af4bef7-a71e-4515-8409-5f4c6868dab4`에 연결되어 있으며 프로세스를 다시 실행해도 주소를 새로 발급하지 않는다.
기존 `trycloudflare.com` 주소는 과거 임시 주소다.

## 설치

c2 저장소는 `/home/lia-c2/sigong-yeojido`다. 기존 전체 원문과 `.fuseki` 설치를 유지한다.
새 호스트에는 Git 밖의 전체 원문, Fuseki/JRE, 터널 자격 증명도 옮겨야 한다.

- 서비스 전용 자격 증명: `~/.config/sigong-yeojido/tunnel.json` (디렉터리 700, 파일 600)
- 자격 증명 백업: lia-s1의 `/home/lia/.cloudflared-sigong/tunnel.json`
- 계정 관리 인증서는 c2에 복사하지 않는다. 자격 증명은 Git에 넣지 않는다.

저장소에서 다음을 실행한다. 설치는 서비스 등록과 부팅 자동 실행만 설정하며, 현재 수동 실행 중인 뷰어를 추가로 띄우지 않는다.

```sh
python3 scripts/install_services.py
```

최초 전환 때만 기존 뷰어·Fuseki·동기화 프로세스의 실행 경로와 PID를 확인해 종료한 뒤 아래 명령으로 시작한다.
다른 서비스의 프로세스나 터널은 종료하지 않는다. `pkill -f`로 일괄 종료하지 않는다.

```sh
systemctl --user start sigong-tunnel.service
systemctl --user status sigong-viewer sigong-fuseki sigong-sync sigong-tunnel
```

## 이후 운영

네 서비스는 `Restart=always`로 등록된다. `loginctl enable-linger`로 로그인 없이 부팅 시 시작한다.
인메모리 Fuseki가 다시 시작되면 `sigong-sync`가 저장된 자료를 검증·빌드해 RDF를 다시 적재한다.

```sh
# 실행 상태와 로그
systemctl --user is-enabled sigong-viewer sigong-fuseki sigong-sync sigong-tunnel
systemctl --user is-active sigong-viewer sigong-fuseki sigong-sync sigong-tunnel
journalctl --user -u sigong-viewer -u sigong-sync -u sigong-tunnel -n 40 --no-pager

# 터널만 재시작: 공개 주소는 그대로다.
systemctl --user restart sigong-tunnel

# 코드 배포: 정적 화면 파일 변경은 서버 재시작이 필요 없다.
git pull --ff-only

# Python 서버 코드가 바뀐 경우에만 단일 뷰어를 재시작한다.
systemctl --user restart sigong-viewer
```

현재 전체 원문 색인은 뷰어 메모리 약 3.3 GiB를 사용하고 시작에 약 8분이 걸린다(#139).
`active`는 프로세스 실행 상태다. 실제 준비 완료는 공개 화면과 `/api/sources` 응답으로 확인한다.
전체 원문 뷰어를 동시에 두 개 띄우지 않는다. c2 전원이 꺼져 있는 동안에는 고정 주소가 있어도 접속할 수 없다.

터널 구성은 [deploy/cloudflared.yml](../deploy/cloudflared.yml), 서비스 구성은 [deploy/systemd](../deploy/systemd)에 있다.
구성이 바뀌면 설치 명령을 다시 실행한 뒤 해당 서비스만 재시작한다.
