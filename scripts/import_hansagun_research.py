"""Import cited regional opinions without substituting towns for ancient seats."""
import argparse
from collections import defaultdict
from hashlib import sha256
import json
from pathlib import Path
import re
import shutil
from import_location_research import markdown,write_same


def main():
    ap=argparse.ArgumentParser();ap.add_argument('--research',type=Path,required=True)
    ap.add_argument('--checks',type=Path,required=True);ap.add_argument('--cache',type=Path,required=True)
    ap.add_argument('--data',type=Path,default=Path('data'));ap.add_argument('--out',type=Path,required=True)
    args=ap.parse_args();data=args.data
    research=json.loads((args.research/'result.json').read_text(encoding='utf-8'))
    run=json.loads((args.research/'run.json').read_text(encoding='utf-8'))
    assert run['exitCode']==0 and not run['isError'] and 'claude-opus-5' in run['modelsObserved']
    checks={c['id']:c for c in json.loads(args.checks.read_text(encoding='utf-8'))['excerpts']}
    sources={s['id']:s for s in research['sources']};rows={};claims=[];changes=[];used_sources=[]
    def entity(eid,label,hanja=None):
        fields={'type':'Place','id':eid,'label':label}
        if hanja:fields['labelHanja']=hanja
        write_same(data/'entities/place'/(eid+'.md'),markdown(fields,
            '해당 자료의 장소 표기. 같은 이름의 다른 사료 Place를 자동 병합하지 않는다. 좌표·기간은 인용이 있는 주장으로만 제시한다.'))
        return eid
    def claim(cid,subject,predicate,obj,row,note):
        record={'id':cid,'subject':subject,'predicate':'syj:'+predicate,'object':obj,'fromSource':row['sourceId'],
            'citesChunk':row['id'],'quote':row['text'],'origin':'ai','status':'draft','generatedBy':'claude-opus-5',
            'generatedAt':'2026-09-06','note':note}
        claims.append(record)
    for sid in ('src-encykorea-jinbeongun','src-encykorea-imdungun','src-encykorea-hyeondogun','src-encykorea-nangnanggun'):
        source=sources[sid];source_rows=[];used_sources.append(sid)
        for ex in source['excerpts']:
            check=checks[ex['id']];assert check['url']==ex['url'] and check['quote']==ex['text']
            quote=ex['text']
            if ex['id']=='ex-hyeondo-1':
                quote=quote.replace('老城','老城')
                text=(args.cache/(sha256(ex['url'].encode()).hexdigest()+'.txt')).read_text(encoding='utf-8')
                assert quote in text
                changes.append({'excerpt':ex['id'],'reason':'actual page uses U+F934 老, not U+8001 老','quote':quote,'pageSha256':check['pageSha256']})
            else:assert check['accepted']
            row={'id':'chunk_'+ex['id'],'sourceId':sid,'text':quote,'title':source['title'],'locator':ex['locator'],
                 'permalink':ex['url'],'lang':'ko','date':None,'chunkType':'excerpt','annotations':[],
                 'pageSha256':check['pageSha256']}
            rows[ex['id']]=row;source_rows.append(row)
        write_same(data/'sources'/sid.removeprefix('src-')/'chunks.jsonl',''.join(json.dumps(r,ensure_ascii=False)+'\n' for r in source_rows))
        write_same(data/'sources'/(sid.removeprefix('src-')+'.md'),markdown({'type':'Source','id':sid,
            'label':source['title']+' · 위치 견해 발췌','sourceKind':'현대 집필자 해설 발췌','sourceGroup':'현대 위치 연구',
            'compiler':'한국학중앙연구원 수록 · '+('집필자 미확인' if sid.endswith('hyeondogun') else '이형구 집필'),
            'composedYear':None if sid.endswith('hyeondogun') else 1995,'coversFrom':None,'coversTo':None,
            'edition':source['edition'],'resource':source['url'],'originalLanguage':'ko','defaultLens':False,
            'license':'short-excerpt-only','status':'draft','verified':None,'accessed':'2026-09-06'},
            '[출처 : '+source['title']+' - 한국민족문화대백과사전]\n\n'+
            '집필자가 소개한 위치 견해의 짧은 발췌다. 기관의 공식 판정이나 모든 학설의 목록으로 세지 않는다. '+
            '자료에 없는 좌표·경계·존속 기간은 보충하지 않는다. '+source['license']))
    jinbeon=entity('place-encykorea-jinbeongun','진번군 (민족문화대백과)','眞番郡')
    imdun=entity('place-encykorea-imdungun','임둔군 (민족문화대백과)','臨屯郡')
    hyeondo=entity('place-encykorea-hyeondogun','현도군 (민족문화대백과)','玄菟郡')
    nangnang=entity('place-encykorea-nangnanggun','낙랑군 (민족문화대백과)','樂浪郡')
    regions={
        'jaeryeong':entity('place-encykorea-jaeryeong-plain','황해도 재령평야 (위치 견해의 지역)'),
        'gyeonggi':entity('place-encykorea-gyeonggi-chungnam-north','경기도와 충청남도 북부 (위치 견해의 지역)'),
        'hamnam':entity('place-geonames-1877450','함경남도 · South Hamgyong (GeoNames 1877450)'),
        'gangwon':entity('place-encykorea-hamgyeong-south-gangwon','함경도 남부와 강원도 (위치 견해의 지역)'),
        'heunggyeong':entity('place-encykorea-heunggyeong-noseong','흥경·노성 부근 (현도군 기사 표기)'),
        'amnok':entity('place-encykorea-amnok-middle-upper','압록강 중·상류 일대 (관할 범위)'),
        'pyeongan':entity('place-encykorea-pyeongan-hwanghae','평안남도 일대와 황해도 북부 (관할 지역)'),
        'liaodong':entity('place-encykorea-liaodong','중국 요동지역 (한사군 위치 견해)')}
    southern=entity('place-encykorea-jinbeon-southern-extent','옛 진번군 남부 강역 (진번재대방설)')
    first=entity('place-encykorea-first-hyeondogun','제1현도군 (민족문화대백과)')
    counties=entity('place-encykorea-hansagun','한사군 (민족문화대백과의 위치 견해)')
    specs=[
        ('jinbeon-jaeryeong',jinbeon,'locatedIn','jaeryeong','ex-jinbeon-1','재령평야설의 지역 서술. 재령읍을 재령평야와 같은 곳으로 연결하거나 군치 좌표로 쓰지 않는다.'),
        ('jinbeon-southern-extent',southern,'locatedIn','gyeonggi','ex-jinbeon-2','진번재대방설에서 대방군이 차지한 옛 남부 강역. 진번군 전체 범위로 넓히지 않는다.'),
        ('imdun-hamnam',imdun,'locatedIn','hamnam','ex-imdun-1','백과가 소개한 이병도의 함경남도설. 현대 도 대표점은 고대 군치가 아니며 유효기간은 미상이다.'),
        ('imdun-gangwon',imdun,'locatedIn','gangwon','ex-imdun-2','시라도리의 별도 견해. 함경남도설과 합치거나 같은 범위로 처리하지 않는다.'),
        ('hyeondo-moved-seat',hyeondo,'movedSeatTo','heunggyeong','ex-hyeondo-1','원문에 서기전 75년 이치가 적혀 있다. 도착지의 존속 기간이나 좌표로 확대하지 않는다.'),
        ('hyeondo-first-range',first,'locatedIn','amnok','ex-hyeondo-2','관할 범위 설명이며 군치 지점이 아니다. 초안의 107~75년 표기는 이 인용에 없어 넣지 않았다.'),
        ('nangnang-region',nangnang,'locatedIn','pyeongan','ex-nangnang-1','이 집필 항목이 통설로 소개하는 관할 지역. 군치·행정 경계선의 직접 좌표 근거가 아니다.'),
        ('hansagun-liaodong',counties,'hasLocationOpinion','liaodong','ex-nangnang-2','견해의 존재를 소개하는 문장이다. 주창자가 명시되지 않았으므로 특정 학자에게 귀속하지 않는다.')]
    for suffix,subject,predicate,target,ex,note in specs:
        claim('claim-encykorea-'+suffix,subject,predicate,{'kind':'entity','id':regions[target]},rows[ex],note)
    # Record fields are transcribed as JSON. The research draft's pipe-separated row is not a prose quote.
    sid='src-geonames-hamgyongnamdo';source=sources[sid];url=source['url'];key=sha256(url.encode()).hexdigest()
    payload=(args.cache/(key+'.html')).read_bytes();html=payload.decode('utf-8')
    table_row=next(r for r in re.findall(r'<tr\b[^>]*>.*?</tr>',html,re.S) if '/1877450/south-hamgyong.html' in r)
    lat=re.search(r'class="latitude">([^<]+)',table_row).group(1)
    lon=re.search(r'class="longitude">([^<]+)',table_row).group(1)
    assert lat=='40.233333' and lon=='127.75' and 'first-order administrative division' in table_row
    record={'recordId':'1877450','name':'South Hamgyong','feature':'first-order administrative division','latitude':lat,'longitude':lon}
    row={'id':'chunk_geonames_hamgyongnamdo_record','sourceId':sid,'text':json.dumps(record,ensure_ascii=False,sort_keys=True),
        'title':source['title'],'locator':'HTML search table row linked to GeoNames 1877450; geo span latitude/longitude',
        'permalink':url,'lang':'und','date':None,'chunkType':'record-excerpt','annotations':[],'pageSha256':sha256(payload).hexdigest(),
        'editorNotes':['원 표의 필드를 JSON으로 옮긴 레코드이며 문장 인용이 아니다. 십진값은 실제 HTML 필드에서 읽었다.']}
    write_same(data/'sources/geonames-hamgyongnamdo/chunks.jsonl',json.dumps(row,ensure_ascii=False)+'\n')
    write_same(data/'sources/geonames-hamgyongnamdo.md',markdown({'type':'Source','id':sid,'label':source['title'],
        'sourceKind':'현대 지명 좌표 레코드','sourceGroup':'현대 좌표','compiler':'GeoNames','composedYear':None,
        'coversFrom':None,'coversTo':None,'edition':source['edition'],'resource':url,'originalLanguage':'und',
        'defaultLens':False,'license':'CC-BY','status':'draft','verified':None,'accessed':'2026-09-06'},
        'GeoNames 1877450의 HTML 필드를 옮겼다. 현대 함경남도 대표점이며 임둔군치 위치가 아니다. '+
        '[이용 조건](https://www.geonames.org/about.html). 초안과 달리 십진 좌표도 원 HTML에서 확인했다.'))
    used_sources.append(sid)
    claim('claim-geonames-hamgyongnamdo',regions['hamnam'],'locatedAt',{'kind':'location','lat':float(lat),'lon':float(lon),
        'precision':'modern-region-representative-point','basis':'GeoNames 현대 함경남도 대표점. 고대 임둔군의 치소나 경계가 아니다.'},row,
        '고대 지역 비정과 좌표 출처를 함께 골랐을 때만 보조점으로 연결한다.')
    grouped=defaultdict(list)
    for c in claims:grouped[(c['fromSource'],c['citesChunk'])].append(c)
    for (source,cid),group in grouped.items():
        write_same(data/'claims'/source.removeprefix('src-')/(cid+'.md'),markdown({'type':'Claims','source':source,
            'chunk':cid,'status':'draft','generated_by':'claude-opus-5'},'```claims-json\n'+json.dumps(group,ensure_ascii=False,indent=2)+'\n```'))
    lens_path=data/'lenses.json';config=json.loads(lens_path.read_text(encoding='utf-8'))
    lens={'id':'hansagun-regions','label':'한사군 · 백과사전 위치 견해','sources':used_sources,'year':-100,
        'description':'각 군의 지역 비정을 인용한다. 함경남도만 현대 대표점으로 보조 표시하며 고대 군치 좌표는 미상이다.'}
    config['lenses']=[x for x in config['lenses'] if x['id']!=lens['id']]+[lens]
    lens_path.write_text(json.dumps(config,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    dest=data/'research/hansagun-locations-49';dest.mkdir(parents=True,exist_ok=True)
    for name in ('result.json','run.json'):shutil.copyfile(args.research/name,dest/name)
    args.out.write_text(json.dumps({'sources':used_sources,'chunks':len(rows)+1,'claims':[c['id'] for c in claims],
        'corrections':changes,'withheld':['재령읍 좌표를 재령평야에 연결: 장소 동일성 근거 없음','초안 GeoNames 표 재구성 문장을 직접 인용으로 사용',
        '한사군 군치 좌표·행정 경계·자료에 없는 유효기간'],'humanReviewed':False},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'sources':len(used_sources),'chunks':len(rows)+1,'claims':len(claims)}))


if __name__=='__main__':main()
