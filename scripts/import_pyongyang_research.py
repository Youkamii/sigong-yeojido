"""Keep cited city, fortress and name evidence at their stated geographic scope."""
import argparse
from collections import defaultdict
import json
from pathlib import Path
import shutil
from import_location_research import markdown,write_same


def main():
    ap=argparse.ArgumentParser();ap.add_argument('--research',type=Path,required=True)
    ap.add_argument('--checks',type=Path,required=True);ap.add_argument('--data',type=Path,default=Path('data'))
    ap.add_argument('--out',type=Path,required=True);args=ap.parse_args();data=args.data
    research=json.loads((args.research/'result.json').read_text(encoding='utf-8'))
    run=json.loads((args.research/'run.json').read_text(encoding='utf-8'))
    assert run['exitCode']==0 and not run['isError'] and 'claude-opus-5' in run['modelsObserved']
    checks={c['id']:c for c in json.loads(args.checks.read_text(encoding='utf-8'))['excerpts']}
    rows={};claims=[]
    for source in research['sources']:
        sid=source['id'];source_rows=[]
        for ex in source['excerpts']:
            check=checks[ex['id']]
            assert check['accepted'] and check['quote']==ex['text'] and check['url']==ex['url']
            row={'id':'chunk_pyongyang_'+ex['id'],'sourceId':sid,'text':ex['text'],'title':source['title'],
                'locator':ex['locator'],'permalink':ex['url'],'lang':'ko','date':None,'chunkType':'excerpt',
                'annotations':[],'pageSha256':check['pageSha256']}
            rows[ex['id']]=row;source_rows.append(row)
        write_same(data/'sources'/sid.removeprefix('src-')/'chunks.jsonl',''.join(json.dumps(r,ensure_ascii=False)+'\n' for r in source_rows))
        write_same(data/'sources'/(sid.removeprefix('src-')+'.md'),markdown({'type':'Source','id':sid,'label':source['title'],
            'sourceKind':source['sourceKind'],'sourceGroup':'현대 위치 연구','compiler':source['author'],
            'composedYear':2019 if sid=='src-kci-kwon2019' else None,'coversFrom':None,'coversTo':None,
            'edition':source['edition'],'resource':source['url'],'originalLanguage':'ko','defaultLens':False,
            'license':'short-excerpt-only','status':'draft','verified':None,'accessed':'2026-09-06'},
            source['publisher']+'\n\n짧은 인용만 수록했다. '+source['terms']+
            '\n\n도시·지역·성곽을 구별한다. 광개토왕비 平穰과 다른 사료 平壤의 동일성을 이 자료로 확정하지 않는다.'+
            ('\n\n[출처 : 평양성 - 한국민족문화대백과사전]' if sid=='src-encykorea-pyongyangseong' else '')))
    labels={
        'nahf-early-pyongyang':'전기 평양성 (동북아역사재단 해설)',
        'nahf-late-pyongyang':'후기 평양성·장안성 (동북아역사재단 해설)',
        'nahf-pyongyang-area':'평양지역 (동북아역사재단 해설의 지역)',
        'nahf-modern-pyongyang-city':'현재 평양 시가 (동북아역사재단 해설)',
        'kwon2019-pre313-pyongyang':'313년 이전 평양 (권순홍 2019의 비정)',
        'kwon2019-post313-pyongyang':'313년 이후 평양 (권순홍 2019의 비정)',
        'encykorea-pyongyangseong':'평양성 (민족문화대백과)',
        'encykorea-modern-pyongyang-city':'북한 평양직할시 (평양성 항목의 소재 지역)'}
    for suffix,label in labels.items():
        write_same(data/'entities/place'/('place-'+suffix+'.md'),markdown({'type':'Place','id':'place-'+suffix,'label':label},
            '해당 자료가 구별하는 장소의 껍데기다. 같은 이름의 다른 자료 Place와 자동 병합하지 않는다. 좌표는 미상이다.'))
    def claim(suffix,subject,predicate,target,ex,note,literal=False):
        row=rows[ex];claims.append({'id':'claim-pyongyang-'+suffix,'subject':'place-'+subject,'predicate':'syj:'+predicate,
            'object':{'kind':'literal','value':target} if literal else {'kind':'entity','id':'place-'+target},
            'fromSource':row['sourceId'],'citesChunk':row['id'],'quote':row['text'],'origin':'ai','status':'draft',
            'generatedBy':'claude-opus-5','generatedAt':'2026-09-06','note':note})
    for period in ('early','late'):
        claim(period+'-area','nahf-'+period+'-pyongyang','locatedIn','nahf-pyongyang-area','ex-nahf-1',
            '같은 지역에 있는 두 도성이라는 설명이다. 같은 성곽·동일 좌표라는 뜻으로 넓히지 않는다.')
    claim('changansong-surrounds','nahf-late-pyongyang','surrounds','nahf-modern-pyongyang-city','ex-nahf-2',
        '장안성이 현대 시가를 둘러싼다는 관계만 기록한다. 성곽과 도시 전체를 sameEntityAs로 합치지 않는다.')
    claim('kwon2019-different-sites','kwon2019-pre313-pyongyang','differentSiteFrom','kwon2019-post313-pyongyang','ex-kwon2019-1',
        '권순홍 논문 초록의 시기별 비정이다. 단일 연구자의 견해이며 본문·비문 표기 관계는 확인하지 않았다. '
        '313년 이전·이후의 정확한 시작·끝이나 비문 속 지명의 위치로 확대하지 않는다.')
    claim('fortress-in-city','encykorea-pyongyangseong','locatedIn','encykorea-modern-pyongyang-city','ex-encykorea-1',
        '백과사전 성곽 항목의 소재 지역 설명이다. 현대 행정구역과 고대 성곽은 다른 Place로 보존한다.')
    claim('possible-late-name','encykorea-pyongyangseong','describedAs','후기에 장안성이라 부른 듯하다는 견해','ex-encykorea-2',
        '부른 듯하다는 원문의 유보를 보존한다. 확정된 이명이나 광개토왕비 平穰과의 동일성으로 승격하지 않는다.',literal=True)
    grouped=defaultdict(list)
    for c in claims:grouped[(c['fromSource'],c['citesChunk'])].append(c)
    for (source,cid),group in grouped.items():
        write_same(data/'claims'/source.removeprefix('src-')/(cid+'.md'),markdown({'type':'Claims','source':source,
            'chunk':cid,'status':'draft','generated_by':'claude-opus-5'},'```claims-json\n'+json.dumps(group,ensure_ascii=False,indent=2)+'\n```'))
    dest=data/'research/pyongyang-identity-61';dest.mkdir(parents=True,exist_ok=True)
    for name in ('result.json','run.json'):shutil.copyfile(args.research/name,dest/name)
    report={'sources':[s['id'] for s in research['sources']],'chunks':len(rows),'claims':[c['id'] for c in claims],
        'checks':[checks[ex] for ex in rows],'withheld':['平穰/平壤 동일성: 직접 근거 부족',
        '초안 c4: 논문 초록에 나오지 않는 비문·연대에 견해를 적용한 연결',
        '초안 SAME_SITE: 같은 지역·시가를 둘러싼 성곽 관계를 동일한 장소로 확대'],
        'newCoordinates':0,'automaticMerges':0,'humanReviewed':False,'status':'partial'}
    args.out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'sources':3,'chunks':len(rows),'claims':len(claims),'nameIdentity':'unresolved'}))


if __name__=='__main__':main()
