#!/usr/bin/env python3
"""TTL 빌더 — data/ 의 사료·chunk·엔티티·주장을 Turtle 그래프 하나로 방출한다 (F5, #5).

실행:  python services/build_ttl.py [--data DIR] [--out FILE] [--dry-run]
기본:  data/ -> data/build/sigong.ttl   (빌드 산출물. .gitignore 에 있다)
종료:  0 = 썼다 · 1 = 검증 실패, 아무것도 쓰지 않았다 · 2 = 인자 오류

입력 (docs/02-schema.md §12):
  data/sources/<src>.md            사료 카드           -> syj:Source   라벨 · 시간 두 개 · 라이선스 · provenance
  data/sources/<src>/chunks.jsonl  원문 조각           -> syj:Chunk    인용된 것만. id·locator·sourceId(·lang·permalink) 만.
                                                                       text 는 절대 내보내지 않는다
  data/entities/<type>/<id>.md     엔티티 껍데기       -> syj:Person/Place/Polity/Event/Office   id · 타입 · 대표 라벨만
  data/claims/<src>/<chunk>.md     주장                -> syj:Claim    파서·검사·충돌 규칙은 services/validate.py 의 것을 그대로 쓴다
  data/claims/<src>/.digests.json  기록된 digest       -> 어긋나면 빌드 거부 (§7.2)
  data/places.json                 좌표 후보           -> 근거가 있으면 syj:Claim(locatedAt), 없으면 syj:Location 만 (아래 '좌표')

게이트 — validate.py 와 같은 검사. 하나라도 걸리면 아무것도 쓰지 않고 exit 1:
  근거 없는 Claim · 죽은 chunk id · quote 불일치 · 엔티티 참조 없음 · digest 불일치 · 파싱 오류
  (+ 빌더 고유: 사료 카드 파싱 오류 · predicate 모양 · TimeSpan 재정의 · places.json 의 반쪽 근거 · id 가 두 클래스에 쓰임)
충돌 (§11) — validate.py 의 규칙 그대로: 같은 (subject, predicate) 에 다른 object 가 둘 이상이면 syj:Conflict.
  충돌은 오류가 아니라 정보다. places.json 에서 승격된 Claim 도 같은 규칙에 들어간다.

방출 규약:
  - 접두어는 syj: 하나 + rdf/rdfs/xsd. OWL 없음. owl:sameAs 없음 (동일성은 sameEntityAs Claim 으로만, §10)
  - 인용 이중 기록 (§7): syj:citesChunk <chunk URI> (그래프 탐색용) + syj:isSupportedBy "chunk_…" (규칙 엔진용 리터럴)
  - provenance 1급: Claim 마다 origin(human|ai) · generatedBy/At · (verifiedBy/At) · claimDigest.
    빈 노드(익명 노드)는 쓰지 않는다 — 모든 노드가 URI 를 갖는다
  - 시간 (§8): time 객체 -> syj:TimeSpan (원표기 · 정밀도 · 명시된 범위). 환산은 별도 convertsTo Claim (§8.1)
  - 좌표 (§9): location 객체 -> syj:objectLocation 으로 syj:Location 노드를 갖는 Claim. validFrom/validTo 는 Claim 에 붙는다 (§9.1)
    data/places.json 의 candidate 는 근거 세 필드(citesChunk · quote · fromSource)를 다 가진 것만 syj:locatedAt Claim 으로
    승격한다 — claims 파일의 claim 과 같은 모양으로 만들어 같은 검사(validate.validate)를 통과해야 한다.
    근거 없는 candidate 는 Claim 으로 올리지 않는다: 올리면 "모든 Claim 은 chunk 를 가리킨다"(§0-3) 가 깨지고,
    지명이 언급된 chunk 를 근거로 붙이면 근거 조작이다. 대신 syj:Location 노드로만 내보낸다
    (syj:candidateOf -> Place · syj:grounded false · basis · precision · validFrom/To). 렌즈 토글의 대상이 아니다.
    근거의 일부만 있는 candidate 는 빌드 실패다 — 반쯤 붙은 근거를 조용히 버리지 않는다.
  - 결정론: 같은 입력이면 바이트 동일. 노드 · 속성 · 다중값 전부 정렬해 쓴다. 시각 · 절대경로 같은 환경값은 파일에 넣지 않는다

원칙: 표준 라이브러리만. rdflib 없음 — Turtle 은 문자열로 직접 만든다. 원문은 chunks.jsonl 에만 산다.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import os
import re
import sys
import tempfile
from dataclasses import dataclass, field
from decimal import Decimal
from pathlib import Path
from urllib.parse import quote as url_quote

sys.path.insert(0, str(Path(__file__).resolve().parent))
import validate as V  # noqa: E402  — services/validate.py: 주장 파서 · 검사 · 충돌 규칙
from validate import MULTI_VALUED_PREDICATES
from places import load_places as merged_place_catalog, with_locations

ROOT = V.ROOT
DATA_DIR = V.DATA_DIR
DEFAULT_OUT = ROOT / "data" / "build" / "sigong.ttl"
PLACES_FILENAME = "places.json"
PLACES_KEY = "places.json"  # validate 의 source_key. .digests.json 이 없으니 승격 claim 은 전부 'new' 로 보고된다
LOCATED_AT = "syj:locatedAt"
PROMOTION_FIELDS = ("citesChunk", "quote", "fromSource")  # 셋 다 있어야 candidate 가 Claim 이 된다

NS = "https://sigong-yeojido.kr/ns#"
PREFIXES = (
    ("syj", NS),
    ("rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#"),
    ("rdfs", "http://www.w3.org/2000/01/rdf-schema#"),
    ("xsd", "http://www.w3.org/2001/XMLSchema#"),
)
ENTITY_DIRS = {"person": "Person", "place": "Place", "polity": "Polity", "event": "Event", "office": "Office", "organization":"Organization"}
CLASSES = ("Source", "Chunk", "Person", "Place", "Polity", "Event", "Office", "Organization", "TimeSpan", "Location", "Claim", "Conflict")
CLASS_LABELS = {
    "Source": "사료",
    "Chunk": "원문 조각",
    "Person": "사람",
    "Place": "장소",
    "Polity": "나라·세력",
    "Event": "사건",
    "Office": "관직·지위",
    "Organization": "관서·조직",
    "TimeSpan": "시간 구간",
    "Location": "좌표",
    "Claim": "주장",
    "Conflict": "충돌",
}
# §2: 외부 표준은 채택하지 않고 rdfs:seeAlso 로 대응만 적어 둔다 (CIDOC-CRM · OWL-Time · GeoSPARQL)
CRM = "http://www.cidoc-crm.org/cidoc-crm/"
SEE_ALSO = {
    "Source": (CRM + "E31_Document",),
    "Chunk": (CRM + "E33_Linguistic_Object",),
    "Person": (CRM + "E21_Person",),
    "Place": (CRM + "E53_Place",),
    "Polity": (CRM + "E74_Group",),
    "Organization": (CRM + "E74_Group",),
    "Event": (CRM + "E5_Event",),
    "TimeSpan": (CRM + "E52_Time-Span", "http://www.w3.org/2006/time#TemporalEntity"),
    "Location": (CRM + "E94_Space_Primitive", "http://www.opengis.net/ont/geosparql#Geometry"),
    "Claim": (CRM + "E13_Attribute_Assignment",),
}

PREDICATE_RE = re.compile(r"^syj:([A-Za-z][A-Za-z0-9]*)$")
PN_LOCAL_SAFE_RE = re.compile(r"^[A-Za-z0-9_][A-Za-z0-9_.:-]*$")
DATE_RE = re.compile(r"^-?\d{4}-\d{2}-\d{2}$")
INT_RE = re.compile(r"^-?\d+$")


class BuildError(ValueError):
    """빌드를 통째로 거부해야 하는 문제 (데이터 오류)."""


# ----------------------------------------------------------------------------
# Turtle 항 만들기 — 모든 방출은 이 함수들만 거친다
# ----------------------------------------------------------------------------


def ttl_string(value: str) -> str:
    """짧은 따옴표 리터럴. Turtle ECHAR 만 쓴다 (\\\\ \\" \\n \\r \\t) — 그 밖의 제어문자는 \\uXXXX."""
    out: list[str] = []
    for ch in value:
        if ch == "\\":
            out.append("\\\\")
        elif ch == '"':
            out.append('\\"')
        elif ch == "\n":
            out.append("\\n")
        elif ch == "\r":
            out.append("\\r")
        elif ch == "\t":
            out.append("\\t")
        elif ord(ch) < 0x20 or ch == "\x7f":
            out.append("\\u%04X" % ord(ch))
        else:
            out.append(ch)
    return '"' + "".join(out) + '"'


def lit(value: str, lang: str | None = None) -> str:
    return ttl_string(value) + (f"@{lang}" if lang else "")


def typed(value: str, datatype: str) -> str:
    return ttl_string(value) + "^^" + datatype


def integer(value: int) -> str:
    return str(int(value))


def decimal(value) -> str:
    """xsd:decimal 리터럴. 지수 표기를 쓰지 않는다 (Turtle DECIMAL 은 지수를 허용하지 않는다)."""
    d = Decimal(repr(value)) if isinstance(value, float) else Decimal(str(value))
    text = format(d, "f")
    if "." not in text:
        text += ".0"
    return text


def boolean(value: bool) -> str:
    return "true" if value else "false"


def date_or_string(value: str) -> str:
    return typed(value, "xsd:date") if DATE_RE.match(value) else lit(value)


def uri_literal(value: str) -> str:
    return typed(value, "xsd:anyURI")


def qname(local: str) -> str:
    """syj:<id>. id 가 접두어 이름으로 못 쓰는 문자를 가지면 전체 IRI 로 물러선다 (퍼센트 인코딩)."""
    if PN_LOCAL_SAFE_RE.match(local) and not local.endswith("."):
        return f"syj:{local}"
    return "<" + NS + url_quote(local, safe="-._~") + ">"


def _num(value) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def _int_value(value) -> bool:
    return isinstance(value, int) and not isinstance(value, bool)


# ----------------------------------------------------------------------------
# 그래프 — 노드 하나는 (클래스, id, 속성 목록)
# ----------------------------------------------------------------------------


@dataclass
class Node:
    cls: str
    id: str
    props: list[tuple[str, list[str]]] = field(default_factory=list)

    def add(self, predicate: str, *objects: str | None) -> None:
        values = [o for o in objects if o is not None]
        if not values:
            return
        for pred, existing in self.props:
            if pred == predicate:
                for v in values:
                    if v not in existing:
                        existing.append(v)
                return
        self.props.append((predicate, list(dict.fromkeys(values))))

    def get(self, predicate: str) -> list[str]:
        for pred, existing in self.props:
            if pred == predicate:
                return list(existing)
        return []

    @property
    def triples(self) -> int:
        return 1 + sum(len(v) for _, v in self.props)


@dataclass
class Graph:
    nodes: dict[str, Node] = field(default_factory=dict)
    warnings: list[str] = field(default_factory=list)
    failures: list[str] = field(default_factory=list)

    def node(self, cls: str, nid: str) -> Node:
        found = self.nodes.get(nid)
        if found is None:
            found = Node(cls, nid)
            self.nodes[nid] = found
        elif found.cls != cls:
            self.failures.append(f"id {nid!r} is used for both {found.cls} and {cls}")
        return found

    def by_class(self, cls: str) -> list[Node]:
        return sorted((n for n in self.nodes.values() if n.cls == cls), key=lambda n: n.id)

    def count(self, cls: str) -> int:
        return sum(1 for n in self.nodes.values() if n.cls == cls)


# ----------------------------------------------------------------------------
# 사료 카드 머리말 — 평평한 key: value + 한 단계 중첩(generated: by/at) + 매핑 목록(sources: - id: …)
# 사료·주장·엔티티 모두 services/frontmatter.py 를 사용한다.
# ----------------------------------------------------------------------------


def parse_card_front_matter(text: str) -> dict:
    return V.parse_front_matter(text)[0]


# ----------------------------------------------------------------------------
# 적재 — validate.py 의 로더를 그대로 쓴다. 여기서 더 읽는 것은 카드 · 껍데기 라벨 · places.json 뿐
# ----------------------------------------------------------------------------


@dataclass
class Shell:
    id: str
    cls: str
    label: str | None
    label_hanja: str | None


def load_shells(entities_dir: Path, warnings: list[str]) -> dict[str, Shell]:
    shells: dict[str, Shell] = {}
    if not entities_dir.is_dir():
        return shells
    for path in sorted(entities_dir.glob("*/*.md")):
        where = V.rel(path)
        eid = path.stem
        dir_cls = ENTITY_DIRS.get(path.parent.name)
        if dir_cls is None:
            warnings.append(f"{where}: unknown entity directory {path.parent.name!r} (allowed: {', '.join(ENTITY_DIRS)}); skipped")
            continue
        meta: dict[str, str] = {}
        try:
            meta, _ = V.parse_front_matter(V.read_text(path))
        except (V.ParseError, UnicodeDecodeError) as exc:
            warnings.append(f"{where}: entity front matter unreadable ({exc}); emitting id and type only")
        declared = meta.get("type")
        if declared and declared != dir_cls:
            warnings.append(f"{where}: front matter type {declared!r} != directory type {dir_cls!r}; using directory")
        if eid in shells:
            warnings.append(f"{where}: duplicate entity id {eid}; first one wins")
            continue
        shells[eid] = Shell(eid, dir_cls, meta.get("label") or None, meta.get("labelHanja") or None)
    return shells


def load_cards(sources_dir: Path) -> dict[str, tuple[dict, Path]]:
    """data/sources/<src>.md -> {source id: (머리말, 경로)}. 카드가 깨지면 BuildError."""
    cards: dict[str, tuple[dict, Path]] = {}
    if not sources_dir.is_dir():
        return cards
    for path in sorted(sources_dir.glob("*.md")):
        where = V.rel(path)
        try:
            meta = parse_card_front_matter(V.read_text(path))
        except (V.ParseError, UnicodeDecodeError) as exc:
            raise BuildError(f"{where}: source card front matter unreadable: {exc}") from None
        if meta.get("type") not in (None, "Source"):
            raise BuildError(f"{where}: source card type must be 'Source' (got {meta.get('type')!r})")
        sid = meta.get("id") or f"src-{path.stem}"
        if not isinstance(sid, str):
            raise BuildError(f"{where}: source card id must be a string")
        if sid in cards:
            raise BuildError(f"{where}: duplicate source id {sid} (also {V.rel(cards[sid][1])})")
        cards[sid] = (meta, path)
    return cards


def load_places(path: Path) -> list[dict]:
    if not path.is_file():
        return []
    try:
        data = json.loads(V.read_text(path))
    except json.JSONDecodeError as exc:
        raise BuildError(f"{V.rel(path)}: not valid JSON: {exc.msg} (line {exc.lineno})") from None
    places = data.get("places") if isinstance(data, dict) else None
    if not isinstance(places, list):
        raise BuildError(f"{V.rel(path)}: expected an object with a 'places' array")
    return places


# ----------------------------------------------------------------------------
# places.json — 근거가 있는 candidate 만 Claim 으로 승격한다 (모듈 설명 '좌표')
# ----------------------------------------------------------------------------


@dataclass
class PlacePlan:
    promoted: list[dict] = field(default_factory=list)  # validate 로 보낼 claim dict — claims 파일의 claim 과 같은 모양
    ungrounded: list[tuple[str, int, dict, dict]] = field(default_factory=list)  # (place id, index, candidate, place)
    n_places: int = 0  # 좌표를 하나라도 내보낸 place 수

    @property
    def n_candidates(self) -> int:
        return len(self.promoted) + len(self.ungrounded)


def promoted_claim(pid: str, index: int, cand: dict, place: dict) -> dict:
    """candidate -> claim dict. id 는 위치 인덱스로 결정론적이다. digest 는 validate.claim_digest 가 찍는다."""
    obj: dict = {"kind": "location", "lat": cand["lat"], "lon": cand["lon"]}
    for key in ("precision", "basis"):
        if isinstance(cand.get(key), str) and cand[key].strip():
            obj[key] = cand[key]
    claim: dict = {
        "id": f"claim-{pid}-locatedAt-{index}",
        "subject": pid,
        "predicate": LOCATED_AT,
        "object": obj,
        "citesChunk": cand["citesChunk"],
        "quote": cand["quote"],
        "fromSource": cand["fromSource"],
        # 확인 전에는 확인했다고 적지 않는다 — 기본은 ai · draft
        "origin": cand["origin"] if isinstance(cand.get("origin"), str) else "ai",
        "status": cand["status"] if isinstance(cand.get("status"), str) else "draft",
    }
    for key in ("note", "generatedBy", "generatedAt", "verifiedBy", "verifiedAt"):
        if isinstance(cand.get(key), str) and cand[key].strip():
            claim[key] = cand[key]
    for key in ("validFrom", "validTo"):  # §9.1 — 지명은 시대에 따라 다른 곳을 가리킨다
        if _int_value(place.get(key)):
            claim[key] = place[key]
    if isinstance(place.get("status"), str) and place["status"]:
        claim["identificationStatus"] = place["status"]
    return claim


def plan_places(places: list, shells: dict[str, Shell], where: str, warnings: list[str]) -> PlacePlan:
    plan = PlacePlan()
    for place in sorted(places, key=lambda p: str(p.get("id")) if isinstance(p, dict) else ""):
        pid = place.get("id") if isinstance(place, dict) else None
        if not isinstance(pid, str) or not pid:
            warnings.append(f"{where}: place without id skipped")
            continue
        shell = shells.get(pid)
        if shell is None:
            warnings.append(f"{where}: {pid} has no entity shell under data/entities/; candidates skipped")
            continue
        if shell.cls not in ('Place','Polity'):
            warnings.append(f"{where}: {pid} is a {shell.cls}, not a Place or Polity; candidates skipped")
            continue
        candidates = place.get("candidates") or []
        if not isinstance(candidates, list):
            warnings.append(f"{where}: {pid}.candidates is not a list; skipped")
            continue
        used = 0
        for index, cand in enumerate(candidates, 1):
            if not isinstance(cand, dict) or not (_num(cand.get("lat")) and _num(cand.get("lon"))):
                warnings.append(f"{where}: {pid} candidate #{index} has no numeric lat/lon; skipped")
                continue
            if cand.get('claimId'):
                used += 1
                if cand.get('derived'):
                    plan.ungrounded.append((pid,index,cand,place))
                continue
            present = [k for k in PROMOTION_FIELDS if isinstance(cand.get(k), str) and cand[k].strip()]
            if present and len(present) < len(PROMOTION_FIELDS):
                missing = [k for k in PROMOTION_FIELDS if k not in present]
                raise BuildError(
                    f"{where}: {pid} candidate #{index} has {'/'.join(present)} but no {'/'.join(missing)} - "
                    f"a candidate becomes a Claim only with all of {', '.join(PROMOTION_FIELDS)}"
                )
            used += 1
            if present:
                plan.promoted.append(promoted_claim(pid, index, cand, place))
            else:
                plan.ungrounded.append((pid, index, cand, place))
        plan.n_places += 1 if used else 0
    return plan


# ----------------------------------------------------------------------------
# 조립
# ----------------------------------------------------------------------------


def _str(meta: dict, key: str) -> str | None:
    value = meta.get(key)
    return value if isinstance(value, str) and value.strip() else None


def _int(meta: dict, key: str, where: str, warnings: list[str]) -> int | None:
    value = meta.get(key)
    if value is None:
        return None
    if isinstance(value, bool):
        return None
    if isinstance(value, int):
        return value
    if isinstance(value, str) and INT_RE.match(value.strip()):
        return int(value.strip())
    warnings.append(f"{where}: {key} is not an integer ({value!r}); omitted")
    return None


def _bool(meta: dict, key: str, where: str, warnings: list[str]) -> bool | None:
    value = meta.get(key)
    if value is None:
        return None
    if isinstance(value, bool):
        return value
    if isinstance(value, str) and value.strip().lower() in ("true", "false"):
        return value.strip().lower() == "true"
    warnings.append(f"{where}: {key} is not true/false ({value!r}); omitted")
    return None


def add_source(graph: Graph, sid: str, meta: dict, path: Path, chunk_count: int) -> None:
    where = V.rel(path)
    w = graph.warnings
    n = graph.node("Source", sid)
    label = _str(meta, "label")
    n.add("rdfs:label", lit(label, "ko") if label else None)
    n.add("syj:labelHanja", lit(_str(meta, "labelHanja")) if _str(meta, "labelHanja") else None)
    n.add("syj:sourceKind", lit(_str(meta, "sourceKind")) if _str(meta, "sourceKind") else None)
    for key in ("composedYear", "coversFrom", "coversTo"):
        value = _int(meta, key, where, w)
        n.add(f"syj:{key}", integer(value) if value is not None else None)
    for key in ("compiler", "originalLanguage", "license", "licenseDetail", "status"):
        value = _str(meta, key)
        n.add(f"syj:{key}", lit(value) if value else None)
    lens = _bool(meta, "defaultLens", where, w)
    n.add("syj:defaultLens", boolean(lens) if lens is not None else None)
    verified_at = _str(meta, "licenseVerifiedAt")
    n.add("syj:licenseVerifiedAt", date_or_string(verified_at) if verified_at else None)
    via = _str(meta, "licenseVerifiedVia")
    n.add("syj:licenseVerifiedVia", uri_literal(via) if via else None)
    generated = meta.get("generated")
    if isinstance(generated, dict):
        by, at = _str(generated, "by"), _str(generated, "at")
        n.add("syj:generatedBy", lit(by) if by else None)
        n.add("syj:generatedAt", date_or_string(at) if at else None)
    verified = meta.get("verified")
    if isinstance(verified, dict):
        by, at = _str(verified, "by"), _str(verified, "at")
        n.add("syj:verifiedBy", lit(by) if by else None)
        n.add("syj:verifiedAt", date_or_string(at) if at else None)
    fetched = meta.get("sources")
    if isinstance(fetched, list):
        for item in fetched:
            if isinstance(item, dict) and _str(item, "resource"):
                n.add("syj:retrievedFrom", uri_literal(_str(item, "resource")))
    n.add("syj:chunkCount", integer(chunk_count))


def add_shell(graph: Graph, shell: Shell) -> None:
    n = graph.node(shell.cls, shell.id)
    n.add("rdfs:label", lit(shell.label, "ko") if shell.label else None)
    n.add("syj:labelHanja", lit(shell.label_hanja) if shell.label_hanja else None)


def add_chunk(graph: Graph, cid: str, chunk: dict, cards: dict) -> None:
    """id · locator · sourceId (· lang · permalink). text 는 여기 오지 않는다 — chunk['text'] 를 읽지 않는다."""
    n = graph.node("Chunk", cid)
    n.add("rdfs:label", lit(cid))
    locator = chunk.get("locator")
    n.add("syj:locator", lit(locator) if isinstance(locator, str) and locator else None)
    source_id = chunk.get("sourceId")
    if isinstance(source_id, str) and source_id:
        n.add("syj:fromSource", qname(source_id))
        if source_id not in cards:
            graph.warnings.append(f"chunk {cid}: sourceId {source_id!r} has no card under data/sources/; emitting a bare Source node")
            graph.node("Source", source_id)
    else:
        graph.warnings.append(f"chunk {cid}: no sourceId")
    lang = chunk.get("lang")
    n.add("syj:lang", lit(lang) if isinstance(lang, str) and lang else None)
    permalink = chunk.get("permalink")
    n.add("syj:permalink", uri_literal(permalink) if isinstance(permalink, str) and permalink else None)


@dataclass
class ClaimStats:
    claims: int = 0
    kinds: dict[str, int] = field(default_factory=dict)
    cited: set[str] = field(default_factory=set)
    timespans: dict[str, dict] = field(default_factory=dict)
    refs: dict[str, str] = field(default_factory=dict)  # 참조된 id -> 처음 본 자리 (매달린 참조 검사용)
    locations_from_claims: int = 0
    locations_promoted: int = 0


def add_claim(graph: Graph, claim: dict, doc: V.ClaimsDoc, chunks: dict, cards: dict, stats: ClaimStats) -> None:
    cid = claim["id"]
    where = f"{doc.label} :: {cid}"
    n = graph.node("Claim", cid)
    stats.claims += 1

    # subject — 엔티티 | chunk | TimeSpan. 그래프에 없는 것을 가리키면 경고 (validate 는 object 만 검사한다)
    subject = claim["subject"]
    n.add("syj:subject", qname(subject))
    stats.refs.setdefault(subject, where)
    if subject in chunks:
        stats.cited.add(subject)  # subject 로 쓰인 chunk 도 그래프에 있어야 한다

    m = PREDICATE_RE.match(claim["predicate"])
    if not m:
        raise BuildError(f"{where}: predicate must look like syj:name (got {claim['predicate']!r})")
    n.add("syj:predicate", f"syj:{m.group(1)}")

    obj = claim["object"]
    kind = obj["kind"]
    stats.kinds[kind] = stats.kinds.get(kind, 0) + 1
    if kind == "entity":
        n.add("syj:objectEntity", qname(obj["id"]))
        stats.refs.setdefault(obj["id"], where)
    elif kind == "literal":
        value = obj.get("value")
        if not isinstance(value, str):
            raise BuildError(f"{where}: literal object needs a string 'value'")
        n.add("syj:objectLiteral", lit(value))
        position = obj.get("position")
        n.add("syj:position", lit(position) if isinstance(position, str) and position else None)
    elif kind == "year":
        n.add("syj:objectYear", integer(obj["value"]))
    elif kind == "time":
        ts_id, verbatim, precision = obj.get("id"), obj.get("verbatim"), obj.get("precision")
        if not (isinstance(ts_id, str) and ts_id and isinstance(verbatim, str) and verbatim and isinstance(precision, str)):
            raise BuildError(f"{where}: time object needs string 'id', 'verbatim', 'precision'")
        previous = stats.timespans.get(ts_id)
        definition={key:obj[key] for key in ('verbatim','precision','year','earliest','latest','calendar') if obj.get(key) is not None}
        if previous is not None and previous != definition:
            raise BuildError(
                f"{where}: TimeSpan {ts_id!r} redefined with a different time definition ({previous} vs {definition})"
            )
        stats.timespans[ts_id] = definition
        ts = graph.node("TimeSpan", ts_id)
        ts.add("syj:verbatim", lit(verbatim))
        ts.add("syj:precision", lit(precision))
        for key in ('year','earliest','latest'):
            if obj.get(key) is not None:
                ts.add('syj:'+key,integer(obj[key]))
        if obj.get('calendar') is not None:
            ts.add('syj:calendar',lit(obj['calendar']))
        ts.add("syj:definedBy", qname(cid))
        n.add("syj:objectTime", qname(ts_id))
    elif kind == "location":
        lat, lon = obj.get("lat"), obj.get("lon")
        if not (_num(lat) and _num(lon)):
            raise BuildError(f"{where}: location object needs numeric 'lat' and 'lon'")
        loc_id = f"loc-{cid}"
        loc = graph.node("Location", loc_id)
        loc.add("syj:lat", decimal(lat))
        loc.add("syj:lon", decimal(lon))
        precision = obj.get("precision")
        loc.add("syj:precision", lit(precision) if isinstance(precision, str) and precision else None)
        basis = obj.get("basis")
        loc.add("syj:basis", lit(basis) if isinstance(basis, str) and basis else None)
        loc.add("syj:definedBy", qname(cid))
        loc.add("syj:grounded", boolean(True))
        loc.add('syj:candidateOf',qname(subject))
        loc.add('syj:fromSource',qname(claim['fromSource']))
        loc.add('syj:origin',lit(claim['origin']))
        for key in ('validFrom','validTo'):
            if _int_value(claim.get(key)):loc.add('syj:'+key,integer(claim[key]))
        n.add("syj:objectLocation", qname(loc_id))
        if doc.source_key == PLACES_KEY:
            stats.locations_promoted += 1
        else:
            stats.locations_from_claims += 1
    else:  # validate.check_shape 가 이미 막는다
        raise BuildError(f"{where}: unknown object kind {kind!r}")

    chunk_id = claim["citesChunk"]
    stats.cited.add(chunk_id)
    n.add("syj:citesChunk", qname(chunk_id))
    n.add("syj:isSupportedBy", lit(chunk_id))
    source_id = claim["fromSource"]
    n.add("syj:fromSource", qname(source_id))
    if source_id not in cards:
        graph.warnings.append(f"{where}: fromSource {source_id!r} has no card under data/sources/; emitting a bare Source node")
        graph.node("Source", source_id)
    n.add("syj:quote", lit(claim["quote"]))
    n.add("syj:origin", lit(claim["origin"]))
    n.add("syj:status", lit(claim["status"]))
    for key in ("validFrom", "validTo"):  # §9.1
        if _int_value(claim.get(key)):
            n.add(f"syj:{key}", integer(claim[key]))
    ident = claim.get("identificationStatus")
    n.add("syj:identificationStatus", lit(ident) if isinstance(ident, str) and ident else None)
    generated_by = claim.get("generatedBy") or doc.meta.get("generated_by")
    generated_at = claim.get("generatedAt") or doc.meta.get("generated_at")
    n.add("syj:generatedBy", lit(generated_by) if isinstance(generated_by, str) and generated_by else None)
    n.add("syj:generatedAt", date_or_string(generated_at) if isinstance(generated_at, str) and generated_at else None)
    verified_by = claim.get("verifiedBy") or doc.meta.get("verified_by")
    verified_at = claim.get("verifiedAt") or doc.meta.get("verified_at")
    n.add("syj:verifiedBy", lit(verified_by) if isinstance(verified_by, str) and verified_by else None)
    n.add("syj:verifiedAt", date_or_string(verified_at) if isinstance(verified_at, str) and verified_at else None)
    n.add("syj:claimDigest", lit(V.claim_digest(claim)))
    note = claim.get("note")
    n.add("syj:note", lit(note) if isinstance(note, str) and note.strip() else None)


def check_references(graph: Graph, stats: ClaimStats, shells: dict[str, Shell], chunks: dict) -> None:
    """모든 claim 을 붙인 뒤에 본다 — TimeSpan 은 time claim 이 정의하므로 순서에 따라 나중에 생길 수 있다."""
    for ref, where in sorted(stats.refs.items()):
        if ref in shells or ref in chunks or ref in stats.timespans:
            continue
        graph.warnings.append(
            f"{where}: {ref!r} is neither an entity shell, a chunk, nor a TimeSpan defined by a time claim; dangling reference"
        )


def add_conflicts(graph: Graph, conflicts: list[dict]) -> None:
    for conflict in conflicts:
        subject, predicate = conflict["subject"], conflict["predicate"]
        if predicate in MULTI_VALUED_PREDICATES:
            continue
        m = PREDICATE_RE.match(predicate)
        local = m.group(1) if m else re.sub(r"[^A-Za-z0-9_-]", "_", predicate)
        n = graph.node("Conflict", f"conflict-{subject}-{local}")
        n.add("syj:aboutSubject", qname(subject))
        n.add("syj:aboutPredicate", f"syj:{local}" if m else lit(predicate))
        claim_ids = sorted(cid for item in conflict["objects"] for cid in item["claims"])
        n.add("syj:involvesClaim", *(qname(c) for c in claim_ids))
        n.add("syj:distinctObjects", integer(len(conflict["objects"])))


def add_ungrounded_location(graph: Graph, pid: str, index: int, cand: dict, place: dict, where: str) -> None:
    """근거 없는 candidate -> syj:Location 만. Claim 이 아니다 (모듈 설명 '좌표')."""
    loc = graph.node("Location", cand.get('id') or f"loc-{pid}-{index}")
    loc.add("syj:candidateOf", qname(pid))
    loc.add("syj:candidateIndex", integer(index))
    loc.add("syj:lat", decimal(cand["lat"]))
    loc.add("syj:lon", decimal(cand["lon"]))
    precision = cand.get("precision")
    loc.add("syj:precision", lit(precision) if isinstance(precision, str) and precision else None)
    basis = cand.get("basis")
    loc.add("syj:basis", lit(basis) if isinstance(basis, str) and basis else None)
    status = place.get("status")
    loc.add("syj:identificationStatus", lit(status) if isinstance(status, str) and status else None)
    for key in ("validFrom", "validTo"):
        value=cand.get(key,place.get(key))
        if _int_value(value):loc.add(f"syj:{key}", integer(value))
    origin=cand.get('origin',place.get('origin'))
    if origin:loc.add('syj:origin',lit(origin))
    source=cand.get('fromSource') or cand.get('sourceId') or place.get('sourceId')
    if source:loc.add('syj:fromSource',qname(source))
    if cand.get('sourceUrl'):loc.add('syj:sourceUrl',uri_literal(cand['sourceUrl']))
    for source in cand.get('requiredSources',[]):loc.add('syj:requiresSource',qname(source))
    if cand.get('derived'):
        loc.add('syj:derivedFrom',qname(cand['claimId']),qname(cand['coordinateClaimId']))
    else:
        loc.add("syj:fromFile", lit(where))
    loc.add("syj:grounded", boolean(False))


# ----------------------------------------------------------------------------
# 방출
# ----------------------------------------------------------------------------


def render_node(node: Node) -> str:
    lines = [f"{qname(node.id)} a syj:{node.cls}"]
    for predicate, objects in node.props:
        if not objects:
            continue
        values = sorted(objects) if len(objects) > 1 else objects
        lines.append(f"    {predicate} " + " ,\n        ".join(values))
    return " ;\n".join(lines) + " ."


def render(graph: Graph, header: list[str]) -> tuple[str, int, dict[str, int]]:
    out: list[str] = [f"# {line}" if line else "#" for line in header]
    out.append("")
    for prefix, iri in PREFIXES:
        out.append(f"@prefix {prefix}:{' ' * (5 - len(prefix))}<{iri}> .")
    out.append("")
    triples = 0

    out.append("# ---- vocabulary (rdfs only — OWL 은 쓰지 않는다; 외부 표준은 rdfs:seeAlso 로 대응만 적는다, §2) ----")
    out.append("")
    for cls in CLASSES:
        lines = [f"syj:{cls} a rdfs:Class", f"    rdfs:label {lit(CLASS_LABELS[cls], 'ko')}"]
        triples += 2
        see_also = SEE_ALSO.get(cls)
        if see_also:
            lines.append("    rdfs:seeAlso " + " , ".join(f"<{iri}>" for iri in see_also))
            triples += len(see_also)
        out.append(" ;\n".join(lines) + " .")
        out.append("")

    by_class: dict[str, int] = {}
    for cls in CLASSES:
        nodes = graph.by_class(cls)
        by_class[cls] = len(nodes)
        if not nodes:
            continue
        out.append(f"# ---- {cls} ({len(nodes)}) ----")
        out.append("")
        for node in nodes:
            out.append(render_node(node))
            out.append("")
            triples += node.triples
    return "\n".join(out).rstrip("\n") + "\n", triples, by_class


# ----------------------------------------------------------------------------
# 빌드
# ----------------------------------------------------------------------------


@dataclass
class BuildResult:
    failures: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    stats: dict = field(default_factory=dict)
    text: str | None = None
    sha256: str | None = None


def build(data_dir: Path, out_path: Path | None, out=None) -> tuple[int, BuildResult]:
    out = out or sys.stdout
    result = BuildResult()

    def say(line: str = "") -> None:
        print(line, file=out)

    say("sigong-yeojido build")
    say(f"  data        : {V.rel(data_dir)}")
    say(f"  out         : {V.rel(out_path) if out_path else '(dry run)'}")

    # 1) 적재 — validate.py 의 로더 + 카드 · 껍데기 · places.json
    inputs = V.load_inputs(data_dir)
    failures = [f.render() for f in inputs.failures]
    warnings = list(inputs.warnings)
    graph = Graph()
    stats = ClaimStats()
    shells: dict[str, Shell] = {}
    cards: dict[str, tuple[dict, Path]] = {}
    plan = PlacePlan()
    places_path = data_dir / PLACES_FILENAME
    docs = list(inputs.docs)
    try:
        shells = load_shells(data_dir / "entities", graph.warnings)
        cards = load_cards(data_dir / "sources")
        load_places(places_path)  # Keep the primary file's shape diagnostics.
        catalog=merged_place_catalog(data_dir)
        for place in catalog['places']:
            if place.get('from') and place['id'] not in shells:
                shells[place['id']]=Shell(place['id'],'Place',place.get('labelKo') or place.get('label'),place.get('label'))
                inputs.entities[place['id']]=str(data_dir/place['from'])
        entities=[{'id':s.id,'type':s.cls,'label':s.label,'labelHanja':s.label_hanja} for s in shells.values()]
        catalog=with_locations(catalog,[c for doc in docs for c in doc.claims if isinstance(c,dict)],entities)
        plan = plan_places(catalog['places'], shells, V.rel(places_path), graph.warnings)
    except BuildError as exc:
        failures.append(f"FAIL [build] {exc}")
    if plan.promoted:  # 승격 후보는 claims 파일의 claim 과 똑같이 검사받는다 (같은 파서 · 같은 게이트 · 같은 충돌 규칙)
        docs.append(V.ClaimsDoc(path=places_path, label=V.rel(places_path), source_key=PLACES_KEY, meta={}, claims=plan.promoted))

    # 2) 게이트 — validate.py 의 검사
    report = V.validate(inputs.chunks, inputs.entities, docs, inputs.digests)
    failures.extend(f.render() for f in report.failures)
    warnings.extend(report.warnings)

    # 3) 조립 — 실패가 없을 때만
    triples = 0
    by_class: dict[str, int] = {}
    if not failures:
        try:
            chunk_counts = inputs.chunk_counts
            for sid in sorted(cards):
                meta, path = cards[sid]
                if sid != f"src-{path.stem}":
                    graph.warnings.append(f"{V.rel(path)}: card id {sid!r} != 'src-{path.stem}' from the file name")
                add_source(graph, sid, meta, path, chunk_counts.get(sid, 0))
            for shell in shells.values():
                add_shell(graph, shell)
            for doc in sorted(docs, key=lambda d: (d.source_key, d.path.as_posix())):
                for claim in doc.claims:
                    add_claim(graph, claim, doc, inputs.chunks, cards, stats)
            for cid in sorted(stats.cited):
                add_chunk(graph, cid, inputs.chunks[cid], cards)
            add_conflicts(graph, report.conflicts)
            for pid, index, cand, place in plan.ungrounded:
                # 파일 표식은 환경값이 아닌 고정 문자열 — 절대경로가 산출물에 들어가면 결정론이 깨진다
                filename=cand.get('from') or place.get('from') or PLACES_FILENAME
                add_ungrounded_location(graph, pid, index, cand, place, f"{data_dir.name}/{filename}")
            check_references(graph, stats, shells, inputs.chunks)
        except BuildError as exc:
            failures.append(f"FAIL [build] {exc}")
        failures.extend(f"FAIL [build] {msg}" for msg in graph.failures)
    warnings.extend(graph.warnings)

    digest_totals = V.digest_totals(report)
    if not failures:
        header = [
            "sigong-yeojido — 시공여지도 knowledge graph. built by services/build_ttl.py (docs/02-schema.md)",
            "원문(chunk text)은 이 파일에 없다. data/sources/<src>/chunks.jsonl 이 단일 진실이다.",
            f"Source {graph.count('Source')} · Chunk {graph.count('Chunk')} · entities "
            f"{sum(graph.count(c) for c in ENTITY_DIRS.values())} · TimeSpan {graph.count('TimeSpan')} · "
            f"Location {graph.count('Location')} · Claim {graph.count('Claim')} · Conflict {graph.count('Conflict')}",
        ]
        text, triples, by_class = render(graph, header)
        result.text = text
        result.sha256 = hashlib.sha256(text.encode("utf-8")).hexdigest()

    result.failures = failures
    result.warnings = warnings
    entity_counts = {cls: by_class.get(cls, 0) for cls in ENTITY_DIRS.values()}
    n_ungrounded = len(plan.ungrounded) if not failures else 0
    result.stats = {
        "triples": triples,
        "byClass": by_class,
        "sources": len(cards),
        "chunksInCorpus": len(inputs.chunks),
        "chunksCited": len(stats.cited),
        "entities": sum(entity_counts.values()),
        "claims": stats.claims,
        "objectKinds": dict(sorted(stats.kinds.items())),
        "citations": stats.claims,
        "timespans": len(stats.timespans),
        "locations": {
            "fromClaimFiles": stats.locations_from_claims,
            "promotedFromPlaces": stats.locations_promoted,
            "ungroundedCandidates": n_ungrounded,
            "placesInFile": plan.n_places,
            "candidatesInFile": plan.n_candidates,
        },
        "conflicts": len(report.conflicts),
        "digests": digest_totals,
        "warnings": len(warnings),
        "failures": len(failures),
    }

    # 4) 로그 — 클래스별 노드 수 · 인용 수
    say(f"  sources     : {len(cards)}  {', '.join(sorted(cards)) or '-'}")
    say(f"  chunks      : {len(inputs.chunks)} in corpus, {len(stats.cited)} cited -> emitted (text is never emitted)")
    say(f"  entities    : {sum(entity_counts.values())}  " + ", ".join(f"{k} {v}" for k, v in sorted(entity_counts.items())))
    say(f"  claims      : {stats.claims}  " + ", ".join(f"{k} {v}" for k, v in sorted(stats.kinds.items())))
    say(f"  citations   : {stats.claims} claim->chunk edges (each doubled as syj:isSupportedBy literal)")
    say(f"  timespans   : {len(stats.timespans)}")
    say(
        f"  places.json : {plan.n_places} places, {plan.n_candidates} candidates -> {len(plan.promoted)} promoted to Claim "
        f"(citesChunk+quote+fromSource), {len(plan.ungrounded)} ungrounded Location (no evidence; not Claims)"
    )
    say(
        f"  locations   : {by_class.get('Location', 0)} Location nodes = {stats.locations_from_claims} from claims files "
        f"+ {stats.locations_promoted} promoted + {n_ungrounded} ungrounded"
    )
    say(f"  conflicts   : {len(report.conflicts)}  (informational, validate.py rule)")
    say("  digests     : " + " ".join(f"{k}={v}" for k, v in digest_totals.items()))
    say(f"  triples     : {triples}")
    if by_class:
        say("  by class    : " + ", ".join(f"{cls} {by_class[cls]}" for cls in CLASSES))
    say(f"  warnings    : {len(warnings)}")
    say(f"  failures    : {len(failures)}")
    for warning in warnings:
        say(f"WARN {warning}")
    for failure in failures:
        say(failure)
    if failures:
        say(f"FAILED ({len(failures)} failures) - nothing written")
        return 1, result

    # 5) 쓰기 — 실패가 없을 때만, 원자적으로
    if out_path is not None and result.text is not None:
        write_atomic(out_path, result.text)
        say(f"OK -> {V.rel(out_path)} ({len(result.text.encode('utf-8'))} bytes, sha256 {result.sha256})")
    else:
        say(f"OK (dry run, sha256 {result.sha256})")
    return 0, result


def write_atomic(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(prefix=path.name + ".", suffix=".tmp", dir=str(path.parent))
    try:
        with io.open(fd, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(text)
        os.replace(tmp, path)
    except BaseException:
        try:
            os.unlink(tmp)
        except OSError:
            pass
        raise


# ----------------------------------------------------------------------------


def main(argv: list[str]) -> int:
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(errors="backslashreplace")  # cp949 콘솔에서도 죽지 않는다
        except (AttributeError, ValueError):
            pass
    ap = argparse.ArgumentParser(description="build data/build/sigong.ttl from data/ (docs/02-schema.md)")
    ap.add_argument("--data", default=str(DATA_DIR), help="data root (default: data/)")
    ap.add_argument("--out", default=str(DEFAULT_OUT), help="output .ttl (default: data/build/sigong.ttl)")
    ap.add_argument("--dry-run", action="store_true", help="validate and render, but do not write")
    args = ap.parse_args(argv)
    data_dir = Path(args.data).resolve()
    if not data_dir.is_dir():
        print(f"data root does not exist: {data_dir}", file=sys.stderr)
        return 2
    code, _ = build(data_dir, None if args.dry_run else Path(args.out).resolve())
    return code


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
