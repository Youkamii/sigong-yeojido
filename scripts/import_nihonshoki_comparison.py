"""Integrate completed comparison research, checking every adopted passage in actual text."""
import argparse
from hashlib import sha256
import json
from pathlib import Path
import re
import shutil
from import_location_research import markdown,write_same


def main():
    ap=argparse.ArgumentParser();ap.add_argument('--research',type=Path,required=True)
    ap.add_argument('--conversion-research',type=Path,required=True);ap.add_argument('--cache',type=Path,required=True)
    ap.add_argument('--checks',type=Path,required=True);ap.add_argument('--data',type=Path,default=Path('data'))
    ap.add_argument('--out',type=Path,required=True);args=ap.parse_args();data=args.data
    for folder in (args.research,args.conversion_research):
        run=json.loads((folder/'run.json').read_text(encoding='utf-8'))
        assert run['exitCode']==0 and not run['isError'] and 'claude-opus-5' in run['modelsObserved']
    research=json.loads((args.research/'result.json').read_text(encoding='utf-8'))
    conversion=json.loads((args.conversion_research/'result.json').read_text(encoding='utf-8'))
    sources={s.get('sourceId',s.get('id')):s for s in research['sources']+conversion['sources']}
    pages={p['url']:p for p in json.loads(args.checks.read_text(encoding='utf-8'))['pages']}
    chunks={};claims=[];checks=[]
    def page(sid):
        source=sources[sid];key=sha256(source['url'].encode()).hexdigest()
        assert sha256((args.cache/(key+'.html')).read_bytes()).hexdigest()==pages[source['url']]['sha256']
        return source,(args.cache/(key+'.txt')).read_text(encoding='utf-8')
    def chunk(sid,slug,text,locator,kind='excerpt',**extra):
        source,full=page(sid)
        assert re.sub(r'\s+','',text) in re.sub(r'\s+','',full),slug
        row={'id':'chunk_'+slug,'sourceId':sid,'text':text,'title':source.get('label',source.get('title')),
             'locator':locator,'permalink':source['url'],'lang':source['lang'],'date':None,'chunkType':kind,
             'annotations':[],'pageSha256':pages[source['url']]['sha256'],**extra}
        chunks.setdefault(sid,[]).append(row);checks.append({'chunk':row['id'],'pageSha256':row['pageSha256'],'quoteVerified':True})
        return row
    def claim(cid,subject,predicate,obj,row,note):
        rec={'id':cid,'subject':subject,'predicate':'syj:'+predicate,'object':obj,'fromSource':row['sourceId'],
             'citesChunk':row['id'],'quote':row['text'],'origin':'ai','status':'draft','generatedBy':'claude-opus-5',
             'generatedAt':'2026-09-06','note':note}
        claims.append(rec);return rec
    def entity(eid,kind,label,han=None):
        path=data/'entities'/kind.lower()/(eid+'.md')
        if not path.exists():write_same(path,markdown({'type':kind,'id':eid,'label':label,**({'labelHanja':han} if han else {})},
            '사료별 서술을 구별하는 이름이다. 다른 사료와의 동일성은 출처가 있는 Claim으로만 연결한다.'))
    sg_person='person-asinwang-sg';ns_person='person-ahwawang-ns'
    sg_event='event-baekje-asinwang-death-sg';ns_event='event-baekje-ahwawang-death-ns'
    entity(sg_person,'Person','아신왕 (삼국사기)','阿莘王');entity(ns_person,'Person','아화왕 (일본서기)','阿花王')
    entity(sg_event,'Event','아신왕 사망 (삼국사기)');entity(ns_event,'Event','아화왕 사망 (일본서기)')
    rows={r['id']:r for r in map(json.loads,(data/'sources/samguksagi/chunks.jsonl').read_text(encoding='utf-8').splitlines())}
    sg=rows['chunk_samguksagi_sg_025_0030_0250']
    assert sg['text']=='秋九月, 王薨.' and sg['date']['label']=='14년 9월' and '阿莘王' in sg['locator']
    assert rows['chunk_samguksagi_sg_025_0030_0240']['text'].startswith('十四年,')
    a=claim('claim-asin-death-sg-date',sg_event,'occurredIn',{'kind':'time','id':'ts-asin-death-sg','verbatim':'秋九月','precision':'month'},sg,
        '본문에는 가을 9월만 있다. 같은 왕조의 앞 기사 sg_025_0030_0240에 十四年이 있고, 국편은 이 기사의 날짜를 14년 9월로 붙였다. L0·99를 달력 날짜로 풀지 않는다. 405년은 현대 해설 출처를 별도로 켰을 때만 표시한다.')
    claim('claim-asin-death-sg-person',sg_event,'deathOf',{'kind':'entity','id':sg_person},sg,'왕의 이름은 阿莘王 조목·기사 제목 문맥에 따른다.')
    nsid='src-web-seisaku-nihonshoki-10';ns_source,ns_text=page(nsid)
    death=next(e['text'] for e in ns_source['excerpts'] if e['id']=='ex-ns10-ojin16-ahwa')
    end=ns_text.index(death)+len(death);start=ns_text.rfind('十六年',0,end)
    assert 0<end-start<150
    ns=chunk(nsid,'ns10-ojin16-death',ns_text[start:end],'日本書紀 巻第十 応神天皇 › 十六年 › 是歲')
    b=claim('claim-ahwa-death-ns-date',ns_event,'occurredIn',{'kind':'time','id':'ts-ahwa-death-ns','verbatim':'十六年','precision':'year'},ns,
        '왕인 기사로 시작하는 16년 문단 안의 是歲에 아화왕의 죽음이 나온다. 죽은 달을 봄 2월로 보지 않는다. 원문에는 서기가 없다. 285는 일본 전통 기년 대조 자료의 값이며 실제 사망 연도를 확정하지 않는다.')
    participant=claim('claim-ahwa-death-ns-person',ns_event,'deathOf',{'kind':'entity','id':ns_person},ns,'원문이 백제 阿花王의 죽음을 적는다.');participant['quote']=death
    encid='src-web-encykorea-asinwang';enc_source,enc_text=page(encid)
    match=re.search(r'사망 연도\s*405년',enc_text);assert match
    enc=chunk(encid,'encykorea-asin-death-metadata',match.group(),'아신왕 › 사망 연도 필드','editorial-metadata')
    claim('claim-asin-death-to-405-encykorea','ts-asin-death-sg','convertsTo',{'kind':'year','value':405},enc,
        '현대 기관 해설의 아신왕 사망 연도 필드다. 삼국사기 본문에 405가 적혀 있다는 뜻이 아니다. 생년·정확한 월일·칭원법은 보충하지 않는다.')
    jaid='src-web-jawikipedia-asinwang';ja_source,_=page(jaid)
    identity=next(e for e in ja_source['excerpts'] if e['id']=='ex-jawp-asin-ahwa')
    ja=chunk(jaid,'jawp-asin-ahwa-identity',identity['text'],identity['locator'])
    ident=claim('claim-asin-ahwa-identity-jawp',sg_person,'sameEntityAs',{'kind':'entity','id':ns_person},ja,
        '3차 자료인 위키백과의 아신왕 항목이 일본서기의 阿花王 표기를 직접 연결한다. 기관·학술 원서 대조는 미완료이며 두 엔티티를 병합하지 않는다.')
    link=claim('claim-asin-ahwa-death-same-event',ns_event,'sameEventAs',{'kind':'entity','id':sg_event},ja,
        'AI 추론 연결: claim-asin-ahwa-identity-jawp의 인물 동일성, claim-asin-death-sg-person과 claim-ahwa-death-ns-person의 죽음 서술을 함께 근거로 같은 사망 사건을 비교한다. 인용문이 사건 동일성을 직접 선언한다는 뜻이 아니다. 역년 14와 16은 서로 다른 왕의 기년이므로 숫자만 비교하지 않는다.')
    cyid='src-jawp-285nen';cy_source,cy_text=page(cyid)
    assert '285年' in cy_text and '日本' in cy_text
    cy=chunk(cyid,'jawp-285-ojin16','応神天皇16年','285年 › 他の紀年法 › 日本','calendar-list-excerpt',contextTitle='285年')
    claim('claim-ahwa-death-to-285-jawp','ts-ahwa-death-ns','convertsTo',{'kind':'year','value':285},cy,
        '3차 자료의 285年 문서에 일본 기년 応神天皇16年을 병기했다. 285는 전통 기년의 서기 대응이며 현대 추정 실연대가 아니다. 별도 대조표는 日本長暦에 바탕을 둔다고 설명한다. 자료 둘은 모두 위키백과로 독립 검증이 아니다.')
    configs={nsid:('일본서기 응신기 · seisaku 전사 발췌','원사료 전사 · 판본 미상','일본서기',720,None,None),
             encid:('아신왕 사망 연도 · 민족문화대백과','현대 기관 해설 발췌','현대 연구 해설',None,405,405),
             jaid:('아신왕·아화왕 표기 · 일본어 위키백과','3차 자료 · 인물 표기','현대 해설 · 위키',None,392,405),
             cyid:('285년의 일본 기년 · 일본어 위키백과','3차 자료 · 전통 기년 대조','역법 대조',None,285,285)}
    for sid,records in chunks.items():
        src=sources[sid];label,kind,group,composed,lo,hi=configs[sid]
        write_same(data/'sources'/sid.removeprefix('src-')/'chunks.jsonl',''.join(json.dumps(r,ensure_ascii=False)+'\n' for r in records))
        write_same(data/'sources'/(sid.removeprefix('src-')+'.md'),markdown({'type':'Source','id':sid,'label':label,
            'sourceKind':kind,'sourceGroup':group,'composedYear':composed,'coversFrom':lo,'coversTo':hi,
            'compiler':src.get('author',src.get('publisher','미상')),'edition':src.get('edition','미확정'),
            'resource':src['url'],'originalLanguage':src['lang'],'defaultLens':False,'status':'draft','verified':None,
            'license':'CC-BY-SA-4.0' if sid in (jaid,cyid) else 'short-excerpt-only','accessed':'2026-09-06'},
            'Claude Opus 5 조사 후 실제 HTML과 대조한 짧은 인용만 수록했다. 전문·번역본을 확보한 것으로 세지 않는다.\n\n'+
            ('720년은 원 사서의 편찬 연도다. 현 전사본의 저본·작성자·이용조건은 미확인이다.' if sid==nsid else '기록의 원표기와 현대 해설·전통 환산표의 숫자를 구별한다.')))
    grouped={}
    for rec in claims:grouped.setdefault((rec['fromSource'],rec['citesChunk']),[]).append(rec)
    for (sid,cid),records in grouped.items():
        write_same(data/'claims'/sid.removeprefix('src-')/'comparisons'/(cid+'.md'),markdown({'type':'Claims','source':sid,'chunk':cid,
            'status':'draft','generated_by':'claude-opus-5'},'```claims-json\n'+json.dumps(records,ensure_ascii=False,indent=2)+'\n```'))
    path=data/'comparisons.json';config=json.loads(path.read_text(encoding='utf-8'))
    case={'id':'asin-ahwa-death','label':'아신왕·아화왕 사망 · 삼국사기와 일본서기',
          'description':'삼국사기 아신왕 14년 조의 秋九月과 일본서기 응신 16년의 是歲를 비교한다. 현대 해설은 사망을 405년으로 적고, 일본 전통 기년 대조표는 응신 16년을 285년에 둔다. 환산 방식이 달라 120년 차이가 나며 실제 사망을 285년으로 확정하지 않는다. 인물 표기와 두 사망 서술을 근거로 AI가 사건을 연결했다.',
          'rows':[a['id'],b['id']],'links':[{'id':c['id'],'subject':c['subject']} for c in (ident,link)],
          'sources':['src-samguksagi',*configs],'research':'cross-chronology-53-55 and ojin16-conversion-53'}
    config['cases']=[c for c in config['cases'] if c['id']!=case['id']]+[case]
    path.write_text(json.dumps(config,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    dest=data/'research/ojin16-conversion-53';dest.mkdir(parents=True,exist_ok=True)
    for name in ('result.json','run.json'):shutil.copyfile(args.conversion_research/name,dest/name)
    args.out.write_text(json.dumps({'claims':[c['id'] for c in claims],'newSources':list(configs),'chunks':checks,
        'existingSgChunk':sg['id'],'discarded':'agent-inserted ellipsis in the Wikisource quote; used actual stored NIKH passage instead',
        'years':{'modern_encyclopedia':405,'traditional_japanese_chronology':285},'humanReviewed':False},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'claims':len(claims),'sources':len(configs),'chunks':len(checks)}))


if __name__=='__main__':main()
