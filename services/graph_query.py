"""Read a bounded neighborhood of the built claim graph from Fuseki (#46)."""
import json
import os
import re
from urllib.error import URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

NS = 'https://sigong-yeojido.kr/ns#'
PREFIX = f'PREFIX syj: <{NS}> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> '
ID_RE = re.compile(r'[A-Za-z_][A-Za-z0-9_.-]*\Z')


class GraphUnavailable(RuntimeError):
    pass


def identifier(value):
    if not isinstance(value,str) or not ID_RE.fullmatch(value):
        raise ValueError('invalid graph identifier')
    return '<'+NS+value+'>'


def query_rows(query, endpoint=None):
    endpoint = endpoint or os.environ.get('SIGONG_FUSEKI_QUERY','http://127.0.0.1:3030/sigong/query')
    request = Request(endpoint,data=urlencode({'query':PREFIX+query}).encode(),
                      headers={'Accept':'application/sparql-results+json'})
    try:
        with urlopen(request,timeout=30) as response:
            bindings=json.load(response)['results']['bindings']
    except (URLError,TimeoutError,ValueError,KeyError) as exc:
        raise GraphUnavailable('지식그래프를 조회하지 못했다. 잠시 뒤 다시 시도할 수 있다.') from exc
    return [{key:value['value'] for key,value in row.items()} for row in bindings]


def neighborhood(entity, sources=None, origin='all', limit=30, offset=0):
    focus=identifier(entity)
    if origin not in ('all','human','ai'):
        raise ValueError('origin must be all, human or ai')
    limit=max(1,min(100,int(limit)))
    offset=max(0,int(offset))
    result={'entity':entity,'nodes':[],'edges':[],'claims':[],'hasMore':False,'offset':offset,'limit':limit,'origin':origin}
    if sources is not None and not sources:
        return result
    selected = '' if sources is None else 'VALUES ?source { '+' '.join(identifier(s) for s in sorted(sources))+' }'
    authors = '' if origin=='all' else 'FILTER(?origin = '+json.dumps(origin)+')'
    query = f'''
SELECT DISTINCT ?claim ?subject ?predicate ?objectKind ?object ?source ?chunk ?quote ?origin ?status
       ?subjectLabel ?subjectType ?objectLabel ?objectType ?sourceLabel ?locator ?permalink
       ?verbatim ?precision ?year ?earliest ?latest ?calendar ?lat ?lon ?validFrom ?validTo
WHERE {{
  ?claim a syj:Claim; syj:subject ?subject; syj:predicate ?predicate; syj:fromSource ?source;
         syj:citesChunk ?chunk; syj:quote ?quote; syj:origin ?origin; syj:status ?status;
         ?objectKind ?object.
  VALUES ?objectKind {{syj:objectEntity syj:objectLiteral syj:objectYear syj:objectTime syj:objectLocation}}
  {selected} {authors}
  FILTER(?subject = {focus} || EXISTS {{?claim syj:objectEntity {focus}}} || EXISTS {{?claim syj:objectTime {focus}}})
  OPTIONAL {{?subject rdfs:label ?subjectLabel}}
  OPTIONAL {{?subject a ?subjectType}}
  OPTIONAL {{?object rdfs:label ?objectLabel}}
  OPTIONAL {{?object a ?objectType}}
  OPTIONAL {{?source rdfs:label ?sourceLabel}}
  OPTIONAL {{?chunk syj:locator ?locator}}
  OPTIONAL {{?chunk syj:permalink ?permalink}}
  OPTIONAL {{?object syj:verbatim ?verbatim}}
  OPTIONAL {{?object syj:precision ?precision}}
  OPTIONAL {{?object syj:year ?year}} OPTIONAL {{?object syj:earliest ?earliest}}
  OPTIONAL {{?object syj:latest ?latest}} OPTIONAL {{?object syj:calendar ?calendar}}
  OPTIONAL {{?object syj:lat ?lat; syj:lon ?lon}}
  OPTIONAL {{?claim syj:validFrom ?validFrom}}
  OPTIONAL {{?claim syj:validTo ?validTo}}
}} ORDER BY ?claim LIMIT {limit+1} OFFSET {offset}
'''
    rows=query_rows(query)
    result['hasMore']=len(rows)>limit
    nodes,edges={},set()
    local=lambda value: value.removeprefix(NS)
    def node(node_id,kind,label,**extra):
        nodes.setdefault(node_id,{'id':node_id,'type':kind,'label':label or node_id,**extra})
    for row in rows[:limit]:
        cid,subject,source,chunk=(local(row[k]) for k in ('claim','subject','source','chunk'))
        kind=local(row['objectKind']).removeprefix('object').lower()
        obj={'kind':kind}
        target=local(row['object']) if kind in ('entity','time','location') else 'value-'+cid
        label=row.get('objectLabel',row.get('verbatim',row['object']))
        if kind=='entity': obj['id']=target
        elif kind=='year': obj['value']=int(row['object'])
        elif kind=='literal': obj['value']=row['object']
        elif kind=='time':
            obj.update(id=target,verbatim=row.get('verbatim',''),precision=row.get('precision','unknown'))
            for key in ('year','earliest','latest'):
                if key in row:obj[key]=int(row[key])
            if 'calendar' in row:obj['calendar']=row['calendar']
        elif kind=='location':
            obj.update(lat=float(row['lat']),lon=float(row['lon']),precision=row.get('precision'))
            label=f"{obj['lat']}, {obj['lon']}"
        claim={'id':cid,'subject':subject,'predicate':'syj:'+local(row['predicate']),'object':obj,
               'fromSource':source,'citesChunk':chunk,'quote':row['quote'],'origin':row['origin'],'status':row['status'],
               'sourceLabel':row.get('sourceLabel',source),'subjectLabel':row.get('subjectLabel',subject),
               'chunk':{'id':chunk,'sourceId':source,'locator':row.get('locator'),'permalink':row.get('permalink')}}
        for key in ('validFrom','validTo'):
            if key in row: claim[key]=int(row[key])
        result['claims'].append(claim)
        node(subject,local(row.get('subjectType',NS+'Entity')),row.get('subjectLabel',subject))
        node(cid,'Claim',local(row['predicate']),origin=row['origin'])
        node(target,local(row.get('objectType',NS+'Value')),label,claimId=cid)
        node(chunk,'Chunk',row.get('locator',chunk),sourceId=source)
        node(source,'Source',row.get('sourceLabel',source))
        edges.update(((subject,cid,'주장'),(cid,target,'대상·값'),(cid,chunk,'인용'),(chunk,source,'사료')))
    candidates=locations(entity,sources,origin,limit=20)
    result['locations']=candidates['locations']
    result['moreLocations']=candidates['hasMore']
    for candidate in candidates['locations']:
        node(entity,candidate['placeType'],candidate['placeLabel'])
        node(candidate['id'],'Location',f"{candidate['lat']}, {candidate['lon']}",location=candidate)
        edges.add((entity,candidate['id'],'좌표 근거' if candidate['grounded'] else '조사 후보'))
        if candidate.get('fromSource'):
            node(candidate['fromSource'],'Source',candidate['sourceLabel'])
            edges.add((candidate['id'],candidate['fromSource'],'좌표 출처'))
    result['nodes']=list(nodes.values())
    result['edges']=[{'from':start,'to':end,'label':label} for start,end,label in sorted(edges)]
    return result


def locations(place=None,sources=None,origin='all',year=None,limit=1000,offset=0):
    if origin not in ('all','human','ai'):raise ValueError('origin must be all, human or ai')
    limit=max(1,min(1000,int(limit)));offset=max(0,int(offset))
    result={'locations':[],'hasMore':False,'offset':offset,'limit':limit}
    if sources is not None and not sources:return result
    focus='' if not place else f'FILTER(?place={identifier(place)})'
    authors='' if origin=='all' else 'FILTER(?origin='+json.dumps(origin)+')'
    selection=''
    if sources is not None:
        values=','.join(identifier(s) for s in sorted(sources))
        selection=f'FILTER(!BOUND(?source)||?source IN ({values})) FILTER NOT EXISTS {{?location syj:requiresSource ?required. FILTER(?required NOT IN ({values}))}}'
    period='' if year is None else f'FILTER((!BOUND(?validFrom)||?validFrom<={int(year)})&&(!BOUND(?validTo)||?validTo>={int(year)}))'
    rows=query_rows(f'''
SELECT DISTINCT ?location ?place ?placeLabel ?placeType ?lat ?lon ?grounded ?source ?sourceLabel ?origin ?precision ?basis ?validFrom ?validTo ?fromFile
WHERE {{
 ?location a syj:Location; syj:candidateOf ?place; syj:lat ?lat; syj:lon ?lon; syj:grounded ?grounded.
 OPTIONAL {{?place rdfs:label ?placeLabel}} OPTIONAL {{?place a ?placeType}}
 OPTIONAL {{?location syj:fromSource ?source. OPTIONAL {{?source rdfs:label ?sourceLabel}}}}
 OPTIONAL {{?location syj:origin ?origin}} OPTIONAL {{?location syj:precision ?precision}}
 OPTIONAL {{?location syj:basis ?basis}} OPTIONAL {{?location syj:validFrom ?validFrom}}
 OPTIONAL {{?location syj:validTo ?validTo}} OPTIONAL {{?location syj:fromFile ?fromFile}}
 {focus} {authors} {selection} {period}
}} ORDER BY ?location LIMIT {limit+1} OFFSET {offset}
''')
    result['hasMore']=len(rows)>limit
    local=lambda value:value.removeprefix(NS)
    for row in rows[:limit]:
        candidate={'id':local(row['location']),'place':local(row['place']),
                   'placeLabel':row.get('placeLabel',local(row['place'])),'placeType':local(row.get('placeType','Place')),
                   'lat':float(row['lat']),'lon':float(row['lon']),'grounded':row['grounded']=='true'}
        for key in ('sourceLabel','origin','precision','basis','fromFile'):
            if key in row:candidate[key]=row[key]
        if 'source' in row:
            candidate['fromSource']=local(row['source'])
            candidate.setdefault('sourceLabel',candidate['fromSource'])
        for key in ('validFrom','validTo'):
            candidate[key]=int(row[key]) if key in row else None
        result['locations'].append(candidate)
    return result
