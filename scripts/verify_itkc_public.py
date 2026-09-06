"""Compare every ITKC article character and ID without importing its extractor."""
import argparse
import json
from pathlib import Path
import re
import zipfile
from xml.etree import ElementTree as ET


def original_letters(element):
    if element.tag in ('원주', '페이지'): return ''
    if element.tag == 'imghj': return '〓'
    return (element.text or '')+''.join(original_letters(c)+(c.tail or '') for c in element)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--bulk', type=Path, required=True)
    ap.add_argument('--chunks', type=Path, required=True)
    ap.add_argument('--out', type=Path, required=True)
    args = ap.parse_args()
    expected = {}
    with zipfile.ZipFile(args.bulk) as z:
        for name in z.namelist():
            if not name.endswith('.xml'): continue
            for level in ET.fromstring(z.read(name)).iter():
                body = level.find('본문정보/내용')
                if body is not None:
                    assert level.get('id') not in expected
                    expected[level.get('id')] = re.sub(r'[ \t\r\n\f\v]', '', original_letters(body))
    count = 0
    for line in args.chunks.read_text(encoding='utf-8').splitlines():
        row = json.loads(line)
        assert re.sub(r'[ \t\r\n\f\v]', '', row['text']) == expected.pop(row['levelId']), row['id']
        count += 1
    assert not expected
    result = {'checkedRecords': count, 'missing': 0, 'duplicateIds': 0, 'characterMismatches': 0,
              'comparison': 'ASCII layout whitespace ignored; authored notes and page markers separated; unknown glyph slot retained'}
    args.out.write_text(json.dumps(result, indent=2)+'\n', encoding='utf-8')
    print(json.dumps(result))


if __name__ == '__main__': main()
