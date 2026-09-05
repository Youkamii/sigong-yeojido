#!/usr/bin/env python3
"""국편(국사편찬위원회) 벌크 XML → chunk JSONL 추출기. 표준 라이브러리만 쓴다.

표준 배치: services/ingestion/extract_nikh_xml.py
실행:      python3 services/ingestion/extract_nikh_xml.py --source samguksagi

입력은 공공데이터포털 벌크 zip(data/bulk/{dataset}.zip, scripts/fetch_datago_bulk.py 로 받는다).
zip 안의 XML 계층은 item > level1(권) > level2(편) > level3(기사) 이고, 기사 안에
paragraph · dateOccured · index · annotation · subjectClass 가 들어 있다
(docs/research/bulk-xml-findings.md 참고).

설계 (docs/02-schema.md §6):
  - chunk 단위 = level3 기사. id = chunk_{source}_{level3 id}. level3 id 가 곧 국편 웹 퍼머링크
    (https://db.history.go.kr/id/{levelId}) 라서 chunk 마다 공개 근거 링크가 붙는다.
  - 원문(text)은 이 JSONL 에만 산다. 인라인 태그(index 등)는 벗기되 글자는 보존한다.
  - annotation(교감주·원주)은 본문에서 떼어 annotations 로 뺀다 — 국편의 판단(교감)과 원문을 섞지 않는다.
    떼어낸 자리는 offset(본문 문자 위치)으로 남겨 Claim 층에서 다시 찾을 수 있게 한다.
  - 색인어(index)·주제분류(subjectClass)·날짜(dateOccured)도 국편의 판단이므로 그대로 옮기되 별도 필드에 둔다.
  - 결정론: 파일명 순 → 문서 순. json.dumps(sort_keys=True). 두 번 돌리면 바이트가 같아야 한다.

산출물 (data/sources/{source}/):
  chunks.jsonl        기사 하나가 한 줄
  annotations.jsonl   교감주·원주 하나가 한 줄 (chunkId 포함)   ← Claim 층 재료
  index-terms.jsonl   색인어 하나가 한 줄 (chunkId, type, text)  ← Entity 층 재료

정직성 장치:
  - 국편 교차링크(reference/link)·판본 이미지(illustration/image)는 원문이 아니므로 버린다.
  - 유니코드에 없는 글자(newChar)는 〓 로 자리를 지키고 국편 코드(KC…)를 newChars 에 남긴다.
  - 공백 처리는 국편 웹 표시와 같게 한다 — 연속 공백(태그 사이 줄바꿈·들여쓰기 포함)은 공백 하나로.
  - level2 가 level3 없이 본문을 직접 갖는 절(宣撰·目錄·年表·跋文)은 chunk 로 만들지 않고 건수만 보고한다.
"""
from __future__ import annotations

import argparse
import collections
import hashlib
import io
import json
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[2]
BULK_DIR = ROOT / "data" / "bulk"
SOURCES_DIR = ROOT / "data" / "sources"

PERMALINK = "https://db.history.go.kr/id/{level_id}"
NEWCHAR_MARK = "〓"  # 〓 — 유니코드에 없는 글자의 자리표시
COLLAPSIBLE_WS = " \t\r\n\f\v"  # ASCII 공백만 접는다. 전각 공백(U+3000)은 글자로 본다

# 검증한 데이터셋만 등록한다. 다른 국편 데이터셋은 --dataset 으로 직접 지정할 수 있다 (같은 DTD).
SOURCES: dict[str, dict] = {
    "samguksagi": {"dataset": "15053635", "label": "삼국사기"},
    "samgukyusa": {"dataset": "15053634", "label": "삼국유사"},   # 2026-09-05 검증: 153 조목, 王曆 은 표
    "goryeosa": {"dataset": "15053637", "label": "고려사"},       # 2026-09-05 검증: 5,389 기사 + 73 절
}

# 본문에서 통째로 버리는 요소 — 원문이 아니라 국편의 편집 장치다
DROP_TAGS = {"reference", "link", "illustration", "image", "caption"}
# 태그만 벗기고 글자는 살리는 요소 (index 는 색인어로도 기록한다)
INLINE_TAGS = {"index", "paragraph", "noteContent", "noteTitle", "td"}
# 표 — 행(tr)마다 줄바꿈, 셀(td) 사이는 공백. 열 구조는 원본 XML 로 돌아가야 한다 (삼국유사 王曆, 고려사 表)
TABLE_BLOCK_TAGS = {"tableGroup", "table", "tr", "ul", "li"}   # 목록(ul/li)도 항목마다 줄바꿈 (삼국사기 目錄)


def is_hanja(ch: str) -> bool:
    o = ord(ch)
    return (
        0x4E00 <= o <= 0x9FFF  # CJK 통합 한자
        or 0x3400 <= o <= 0x4DBF  # 확장 A
        or 0xF900 <= o <= 0xFAFF  # 호환 한자
        or 0x20000 <= o <= 0x3134F  # 확장 B~G
    )


class ExtractError(RuntimeError):
    pass


class TextBuilder:
    """혼합 내용을 문자열로 모으면서 공백을 국편 웹 표시 규칙대로 접는다.

    - ASCII 공백 연속(줄바꿈·들여쓰기 포함)은 공백 하나. 줄 머리·꼬리 공백은 없앤다
    - <br/> 와 paragraph 경계는 줄바꿈 하나. 빈 줄은 만들지 않는다
    - offset() 은 지금까지 만든 문자열 길이 = 다음 글자가 놓일 자리
    """

    def __init__(self) -> None:
        self.parts: list[str] = []
        self.n = 0
        self.pending_space = False
        self.swallow_leading = False

    def text(self, s: str | None) -> None:
        if not s:
            return
        for ch in s:
            if ch in COLLAPSIBLE_WS:
                if not self.swallow_leading:
                    self.pending_space = True
                continue
            self.swallow_leading = False
            if self.pending_space and self.n and self.parts[-1] != "\n":
                self.parts.append(" ")
                self.n += 1
            self.pending_space = False
            self.parts.append(ch)
            self.n += 1

    def detach(self) -> None:
        """본문에서 빠지는 요소(주석·교차링크·이미지) 앞에 붙은 공백은 그 요소의 것이다 — 같이 버린다.
        국편 XML 은 요소 사이 줄바꿈·들여쓰기를 넣어 두므로, 안 버리면 '珍支村 , 四曰' 처럼 공백이 남는다."""
        self.pending_space = False

    def newline(self) -> None:
        if self.n and self.parts[-1] == " ":
            self.parts.pop()
            self.n -= 1
        if self.n and self.parts[-1] != "\n":
            self.parts.append("\n")
            self.n += 1
        self.pending_space = False

    def offset(self) -> int:
        return self.n

    def result(self) -> str:
        while self.parts and self.parts[-1] in (" ", "\n"):
            self.parts.pop()
        self.n = len(self.parts)
        return "".join(self.parts)


class Article:
    """level3 하나를 읽는 동안의 수집함."""

    def __init__(self) -> None:
        self.annotations: list[dict] = []
        self.index_terms: list[dict] = []
        self.new_chars: list[dict] = []
        self.unknown_tags: collections.Counter = collections.Counter()

    def render(self, el: ET.Element, tb: TextBuilder, parent_seq: int | None) -> None:
        """el 의 자식(요소·텍스트)을 tb 에 흘려 넣는다. el 자신의 태그는 호출자가 처리한다."""
        tb.text(el.text)
        for child in el:
            self.render_element(child, tb, parent_seq)
            tb.text(child.tail)

    def render_element(self, el: ET.Element, tb: TextBuilder, parent_seq: int | None) -> None:
        tag = el.tag
        if tag == "annotation":
            tb.detach()
            self.take_annotation(el, tb, parent_seq)
        elif tag == "br":
            tb.newline()
        elif tag == "newChar":
            tb.detach()
            self.new_chars.append(
                {"code": el.get("href"), "offset": tb.offset(), "parentSeq": parent_seq}
            )
            tb.text(NEWCHAR_MARK)
            tb.swallow_leading = True  # 글자 하나의 자리표시다. 앞뒤 줄바꿈은 국편 XML 의 들여쓰기
        elif tag in DROP_TAGS:
            tb.detach()
            tb.swallow_leading = True
        elif tag == "index":
            self.index_terms.append({"type": el.get("type"), "text": term_text(el)})
            self.render(el, tb, parent_seq)
        elif tag in TABLE_BLOCK_TAGS:
            tb.newline()
            self.render(el, tb, parent_seq)
            tb.newline()
        elif tag == "td":
            self.render(el, tb, parent_seq)
            tb.text(" ")
        else:
            if tag not in INLINE_TAGS:
                self.unknown_tags[tag] += 1
            self.render(el, tb, parent_seq)

    def take_annotation(self, el: ET.Element, tb: TextBuilder, parent_seq: int | None) -> None:
        seq = len(self.annotations) + 1
        rec = {
            "seq": seq,
            "id": el.get("id"),
            "type": el.get("type"),
            "offset": tb.offset(),
            "parentSeq": parent_seq,
            "text": None,
        }
        self.annotations.append(rec)  # 문서 순(전위 순회)으로 seq 를 준다
        note = TextBuilder()
        note.text(el.text)
        for nc in el:
            if nc.tag == "noteContent":
                self.render(nc, note, seq)
            else:
                self.render_element(nc, note, seq)
            note.text(nc.tail)
        rec["text"] = note.result()


def term_text(el: ET.Element) -> str:
    """색인어 표기 — 안에 박힌 교감주는 빼고, 글자만."""
    tb = TextBuilder()

    def walk(e: ET.Element) -> None:
        tb.text(e.text)
        for c in e:
            if c.tag == "annotation" or c.tag in DROP_TAGS:
                tb.detach()
                tb.swallow_leading = c.tag != "annotation"
            elif c.tag == "newChar":
                tb.detach()
                tb.text(NEWCHAR_MARK)
                tb.swallow_leading = True
            elif c.tag == "br":
                tb.newline()
            else:
                walk(c)
            tb.text(c.tail)

    walk(el)
    return tb.result()


def plain(el: ET.Element | None) -> str:
    """제목 같은 짧은 요소의 글자만 (공백 접기 포함)."""
    if el is None:
        return ""
    tb = TextBuilder()
    tb.text("".join(el.itertext()))
    return tb.result()


def level_title(level: ET.Element) -> str:
    return plain(level.find("front/biblioData/title/mainTitle"))


def level1_label(level1: ET.Element) -> str:
    main = level_title(level1)
    series = plain(level1.find("front/biblioData/title/seriesTitle"))
    return " ".join(p for p in (series, main) if p)


def extract_article(
    level3: ET.Element, source: str, l1_label: str, l2_label: str, chunk_type: str = "article"
) -> tuple[dict, Article]:
    """level3 기사(article) 또는 level3 없이 본문을 직접 갖는 level2 절(section)을 chunk 하나로."""
    level_id = level3.get("id")
    if not level_id:
        raise ExtractError(f"id 없는 {level3.tag}")

    art = Article()
    tb = TextBuilder()
    content = level3.find("text/content")
    if content is not None:
        for para in content:
            if para.tag == "paragraph":
                art.render(para, tb, None)
            else:
                art.render_element(para, tb, None)
            tb.newline()
    text = tb.result()

    if "<" in text or ">" in text:
        raise ExtractError(f"{level_id}: 태그 잔재")

    title = level_title(level3)
    date_el = level3.find("front/biblioData/date/dateOccured")
    date = None
    if date_el is not None:
        date = {"raw": date_el.get("date"), "label": plain(date_el) or None}

    subjects = [plain(s) for s in level3.findall("front/biblioData/subjectClass")]
    subjects = [s for s in subjects if s]

    chunk = {
        "id": f"chunk_{source}_{level_id}",
        "sourceId": f"src-{source}",
        "chunkType": chunk_type,
        "levelId": level_id,
        "permalink": PERMALINK.format(level_id=level_id),
        "locator": " › ".join(p for p in (l1_label, l2_label, title) if p),
        "title": title,
        "lang": "hanmun",
        "text": text,
        "date": date,
        "subjectClasses": subjects,
        "indexTerms": [dict(t) for t in art.index_terms],
        "annotations": [dict(a) for a in art.annotations],
        "newChars": [dict(n) for n in art.new_chars],
        "charCount": len(text),
        "hanjaCount": sum(1 for ch in text if is_hanja(ch)),
        "translation": None,
        "translationSource": None,
    }
    return chunk, art


def extract(source: str, zpath: Path) -> tuple[list[dict], dict]:
    if not zpath.exists():
        raise ExtractError(f"벌크가 없다: {zpath}  (먼저 scripts/fetch_datago_bulk.py 실행)")

    chunks: list[dict] = []
    stats: collections.Counter = collections.Counter()
    unknown: collections.Counter = collections.Counter()
    ann_types: collections.Counter = collections.Counter()
    idx_types: collections.Counter = collections.Counter()

    with zipfile.ZipFile(zpath) as z:
        names = sorted(n for n in z.namelist() if n.lower().endswith(".xml"))
        for name in names:
            root = ET.fromstring(z.read(name))
            stats["xmlFiles"] += 1
            for level1 in root.iter("level1"):
                stats["level1"] += 1
                l1_label = level1_label(level1)
                for level2 in level1.findall("level2"):
                    stats["level2"] += 1
                    l2_label = level_title(level2)
                    def take(chunk: dict, art: Article, key: str) -> None:
                        chunks.append(chunk)
                        unknown.update(art.unknown_tags)
                        for a in art.annotations:
                            ann_types[a["type"]] += 1
                        for t in art.index_terms:
                            idx_types[t["type"]] += 1
                        stats[key] += 1
                        stats["dated"] += 1 if chunk["date"] else 0
                        stats["newChars"] += len(chunk["newChars"])

                    if level2.find("text") is not None:
                        # 宣撰·目錄·年表·跋文·志의 총론 — level3 없이 본문을 직접 갖는 절.
                        # 2026-09-05 결정: chunkType=section 으로 chunk 화한다 (여기 붙은 주석·색인어를 버리지 않기 위해).
                        # 같은 level2 에 level3 가 함께 있으면 절 chunk 가 먼저 온다.
                        if level2.get("id"):
                            chunk, art = extract_article(level2, source, l1_label, "", "section")
                            take(chunk, art, "level2Section")
                        else:
                            stats["level2DirectNoId"] += 1
                    for level3 in level2.findall("level3"):
                        chunk, art = extract_article(level3, source, l1_label, l2_label)
                        take(chunk, art, "level3")

    ids = [c["id"] for c in chunks]
    if len(ids) != len(set(ids)):
        dupes = [i for i, n in collections.Counter(ids).items() if n > 1]
        raise ExtractError(f"chunk id 중복: {dupes[:5]}")
    if not chunks:
        raise ExtractError("level3 기사가 하나도 없다 — 계층이 다른 데이터셋인가?")

    summary = {
        "stats": dict(stats),
        "annotationTypes": dict(ann_types),
        "indexTypes": dict(idx_types),
        "unknownTags": dict(unknown),
    }
    return chunks, summary


def dump_jsonl(path: Path, rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with io.open(path, "w", encoding="utf-8", newline="\n") as fh:
        for r in rows:
            fh.write(json.dumps(r, ensure_ascii=False, sort_keys=True) + "\n")


def write_outputs(source: str, chunks: list[dict]) -> dict[str, Path]:
    out_dir = SOURCES_DIR / source
    ann_rows = [
        {"chunkId": c["id"], **a} for c in chunks for a in c["annotations"]
    ]
    idx_rows = [
        {"chunkId": c["id"], "type": t["type"], "text": t["text"]}
        for c in chunks
        for t in c["indexTerms"]
    ]
    paths = {
        "chunks": out_dir / "chunks.jsonl",
        "annotations": out_dir / "annotations.jsonl",
        "indexTerms": out_dir / "index-terms.jsonl",
    }
    dump_jsonl(paths["chunks"], chunks)
    dump_jsonl(paths["annotations"], ann_rows)
    dump_jsonl(paths["indexTerms"], idx_rows)
    return paths


def sha256_of(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n", 1)[0])
    ap.add_argument("--source", default="samguksagi", help=f"등록된 것: {sorted(SOURCES)}")
    ap.add_argument("--dataset", help="공공데이터포털 데이터셋 번호 (등록되지 않은 source 에 필요)")
    ap.add_argument("--bulk", help="zip 경로 직접 지정 (기본 data/bulk/{dataset}.zip)")
    a = ap.parse_args(argv)

    dataset = a.dataset or SOURCES.get(a.source, {}).get("dataset")
    if not dataset and not a.bulk:
        print(f"source '{a.source}' 는 등록돼 있지 않다. --dataset 또는 --bulk 를 줘라 (등록: {sorted(SOURCES)})")
        return 2
    zpath = Path(a.bulk) if a.bulk else BULK_DIR / f"{dataset}.zip"

    try:
        chunks, summary = extract(a.source, zpath)
    except ExtractError as e:
        print(f"추출 실패: {e}")
        return 1
    paths = write_outputs(a.source, chunks)

    st = summary["stats"]
    ann_total = sum(summary["annotationTypes"].values())
    idx_total = sum(summary["indexTypes"].values())
    print(f"source        : {a.source}  (dataset {dataset or '-'}, {zpath.name})")
    print(f"xml files     : {st.get('xmlFiles', 0)}   level1 {st.get('level1', 0)}  level2 {st.get('level2', 0)}  level3 {st.get('level3', 0)}")
    print(f"chunks        : {len(chunks)}")
    print(f"dated chunks  : {st.get('dated', 0)}")
    print(f"annotations   : {ann_total}  {summary['annotationTypes']}")
    print(f"index terms   : {idx_total}  {summary['indexTypes']}")
    print(f"newChar marks : {st.get('newChars', 0)}")
    print(
        f"level2 section: {st.get('level2Section', 0)} chunked as chunkType=section"
        + (f"  (id 없어 건너뜀 {st['level2DirectNoId']})" if st.get('level2DirectNoId') else "")
    )
    if summary["unknownTags"]:
        print(f"UNKNOWN TAGS  : {summary['unknownTags']}  <- check before trusting text")
    for k, p in paths.items():
        print(f"{k:<14}: {p.relative_to(ROOT).as_posix()}  sha256 {sha256_of(p)[:16]}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
