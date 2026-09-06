#!/usr/bin/env python3
"""승정원일기 결락·개수자 표시를 본문과 연결된 별도 JSONL에 보존한다 (#38)."""
import argparse
from collections import Counter
from copy import copy
import hashlib
import json
from pathlib import Path
import re
from xml.etree import ElementTree as ET
import zipfile


def extract(bulk, output):
    counts = Counter()
    empty = Counter()
    attributes = Counter()
    with zipfile.ZipFile(bulk) as archive, output.open('w', encoding='utf-8', newline='\n') as handle:
        for filename in sorted(archive.namelist()):
            if not filename.endswith('.xml'):
                continue
            root = ET.fromstring(archive.read(filename))
            for level in root.iter():
                if not re.fullmatch(r'level\d+', level.tag):
                    continue
                content = level.find('text/content')
                if content is None:
                    continue
                ordinal = 0

                def visit(node, in_annotation=False):
                    nonlocal ordinal
                    in_annotation = in_annotation or node.tag == 'annotation'
                    if node.tag in ('missing', 'name'):
                        ordinal += 1
                        snippet = copy(node)
                        snippet.tail = None
                        text = ''.join(node.itertext())
                        row = {'chunkId': f"chunk_seungjeongwon-ilgi_{level.get('id')}",
                               'levelId': level.get('id'), 'xmlFile': filename, 'ordinal': ordinal,
                               'inAnnotation': in_annotation, 'tag': node.tag, 'attributes': dict(node.attrib),
                               'text': text, 'xml': ET.tostring(snippet, encoding='unicode')}
                        handle.write(json.dumps(row, ensure_ascii=False, sort_keys=True)+'\n')
                        counts[node.tag] += 1
                        empty[node.tag] += not text.strip()
                        attributes.update(f'{node.tag}.{k}={v}' for k, v in node.attrib.items())
                    for child in node:
                        visit(child, in_annotation)

                visit(content)
    with output.open('rb') as handle:
        sha = hashlib.file_digest(handle, 'sha256').hexdigest()
    return {'counts': dict(counts), 'emptyText': dict(empty), 'attributes': dict(attributes),
            'bytes': output.stat().st_size, 'sha256': sha,
            'positionMeaning': 'ordinal counts missing/name elements in the chunk XML; it is not a plain-text character offset'}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--bulk', type=Path, required=True)
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--report', type=Path, required=True)
    args = parser.parse_args()
    args.out.parent.mkdir(parents=True, exist_ok=True)
    result = extract(args.bulk, args.out)
    args.report.write_text(json.dumps(result, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(json.dumps(result, ensure_ascii=False))
