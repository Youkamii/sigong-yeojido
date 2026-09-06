"""Import completed Opus extracts and exact copies of their remote corpus chunks."""
import argparse
import json
from pathlib import Path
import shutil
from import_location_research import markdown,write_same

PREDICATES={
 'clm-waa-01-taejo-enthronement':'enthronedAt',
 'clm-waa-02-gamnokguksa':'orderedAppointmentTo',
 'clm-waa-03-gwonseoguksa-retire':'reportedRetirement',
 'clm-wda-04-eonmun-28':'created',
 'clm-wda-05-jeonginji-gyehae':'described',
 'clm-wda-06-chwijae':'receivedDirective',
 'clm-wna-07-garipo':'reported',
 'clm-wna-08-hyeonso-jiro':'stated',
 'clm-wna-09-obal':'requested',
 'clm-wza-10-gimucheo-location':'assignedOfficeNear',
 'clm-wza-11-gimucheo-in-uijeongbu':'proposedPost',
 'clm-wza-12-gaeguk-giyeon':'proposed',
}


def main():
    ap=argparse.ArgumentParser();ap.add_argument('--research',type=Path,required=True)
    ap.add_argument('--data',type=Path,default=Path('data'));ap.add_argument('--out',type=Path,required=True);args=ap.parse_args()
    folder=args.research;data=args.data;run=json.loads((folder/'run.json').read_text(encoding='utf-8'))
    assert run.get('exitCode')==0 and not run.get('isError') and 'claude-opus-5' in run['modelsObserved']
    research=json.loads((folder/'result.json').read_text(encoding='utf-8'))
    corpus=json.loads((folder/'chunks.json').read_text(encoding='utf-8'))
    chunks={c['id']:c for source in corpus for c in source['chunks']}
    entities={e['id']:e for e in research['entities']}
    used=set();samples={};grouped={};report=[]
    for draft in research['claims']:
        row=chunks[draft['chunkId']];assert row['sourceId']==draft['sourceId']
        assert draft['quote'] in row['text'],draft['id']
        assert draft['id'] in PREDICATES
        cid=draft['id'].replace('clm-','claim-joseon-',1)
        note=draft['predicate']+'\n'+'\n'.join(draft.get('limits',[]))
        note+='\n기사 날짜·인용 안 시점(환산하지 않음): '+json.dumps(draft['dateContext'],ensure_ascii=False)
        record={'id':cid,'subject':draft['subject'],'predicate':'syj:'+PREDICATES[draft['id']],
                'object':{'kind':'entity','id':draft['object']},'fromSource':row['sourceId'],'citesChunk':row['id'],
                'quote':draft['quote'],'origin':'ai','status':'draft','generatedBy':'claude-opus-5','generatedAt':'2026-09-06','note':note}
        used.update((draft['subject'],draft['object']));samples.setdefault(row['sourceId'],{})[row['id']]=row
        grouped.setdefault((row['sourceId'],row['id']),[]).append(record)
        report.append({'claim':cid,'source':row['sourceId'],'chunk':row['id'],'quoteExact':True,'predicateDraft':draft['predicate'],'predicate':record['predicate']})
    for eid in sorted(used):
        e=entities[eid];path=data/'entities'/e['type'].lower()/(eid+'.md')
        if not path.exists():
            write_same(path,markdown({k:e[k] for k in ('type','id','label','labelHanja') if k in e},
                       '원문을 가리키기 위한 이름이다. '+e.get('note','')+' 다른 사료의 인물·관서와 자동으로 합치지 않는다.'))
    for sid,rows in samples.items():
        write_same(data/'sources'/sid.removeprefix('src-')/'citation-chunks.jsonl',
                   ''.join(json.dumps(row,ensure_ascii=False,sort_keys=True)+'\n' for _,row in sorted(rows.items())))
    for (sid,chunk),records in grouped.items():
        write_same(data/'claims'/sid.removeprefix('src-')/(chunk+'.md'),markdown(
                   {'type':'Claims','source':sid,'chunk':chunk,'status':'draft','generated_by':'claude-opus-5'},
                   '```claims-json\n'+json.dumps(records,ensure_ascii=False,indent=2)+'\n```'))
    raw=data/'research/joseon-claims-51';raw.mkdir(parents=True,exist_ok=True)
    for name in ('result.json','run.json'):shutil.copyfile(folder/name,raw/name)
    args.out.parent.mkdir(parents=True,exist_ok=True)
    args.out.write_text(json.dumps({'claims':report,'sources':sorted(samples),'sampleChunks':sum(len(rows) for rows in samples.values()),
                                   'humanReviewed':False,'calendarConversion':'not performed'},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'claims':len(report),'sources':len(samples),'sampleChunks':sum(len(rows) for rows in samples.values())}))


if __name__=='__main__':main()
