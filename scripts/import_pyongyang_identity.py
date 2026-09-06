"""Import one author's explicit identity opinion from a checked page excerpt."""
import argparse
from collections import defaultdict
from hashlib import sha256
from html.parser import HTMLParser
import json
from pathlib import Path
import shutil
from import_location_research import markdown,write_same


class Text(HTMLParser):
    def __init__(self):super().__init__(convert_charrefs=True);self.parts=[]
    def handle_data(self,value):self.parts.append(value)


def main():
    ap=argparse.ArgumentParser();ap.add_argument('--research',type=Path,required=True)
    ap.add_argument('--cache',type=Path,required=True);ap.add_argument('--data',type=Path,default=Path('data'))
    ap.add_argument('--out',type=Path,required=True);args=ap.parse_args()
    run=json.loads((args.research/'run.json').read_text(encoding='utf-8'))
    assert run['exitCode']==0 and not run['isError'] and 'claude-opus-5' in run['modelsObserved']
    draft=json.loads((args.research/'result.json').read_text(encoding='utf-8'))
    source=next(s for s in draft['sources'] if s['id']=='src-miao2011')
    check=next(c for c in json.loads((args.cache/'report.json').read_text(encoding='utf-8')) if c['id']==source['id'])
    assert check['status']==200 and check['robotsAllowed'] and check['url']==source['url']
    payload=(args.cache/'src-miao2011.raw').read_bytes();assert sha256(payload).hexdigest()==check['sha256']
    parser=Text();parser.feed(payload.decode('utf-8'));text=''.join(parser.parts)
    start=text.index('至于《好太王碑》中所提到的永乐九年')
    conclusion='皆为大同江北岸的平壤。'
    context=text[start:text.index(conclusion,start)+len(conclusion)]
    assert '399年' in context and '404年' in context and '“下平穰（壤）”' in context and '“平穰”' in context
    migration='公元427年正式迁都下平壤'
    assert migration in text and '2011,26（2）' in text
    sid='src-miao2011-pyeongyang';key=sid.removeprefix('src-')
    excerpts=[('stele',conclusion,'제2절 · 399년·404년 비문 표기를 열거한 문장의 결론'),
              ('migration',migration,'제2절 · 광개토왕 시기를 정리하며 장수왕의 427년 천도를 설명하는 문장')]
    rows=[{'id':f'chunk_{key}_{suffix}','sourceId':sid,'text':quote,'permalink':source['url'],'locator':locator,
           'lang':'zh','date':None,'chunkType':'excerpt','pageSha256':check['sha256']} for suffix,quote,locator in excerpts]
    write_same(args.data/'sources'/(key+'.md'),markdown({'type':'Source','id':sid,
        'label':'苗威(2011) · 비문 평양과 427년 천도지의 동일성 견해','sourceKind':'학술논문 웹 전재의 짧은 발췌',
        'sourceGroup':'현대 위치 연구','compiler':'苗威 · 中国历史地理论丛','composedYear':2011,
        'coversFrom':None,'coversTo':None,'defaultLens':False,'resource':source['url'],
        'edition':'中国历史地理论丛 2011, 26(2) · silkroads.org.cn 전재본','license':'short-excerpt-only',
        'originalLanguage':'zh','status':'draft','verified':None,'accessed':'2026-09-07'},
        '저자가 비문 399년·404년의 장소와 대동강 북안 평양을 같은 곳으로 보는 견해다. '+
        '같은 절에서 장수왕의 427년 천도지를 하평양으로 설명한다. 학계의 확정 판정으로 제시하지 않는다.\n\n'+
        '원 HTML에서 문장 전체의 연결과 곡선 인용부호를 확인했다. 공개하는 인용은 결론과 천도 구절만 짧게 발췌했다. '+
        '원 학술지 지면과의 판본 대조는 하지 않았다. 자동 검색 별칭이나 전역 엔티티 병합에 사용하지 않는다.\n\n'+
        '조사 Claude Opus 5 / Max, 원 HTML 대조·연결 Codex. 사람의 역사 해석 검토는 없다.'))
    labels={'stele-399':'비문 399년 下平穰 · 苗威(2011)의 평양 비정',
            'stele-404':'비문 404년 平穰 · 苗威(2011)의 평양 비정',
            'migration-427':'427년 천도지 下平壤 · 苗威(2011)의 평양 비정',
            'daedong':'대동강 북안 평양 · 苗威(2011)의 비정'}
    for suffix,label in labels.items():
        eid='place-miao2011-'+suffix
        write_same(args.data/'entities/place'/(eid+'.md'),markdown({'type':'Place','id':eid,'label':label},
            '한 연구자가 지칭한 장소다. 다른 시기·다른 자료의 평양 표기와 자동 병합하지 않는다.'))
    claims=[]
    for suffix in ('stele-399','stele-404','migration-427'):
        row=rows[1 if suffix=='migration-427' else 0]
        claims.append({'id':'claim-miao2011-'+suffix+'-identity','subject':'place-miao2011-'+suffix,
            'predicate':'syj:sameEntityAs','object':{'kind':'entity','id':'place-miao2011-daedong'},
            'fromSource':sid,'citesChunk':row['id'],'quote':row['text'],'origin':'ai','status':'draft',
            'generatedBy':'claude-opus-5','generatedAt':'2026-09-07',
            'note':'苗威(2011)의 장소 비정. 비문 399·404년 표기를 열거한 문장 전체와 427년 천도 설명을 원 HTML에서 대조했다. '+
                   '인용은 해당 문장의 짧은 결론이며 앞 문장의 之 대신 실제 문장의 的을 보존한다. '+
                   '穰/壤의 자형 관계를 자동 판정하거나 좌표·연속 존속 기간을 만들지 않는다.'})
    write_same(args.data/'sources'/key/'chunks.jsonl',''.join(json.dumps(row,ensure_ascii=False,sort_keys=True)+'\n' for row in rows))
    groups=defaultdict(list)
    for claim in claims:groups[claim['citesChunk']].append(claim)
    for cid,group in groups.items():
        write_same(args.data/'claims'/key/(cid+'.md'),markdown({'type':'Claims','source':sid,'chunk':cid,
            'status':'draft','generated_by':'claude-opus-5'},'```claims-json\n'+json.dumps(group,ensure_ascii=False,indent=2)+'\n```'))
    research=args.data/'research/pyongyang-direct-61';research.mkdir(parents=True,exist_ok=True)
    shutil.copyfile(args.research/'run.json',research/'run.json')
    report={'source':sid,'url':source['url'],'pageSha256':check['sha256'],'checkedContextSha256':sha256(context.encode()).hexdigest(),
        'checked399And404InSameSentence':True,'checked427Migration':True,'quoteExactInHtmlText':True,
        'researchQuoteCorrection':'Original HTML uses curved quotes and embedded newlines; excerpts use the exact page characters.',
        'entities':len(labels),'claims':[c['id'] for c in claims],'chunks':[r['id'] for r in rows],
        'charactersQuoted':sum(len(row['text']) for row in rows),'humanReviewed':False,'globalMerge':False,
        'limitations':['Single author opinion, not a historical verdict.','Original journal page not compared.','Glyph equivalence is not asserted.']}
    write_same(research/'result.json',json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    args.out.parent.mkdir(parents=True,exist_ok=True);args.out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False))


if __name__=='__main__':main()
