#!/usr/bin/env python3
"""추출기를 import하지 않고 XML의 id·기사 수와 실록 JSONL을 대조한다 (#15)."""
import argparse
import collections
import json
from pathlib import Path
import zipfile
from xml.etree import ElementTree as ET


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--bulk", type=Path, required=True)
    ap.add_argument("--sources-dir", type=Path, required=True)
    args = ap.parse_args()
    expected, counts = {}, collections.Counter()
    with zipfile.ZipFile(args.bulk) as z:
        for name in sorted(z.namelist()):
            if not name.endswith(".xml"):
                continue
            root = ET.fromstring(z.read(name))
            counts["xmlFiles"] += 1
            for el in root.iter():
                if not el.tag.startswith("level") or el.find("text") is None:
                    continue
                lid = el.get("id")
                if not lid:
                    raise ValueError(f"id 없는 본문: {name}")
                cid = f"chunk_sillok-{lid.split('_')[0]}_{lid}"
                if cid in expected:
                    raise ValueError(f"XML id 중복: {cid}")
                kind = "section" if any(k.tag.startswith("level") for k in el) else "article"
                expected[cid] = (int(el.tag[5:]), kind)
                counts[kind] += 1
    actual = collections.Counter()
    for path in sorted(args.sources_dir.glob("sillok-*/chunks.jsonl")):
        with path.open(encoding="utf-8") as fh:
            for line in fh:
                chunk = json.loads(line)
                want = expected.pop(chunk["id"])
                if want != (chunk["level"], chunk["chunkType"]):
                    raise ValueError(f"층·종류 불일치: {chunk['id']}")
                if chunk["sourceId"] != "src-" + path.parent.name:
                    raise ValueError(f"사료 분할 불일치: {chunk['id']}")
                actual[chunk["sourceId"]] += 1
    if expected:
        raise ValueError(f"빠진 본문 {len(expected)}개")
    print(json.dumps({"xml": dict(counts), "chunks": sum(actual.values()), "sources": dict(actual),
                      "missing": 0, "duplicates": 0}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
