"""개체 이름 정리 규칙 (#200) — 화면의 displayLabel/labelNote(services/host/app/chronicle.js) 와 같은 규칙을 파이썬으로 옮긴 것.

data/entities/<type>/<id>.md 머리말의 label 을 정리하고, 떼어낸 설명은 labelNote 에, 원래 이름은 aliases 에 남긴다.
화면 규칙과 어긋나면 tests/test_entity_labels.py 가 잡는다 — 규칙을 고칠 때는 chronicle.js 도 같이 고친다.
"""
import re

NOTE_PAREN = re.compile(r"\s*\(([^()]*)\)")
HANJA_PAREN = re.compile(r"\s*\([㐀-鿿\s]+\)")
ENCYKOREA_PAREN = re.compile(r"\s*\([^)]*민족문화대백과[^)]*\)")
PERSON_YEAR_TAIL = re.compile(r"\s*·\s*\d+년.*$")
YEAR_ONLY = re.compile(r"^[\s\d년월일경~∼～·,.\-–]+$")
YEAR_RANGE = re.compile(r"^(?:기원전\s*)?\d{1,4}년?(?:\s*[~∼～–-]\s*\d{1,4}년?)?(?:\s*(?:경|무렵))?$")
UNKNOWN = re.compile(r"미상|미확인|미기재|불명")
UNKNOWN_WORD = re.compile(r"(?<![가-힣])미상(?![가-힣])")
GROUP_TAIL = "집단 행위자"
SEPARATOR = " · "
# 이름 설명에 섞여 들어온 자료 식별자 — 사람에게 보일 말이 아니므로 sourceRef 로 옮긴다 (#200 2차).
SOURCE_REF_PATTERNS = (
    re.compile(r"(?:한국)?민족문화대백과\s*E\d{7}"),
    re.compile(r"HGIS[\s-]?\d+", re.IGNORECASE),
    re.compile(r"hgis-admin-\d+", re.IGNORECASE),
    re.compile(r"(?:Cliopatria|GeoNames|GeoName)\s*\d+", re.IGNORECASE),
    re.compile(r"\bE\d{7}\b"),
)
EMPTY_BRACKETS = re.compile(r"\(\s*\)|\[\s*\]|（\s*）")


def split_outside_parens(text: str, separator: str = SEPARATOR) -> list[str]:
    """괄호 밖에 있는 구분자로만 나눈다 — chronicle.js splitOutsideParens 와 같다.

    '(발굴 조사 기관 · 집단 행위자)' 처럼 괄호 안에 있는 ' · ' 는 이름의 일부이므로 자르지 않는다.
    """
    value = str(text or "")
    parts: list[str] = []
    depth = start = index = 0
    while index < len(value):
        char = value[index]
        if char == "(":
            depth += 1
        elif char == ")":
            depth = max(0, depth - 1)
        elif depth == 0 and value.startswith(separator, index):
            parts.append(value[start:index])
            index += len(separator)
            start = index
            continue
        index += 1
    parts.append(value[start:])
    return parts


def split_source_refs(note: str) -> tuple[str, list[str]]:
    """이름 설명에서 자료 식별자를 떼어 (사람이 읽을 설명, 식별자 목록) 을 준다.

    'HGIS 176301' → ('', ['HGIS 176301']), '조선 제25대, 민족문화대백과 E0056172' → ('조선 제25대', ['민족문화대백과 E0056172']).
    이미 정리된 설명을 다시 넣어도 그대로 나온다(멱등).
    """
    refs: list[str] = []
    text = str(note or "")

    def take(match: "re.Match[str]") -> str:
        ref = re.sub(r"\s+", " ", match.group(0)).strip()
        if ref:
            refs.append(ref)
        return ""

    for pattern in SOURCE_REF_PATTERNS:
        text = pattern.sub(take, text)
    text = EMPTY_BRACKETS.sub("", text)
    text = re.sub(r"\s{2,}", " ", text)
    text = re.sub(r"\s*([,·])(?:\s*[,·])+\s*", r"\1 ", text)
    return text.strip().strip(" ,·").strip(), list(dict.fromkeys(refs))


def clean_note(note: str) -> tuple[str, list[str]]:
    """labelNote 로 쓸 (설명, 자료 식별자 목록). 연도·날짜뿐인 설명은 빈 값으로 떨어뜨린다.

    검색 줄이 연도를 따로 보여 주므로 '사건 · 713 · 713년' 이 된다 — chronicle.js labelNote 와 같은 판정 (#203 감사 2).
    다시 넣어도 그대로 나온다(멱등).
    """
    text, refs = split_source_refs(note)
    return ("" if text and is_year_paren(text) else text), refs


def replace_unknown(text: str) -> str:
    """'(값) 미상' 처럼 홀로 선 '미상'만 '미확인'으로 바꾼다 — chronicle.js replaceUnknown 과 같다.

    앞뒤가 한글이면 이름의 일부다. 경계를 안 보던 옛 규칙이 '다미상면'을 '다미확인면'으로 망가뜨렸다 (#203 감사 11).
    """
    return UNKNOWN_WORD.sub("미확인", str(text or ""))


def is_year_paren(inner: str) -> bool:
    """괄호 속이 연도·날짜뿐인가 — chronicle.js isYearParen 과 같다."""
    return bool(YEAR_ONLY.match(inner) or YEAR_RANGE.match(inner))


def is_note_paren(inner: str) -> bool:
    """떼어낼 괄호인가 — 연도·날짜만, 11자 이상 설명, 미상/미확인/미기재/불명."""
    return is_year_paren(inner) or len(inner.strip()) >= 11 or bool(UNKNOWN.search(inner))


def strip_label_notes(text: str) -> tuple[str, list[str]]:
    """설명 괄호를 떼고 (남은 이름, 떼어낸 괄호 속 목록) 을 준다. chronicle.js stripLabelNotes 와 같은 판정."""
    notes: list[str] = []

    def replace(match: "re.Match[str]") -> str:
        inner = match.group(1)
        if is_note_paren(inner):
            kept = inner.strip()
            if kept:
                notes.append(kept)
            return ""
        return match.group(0)

    return re.sub(r"\s{2,}", " ", NOTE_PAREN.sub(replace, text)).strip(), notes


def entity_label(label: str, type_: str) -> tuple[str, list[str]]:
    """chronicle.js entityLabel — 한자 괄호·인물 연도 꼬리·민족문화대백과 괄호 정리.

    (남은 이름, 민족문화대백과 괄호에서 떼어낸 설명) 을 준다. 한자 괄호는 labelHanja 가 따로 있으므로 적지 않는다.
    """
    text = HANJA_PAREN.sub("", label)
    if type_ == "Person":
        text = PERSON_YEAR_TAIL.sub("", text)
    notes: list[str] = []

    def encykorea(match: "re.Match[str]") -> str:
        inner = match.group(0).strip().lstrip("(").rstrip(")").strip()
        polity = re.search(r"조선|고려|백제|신라|발해", inner)
        if inner:
            notes.append(inner)
        return f" ({polity.group(0)})" if polity else ""

    return ENCYKOREA_PAREN.sub(encykorea, text).strip(), notes


def clean_label(label: str, type_: str) -> dict:
    """머리말 한 줄을 정리한다.

    {'label': 새 이름, 'note': labelNote, 'sourceRef': 자료 식별자 목록, 'group': 집단 행위자였나, 'changed': 바뀌었나} 를 준다.
    비면(규칙을 다 적용해 남는 글자가 없으면) 원본을 그대로 쓴다.
    """
    original = str(label or "")
    parts = split_outside_parens(original)
    tail = SEPARATOR.join(parts[1:]) if len(parts) > 1 else ""
    group = GROUP_TAIL in original
    note_parts: list[str] = []
    tail_note = tail.replace(GROUP_TAIL, "").strip(" ·").strip()
    if tail_note:
        note_parts.append(tail_note)
    base, encykorea_notes = entity_label(original, type_)
    base = split_outside_parens(base)[0]
    stripped, paren_notes = strip_label_notes(base)
    note_parts.extend(paren_notes)
    note_parts.extend(encykorea_notes)
    cleaned = re.sub(r"\s{2,}", " ", stripped.replace(GROUP_TAIL, "").replace("정본", "")).strip()
    cleaned = replace_unknown(cleaned)
    # 결과가 비거나 괄호 짝이 깨지면(' · ' 가 괄호 안에 있는 이름) 원본을 지킨다 — 이름을 망가뜨리지 않는다
    if not cleaned or cleaned.count("(") != cleaned.count(")"):
        return {"label": original, "note": "", "sourceRef": [], "group": group, "changed": False}
    notes = (re.sub(r"\s{2,}", " ", replace_unknown(part.replace(GROUP_TAIL, ""))).strip(" ·")
             for part in note_parts)
    note, refs = clean_note(SEPARATOR.join(dict.fromkeys(part for part in notes if part)))
    return {"label": cleaned, "note": note, "sourceRef": refs, "group": group, "changed": cleaned != original}
