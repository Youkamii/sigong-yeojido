#!/usr/bin/env bash
# scripts/fuseki.sh — Apache Jena Fuseki 를 홈 디렉터리 안에 포터블로 두고 조작한다 (#6, c2)
#
# 사용:
#   scripts/fuseki.sh install            JRE(Temurin 21) + Fuseki 배포판을 .fuseki/ 아래에 받는다 (sudo 없음)
#   scripts/fuseki.sh start              127.0.0.1:3030 에 인메모리 데이터셋 /sigong 으로 띄운다
#   scripts/fuseki.sh stop
#   scripts/fuseki.sh status             살아 있으면 exit 0, 죽어 있으면 1, 떠 있는데 응답이 없으면 2
#   scripts/fuseki.sh load <file.ttl>    POST /sigong/data?default — 실패하면 exit 1
#   scripts/fuseki.sh query '<SPARQL>'   SELECT/ASK → JSON 출력 (인자가 파일 경로면 그 파일을 읽는다)
#
# 배치 (모두 이 스크립트가 있는 저장소 루트 기준 — c2 의 ~/sigong-yeojido 에서 그대로 돈다):
#   .fuseki/jre/            Temurin JRE. 시스템에 java 17+ 가 있으면 받지 않고 그것을 쓴다
#   .fuseki/fuseki/         apache-jena-fuseki 배포판 (체크섬 .sha512 대조 후 푼다)
#   .fuseki/dist/           받은 tar.gz + 체크섬 파일 (재설치·검증용)
#   .fuseki/run/            FUSEKI_BASE — 서버가 shiro.ini 등을 여기 만든다 (안 주면 $PWD/run 에 만들어 저장소를 더럽힌다)
#   .fuseki/fuseki.version  설치된 Fuseki 버전 문자열
#   .fuseki/fuseki.log      서버 로그 (start 마다 이어 쓴다)
#   .fuseki/fuseki.pid      setsid nohup 으로 띄운 java 의 pid
#
# 환경변수: FUSEKI_PORT(3030) FUSEKI_DATASET(sigong) FUSEKI_JVM_ARGS(-Xmx1g) FUSEKI_VERSION(최신) SIGONG_ROOT
#
# 원칙: 127.0.0.1 에만 바인딩(--localhost). 데이터는 메모리에만 있어 stop 하면 사라진다 —
#       다시 start 한 뒤 load 로 올린다. 재부팅 자동 시작은 만들지 않는다.
#       Fuseki 6.x 는 fuseki-main 서버다: --update 가 있어야 /data 로 올릴 수 있고(GSP 쓰기),
#       --ping 이 있어야 /$/ping 이 열린다. 관리 UI(--admin)는 켜지 않는다.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="${SIGONG_ROOT:-$(cd "$SCRIPT_DIR/.." && pwd)}"
FUSEKI_DIR="$ROOT/.fuseki"
JRE_DIR="$FUSEKI_DIR/jre"
FUSEKI_HOME="$FUSEKI_DIR/fuseki"
DIST_DIR="$FUSEKI_DIR/dist"
RUN_DIR="$FUSEKI_DIR/run"
LOG_FILE="$FUSEKI_DIR/fuseki.log"
PID_FILE="$FUSEKI_DIR/fuseki.pid"
VERSION_FILE="$FUSEKI_DIR/fuseki.version"

HOST=127.0.0.1
PORT="${FUSEKI_PORT:-3030}"
DATASET="${FUSEKI_DATASET:-sigong}"
BASE_URL="http://$HOST:$PORT"
JVM_ARGS="${FUSEKI_JVM_ARGS:--Xmx1g}"

ADOPTIUM_LATEST="https://api.adoptium.net/v3/binary/latest/21/ga/linux/x64/jre/hotspot/normal/eclipse"
JENA_MIRROR="https://dlcdn.apache.org/jena/binaries"
JENA_ARCHIVE="https://archive.apache.org/dist/jena/binaries"

die() { printf 'fuseki.sh: %b\n' "$*" >&2; exit 1; }

usage() {
  sed -n '2,/^$/p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
  exit "${1:-1}"
}

# ---------------------------------------------------------------- 공통

# 체크섬 파일에서 16진수만 뽑는다. "hash  file" 형식과 gpg --print-md 형식("file: AB12 ...") 둘 다.
read_checksum() {
  local f="$1" tok
  tok=$(awk 'NR==1{print $1}' "$f")
  if [[ "$tok" =~ ^[0-9A-Fa-f]{64}$ || "$tok" =~ ^[0-9A-Fa-f]{128}$ ]]; then
    echo "${tok,,}"
  else
    sed 's/^[^:]*://' "$f" | tr -d ' \t\r\n' | tr 'A-F' 'a-f'
  fi
}

verify_sha() { # <file> <checksum-file> <sha256sum|sha512sum>
  local f="$1" cf="$2" tool="$3" want got
  want=$(read_checksum "$cf")
  got=$($tool "$f" | awk '{print $1}')
  [[ -n "$want" && "$want" == "$got" ]] || die "checksum mismatch: $f\n  want: $want\n  got:  $got"
  echo "checksum ok ($tool): $(basename "$f")"
}

java_major() { # <java-bin> → 주 버전 (1.8 은 1 로 나와 17 미만 처리된다)
  "$1" -version 2>&1 | head -1 | sed -E 's/.*version "([0-9]+)(\.[0-9]+)*[^"]*".*/\1/'
}

find_java() {
  if [[ -x "$JRE_DIR/bin/java" ]]; then echo "$JRE_DIR/bin/java"; return 0; fi
  local sys
  if sys=$(command -v java 2>/dev/null) && [[ -n "$sys" ]]; then echo "$sys"; return 0; fi
  return 1
}

fuseki_version() { cat "$VERSION_FILE" 2>/dev/null || echo unknown; }

is_running() {
  [[ -f "$PID_FILE" ]] || return 1
  local pid; pid=$(cat "$PID_FILE" 2>/dev/null) || return 1
  [[ -n "$pid" ]] || return 1
  kill -0 "$pid" 2>/dev/null || return 1
  # pid 가 재사용됐을 때의 오탐 방지 — 그 프로세스가 정말 fuseki 인지
  tr '\0' ' ' <"/proc/$pid/cmdline" 2>/dev/null | grep -q 'fuseki-server.jar' || return 1
}

ping_ok() { curl -sf --max-time 3 "$BASE_URL/\$/ping" >/dev/null 2>&1; }

# ---------------------------------------------------------------- install

install_jre() {
  if [[ -x "$JRE_DIR/bin/java" ]]; then
    echo "jre: already at $JRE_DIR — $("$JRE_DIR/bin/java" -version 2>&1 | head -1)"; return 0
  fi
  local sys major
  if sys=$(command -v java 2>/dev/null) && [[ -n "$sys" ]]; then
    major=$(java_major "$sys")
    if [[ "$major" =~ ^[0-9]+$ ]] && (( major >= 17 )); then
      echo "jre: system java $major at $sys — skip download"; return 0
    fi
    echo "jre: system java at $sys is too old (major=$major) — downloading Temurin 21"
  fi
  local asset name
  asset=$(curl -sSI --fail "$ADOPTIUM_LATEST" | awk 'tolower($1)=="location:"{print $2}' | tr -d '\r' | head -1)
  [[ -n "$asset" ]] || die "adoptium: no redirect from $ADOPTIUM_LATEST"
  name=$(basename "$asset")
  echo "jre: downloading $name"
  curl -sSL --fail -o "$DIST_DIR/$name" "$asset"
  curl -sSL --fail -o "$DIST_DIR/$name.sha256.txt" "$asset.sha256.txt"
  verify_sha "$DIST_DIR/$name" "$DIST_DIR/$name.sha256.txt" sha256sum
  mkdir -p "$JRE_DIR"
  tar -xzf "$DIST_DIR/$name" -C "$JRE_DIR" --strip-components=1
  [[ -x "$JRE_DIR/bin/java" ]] || die "jre: extracted but $JRE_DIR/bin/java missing"
  echo "jre: $("$JRE_DIR/bin/java" -version 2>&1 | head -1)"
}

install_fuseki() {
  if [[ -f "$FUSEKI_HOME/fuseki-server.jar" ]]; then
    echo "fuseki: already at $FUSEKI_HOME (version $(fuseki_version))"; return 0
  fi
  local ver="${FUSEKI_VERSION:-}" name base
  if [[ -z "$ver" ]]; then
    ver=$(curl -sS --fail "$JENA_MIRROR/" \
      | grep -oE 'apache-jena-fuseki-[0-9]+(\.[0-9]+)+\.tar\.gz' \
      | sed -E 's/^apache-jena-fuseki-(.*)\.tar\.gz$/\1/' | sort -uV | tail -1 || true)
  fi
  [[ -n "$ver" ]] || die "fuseki: could not find a version at $JENA_MIRROR/ (set FUSEKI_VERSION=x.y.z)"
  name="apache-jena-fuseki-$ver.tar.gz"
  if curl -sSI --fail "$JENA_MIRROR/$name" >/dev/null 2>&1; then base="$JENA_MIRROR"; else base="$JENA_ARCHIVE"; fi
  echo "fuseki: downloading $name from $base"
  curl -sSL --fail -o "$DIST_DIR/$name" "$base/$name"
  curl -sSL --fail -o "$DIST_DIR/$name.sha512" "$base/$name.sha512"
  verify_sha "$DIST_DIR/$name" "$DIST_DIR/$name.sha512" sha512sum
  mkdir -p "$FUSEKI_HOME"
  tar -xzf "$DIST_DIR/$name" -C "$FUSEKI_HOME" --strip-components=1
  [[ -f "$FUSEKI_HOME/fuseki-server.jar" ]] || die "fuseki: extracted but fuseki-server.jar missing"
  echo "$ver" >"$VERSION_FILE"
  echo "fuseki: $ver at $FUSEKI_HOME"
}

cmd_install() {
  mkdir -p "$DIST_DIR"
  install_jre
  install_fuseki
  local java; java=$(find_java)
  echo "install done: java=$java fuseki=$(fuseki_version)"
}

# ---------------------------------------------------------------- start / stop / status

cmd_start() {
  if is_running; then
    echo "already running: pid $(cat "$PID_FILE") at $BASE_URL/$DATASET"; return 0
  fi
  rm -f "$PID_FILE"
  local java; java=$(find_java) || die "java 가 없다 — 먼저 scripts/fuseki.sh install"
  [[ -f "$FUSEKI_HOME/fuseki-server.jar" ]] || die "fuseki 가 없다 — 먼저 scripts/fuseki.sh install"
  mkdir -p "$RUN_DIR"
  echo "== start $(date -Is) java=$java fuseki=$(fuseki_version) port=$PORT dataset=/$DATASET" >>"$LOG_FILE"
  # setsid: ssh 세션·터미널과 분리된 새 세션. nohup: HUP 무시. 표준 입출력은 로그로.
  # --update: GSP 쓰기(load) 허용  --ping: /$/ping 활성화  --mem: 인메모리 데이터셋
  # FUSEKI_BASE: 서버가 만드는 shiro.ini 의 자리. 안 주면 $PWD/run 을 만든다.
  # shellcheck disable=SC2086
  FUSEKI_HOME="$FUSEKI_HOME" FUSEKI_BASE="$RUN_DIR" \
    setsid nohup "$java" $JVM_ARGS -jar "$FUSEKI_HOME/fuseki-server.jar" \
      --localhost --port "$PORT" --ping --update --mem "/$DATASET" </dev/null >>"$LOG_FILE" 2>&1 &
  local pid=$!
  echo "$pid" >"$PID_FILE"
  local i
  for i in $(seq 1 60); do
    if ping_ok; then
      echo "started: pid $pid at $BASE_URL/$DATASET (log: $LOG_FILE)"; return 0
    fi
    if ! kill -0 "$pid" 2>/dev/null; then
      rm -f "$PID_FILE"
      die "process exited before answering — tail of $LOG_FILE:\n$(tail -n 20 "$LOG_FILE")"
    fi
    sleep 1
  done
  die "pid $pid is alive but $BASE_URL/\$/ping did not answer within 60s — see $LOG_FILE"
}

cmd_stop() {
  if ! is_running; then
    echo "not running"; rm -f "$PID_FILE"; return 0
  fi
  local pid i; pid=$(cat "$PID_FILE")
  kill "$pid"
  for i in $(seq 1 30); do
    if ! kill -0 "$pid" 2>/dev/null; then
      rm -f "$PID_FILE"; echo "stopped: pid $pid"; return 0
    fi
    sleep 1
  done
  kill -9 "$pid" 2>/dev/null || true
  sleep 1
  rm -f "$PID_FILE"
  echo "killed (SIGKILL after 30s): pid $pid"
}

cmd_status() {
  if ! is_running; then
    echo "stopped"; return 1
  fi
  local pid; pid=$(cat "$PID_FILE")
  local listen; listen=$(ss -ltn "sport = :$PORT" 2>/dev/null | awk 'NR>1{print $4}' | paste -sd, -)
  if ping_ok; then
    echo "running: pid $pid  $BASE_URL/$DATASET  listen=${listen:-?}  fuseki=$(fuseki_version)  log=$LOG_FILE"
    return 0
  fi
  echo "process alive (pid $pid) but $BASE_URL/\$/ping does not answer yet  listen=${listen:-none}"
  return 2
}

# ---------------------------------------------------------------- load / query

# curl 을 돌리고 HTTP 상태를 검사한다. 2xx 가 아니면 본문을 stderr 로 내고 1 을 돌려준다.
http() { # <label> <curl args...>
  local label="$1"; shift
  local tmp code
  tmp=$(mktemp)
  code=$(curl -sS -o "$tmp" -w '%{http_code}' "$@") || { rm -f "$tmp"; die "$label: curl failed (is fuseki running? try: scripts/fuseki.sh status)"; }
  if [[ "$code" != 2* ]]; then
    printf 'fuseki.sh: %s: HTTP %s\n' "$label" "$code" >&2
    cat "$tmp" >&2; echo >&2
    rm -f "$tmp"; return 1
  fi
  cat "$tmp"; rm -f "$tmp"
}

cmd_load() {
  local f="${1:-}"
  [[ -n "$f" ]] || die "usage: scripts/fuseki.sh load <file.ttl>"
  [[ -r "$f" ]] || die "cannot read: $f"
  local ctype url
  case "${f,,}" in
    *.ttl) ctype='text/turtle; charset=utf-8';         url="$BASE_URL/$DATASET/data?default" ;;
    *.nt)  ctype='application/n-triples; charset=utf-8'; url="$BASE_URL/$DATASET/data?default" ;;
    *.trig) ctype='application/trig; charset=utf-8';    url="$BASE_URL/$DATASET/data" ;;
    *.nq)  ctype='application/n-quads; charset=utf-8';  url="$BASE_URL/$DATASET/data" ;;
    *) die "unsupported extension (ttl/nt/trig/nq): $f" ;;
  esac
  local out
  out=$(http "load $f" -X POST -H "Content-Type: $ctype" --data-binary "@$f" "$url") || exit 1
  echo "loaded $f -> $url"
  echo "$out"
}

cmd_query() {
  local q="${1:-}"
  [[ -n "$q" ]] || die "usage: scripts/fuseki.sh query '<SPARQL SELECT ...>'  (또는 .rq 파일 경로)"
  [[ -f "$q" ]] && q=$(cat "$q")
  http "query" -H 'Accept: application/sparql-results+json, text/turtle;q=0.9, */*;q=0.5' \
    --data-urlencode "query=$q" "$BASE_URL/$DATASET/query" || exit 1
}

# ---------------------------------------------------------------- main

case "${1:-}" in
  install) cmd_install ;;
  start)   cmd_start ;;
  stop)    cmd_stop ;;
  status)  cmd_status ;;
  load)    shift; cmd_load "$@" ;;
  query)   shift; cmd_query "$@" ;;
  -h|--help|help) usage 0 ;;
  *) usage 1 ;;
esac
