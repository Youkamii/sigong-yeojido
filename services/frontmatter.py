"""Shared front matter parser for repository scalars, mappings and lists."""
import re

KEY_RE = re.compile(r"^([A-Za-z_][A-Za-z0-9_-]*):(?:[ \t]+(.*))?$")


class ParseError(ValueError):
    """Malformed front matter or claims-json."""


def _indent(line: str) -> int:
    return len(line) - len(line.lstrip(" "))


def _scalar(value: str):
    value = value.strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
        return value[1:-1]
    if value in ("null", "~", ""):
        return None
    if value in ("true", "false"):
        return value == "true"
    if re.fullmatch(r"-?\d+", value):
        return int(value)
    return value


def _parse_mapping(lines: list[str], start: int, indent: int) -> tuple[dict, int]:
    out: dict = {}
    i = start
    while i < len(lines):
        line = lines[i]
        if not line.strip() or line.lstrip().startswith("#"):
            i += 1
            continue
        ind = _indent(line)
        if ind < indent:
            break
        if ind > indent:
            raise ParseError(f"front matter line {i + 1}: unexpected indent")
        m = KEY_RE.match(line.strip())
        if not m:
            raise ParseError(f"front matter line {i + 1}: not a 'key: value' line: {line.strip()!r}")
        key, val = m.group(1), m.group(2)
        if key in out:
            raise ParseError(f"front matter line {i + 1}: key repeated: {key}")
        i += 1
        if val is None or not val.strip():
            j = i
            while j < len(lines) and not lines[j].strip():
                j += 1
            if j < len(lines) and _indent(lines[j]) > indent:
                if lines[j].lstrip().startswith("- "):
                    value, i = _parse_list(lines, j, _indent(lines[j]))
                else:
                    value, i = _parse_mapping(lines, j, _indent(lines[j]))
            else:
                value = None
        else:
            value = _scalar(val)
        out[key] = value
    return out, i


def _parse_list(lines: list[str], start: int, indent: int) -> tuple[list, int]:
    items: list = []
    i = start
    while i < len(lines):
        line = lines[i]
        if not line.strip() or line.lstrip().startswith("#"):
            i += 1
            continue
        ind = _indent(line)
        if ind < indent:
            break
        if ind > indent:
            raise ParseError(f"front matter line {i + 1}: unexpected indent in list")
        stripped = line.strip()
        if not stripped.startswith("- "):
            break
        rest = stripped[2:]
        if KEY_RE.match(rest):
            item_indent = ind + 2
            sub = [" " * item_indent + rest]
            i += 1
            while i < len(lines) and (not lines[i].strip() or _indent(lines[i]) >= item_indent):
                sub.append(lines[i])
                i += 1
            item, consumed = _parse_mapping(sub, 0, item_indent)
            if consumed != len(sub):
                raise ParseError("unparsed list item content")
            items.append(item)
        else:
            items.append(_scalar(rest))
            i += 1
    return items, i


def parse_front_matter(text: str) -> tuple[dict, str]:
    lines = text.lstrip("\ufeff").replace("\r\n", "\n").split("\n")
    if not lines or lines[0] != "---":
        raise ParseError("front matter must open with '---' on line 1")
    for end in range(1, len(lines)):
        if lines[end] == "---":
            body = lines[1:end]
            if any("\t" in line[:len(line) - len(line.lstrip())] for line in body):
                raise ParseError("front matter indentation must use spaces")
            meta, consumed = _parse_mapping(body, 0, 0)
            if consumed != len(body):
                raise ParseError("unparsed front matter content")
            return meta, "\n".join(lines[end + 1:])
    raise ParseError("front matter is not closed with '---'")
