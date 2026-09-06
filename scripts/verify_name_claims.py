"""Check corrected Silla quotes and non-conflicting state names through real RDF, APIs and UI."""
import argparse
import json
from pathlib import Path
import re
import subprocess
import sys
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from playwright.sync_api import sync_playwright
from verify_viewer import LAUNCH_ARGS


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    ap.add_argument('--base', default='http://127.0.0.1:8870')
    ap.add_argument('--query', default='http://127.0.0.1:3030/sigong/query')
    ap.add_argument('--out', type=Path, required=True); args = ap.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    sys.path.insert(0, str(args.root / 'services'))
    from validate import parse_claims_text
    paths = ['samguksagi/chunk_samguksagi_sg_004_0020_0060.md',
             'samguksagi/chunk_samguksagi_sg_012_0060_0280.md',
             'samgukyusa/chunk_samgukyusa_sy_001_0020_0190_0050.md']
    claims = [parse_claims_text((args.root / 'data/claims' / path).read_text(encoding='utf-8'))[1][0] for path in paths]
    query = '''PREFIX syj:<https://sigong-yeojido.kr/ns#>
      SELECT ?subject ?predicate WHERE {?c a syj:Conflict; syj:aboutSubject ?subject; syj:aboutPredicate ?predicate}'''
    with urlopen(Request(args.query, data=urlencode({'query': query}).encode(),
                         headers={'Accept': 'application/sparql-results+json'}), timeout=60) as response:
        conflicts = [(row['subject']['value'], row['predicate']['value']) for row in json.load(response)['results']['bindings']]
    assert len(conflicts) == 6
    assert not any(predicate.endswith(('#hasName', '#hasStateName')) for _, predicate in conflicts)
    assert any(predicate.endswith('#readsCharacterAs') for _, predicate in conflicts)
    assert any(subject.endswith('#polity-balhae') and predicate.endswith('#foundedBy') for subject, predicate in conflicts)
    errors = []; ui_counts = {}
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=LAUNCH_ARGS)
        page = browser.new_page(viewport={'width': 1440, 'height': 1000})
        page.on('pageerror', lambda error: errors.append(str(error)))
        for claim in claims:
            params = urlencode({'entity': claim['subject'], 'sources': claim['fromSource'], 'limit': 100})
            actual = next(row for row in page.request.get(args.base + '/api/graph?' + params).json()['claims'] if row['id'] == claim['id'])
            assert all(actual[key] == claim[key] for key in ('quote', 'predicate', 'subject', 'fromSource', 'citesChunk', 'origin'))
            assert all(actual['object'].get(key) == value for key, value in claim['object'].items())
            chunk = page.request.get(args.base + '/api/chunk?' + urlencode({'id': claim['citesChunk']})).json()['chunk']
            assert claim['quote'] == chunk['text']
        meta = page.request.get(args.base + '/api/claims?subject=polity-silla').json()
        assert {'syj:hasName', 'syj:hasStateName'} <= set(meta['multiValuedPredicates'])
        page.goto(args.base + '/?q=low', wait_until='networkidle', timeout=180000)
        page.locator('#enter').click(); page.locator('#allSources').click()
        page.locator('#srcList .src').first.wait_for(state='attached', timeout=180000)
        for entity, predicate in [('polity-silla', 'hasName'), ('polity-taebong', 'hasStateName')]:
            page.locator('#q').fill(entity)
            page.locator('#qList [data-id="' + entity + '"]').click()
            page.wait_for_function('([p,n])=>[...document.querySelectorAll("#evi .claim .pred")].filter(e=>e.textContent===p).length===n',
                                   arg=[predicate, 2], timeout=30000)
            selected = page.locator('#evi .claim').filter(has=page.locator('.pred', has_text=re.compile('^' + predicate + '$')))
            assert selected.count() == 2 and selected.locator('.cf').count() == 0
            ui_counts[entity] = selected.count()
            if entity == 'polity-silla':
                assert '攺新羅爲慶州' in page.locator('#evi').inner_text()
                page.screenshot(path=str(args.out / 'silla-quotes.png'))
        assert not errors, errors
        browser.close()
    report = {'base': args.base, 'head': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=args.root, text=True).strip(),
              'claims': [claim['id'] for claim in claims], 'conflicts': conflicts, 'uiNameCounts': ui_counts,
              'checks': {'graph_matches_corrected_claims': True, 'direct_full_chunk_quotes': True,
                         'rdf_names_not_conflicts': True, 'reading_and_founder_differences_retained': True,
                         'shared_api_rule': True, 'real_ui_no_name_conflict_badges': True}, 'pageErrors': errors}
    (args.out / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(report, ensure_ascii=False))


if __name__ == '__main__':
    main()
