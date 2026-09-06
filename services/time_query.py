"""Keep original dates and source-specific conversions separate on the timeline."""
import json

from graph_query import NS, identifier, query_rows


def selected_filter(sources, origin, source='source', author='origin'):
    selection='' if sources is None else f'VALUES ?{source} {{ '+ ' '.join(identifier(s) for s in sorted(sources))+' }'
    return selection+('' if origin=='all' else f' FILTER(?{author} = '+json.dumps(origin)+')')


def time_claims(sources=None, origin='all', entity=None, limit=500, claim_ids=None):
    if origin not in ('all','ai','human'):
        raise ValueError('origin must be all, human or ai')
    limit=max(1,min(1000,int(limit)))
    result={'events':[],'relations':[],'hasMore':False,'origin':origin}
    if sources is not None and not sources:
        return result
    focus='' if not entity else f'FILTER(?subject = {identifier(entity)})'
    if claim_ids is not None:
        if not claim_ids:return result
        focus+=' VALUES ?claim { '+' '.join(identifier(cid) for cid in sorted(claim_ids))+' }'
    rows=query_rows(f'''
SELECT DISTINCT ?claim ?subject ?label ?predicate ?span ?verbatim ?precision ?year ?earliest ?latest ?calendar
       ?source ?sourceLabel ?chunk ?quote ?origin ?status ?locator ?permalink
WHERE {{
  ?claim a syj:Claim; syj:subject ?subject; syj:predicate ?predicate; syj:objectTime ?span;
         syj:fromSource ?source; syj:citesChunk ?chunk; syj:quote ?quote; syj:origin ?origin; syj:status ?status.
  ?span syj:verbatim ?verbatim; syj:precision ?precision.
  {selected_filter(sources,origin)} {focus}
  OPTIONAL {{?subject rdfs:label ?label}} OPTIONAL {{?source rdfs:label ?sourceLabel}}
  OPTIONAL {{?chunk syj:locator ?locator}} OPTIONAL {{?chunk syj:permalink ?permalink}}
  OPTIONAL {{?span syj:year ?year}} OPTIONAL {{?span syj:earliest ?earliest}}
  OPTIONAL {{?span syj:latest ?latest}} OPTIONAL {{?span syj:calendar ?calendar}}
}} ORDER BY ?claim LIMIT {limit+1}
''')
    result['hasMore']=len(rows)>limit
    local=lambda value:value.removeprefix(NS)
    spans={local(row['span']) for row in rows[:limit]}
    conversions={}
    if spans:
        values=' '.join(identifier(span) for span in sorted(spans))
        converted=query_rows(f'''
SELECT DISTINCT ?claim ?span ?year ?source ?sourceLabel ?chunk ?quote ?origin ?status ?locator ?permalink
WHERE {{
 VALUES ?span {{ {values} }}
 ?claim a syj:Claim; syj:subject ?span; syj:predicate syj:convertsTo; syj:objectYear ?year;
        syj:fromSource ?source; syj:citesChunk ?chunk; syj:quote ?quote; syj:origin ?origin; syj:status ?status.
 {selected_filter(sources,origin)}
 OPTIONAL {{?source rdfs:label ?sourceLabel}} OPTIONAL {{?chunk syj:locator ?locator}}
 OPTIONAL {{?chunk syj:permalink ?permalink}}
}} ORDER BY ?span ?year ?claim LIMIT 2001
''')
        result['hasMore']=result['hasMore'] or len(converted)>2000
        for row in converted[:2000]:
            span=local(row['span'])
            conversions.setdefault(span,[]).append(_claim(row,span,'syj:convertsTo',{'kind':'year','value':int(row['year'])}))
    for row in rows[:limit]:
        span=local(row['span'])
        obj={'kind':'time','id':span,'verbatim':row['verbatim'],'precision':row['precision']}
        for key in ('year','earliest','latest'):
            if key in row:obj[key]=int(row[key])
        if 'calendar' in row:obj['calendar']=row['calendar']
        event=_claim(row,local(row['subject']),'syj:'+local(row['predicate']),obj)
        event['subjectLabel']=row.get('label',event['subject'])
        event['conversions']=conversions.get(span,[])
        event['projections']=[]
        lo,hi=obj.get('earliest',obj.get('year')),obj.get('latest',obj.get('year'))
        if lo is not None or hi is not None:
            event['projections'].append({'earliest':lo,'latest':hi,'claimId':event['id'],'fromSource':event['fromSource']})
        for conversion in event['conversions']:
            year=conversion['object']['value']
            event['projections'].append({'earliest':year,'latest':year,'claimId':conversion['id'],'fromSource':conversion['fromSource']})
        result['events'].append(event)
    relations=query_rows(f'''
SELECT DISTINCT ?claim ?subject ?predicate ?target ?source ?sourceLabel ?chunk ?quote ?origin ?status ?locator ?permalink
WHERE {{
 VALUES ?predicate {{syj:before syj:after}}
 ?claim a syj:Claim; syj:subject ?subject; syj:predicate ?predicate; syj:objectEntity ?target;
        syj:fromSource ?source; syj:citesChunk ?chunk; syj:quote ?quote; syj:origin ?origin; syj:status ?status.
 {selected_filter(sources,origin)} {focus}
 OPTIONAL {{?source rdfs:label ?sourceLabel}} OPTIONAL {{?chunk syj:locator ?locator}}
 OPTIONAL {{?chunk syj:permalink ?permalink}}
}} ORDER BY ?claim LIMIT {limit+1}
''')
    result['hasMore']=result['hasMore'] or len(relations)>limit
    result['relations']=[_claim(row,local(row['subject']),'syj:'+local(row['predicate']),{'kind':'entity','id':local(row['target'])}) for row in relations[:limit]]
    return result


def _claim(row,subject,predicate,obj):
    local=lambda key:row[key].removeprefix(NS)
    return {'id':local('claim'),'subject':subject,'subjectLabel':subject,'predicate':predicate,'object':obj,
            'fromSource':local('source'),'sourceLabel':row.get('sourceLabel',local('source')),
            'citesChunk':local('chunk'),'quote':row['quote'],'origin':row['origin'],'status':row['status'],
            'chunk':{'id':local('chunk'),'sourceId':local('source'),'locator':row.get('locator'),'permalink':row.get('permalink')}}
