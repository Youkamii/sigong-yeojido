#!/usr/bin/env python3
"""Run filtered, paginated graph queries against real Fuseki data (#46)."""
import argparse
import json
import os
from pathlib import Path
import sys

sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'services'))
import graph_query as G


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--endpoint',default='http://127.0.0.1:3030/sigong/query')
    parser.add_argument('--out',type=Path,required=True)
    args=parser.parse_args()
    os.environ['SIGONG_FUSEKI_QUERY']=args.endpoint
    all_claims=G.neighborhood('person-gwanggaeto',limit=100)
    assert len(all_claims['claims'])>5 and not all_claims['hasMore']
    empty=G.neighborhood('person-gwanggaeto',sources=set())
    assert not empty['claims'] and not empty['nodes'] and not empty['edges']
    human=G.neighborhood('person-gwanggaeto',origin='human',limit=100)
    assert all(c['origin']=='human' for c in human['claims'])
    expected_human=[c for c in all_claims['claims'] if c['origin']=='human']
    assert len(human['claims'])==len(expected_human)
    source_id=all_claims['claims'][0]['fromSource']
    selected=G.neighborhood('person-gwanggaeto',sources={source_id},limit=100)
    assert all(c['fromSource']==source_id for c in selected['claims'])
    assert not G.neighborhood('person-gwanggaeto',sources={'src-nonexistent'})['claims']
    collected=[]
    for offset in range(0,100,5):
        page=G.neighborhood('person-gwanggaeto',limit=5,offset=offset)
        collected.extend(c['id'] for c in page['claims'])
        if not page['hasMore']:break
    assert collected==[c['id'] for c in all_claims['claims']]
    ids={n['id'] for n in all_claims['nodes']}
    assert all(e['from'] in ids and e['to'] in ids for e in all_claims['edges'])
    for claim in all_claims['claims']:
        assert claim['quote'] and claim['citesChunk'] in ids and claim['fromSource'] in ids
    span=G.query_rows('SELECT ?id WHERE {?id a syj:TimeSpan} ORDER BY ?id LIMIT 1')[0]['id'].removeprefix(G.NS)
    time_graph=G.neighborhood(span)
    assert time_graph['claims'] and any(n['type']=='TimeSpan' for n in time_graph['nodes'])
    try:G.neighborhood('x> ?s ?p ?o')
    except ValueError:pass
    else:raise AssertionError('invalid identifier was accepted')
    report={'personClaims':len(all_claims['claims']),'humanClaims':len(human['claims']),
            'sourcesAndEmptySelection':True,'paginationMatches':True,'allEdgesResolve':True,
            'allClaimsHaveEvidence':True,'timeSpan':span,'timeSpanClaims':len(time_graph['claims']),
            'nodes':len(ids),'edges':len(all_claims['edges'])}
    args.out.parent.mkdir(parents=True,exist_ok=True)
    args.out.write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(report))


if __name__=='__main__':
    main()
