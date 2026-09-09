"""Send simultaneous real HTTP requests to detect dropped initial asset connections."""
import argparse,json,time,urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from threading import Barrier

p=argparse.ArgumentParser(description=__doc__)
p.add_argument('--url',required=True)
p.add_argument('--workers',type=int,default=64)
p.add_argument('--out',type=Path,required=True)
a=p.parse_args();barrier=Barrier(a.workers)
def request(_):
    barrier.wait();started=time.monotonic()
    try:
        with urllib.request.urlopen(a.url,timeout=3) as response:
            response.read()
            return {'ok':response.status==200,'ms':round((time.monotonic()-started)*1000)}
    except Exception as error:
        return {'ok':False,'ms':round((time.monotonic()-started)*1000),'error':str(error)}
with ThreadPoolExecutor(max_workers=a.workers) as pool:
    rows=list(pool.map(request,range(a.workers)))
report={'url':a.url,'requests':len(rows),'simultaneousStarts':a.workers,'passed':sum(row['ok'] for row in rows),
        'maxMs':max(row['ms'] for row in rows),'errors':[row for row in rows if not row['ok']]}
a.out.parent.mkdir(parents=True,exist_ok=True)
a.out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps(report,ensure_ascii=False))
raise SystemExit(bool(report['errors']))
