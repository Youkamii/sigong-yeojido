"""Read documented cross-source event comparisons from the actual RDF graph."""
import json
from graph_query import NS, identifier, neighborhood, query_rows
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


def differences(sources=None,origin='all',source_info=None,limit=10,offset=0,source_a=None,source_b=None):
    """Find all paged, explicitly linked event pairs with different selected year values."""
    if origin not in ('all','ai','human'):raise ValueError('origin must be all, human or ai')
    limit=max(1,min(20,int(limit)));offset=max(0,int(offset))
    result={'comparisons':[],'limit':limit,'offset':offset,'hasMore':False,
            'scope':'explicit sameEventAs links and selected exact-year projections; no entity-name guesses'}
    pair=''
    if source_a or source_b:
        if not source_a or not source_b:raise ValueError('비교할 두 사료를 함께 지정해야 한다.')
        a,b=identifier(source_a),identifier(source_b)
        pair=f'FILTER((?leftSource = {a} && ?rightSource = {b}) || (?leftSource = {b} && ?rightSource = {a}))'
    if sources is not None and not sources:return result
    if sources is not None:
        # Corpus-only source cards cannot support these joins. Keep the user's selection
        # while avoiding repeated VALUES products across nearly a thousand cards.
        used={row['source'].removeprefix(NS) for row in query_rows('SELECT DISTINCT ?source WHERE {?c a syj:Claim; syj:fromSource ?source}')}
        sources=set(sources)&used
        if not sources:return result
    def selected(source,author):
        scope='' if sources is None else f'FILTER(?{source} IN ('+', '.join(identifier(s) for s in sorted(sources))+'))'
        return scope+('' if origin=='all' else f' FILTER(?{author} = '+json.dumps(origin)+')')
    def year_pattern(side):
        return f'''{{?{side}Span syj:year ?{side}Year}}
        UNION {{?{side}Conversion a syj:Claim; syj:subject ?{side}Span; syj:predicate syj:convertsTo;
                syj:objectYear ?{side}Year; syj:fromSource ?{side}ConversionSource; syj:origin ?{side}ConversionOrigin.
                {selected(side+'ConversionSource',side+'ConversionOrigin')}}}'''
    rows=query_rows(f'''
SELECT DISTINCT ?link ?left ?right ?leftDate ?rightDate ?leftLabel ?rightLabel WHERE {{
 ?link a syj:Claim; syj:subject ?left; syj:predicate syj:sameEventAs; syj:objectEntity ?right;
       syj:fromSource ?linkSource; syj:origin ?linkOrigin.
 ?left a syj:Event. ?right a syj:Event.
 ?leftDate a syj:Claim; syj:subject ?left; syj:objectTime ?leftSpan; syj:fromSource ?leftSource; syj:origin ?leftOrigin.
 ?rightDate a syj:Claim; syj:subject ?right; syj:objectTime ?rightSpan; syj:fromSource ?rightSource; syj:origin ?rightOrigin.
 {selected('linkSource','linkOrigin')}
 {selected('leftSource','leftOrigin')}
 {selected('rightSource','rightOrigin')}
 {{ {year_pattern('left')} }} {{ {year_pattern('right')} }}
 FILTER(?leftSource != ?rightSource && ?leftYear != ?rightYear) {pair}
 OPTIONAL {{?left rdfs:label ?leftLabel}} OPTIONAL {{?right rdfs:label ?rightLabel}}
}} ORDER BY ?link ?leftDate ?rightDate LIMIT {limit+1} OFFSET {offset}
''')
    result['hasMore']=len(rows)>limit
    local=lambda value:value.removeprefix(NS)
    for row in rows[:limit]:
        case={'id':'auto-'+local(row['link'])+'-'+local(row['leftDate'])+'-'+local(row['rightDate']),
              'label':row.get('leftLabel',local(row['left']))+' / '+row.get('rightLabel',local(row['right'])),
              'description':'실제 그래프의 같은 사건 연결과 선택한 연도 근거에서 값 차이를 찾았다. 원문·환산 방식·AI 추론의 한계는 각 주장에 남는다. 자료에 없는 사건을 추정하거나 한쪽을 정답으로 고르지 않는다.',
              'rows':[local(row['leftDate']),local(row['rightDate'])],
              'links':[{'id':local(row['link']),'subject':local(row['left'])}],'sources':sorted(sources or [])}
        result['comparisons'].append(comparison(case,sources,origin,source_info))
    return result
