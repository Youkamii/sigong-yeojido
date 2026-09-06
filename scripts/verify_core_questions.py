"""Audit Q1-Q9 with real data, distinguishing missing evidence from working queries."""
import argparse
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
import json
from pathlib import Path
import re
from urllib.parse import urlencode
from urllib.request import Request,urlopen


def main():
    ap=argparse.ArgumentParser();ap.add_argument('--base',default='http://127.0.0.1:8870')
    ap.add_argument('--query',default='http://127.0.0.1:3030/sigong/query');ap.add_argument('--out',type=Path,required=True);args=ap.parse_args()
    def get(path,**params):
        with urlopen(args.base+path+'?'+urlencode(params),timeout=90) as r:return json.load(r)
    prefix='PREFIX syj:<https://sigong-yeojido.kr/ns#> '
    query=prefix+'SELECT ?claim ?source ?chunk ?quote ?origin WHERE {?claim a syj:Claim;syj:fromSource ?source;syj:citesChunk ?chunk;syj:quote ?quote;syj:origin ?origin} ORDER BY ?claim'
    with urlopen(Request(args.query,data=urlencode({'query':query}).encode(),headers={'Accept':'application/sparql-results+json'}),timeout=60) as r:
        claims=[{k:v['value'] for k,v in row.items()} for row in json.load(r)['results']['bindings']]
    local=lambda value:value.removeprefix('https://sigong-yeojido.kr/ns#')
    ids=sorted({local(c['chunk']) for c in claims})
    sources=get('/api/sources')['sources']
    source_counts={s['id']:s['chunkCount'] for s in sources}
    by_source=defaultdict(set)
    for claim in claims:by_source[local(claim['source'])].add(local(claim['chunk']))
    chunks={};paged_sources={}
    for source,cited in by_source.items():
        count=source_counts.get(source,0)
        if not count or (count+499)//500>=len(cited):continue
        pages=0
        for offset in range(0,count,500):
            page=get('/api/chunks',sources=source,offset=offset,limit=500)
            assert page['total']==count and page['offset']==offset
            for row in page['chunks']:
                if row['id'] in cited:chunks[row['id']]={'found':True,'chunk':row}
            pages+=1
        paged_sources[source]=pages
    remaining=sorted(set(ids)-chunks.keys())
    def read_chunk(cid):return cid,get('/api/chunk',id=cid)
    with ThreadPoolExecutor(max_workers=4) as pool:chunks.update(pool.map(read_chunk,remaining))
    bad=[]
    for claim in claims:
        cid=local(claim['chunk']);result=chunks[cid];row=result.get('chunk',{})
        if not result.get('found') or row.get('sourceId')!=local(claim['source']) or re.sub(r'\s+','',claim['quote']) not in re.sub(r'\s+','',row.get('text','')):
            bad.append(local(claim['claim']))
    assert claims and not bad,bad
    locations=get('/api/locations',sources='src-samguksagi',year=500)
    assert locations['locations'] and not locations['hasMore']
    assert all((r.get('validFrom') is None or r['validFrom']<=500) and (r.get('validTo') is None or r['validTo']>=500) for r in locations['locations'])
    assert get('/api/locations',sources='',year=500)['locations']==[]
    founding=get('/api/compare',id='baekje-founding')
    assert len(founding['rows'])==3
    years={p['earliest'] for row in founding['rows'] for p in row['projections']}
    assert years=={-18,-17} and sum(not row['projections'] for row in founding['rows'])==1
    people=get('/api/people',polity='polity-silla',**{'from':501,'to':600})
    assert len(people['people'])>=3 and get('/api/people',polity='polity-silla',**{'from':601,'to':700})['people']==[]
    differences=get('/api/comparison-differences',sourceA='src-samguksagi',sourceB='src-web-seisaku-nihonshoki-10')
    assert len(differences['comparisons'])==1 and differences['comparisons'][0]['differentProjectedYears']
    places=get('/api/places')['places'];all_locations=get('/api/locations')['locations']
    counties={name:[] for name in ('낙랑','현도','진번','임둔')}
    for name in counties:
        matched=[p for p in places if name in p.get('labelKo','')]
        for place in matched:
            candidates=[c for c in all_locations if c['place']==place['id']]
            counties[name].append({'id':place['id'],'label':place.get('labelKo'),'candidates':len(candidates),
                'directlyGrounded':sum(bool(c['grounded']) for c in candidates),'withSource':sum(bool(c.get('fromSource')) for c in candidates)})
    q6_complete=all(ps and all(p['candidates'] and p['directlyGrounded']==p['candidates'] for p in ps) for ps in counties.values())
    human_paths=[('/api/graph',{'entity':'person-gwanggaeto'},'claims'),('/api/time',{},'events'),
        ('/api/people',{},'people'),('/api/history-map',{},'features'),('/api/locations',{},'locations'),
        ('/api/comparison-differences',{},'comparisons'),('/api/compare',{'id':'asin-ahwa-death'},'rows')]
    human={path:len(get(path,origin='human',**params)[field]) for path,params,field in human_paths}
    assert all(count==0 for count in human.values()),human
    sg=next(s for s in sources if s['id']=='src-samguksagi')
    assert sg['composedYear']==1145 and sg['coversFrom']==-57 and sg['coversTo']==935
    identity=get('/api/graph',entity='person-encykorea-sammaekjong',sources='src-encykorea-jinheung')
    same=[c for c in identity['claims'] if c['predicate']=='syj:sameEntityAs']
    assert len(same)==1 and same[0]['object']['id']=='person-encykorea-simmaekbu'
    assert len([n for n in identity['nodes'] if n['type']=='Person'])==2
    questions={
        'Q1':{'status':'PASS','selectedSource':'src-samguksagi','year':500,'candidates':len(locations['locations']),
              'boundary':'지도 표시 후보의 기간·선택 검사. 좌표의 역사적 확정을 뜻하지 않는다.'},
        'Q2':{'status':'PASS','rawRows':3,'projectedYears':sorted(years),'unconvertedRows':1,'boundary':'3차 자료의 환산표를 별도로 표시한다.'},
        'Q3':{'status':'PASS','recordedPeople':len(people['people']),'boundary':'소속과 활동 기간이 수록된 인물. 당시 인물 전수 수집은 미완료다.'},
        'Q4':{'status':'PASS','claimsChecked':len(claims),'uniqueChunksChecked':len(chunks),'quoteOrSourceMismatches':bad,
              'pagedSources':paged_sources,'individualChunkRequests':len(remaining)},
        'Q5':{'status':'PASS','discoveredPairs':len(differences['comparisons']),'boundary':'직접 사건 동일성 연결과 연도 근거가 있는 전체 수록 쌍을 조회한다.'},
        'Q6':{'status':'PASS' if q6_complete else 'PARTIAL','counties':counties,
              'boundary':'좌표가 없는 군·직접 근거가 없는 옛 후보가 남았다. 표시 기능과 위치 근거 완성을 구별한다.'},
        'Q7':{'status':'PASS','humanResults':human,'boundary':'현재 모든 Claim이 AI 초안이다. 사람 작성 기록은 0개다. 2D·3D는 별도 브라우저 검사와 함께 확인한다.'},
        'Q8':{'status':'PASS','source':'src-samguksagi','composedYear':1145,'coversFrom':-57,'coversTo':935},
        'Q9':{'status':'PASS','claim':same[0]['id'],'separatePeople':2,'source':same[0]['fromSource'],'automaticMerge':False}}
    report={'base':args.base,'query':args.query,'sources':len(sources),'chunks':sum(s['chunkCount'] for s in sources),
            'claims':len(claims),'questions':questions,'fullySatisfied':all(q['status']=='PASS' for q in questions.values())}
    args.out.parent.mkdir(parents=True,exist_ok=True);args.out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({k:v['status'] for k,v in questions.items()}))


if __name__=='__main__':main()
