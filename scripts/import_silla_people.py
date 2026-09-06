"""Import verified Opus research on three Silla kings and their stated reigns."""
import argparse
import json
from pathlib import Path
import shutil
from import_location_research import markdown, write_same


def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--research',type=Path,required=True)
    ap.add_argument('--checks',type=Path,required=True)
    ap.add_argument('--data',type=Path,default=Path('data'))
    ap.add_argument('--out',type=Path,required=True)
    args=ap.parse_args(); data=args.data
    run=json.loads((args.research/'run.json').read_text(encoding='utf-8'))
    assert run['exitCode']==0 and not run['isError'] and 'claude-opus-5' in run['modelsObserved']
    research=json.loads((args.research/'result.json').read_text(encoding='utf-8'))
    checks={c['id']:c for c in json.loads(args.checks.read_text(encoding='utf-8'))['excerpts']}
    sources=[]; accepted=[]
    for source,slug,period,composed in zip(research['sources'],('jijeung','beopheung','jinheung'),((500,514),(514,540),(540,576)),(1995,1995,2021)):
        sid='src-encykorea-'+slug; pid='person-encykorea-'+slug; sources.append(sid)
        write_same(data/'entities/person'/(pid+'.md'),markdown({'type':'Person','id':pid,'label':source['title']+' (민족문화대백과)'},
            '현대 기관 해설의 인물 표기. 다른 사료의 같은 이름을 자동으로 합치지 않는다.'))
        rows=[]
        for number,ex in enumerate(source['excerpts'],1):
            check=checks[ex['id']]
            assert check['accepted'] and check['quote']==ex['text'] and check['url']==ex['url']
            rows.append({'id':f'chunk_encykorea-{slug}_{number:02}','sourceId':sid,'text':ex['text'],
                'title':source['title'],'locator':ex['locator'],'permalink':ex['url'],'lang':'ko','date':None,
                'chunkType':'excerpt','pageSha256':check['pageSha256'],'annotations':[]})
        write_same(data/'sources'/sid.removeprefix('src-')/'chunks.jsonl',''.join(json.dumps(r,ensure_ascii=False)+'\n' for r in rows))
        write_same(data/'sources'/(sid.removeprefix('src-')+'.md'),markdown({
            'type':'Source','id':sid,'label':source['title']+' · 민족문화대백과 발췌','sourceKind':'현대 기관 해설 발췌',
            'sourceGroup':'현대 연구 해설','compiler':source['author'],'composedYear':composed,
            'coversFrom':period[0],'coversTo':period[1],'edition':source['edition'],'resource':source['url'],
            'originalLanguage':'ko','defaultLens':False,'status':'draft','verified':None,
            'license':'short-excerpt-only','accessed':'2026-09-06','generated_by':'claude-opus-5'},
            source['publisher']+'\n\n짧은 인용만 수록했다. 재위 기간은 생몰년 전체와 다르다. 수정일은 판본 설명에 따로 남겼다.'))
        def claim(suffix,subject,predicate,obj,row,note):
            rec={'id':f'claim-encykorea-{slug}-{suffix}','subject':subject,'predicate':'syj:'+predicate,'object':obj,
                 'fromSource':sid,'citesChunk':row['id'],'quote':row['text'],'origin':'ai','status':'draft',
                 'generatedBy':'claude-opus-5','generatedAt':'2026-09-06','note':note}
            accepted.append(rec);return rec
        reign=source['excerpts'][0]['text']
        raw=('500년~514년','514년~540년','540~576')[('jijeung','beopheung','jinheung').index(slug)]
        assert raw in reign
        records=[claim('polity',pid,'isKingOf',{'kind':'entity','id':'polity-silla'},rows[0],'현대 해설이 직접 적은 소속.'),
                 claim('reign',pid,'reignedIn',{'kind':'time','id':'ts-encykorea-'+slug+'-reign','verbatim':raw,
                     'precision':'year','earliest':period[0],'latest':period[1],'calendar':'source-year-number'},rows[0],
                     '직접 적힌 재위 기간만 보존한다. 생몰년을 보충하거나 질의 구간과의 겹침을 별도 역사 사실로 저장하지 않는다.')]
        if slug=='jinheung':
            names=(('sammaekjong','삼맥종','彡麥宗'),('simmaekbu','심맥부','深麥夫'))
            for name,label,han in names:
                write_same(data/'entities/person'/('person-encykorea-'+name+'.md'),markdown({
                    'type':'Person','id':'person-encykorea-'+name,'label':label,'labelHanja':han},
                    '백과사전의 진흥왕 항목에 나온 표기. 동일성은 인용이 붙은 Claim으로만 연결한다.'))
            records.append(claim('name-identity','person-encykorea-sammaekjong','sameEntityAs',
                {'kind':'entity','id':'person-encykorea-simmaekbu'},rows[1],
                '한 문장이 진흥왕의 이름으로 두 표기를 연결한다. 본명·이칭의 우열을 정하거나 owl:sameAs로 합치지 않는다.'))
        for row in rows:
            group=[c for c in records if c['citesChunk']==row['id']]
            write_same(data/'claims'/sid.removeprefix('src-')/(row['id']+'.md'),markdown({
                'type':'Claims','source':sid,'chunk':row['id'],'status':'draft','generated_by':'claude-opus-5'},
                '```claims-json\n'+json.dumps(group,ensure_ascii=False,indent=2)+'\n```'))
    config_path=data/'lenses.json'; config=json.loads(config_path.read_text(encoding='utf-8'))
    lens={'id':'silla-sixth-century','label':'6세기 신라 인물 · 기관 해설','sources':sources,'year':540,
          'description':'백과사전 세 항목의 신라 소속과 재위 기간. 6세기는 501~600년으로 질의하며 생몰년 전체를 추정하지 않는다.'}
    config['lenses']=[item for item in config['lenses'] if item['id']!=lens['id']]+[lens]
    config_path.write_text(json.dumps(config,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    dest=data/'research/silla-sixth-century-51'; dest.mkdir(parents=True,exist_ok=True)
    for name in ('result.json','run.json'):shutil.copyfile(args.research/name,dest/name)
    args.out.write_text(json.dumps({'claims':[c['id'] for c in accepted],'sources':sources,'chunks':4,
        'withheldDrafts':['C3','C6','C9'],'humanReviewed':False,'scope':'three cited examples, not an exhaustive historical population'},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'claims':len(accepted),'sources':len(sources),'chunks':4}))


if __name__=='__main__':main()
