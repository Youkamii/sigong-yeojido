#!/usr/bin/env python3
"""Turtle 문법 점검기 — 표준 라이브러리만으로 .ttl 을 훑는다 (F5 DoD 6).

실행:  python services/ttl_check.py data/build/sigong.ttl
       exit 0 이면 문법 오류 없음. 트리플 수와 접두어 수를 찍는다.

검사하는 것:
  - @prefix / PREFIX 선언과 사용 — 선언 안 된 접두어를 쓰면 오류
  - 트리플 구조 — subject predicateObjectList '.'  (종결 '.' 누락, ';' ',' 오용)
  - 문자열 리터럴 — 따옴표 닫힘, 허용된 이스케이프만 (\\t \\b \\n \\r \\f \\" \\' \\\\ \\uXXXX \\UXXXXXXXX),
    짧은 따옴표 안의 날 줄바꿈 금지
  - IRI — <...> 안에 공백·제어문자·<>"{}|^` 금지
  - 접두어 이름의 local 부분 — PN_LOCAL 규칙 ('.' 로 끝나지 않음, 허용 문자)
  - 숫자(integer/decimal/double) · 불리언 · 언어 태그 · ^^datatype
  - 빈 노드 [ ... ] 와 컬렉션 ( ... ) 도 받는다 (빌더는 방출하지 않지만 문법상 허용)

모으는 것: 트리플 목록 Result.graph — (subject, predicate, object).
  IRI 는 접두어를 푼 전체 형태(꺾쇠 없이), 빈 노드는 _:b<n>, 리터럴은 Turtle 표기 그대로
  ("..."@ko · "..."^^<datatype IRI> · 414 · 41.5 · true). 리터럴의 값은 literal_value() 로 꺼낸다.
  검사 스크립트와 테스트가 SPARQL 없이 그래프를 질의하는 데 쓴다.

Turtle 1.1 전부를 구현하지는 않는다. 빌더가 방출하는 부분집합과 흔한 오류를 잡는 것이 목적이다.
riot(Apache Jena)·rdflib 같은 외부 파서가 있으면 그것도 돌린다 — 이 점검기는 대체가 아니라 최소 방어선이다.
"""
from __future__ import annotations

import io
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

# --- 어휘 (Turtle 1.1 §6.5 의 부분집합) -------------------------------------

PN_CHARS_BASE = (
    "A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF"
    "\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD"
    "\U00010000-\U000EFFFF"
)
PN_CHARS_U = PN_CHARS_BASE + "_"
PN_CHARS = PN_CHARS_U + "\\-0-9\u00B7\u0300-\u036F\u203F-\u2040"
PLX = r"(?:%[0-9A-Fa-f]{2}|\\[_~.\-!$&'()*+,;=/?#@%])"
PN_PREFIX = f"[{PN_CHARS_BASE}](?:[{PN_CHARS}.]*[{PN_CHARS}])?"
PN_LOCAL = (
    f"(?:[{PN_CHARS_U}:0-9]|{PLX})"
    f"(?:(?:[{PN_CHARS}.:]|{PLX})*(?:[{PN_CHARS}:]|{PLX}))?"
)

IRIREF_RE = re.compile(r'<(?:[^\x00-\x20<>"{}|^`\\]|\\u[0-9A-Fa-f]{4}|\\U[0-9A-Fa-f]{8})*>')
PNAME_RE = re.compile(f"(?P<prefix>{PN_PREFIX})?:(?P<local>{PN_LOCAL})?")
BLANK_RE = re.compile(f"_:[{PN_CHARS_U}0-9](?:[{PN_CHARS}.]*[{PN_CHARS}])?")
LANGTAG_RE = re.compile(r"@[a-zA-Z]+(?:-[a-zA-Z0-9]+)*")
DOUBLE_RE = re.compile(r"[+-]?(?:[0-9]+\.[0-9]*[eE][+-]?[0-9]+|\.[0-9]+[eE][+-]?[0-9]+|[0-9]+[eE][+-]?[0-9]+)")
DECIMAL_RE = re.compile(r"[+-]?[0-9]*\.[0-9]+")
INTEGER_RE = re.compile(r"[+-]?[0-9]+")
KEYWORD_RE = re.compile(r"(?:@prefix|@base|a|true|false)(?![A-Za-z0-9_:\-])")
SPARQL_KEYWORD_RE = re.compile(r"(?i:PREFIX|BASE)(?![A-Za-z0-9_:\-])")
ECHAR_RE = re.compile(r'\\(?:[tbnrf"\'\\]|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})')
PUNCT = ".;,[]()"

RDF = "http://www.w3.org/1999/02/22-rdf-syntax-ns#"
RDF_TYPE = RDF + "type"
RDF_FIRST = RDF + "first"
RDF_REST = RDF + "rest"
RDF_NIL = RDF + "nil"
XSD_STRING = "http://www.w3.org/2001/XMLSchema#string"

ECHAR_MAP = {"t": "\t", "b": "\b", "n": "\n", "r": "\r", "f": "\f", '"': '"', "'": "'", "\\": "\\"}


@dataclass
class Token:
    kind: str  # iri | pname | blank | string | langtag | dtsep | number | keyword | punct | eof
    text: str
    line: int
    col: int


@dataclass
class Result:
    triples: int = 0
    prefixes: dict[str, str] = field(default_factory=dict)
    errors: list[str] = field(default_factory=list)
    statements: int = 0
    graph: list[tuple[str, str, str]] = field(default_factory=list)  # (subject, predicate, object)

    @property
    def ok(self) -> bool:
        return not self.errors


class TurtleError(ValueError):
    pass


# --- 항 다루기 ----------------------------------------------------------------


def unescape_string(body: str) -> str:
    """따옴표 안쪽(이스케이프 포함)을 값으로 푼다."""

    def repl(m: re.Match) -> str:
        esc = m.group(0)
        if esc[1] in "uU":
            return chr(int(esc[2:], 16))
        return ECHAR_MAP[esc[1]]

    return ECHAR_RE.sub(repl, body)


def unescape_local(local: str) -> str:
    """PN_LOCAL 의 백슬래시 이스케이프(\\- 등)를 푼다. 퍼센트 인코딩은 그대로 둔다."""
    return re.sub(r"\\([_~.\-!$&'()*+,;=/?#@%])", r"\1", local)


def literal_value(term: str) -> str | None:
    """graph 의 object 항에서 리터럴 값을 꺼낸다. IRI · 빈 노드면 None. 숫자·불리언은 표기 그대로."""
    if not term:
        return None
    if term[0] in "\"'":
        quote = term[0]
        if term.startswith(quote * 3):
            end = term.find(quote * 3, 3)
            return unescape_string(term[3:end]) if end >= 0 else None
        i = 1
        while i < len(term):
            if term[i] == "\\":
                i += 2
                continue
            if term[i] == quote:
                return unescape_string(term[1:i])
            i += 1
        return None
    if term[0] in "+-.0123456789" or term in ("true", "false"):
        return term
    return None


def is_literal(term: str) -> bool:
    return bool(term) and (term[0] in "\"'+-.0123456789" or term in ("true", "false"))


class Index:
    """Result.graph 를 노드별로 묶는다 — {subject: {predicate: [object, ...]}}. 테스트·점검 스크립트용 작은 질의기."""

    def __init__(self, graph: list[tuple[str, str, str]]):
        self.spo: dict[str, dict[str, list[str]]] = {}
        for s, p, o in graph:
            self.spo.setdefault(s, {}).setdefault(p, []).append(o)

    def objects(self, s: str, p: str) -> list[str]:
        return self.spo.get(s, {}).get(p, [])

    def types(self, s: str) -> set[str]:
        return set(self.objects(s, RDF_TYPE))

    def of_type(self, cls_iri: str) -> list[str]:
        return sorted(s for s in self.spo if cls_iri in self.types(s))

    def value(self, s: str, p: str) -> str | None:
        """첫 object 의 리터럴 값. 없거나 IRI 면 None."""
        objs = self.objects(s, p)
        return literal_value(objs[0]) if objs else None


# --- 토크나이저 ---------------------------------------------------------------


class Lexer:
    def __init__(self, text: str):
        self.text = text
        self.pos = 0
        self.line = 1
        self.line_start = 0

    def _advance(self, n: int) -> None:
        chunk = self.text[self.pos : self.pos + n]
        newlines = chunk.count("\n")
        if newlines:
            self.line += newlines
            self.line_start = self.pos + chunk.rfind("\n") + 1
        self.pos += n

    def _skip_ws(self) -> None:
        text = self.text
        while self.pos < len(text):
            ch = text[self.pos]
            if ch in " \t\r\n":
                self._advance(1)
            elif ch == "#":
                end = text.find("\n", self.pos)
                self._advance((len(text) if end < 0 else end) - self.pos)
            else:
                break

    def _where(self) -> tuple[int, int]:
        return self.line, self.pos - self.line_start + 1

    def _string(self) -> str:
        """따옴표 리터럴 하나를 읽어 원문 그대로 돌려준다. 이스케이프·종결을 검사한다."""
        text = self.text
        start = self.pos
        line, col = self._where()
        quote = text[start]
        long_form = text.startswith(quote * 3, start)
        delim = quote * 3 if long_form else quote
        i = start + len(delim)
        while True:
            if i >= len(text):
                raise TurtleError(f"line {line} col {col}: unterminated string literal")
            ch = text[i]
            if ch == "\\":
                m = ECHAR_RE.match(text, i)
                if not m:
                    bad = text[i : i + 2]
                    raise TurtleError(f"line {line} col {col}: invalid escape {bad!r} in string literal")
                i = m.end()
                continue
            if text.startswith(delim, i):
                i += len(delim)
                break
            if not long_form and ch in "\n\r":
                raise TurtleError(f"line {line} col {col}: raw line break inside short string literal")
            i += 1
        raw = text[start:i]
        self._advance(i - start)
        return raw

    def tokens(self) -> list[Token]:
        out: list[Token] = []
        text = self.text
        while True:
            self._skip_ws()
            if self.pos >= len(text):
                out.append(Token("eof", "", *self._where()))
                return out
            line, col = self._where()
            ch = text[self.pos]
            if ch in "\"'":
                out.append(Token("string", self._string(), line, col))
                continue
            if ch == "<":
                m = IRIREF_RE.match(text, self.pos)
                if not m:
                    raise TurtleError(f"line {line} col {col}: malformed IRI (whitespace or forbidden character inside <...>?)")
                out.append(Token("iri", m.group(0), line, col))
                self._advance(m.end() - self.pos)
                continue
            if ch == "@":
                m = KEYWORD_RE.match(text, self.pos)
                if m:
                    out.append(Token("keyword", m.group(0), line, col))
                    self._advance(m.end() - self.pos)
                    continue
                m = LANGTAG_RE.match(text, self.pos)
                if not m:
                    raise TurtleError(f"line {line} col {col}: malformed language tag or directive")
                out.append(Token("langtag", m.group(0), line, col))
                self._advance(m.end() - self.pos)
                continue
            if text.startswith("^^", self.pos):
                out.append(Token("dtsep", "^^", line, col))
                self._advance(2)
                continue
            if ch in PUNCT:
                out.append(Token("punct", ch, line, col))
                self._advance(1)
                continue
            if text.startswith("_:", self.pos):
                m = BLANK_RE.match(text, self.pos)
                if not m:
                    raise TurtleError(f"line {line} col {col}: malformed blank node label")
                out.append(Token("blank", m.group(0), line, col))
                self._advance(m.end() - self.pos)
                continue
            m = KEYWORD_RE.match(text, self.pos) or SPARQL_KEYWORD_RE.match(text, self.pos)
            if m:
                out.append(Token("keyword", m.group(0), line, col))
                self._advance(m.end() - self.pos)
                continue
            for regex in (DOUBLE_RE, DECIMAL_RE, INTEGER_RE):
                m = regex.match(text, self.pos)
                if m and m.end() > self.pos:
                    nxt = text[m.end() : m.end() + 1]
                    if regex is INTEGER_RE and nxt and (nxt.isalpha() or nxt == ":"):
                        m = None  # 숫자로 시작하는 접두어 이름 (":1a" 같은) 은 pname 으로
                    break
            if m and m.end() > self.pos:
                out.append(Token("number", m.group(0), line, col))
                self._advance(m.end() - self.pos)
                continue
            m = PNAME_RE.match(text, self.pos)
            if m and m.end() > self.pos:
                out.append(Token("pname", m.group(0), line, col))
                self._advance(m.end() - self.pos)
                continue
            raise TurtleError(f"line {line} col {col}: unexpected character {ch!r}")


# --- 파서 -------------------------------------------------------------------


class Parser:
    def __init__(self, tokens: list[Token]):
        self.toks = tokens
        self.i = 0
        self.result = Result()
        self.subj: str | None = None
        self.pred: str | None = None
        self.n_blank = 0

    # 도구
    def peek(self) -> Token:
        return self.toks[self.i]

    def take(self) -> Token:
        tok = self.toks[self.i]
        self.i += 1
        return tok

    def expect_punct(self, ch: str, context: str) -> None:
        tok = self.take()
        if tok.kind != "punct" or tok.text != ch:
            raise TurtleError(f"line {tok.line} col {tok.col}: expected {ch!r} {context}, got {tok.text!r}")

    def is_punct(self, ch: str) -> bool:
        tok = self.peek()
        return tok.kind == "punct" and tok.text == ch

    def new_blank(self) -> str:
        self.n_blank += 1
        return f"_:b{self.n_blank}"

    def term(self, tok: Token) -> str:
        """IRI · 접두어 이름 · 빈 노드 · 숫자 · 불리언 -> graph 에 넣을 항."""
        if tok.kind == "iri":
            return tok.text[1:-1]
        if tok.kind == "pname":
            self.check_pname(tok)
            prefix, local = tok.text.split(":", 1)
            return self.result.prefixes[prefix] + unescape_local(local)
        return tok.text  # blank · number · true/false

    def emit(self, obj: str) -> None:
        assert self.subj is not None and self.pred is not None
        self.result.graph.append((self.subj, self.pred, obj))

    # 문법
    def document(self) -> Result:
        while self.peek().kind != "eof":
            tok = self.peek()
            if tok.kind == "keyword" and tok.text in ("@prefix", "@base"):
                self.directive(sparql_style=False)
            elif tok.kind == "keyword" and tok.text.upper() in ("PREFIX", "BASE"):
                self.directive(sparql_style=True)
            else:
                self.triples()
                self.expect_punct(".", "to end the statement")
                self.result.statements += 1
        self.result.triples = len(self.result.graph)
        return self.result

    def directive(self, *, sparql_style: bool) -> None:
        kw = self.take()
        if kw.text.lower().lstrip("@") == "prefix":
            ns = self.take()
            if ns.kind != "pname" or not ns.text.endswith(":") or ns.text.count(":") != 1:
                raise TurtleError(f"line {ns.line} col {ns.col}: expected 'prefix:' after {kw.text}")
            iri = self.take()
            if iri.kind != "iri":
                raise TurtleError(f"line {iri.line} col {iri.col}: expected <IRI> in prefix directive")
            self.result.prefixes[ns.text[:-1]] = iri.text[1:-1]
        else:
            iri = self.take()
            if iri.kind != "iri":
                raise TurtleError(f"line {iri.line} col {iri.col}: expected <IRI> in base directive")
        if not sparql_style:
            self.expect_punct(".", f"after {kw.text} directive")

    def triples(self) -> None:
        if self.is_punct("["):
            label = self.blank_node_property_list()
            if not self.is_punct("."):
                self.subj = label
                self.predicate_object_list()
            return
        self.subj = self.subject()
        self.predicate_object_list()

    def subject(self) -> str:
        tok = self.take()
        if tok.kind in ("iri", "pname", "blank"):
            return self.term(tok)
        if tok.kind == "punct" and tok.text == "(":
            self.i -= 1
            return self.collection()
        raise TurtleError(f"line {tok.line} col {tok.col}: expected a subject, got {tok.text!r}")

    def predicate_object_list(self) -> None:
        self.verb()
        self.object_list()
        while self.is_punct(";"):
            self.take()
            tok = self.peek()
            if tok.kind in ("iri", "pname") or (tok.kind == "keyword" and tok.text == "a"):
                self.verb()
                self.object_list()
            else:
                break  # ';' 뒤에 바로 '.' 이 와도 된다 (Turtle 1.1)

    def verb(self) -> None:
        tok = self.take()
        if tok.kind == "keyword" and tok.text == "a":
            self.pred = RDF_TYPE
            return
        if tok.kind in ("iri", "pname"):
            self.pred = self.term(tok)
            return
        raise TurtleError(f"line {tok.line} col {tok.col}: expected a predicate, got {tok.text!r}")

    def object_list(self) -> None:
        self.emit(self.object())
        while self.is_punct(","):
            self.take()
            self.emit(self.object())

    def object(self) -> str:
        tok = self.peek()
        if tok.kind in ("iri", "blank", "pname"):
            self.take()
            return self.term(tok)
        if tok.kind == "string":
            self.take()
            raw = tok.text
            nxt = self.peek()
            if nxt.kind == "langtag":
                self.take()
                raw += nxt.text
            elif nxt.kind == "dtsep":
                self.take()
                dt = self.take()
                if dt.kind == "pname":
                    self.check_pname(dt)
                elif dt.kind != "iri":
                    raise TurtleError(f"line {dt.line} col {dt.col}: expected datatype IRI after ^^")
                raw += "^^<" + self.term(dt) + ">"
            return raw
        if tok.kind == "number":
            self.take()
            return tok.text
        if tok.kind == "keyword" and tok.text in ("true", "false"):
            self.take()
            return tok.text
        if tok.kind == "punct" and tok.text == "[":
            return self.blank_node_property_list()
        if tok.kind == "punct" and tok.text == "(":
            return self.collection()
        raise TurtleError(f"line {tok.line} col {tok.col}: expected an object, got {tok.text!r}")

    def blank_node_property_list(self) -> str:
        self.expect_punct("[", "to open a blank node")
        label = self.new_blank()
        if self.is_punct("]"):
            self.take()
            return label
        saved = (self.subj, self.pred)
        self.subj = label
        self.predicate_object_list()
        self.subj, self.pred = saved
        self.expect_punct("]", "to close a blank node")
        return label

    def collection(self) -> str:
        self.expect_punct("(", "to open a collection")
        saved = (self.subj, self.pred)
        head: str | None = None
        prev: str | None = None
        while not self.is_punct(")"):
            if self.peek().kind == "eof":
                raise TurtleError("unterminated collection")
            node = self.new_blank()
            if head is None:
                head = node
            if prev is not None:
                self.result.graph.append((prev, RDF_REST, node))
            item = self.object()
            self.result.graph.append((node, RDF_FIRST, item))
            prev = node
        self.take()
        if prev is not None:
            self.result.graph.append((prev, RDF_REST, RDF_NIL))
        self.subj, self.pred = saved
        return head if head is not None else RDF_NIL

    def check_pname(self, tok: Token) -> None:
        prefix = tok.text.split(":", 1)[0]
        if prefix not in self.result.prefixes:
            raise TurtleError(f"line {tok.line} col {tok.col}: undeclared prefix {prefix + ':'!r} in {tok.text!r}")
        local = tok.text.split(":", 1)[1]
        if local.endswith("."):
            raise TurtleError(f"line {tok.line} col {tok.col}: local name must not end with '.' ({tok.text!r})")


def check_text(text: str) -> Result:
    """문자열 전체를 훑는다. 첫 오류에서 멈추고 errors 에 담는다 (뒤는 신뢰할 수 없으므로)."""
    result = Result()
    try:
        tokens = Lexer(text).tokens()
        parser = Parser(tokens)
        result = parser.document()
    except TurtleError as exc:
        result.errors.append(str(exc))
    return result


def check_file(path: Path) -> Result:
    with io.open(path, encoding="utf-8", newline="") as fh:
        text = fh.read()
    if text.startswith("\ufeff"):
        result = Result()
        result.errors.append("file starts with a UTF-8 BOM")
        return result
    return check_text(text)


def main(argv: list[str]) -> int:
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(errors="backslashreplace")
        except (AttributeError, ValueError):
            pass
    if len(argv) != 1:
        print("usage: python services/ttl_check.py FILE.ttl", file=sys.stderr)
        return 2
    path = Path(argv[0])
    if not path.is_file():
        print(f"no such file: {path}", file=sys.stderr)
        return 2
    result = check_file(path)
    print(f"ttl-check {path.as_posix()}: statements={result.statements} triples={result.triples} prefixes={len(result.prefixes)}")
    for err in result.errors:
        print(f"ERROR {err}")
    if result.errors:
        print("FAILED")
        return 1
    print("OK")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
