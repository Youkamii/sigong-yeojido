"""Verify short DPRK-authored report excerpts in the actual UN-distributed PDF."""
import argparse
from hashlib import sha256
import json
from pathlib import Path
import re
import fitz
from import_location_research import markdown,write_same


def main():
    ap=argparse.ArgumentParser();ap.add_argument('--research',type=Path,required=True)
    ap.add_argument('--pdf',type=Path,required=True);ap.add_argument('--download',type=Path,required=True)
    ap.add_argument('--data',type=Path,default=Path('data'));ap.add_argument('--out',type=Path,required=True);args=ap.parse_args()
    run=json.loads((args.research/'run.json').read_text(encoding='utf-8'))
    assert run['exitCode']==0 and not run['isError'] and 'claude-opus-5' in run['modelsObserved']
    research=json.loads((args.research/'result.json').read_text(encoding='utf-8'))
    source=next(s for s in research['sources'] if s['id']=='src-dprk-upr3-national-report-2019');sid=source['id']
    download=json.loads(args.download.read_text(encoding='utf-8'));assert sha256(args.pdf.read_bytes()).hexdigest()==download['sha256']
    with fitz.open(args.pdf) as pdf:pages=[p.get_text() for p in pdf]
    compact=lambda text:re.sub(r'\s+','',text)
    assert len(pages)==15 and source['documentSymbol'] in pages[0]
    assert compact(source['documentDate']) in compact(pages[0]) and 'Original: English' in pages[0]
    rows=[];checks=[]
    for ex in source['excerpts']:
        matches=[i+1 for i,text in enumerate(pages) if compact(ex['text']) in compact(text)]
        assert len(matches)==1,ex['id']
        row={'id':'chunk_'+ex['id'],'sourceId':sid,'text':ex['text'],'title':'북한 2019년 보편적 인권 검토 국가보고서',
            'locator':f"{source['documentSymbol']} · {matches[0]}쪽 · "+ex['locator'].split(' (')[0].split(' 첫머리')[0],
            'permalink':source['retrievedFrom'],'lang':'en','date':None,'chunkType':'excerpt','annotations':[],
            'documentSha256':download['sha256'],'page':matches[0],'narrativeVoice':ex['voice']}
        rows.append(row);checks.append({'chunk':row['id'],'page':matches[0],'whitespaceOnlyMatch':True,'voice':ex['voice']})
    date={**rows[0],'id':'chunk_dprk-upr3-2019-date','text':source['documentDate'],
          'locator':source['documentSymbol']+' · 1쪽 표제면 배포 날짜','chunkType':'editorial-metadata',
          'editorNotes':['유엔 문서 배포 날짜. 북한의 작성·제출 날짜나 실제 심의 날짜로 쓰지 않는다.']}
    rows.append(date)
    write_same(args.data/'sources/dprk-upr3-national-report-2019/chunks.jsonl',''.join(json.dumps(r,ensure_ascii=False)+'\n' for r in rows))
    write_same(args.data/'sources/dprk-upr3-national-report-2019.md',markdown({'type':'Source','id':sid,
        'label':'북한 2019년 인권 국가보고서 · 유엔 배포 영문판 발췌','sourceKind':'북한 정부 작성 국가보고서 발췌',
        'sourceGroup':'북한 기관 작성 문서','compiler':'조선민주주의인민공화국','distributor':'유엔','narrativeVoice':'dprk-official',
        'composedYear':2019,'coversFrom':2014,'coversTo':2019,'edition':'A/HRC/WG.6/33/PRK/1 · 영문 배포본',
        'resource':source['retrievedFrom'],'originalLanguage':'en','defaultLens':False,'license':'short-excerpt-only',
        'licenseDetail':'공식문서 전문의 재배포 조건 미확인. 짧은 인용과 서지만 수록한다.','status':'draft','verified':None,
        'accessed':'2026-09-06','documentSha256':download['sha256'],'translationStatus':'조선어판·번역본 미수록'},
        '문서 기호 A/HRC/WG.6/33/PRK/1, 유엔 배포 2019-02-20, 영문 15쪽. 북한이 작성한 국가보고서를 유엔이 배포한 것이다. '
        '유엔이 본문 내용에 동의하거나 사실로 인정했다는 뜻이 아니다. 유엔이 붙인 표제면·각주와 북한이 작성한 본문을 구별했다.\n\n'
        '보고 대상은 2014년 5월 이후이며 Source의 기간은 문서 서지에서 확인한 연 단위다. 본문 인용은 21단어, 날짜 필드는 3단어다. '
        '이 보고서가 헌법 166조를 언급한다는 점과 그 헌법 판본을 직접 확보했다는 것은 다르다. 기존 위키문헌 헌법의 판본 미확정 상태를 바꾸지 않는다.'))
    subject='event-dprk-upr3-report-2019'
    write_same(args.data/'entities/event'/(subject+'.md'),markdown({'type':'Event','id':subject,'label':'북한 2019년 국가보고서의 서술'},
        '유엔에 제출된 북한 자체 보고의 서술. 본문의 주장과 유엔 사무국의 배포를 구별한다.'))
    payload=[(rows[1],'claim-dprk-upr3-sanctions-statement','describesObstacle',{'kind':'literal','value':'유엔 안전보장이사회 제재'},
              '북한 보고서 85항이 심각한 장애 요인으로 든 대상이다. 본문 작성자의 주장이며 유엔의 판정이 아니다. 인용 밖 일방 제재 등의 문구는 보충하지 않는다.'),
             (rows[2],'claim-dprk-upr3-constitution-article','refersToConstitutionArticle',{'kind':'literal','value':'사회주의헌법 제166조'},
              '국가보고서가 헌법 제166조를 언급한다는 뜻이다. 이 인용으로 조문 전문·헌법의 개정 판본·사법 독립의 실상을 확인했다고 하지 않는다.'),
             (date,'claim-dprk-upr3-distribution-date','recordsDistributionDate',{'kind':'time','id':'ts-dprk-upr3-distributed','verbatim':source['documentDate'],
              'precision':'day','year':2019,'calendar':'source-year-number'},'유엔이 표제면에 붙인 배포 날짜다. 북한이 실제 작성·제출한 날짜와 구별한다.')]
    claims=[]
    for row,cid,predicate,obj,note in payload:
        rec={'id':cid,'subject':subject,'predicate':'syj:'+predicate,'object':obj,'fromSource':sid,'citesChunk':row['id'],
             'quote':row['text'],'origin':'ai','status':'draft','generatedBy':'claude-opus-5','generatedAt':'2026-09-06','note':note}
        claims.append(rec)
        write_same(args.data/'claims/dprk-upr3-national-report-2019'/(row['id']+'.md'),markdown({'type':'Claims','source':sid,'chunk':row['id'],
            'status':'draft','generated_by':'claude-opus-5'},'```claims-json\n'+json.dumps([rec],ensure_ascii=False,indent=2)+'\n```'))
    args.out.write_text(json.dumps({'document':download,'pages':len(pages),'source':sid,'checks':checks,'dateMetadataChecked':True,
        'claims':[c['id'] for c in claims],'withheld':['the secretariat footnote alone does not prove DPRK authorship',
        'constitution edition identity','text beyond adopted quotations'],'run':run,'extractor':fitz.VersionBind,
        'humanReviewed':False},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'claims':len(claims),'sources':1,'chunks':len(rows),'pdfPages':len(pages)}))


if __name__=='__main__':main()
