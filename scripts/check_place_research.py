#!/usr/bin/env python3
"""Check researched place coverage, verbatim evidence and live Wikidata points (#18)."""
import argparse
from datetime import datetime, timezone
import json
import math
from pathlib import Path
import re
from urllib.parse import urlparse
from urllib.error import URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
WIKIDATA = re.compile(r'https://(?:www\.)?wikidata\.org/wiki/(Q[1-9][0-9]*)/?$')


def years(record):
    start, end = record.get('validFrom'), record.get('validTo')
    return (all(value is None or type(value) is int for value in (start, end))
            and (start is None or end is None or start <= end))


def web_url(value):
    parsed = urlparse(value) if isinstance(value, str) else None
    return bool(parsed and parsed.scheme in {'https', 'http'} and parsed.netloc)


def check_document(document, index, chunks):
    errors = []
    expected = {term['text']: term for term in index['terms']}
    seen = set()
    ids = set()
    source_id = 'src-' + index['source']
    for place in document.get('places', []):
        label = place.get('label')
        prefix = f'{label}: '
        term = expected.get(label)
        if term is None or label in seen:
            errors.append(prefix + 'unexpected or duplicate label')
            continue
        seen.add(label)
        expected_id = f"place-{index['source']}-{term['rank']:03}"
        if place.get('id') != expected_id or place.get('id') in ids:
            errors.append(prefix + 'incorrect or duplicate id')
        ids.add(place.get('id'))
        if (place.get('count') != term['count'] or place.get('indexType') != '지명'
                or place.get('sourceId') != source_id):
            errors.append(prefix + 'source or index count mismatch')
        if not years(place):
            errors.append(prefix + 'invalid place period')
        if not place.get('labelKo') or not place.get('note'):
            errors.append(prefix + 'missing name or research note')
        if place.get('status') not in {'established', 'majority', 'disputed', 'unlocated'}:
            errors.append(prefix + 'invalid status')
        if place.get('confidence') not in {'confirmed', 'probable', 'unverified'}:
            errors.append(prefix + 'invalid confidence')
        evidence = place.get('evidence', [])
        if not evidence:
            errors.append(prefix + 'missing source evidence')
        for item in evidence:
            chunk = chunks.get(item.get('chunkId'))
            if (not chunk or chunk.get('sourceId') != source_id or not item.get('quote')
                    or item['quote'] not in chunk.get('text', '')):
                errors.append(prefix + 'evidence is not verbatim in the cited source chunk')
            if not any(item.get('chunkId') == sample['chunkId'] for sample in term['samples']):
                errors.append(prefix + 'evidence is outside the assigned source chunks')
            if chunk and ('quoteStart' in item or 'quoteEnd' in item):
                start, end = item.get('quoteStart'), item.get('quoteEnd')
                if (type(start) is not int or type(end) is not int or not 0 <= start < end
                        or chunk.get('text', '')[start:end] != item.get('quote')):
                    errors.append(prefix + 'evidence offsets do not match the original text')
        candidates = place.get('candidates', [])
        if bool(candidates) == (place.get('status') == 'unlocated'):
            errors.append(prefix + 'unlocated status must have no candidates')
        for number, candidate in enumerate(candidates, 1):
            cprefix = prefix + f'candidate {number}: '
            for key, limit in [('lat', 90), ('lon', 180)]:
                value = candidate.get(key)
                if type(value) not in (float, int) or not math.isfinite(value) or abs(value) > limit:
                    errors.append(cprefix + f'invalid {key}')
            if not years(candidate):
                errors.append(cprefix + 'invalid period')
            if not web_url(candidate.get('sourceUrl')) or not candidate.get('basis') or not candidate.get('view'):
                errors.append(cprefix + 'missing historical location basis')
            if not WIKIDATA.fullmatch(candidate.get('coordSourceUrl', '')):
                errors.append(cprefix + 'missing Wikidata entity URL')
            if candidate.get('precision') not in {'site', 'approx', 'region'}:
                errors.append(cprefix + 'invalid precision')
            if candidate.get('confidence') not in {'confirmed', 'probable', 'unverified'}:
                errors.append(cprefix + 'invalid confidence')
    for label in expected.keys() - seen:
        errors.append(f'{label}: missing assigned label')
    return errors


def earth_points(entity):
    points = []
    for statement in entity.get('claims', {}).get('P625', []):
        if statement.get('rank') == 'deprecated':
            continue
        value = statement.get('mainsnak', {}).get('datavalue', {}).get('value', {})
        if value.get('globe') == 'http://www.wikidata.org/entity/Q2':
            points.append({'lat': value['latitude'], 'lon': value['longitude'],
                           'precision': value.get('precision'), 'rank': statement.get('rank')})
    return points


def matches_point(candidate, points):
    return any(abs(candidate['lat'] - point['lat']) <= 0.000001
               and abs(candidate['lon'] - point['lon']) <= 0.000001 for point in points)


def check_wikidata(documents, cache_dir):
    entities = {}
    observations = []
    errors = []
    for document in documents:
        for place in document['places']:
            for candidate in place.get('candidates', []):
                qid = WIKIDATA.fullmatch(candidate['coordSourceUrl']).group(1)
                if qid not in entities:
                    url = f'https://www.wikidata.org/wiki/Special:EntityData/{qid}.json'
                    request = Request(url, headers={'User-Agent': 'SigongYeojido/1.0 (source-coordinate verification)'})
                    observed = {'qid': qid, 'url': url, 'points': [],
                                'checkedAt': datetime.now(timezone.utc).isoformat()}
                    try:
                        with urlopen(request, timeout=30) as response:
                            raw = response.read()
                        entity = json.loads(raw)['entities'][qid]
                        observed.update(points=earth_points(entity),
                                        labels={lang: entry['value'] for lang, entry in entity.get('labels', {}).items()
                                                if lang in ('ko', 'en', 'zh')})
                        if cache_dir:
                            cache_dir.mkdir(parents=True, exist_ok=True)
                            (cache_dir/f'{qid}.json').write_bytes(raw)
                    except (URLError, TimeoutError, ValueError, KeyError) as error:
                        observed['error'] = str(error)
                        errors.append(f'{qid}: could not verify live coordinates: {error}')
                    entities[qid] = observed
                observed = entities[qid]
                matched = matches_point(candidate, observed['points'])
                observations.append({'placeId': place['id'], 'qid': qid, 'lat': candidate['lat'],
                                     'lon': candidate['lon'], 'matched': matched})
                if not matched:
                    errors.append(f"{place['id']}: coordinates do not match live {qid} P625")
    return {'entities': list(entities.values()), 'candidates': observations, 'errors': errors}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('files', type=Path, nargs='+')
    parser.add_argument('--wikidata', action='store_true')
    parser.add_argument('--cache-dir', type=Path)
    parser.add_argument('--report', type=Path, required=True)
    args = parser.parse_args()
    documents = [json.loads(path.read_text(encoding='utf-8')) for path in args.files]
    errors = []
    for document in documents:
        source = document['_provenance']['source']
        index = json.loads((ROOT/'data/research'/f'{source}-place-index.json').read_text(encoding='utf-8'))
        wanted = {item['chunkId'] for place in document['places'] for item in place.get('evidence', [])}
        chunks = {}
        with (ROOT/'data/sources'/source/'chunks.jsonl').open(encoding='utf-8') as stream:
            for line in stream:
                if line.strip():
                    chunk = json.loads(line)
                    if chunk['id'] in wanted:
                        chunks[chunk['id']] = chunk
        errors.extend(check_document(document, index, chunks))
    report = {'files': [str(path) for path in args.files], 'errors': errors}
    if args.wikidata and not errors:
        report['wikidata'] = check_wikidata(documents, args.cache_dir)
        errors.extend(report['wikidata']['errors'])
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'files': len(documents), 'errors': len(errors), 'report': str(args.report)}))
    raise SystemExit(1 if errors else 0)
