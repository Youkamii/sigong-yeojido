#!/usr/bin/env python3
"""시공여지도 뷰어 서버 — 표준 라이브러리만.

표준 배치: services/host/server.py
실행:      python3 services/host/server.py [--port 8870]

정적 파일(services/host/)과 데이터(data/)를 함께 서빙한다.
API는 전부 읽기 전용이다 — 이 서버는 아무것도 쓰지 않는다.

  GET /api/places   지명 + 좌표 후보 (data/places.json)
  GET /api/chunks?offset=0&limit=120[&sources=a,b]   사료 원문 조각과 전체 수
  GET /api/sources  사료 카드 머리말 (data/sources/*.md)
  GET /api/geo      해안선·하천 (data/geo/east-asia.geojson)
  GET /api/elevation 고도 격자 (data/geo/korea-elevation.json)
  GET /api/mentions?names=平穰,平壤&sources=src-a,src-b&limit=120
                    이름 문자열이 들어간 원문 조각 — 서버가 찾는다(원문 전체를 브라우저로 보내지 않는다).
                    응답 {chunks, total, bySource}. 자동 문자열 일치이므로 화면에 '자동'이라고 붙인다.
  GET /api/year?y=918[&sources=a,b][&limit=150]
                    국편이 연대(dateOccured)를 붙인 기사 중 그 해의 것. 연·월·일 순. {chunks, total, bySource}
  GET /api/density   사료별 {연도: 기사 수} — 타임라인 막대 안의 밀도 띠
  GET /api/source?id=src-samguksagi   사료 카드 — 머리말(스칼라) + 본문 마크다운 그대로
  GET /api/entities  엔티티 껍데기 목록 (data/entities/**/*.md 머리말: type·id·label·labelHanja) — 찾기 상자용
  GET /api/claims?subject=<entity id>[&about=1][&origin=all|human|ai]
                    그 엔티티가 subject 인 Claim(about=1 이면 object 에 나오는 것도) — data/claims/<src>/*.md 의 claims-json.
                    quote·citesChunk·origin(human|ai)·status 를 그대로 준다. 판정하지 않는다 — 서로 어긋나는 주장도 나란히.
  /api/places 는 places.json + places-candidates.json(#11) 을 합친다. 각 지명에 mentions {sourceId: 조각 수} 가 붙는다 (label + aliases 기준).
  색인은 data/sources 파일의 mtime·size 서명이 바뀔 때만 다시 만든다.
"""
from __future__ import annotations

import argparse
import io
import json
import logging
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
from frontmatter import parse_front_matter
from graph_query import neighborhood, locations, GraphUnavailable
from chat import answer as chat_answer, ChatUnavailable
from time_query import time_claims
from comparison_query import comparison
from history_map import historical_features
from citation_samples import citation_samples
from places import load_places, with_locations, place_names
try:
    from validate import parse_claims_text, MULTI_VALUED_PREDICATES  # noqa: E402
except Exception:  # validate.py 가 없거나 깨졌어도 뷰어는 뜬다 (claims 만 비어 보인다)
    parse_claims_text = None
    MULTI_VALUED_PREDICATES = frozenset()

mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("application/json", ".json")


def iter_jsonl(p: Path):
    if not p.exists():
        return
    with io.open(p, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if line:
                yield json.loads(line)


def read_jsonl(p: Path) -> list[dict]:
    return list(iter_jsonl(p))


def parse_frontmatter(md: Path) -> dict:
    if not md.exists():
        return {}
    return parse_front_matter(md.read_text(encoding="utf-8"))[0]


def collect_sources(counts: dict[str, int]) -> list[dict]:
    src_dir = DATA / "sources"
    out = []
    if not src_dir.exists():
        return out
    for md in sorted(src_dir.glob("*.md")):
        fm = parse_frontmatter(md)
        if not fm:
            continue
        sid = fm.get("id") or f"src-{md.stem}"
        fm["id"] = sid
        fm["chunkCount"] = counts.get(sid, 0)
        out.append(fm)
    return out


def collect_chunks() -> list[dict]:
    out = []
    samples=citation_samples(DATA/'sources')
    for jl in sorted((DATA / "sources").glob("*/chunks.jsonl")):
        with jl.open("rb") as fh:
            while True:
                offset = fh.tell()
                line = fh.readline()
                if not line:
                    break
                if not line.strip():
                    continue
                row = json.loads(line)
                sample=samples.pop(row['id'],None)
                if sample and sample[2]!=row:raise ValueError(f'citation sample differs from full corpus: {row["id"]}')
                out.append({"id": row["id"], "sourceId": sys.intern(row["sourceId"]),
                            "text": row.get("text") or "", "date": row.get("date"),
                            "_path": jl, "_offset": offset})
    for jl,offset,row in samples.values():
        out.append({'id':row['id'],'sourceId':sys.intern(row['sourceId']),'text':row['text'],
                    'date':row.get('date'),'_path':jl,'_offset':offset})
    return out


def full_chunk(row: dict) -> dict:
    if "_path" not in row:
        return row
    with row["_path"].open("rb") as fh:
        fh.seek(row["_offset"])
        chunk = json.loads(fh.readline())
    if chunk.get("id") != row["id"]:
        raise ValueError(f"chunk changed while reading: {row['id']}")
    return chunk


# ── 색인 (읽기 전용 캐시) ──
_IDX: dict = {"sig": None, "chunks": [], "sources": [], "places": None, "claims": [], "entities": [], "byYear": {}, "density": {}}
_IDX_LOCK = threading.Lock()


def _signature() -> tuple:
    parts = []
    src = DATA / "sources"
    files = sorted(src.glob("*.md")) + sorted(src.glob("*/chunks.jsonl")) if src.exists() else []
    files += sorted(src.glob("*/index-terms.jsonl"))
    files += sorted(src.glob('*/citation-chunks.jsonl'))
    files.append(DATA / "places.json")
    files += sorted(DATA.glob("places-candidates*.json"))
    cdir = DATA / "claims"
    if cdir.is_dir():
        files += sorted(cdir.glob("**/*.md"))
    edir = DATA / "entities"
    if edir.is_dir():
        files += sorted(edir.glob("**/*.md"))
    for f in files:
        if f.exists():
            st = f.stat()
            parts.append((str(f), st.st_mtime_ns, st.st_size))
    return tuple(parts)


def index() -> dict:
    global _IDX
    sig = _signature()
    with _IDX_LOCK:
        if _IDX["sig"] != sig:
            chunks = collect_chunks()
            counts = {}
            for chunk in chunks:
                sid = chunk["sourceId"]
                counts[sid] = counts.get(sid, 0) + 1
            by_year, density = build_year_index(chunks)
            _IDX = {"chunks": chunks, "chunkById": {c["id"]: c for c in chunks},
                    "countryTerms": collect_country_terms(), "sources": collect_sources(counts),
                    "places": None, "claims": collect_claims(), "entities": collect_entities(),
                    "byYear": by_year, "density": density, "sig": sig}
        return _IDX




def collect_country_terms() -> dict[str, set[str]]:
    terms: dict[str, set[str]] = {}
    for path in sorted((DATA / "sources").glob("*/index-terms.jsonl")):
        for row in iter_jsonl(path):
            if row.get("type") == "국명" and row.get("chunkId") and row.get("text"):
                terms.setdefault(row["chunkId"], set()).add(row["text"])
    return terms


def matches_names(chunk: dict, names: list[str], country_terms: dict[str, set[str]]) -> bool:
    text = chunk.get("text") or ""
    exact = country_terms.get(chunk.get("id"), set())
    return any((len(name) >= 2 and name in text) or (len(name) == 1 and name in exact) for name in names)


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
                if pl.get("sourceId") and c.get("sourceId") != pl["sourceId"]:
                    continue
                if matches_names(c, names, idx["countryTerms"]):
                    sid = c.get("sourceId") or "?"
                    m[sid] = m.get(sid, 0) + 1
        pl["mentions"] = m
    with _IDX_LOCK:
        idx["places"] = data
    return data


def unattributed_places(sources):
    """Legacy candidate visibility uses name hits, which are not coordinate evidence."""
    if sources is None:return None
    if not sources:return set()
    return {p['id'] for p in places_with_mentions()['places']
            if not p.get('mentions') or sources.intersection(p['mentions'])}


_YEAR_RE = re.compile(r"^(-?\d{3,4})(?=-|$)")


def year_of(raw) -> int | None:
    """국편 dateOccured raw('0919-09-99L0', '-0057-04-15L0', '03**-99-99L0', '9999-…' = 미상) → 서기 연도. 미상은 None."""
    if not isinstance(raw, str):
        return None
    m = _YEAR_RE.match(raw)
    if not m:
        return None
    y = int(m.group(1))
    return None if y >= 9999 else y


def build_year_index(chunks: list[dict]) -> tuple[dict[int, list[int]], dict[str, dict[int, int]]]:
    by_year: dict[int, list[int]] = {}
    density: dict[str, dict[int, int]] = {}
    for i, c in enumerate(chunks):
        d = c.get("date")
        raw = d.get("raw") if isinstance(d, dict) else d
        y = year_of(raw)
        if y is None:
            continue
        by_year.setdefault(y, []).append(i)
        sid = c.get("sourceId") or "?"
        density.setdefault(sid, {})
        density[sid][y] = density[sid].get(y, 0) + 1
    return by_year, density


def year_records(y: int, sources: set[str] | None, limit: int) -> dict:
    idx = index()
    rows = [idx["chunks"][i] for i in idx["byYear"].get(y, [])]
    if sources is not None:
        rows = [c for c in rows if c.get("sourceId") in sources]
    rows.sort(key=lambda c: (str((c.get("date") or {}).get("raw") if isinstance(c.get("date"), dict) else c.get("date")), c.get("id") or ""))
    by: dict[str, int] = {}
    for c in rows:
        by[c.get("sourceId") or "?"] = by.get(c.get("sourceId") or "?", 0) + 1
    return {"year": y, "chunks": [full_chunk(c) for c in rows[:limit]], "total": len(rows), "bySource": by}


def source_card(sid: str) -> dict:
    """data/sources/<x>.md 중 id 가 맞는 카드의 머리말과 본문(마크다운 원문). 화면이 라이선스·연도 근거를 그대로 보여 준다."""
    src_dir = DATA / "sources"
    if not sid or not src_dir.exists():
        return {"id": sid, "found": False}
    for md in sorted(src_dir.glob("*.md")):
        fm = parse_frontmatter(md)
        if not fm:
            continue
        if (fm.get("id") or f"src-{md.stem}") != sid:
            continue
        text = md.read_text(encoding="utf-8").lstrip("\ufeff")
        m = re.match(r"^---\n(.*?)\n---\n", text, re.S)
        _, body = parse_front_matter(text)
        fm = dict(fm)
        fm["id"] = sid
        fm["chunkCount"] = next((x.get("chunkCount", 0) for x in index()["sources"] if x.get("id") == sid), 0)
        return {"id": sid, "found": True, "file": md.relative_to(ROOT).as_posix(), "frontmatter": fm,
                "frontmatterRaw": m.group(1) if m else "", "body": body}
    return {"id": sid, "found": False}


def collect_entities() -> list[dict]:
    """엔티티 껍데기(data/entities/<class>/<id>.md) 의 머리말만 — 속성은 전부 Claim 이므로 여기엔 이름뿐이다."""
    out: list[dict] = []
    edir = DATA / "entities"
    if not edir.is_dir():
        return out
    for md in sorted(edir.glob("**/*.md")):
        fm = parse_frontmatter(md)
        if not fm.get("id"):
            continue
        out.append({"id": fm["id"], "type": fm.get("type"), "label": fm.get("label"), "labelHanja": fm.get("labelHanja"),
                    "_file": md.relative_to(ROOT).as_posix()})
    return out


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


def matches_origin(record: dict, origin: str = "all") -> bool:
    return origin == "all" or record.get("origin") == origin


def claims_for(entity_id: str, about: bool, sources: set[str] | None = None, origin: str = "all") -> dict:
    idx = index()
    chunks = idx.get("chunkById")
    if chunks is None:
        chunks = {c["id"]: c for c in idx["chunks"] if isinstance(c.get("id"), str)}
    out = []
    for c in idx["claims"]:
        if not matches_origin(c, origin):
            continue
        as_subject = c.get("subject") == entity_id
        in_object = about and _mentions_id(c.get("object"), entity_id)
        if not (as_subject or in_object):
            continue
        rec = dict(c)
        rec["role"] = "subject" if as_subject else "object"
        ch = chunks.get(c.get("citesChunk"))
        source_id = ch.get("sourceId") if ch else c.get("fromSource")
        if sources is not None and source_id not in sources:
            continue
        if ch:
            ch = full_chunk(ch)
        rec["chunk"] = {"id": ch["id"], "sourceId": ch.get("sourceId"), "locator": ch.get("locator"), "permalink": ch.get("permalink")} if ch else None
        out.append(rec)
    out.sort(key=lambda r: (r["role"] != "subject", str(r.get("predicate")), str(r.get("id"))))
    return {"entity": entity_id, "claims": out, "total": len(out),
            "allClaims": sum(matches_origin(c, origin) for c in idx["claims"]), "origin": origin,
            "multiValuedPredicates":sorted(MULTI_VALUED_PREDICATES)}


def merged_places() -> dict:
    return with_locations(load_places(DATA),collect_claims(),collect_entities())


def mentions(names: list[str], sources: set[str] | None, limit: int) -> dict:
    idx = index()
    out, by, total = [], {}, 0
    for c in idx["chunks"]:
        sid = c.get("sourceId")
        if sources is not None and sid not in sources:
            continue
        if matches_names(c, names, idx["countryTerms"]):
            total += 1
            by[sid] = by.get(sid, 0) + 1
            if len(out) < limit:
                out.append(full_chunk(c))
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

    def do_POST(self):
        if urlparse(self.path).path != '/api/chat':
            self._json({'error':'not found'},404)
            return
        try:
            size=int(self.headers.get('Content-Length','0'))
            if not 0<size<=100000:
                raise ValueError('질문 요청의 크기가 올바르지 않다.')
            body=json.loads(self.rfile.read(size))
            if not isinstance(body,dict):
                raise ValueError('JSON 객체로 질문을 보낸다.')
            sources=body.get('sources')
            if sources is not None and (not isinstance(sources,list) or any(not isinstance(s,str) for s in sources)):
                raise ValueError('sources must be a list of source identifiers')
            idx=index()
            def read_chunk(cid):
                row=idx['chunkById'].get(cid)
                return full_chunk(row) if row else None
            result=chat_answer(body.get('question'),idx['entities'],read_chunk,
                               None if sources is None else set(sources),body.get('origin','all'),body.get('entity'))
            self._json(result)
        except (ValueError,UnicodeDecodeError) as exc:
            self._json({'error':str(exc)},400)
        except (GraphUnavailable,ChatUnavailable) as exc:
            self._json({'error':str(exc)},503)

    def do_GET(self):
        u = urlparse(self.path)
        path = u.path
        q = parse_qs(u.query, keep_blank_values=True)

        if path in ('/api/comparisons','/api/compare'):
            file=DATA/'comparisons.json'
            config=json.loads(file.read_text(encoding='utf-8')) if file.exists() else {'cases':[]}
            if path=='/api/comparisons':
                self._json(config)
                return
            case=next((c for c in config['cases'] if c['id']==q.get('id',[''])[0]),None)
            if case is None:
                self._json({'error':'비교 사례를 찾지 못했다.'},404)
                return
            srcs=q.get('sources',[None])[0]
            sources=None if srcs is None else set(filter(None,srcs.split(',')))
            try:self._json(comparison(case,sources,q.get('origin',['all'])[0],{s['id']:s for s in index()['sources']}))
            except ValueError as exc:self._json({'error':str(exc)},400)
            except GraphUnavailable as exc:self._json({'error':str(exc)},503)
            return
        if path == '/api/lenses':
            file=DATA/'lenses.json'
            self._json(json.loads(file.read_text(encoding='utf-8')) if file.exists() else {'default':None,'lenses':[]})
            return
        if path == "/api/places":
            self._json(places_with_mentions())
            return
        if path == '/api/history-map':
            srcs=q.get('sources',[None])[0]
            sources=None if srcs is None else set(filter(None,srcs.split(',')))
            try:self._json(historical_features(DATA,sources,q.get('origin',['all'])[0],q.get('year',[None])[0]))
            except ValueError as exc:self._json({'error':str(exc)},400)
            return
        if path == "/api/year":
            try:
                y = int(q.get("y", [""])[0])
            except ValueError:
                self._json({"error": "y must be an integer year (negative = BC)"}, 400)
                return
            srcs = q.get("sources", [None])[0]
            sources = set(x for x in srcs.split(",") if x) if srcs is not None else None
            try:
                limit = max(0, min(500, int(q.get("limit", ["150"])[0])))
            except ValueError:
                limit = 150
            self._json(year_records(y, sources, limit))
            return
        if path == "/api/density":
            dens = index()["density"]
            self._json({"sources": {sid: {str(y): n for y, n in sorted(m.items())} for sid, m in dens.items()}})
            return
        if path == "/api/source":
            self._json(source_card((q.get("id", [""])[0] or "").strip()))
            return
        if path == "/api/entities":
            self._json({"entities": index()["entities"]})
            return
        if path == "/api/graph":
            srcs = q.get("sources", [None])[0]
            sources = set(x for x in srcs.split(",") if x) if srcs is not None else None
            try:
                result = neighborhood(q.get("entity", ["person-gwanggaeto"])[0], sources,
                                      q.get("origin", ["all"])[0], q.get("limit", ["30"])[0], q.get("offset", ["0"])[0],
                                      unattributed_places=unattributed_places(sources))
            except ValueError as exc:
                self._json({"error":str(exc)},400)
                return
            except GraphUnavailable as exc:
                self._json({"error":str(exc)},503)
                return
            self._json(result)
            return
        if path == '/api/time':
            srcs=q.get('sources',[None])[0]
            sources=None if srcs is None else set(filter(None,srcs.split(',')))
            try:
                result=time_claims(sources,q.get('origin',['all'])[0],q.get('entity',[None])[0],q.get('limit',[500])[0])
                self._json(result)
            except ValueError as exc:
                self._json({'error':str(exc)},400)
            except GraphUnavailable as exc:
                self._json({'error':str(exc)},503)
            return
        if path == '/api/locations':
            srcs=q.get('sources',[None])[0]
            sources=None if srcs is None else set(filter(None,srcs.split(',')))
            try:
                result=locations(q.get('place',[None])[0],sources,q.get('origin',['all'])[0],q.get('year',[None])[0],
                                 q.get('limit',[1000])[0],q.get('offset',[0])[0],unattributed_places=unattributed_places(sources))
                self._json(result)
            except ValueError as exc:self._json({'error':str(exc)},400)
            except GraphUnavailable as exc:self._json({'error':str(exc)},503)
            return
        if path == "/api/chunk":
            cid = q.get("id", [""])[0]
            idx = index()
            row = idx["chunkById"].get(cid)
            srcs = q.get("sources", [None])[0]
            if row and (srcs is None or row.get("sourceId") in srcs.split(",")):
                self._json({"found":True,"chunk":full_chunk(row)})
            else:
                self._json({"found":False,"id":cid})
            return
        if path == "/api/claims":
            origin = q.get("origin", ["all"])[0]
            if origin not in ("all", "human", "ai"):
                self._json({"error": "origin must be all, human or ai"}, 400)
                return
            ent = (q.get("subject", [""])[0] or "").strip()
            about = q.get("about", ["0"])[0] not in ("0", "", "false")
            srcs = q.get("sources", [None])[0]
            sources = set(x for x in srcs.split(",") if x) if srcs is not None else None
            self._json(claims_for(ent, about, sources, origin) if ent else {"entity": None, "claims": [], "total": 0})
            return
        if path == "/api/mentions":
            names = [n for value in q.get("names", []) for n in value.split(",") if n]
            if len(names) > 8 or any(len(n) > 32 for n in names):
                self._json({"error": "names must contain at most 8 names, each at most 32 characters"}, 400)
                return
            srcs = q.get("sources", [None])[0]
            sources = set(x for x in srcs.split(",") if x) if srcs is not None else None
            try:
                limit = max(1, min(500, int(q.get("limit", ["120"])[0])))
            except ValueError:
                limit = 120
            self._json(mentions(names, sources, limit) if names else {"chunks": [], "total": 0, "bySource": {}, "names": []})
            return
        if path == "/api/chunks":
            try:
                offset = max(0, int(q.get("offset", ["0"])[0]))
                limit = max(1, min(500, int(q.get("limit", ["120"])[0])))
            except ValueError:
                self._json({"error": "offset and limit must be integers"}, 400)
                return
            srcs = q.get("sources", [None])[0]
            sources = set(srcs.split(",")) if srcs is not None else None
            rows = index()["chunks"]
            if sources is not None:
                rows = [c for c in rows if c.get("sourceId") in sources]
            self._json({"chunks": [full_chunk(c) for c in rows[offset:offset + limit]],
                        "total": len(rows), "offset": offset, "limit": limit})
            return
        if path == "/api/sources":
            self._json({"sources": index()["sources"]})
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
    # 색인을 미리 데운다 — 첫 요청이 수십 MB 원문을 읽고 지명별 mentions 를 세느라 몇 초 걸리면 첫 화면이 비어 보인다
    idx = index()
    pl = places_with_mentions()
    n_src, n_ch, n_cl, n_en, n_pl = len(idx["sources"]), len(idx["chunks"]), len(idx["claims"]), len(idx["entities"]), len(pl.get("places", []))
    print(f"  sources={n_src}  chunks={n_ch}  claims={n_cl}  entities={n_en}  places={n_pl}")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        srv.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
