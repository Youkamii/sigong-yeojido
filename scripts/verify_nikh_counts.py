#!/usr/bin/env python3
"""원본 XML을 독립 순회해 JSONL의 누락·날짜·종류와 실제 연도 범위를 대조한다 (#38)."""
import argparse
from collections import Counter
import json
from pathlib import Path
import re
import zipfile
from xml.etree import ElementTree as ET


def verify(bulk, directory, source):
    readers = {}
    reports = {}
    xml_count = 0

    def western_date(level):
        dates = level.findall('front/biblioData/date/dateOccured')
        for kind in ('서기', None):
            for date in dates:
                if date.get('type') == kind and date.get('date'):
                    return date.get('date')
        return None

    def check(level, inherited=None):
        own_date = western_date(level)
        context = (level.get('id'), own_date) if own_date else inherited
        children = [c for c in level if re.fullmatch(r'level\d+', c.tag)]
        kinds = []
        if source == 'bibyeonsa-deungnok' and level.tag == 'level1' and level.find('front') is not None:
            kinds.append('source-metadata')
        if level.find('text') is not None:
            kinds.append('section' if children else 'article')
        for kind in kinds:
            level_id = level.get('id')
            if not level_id:
                raise ValueError('id 없는 본문')
            name = f"sillok-{level_id.split('_')[0]}" if source == 'gosunjong-sillok' else source
            if name not in readers:
                readers[name] = (directory/name/'chunks.jsonl').open(encoding='utf-8')
                reports[name] = {'chunks': 0, 'types': Counter(), 'recordTypes': Counter(), 'years': Counter(),
                                 'dateInherited': 0, 'dated': 0, 'empty': 0, 'characters': 0,
                                 'annotations': 0, 'indexTerms': 0, 'examples': []}
            row = json.loads(next(readers[name]))
            expected_id = f'chunk_{name}_{level_id}'
            if kind == 'source-metadata':
                expected_id += '__front'
                if row.get('frontMatterXml') != ET.tostring(level.find('front'), encoding='unicode'):
                    raise ValueError(f'서지 원문 불일치: {expected_id}')
            if (row['id'], row['levelId'], row['sourceId'], row['level'], row['chunkType']) != (
                    expected_id, level_id, f'src-{name}', int(level.tag[5:]), kind):
                raise ValueError(f'누락·순서·종류 불일치: {expected_id}')
            raw = context[1] if context and kind != 'source-metadata' else None
            if (row.get('date') or {}).get('raw') != raw:
                raise ValueError(f'날짜 불일치: {expected_id}')
            parent_id = inherited[0] if inherited and not own_date and kind != 'source-metadata' else None
            if row.get('dateInheritedFrom') != parent_id:
                raise ValueError(f'날짜 상속 불일치: {expected_id}')
            stats = reports[name]
            stats['chunks'] += 1
            stats['types'][kind] += 1
            stats['recordTypes'][level.get('type') or '(none)'] += 1
            stats['empty'] += not row['text']
            stats['characters'] += len(row['text'])
            stats['dated'] += raw is not None
            stats['dateInherited'] += parent_id is not None
            stats['annotations'] += len(row['annotations'])
            stats['indexTerms'] += len(row['indexTerms'])
            if raw and (match := re.match(r'^(-?\d{3,4})(?:-|$)', raw)):
                year = int(match[1])
                if year not in (0, 9999):
                    stats['years'][year] += 1
            if len(stats['examples']) < 3 and row['text'] and kind == 'article':
                stats['examples'].append({'id': row['id'], 'date': row['date'],
                                         'dateInheritedFrom': parent_id, 'quote': row['text'][:120]})
        for child in children:
            check(child, context)

    def root_walk(node):
        if re.fullmatch(r'level\d+', node.tag):
            check(node)
        else:
            for child in node:
                root_walk(child)

    try:
        with zipfile.ZipFile(bulk) as archive:
            for name in sorted(archive.namelist()):
                if name.lower().endswith('.xml'):
                    root_walk(ET.fromstring(archive.read(name)))
                    xml_count += 1
                else:
                    archive.read(name)  # DTD도 CRC 대조
        for name, reader in readers.items():
            if next(reader, None) is not None:
                raise ValueError(f'XML에 없는 추가 chunk: {name}')
    finally:
        for reader in readers.values():
            reader.close()
    for stats in reports.values():
        years = sorted(stats['years'])
        stats['yearRange'] = [years[0], years[-1]] if years else None
        stats['yearsMissingInsideRange'] = [y for y in range(years[0], years[-1]+1) if y not in years] if years else []
    return {'xmlFiles': xml_count, 'sources': reports, 'missing': 0, 'extra': 0,
            'dateMismatches': 0, 'crc': 'all entries read successfully'}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--bulk', type=Path, required=True)
    parser.add_argument('--sources-dir', type=Path, required=True)
    parser.add_argument('--source', required=True)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    report = verify(args.bulk, args.sources_dir, args.source)
    args.out.write_text(json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True)+'\n', encoding='utf-8')
    print(json.dumps({'xml': report['xmlFiles'], 'chunks': sum(s['chunks'] for s in report['sources'].values()),
                      'sources': len(report['sources']), 'missing': report['missing']}))
