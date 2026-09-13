"""Merge collected facts and write density, administration and coverage tables."""
import argparse
from collections import Counter, defaultdict
from copy import deepcopy
import json
import math
from pathlib import Path


def number(value, where, optional=False, integer=False):
    if value is None and optional:
        return
    if type(value) not in (int, float) or (type(value) is float and not math.isfinite(value)):
        raise ValueError(f'{where}: expected a finite number')
    if integer and type(value) is not int:
        raise ValueError(f'{where}: expected an integer')


def check_numbers(fact, where):
    for key in ('lon', 'lat'):
        number(fact.get(key), f'{where}.{key}', optional=True)
    for key in ('year', 'decade'):
        number(fact.get(key), f'{where}.{key}', integer=True)
    persistence = fact.get('persistence')
    if persistence is not None:
        number(persistence.get('from'), f'{where}.persistence.from', integer=True)
        number(persistence.get('to'), f'{where}.persistence.to', optional=True, integer=True)
    density = fact.get('density')
    if density is not None:
        for key in ('households', 'population'):
            if key in density:
                number(density[key], f'{where}.density.{key}')


def summarize(collection_root):
    facts, density, administrative = [], [], []
    categories, regions = defaultdict(Counter), defaultdict(Counter)
    for path in sorted(collection_root.glob('*/result.json')):
        result = json.loads(path.read_text(encoding='utf-8'))
        job = path.parent.name
        prefix = result.get('collection', collection_root.name).replace('periods-', 'period')
        ids = lambda values: ['claim-' + prefix + '-' + job + '-' + c.removeprefix('claim-') for c in values]
        for original in result.get('facts', []):
            fact = deepcopy(original)
            check_numbers(fact, f'{job}/{fact["id"]}')
            fact['job'] = job
            fact['claimIds'] = ids(fact['claimIds'])
            if fact.get('density') is not None:
                fact['density']['claimIds'] = ids(fact['density']['claimIds'])
            if fact.get('persistence') is not None and 'basisClaimIds' in fact['persistence']:
                fact['persistence']['basisClaimIds'] = ids(fact['persistence']['basisClaimIds'])
            facts.append(fact)
            categories[fact['category']][fact['decade']] += 1
            regions[fact['region']][fact['decade']] += 1
            if fact.get('density') is not None:
                counts = fact['density']
                density.append({**{key:fact.get(key) for key in ('placeLabel', 'lon', 'lat', 'year')},
                                **{key:counts.get(key) for key in ('households', 'population', 'unit', 'claimIds')},
                                'job':job})
            if fact['category'] == 'administration' and fact.get('persistence') is not None:
                administrative.append({**{key:fact.get(key) for key in ('placeLabel', 'lon', 'lat', 'what', 'claimIds')},
                                       **{key:fact['persistence'].get(key) for key in ('from', 'to', 'kind')}})
    table = lambda counts: {key:{str(decade):values[decade] for decade in sorted(values)}
                            for key, values in sorted(counts.items())}
    return {'facts-merged.json':facts, 'density.json':density, 'administrative.json':administrative,
            'coverage.json':{'categoryByDecade':table(categories), 'regionByDecade':table(regions)}}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('collection_root', type=Path)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    outputs = summarize(args.collection_root)
    args.out.mkdir(parents=True, exist_ok=True)
    for name, content in outputs.items():
        (args.out / name).write_text(json.dumps(content, ensure_ascii=False, indent=2, allow_nan=False) + '\n', encoding='utf-8')
    print(json.dumps({'jobs':len(list(args.collection_root.glob('*/result.json'))),
                      'facts':len(outputs['facts-merged.json']), 'density':len(outputs['density.json']),
                      'administrative':len(outputs['administrative.json'])}))


if __name__ == '__main__':
    main()
