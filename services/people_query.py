"""Find recorded people by cited polity membership and activity period (#56)."""
from graph_query import NS, identifier, query_rows
from time_query import selected_filter


def people(polity, start, end, sources=None, origin='all', limit=50, offset=0):
    polity_iri=identifier(polity)
    start,end,limit,offset=int(start),int(end),max(1,min(100,int(limit))),max(0,int(offset))
    if start==0 or end==0 or start>end:raise ValueError('시작·끝 연도를 순서대로 넣어야 한다. 0년은 쓰지 않는다.')
    if origin not in ('all','ai','human'):raise ValueError('origin must be all, human or ai')
    result={'people':[],'polity':polity,'from':start,'to':end,'origin':origin,'limit':limit,'offset':offset,
            'hasMore':False,'evidenceTruncated':False,'scope':'selected-source recorded membership and activity; not a complete historical population'}
    if sources is not None and not sources:return result
    pattern=f'''
 ?person a syj:Person.
 ?membership a syj:Claim; syj:subject ?person; syj:predicate ?memberPredicate;
             syj:objectEntity {polity_iri}; syj:fromSource ?source; syj:origin ?memberOrigin.
 VALUES ?memberPredicate {{syj:isKingOf syj:memberOf syj:affiliatedWith}}
 ?activity a syj:Claim; syj:subject ?person; syj:predicate ?timePredicate;
           syj:objectTime ?span; syj:fromSource ?source; syj:origin ?timeOrigin.
 VALUES ?timePredicate {{syj:reignedIn syj:activeIn syj:appearsIn syj:livedIn}}
 {selected_filter(sources,origin,author='memberOrigin')}
 {selected_filter(None,origin,author='timeOrigin')}
 OPTIONAL {{?span syj:earliest ?earliest}} OPTIONAL {{?span syj:latest ?latest}}
 OPTIONAL {{?span syj:year ?year}}
 BIND(COALESCE(?earliest,?year) AS ?start) BIND(COALESCE(?latest,?year) AS ?end)
 FILTER(BOUND(?start) && BOUND(?end) && ?start <= {end} && ?end >= {start})
 OPTIONAL {{?person rdfs:label ?label}}
'''
    matches=query_rows(f'SELECT DISTINCT ?person ?label WHERE {{ {pattern} }} ORDER BY ?person LIMIT {limit+1} OFFSET {offset}')
    result['hasMore']=len(matches)>limit
    local=lambda value:value.removeprefix(NS)
    by_id={local(row['person']):{'id':local(row['person']),'label':row.get('label',local(row['person'])),'evidence':[]} for row in matches[:limit]}
    if not by_id:return result
    values=' '.join(identifier(pid) for pid in by_id)
    support=query_rows(f'''
SELECT DISTINCT ?person ?membership ?activity ?source ?sourceLabel ?memberPredicate ?timePredicate
                ?memberQuote ?memberChunk ?timeQuote ?timeChunk ?span ?verbatim ?start ?end ?memberOrigin ?timeOrigin
WHERE {{
 VALUES ?person {{ {values} }} {pattern}
 ?membership syj:quote ?memberQuote; syj:citesChunk ?memberChunk.
 ?activity syj:quote ?timeQuote; syj:citesChunk ?timeChunk.
 ?span syj:verbatim ?verbatim.
 OPTIONAL {{?source rdfs:label ?sourceLabel}}
}} ORDER BY ?person ?membership ?activity LIMIT 2001
''')
    result['evidenceTruncated']=len(support)>2000
    for row in support[:2000]:
        evidence={'fromSource':local(row['source']),'sourceLabel':row.get('sourceLabel',local(row['source'])),
            'membership':{'id':local(row['membership']),'predicate':'syj:'+local(row['memberPredicate']),
                          'quote':row['memberQuote'],'citesChunk':local(row['memberChunk']),'origin':row['memberOrigin']},
            'activity':{'id':local(row['activity']),'predicate':'syj:'+local(row['timePredicate']),
                        'quote':row['timeQuote'],'citesChunk':local(row['timeChunk']),'origin':row['timeOrigin'],
                        'verbatim':row['verbatim'],'earliest':int(row['start']),'latest':int(row['end'])}}
        by_id[local(row['person'])]['evidence'].append(evidence)
    result['people']=list(by_id.values())
    return result
