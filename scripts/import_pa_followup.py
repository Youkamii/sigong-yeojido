"""Add the corrected short presidential statement, keeping dates and text separate."""
import argparse
from hashlib import sha256
import json
from pathlib import Path
import re
from import_location_research import markdown,write_same
from frontmatter import parse_front_matter


def main():
    ap=argparse.ArgumentParser();ap.add_argument('--research',type=Path,required=True)
    ap.add_argument('--checks',type=Path,required=True);ap.add_argument('--cache',type=Path,required=True)
    ap.add_argument('--data',type=Path,default=Path('data'));ap.add_argument('--out',type=Path,required=True);args=ap.parse_args()
    run=json.loads((args.research/'run.json').read_text(encoding='utf-8'))
    assert run['exitCode']==0 and not run['isError'] and 'claude-opus-5' in run['modelsObserved']
    research=json.loads((args.research/'result.json').read_text(encoding='utf-8'))
    source=next(s for s in research['sources'] if s['id']=='src-pa-speech-records');sid=source['id']
    checks={c['id']:c for c in json.loads(args.checks.read_text(encoding='utf-8'))['excerpts']}
    rows=[];claims=[];subject='event-usamgik-to-rok-transfer-statement'
    write_same(args.data/'entities/event'/(subject+'.md'),markdown({'type':'Event','id':subject,'label':'정권 이양문제에 대하여 · 이승만 담화 기록'},
        '대통령기록관이 수록한 1948년 담화. 기관이 밝힌 저본은 1953년 공보처 담화집이다.'))
    for ex in source['excerpts']:
        c=checks[ex['id']];assert c['accepted'] and ex['text']==c['quote']
        rows.append({'id':'chunk_'+ex['id'],'sourceId':sid,'text':ex['text'],'title':'정권 이양문제에 대하여',
            'locator':ex['locator'].split(' / html/')[0],'permalink':ex['url'],'date':None,'lang':'ko','chunkType':'excerpt',
            'annotations':[],'pageSha256':c['pageSha256'],'editorNotes':['원문 한자 병기·호환 한자·끝말을 보존한 짧은 발췌.']})
    assert '\uf978' in rows[0]['text']
    full=(args.cache/(sha256(source['url'].encode()).hexdigest()+'.txt')).read_text(encoding='utf-8')
    match=re.search(r'연설일자\s*1948\.09\.04',full);assert match
    rows.append({**rows[0],'id':'chunk_pa-transfer-1948-date','text':match.group(),'chunkType':'editorial-metadata',
                 'locator':'정권 이양문제에 대하여 › 연설일자 필드','editorNotes':['본문 날짜와 구별한 수록처 메타데이터.']})
    values=[('claim-rhee-transfer-conditions-text-r2','describesTransferConditions',{'kind':'literal','value':'군정과 민국정부 사이의 이양·접수 조건 작성'},
             '담화가 이양·접수 조건의 작성을 서술한다는 뜻이다. 인용 밖 문장의 결과를 보충하거나 이양 완료일로 쓰지 않는다.'),
            ('claim-rhee-states-usamgik-abolished-from-aug-16','statesUsamgikAbolishedFrom',{'kind':'time','id':'ts-rhee-statement-aug16','verbatim':'8월 16일','precision':'day'},
             '담화에 적힌 표현이다. 본문 인용에 없는 연도를 붙이거나 실제 군정 종료일로 판정하지 않는다.'),
            ('claim-rhee-transfer-statement-date-metadata','recordsSpeechDate',{'kind':'time','id':'ts-pa-transfer-statement','verbatim':'1948.09.04','precision':'day','year':1948,'calendar':'source-year-number'},
             '대통령기록관이 붙인 연설일자다. 현재 수록 텍스트의 저본은 1953년 공보처 담화집이며 당일 인쇄물과 교차확인한 것은 아니다.')]
    for row,(cid,pred,obj,note) in zip(rows,values):
        record={'id':cid,'subject':subject,'predicate':'syj:'+pred,'object':obj,'fromSource':sid,'citesChunk':row['id'],
            'quote':row['text'],'origin':'ai','status':'draft','generatedBy':'claude-opus-5','generatedAt':'2026-09-06','note':note}
        claims.append(record)
        write_same(args.data/'claims/pa-speech-records'/(row['id']+'.md'),markdown({'type':'Claims','source':sid,'chunk':row['id'],
            'status':'draft','generated_by':'claude-opus-5'},'```claims-json\n'+json.dumps([record],ensure_ascii=False,indent=2)+'\n```'))
    path=args.data/'sources/pa-speech-records/chunks.jsonl';existing=[json.loads(line) for line in path.read_text(encoding='utf-8').splitlines()]
    by_id={r['id']:r for r in existing}
    for row in rows:
        if row['id'] in by_id:assert by_id[row['id']]==row
        else:existing.append(row)
    path.write_text(''.join(json.dumps(r,ensure_ascii=False)+'\n' for r in existing),encoding='utf-8')
    card=args.data/'sources/pa-speech-records.md';meta,body=parse_front_matter(card.read_text(encoding='utf-8'))
    meta['label']='대통령기록관 이승만 연설기록 · 대조된 발췌 3건'
    body=body.replace('대조된 발췌 2건','대조된 발췌 3건').replace('짧은 발췌·메타데이터 4개','짧은 발췌·메타데이터 7개')
    addition='정권 이양 담화의 저본: 공보처, 대통령이승만박사담화집, 1953. 본문은 1948년 담화를 수록하며 기관 연설일자는 1948.09.04다.'
    if addition not in body:body=body.rstrip()+'\n\n'+addition
    card.write_text(markdown(meta,body.strip()),encoding='utf-8')
    args.out.write_text(json.dumps({'claims':[c['id'] for c in claims],'newChunks':len(rows),'source':sid,
        'quotedCharacter':'U+F978 preserved','checks':[checks[ex['id']] for ex in source['excerpts']],
        'dateMetadataChecked':True,'run':run,'humanReviewed':False},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'claims':len(claims),'newChunks':len(rows)}))


if __name__=='__main__':main()
