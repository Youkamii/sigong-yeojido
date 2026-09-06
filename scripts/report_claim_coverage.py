"""Report actual RDF claim coverage without treating corpus size as interpretation."""
import argparse
from collections import Counter
import json
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request,urlopen


def main():
    ap=argparse.ArgumentParser();ap.add_argument('--base',default='http://127.0.0.1:8870')
    ap.add_argument('--query',default='http://127.0.0.1:3030/sigong/query');ap.add_argument('--out',type=Path,required=True)
    args=ap.parse_args()
    with urlopen(args.base+'/api/sources',timeout=90) as r:sources=json.load(r)['sources']
    q='PREFIX syj:<https://sigong-yeojido.kr/ns#> SELECT ?source ?origin (COUNT(?claim) AS ?n) WHERE {?claim a syj:Claim;syj:fromSource ?source;syj:origin ?origin} GROUP BY ?source ?origin ORDER BY ?source ?origin'
    with urlopen(Request(args.query,data=urlencode({'query':q}).encode(),headers={'Accept':'application/sparql-results+json'}),timeout=60) as r:rows=json.load(r)['results']['bindings']
    counts=Counter();origins=Counter()
    for row in rows:
        n=int(row['n']['value']);counts[row['source']['value'].split('#')[-1]]+=n;origins[row['origin']['value']]+=n
    assert set(counts)<={s['id'] for s in sources}
    covered=[{'source':s['id'],'label':s.get('label'),'sourceKind':s.get('sourceKind'),
        'group':s.get('sourceGroup'),'claims':counts[s['id']],'chunks':s['chunkCount'],
        'composedYear':s.get('composedYear'),'coversFrom':s.get('coversFrom'),'coversTo':s.get('coversTo')}
        for s in sources if counts[s['id']]]
    report={'base':args.base,'query':args.query,'sources':len(sources),'chunks':sum(s['chunkCount'] for s in sources),
        'claims':sum(counts.values()),'sourcesWithClaims':len(counts),'sourcesWithoutClaims':len(sources)-len(counts),
        'byOrigin':dict(origins),'bySource':sorted(covered,key=lambda row:(-row['claims'],row['source'])),
        'limits':['자료의 기간은 모든 주장의 활동 기간을 뜻하지 않는다.','원문 적재량을 인물·사건 수집 완성도로 계산하지 않는다.',
                  'Source별 분포이며 원문 전체에서 모든 주장을 추출했다는 뜻이 아니다.']}
    args.out.parent.mkdir(parents=True,exist_ok=True);args.out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({k:report[k] for k in ('sources','chunks','claims','sourcesWithClaims','sourcesWithoutClaims','byOrigin')}))


if __name__=='__main__':main()
