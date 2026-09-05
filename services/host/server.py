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
  GET /api/elevation 고도 격자 (data/geo/korea-elevation.json)
  GET /api/mentions?names=平穰,平壤&sources=src-a,src-b&limit=120
                    이름 문자열이 들어간 원문 조각 — 서버가 찾는다(원문 전체를 브라우저로 보내지 않는다).
                    응답 {chunks, total, bySource}. 자동 문자열 일치이므로 화면에 '자동'이라고 붙인다.
  GET /api/claims?subject=<entity id>[&about=1]
                    그 엔티티가 subject 인 Claim(about=1 이면 object 에 나오는 것도) — data/claims/<src>/*.md 의 claims-json.
                    quote·citesChunk·origin(human|ai)·status 를 그대로 준다. 판정하지 않는다 — 서로 어긋나는 주장도 나란히.
  /api/places 는 places.json + places-candidates.json(#11) 을 합친다. 각 지명에 mentions {sourceId: 조각 수} 가 붙는다 (label + aliases 기준).
  색인은 data/sources 파일의 mtime·size 서명이 바뀔 때만 다시 만든다.
"""
from __future__ import annotations

import argparse
import io
import json
import mimetypes
import re
import sys
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
DATA = ROOT / "data"

# claims 파서는 services/validate.py 의 것을 그대로 쓴다 — 파서를 두 벌 두지 않는다
sys.path.insert(0, str(ROOT / "services"))
try:
    from validate import parse_claims_text  # noqa: E402
except Exception:  # validate.py 가 없거나 깨졌어도 뷰어는 뜬다 (claims 만 비어 보인다)
    parse_claims_text = None

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


# ── 색인 (읽기 전용 캐시) ──
_IDX: dict = {"sig": None, "chunks": [], "sources": [], "places": None, "claims": []}
_IDX_LOCK = threading.Lock()


def _signature() -> tuple:
    parts = []
    src = DATA / "sources"
    files = sorted(src.glob("*.md")) + sorted(src.glob("*/chunks.jsonl")) if src.exists() else []
    files.append(DATA / "places.json")
    files.append(DATA / "places-candidates.json")
    cdir = DATA / "claims"
    if cdir.is_dir():
        files += sorted(cdir.glob("**/*.md"))
    for f in files:
        if f.exists():
            st = f.stat()
            parts.append((str(f), st.st_mtime_ns, st.st_size))
    return tuple(parts)


def index() -> dict:
    sig = _signature()
    with _IDX_LOCK:
        if _IDX["sig"] != sig:
            _IDX["chunks"] = collect_chunks()
            _IDX["sources"] = collect_sources()
            _IDX["places"] = None
            _IDX["claims"] = collect_claims()
            _IDX["sig"] = sig
        return _IDX


def place_names(p: dict) -> list[str]:
    names = [p.get("label")] + list(p.get("aliases") or [])
    return [n for n in names if isinstance(n, str) and n]


def places_with_mentions() -> dict:
    idx = index()
    with _IDX_LOCK:
        if idx["places"] is not None:
            return idx["places"]
    data = merged_places()
    for pl in data.get("places", []):
        names = place_names(pl)
        m: dict[str, int] = {}
        if names:
            for c in idx["chunks"]:
                t = c.get("text") or ""
                if any(n in t for n in names):
                    sid = c.get("sourceId") or "?"
                    m[sid] = m.get(sid, 0) + 1
        pl["mentions"] = m
    with _IDX_LOCK:
        idx["places"] = data
    return data


def collect_claims() -> list[dict]:
    """data/claims/<src>/<chunk>.md 의 claims-json 배열을 전부 모은다. 파일 머리말(chunk·source·status)을 각 claim 에 붙인다."""
    out: list[dict] = []
    cdir = DATA / "claims"
    if parse_claims_text is None or not cdir.is_dir():
        return out
    for path in sorted(cdir.glob("**/*.md")):
        try:
            meta, claims = parse_claims_text(io.open(path, encoding="utf-8").read())
        except Exception:
            continue  # 깨진 파일은 validate.py 가 잡는다 — 뷰어는 조용히 건너뛴다
        for c in claims:
            if not isinstance(c, dict):
                continue
            rec = dict(c)
            rec["_file"] = path.relative_to(ROOT).as_posix()
            rec["_docStatus"] = meta.get("status")
            rec["_generatedBy"] = meta.get("generated_by")
            out.append(rec)
    return out


def _mentions_id(obj, entity_id: str) -> bool:
    if isinstance(obj, dict):
        return any(_mentions_id(v, entity_id) for v in obj.values())
    if isinstance(obj, list):
        return any(_mentions_id(v, entity_id) for v in obj)
    return isinstance(obj, str) and obj == entity_id


def claims_for(entity_id: str, about: bool) -> dict:
    idx = index()
    chunks = {c["id"]: c for c in idx["chunks"] if isinstance(c.get("id"), str)}
    out = []
    for c in idx["claims"]:
        as_subject = c.get("subject") == entity_id
        in_object = about and _mentions_id(c.get("object"), entity_id)
        if not (as_subject or in_object):
            continue
        rec = dict(c)
        rec["role"] = "subject" if as_subject else "object"
        ch = chunks.get(c.get("citesChunk"))
        rec["chunk"] = {"id": ch["id"], "sourceId": ch.get("sourceId"), "locator": ch.get("locator"), "permalink": ch.get("permalink")} if ch else None
        out.append(rec)
    out.sort(key=lambda r: (r["role"] != "subject", str(r.get("predicate")), str(r.get("id"))))
    return {"entity": entity_id, "claims": out, "total": len(out), "allClaims": len(idx["claims"])}


def merged_places() -> dict:
    """data/places.json(손질한 것) + data/places-candidates.json(#11 조사, 후보마다 validFrom/validTo).

    같은 id 가 양쪽에 있으면 places.json 이 이긴다(조사본은 candidatesAlsoIn 으로만 표시).
    notAPlace 항목은 뺀다. variantOf 항목(이체자·이표기)은 원 항목의 aliases 로 접는다.
    """
    pj = DATA / "places.json"
    base = json.loads(io.open(pj, encoding="utf-8").read()) if pj.exists() else {"places": []}
    places: list[dict] = list(base.get("places", []))
    by_id = {pl["id"]: pl for pl in places}
    cj = DATA / "places-candidates.json"
    if cj.exists():
        cand = json.loads(io.open(cj, encoding="utf-8").read())
        extra = [pl for pl in cand.get("places", []) if not pl.get("notAPlace")]
        variants = [pl for pl in extra if pl.get("variantOf")]
        for pl in extra:
            if pl.get("variantOf"):
                continue
            if pl["id"] in by_id:
                by_id[pl["id"]]["candidatesAlsoIn"] = "places-candidates.json"
                continue
            rec = {k: pl[k] for k in ("id", "label", "labelKo", "kind", "status", "candidates", "note", "confidence", "count", "indexType", "relatedTo", "references") if k in pl}
            rec["origin"] = "ai"          # 조사 에이전트가 모아 검증자가 대조한 것 — 사람이 확인한 연결 아님
            rec["from"] = "places-candidates.json"
            rec["aliases"] = list(pl.get("aliases") or [])
            places.append(rec)
            by_id[rec["id"]] = rec
        for v in variants:
            tgt = by_id.get(v["variantOf"])
            if tgt is not None:
                al = tgt.setdefault("aliases", [])
                for name in [v.get("label")] + list(v.get("aliases") or []):
                    if name and name != tgt.get("label") and name not in al:
                        al.append(name)
                # 이표기 항목이 제 좌표 후보를 따로 들고 있어도 원 항목의 후보로 합치지 않는다 — 같은 자리라는 판정은 Claim 몫
    out = dict(base)
    out["places"] = places
    return out


def mentions(names: list[str], sources: set[str] | None, limit: int) -> dict:
    idx = index()
    out, by, total = [], {}, 0
    for c in idx["chunks"]:
        sid = c.get("sourceId")
        if sources is not None and sid not in sources:
            continue
        t = c.get("text") or ""
        if any(n in t for n in names):
            total += 1
            by[sid] = by.get(sid, 0) + 1
            if len(out) < limit:
                out.append(c)
    return {"chunks": out, "total": total, "bySource": by, "names": names}


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
        u = urlparse(self.path)
        path = u.path
        q = parse_qs(u.query)

        if path == "/api/places":
            self._json(places_with_mentions())
            return
        if path == "/api/claims":
            ent = (q.get("subject", [""])[0] or "").strip()
            about = q.get("about", ["0"])[0] not in ("0", "", "false")
            self._json(claims_for(ent, about) if ent else {"entity": None, "claims": [], "total": 0})
            return
        if path == "/api/mentions":
            names = [n for n in (q.get("names", [""])[0]).split(",") if n]
            srcs = q.get("sources", [None])[0]
            sources = set(x for x in srcs.split(",") if x) if srcs is not None else None
            try:
                limit = max(1, min(500, int(q.get("limit", ["120"])[0])))
            except ValueError:
                limit = 120
            self._json(mentions(names, sources, limit) if names else {"chunks": [], "total": 0, "bySource": {}, "names": []})
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
