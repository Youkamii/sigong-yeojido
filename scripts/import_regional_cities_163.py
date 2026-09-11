"""Import the reviewed #163 subset through normal source/entity/claim files.

The approved JSON is a reviewed normalization of cities-research.json, not an
inference engine: it carries sources, entities, claims and bounded scene packets.
Raw HTML bytes and exact excerpts are checked before any repository file is written.
"""
import argparse
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import sys

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'services'))
import validate as V

class Text(HTMLParser):
    def __init__(self):super().__init__();self.parts=[]
    def handle_data(self,text):self.parts.append(text)

def markdown(meta,body):
    return '---\n'+'\n'.join(f'{k}: {json.dumps(v,ensure_ascii=False)}' for k,v in meta.items())+'\n---\n\n'+body.rstrip()+'\n'

def normalize(approved,raw_dir):
    sources={s['id']:s for s in approved['sources']}
    chunks={}
    for source in sources.values():
        raw=(raw_dir/source['verifiedFile']).read_bytes()
        assert hashlib.sha256(raw).hexdigest()==source['verifiedSha256'],source['id']
        parser=Text();parser.feed(raw.decode(source.get('encoding','utf-8')))
        text=''.join(parser.parts)
        assert sum(len(ex['text'].split()) for ex in source['excerpts'])<=25,source['id']
        for ex in source['excerpts']:
            assert ''.join(ex['text'].split()) in ''.join(text.split()),(source['id'],'quote mismatch')
            chunk={'id':ex['id'],'sourceId':source['id'],'text':ex['text'],'locator':ex['locator'],
                   'lang':'ko','permalink':source['url'],'chunkType':'excerpt','pageSha256':source['verifiedSha256']}
            assert chunk['id'] not in chunks;chunks[chunk['id']]=chunk
    claims=[]
    for original in approved['claims']:
        claim={**original,'origin':'ai','status':'draft','generatedBy':'codex','generatedAt':'2026-09-11'}
        chunk=chunks[claim['citesChunk']]
        assert claim['fromSource']==chunk['sourceId']
        assert claim['quote'] in chunk['text']
        errors=[];assert V.check_shape(claim,0,'regional-cities-163',errors),errors
        claims.append(claim)
    by_claim={c['id']:c for c in claims}
    assert len(by_claim)==len(claims)
    for scene in approved['scenes']:
        assert scene['kind']=='settlement'
        assert isinstance(scene['startYear'],int) and isinstance(scene['endYear'],int)
        assert scene['startYear']!=0 and scene['endYear']!=0 and scene['startYear']<=scene['endYear']
        for cid in scene['dateClaimIds']+scene['actionClaimIds']+scene['place']['claimIds']:assert cid in by_claim,cid
        assert scene['place']['precision']=='area'
    return sources,chunks,claims

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--approved',type=Path,required=True)
    ap.add_argument('--raw-dir',type=Path,required=True);ap.add_argument('--write',action='store_true')
    args=ap.parse_args();approved=json.loads(args.approved.read_text(encoding='utf-8'))
    sources,chunks,claims=normalize(approved,args.raw_dir)
    outputs={}
    for source in sources.values():
        key=source['id'].removeprefix('src-')
        meta={'type':'Source','id':source['id'],'label':source['title'],'sourceKind':'기관 해설의 짧은 발췌',
              'sourceGroup':source['publisher'],'compiler':source['publisher'],'resource':source['url'],
              'defaultLens':True,'originalLanguage':'ko','license':'short-excerpt-only','status':'draft',
              'verified':None,'accessed':'2026-09-11','pageSha256':source['verifiedSha256']}
        outputs[ROOT/'data/sources'/(key+'.md')]=markdown(meta,'지방 도시의 기록된 활동 기간과 당시 이름을 위한 기관 해설 발췌다. 도시의 전체 존속 기간이나 실제 건물 배치를 뜻하지 않는다.')
        rows=[c for c in chunks.values() if c['sourceId']==source['id']]
        outputs[ROOT/'data/sources'/key/'chunks.jsonl']=''.join(json.dumps(r,ensure_ascii=False)+'\n' for r in rows)
        for chunk in rows:
            selected=[c for c in claims if c['citesChunk']==chunk['id']]
            outputs[ROOT/'data/claims'/key/(chunk['id']+'.md')]=markdown({'type':'Claims','source':source['id'],'chunk':chunk['id'],'generated':'codex','status':'draft'},'```claims-json\n'+json.dumps(selected,ensure_ascii=False,indent=2)+'\n```')
    for entity in approved['entities']:
        outputs[ROOT/'data/entities'/entity['type'].lower()/(entity['id']+'.md')]=markdown(entity,'인용한 주장과 연결하기 위한 이름 항목이다. 시기와 장소는 개별 근거를 따른다.')
    outputs[ROOT/'services/host/app/historical-regions.json']=json.dumps({'sources':list(sources.values()),'scenes':approved['scenes'],'missing':approved.get('missing',[]),'capitalCorrections':approved.get('capitalCorrections',[])},ensure_ascii=False,indent=2)+'\n'
    if args.write:
        for path,text in outputs.items():
            if path.exists() and path.name!='historical-regions.json':assert path.read_text(encoding='utf-8')==text,('existing file differs',str(path))
        for path,text in outputs.items():path.parent.mkdir(parents=True,exist_ok=True);path.write_text(text,encoding='utf-8')
    print(json.dumps({'sources':len(sources),'chunks':len(chunks),'claims':len(claims),'scenes':len(approved['scenes']),'files':len(outputs),'written':args.write}))

if __name__=='__main__':main()
