"""Import the verified modern commentary without claiming it is a US primary record."""
import argparse
import json
from pathlib import Path
from import_location_research import markdown,write_same


def main():
    ap=argparse.ArgumentParser();ap.add_argument('--research',type=Path,required=True)
    ap.add_argument('--checks',type=Path,required=True);ap.add_argument('--data',type=Path,default=Path('data'))
    ap.add_argument('--out',type=Path,required=True);args=ap.parse_args()
    run=json.loads((args.research/'run.json').read_text(encoding='utf-8'))
    assert run['exitCode']==0 and not run['isError'] and 'claude-opus-5' in run['modelsObserved']
    research=json.loads((args.research/'result.json').read_text(encoding='utf-8'))
    source=next(s for s in research['sources'] if s['id']=='src-encykorea-everready')
    ex=next(e for e in source['excerpts'] if e.get('replaces')=='ex-encykorea-everready-lead')
    check=next(c for c in json.loads(args.checks.read_text(encoding='utf-8'))['excerpts'] if c['id']==ex['id'])
    assert check['accepted'] and check['quote']==ex['text'] and '\uff0c' in ex['text']
    sid=source['id'];cid='chunk_encykorea-everready_lead';subject='event-plan-everready'
    row={'id':cid,'sourceId':sid,'text':ex['text'],'title':'에버레디계획','locator':'내용 요약 첫 문장 발췌',
         'permalink':ex['url'],'lang':'ko','date':None,'chunkType':'excerpt','annotations':[],'pageSha256':check['pageSha256']}
    write_same(args.data/'sources/encykorea-everready/chunks.jsonl',json.dumps(row,ensure_ascii=False)+'\n')
    write_same(args.data/'sources/encykorea-everready.md',markdown({'type':'Source','id':sid,'label':'에버레디계획 · 민족문화대백과 발췌',
        'sourceKind':'현대 집필자 해설 발췌','sourceGroup':'현대 연구 해설','compiler':source['author'],
        'composedYear':None,'coversFrom':1953,'coversTo':1953,'edition':'2026-09-06 열람 · HTML 해시 기록',
        'resource':source['url'],'originalLanguage':'ko','defaultLens':False,'license':'short-excerpt-only','status':'draft','verified':None},
        '[출처 : 에버레디계획 - 한국민족문화대백과사전]\n\n한국학중앙연구원 수록, 신재준 집필. 현대 해설의 짧은 인용만 수록했다. '
        '1953년 당시 미국 문서 원문을 확보한 것으로 세지 않는다. 집필자의 설명과 기관 공식 견해를 구별한다. 공공누리 유형 번호는 미확정이다.'))
    write_same(args.data/'entities/event'/(subject+'.md'),markdown({'type':'Event','id':subject,'label':'에버레디계획 (백과사전 서술)'},
        '현대 백과사전이 서술하는 계획. 세부 실행·승인·폐기 일자를 이 인용으로 확정하지 않는다.'))
    record={'id':'claim-everready-institutional-description','subject':subject,'predicate':'syj:describedAs',
        'object':{'kind':'literal','value':'1953년 5월 한국전쟁 정전회담의 한미 갈등에 대처하고자 미국이 수립한 계획'},
        'fromSource':sid,'citesChunk':cid,'quote':row['text'],'origin':'ai','status':'draft','generatedBy':'claude-opus-5',
        'generatedAt':'2026-09-06','note':'현대 집필자의 서술이다. 인용이 문장 중간에서 끝나므로 인용 밖 목적·실행·종결 내용을 보충하지 않는다.'}
    write_same(args.data/'claims/encykorea-everready'/(cid+'.md'),markdown({'type':'Claims','source':sid,'chunk':cid,
        'status':'draft','generated_by':'claude-opus-5'},'```claims-json\n'+json.dumps([record],ensure_ascii=False,indent=2)+'\n```'))
    args.out.write_text(json.dumps({'claim':record['id'],'source':sid,'chunk':cid,'check':check,'run':run,
        'scope':'modern commentary excerpt only; no US primary document collected','humanReviewed':False},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'claims':1,'sources':1,'chunks':1}))


if __name__=='__main__':main()
