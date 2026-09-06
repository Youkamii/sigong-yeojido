"""Import verified short modern excerpts, keeping transcription and metadata distinct."""
import argparse
from hashlib import sha256
import json
from pathlib import Path
import re
from import_location_research import markdown,write_same

ROOT=Path(__file__).resolve().parents[1]
GROUPS={
 'wikisource': ['src-treaty-annexation-1910','src-3-1-declaration-1919','src-imsi-heonjang-1919',
                'src-rok-constitution-1948','src-armistice-1953','src-rok-constitution-1987',
                'src-inter-korean-basic-agreement-1991','src-panmunjom-declaration-2018'],
 'presidential': ['src-pa-speech-records'],
 'dprk': ['src-dprk-socialist-constitution'],
 'archives': ['src-archives-koreaofrecord-constitution'],
}
ISSUES={'wikisource':64,'presidential':65,'dprk':66,'archives':67}
LABELS={
 'event-korea-japan-annexation-treaty':'한일병합조약 문서',
 'event-samil-declaration':'3·1 독립선언서',
 'event-imsi-heonjang-proclaimed':'대한민국 임시헌장 문서',
 'event-rok-constitution-enacted':'제헌헌법 문서',
 'event-rok-first-president-oath':'이승만 취임선서 기록',
 'event-korean-war-3rd-anniversary-address':'6·25 사변 제3주년 기념사 기록',
 'event-korean-armistice':'한국 군사정전협정 문서',
 'event-inter-korean-basic-agreement':'남북기본합의서 문서',
 'event-panmunjom-declaration':'판문점선언 문서',
 'polity-rok':'대한민국', 'polity-dprk':'조선민주주의인민공화국',
}


def main():
    ap=argparse.ArgumentParser();ap.add_argument('--research',type=Path,required=True)
    ap.add_argument('--checks',type=Path,required=True);ap.add_argument('--cache',type=Path,required=True)
    ap.add_argument('--group',choices=GROUPS,required=True);ap.add_argument('--out',type=Path,required=True)
    ap.add_argument('--data',type=Path,default=ROOT/'data');args=ap.parse_args()
    research=json.loads((args.research/'result.json').read_text(encoding='utf-8'))
    run=json.loads((args.research/'run.json').read_text(encoding='utf-8'))
    assert run['exitCode']==0 and not run['isError'] and 'claude-opus-5' in run['modelsObserved']
    checked=json.loads(args.checks.read_text(encoding='utf-8'));checks={c['id']:c for c in checked['excerpts']}
    accepted=[];withheld=[];files=[];normalizations=[]
    def save(path,text):write_same(path,text);files.append(str(path.relative_to(ROOT)))
    for source in research['sources']:
        sid=source['id']
        if sid not in GROUPS[args.group]:continue
        chunks=[];rows={};claims=[]
        for excerpt in source['excerpts']:
            check=checks[excerpt['id']]
            assert check['quote']==excerpt['text'] and check['url']==excerpt['url']
            if not check['accepted']:
                withheld.append({'id':excerpt['id'],'reason':'original HTML quote mismatch'});continue
            row={'id':'chunk_'+excerpt['id'],'sourceId':sid,'text':excerpt['text'],'locator':excerpt['locator'],
                 'title':source['title'],'lang':excerpt['lang'],'permalink':excerpt['url'],'date':None,
                 'chunkType':'excerpt','annotations':[],'pageSha256':check['pageSha256'],
                 'editorNotes':['현재 HTML과 대조한 짧은 발췌. 전문을 수록한 자료가 아니다.']}
            chunks.append(row);rows[excerpt['id']]=row
        for draft in source['claims']:
            row=rows.get(draft.get('citesExcerpt'))
            if row is None:
                withheld.append({'id':draft['id'],'reason':'no verified excerpt for this claim; metadata sources are not reassigned'});continue
            quote=draft.get('quote',row['text']);note=draft.get('note','')
            predicate='syj:'+draft['predicate'];time=draft.get('objectTime')
            if time:
                raw=time['verbatim']
                if raw not in quote:
                    # Only already-researched date metadata, checked in the cached actual page.
                    value=raw
                    if draft['id']=='claim-rok-constitution-effective-1948-07-17':value='1948.7.17'
                    text_file=args.cache/(sha256(row['permalink'].encode()).hexdigest()+'.txt')
                    text=text_file.read_text(encoding='utf-8')
                    prefix='연설일자' if args.group=='presidential' else '시행:'
                    match=re.search(re.escape(prefix)+r'\s*'+re.escape(value),text)
                    if not draft.get('citesMetadata') or not match:
                        withheld.append({'id':draft['id'],'reason':'date is not in quote or verified matching metadata'});continue
                    quote=value if args.group=='presidential' else match.group();raw=value
                    row={**row,'id':row['id']+'-metadata','text':quote,'chunkType':'editorial-metadata',
                         'locator':row['locator']+' › 수록처 날짜 메타데이터',
                         'editorNotes':['문서 본문의 날짜가 아니라 수록처가 붙인 메타데이터다.']}
                    chunks.append(row);predicate='syj:recordsSpeechDate' if args.group=='presidential' else 'syj:recordsEffectiveDate'
                    normalizations.append({'id':draft['id'],'change':'date citation moved to the exact separately identified editorial metadata'})
                obj={'kind':'time','id':'ts-'+draft['id'].removeprefix('claim-'),'verbatim':raw,'precision':time['precision']}
                # A literal Western year can be preserved; an era conversion needs a separate source.
                if str(time['year']) in raw:obj.update(year=time['year'],calendar='source-year-number')
                else:note+=' 조사 초안의 서기 환산 후보(확정 연도에 넣지 않음): '+str(time['year'])
                if draft['id']=='claim-armistice-drawn-1953-07-27-panmunjom':
                    predicate='syj:drawnUpOn';normalizations.append({'id':draft['id'],'change':'작성한다 supports document preparation, not a separate signing act'})
                elif draft['id']=='claim-panmunjom-declaration-dated-2018-04-27':predicate='syj:dated'
            else:
                value=draft['objectValue']
                if draft['id']=='claim-rok-constitution-amended-nine-times':value='헌법의 9차례 개헌'
                obj={'kind':'literal','value':value}
            assert re.sub(r'\s+','',quote) in re.sub(r'\s+','',row['text'])
            rec={'id':draft['id'],'subject':draft['subject'],'predicate':predicate,'object':obj,
                 'fromSource':sid,'citesChunk':row['id'],'quote':quote,'origin':'ai','status':'draft',
                 'generatedBy':'claude-opus-5','generatedAt':'2026-09-06','note':note}
            claims.append(rec);accepted.append(rec['id'])
        label=source['title']
        if args.group=='presidential':label='대통령기록관 이승만 연설기록 · 대조된 발췌 2건'
        if args.group=='dprk':label='북한 헌법 위키문헌 전사 · 판본 확인 중'
        if sid=='src-rok-constitution-1987':label='대한민국 헌법 제10호 · 위키문헌 전사 발췌'
        resource=chunks[0]['permalink'] if args.group in ('wikisource','dprk') else source['url']
        period={'coversFrom':source['coversFrom'],'coversTo':source['coversTo']}
        if args.group in ('dprk','archives'):period={'coversFrom':None,'coversTo':None}
        elif sid=='src-rok-constitution-1948':period={'coversFrom':1948,'coversTo':1948}
        elif sid=='src-rok-constitution-1987':period={'coversFrom':1987,'coversTo':None}
        elif sid=='src-inter-korean-basic-agreement-1991':period={'coversFrom':1991,'coversTo':1991}
        meta={'type':'Source','id':sid,'label':label,'sourceKind':source['kind'],
              'sourceGroup':{'wikisource':'근현대 문서 전사','presidential':'대통령기록관 연설','dprk':'북한 문서 전사','archives':'현대 연구 해설'}[args.group],
              'composedYear':source['compiledFrom'] if source['compiledFrom']==source['compiledTo'] else None,
              **period,'originalLanguage':source['originalLanguage'],'defaultLens':False,
              'license':source['license'],'licenseDetail':source['licenseNote'],'status':'draft','verified':None,
              'resource':resource,'accessed':'2026-09-06','narrativeVoice':source['narrativeVoice'],
              'edition':'미확정 · 제3자 전사' if args.group=='dprk' else '기관 원문 발췌' if args.group=='presidential' else source['kind'],
              'generated_by':'claude-opus-5','translationStatus':'별도 번역본 미수록'}
        if args.group=='presidential':meta['license']='restricted'
        if args.group=='dprk':meta['composedYear']=None
        if sid=='src-rok-constitution-1987':
            meta['sourceKind']='헌법 전사 발췌 (위키문헌)'
            meta['edition']='위키문헌 전사 · 기관 메타데이터 미포함'
        if sid=='src-armistice-1953':meta['narrativeVoice']='UN-command-and-korean-peoples-army-and-chinese-peoples-volunteers'
        body='# '+label+'\n\n'+source['publisher']+'\n\n'
        body+=f'[수록처]({resource}) · 열람 2026-09-06\n\n'
        body+=f'짧은 발췌·메타데이터 {len(chunks)}개를 현재 HTML과 대조했다. 전문 적재가 아니다.\n\n'
        if args.group=='wikisource':body+='기관이 소장한 원본과 대조한 전사본은 아니다. 원문·편집 메타데이터를 chunk 종류와 인용에서 구별한다.\n\n'
        if args.group=='dprk':body+='북한이 발행한 원본을 확보한 것이 아니다. 이 전사 페이지의 판본과 조문 위치를 확정하지 못했으므로 원문 문면만 기록하고 연대 범위는 비웠다.\n\n'
        body+='이용 조건(조사 기록): '+source['licenseNote']+'\n\n'
        body+='별도 번역본은 이번 적재에 포함하지 않았다. 원문 표기와 구철자를 유지했다.\n\n'
        body+='조사 Claude Opus 5 / Max effort, HTML 인용 대조·통합 Codex. 사람의 검토 완료 기록은 없다.\n'
        save(args.data/'sources'/(sid.removeprefix('src-')+'.md'),markdown(meta,body.rstrip()))
        save(args.data/'sources'/sid.removeprefix('src-')/'chunks.jsonl',''.join(json.dumps(c,ensure_ascii=False,sort_keys=True)+'\n' for c in chunks))
        for rec in claims:
            eid=rec['subject'];kind='Polity' if eid.startswith('polity-') else 'Event'
            entity=args.data/'entities'/kind.lower()/(eid+'.md')
            if not entity.exists():save(entity,markdown({'type':kind,'id':eid,'label':LABELS[eid]},'문서나 대상의 이름이다. 날짜·내용·동일성은 사료별 주장으로 기록한다.'))
        grouped={}
        for rec in claims:grouped.setdefault(rec['citesChunk'],[]).append(rec)
        for cid,recs in grouped.items():
            save(args.data/'claims'/sid.removeprefix('src-')/(cid+'.md'),markdown(
                {'type':'Claims','source':sid,'chunk':cid,'status':'draft','generated_by':'claude-opus-5'},
                '```claims-json\n'+json.dumps(recs,ensure_ascii=False,indent=2)+'\n```'))
    report={'group':args.group,'issue':ISSUES[args.group],'sourceIds':GROUPS[args.group],'claims':accepted,
            'withheld':withheld,'normalizations':normalizations,'files':files,'humanReviewed':False}
    args.out.parent.mkdir(parents=True,exist_ok=True);args.out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'group':args.group,'sources':len(GROUPS[args.group]),'claims':len(accepted),'withheld':withheld},ensure_ascii=False))


if __name__=='__main__':main()
