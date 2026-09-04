#!/usr/bin/env python3
"""원문 → chunk JSONL 추출기.

표준 배치: services/ingestion/extract_chunks.py
실행:      python3 services/ingestion/extract_chunks.py [--source gwanggaeto]

설계 원칙 (docs/02-schema.md §6):
  - chunk id는 결정론적이고 위치를 인코딩한다: chunk_{sourceId}_{위치}
  - 원문 텍스트는 여기(JSONL)에만 산다. RDF에는 id만 들어간다
  - 원본 파일(raw.*)은 절대 수정하지 않는다. 가공은 전부 여기서

정직성 장치:
  - 결자 {{?}}는 버리지 않고 □로 보존하며 개수를 센다
  - 편집자 주석 (…)은 원문에서 분리해 editorNotes로 뺀다 — 원문과 후대 주석을 섞지 않는다
  - 줄 번호는 transcriptLine(전사본 줄)이다. 실제 비면 행과의 대응은 미확인
"""
from __future__ import annotations

import argparse
import io
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCES_DIR = ROOT / "data" / "sources"

MISSING_MARK = "□"

FACE_RE = re.compile(r"^==\s*(\d+)면\s*==$")
LINE_RE = re.compile(r"^#\s*(.*)$")
NOTE_RE = re.compile(r"\(([^()]*)\)")
TEMPLATE_RE = re.compile(r"\{\{([^{}]*)\}\}")
TAG_RE = re.compile(r"<[^>]+>")
HANJA_RE = re.compile(r"[㐀-䶿一-鿿]")


class ExtractError(RuntimeError):
    pass


def clean_line(raw: str) -> tuple[str, int, list[str]]:
    """위키텍스트 한 줄 → (본문, 결자수, 편집자주석들).

    순서가 중요하다: 주석을 먼저 떼야 주석 안의 글자가 본문 글자로 세어지지 않는다.
    """
    notes = [m.strip() for m in NOTE_RE.findall(raw) if m.strip()]
    text = NOTE_RE.sub("", raw)

    text = TAG_RE.sub("", text)

    missing = 0

    def _tpl(m: re.Match[str]) -> str:
        nonlocal missing
        body = m.group(1).strip()
        if body == "?":
            missing += 1
            return MISSING_MARK
        return ""  # 그 외 유지보수 템플릿은 버린다

    text = TEMPLATE_RE.sub(_tpl, text)
    text = text.replace("'''", "").replace("''", "")
    text = re.sub(r"\s+", "", text)  # 한문 본문에는 공백이 없다
    return text, missing, notes


def extract_gwanggaeto(source_id: str) -> list[dict]:
    raw_path = SOURCES_DIR / source_id / "raw.wikitext"
    if not raw_path.exists():
        raise ExtractError(f"원본이 없다: {raw_path}")

    wikitext = io.open(raw_path, encoding="utf-8").read()

    chunks: list[dict] = []
    face: int | None = None
    line_no = 0
    faces_seen: list[int] = []

    for raw_line in wikitext.splitlines():
        fm = FACE_RE.match(raw_line.strip())
        if fm:
            face = int(fm.group(1))
            faces_seen.append(face)
            line_no = 0
            continue

        if face is None:
            continue  # 면 헤더 앞의 머리말·유지보수 템플릿

        lm = LINE_RE.match(raw_line)
        if not lm:
            continue

        text, missing, notes = clean_line(lm.group(1))
        if not text:
            continue

        line_no += 1
        chunks.append(
            {
                "id": f"chunk_{source_id}_{face}-{line_no:02d}",
                "sourceId": f"src-{source_id}",
                "chunkType": "line",
                "face": face,
                "transcriptLine": line_no,
                "locator": f"전사본 {face}면 {line_no}번째 줄",
                "lang": "hanmun",
                "text": text,
                "charCount": len(text),
                "hanjaCount": len(HANJA_RE.findall(text)),
                "missingCount": missing,
                "editorNotes": notes,
                "translation": None,
                "translationSource": None,
            }
        )

    plausible(faces_seen, chunks)
    return chunks


def plausible(faces_seen: list[int], chunks: list[dict]) -> None:
    """순차성 검증 — 번호가 건너뛰면 파서가 무언가를 놓친 것이다."""
    if faces_seen != sorted(set(faces_seen)) or faces_seen != list(
        range(1, len(faces_seen) + 1)
    ):
        raise ExtractError(f"면 번호가 순차적이지 않다: {faces_seen}")

    by_face: dict[int, list[int]] = {}
    for c in chunks:
        by_face.setdefault(c["face"], []).append(c["transcriptLine"])
    for face, lines in by_face.items():
        if lines != list(range(1, len(lines) + 1)):
            raise ExtractError(f"{face}면의 줄 번호가 순차적이지 않다: {lines}")

    ids = [c["id"] for c in chunks]
    if len(ids) != len(set(ids)):
        raise ExtractError("chunk id가 중복됐다")


EXTRACTORS = {"gwanggaeto": extract_gwanggaeto}


def write_chunks(source_id: str, chunks: list[dict]) -> Path:
    out = SOURCES_DIR / source_id / "chunks.jsonl"
    with io.open(out, "w", encoding="utf-8", newline="\n") as fh:
        for c in chunks:
            fh.write(json.dumps(c, ensure_ascii=False, sort_keys=True) + "\n")
    return out


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--source", default="gwanggaeto")
    args = ap.parse_args(argv)

    extractor = EXTRACTORS.get(args.source)
    if extractor is None:
        print(f"추출기가 없다: {args.source} (있는 것: {sorted(EXTRACTORS)})")
        return 2

    chunks = extractor(args.source)
    out = write_chunks(args.source, chunks)

    faces: dict[int, int] = {}
    total_chars = 0
    total_hanja = 0
    total_missing = 0
    notes = 0
    for c in chunks:
        faces[c["face"]] = faces.get(c["face"], 0) + 1
        total_chars += c["charCount"]
        total_hanja += c["hanjaCount"]
        total_missing += c["missingCount"]
        notes += len(c["editorNotes"])

    print(f"source      : {args.source}")
    print(f"chunks      : {len(chunks)}")
    print(f"면별 줄 수  : {dict(sorted(faces.items()))}")
    print(f"전체 문자수 : {total_chars}  (구두점 포함)")
    print(f"한자        : {total_hanja}")
    print(f"결자 □      : {total_missing}")
    print(f"한자+결자   : {total_hanja + total_missing}   ← 통설 1,775자와 대조할 값")
    print(f"편집자 주석 : {notes}")
    print(f"출력        : {out.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
