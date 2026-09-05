#!/usr/bin/env python3
"""TTL 을 Fuseki 의 /sigong/data 에 올리고, 트리플 수를 SPARQL COUNT 로 되읽어 출력한다 (#6).

c2 에서:
  python3 scripts/fuseki_load.py data/ontology/sigong.ttl          # POST — 있는 것에 덧붙인다
  python3 scripts/fuseki_load.py --replace a.ttl b.ttl             # 첫 파일은 PUT(기본 그래프 교체), 나머지는 POST
  python3 scripts/fuseki_load.py                                   # 파일 없이 — 지금 트리플 수만 센다
옵션:
  --endpoint URL   데이터셋 URL. 기본 http://127.0.0.1:3030/sigong  (data · query 는 그 아래)

표준 라이브러리(urllib)만 쓴다. 서버가 안 떠 있거나 파일이 파싱되지 않으면 메시지를 내고 exit 1.
서버는 scripts/fuseki.sh start 로 띄운다.
"""
from __future__ import annotations

import argparse
import json
import sys
import urllib.error
import urllib.parse
import urllib.request

DEFAULT_ENDPOINT = "http://127.0.0.1:3030/sigong"
COUNT_QUERY = "SELECT (COUNT(*) AS ?n) WHERE { ?s ?p ?o }"

CONTENT_TYPES = {
    ".ttl": "text/turtle",
    ".nt": "application/n-triples",
}


def content_type(path: str) -> str:
    lower = path.lower()
    for ext, ctype in CONTENT_TYPES.items():
        if lower.endswith(ext):
            return ctype + "; charset=utf-8"
    raise SystemExit(f"fuseki_load: 지원하지 않는 확장자 (ttl/nt 만): {path}")


def request(url: str, *, method: str = "GET", data: bytes | None = None, headers: dict | None = None) -> tuple[int, bytes]:
    req = urllib.request.Request(url, data=data, method=method, headers=headers or {})
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            return resp.status, resp.read()
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", "replace").strip()
        raise SystemExit(f"fuseki_load: HTTP {e.code} {method} {url}\n{body}")
    except urllib.error.URLError as e:
        raise SystemExit(f"fuseki_load: 연결 실패 {url} — {e.reason}  (scripts/fuseki.sh status 로 확인)")


def upload(endpoint: str, path: str, replace: bool) -> dict:
    with open(path, "rb") as fh:
        payload = fh.read()
    method = "PUT" if replace else "POST"
    url = endpoint.rstrip("/") + "/data?default"
    status, body = request(url, method=method, data=payload, headers={"Content-Type": content_type(path)})
    text = body.decode("utf-8", "replace").strip()
    try:
        info = json.loads(text) if text else {}
    except json.JSONDecodeError:
        info = {"raw": text}
    info["_status"] = status
    info["_method"] = method
    return info


def count_triples(endpoint: str) -> int:
    url = endpoint.rstrip("/") + "/query?" + urllib.parse.urlencode({"query": COUNT_QUERY})
    _, body = request(url, headers={"Accept": "application/sparql-results+json"})
    result = json.loads(body.decode("utf-8"))
    bindings = result["results"]["bindings"]
    return int(bindings[0]["n"]["value"]) if bindings else 0


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("files", nargs="*", help="올릴 .ttl / .nt 파일들 (없으면 COUNT 만)")
    ap.add_argument("--endpoint", default=DEFAULT_ENDPOINT, help=f"데이터셋 URL (기본 {DEFAULT_ENDPOINT})")
    ap.add_argument("--replace", action="store_true", help="첫 파일을 PUT 으로 올려 기본 그래프를 갈아끼운다")
    args = ap.parse_args(argv)

    for i, path in enumerate(args.files):
        info = upload(args.endpoint, path, replace=(args.replace and i == 0))
        added = info.get("tripleCount", info.get("count", "?"))
        print(f"{info['_method']} {path}: HTTP {info['_status']}, triples={added}")

    total = count_triples(args.endpoint)
    print(f"total triples at {args.endpoint}: {total}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
