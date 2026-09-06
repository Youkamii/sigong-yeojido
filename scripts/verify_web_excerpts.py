"""Compare completed research quotations with fetched HTML; never repair the quotes."""
import argparse
from concurrent.futures import ThreadPoolExecutor
from hashlib import sha256
from html.parser import HTMLParser
import json
from pathlib import Path
import re
from urllib.request import Request,urlopen


class Text(HTMLParser):
    def __init__(self):super().__init__(convert_charrefs=True);self.parts=[];self.hidden=0
    def handle_starttag(self,tag,attrs):
        if tag in ('script','style'):self.hidden+=1
    def handle_endtag(self,tag):
        if tag in ('script','style'):self.hidden=max(0,self.hidden-1)
        elif tag in ('p','div','br','tr','li','h1','h2','h3'):self.parts.append('\n')
    def handle_data(self,data):
        if not self.hidden:self.parts.append(data)


def main():
    ap=argparse.ArgumentParser();ap.add_argument('--research',type=Path,required=True)
    ap.add_argument('--cache',type=Path,required=True);ap.add_argument('--out',type=Path,required=True)
    args=ap.parse_args();args.cache.mkdir(parents=True,exist_ok=True)
    sources=json.loads(args.research.read_text(encoding='utf-8'))['sources']
    excerpts=[dict(ex,sourceId=s['id']) for s in sources for ex in s['excerpts']]
    urls=sorted({ex['url'] for ex in excerpts})
    def fetch(url):
        key=sha256(url.encode()).hexdigest()
        try:
            with urlopen(Request(url,headers={'User-Agent':'SigongYeojido-QuoteVerification/1.0'}),timeout=40) as response:
                payload=response.read();encoding=response.headers.get_content_charset() or 'utf-8';final_url=response.url
            parser=Text();parser.feed(payload.decode(encoding))
            text=''.join(parser.parts)
            (args.cache/(key+'.html')).write_bytes(payload)
            (args.cache/(key+'.txt')).write_text(text,encoding='utf-8')
            return url,{'url':url,'finalUrl':final_url,'sha256':sha256(payload).hexdigest(),'bytes':len(payload),'text':text}
        except Exception as exc:return url,{'url':url,'error':str(exc)}
    with ThreadPoolExecutor(max_workers=3) as pool:pages=dict(pool.map(fetch,urls))
    results=[]
    for ex in excerpts:
        page=pages[ex['url']];text=page.get('text','');quote=ex['text']
        exact=quote in text
        whitespace=re.sub(r'\s+','',quote) in re.sub(r'\s+','',text)
        results.append({'id':ex['id'],'sourceId':ex['sourceId'],'url':ex['url'],'exact':exact,'whitespaceOnlyMatch':whitespace,
                        'accepted':bool(text) and whitespace,'quote':quote,'pageSha256':page.get('sha256'),'error':page.get('error')})
    report={'pages':[{k:v for k,v in page.items() if k!='text'} for page in pages.values()],
            'excerpts':results,'accepted':sum(r['accepted'] for r in results),'total':len(results),
            'method':'HTML character references decoded; only whitespace ignored; spelling and Unicode not normalized'}
    args.out.parent.mkdir(parents=True,exist_ok=True);args.out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'accepted':report['accepted'],'total':report['total'],'failed':[r['id'] for r in results if not r['accepted']]}))


if __name__=='__main__':main()
