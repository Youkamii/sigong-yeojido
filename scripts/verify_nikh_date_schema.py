"""Inspect date declarations in the DTD actually bundled with public NIKH XML."""
import argparse
import hashlib
import json
import re
from pathlib import Path
import zipfile


def inspect(path):
    rows = []
    with zipfile.ZipFile(path) as archive:
        for member in archive.namelist():
            if not member.lower().endswith('.dtd'):
                continue
            raw = archive.read(member)
            text = raw.decode('utf-8-sig')
            lines = text.splitlines()
            declarations = []
            for i, line in enumerate(lines):
                if re.match(r'<!ELEMENT dateOccured|<!ELEMENT dateInsert|<!ELEMENT dateModified', line):
                    declarations.append({'line': i + 1, 'text': '\n'.join(lines[i:i + 5])})
            rows.append({'zip': path.name, 'zipSha256': hashlib.sha256(path.read_bytes()).hexdigest(),
                         'member': member, 'bytes': len(raw), 'sha256': hashlib.sha256(raw).hexdigest(),
                         'header': next(line.strip() for line in lines if 'Last Updated' in line),
                         'declarations': declarations,
                         'formatComments': [{'line': i + 1, 'text': line.strip()} for i, line in enumerate(lines)
                                            if '입력형식' in line],
                         'literalCodeOccurrences': {code: len(re.findall(r'\b' + code + r'\b', text))
                                                    for code in ('L0', 'L1', 'LO', '99')}})
    if not rows:
        raise ValueError(f'No DTD in {path}')
    return rows


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('zips', type=Path, nargs='+')
    ap.add_argument('--out', type=Path, required=True)
    args = ap.parse_args()
    rows = [row for path in args.zips for row in inspect(path)]
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(rows, ensure_ascii=False))


if __name__ == '__main__':
    main()
