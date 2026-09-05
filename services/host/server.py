#!/usr/bin/env python3
"""시공여지도 뷰어 서버 — 표준 라이브러리만.

표준 배치: services/host/server.py
실행:      python3 services/host/server.py [--port 8870]

정적 파일(services/host/)과 데이터(data/)를 함께 서빙한다.
API는 전부 읽기 전용이다 — 이 서버는 아무것도 쓰지 않는다.

  GET /api/places   지명 + 좌표 후보 (data/places.json)
  GET /api/chunks   사료 원문 조각 (data/sources/*/chunks.jsonl)
  GET /api/sources  사료 카드 머리말 (data/sources/*.md)
  GET /api/geo      해안선·하천 (data/geo/east-asia.geojson)
"""
from __future__ import annotations

import argparse
import io
import json
import mimetypes
import re
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
DATA = ROOT / "data"

mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("application/json", ".json")


def read_jsonl(p: Path) -> list[dict]:
    if not p.exists():
        return []
    out = []
    for line in io.open(p, encoding="utf-8"):
        line = line.strip()
        if line:
            out.append(json.loads(line))
    return out


def parse_frontmatter(md: Path) -> dict:
    """사료 카드 머리말을 얕게 읽는다 (YAML 파서 없이 — 스칼라만)."""
    if not md.exists():
        return {}
    text = io.open(md, encoding="utf-8").read()
    m = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    if not m:
        return {}
    out: dict = {}
    for line in m.group(1).splitlines():
        if not line.strip() or line.startswith((" ", "\t", "-", "#")):
            continue
        if ":" not in line:
            continue
        k, v = line.split(":", 1)
        v = v.strip()
        if v in ("", "null"):
            continue
        if re.fullmatch(r"-?\d+", v):
            out[k.strip()] = int(v)
        elif v in ("true", "false"):
            out[k.strip()] = v == "true"
        else:
            out[k.strip()] = v.strip("\"'")
    return out


def collect_sources() -> list[dict]:
    src_dir = DATA / "sources"
    out = []
    if not src_dir.exists():
        return out
    for md in sorted(src_dir.glob("*.md")):
        fm = parse_frontmatter(md)
        if not fm:
            continue
        sid = fm.get("id") or f"src-{md.stem}"
        chunks = read_jsonl(src_dir / md.stem / "chunks.jsonl")
        fm["id"] = sid
        fm["chunkCount"] = len(chunks)
        out.append(fm)
    return out


def collect_chunks() -> list[dict]:
    out = []
    for jl in sorted((DATA / "sources").glob("*/chunks.jsonl")):
        out += read_jsonl(jl)
    return out


class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, fmt, *args):  # 조용히
        pass

    def _send(self, body: bytes, ctype: str, code: int = 200):
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)

    def _json(self, obj, code: int = 200):
        self._send(
            json.dumps(obj, ensure_ascii=False).encode("utf-8"),
            "application/json; charset=utf-8",
            code,
        )

    def do_HEAD(self):
        self.do_GET()

    def do_GET(self):
        path = urlparse(self.path).path

        if path == "/api/places":
            p = DATA / "places.json"
            self._json(json.loads(io.open(p, encoding="utf-8").read()) if p.exists() else {"places": []})
            return
        if path == "/api/chunks":
            self._json({"chunks": collect_chunks()})
            return
        if path == "/api/sources":
            self._json({"sources": collect_sources()})
            return
        if path == "/api/elevation":
            p = DATA / "geo" / "korea-elevation.json"
            if not p.exists():
                self._json({"error": "no elevation grid"}, 404)
                return
            self._send(p.read_bytes(), "application/json; charset=utf-8")
            return
        if path == "/api/geo":
            p = DATA / "geo" / "east-asia.geojson"
            if not p.exists():
                self._json({"type": "FeatureCollection", "features": []})
                return
            self._send(p.read_bytes(), "application/json; charset=utf-8")
            return

        rel = "index.html" if path == "/" else path.lstrip("/")
        target = (HERE / rel).resolve()
        if not str(target).startswith(str(HERE)) or not target.is_file():
            self._send(b"not found", "text/plain; charset=utf-8", 404)
            return
        ctype, _ = mimetypes.guess_type(str(target))
        if ctype and ctype.startswith("text/"):
            ctype += "; charset=utf-8"
        self._send(target.read_bytes(), ctype or "application/octet-stream")


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=8870)
    ap.add_argument("--host", default="127.0.0.1")
    a = ap.parse_args(argv)

    srv = ThreadingHTTPServer((a.host, a.port), Handler)
    print(f"sigong-yeojido viewer  http://{a.host}:{a.port}")
    print(f"  root={HERE}")
    print(f"  sources={len(collect_sources())}  chunks={len(collect_chunks())}")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        srv.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
