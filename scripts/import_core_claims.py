"""Normalize the completed Opus #51 drafts; admit only exact original quotations."""
import argparse
from collections import defaultdict
import copy
import json
from pathlib import Path
import sys

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'services'))
import validate as V

VERBATIM_FIXES={
    'claim-goguryeo-founded-samguksagi':'漢 孝元帝建昭二年, 新羅始祖赫居丗二十一年, 甲申歳',
    'claim-silla-hyeokgeose-accession-samguksagi':'前漢 孝宣帝五鳳元年甲子, 四月丙辰',
    'claim-silla-buddhism-samguksagi':'十五年',
    'claim-silla-buddhism-samgukyusa':'法興大王即位十四年, 小臣異次頓爲法滅身.” 即蕭梁普通八年丁未',
}


def main():
    ap=argparse.ArgumentParser();ap.add_argument('--research',type=Path,required=True)
    ap.add_argument('--data',type=Path,default=ROOT/'data');ap.add_argument('--out',type=Path,required=True)
    ap.add_argument('--write',action='store_true');args=ap.parse_args()
    drafts=[];shells={};runs=[]
    for name in ('ancient-claims-51','goryeo-claims-51'):
        result=json.loads((args.research/name/'result.json').read_text(encoding='utf-8'))
        run=json.loads((args.research/name/'run.json').read_text(encoding='utf-8'))
        assert run['exitCode']==0 and not run['isError'] and 'claude-opus-5' in run['modelsObserved']
        runs.append({key:run[key] for key in ('task','modelRequested','effort','modelsObserved','sessionId','seconds')})
        for claim in result['claims']:drafts.append(claim)
        for entity in result['entities']:shells.setdefault(entity['id'],entity)
    ids={c['chunkId'] for c in drafts};chunks={}
    for name in ('samguksagi','samgukyusa','goryeosa'):
        with (args.data/'sources'/name/'chunks.jsonl').open(encoding='utf-8') as stream:
            for line in stream:
                chunk=json.loads(line)
                if chunk['id'] in ids:chunks[chunk['id']]=chunk
    existing=V.load_entities(args.data/'entities',[])
    accepted=[];rejected=[];normalizations=[]
    for draft in drafts:
        cid=draft['id'];chunk=chunks.get(draft['chunkId']);reason=None
        if not chunk:reason='cited chunk missing'
        elif draft['quote'] not in chunk['text']:reason='quote is not an exact substring of chunk.text (annotations are kept separate)'
        elif draft['sourceId']!=chunk['sourceId']:reason='source mismatch'
        if reason:
            rejected.append({'id':cid,'reason':reason});continue
        raw=copy.deepcopy(draft['object']);extra={}
        if not isinstance(raw,dict):
            obj={'kind':'entity','id':raw} if raw in shells or raw in existing else {'kind':'literal','value':raw}
        elif raw['kind']=='entity':
            obj={'kind':'entity','id':raw.get('id',raw.get('value'))}
            extra={k:v for k,v in raw.items() if k not in ('id','value','kind')}
        elif raw['kind'] in ('time','timespan'):
            verbatim=VERBATIM_FIXES.get(cid,raw['verbatim'])
            if verbatim not in draft['quote']:
                rejected.append({'id':cid,'reason':'time.verbatim is not an exact substring of quote'});continue
            obj={'kind':'time','id':'ts-'+cid.removeprefix('claim-'),'verbatim':verbatim,'precision':raw['precision']}
            extra={k:v for k,v in raw.items() if k not in ('kind','verbatim','precision')}
            if verbatim!=raw['verbatim']:normalizations.append({'id':cid,'oldVerbatim':raw['verbatim'],'verbatim':verbatim,'basis':'continuous substring of the unchanged original quote'})
        else:
            obj={k:v for k,v in raw.items() if k in ('kind','value')}
            extra={k:v for k,v in raw.items() if k not in obj}
        references=[draft['subject']]+([obj['id']] if obj['kind']=='entity' else [])
        missing=[ref for ref in references if ref not in existing and ref not in shells]
        if missing:
            rejected.append({'id':cid,'reason':'entity shell missing','entities':missing});continue
        limits=draft.get('limits',draft.get('limitations',[]))
        if isinstance(limits,str):limits=[limits]
        note=' '.join(limits)
        if extra:note+=' 조사 초안의 추가 문맥: '+json.dumps(extra,ensure_ascii=False,sort_keys=True)
        predicate=draft['predicate'] if draft['predicate'].startswith('syj:') else 'syj:'+draft['predicate']
        claim={'id':cid,'subject':draft['subject'],'predicate':predicate,'object':obj,
               'fromSource':draft['sourceId'],'citesChunk':draft['chunkId'],'quote':draft['quote'],
               'origin':'ai','status':'draft','generatedBy':'claude-opus-5','generatedAt':'2026-09-06','note':note.strip()}
        errors=[]
        if not V.check_shape(claim,0,'draft',errors):
            rejected.append({'id':cid,'reason':'shape','errors':[f.message for f in errors]});continue
        accepted.append(claim)
    report={'draftCount':len(drafts),'acceptedCount':len(accepted),'acceptedIds':[c['id'] for c in accepted],
            'rejected':rejected,'normalizations':normalizations,'researchRuns':runs,
            'datePolicy':'candidate Gregorian years remain in notes; no conversion is silently inserted into the original TimeSpan',
            'humanReviewed':False,'written':args.write}
    if args.write:
        used={c['subject'] for c in accepted}|{c['object']['id'] for c in accepted if c['object']['kind']=='entity'}
        for eid in sorted(used-existing.keys()):
            shell=shells[eid]
            folder=args.data/'entities'/shell['type'].lower();folder.mkdir(exist_ok=True)
            fields={key:shell[key] for key in ('type','id','label','labelHanja') if shell.get(key)}
            text='---\n'+'\n'.join(f'{key}: {json.dumps(value,ensure_ascii=False)}' for key,value in fields.items())+'\n---\n\n'
            text+='이름을 찾기 위한 껍데기다. 시대·위치·소속·동일성은 인용한 주장으로 구분한다.\n'
            (folder/(eid+'.md')).write_text(text,encoding='utf-8')
        grouped=defaultdict(list)
        for claim in accepted:grouped[(claim['fromSource'],claim['citesChunk'])].append(claim)
        for (source,cid),claims in grouped.items():
            folder=args.data/'claims'/source.removeprefix('src-');folder.mkdir(exist_ok=True)
            file=folder/(cid+'.md')
            text=f'---\ntype: Claims\nsource: {source}\nchunk: {cid}\nstatus: draft\ngenerated_by: claude-opus-5\n---\n\n'+'```claims-json\n'+json.dumps(claims,ensure_ascii=False,indent=2)+'\n```\n'
            V.parse_claims_text(text)
            assert not file.exists() or file.read_text(encoding='utf-8')==text,f'refusing to overwrite different claims: {file}'
            file.write_text(text,encoding='utf-8')
    args.out.parent.mkdir(parents=True,exist_ok=True)
    args.out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({key:report[key] for key in ('draftCount','acceptedCount','rejected','normalizations','written')},ensure_ascii=False))


if __name__=='__main__':main()
