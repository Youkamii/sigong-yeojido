"""Import the saved ten-annals extract, checking every quote against supplied raw chunks."""
import argparse
from collections import Counter, defaultdict
import json
from pathlib import Path
import shutil
from import_location_research import markdown, write_same


def main():
    ap=argparse.ArgumentParser();ap.add_argument('--research',type=Path,required=True)
    ap.add_argument('--data',type=Path,default=Path('data'));ap.add_argument('--out',type=Path,required=True)
    args=ap.parse_args();folder=args.research
    run=json.loads((folder/'run.json').read_text(encoding='utf-8'))
    assert 'claude-opus-5' in run['modelsObserved'] and run['effort']=='max'
    interrupted=bool(run.get('isError'))
    if interrupted:assert 'session limit' in (folder/'result.txt').read_text(encoding='utf-8').lower()
    else:assert run['exitCode']==0
    research=json.loads((folder/'result.json').read_text(encoding='utf-8'))
    corpus=json.loads((folder/'input.json').read_text(encoding='utf-8'))
    chunks={c['id']:c for s in corpus for c in s['chunks']}
    entities={e['id']:e for e in research['entities']}
    source_ids={s['source']['id'] for s in corpus}
    assert len(source_ids)==10 and {c['sourceId'] for c in research['claims']}==source_ids
    records=[];used=set();samples=defaultdict(dict);mapping=[]
    sons={'isFifthSonOf','isEldestSonOf','isOnlySonOf','isSecondSonOf','isSonOf'}
    for draft in research['claims']:
        row=chunks[draft['citesChunk']]
        assert row['sourceId']==draft['sourceId'] and draft['quote'] in row['text'],draft['id']
        samples[row['sourceId']][row['id']]=row
        created=[]
        def add(subject,predicate,obj,suffix='',note=''):
            cid=draft['id'].replace('clm-','claim-joseon-coverage-',1)+suffix
            used.add(subject)
            if obj['kind']=='entity':used.add(obj['id'])
            records.append({'id':cid,'subject':subject,'predicate':'syj:'+predicate,'object':obj,
                'fromSource':row['sourceId'],'citesChunk':row['id'],'quote':draft['quote'],
                'origin':'ai','status':'draft','generatedBy':'claude-opus-5','generatedAt':'2026-09-07',
                'note':'이 사료의 해당 본문에 기록된 관계를 옮긴 AI 초안이다. 다른 사료의 같은 이름과 자동 병합하지 않는다. '+note+
                    '\n기사 날짜 메타데이터(본문 날짜로 인용하거나 새로 환산하지 않음): '+json.dumps(row.get('date'),ensure_ascii=False)})
            created.append(cid)
        obj=draft['object'];predicate=draft['predicate'];subject=draft['subject']
        if obj['kind']=='entity':
            if predicate in sons:
                predicate='childOf'
                note='차례·친속의 원 표기는 인용문에 남긴다. 一子를 외아들이라고 단정하지 않는다.'
            else:note=''
            if draft['id']=='clm-wea-002':
                obj={'kind':'entity','id':'ent-wea-munjong'}
                note+=' 王世子를 문종으로 읽은 것은 총서의 서술 대상에 따른 AI 해석이다. 해당 문장에는 휘가 병기되지 않았다.'
            if draft['id']=='clm-wua-002':
                subject='ent-wua-yeongjo'
                note+=' 王世弟를 영조로 읽은 것은 사료 귀속과 총서에 따른 AI 해석이다. 해당 문장에는 휘가 병기되지 않았다.'
            if draft['id']=='clm-wpa-001':
                note+=' 上을 인조로 읽은 것은 인조실록의 즉위 기사라는 사료 귀속에 따른 AI 해석이다. 인용문에는 휘가 병기되지 않았다.'
            add(subject,predicate,obj,note=note)
        elif obj['kind']=='entityList':
            ids=obj['ids']
            if predicate=='titleChangedInSequence':
                for i,eid in enumerate(ids,1):add(subject,'hasTitle',{'kind':'entity','id':eid},f'-title-{i}',f'이 본문의 개봉 순서 {i}/{len(ids)}.')
                for i,(left,right) in enumerate(zip(ids,ids[1:]),1):
                    add(left,'before',{'kind':'entity','id':right},f'-order-{i}','세조실록 이 본문에서 세조의 봉호가 바뀐 상대 순서다. 봉호 전체의 창설 순서가 아니다.')
            elif predicate=='isSonOfByBirthAndByCommandedSuccession':
                assert len(ids)==2
                add(subject,'childOf',{'kind':'entity','id':ids[0]},'-birth','본문의 莊獻世子之子라는 생부 계보다.')
                add(subject,'hasFatherByCommandedSuccession',{'kind':'entity','id':ids[1]},'-succession','본문의 以英宗命爲眞宗大王之子라는 명에 따른 계승 관계다. 생부 계보와 합치지 않는다.')
            else:
                assert predicate in ('hasSons','associatesWith','initiatedBy','conspiresWith'),predicate
                for i,eid in enumerate(ids,1):add(subject,'parentOf' if predicate=='hasSons' else predicate,{'kind':'entity','id':eid},f'-{i}')
        elif obj['kind']=='roleAssignments':
            assert predicate in ('hasParticipantsWithOffice','hasAppointees')
            for i,item in enumerate(obj['items'],1):
                person,role=item['personId'],item['roleId']
                add(subject,'hasAppointee' if predicate=='hasAppointees' else 'hasParticipant',{'kind':'entity','id':person},f'-person-{i}')
                add(person,'appointedTo' if predicate=='hasAppointees' else 'hasTitle',{'kind':'entity','id':role},f'-role-{i}',
                    '같은 인용문과 사건의 인물·직함 쌍이다. 봉호와 실제 관직을 같은 종류로 바꾸지 않으며, 임기 전체를 추정하지 않는다.')
        else:raise ValueError('unsupported saved object kind: '+obj['kind'])
        mapping.append({'draft':draft['id'],'source':row['sourceId'],'chunk':row['id'],'quoteExact':True,'claims':created})
    assert len({c['id'] for c in records})==len(records)
    for eid in sorted(used):
        e=entities[eid];fields={k:e[k] for k in ('id','label','labelHanja') if k in e}
        kind='office' if e['type']=='title' else e['type']
        fields['type']=kind.capitalize()
        note='해당 실록 안의 원문 표기용 엔티티다. 다른 사료의 같은 이름이나 서로 다른 지칭과 자동 병합하지 않는다.'
        if e['type']=='title':
            fields['roleKind']='title'
            note+=' 스키마의 관직·지위(Office)에 포함한 봉호·지위 표기다. 실제 관직으로 바꿔 읽지 않는다.'
        write_same(args.data/'entities'/kind/(eid+'.md'),markdown(fields,note))
    for sid,rows in samples.items():
        write_same(args.data/'sources'/sid.removeprefix('src-')/'citation-chunks.jsonl',
            ''.join(json.dumps(row,ensure_ascii=False,sort_keys=True)+'\n' for _,row in sorted(rows.items())))
    grouped=defaultdict(list)
    for c in records:grouped[(c['fromSource'],c['citesChunk'])].append(c)
    for (sid,chunk),group in grouped.items():
        write_same(args.data/'claims'/sid.removeprefix('src-')/(chunk+'.md'),markdown(
            {'type':'Claims','source':sid,'chunk':chunk,'status':'draft','generated_by':'claude-opus-5'},
            '```claims-json\n'+json.dumps(group,ensure_ascii=False,indent=2)+'\n```'))
    raw=args.data/'research/joseon-coverage-51';raw.mkdir(parents=True,exist_ok=True)
    for name in ('result.json','run.json','result.txt','progress.json'):shutil.copyfile(folder/name,raw/name)
    report={'researchInterruptedBySessionLimit':interrupted,'savedDrafts':len(mapping),'claims':len(records),
        'sampleChunks':sum(map(len,samples.values())),'entities':len(used),'bySource':dict(Counter(c['fromSource'] for c in records)),
        'quoteExact':True,'rawChunkObjectsPreserved':True,'calendarConversion':'not performed','humanReviewed':False,
        'mapping':mapping,'adaptations':['목록과 인물·직함 쌍을 원자 주장으로 나눔','자식 관계의 차례는 인용문에 보존하고 一子를 외아들로 확정하지 않음',
        '봉호 순서는 hasTitle와 before로 보존','생부와 명에 따른 계승 관계 분리','초안 note의 부수 주장은 원 연구 파일에만 보존']}
    args.out.parent.mkdir(parents=True,exist_ok=True);args.out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({k:v for k,v in report.items() if k not in ('mapping','adaptations')},ensure_ascii=False))


if __name__=='__main__':main()
