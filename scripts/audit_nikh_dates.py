#!/usr/bin/env python3
"""Count actual NIKH date forms and disputed characters without normalizing them (#36)."""
import argparse
from collections import Counter
import json
from pathlib import Path
import re
import xml.etree.ElementTree as ET
import zipfile

ROOT=Path(__file__).resolve().parents[1]


def chunk_lines(path):
    with path.open(encoding='utf-8') as handle:
        yield from handle


def audit_source(folder):
    suffixes={}
    characters={char:{'bodyOccurrences':0,'annotationOccurrences':0,'examples':[]} for char in ('淲','㴲')}
    total=dated=0
    for line in chunk_lines(folder/'chunks.jsonl'):
        chunk=json.loads(line);total+=1
        date=chunk.get('date') or {}
        raw=date.get('raw') if isinstance(date,dict) else None
        if isinstance(raw,str):
            dated+=1
            suffix=raw[-2:] if len(raw)>7 else 'year-only'
            row=suffixes.setdefault(suffix,{'count':0,'labelLeap':0,'bodyLeap':0,'examples':[]})
            row['count']+=1
            row['labelLeap']+=bool(re.search('[윤閏]',date.get('label') or ''))
            row['bodyLeap']+='閏' in chunk.get('text','')
            if len(row['examples'])<3:row['examples'].append({'chunkId':chunk['id'],'date':date})
        for char,row in characters.items():
            count=chunk.get('text','').count(char)
            row['bodyOccurrences']+=count
            for a in chunk.get('annotations',[]):
                row['annotationOccurrences']+=a.get('text','').count(char)
                if char in a.get('text','') and len(row['examples'])<8:
                    row['examples'].append({'chunkId':chunk['id'],'annotationId':a.get('id'),'type':a.get('type'),'text':a.get('text')})
            if count and len(row['examples'])<8:
                text=chunk['text'];at=text.index(char)
                row['examples'].append({'chunkId':chunk['id'],'quote':text[max(0,at-30):at+60]})
    return {'source':folder.name,'chunks':total,'rawDates':dated,'suffixes':suffixes,'characters':characters}


def audit_zip(path):
    multiplicity=Counter();types=Counter();examples=[];suffixes={}
    with zipfile.ZipFile(path) as archive:
        for name in sorted(archive.namelist()):
            if not name.lower().endswith('.xml'):continue
            root=ET.fromstring(archive.read(name))
            for node in root.iter():
                if not isinstance(node.tag,str) or not re.fullmatch(r'level\d+',node.tag):continue
                dates=node.findall('front/biblioData/date/dateOccured')
                if not dates:continue
                multiplicity[len(dates)]+=1
                types.update(d.get('type','') for d in dates)
                if len(dates)>1 and len(examples)<3:
                    examples.append({'file':name,'levelId':node.get('id'),'dates':[{'type':d.get('type'),'raw':d.get('date'),'label':''.join(d.itertext()).strip()} for d in dates]})
                for d in dates:
                    raw=d.get('date') or ''
                    match=re.fullmatch(r'(-?\d{4})-\d{2}-\d{2}(.+)',raw)
                    if match:
                        year=int(match[1]);suffix=match[2]
                        bucket=suffixes.setdefault(suffix,{'count':0,'before1896':0,'from1896':0,'examples':[]})
                        bucket['count']+=1;bucket['before1896' if year<1896 else 'from1896']+=1
                        if len(bucket['examples'])<3:bucket['examples'].append({'file':name,'levelId':node.get('id'),'raw':raw,'type':d.get('type')})
    return {'file':path.name,'dateElementsPerLevel':dict(multiplicity),'dateTypes':dict(types),'multipleExamples':examples,'suffixes':suffixes}


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--data',type=Path,default=ROOT/'data')
    parser.add_argument('--source',nargs='*',default=['samguksagi','samgukyusa','goryeosa'])
    parser.add_argument('--zip',nargs='*',type=Path,default=[])
    parser.add_argument('--out',type=Path,required=True)
    args=parser.parse_args()
    report={'sources':[audit_source(args.data/'sources'/s) for s in args.source],
            'archives':[audit_zip(path) for path in args.zip],
            'interpretation':'Counts are observations only; raw strings and original characters remain unchanged.'}
    args.out.parent.mkdir(parents=True,exist_ok=True)
    args.out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'sources':len(report['sources']),'archives':len(report['archives']),'out':str(args.out)}))
