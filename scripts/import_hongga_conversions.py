"""Preserve an actual published table and add two source-specific year conversions."""
import argparse
from hashlib import sha256
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import shutil
from import_location_research import markdown, write_same


class Tables(HTMLParser):
    def __init__(self):super().__init__(convert_charrefs=True);self.tables=[];self.table=None;self.row=None;self.cell=None
    def handle_starttag(self,tag,attrs):
        if tag=='table':self.table=[]
        if tag=='tr' and self.table is not None:self.row=[]
        if tag in ('td','th') and self.row is not None:self.cell=[]
    def handle_endtag(self,tag):
        if tag in ('td','th') and self.cell is not None:self.row.append(''.join(self.cell).strip());self.cell=None
        if tag=='tr' and self.row is not None:self.table.append(self.row);self.row=None
        if tag=='table' and self.table is not None:self.tables.append(self.table);self.table=None
    def handle_data(self,text):
        if self.cell is not None:self.cell.append(text)


def main():
    ap=argparse.ArgumentParser();ap.add_argument('--research',type=Path,required=True)
    ap.add_argument('--cache',type=Path,required=True);ap.add_argument('--checks',type=Path,required=True)
    ap.add_argument('--data',type=Path,default=Path('data'));ap.add_argument('--out',type=Path,required=True);args=ap.parse_args()
    run=json.loads((args.research/'run.json').read_text(encoding='utf-8'))
    assert run['exitCode']==0 and not run['isError'] and 'claude-opus-5' in run['modelsObserved']
    research=json.loads((args.research/'result.json').read_text(encoding='utf-8'))
    source=next(s for s in research['sources'] if s.get('sourceId')=='src-web-jawikipedia-hongga')
    url=source['url'];key=sha256(url.encode()).hexdigest()
    html=(args.cache/(key+'.html')).read_bytes();text=(args.cache/(key+'.txt')).read_text(encoding='utf-8')
    check=next(p for p in json.loads(args.checks.read_text(encoding='utf-8'))['pages'] if p['url']==url)
    assert sha256(html).hexdigest()==check['sha256']
    parser=Tables();parser.feed(html.decode('utf-8'))
    expected=[['鴻嘉','元年','2年','3年','4年'],['西暦','前20年','前19年','前18年','前17年'],['干支','辛丑','壬寅','癸卯','甲辰']]
    table=next(t for t in parser.tables if t==expected)
    quote='\n'.join('\t'.join(row) for row in table)
    assert re.sub(r'\s+','',quote) in re.sub(r'\s+','',text)
    sid='src-jawp-hongga-calendar';cid='chunk_jawp-hongga-calendar_table'
    row={'id':cid,'sourceId':sid,'text':quote,'title':'鴻嘉','locator':'鴻嘉 › 西暦との対照表 · 原行列順',
         'permalink':url,'lang':'ja','date':None,'chunkType':'table-excerpt','tableCells':table,'pageSha256':check['sha256'],
         'editorNotes':['元の表の行・列の順序を保ち、セル区切りだけを空白で表した。'],'annotations':[]}
    write_same(args.data/'sources/jawp-hongga-calendar/chunks.jsonl',json.dumps(row,ensure_ascii=False)+'\n')
    write_same(args.data/'sources/jawp-hongga-calendar.md',markdown({'type':'Source','id':sid,
        'label':'홍가 연호·서기 대조표 · 일본어 위키백과','sourceKind':'3차 자료 · 역법 연도 대조표','sourceGroup':'역법 대조',
        'composedYear':None,'coversFrom':-20,'coversTo':-17,'edition':'2026-09-06 열람 · 페이지 해시 기록',
        'resource':url,'license':'CC-BY-SA-4.0','originalLanguage':'ja','defaultLens':False,'status':'draft','verified':None},
        '출처: 일본어 위키백과 편집자. 원표의 행·열을 그대로 보존한 짧은 발췌다. 3차 자료이며 기관 역법표·원서 대조는 미완료다.\n\n'
        '연 단위 대응만 사용한다. 음력 날짜·개원일·국편 L0는 환산하지 않는다. 鴻佳를 鴻嘉로 자동 정규화하지 않는다.'))
    claims=[]
    for suffix,span,year,column in [('third','ts-baekje-founded-hongga3-samguksagi',-18,3),('fourth','ts-baekje-onjo-hongga4-samgukyusa',-17,4)]:
        claims.append({'id':'claim-hongga-'+suffix+'-conversion-jawp','subject':span,'predicate':'syj:convertsTo',
            'object':{'kind':'year','value':year},'fromSource':sid,'citesChunk':cid,'quote':quote,'origin':'ai','status':'draft',
            'generatedBy':'claude-opus-5','generatedAt':'2026-09-06',
            'note':f'3차 자료인 위키백과 대조표의 {column+1}번째 열: {table[0][column]} / {table[1][column]} / {table[2][column]}. '
                   '원표기와 환산을 분리했다. 당시 사건의 사실 여부나 월·일은 판정하지 않는다. 기관·학술 자료의 독립 대조는 미완료다.'})
    write_same(args.data/'claims/jawp-hongga-calendar'/(cid+'.md'),markdown({'type':'Claims','source':sid,'chunk':cid,
        'status':'draft','generated_by':'claude-opus-5'},'```claims-json\n'+json.dumps(claims,ensure_ascii=False,indent=2)+'\n```'))
    path=args.data/'comparisons.json';config=json.loads(path.read_text(encoding='utf-8'))
    case=next(c for c in config['cases'] if c['id']=='baekje-founding')
    if sid not in case['sources']:case['sources'].append(sid)
    case['description']='온조 건국의 본기 인용과 문맥으로 비교한다. 鴻嘉三年·鴻佳三年·鴻嘉四年甲辰을 보존한다. 위키백과 연호표를 켜면 鴻嘉 3년은 기원전 18년, 4년은 기원전 17년으로 표시한다. 鴻佳 표기는 환산 근거가 없어 그대로 둔다.'
    path.write_text(json.dumps(config,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    dest=args.data/'research/cross-chronology-53-55';dest.mkdir(parents=True,exist_ok=True)
    for name in ('result.json','run.json'):shutil.copyfile(args.research/name,dest/name)
    args.out.write_text(json.dumps({'source':sid,'claims':[c['id'] for c in claims],'tableCells':table,'page':check,
        'quoteMatchesIgnoringWhitespace':True,'withheld':'鴻佳三年 has no established equivalence to 鴻嘉三年',
        'discardedResearchQuote':'table was rearranged by the research agent; original row and column order restored',
        'humanReviewed':False},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'sources':1,'chunks':1,'conversions':2}))


if __name__=='__main__':main()
