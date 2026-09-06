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
       ?verbatim ?precision ?lat ?lon ?validFrom ?validTo
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
        elif kind=='time': obj.update(id=target,verbatim=row.get('verbatim',''),precision=row.get('precision','unknown'))
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
    result['nodes']=list(nodes.values())
    result['edges']=[{'from':start,'to':end,'label':label} for start,end,label in sorted(edges)]
    return result
