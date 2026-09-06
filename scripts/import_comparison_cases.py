"""Turn the completed cross-source textual comparison into cited event links."""
import copy
import json
from pathlib import Path
import sys

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'services'))
import validate as V
from import_location_research import markdown,write_same


def main():
    data=ROOT/'data';inputs=V.load_inputs(data)
    assert not inputs.failures
    existing={c['id']:c for d in inputs.docs for c in d.claims}
    cases=[];new=[]
    def event(cid,eid,label,verbatim=None):
        old=existing[cid]
        claim=copy.deepcopy(old);claim['id']='claim-'+eid.removeprefix('event-')+'-date';claim['subject']=eid
        claim['predicate']='syj:occurredIn'
        if verbatim:
            claim['object']={'kind':'time','id':'ts-'+eid.removeprefix('event-'),'verbatim':verbatim,'precision':'year'}
        assert claim['object']['verbatim'] in claim['quote']
        write_same(data/'entities'/'event'/(eid+'.md'),markdown({'type':'Event','id':eid,'label':label},
                   '사료별 사건 서술을 구별하기 위한 이름이다. 다른 사료의 사건과 연결하는 근거는 sameEventAs 주장으로 둔다.'))
        new.append(claim)
        return claim
    def link(cid,subject,target,row,quote,note):
        assert quote in inputs.chunks[row['citesChunk']]['text']
        rec={'id':cid,'subject':subject['subject'],'predicate':'syj:sameEventAs','object':{'kind':'entity','id':target['subject']},
             'fromSource':row['fromSource'],'citesChunk':row['citesChunk'],'quote':quote,'origin':'ai','status':'draft',
             'generatedBy':'claude-opus-5','generatedAt':'2026-09-06','note':note}
        new.append(rec);return rec
    a=event('claim-baekje-founded-hongga3-samguksagi','event-baekje-founding-sg','백제 건국 (삼국사기 온조왕조)')
    b=event('claim-baekje-onjo-samgukyusa','event-baekje-founding-sy-nambuyeo','백제 건국 (삼국유사 남부여조)')
    c=event('claim-baekje-onjo-hongga4-samgukyusa','event-baekje-founding-sy-byeonhan','백제 건국 (삼국유사 변한백제조)')
    ab=link('claim-baekje-founding-sy-nambuyeo-quotes-sg',b,a,b,'史本記云. “百濟始祖 温祚, 其父雛牟王, 或云朱蒙.',
            '완료된 Opus 문면 대조 se-baekje-founding-cross-source. 명시적 본기 인용과 온조·십제·홍가 연호 문맥을 근거로 사건을 연결한다. 독립 사료의 일치로 세지 않는다.')
    ac=link('claim-baekje-founding-sy-byeonhan-refers-sg',c,a,c,c['quote'],
            '按夲紀와 온조 건국 문맥에 따른 사건 연결이다. 이 本紀가 현전 삼국사기와 같은 판본이라는 판정은 아니다. 서로 다른 연호·간지 값은 보존한다.')
    cases.append({'id':'baekje-founding','label':'백제 건국 · 삼국사기와 삼국유사 두 조목',
                  'description':'같은 온조 건국을 가리키는 본기 인용과 문맥을 근거로 비교한다. 鴻嘉三年·鴻佳三年·鴻嘉四年甲辰을 그대로 남긴다.',
                  'rows':[r['id'] for r in (a,b,c)],'links':[{'id':r['id'],'subject':r['subject']} for r in (ab,ac)],
                  'sources':['src-samguksagi','src-samgukyusa'],'research':'se-baekje-founding-cross-source'})
    a=event('claim-baekje-sabi-move-samguksagi','event-sabi-transfer-sg','사비 천도 (삼국사기 성왕조)','十六年, 春')
    b=event('claim-baekje-sabi-move-samgukyusa','event-sabi-transfer-sy','사비 천도 (삼국유사의 삼국사기 인용)','百濟聖王二十六年戊午春')
    linked=link('claim-sabi-transfer-sy-quotes-sg',b,a,b,b['quote'],
                '按三國史記라는 명시적 출처와 移都·國號南扶餘 문맥을 근거로 연결한다. 十六年/二十六年戊午 차이와 泗沘/泗泚 차이는 고치지 않는다.')
    cases.append({'id':'sabi-transfer','label':'사비 천도 · 성왕 16년과 26년',
                  'description':'삼국유사는 삼국사기를 인용한다고 밝히지만 기년을 다르게 적는다. 원문의 차이를 현재 서기 연도로 맞추지 않는다.',
                  'rows':[a['id'],b['id']],'links':[{'id':linked['id'],'subject':linked['subject']}],
                  'sources':['src-samguksagi','src-samgukyusa'],'research':'se-sabi-transfer'})
    grouped={}
    for claim in new:grouped.setdefault((claim['fromSource'],claim['citesChunk']),[]).append(claim)
    for (source,cid),claims in grouped.items():
        # Add a separate file; do not alter the already digested original extraction.
        fields={'type':'Claims','source':source,'chunk':cid,'status':'draft','generated_by':'claude-opus-5'}
        write_same(data/'claims'/source.removeprefix('src-')/'comparisons'/(cid+'.md'),
                   markdown(fields,'```claims-json\n'+json.dumps(claims,ensure_ascii=False,indent=2)+'\n```'))
    write_same(data/'comparisons.json',json.dumps({'cases':cases},ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'newClaims':len(new),'cases':len(cases),'humanReviewed':False}))


if __name__=='__main__':main()
