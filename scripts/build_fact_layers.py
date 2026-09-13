"""Build display density and administrative layers from collected fact summaries."""
import argparse
import json
from pathlib import Path

from summarize_facts import number


def normalize(row, kind, summary=False):
    time_key = 'year' if kind == 'density' else 'from'
    for key in ('lon', 'lat'):
        number(row.get(key), f'{kind}.{key}')
    number(row.get(time_key), f'{kind}.{time_key}', integer=True)
    if kind == 'density':
        for key in ('households', 'population'):
            number(row.get(key), f'{kind}.{key}', optional=True)
        keys = ('lon', 'lat', 'year', 'households', 'population', 'unit', 'claimIds')
    else:
        number(row.get('to'), 'administrative.to', optional=True, integer=True)
        keys = ('lon', 'lat', 'from', 'to', 'kind', 'what', 'claimIds')
    return {**{key: row.get(key) for key in keys},
            'label': row['placeLabel' if summary else 'label']}


def build_layers(summary, existing=None):
    existing = existing or {}
    result = {'version': 1,
              'generatedFrom': list(dict.fromkeys([*existing.get('generatedFrom', []), summary.resolve().parent.name]))}
    skipped = {}
    for kind, time_key in (('density', 'year'), ('administrative', 'from')):
        rows = {}
        for row in existing.get(kind, []):
            item = normalize(row, kind)
            rows[(item['label'], item[time_key])] = item
        skipped[kind] = 0
        for row in json.loads((summary / f'{kind}.json').read_text(encoding='utf-8')):
            if row.get('lon') is None or row.get('lat') is None:
                skipped[kind] += 1
                continue
            item = normalize(row, kind, summary=True)
            rows[(item['label'], item[time_key])] = item
        result[kind] = list(rows.values())
    return result, skipped


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--summary', type=Path, required=True)
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--merge', action='store_true')
    args = parser.parse_args()
    existing = json.loads(args.out.read_text(encoding='utf-8')) if args.merge and args.out.exists() else None
    result, skipped = build_layers(args.summary, existing)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(result, ensure_ascii=False, indent=2, allow_nan=False) + '\n', encoding='utf-8')
    print(json.dumps({'density': len(result['density']), 'administrative': len(result['administrative']),
                      'excludedMissingCoordinates': skipped}))


if __name__ == '__main__':
    main()
