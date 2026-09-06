"""Read documented cross-source event comparisons from the actual RDF graph."""
from graph_query import neighborhood
from time_query import time_claims


def comparison(case,sources=None,origin='all',source_info=None):
    times=time_claims(sources,origin,claim_ids=case['rows'])
    by_id={claim['id']:claim for claim in times['events']}
    rows=[]
    for cid in case['rows']:
        if cid not in by_id:continue
        claim=by_id[cid]
        meta=(source_info or {}).get(claim['fromSource'],{})
        claim['edition']={k:meta[k] for k in ('compiler','composedYear','edition','sourceKind','sourceGroup') if k in meta}
        rows.append(claim)
    wanted={link['id'] for link in case['links']}
    links=[]
    for subject in sorted({link['subject'] for link in case['links']}):
        links.extend(c for c in neighborhood(subject,sources,origin,limit=100)['claims'] if c['id'] in wanted)
    raw={row['object']['verbatim'] for row in rows}
    years={p['earliest'] for row in rows for p in row['projections'] if p['earliest']==p['latest'] and p['earliest'] is not None}
    return {'case':case,'rows':rows,'links':links,'sourceCount':len({r['fromSource'] for r in rows}),
            'differentRawDates':len(raw)>1,'differentProjectedYears':len(years)>1,'hasMore':times['hasMore'],
            'origin':origin,'groupingOrigin':'ai','automaticMerge':False}
