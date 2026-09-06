"""Count the explicit year/time objects in claims; do not date claims from source coverage."""
import argparse
from collections import Counter
import json
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'services'))
from graph_query import NS, query_rows

BANDS = [('기원전', None, -1), ('1~699', 1, 699), ('700~934', 700, 934),
         ('935~1391', 935, 1391), ('1392~1875', 1392, 1875),
         ('1876~1944', 1876, 1944), ('1945 이후', 1945, None)]


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--query', default='http://127.0.0.1:3030/sigong/query')
    ap.add_argument('--out', type=Path, required=True); args = ap.parse_args()
    rows = query_rows('''SELECT ?claim ?predicate ?source ?year ?time ?timeYear ?earliest ?latest WHERE {
        ?claim a syj:Claim; syj:predicate ?predicate; syj:fromSource ?source.
        OPTIONAL {?claim syj:objectYear ?year}
        OPTIONAL {?claim syj:objectTime ?time.
                  OPTIONAL {?time syj:year ?timeYear}
                  OPTIONAL {?time syj:earliest ?earliest} OPTIONAL {?time syj:latest ?latest}}
    } ORDER BY ?claim''', args.query)
    assert len({row['claim'] for row in rows}) == len(rows)
    predicates, source_counts = Counter(), Counter()
    bands = {label: [] for label, _, _ in BANDS}
    bounded, unbounded, without_time = [], [], []
    for row in rows:
        cid = row['claim'].removeprefix(NS)
        predicates[row['predicate'].removeprefix(NS)] += 1
        source_counts[row['source'].removeprefix(NS)] += 1
        if 'year' in row:
            lo = hi = int(row['year'])
        elif 'time' in row:
            known_year = int(row['timeYear']) if 'timeYear' in row else None
            lo = int(row['earliest']) if 'earliest' in row else known_year
            hi = int(row['latest']) if 'latest' in row else known_year
        else:
            without_time.append(cid); continue
        if lo is None or hi is None or lo == 0 or hi == 0:
            unbounded.append(cid); continue
        assert lo <= hi, row
        bounded.append({'claim': cid, 'source': row['source'].removeprefix(NS), 'earliest': lo, 'latest': hi})
        for label, start, end in BANDS:
            if (start is None or hi >= start) and (end is None or lo <= end): bands[label].append(cid)
    assert len(bounded) + len(unbounded) + len(without_time) == len(rows)
    boundary_records = predicates['hasBoundaryRecord']
    report = {'query': args.query, 'claims': len(rows), 'boundaryRecordClaims': boundary_records,
        'otherClaims': len(rows) - boundary_records, 'sourcesWithClaims': len(source_counts),
        'byPredicate': dict(sorted(predicates.items())), 'bySource': dict(sorted(source_counts.items())),
        'boundedYearOrTimeObjects': len(bounded), 'unboundedYearOrTimeObjects': len(unbounded),
        'withoutYearOrTimeObject': len(without_time), 'boundedClaims': bounded,
        'unboundedClaims': unbounded, 'bands': {label: {'claims': len(ids), 'ids': ids} for label, ids in bands.items()},
        'limits': ['연대 목적어가 있는 주장을 집계한다. 인물·사건의 전수 수집 수가 아니다.',
                   '여러 구간을 걸친 범위는 각 구간에 중복 집계한다. 구간 합계를 전체 주장 수로 쓰지 않는다.',
                   '사료의 대상 기간·편찬 연도나 지도 원 레코드의 기간을 다른 주장의 시각으로 추정하지 않는다.',
                   '원표기만 있고 정규화 연도가 없는 시간 주장은 별도로 센다.']}
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({key: report[key] for key in ('claims', 'boundaryRecordClaims', 'otherClaims',
        'sourcesWithClaims', 'boundedYearOrTimeObjects', 'unboundedYearOrTimeObjects', 'withoutYearOrTimeObject')}, ensure_ascii=False))
    print(json.dumps({label: len(ids) for label, ids in bands.items()}, ensure_ascii=False))


if __name__ == '__main__':
    main()
