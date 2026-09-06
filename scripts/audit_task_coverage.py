#!/usr/bin/env python3
"""Read implementation coverage without changing corpus, claims or services (#45)."""
import argparse
from collections import Counter
from datetime import datetime, timezone
import json
from pathlib import Path
import subprocess
import sys
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--url', default='http://127.0.0.1:8870')
    parser.add_argument('--fuseki', default='http://127.0.0.1:3030/sigong/query')
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    root = args.root.resolve()
    sys.path.insert(0, str(root/'services'))
    import validate as V
    import build_ttl as B

    def api(path):
        with urlopen(args.url+path, timeout=30) as response:
            return json.load(response)

    def query(text):
        prefix = 'PREFIX syj: <https://sigong-yeojido.kr/ns#> '
        request = Request(args.fuseki, data=urlencode({'query':prefix+text}).encode(), headers={'Accept':'application/sparql-results+json'})
        with urlopen(request, timeout=30) as response:
            rows = json.load(response)['results']['bindings']
        return [{key:value['value'] for key,value in row.items()} for row in rows]

    sources = api('/api/sources')['sources']
    places = api('/api/places')['places']
    claims = []
    for path in sorted((root/'data/claims').glob('*/*.md')):
        _, values = V.parse_claims_text(path.read_text(encoding='utf-8'))
        claims.extend(values)
    responses = {}
    for path in ['/api/graph','/api/chat','/server.py','/timeline-demo.html']:
        try:
            with urlopen(Request(args.url+path, method='HEAD'), timeout=10) as response:
                responses[path] = {'status':response.status,'bytes':response.headers.get('Content-Length')}
        except HTTPError as exc:
            responses[path] = {'status':exc.code}
    normal = api('/api/claims?subject=person-gwanggaeto&about=1')
    human = api('/api/claims?subject=person-gwanggaeto&about=1&origin=human')

    def claim(cid, subject, predicate, obj):
        return {'id':cid,'subject':subject,'predicate':predicate,'object':obj,
                'citesChunk':'chunk-a','quote':'A B 100 101','fromSource':'src-fixture','origin':'ai','status':'draft'}

    chunks = {'chunk-a':{'id':'chunk-a','text':'A B 100 101','norm':'AB100101','sourceId':'src-fixture'}}
    entities = {'person-a':'Person','person-b':'Person','event-a':'Event'}
    fixtures = {
        'genealogyCycle': [claim('a','person-a','syj:descendantOf',{'kind':'entity','id':'person-b'}), claim('b','person-b','syj:descendantOf',{'kind':'entity','id':'person-a'})],
        'appearanceAfterDeath': [claim('a','person-a','syj:diedIn',{'kind':'year','value':100}), claim('b','person-a','syj:appearsIn',{'kind':'year','value':101})],
        'relativeOrderCycle': [claim('a','person-a','syj:before',{'kind':'entity','id':'person-b'}), claim('b','person-b','syj:before',{'kind':'entity','id':'person-a'})],
    }
    fixture_results = {}
    for name, values in fixtures.items():
        doc = V.ClaimsDoc(Path('coverage-fixture.md'), 'isolated coverage input', 'fixture', {}, values)
        recorded = {'fixture':{c['id']:V.claim_digest(c) for c in values}}
        result = V.validate(chunks,entities,[doc],recorded)
        fixture_results[name] = {'claims':len(values),'predicates':sorted(set(c['predicate'] for c in values)), 'failureCodes':[f.code for f in result.failures], 'conflicts':len(result.conflicts),'digest':V.digest_totals(result), 'note':'Isolated synthetic claims. Genealogy uses the existing descendantOf predicate; death/appearance/order vocabularies still need a formal contract. These are not historical facts.'}

    span = claim('span','event-a','syj:occurredAt',{'kind':'time','id':'ts-a','verbatim':'100','precision':'year','year':100,'earliest':99,'latest':101})
    graph = B.Graph()
    doc = V.ClaimsDoc(Path('coverage-fixture.md'),'isolated time input','fixture',{},[span])
    stats = B.ClaimStats()
    B.add_claim(graph,span,doc,chunks,{'src-fixture':({},Path('fixture.md'))},stats)
    ttl,_,_ = B.render(graph,[])
    fixture_results['timeRangeSerialization'] = {key:f'syj:{key} ' in ttl for key in ['verbatim','precision','year','earliest','latest']}

    source_families = Counter(s.get('sourceGroup') or s.get('sourceKind') or 'unknown' for s in sources)
    result = {
        'verifiedAtUtc':datetime.now(timezone.utc).isoformat(),
        'applicationCommit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),
        'scope':'Read-only API/Fuseki plus isolated in-memory validator/builder inputs; no service restart, corpus edit or SPARQL mutation.',
        'data':{'sources':len(sources),'chunks':sum(s['chunkCount'] for s in sources),'places':len(places),'claims':len(claims),
                'claimsBySource':dict(Counter(c['fromSource'] for c in claims)), 'claimsByOrigin':dict(Counter(c['origin'] for c in claims)),
                'claimPredicates':dict(sorted(Counter(c['predicate'] for c in claims).items())), 'sourceGroups':dict(source_families),
                'defaultLensSources':[{'id':s['id'],'label':s.get('label')} for s in sources if s.get('defaultLens') is True],
                'sourcesCovering1945OrLater':[s['id'] for s in sources if isinstance(s.get('coversTo'),int) and s['coversTo']>=1945],
                'placesOutside3d':[{'id':p['id'],'outsideCandidates':sum(not(123<=c['lon']<=132 and 33<=c['lat']<=43.5) for c in p.get('candidates',[]))} for p in places if any(not(123<=c['lon']<=132 and 33<=c['lat']<=43.5) for c in p.get('candidates',[]))]},
        'originFilter':{'normalCount':normal['total'],'requestedHumanCount':human['total'],'returnedOrigins':sorted(set(c['origin'] for c in human['claims']))},
        'routes':responses,
        'rdf':{'classes':query('SELECT ?type (COUNT(*) AS ?n) WHERE {?s a ?type} GROUP BY ?type'),
               'claimSources':query('SELECT ?source (COUNT(*) AS ?n) WHERE {?c a syj:Claim;syj:fromSource ?source} GROUP BY ?source'),
               'locatedAtClaims':query('SELECT (COUNT(*) AS ?n) WHERE {?c a syj:Claim;syj:predicate syj:locatedAt}'),
               'defaultLens':query('SELECT ?source WHERE {?source a syj:Source;syj:defaultLens true}')},
        'isolatedFixtures':fixture_results,
        'notRun':['External web/licensing research','Actual sibling-path file disclosure','Slow-client load test','Reboot test','Full new browser regression']
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(result,ensure_ascii=False,indent=2))


if __name__=='__main__':
    main()
