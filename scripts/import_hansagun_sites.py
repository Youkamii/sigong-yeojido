"""Import checked site opinions and CHGIS records, retaining their distinct meanings."""
import argparse
from collections import defaultdict
from hashlib import sha256
from html.parser import HTMLParser
import json
from pathlib import Path
import shutil
from import_location_research import markdown, write_same


class Text(HTMLParser):
    def __init__(self):super().__init__(convert_charrefs=True);self.parts=[]
    def handle_data(self,value):self.parts.append(value)


def main():
    ap=argparse.ArgumentParser();ap.add_argument('--research',type=Path,required=True);ap.add_argument('--cache',type=Path,required=True)
    ap.add_argument('--data',type=Path,default=Path('data'));ap.add_argument('--out',type=Path,required=True);args=ap.parse_args()
    draft=json.loads((args.research/'result.json').read_text(encoding='utf-8'))
    run=json.loads((args.research/'run.json').read_text(encoding='utf-8'))
    assert run['exitCode']==0 and not run['isError'] and 'claude-opus-5' in run['modelsObserved']
    sources={s['id']:s for s in draft['sources']};checks={r['id']:r for r in json.loads((args.cache/'report.json').read_text(encoding='utf-8'))}
    rows=defaultdict(list);claims=[];entities={};accepted=[]
    def entity(eid,label,hanja=None):
        entities[eid]={'type':'Place','id':eid,'label':label}
        if hanja:entities[eid]['labelHanja']=hanja
        return eid
    def chunk(sid,identifier,text,url,locator,payload,**extra):
        row={'id':'chunk_'+identifier,'sourceId':sid,'text':text,'permalink':url,'locator':locator,'lang':'und',
            'date':None,'chunkType':'record-excerpt','annotations':[],'pageSha256':sha256(payload).hexdigest(),**extra}
        rows[sid].append(row);return row
    def claim(cid,subject,predicate,obj,row,note):
        claims.append({'id':'claim-'+cid,'subject':subject,'predicate':'syj:'+predicate,'object':obj,
            'fromSource':row['sourceId'],'citesChunk':row['id'],'quote':row['text'],'origin':'ai','status':'draft',
            'generatedBy':'claude-opus-5','generatedAt':'2026-09-07','note':note})
    for sid in ('src-aks-nangnang-toseong','src-fushun-gov-history'):
        source=sources[sid];check=checks[sid];assert check['status']==200 and check['url']==source['url']
        payload=(args.cache/(sid+'.raw')).read_bytes();assert sha256(payload).hexdigest()==check['sha256']
        parser=Text();parser.feed(payload.decode('utf-8'));text=''.join(parser.parts)
        for ex in source['excerpts']:
            assert ex['text'] in text,(sid,ex['id'])
            chunk(sid,ex['id'],ex['text'],source['url'],ex['locator'],payload,lang='ko' if sid.startswith('src-aks') else 'zh',chunkType='excerpt')
            accepted.append({'excerpt':ex['id'],'quoteExactInHtmlText':True,'pageSha256':check['sha256']})
        write_same(args.data/'sources'/(sid.removeprefix('src-')+'.md'),markdown(
            {'type':'Source','id':sid,'label':('낙랑토성 · 군청 위치 견해' if sid.startswith('src-aks') else '푸순시 연혁 · 현도군 이치 서술'),
             'sourceKind':'현대 집필 해설 발췌','sourceGroup':'현대 위치 연구','compiler':source['publisher'],
             'composedYear':1995 if sid.startswith('src-aks') else 2025,'coversFrom':None,'coversTo':None,
             'defaultLens':False,'resource':source['url'],'edition':source['edition'],'license':'short-excerpt-only',
             'status':'draft','verified':None,'accessed':'2026-09-07'},
            ('[출처 : 낙랑토성 - 한국민족문화대백과사전]\n\n집필 소재구. 발굴 결과에서 추정한 견해이며 기관의 공식 판정으로 세지 않는다.'
             if sid.startswith('src-aks') else '푸순시 정부가 오늘날 노동공원 자리로 서술한 짧은 구절이다. 이 페이지의 발표일은 2025-10-10이며 URL 안 날짜와 구별한다.')+
            '\n\n'+source['license']+'\n\n원문에 없는 좌표·장소 동일성·존속 기간은 보충하지 않는다.'))
    castle=entity('place-aks-nangnang-toseong','낙랑토성 (백과사전의 유적)','樂浪土城')
    seat=entity('place-aks-nangnang-office','낙랑군청 (낙랑토성 항목)')
    row=next(r for r in rows['src-aks-nangnang-toseong'] if r['id']=='chunk_ex-toseong-gunchi')
    claim('aks-nangnang-office-in-toseong',seat,'locatedIn',{'kind':'entity','id':castle},row,
        '집필자가 발굴 결과로부터 추정한 견해다. 이 인용 앞에 이로 미루어 보아가 있으며 뒷부분은 추정된다로 끝난다. 낙랑토성 좌표는 미상이며 CHGIS 낙랑군 점과 같은 곳이라고 연결하지 않았다.')
    fushun=entity('place-fushun-xuantu-seat','현도군 치소 (푸순시 연혁)','玄菟郡郡治')
    park=entity('place-fushun-laodong-park','푸순 시가지의 노동공원 (연혁의 현대 지명)','劳动公园')
    claim('fushun-xuantu-moved-seat-112',fushun,'movedSeatTo',{'kind':'entity','id':park},rows['src-fushun-gov-history'][0],
        '이 문장은 公元112年(东汉永初六年)의 이치를 서술한다. 장소의 존속 기간으로 늘리지 않는다. OSM 지오코딩은 robots 제한으로 재대조하지 못해 좌표를 붙이지 않았다.')
    sid='src-chgis-hansagun';recon=[]
    for rid,ko in (('112638','임둔군'),('112640','현도군'),('112641','현도군'),('112642','낙랑군')):
        check=checks['chgis-'+rid];payload=(args.cache/('chgis-'+rid+'.raw')).read_bytes()
        assert check['status']==200 and sha256(payload).hexdigest()==check['sha256']
        r=json.loads(payload);assert r['sys_id']=='hvd_'+rid and r['spatial']['object_type']=='POINT' and r['license']=='CC BY-NC 4.0'
        names=[s['written form'] for s in r['spellings'] if 'written form' in s];spatial=r['spatial'];period=r['temporal']
        projection={'recordId':r['sys_id'],'names':names,'featureType':r['feature_type'],'temporal':period,
            'latitude':spatial['latitude'],'longitude':spatial['longitude'],'presentLocation':spatial['present_location'],
            'license':r['license'],'provider':r['system']}
        row=chunk(sid,'chgis-hvd-'+rid,json.dumps(projection,ensure_ascii=False,sort_keys=True),check['url'],
            'JSON record '+r['sys_id']+'; selected original fields',payload,
            editorNotes=['원 JSON의 필드를 옮긴 레코드다. 국가 코드·기간 코드·좌표 문자열을 정정하지 않고 보존했다.'])
        eid=entity('place-chgis-hvd-'+rid,f'{ko} · CHGIS 재구성 {rid} (원 기간 {period["begin"]}~{period["end"]})',names[0])
        note='CHGIS가 재구성한 郡 단위 지점이다. 원 JSON에는 특정 발굴 유적과 연결하는 근거가 없다. '+\
            '기간 원값 '+json.dumps(period,ensure_ascii=False)+'; 음수 연도 체계·기간 규칙의 뜻을 확인하지 않아 연도 필터용 경계를 만들지 않았다. 원 국가 코드도 보존했다.'
        claim('chgis-hvd-'+rid+'-point',eid,'locatedAt',{'kind':'location','lat':float(spatial['latitude']),
            'lon':float(spatial['longitude']),'precision':'historical-gis-reconstruction-point','basis':note},row,note)
        claim('chgis-hvd-'+rid+'-period',eid,'hasReconstructionPeriod',{'kind':'time','id':'ts-chgis-hvd-'+rid,
            'verbatim':json.dumps(period,ensure_ascii=False,sort_keys=True),'precision':'year'},row,note)
        recon.append({'record':r['sys_id'],'place':eid,'lat':float(spatial['latitude']),'lon':float(spatial['longitude']),
            'periodRaw':period,'quoteExactRecordProjection':True,'originalSha256':check['sha256']})
    write_same(args.data/'sources/chgis-hansagun.md',markdown({'type':'Source','id':sid,'label':'CHGIS · 한사군 재구성 지점 4개',
        'sourceKind':'현대 학술 역사 GIS','sourceGroup':'현대 위치 연구','compiler':'Harvard University and Fudan University',
        'composedYear':None,'coversFrom':None,'coversTo':None,'defaultLens':False,'resource':'https://chgis.hudci.org/tgaz/',
        'license':'CC-BY-NC-4.0','licenseDetail':'각 원 JSON의 license 필드: CC BY-NC 4.0. 아래 자료에 적용되는 원 조건을 유지한다.',
        'edition':'2026-09-07 원 JSON 대조','status':'draft','verified':None,'originalLanguage':'zh'},
        'China Historical GIS, Harvard University and Fudan University. [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/).\n\n'+
        '레코드 hvd_112638·112640·112641·112642의 필드를 발췌해 JSON으로 옮겼다. 학술 GIS의 재구성 점이며 고고 유적의 실측점으로 표시하지 않는다. '+
        '서로 다른 시기의 현도군 기록은 별도로 유지한다. 임둔·현도·낙랑의 원 present_location과 국가 코드가 함께 남아 있다. '+
        '기간 코드 0/3과 음수 연도 체계가 미확인이라 연도 필터에서는 기간 미상으로 보이며 상세에 원 기간을 적었다. '+
        '진번은 이번에 확보한 레코드가 없다. 수록 자료를 다른 사료의 같은 군·유적과 자동 병합하지 않는다.'))
    for eid,fields in entities.items():write_same(args.data/'entities/place'/(eid+'.md'),markdown(fields,'해당 자료의 장소 표기를 가리킨다. 다른 사료의 같은 이름과 자동 병합하지 않는다.'))
    for sid,source_rows in rows.items():write_same(args.data/'sources'/sid.removeprefix('src-')/'chunks.jsonl',''.join(json.dumps(r,ensure_ascii=False,sort_keys=True)+'\n' for r in source_rows))
    groups=defaultdict(list)
    for c in claims:groups[(c['fromSource'],c['citesChunk'])].append(c)
    for (sid,cid),group in groups.items():write_same(args.data/'claims'/sid.removeprefix('src-')/(cid+'.md'),markdown(
        {'type':'Claims','source':sid,'chunk':cid,'status':'draft','generated_by':'claude-opus-5'},'```claims-json\n'+json.dumps(group,ensure_ascii=False,indent=2)+'\n```'))
    path=args.data/'lenses.json';config=json.loads(path.read_text(encoding='utf-8'))
    lens={'id':'hansagun-chgis','label':'한사군 · 학술 GIS와 지점 서술','sources':list(rows),'year':-100,
        'description':'CHGIS 재구성 지점 4개와 낙랑토성·푸순시의 별도 위치 서술. 기간 코드는 원값을 보존하며 좌표 없는 견해도 근거에서 확인한다.'}
    config['lenses']=[x for x in config['lenses'] if x['id']!=lens['id']]+[lens]
    path.write_text(json.dumps(config,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    raw=args.data/'research/hansagun-sites-49';raw.mkdir(parents=True,exist_ok=True)
    for name in ('run.json','result.json'):shutil.copyfile(args.research/name,raw/name)
    report={'sources':list(rows),'chunks':sum(map(len,rows.values())),'claims':[c['id'] for c in claims],
        'checkedExcerpts':accepted,'reconstructedPoints':recon,'checks':list(checks.values()),'humanReviewed':False,
        'withheld':['OSM 공원 좌표: robots 때문에 재대조하지 않음','낙랑토성과 CHGIS 낙랑 점의 동일시','진번 좌표',
        '음수 연도 체계와 기간 코드의 추정 환산','학술 GIS 점을 발굴 유적의 실측점으로 표시']}
    args.out.parent.mkdir(parents=True,exist_ok=True);args.out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'sources':len(rows),'chunks':sum(map(len,rows.values())),'claims':len(claims),'points':len(recon)}))


if __name__=='__main__':main()
