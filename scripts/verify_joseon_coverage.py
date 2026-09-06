"""Check the new annals relationships and complete citation objects through live APIs."""
import argparse
import json
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import urlopen


def main():
    ap=argparse.ArgumentParser();ap.add_argument('--base',default='http://127.0.0.1:8870');ap.add_argument('--out',type=Path,required=True)
    args=ap.parse_args();root=Path(__file__).resolve().parents[1]
    report=json.loads((root/'docs/research/joseon-coverage-51.json').read_text(encoding='utf-8'))
    def get(path,**params):
        with urlopen(args.base+path+'?'+urlencode(params),timeout=90) as r:return json.load(r)
    samples={}
    for sid in report['bySource']:
        for line in (root/'data/sources'/sid.removeprefix('src-')/'citation-chunks.jsonl').read_text(encoding='utf-8').splitlines():
            row=json.loads(line);samples[row['id']]=row
    for cid,row in samples.items():assert get('/api/chunk',id=cid)['chunk']==row,cid
    import sys
    sys.path.insert(0,str(root/'services'));import validate as V
    expected=[]
    for sid in report['bySource']:
        for path in (root/'data/claims'/sid.removeprefix('src-')).glob('*.md'):expected.extend(V.parse_claims_text(path.read_text(encoding='utf-8'))[1])
    graphs={};checked=set()
    for c in expected:
        key=(c['subject'],c['fromSource'])
        if key not in graphs:graphs[key]=get('/api/graph',entity=key[0],sources=key[1])
        graph=graphs[key];actual=next(r for r in graph['claims'] if r['id']==c['id'])
        assert actual['subject']==c['subject'] and actual['predicate']==c['predicate'] and actual['quote']==c['quote'],c['id']
        assert actual['citesChunk']==c['citesChunk'] and actual['fromSource']==c['fromSource']
        assert any(n['id']==c['subject'] for n in graph['nodes']),c['subject']
        if c['object']['kind']=='entity':assert any(n['id']==c['object']['id'] for n in graph['nodes']),c['object']['id']
        checked.add(c['id'])
    assert len(checked)==report['claims']==90 and len(samples)==18
    assert get('/api/graph',entity='ent-wca-taejong',sources='')['claims']==[]
    assert get('/api/graph',entity='ent-wca-taejong',origin='human')['claims']==[]
    result={'base':args.base,'claimsChecked':len(checked),'fullChunkObjectsChecked':len(samples),'sources':len(report['bySource']),
        'checks':{'originalFullJson':True,'exactQuoteAndSource':True,'allGraphReferences':True,'emptyAndHumanFilters':True},
        'scope':'Saved research was interrupted by a session limit; only the saved, checked records were imported. Human interpretation review remains pending.'}
    args.out.parent.mkdir(parents=True,exist_ok=True);args.out.write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8');print(json.dumps(result))


if __name__=='__main__':main()
